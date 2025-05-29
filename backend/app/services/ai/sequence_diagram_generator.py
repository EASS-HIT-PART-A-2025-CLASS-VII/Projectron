import asyncio
import base64
import json
import logging
import re
import time
from typing import Dict, Optional, Tuple, Any, List
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.common.exceptions import WebDriverException, TimeoutException, InvalidSessionIdException, StaleElementReferenceException
from webdriver_manager.chrome import ChromeDriverManager
from app.services.ai.prompts.diagram_prompts import (
    SEQUENCE_DIAGRAM_PROMPT_TEMPLATE,
    SEQUENCE_DIAGRAM_JSON_TEMPLATE,
    SEQUENCE_DIAGRAM_DIRECT_TEMPLATE)
from langchain.schema import HumanMessage
from langchain_core.language_models.llms import LLM

from app.utils.timing import timed
from app.services.ai.ai_utils import create_llm
from app.core.config import get_settings

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)
settings = get_settings()

class SequenceDiagramGenerator:
    """
    A class for generating sequence diagrams using sequencediagram.org via Selenium.
    Enhanced with retry logic for handling session errors.
    """
    
    def __init__(self, 
                 selenium_url: Optional[str] = None, 
                 diagram_site_url: str = "https://sequencediagram.org",
                 timeout: int = 30,
                 use_local_chrome: bool = False,
                 max_retries: int = 3,
                 retry_delay: int = 2):
        """
        Initialize the sequence diagram generator.
        
        Args:
            selenium_url: URL of the Selenium standalone Chrome instance (None for local Chrome)
            diagram_site_url: URL of sequencediagram.org or on-prem instance
            timeout: Timeout in seconds for Selenium operations
            use_local_chrome: Whether to use a local Chrome instance instead of remote Selenium
            max_retries: Maximum number of retry attempts for Selenium operations
            retry_delay: Delay in seconds between retry attempts
        """
        self.selenium_url = selenium_url
        self.diagram_site_url = diagram_site_url
        self.timeout = timeout
        self.use_local_chrome = use_local_chrome
        self.driver = None
        self.max_retries = max_retries
        self.retry_delay = retry_delay
    
    def is_session_active(self) -> bool:
        """
        Check if the current Selenium session is active.
        
        Returns:
            True if the session is active, False otherwise
        """
        if not self.driver:
            return False
            
        try:
            # Try a simple operation to check if the session is still active
            self.driver.current_url
            return True
        except (WebDriverException, InvalidSessionIdException, StaleElementReferenceException):
            return False
    
    def cleanup_driver(self) -> None:
        """
        Clean up the current WebDriver instance.
        """
        if self.driver:
            try:
                self.driver.quit()
            except Exception as e:
                logger.warning(f"Error closing driver: {str(e)}")
            finally:
                self.driver = None
    
    def connect(self) -> bool:
        """
        Connect to the Selenium standalone Chrome instance or local Chrome.
        
        Returns:
            True if connection was successful, False otherwise
        """
        # Clean up any existing driver
        self.cleanup_driver()
        
        options = webdriver.ChromeOptions()
        options.add_argument("--headless=new")
        options.add_argument("--no-sandbox")
        options.add_argument("--disable-dev-shm-usage")
        
        try:
            if self.use_local_chrome or not self.selenium_url:
                # Use local Chrome instance
                logger.info("Using local Chrome instance")
                service = Service(ChromeDriverManager().install())
                self.driver = webdriver.Chrome(service=service, options=options)
                logger.info("Connected to local Chrome instance")
            else:
                # Use remote Selenium server
                logger.info(f"Connecting to Selenium at {self.selenium_url}")
                self.driver = webdriver.Remote(
                    command_executor=self.selenium_url,
                    options=options
                )
                logger.info(f"Connected to Selenium at {self.selenium_url}")
            
            self.driver.set_page_load_timeout(self.timeout)
            
            # Load the sequencediagram.org website
            logger.info(f"Loading {self.diagram_site_url}")
            self.driver.get(self.diagram_site_url)
            logger.info(f"Loaded {self.diagram_site_url}")
            
            # Wait for the page to be fully loaded
            time.sleep(2)  # Simple wait to ensure page is loaded
            return True
            
        except (WebDriverException, TimeoutException) as e:
            logger.error(f"Failed to connect to Selenium or load the diagram site: {str(e)}")
            if self.driver:
                self.driver.quit()
                self.driver = None
            return False
    
    def disconnect(self) -> None:
        """
        Disconnect from the Selenium instance.
        """
        if self.driver:
            self.driver.quit()
            self.driver = None
            logger.info("Disconnected from Selenium")
    
    def generate_svg(self, diagram_source: str) -> Optional[str]:
        """
        Generate an SVG from the given diagram source with retry logic.
        
        Args:
            diagram_source: The source code for the sequence diagram
            
        Returns:
            The SVG content as a string, or None if generation failed
        """
        for attempt in range(self.max_retries):
            try:
                # Check if driver is active
                if not self.driver or not self.is_session_active():
                    logger.info(f"Selenium session not active, reconnecting (attempt {attempt+1}/{self.max_retries})")
                    if not self.connect():
                        logger.error("Failed to reconnect to Selenium")
                        continue
                
                # Execute the JavaScript to generate the SVG
                svg_data_url = self.driver.execute_async_script(
                    "const callback = arguments[arguments.length - 1];" +
                    "SEQ.api.generateSvgDataUrl(arguments[0], callback)",
                    diagram_source
                )
                
                # Extract and decode the SVG data
                svg_base64_data = svg_data_url.split(",")[1]
                svg_content = base64.b64decode(svg_base64_data).decode('utf-8')
                
                svg_content = svg_content.replace('\\"', '"')
                
                logger.info(f"Successfully generated SVG diagram ({len(svg_content)} bytes)")
                return svg_content
                
            except Exception as e:
                logger.error(f"SVG generation attempt {attempt+1}/{self.max_retries} failed: {str(e)}")
                
                # Cleanup driver and prepare for reconnection on next attempt
                self.cleanup_driver()
                
                # Wait before retry unless this is the last attempt
                if attempt < self.max_retries - 1:
                    time.sleep(self.retry_delay)
        
        return None
    
    def validate_diagram_source(self, diagram_source: str) -> Tuple[bool, str]:
        """
        Validate if the diagram source is valid by attempting to generate an SVG.
        Enhanced with retry logic.
        
        Args:
            diagram_source: The source code for the sequence diagram
            
        Returns:
            A tuple of (is_valid, error_message)
        """
        for attempt in range(self.max_retries):
            try:
                # Check if driver is active
                if not self.driver or not self.is_session_active():
                    logger.info(f"Selenium session not active, reconnecting (attempt {attempt+1}/{self.max_retries})")
                    if not self.connect():
                        logger.error("Failed to reconnect to Selenium")
                        continue
                
                # Try to generate the SVG
                result = self.driver.execute_async_script(
                    "const callback = arguments[arguments.length - 1];" +
                    "try {" +
                    "  SEQ.api.generateSvgDataUrl(arguments[0], (result) => {" +
                    "    callback({ success: true, result: result });" +
                    "  });" +
                    "} catch (error) {" +
                    "  callback({ success: false, error: error.toString() });" +
                    "}",
                    diagram_source
                )
                
                if result.get('success', False):
                    return True, ""
                else:
                    return False, result.get('error', 'Unknown error')
                    
            except Exception as e:
                logger.error(f"Validation attempt {attempt+1}/{self.max_retries} failed: {str(e)}")
                
                # Cleanup driver and prepare for reconnection on next attempt
                self.cleanup_driver()
                
                # If this is the last attempt, return the error
                if attempt == self.max_retries - 1:
                    return False, str(e)
                
                # Wait before retry
                time.sleep(self.retry_delay)
        
        return False, "Failed after maximum retry attempts"


# ===== GLOBAL GENERATOR SINGLETON =====

class GlobalDiagramGenerator:
    """Global singleton for managing a single persistent SequenceDiagramGenerator instance."""
    
    def __init__(self):
        self._generator: Optional[SequenceDiagramGenerator] = None
        self._lock = asyncio.Lock()
        self._initialized = False
    
    async def get_generator(self) -> SequenceDiagramGenerator:
        """Get the global generator instance, initializing if needed."""
        if not self._initialized:
            async with self._lock:
                if not self._initialized:
                    await self._initialize()
        
        return self._generator
    
    async def _initialize(self):
        """Initialize the global generator."""
        try:
            logger.info("Initializing global SequenceDiagramGenerator...")
            
            self._generator = SequenceDiagramGenerator(
                selenium_url=settings.SELENIUM_URL,
                diagram_site_url=settings.SEQUENCE_DIAGRAM_SITE_URL,
                timeout=settings.SELENIUM_TIMEOUT,
                use_local_chrome=False,
                max_retries=3,
                retry_delay=2
            )
            
            # Connect once and keep alive
            if not self._generator.connect():
                raise Exception("Failed to connect to Selenium")
            
            self._initialized = True
            logger.info("Global SequenceDiagramGenerator initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize global SequenceDiagramGenerator: {e}")
            self._generator = None
            self._initialized = False
            raise
    
    async def generate_svg_threadsafe(self, diagram_source: str) -> Optional[str]:
        """Thread-safe SVG generation using the global generator."""
        generator = await self.get_generator()
        
        async with self._lock:
            try:
                # Check if session is still active, reconnect if needed
                if not generator.is_session_active():
                    logger.warning("Global generator session inactive, reconnecting...")
                    if not generator.connect():
                        raise Exception("Failed to reconnect global generator")
                
                return generator.generate_svg(diagram_source)
                
            except Exception as e:
                logger.error(f"Error in threadsafe SVG generation: {e}")
                # Try to reconnect for next request
                try:
                    generator.connect()
                except:
                    pass
                return None
    
    async def validate_diagram_threadsafe(self, diagram_source: str) -> tuple[bool, str]:
        """Thread-safe diagram validation using the global generator."""
        generator = await self.get_generator()
        
        async with self._lock:
            try:
                # Check if session is still active, reconnect if needed
                if not generator.is_session_active():
                    logger.warning("Global generator session inactive, reconnecting...")
                    if not generator.connect():
                        raise Exception("Failed to reconnect global generator")
                
                return generator.validate_diagram_source(diagram_source)
                
            except Exception as e:
                logger.error(f"Error in threadsafe validation: {e}")
                # Try to reconnect for next request
                try:
                    generator.connect()
                except:
                    pass
                return False, str(e)
    
    async def cleanup(self):
        """Cleanup the global generator."""
        if self._generator:
            try:
                self._generator.disconnect()
            except Exception as e:
                logger.warning(f"Error during cleanup: {e}")
            finally:
                self._generator = None
                self._initialized = False

# Global instance
_global_diagram_generator: Optional[GlobalDiagramGenerator] = None

def get_global_generator() -> GlobalDiagramGenerator:
    """Get the global diagram generator singleton."""
    global _global_diagram_generator
    
    if _global_diagram_generator is None:
        _global_diagram_generator = GlobalDiagramGenerator()
    
    return _global_diagram_generator


# ===== MAIN GENERATION FUNCTION (UPDATED TO USE GLOBAL GENERATOR) =====

@timed
async def generate_sequence_diagram(
    project_plan: str, 
    llm,
    existing_json: Optional[str] = None,
    change_request: Optional[str] = None,
    max_iterations: int = 3,
    selenium_url: Optional[str] = None,  # Keep for compatibility but won't be used
    use_json_intermediate: bool = True,
    use_local_chrome: bool = False  # Keep for compatibility but won't be used
) -> Dict[str, Any]:
    """
    Generate a sequence diagram using the global persistent generator.
    MUCH faster than creating new connections each time.
    """
    result = {
        'success': False,
        'diagram_source': '',
        'svg': None,
        'iterations': 0,
        'error': None,
        'json': None
    }
    
    # Get the global generator (will initialize if needed)
    global_generator = get_global_generator()
    
    # Create fallback LLMs
    try:
        fallback_llms = [
            create_llm(temperature=0.1, json_mode=False, model='gpt-4o-mini', timeout=140, max_retries=2),
            create_llm(temperature=0.1, json_mode=False, model='gpt-4.1-nano', timeout=140, max_retries=2),
            create_llm(temperature=0.1, json_mode=False, model='gpt-4.1-mini', timeout=140, max_retries=2)
        ]
        logger.info(f"Created {len(fallback_llms)} fallback LLMs for sequence diagram generation")
    except Exception as e:
        logger.warning(f"Failed to create some fallback LLMs: {e}. Proceeding with available models.")
        fallback_llms = []
    
    try:
        if use_json_intermediate:
            # Format the existing context
            existing_context = ""
            if existing_json:
                try:
                    parsed_json = json.loads(existing_json)
                    pretty_json = json.dumps(parsed_json, indent=2)
                    existing_context = f"Current Sequence Diagram in JSON format:\n{pretty_json}\n"
                except json.JSONDecodeError:
                    logger.warning("Existing diagram JSON is not valid JSON, using as raw text")
                    existing_context = f"Current Sequence Diagram:\n{existing_json}\n"
            
            # Format the change request
            change_request_text = f"Change Request:\n{change_request}" if change_request else ""
            
            # Step 1: Generate JSON representation
            formatted_json_prompt = SEQUENCE_DIAGRAM_JSON_TEMPLATE.format(
                project_plan=project_plan,
                existing_context=existing_context,
                change_request=change_request_text
            )
            
            json_messages = [HumanMessage(content=formatted_json_prompt)]
            json_feedback = ""
            json_iteration = 0
            
            # Try to generate valid JSON
            while json_iteration < max_iterations:
                json_iteration += 1
                result['iterations'] = json_iteration
                
                try:
                    # Add feedback from previous iterations if available
                    if json_feedback and json_iteration > 1:
                        json_feedback_prompt = formatted_json_prompt + f"\n\nFeedback from previous attempt:\n{json_feedback}\n\nPlease correct the issues and try again."
                        json_messages = [HumanMessage(content=json_feedback_prompt)]
                    
                    # Use LLM with fallbacks
                    json_response = await execute_llm_with_fallbacks(
                        llm, 
                        fallback_llms, 
                        json_messages, 
                        f"JSON generation iteration {json_iteration}"
                    )
                    json_str = extract_json_from_text(json_response.content)
                    
                    try:
                        # Parse the JSON to validate it
                        diagram_json = json.loads(json_str)
                        result['json'] = diagram_json
                        
                        # Step 2: Convert JSON to diagram code
                        try:
                            diagram_source = json_to_sequence_diagram_code(diagram_json)
                            
                            # Validate using global generator (thread-safe)
                            is_valid, error = await global_generator.validate_diagram_threadsafe(diagram_source)
                            
                            if is_valid:
                                # Generate SVG using global generator (thread-safe)
                                svg_content = await global_generator.generate_svg_threadsafe(diagram_source)
                                
                                if svg_content:
                                    result['success'] = True
                                    result['diagram_source'] = diagram_source
                                    result['svg'] = svg_content
                                    logger.info(f"✅ Successfully generated sequence diagram in {json_iteration} iterations")
                                    break
                                else:
                                    json_feedback = "The JSON was converted to diagram code successfully, but SVG generation failed. Please simplify the diagram structure."
                            else:
                                # If our converter failed, ask the LLM to do the conversion
                                formatted_code_prompt = SEQUENCE_DIAGRAM_PROMPT_TEMPLATE.format(
                                    diagram_json=json.dumps(diagram_json, indent=2)
                                )
                                code_messages = [HumanMessage(content=formatted_code_prompt)]
                                
                                code_response = await execute_llm_with_fallbacks(
                                    llm,
                                    fallback_llms,
                                    code_messages,
                                    f"JSON to code conversion iteration {json_iteration}"
                                )
                                diagram_source = extract_code_from_text(code_response.content)
                                
                                # Validate again using global generator
                                is_valid, error = await global_generator.validate_diagram_threadsafe(diagram_source)
                                
                                if is_valid:
                                    # Generate SVG using global generator
                                    svg_content = await global_generator.generate_svg_threadsafe(diagram_source)
                                    
                                    if svg_content:
                                        result['success'] = True
                                        result['diagram_source'] = diagram_source
                                        result['svg'] = svg_content
                                        logger.info(f"✅ Successfully generated sequence diagram in {json_iteration} iterations (with LLM conversion)")
                                        break
                                    else:
                                        json_feedback = "The diagram syntax was valid, but SVG generation failed. Please simplify the diagram."
                                else:
                                    json_feedback = f"The JSON was converted to diagram code, but there are syntax errors: {error}. Please update the JSON to be compatible with sequencediagram.org syntax."
                        except Exception as e:
                            json_feedback = f"Error converting JSON to diagram code: {str(e)}. Please simplify the JSON structure."
                            logger.error(f"Error in JSON conversion: {str(e)}")
                    except json.JSONDecodeError as e:
                        json_feedback = f"Invalid JSON format: {str(e)}. Please provide valid JSON."
                        logger.error(f"JSON decode error: {str(e)}")
                except Exception as e:
                    json_feedback = f"An error occurred: {str(e)}. Please try again with a simpler diagram structure."
                    logger.error(f"Error in iteration {json_iteration}: {str(e)}")
            
            if not result['success']:
                result['error'] = f"Failed to generate a valid diagram after {json_iteration} iterations. Last feedback: {json_feedback}"
        
        else:
            # Direct approach (similar changes for global generator)
            result['error'] = "Direct generation approach not implemented with global generator yet"
    
    except Exception as e:
        result['error'] = str(e)
        logger.error(f"Failed to generate sequence diagram: {str(e)}")
    
    return result


# ===== HELPER FUNCTIONS =====

async def execute_llm_with_fallbacks(primary_llm, fallback_llms: List, messages, description: str = "LLM operation"):
    """Try to execute LLM request with primary model, fall back to others if it fails."""
    try:
        logger.info(f"Trying primary model for {description}")
        result = await primary_llm.ainvoke(messages)
        return result
    except Exception as e:
        logger.warning(f"Error with primary model for {description}: {e}")
        
        for i, fallback_llm in enumerate(fallback_llms):
            try:
                logger.info(f"Trying fallback model {i+1}/{len(fallback_llms)} for {description}")
                result = await fallback_llm.ainvoke(messages)
                return result
            except Exception as e2:
                logger.warning(f"Error with fallback model {i+1} for {description}: {e2}")
                if i == len(fallback_llms) - 1:
                    logger.error(f"All models failed for {description}")
                    raise
        
        raise RuntimeError(f"All models failed for {description}")


def extract_json_from_text(text: str) -> str:
    """Extract JSON from LLM response text."""
    import re
    
    # Try to find JSON between ```json and ``` tags
    json_matches = re.search(r'```json\n(.*?)\n```', text, re.DOTALL)
    if json_matches:
        return json_matches.group(1).strip()
    
    # Try to find JSON between any ``` tags
    code_matches = re.search(r'```\n(.*?)\n```', text, re.DOTALL)
    if code_matches:
        return code_matches.group(1).strip()
    
    # Look for JSON-like content
    json_like_matches = re.search(r'(\{.*\})', text, re.DOTALL)
    if json_like_matches:
        return json_like_matches.group(1).strip()
    
    return text.strip()


def extract_code_from_text(text: str) -> str:
    """Extract code between ```sequence and ``` tags."""
    import re
    
    # Try to find code between ```sequence and ``` tags
    sequence_matches = re.search(r'```sequence\n(.*?)\n```', text, re.DOTALL)
    if sequence_matches:
        return sequence_matches.group(1).strip()
    
    # Try to find code between any ``` tags
    code_matches = re.search(r'```\n(.*?)\n```', text, re.DOTALL)
    if code_matches:
        return code_matches.group(1).strip()
    
    # If no code blocks found, return the original text
    result = text.strip()
    return normalize_sequencediagram(result)


def json_to_sequence_diagram_code(diagram_json: Dict) -> str:
    """Convert a diagram JSON to sequencediagram.org syntax."""
    code_lines = []
    
    # Add title
    if 'title' in diagram_json:
        code_lines.append(f"title {diagram_json['title']}")
    
    # Add participants
    if 'participants' in diagram_json:
        code_lines.append("")  # Add empty line for readability
        for participant in diagram_json['participants']:
            participant_type = participant.get('type', 'participant')
            participant_name = participant['name']
            alias = participant.get('alias', '')
            
            if alias:
                code_lines.append(f"{participant_type} \"{participant_name}\" as {alias}")
            else:
                code_lines.append(f"{participant_type} \"{participant_name}\"")
    
    # Process notes that should appear at the beginning
    if 'notes' in diagram_json:
        code_lines.append("")  # Add empty line for readability
        for note in diagram_json['notes']:
            if note.get('position') == 'start':
                participant = note['participant']
                position = note.get('position', 'over')
                text = note['text']
                
                if position in ['left', 'right']:
                    code_lines.append(f"note {position} of {participant}: {text}")
                else:
                    code_lines.append(f"note over {participant}: {text}")
    
    # Process messages and activations
    if 'messages' in diagram_json:
        code_lines.append("")  # Add empty line for readability
        for message in diagram_json['messages']:
            # Handle activations
            if message.get('activate', False):
                code_lines.append(f"+{message['to']}")
            
            # Handle message type
            arrow = '-->' if message.get('type') == 'dashed' else '->'
            code_lines.append(f"{message['from']} {arrow} {message['to']}: {message['text']}")
            
            # Handle deactivations
            if message.get('deactivate', False):
                code_lines.append(f"-{message['to']}")
    
    # Process groups
    if 'groups' in diagram_json:
        for group in diagram_json['groups']:
            code_lines.append("")  # Add empty line for readability
            group_type = group.get('type', 'group')
            label = group.get('label', '')
            
            # Start group
            if group_type == 'alt' and 'alternatives' in group:
                code_lines.append(f"alt {label}")
                
                # Process main group messages
                if 'messages' in group:
                    for message in group['messages']:
                        # Handle activations
                        if message.get('activate', False):
                            code_lines.append(f"+{message['to']}")
                        
                        # Handle message type
                        arrow = '-->' if message.get('type') == 'dashed' else '->'
                        code_lines.append(f"{message['from']} {arrow} {message['to']}: {message['text']}")
                        
                        # Handle deactivations
                        if message.get('deactivate', False):
                            code_lines.append(f"-{message['to']}")
                
                # Process alternatives
                for i, alternative in enumerate(group['alternatives']):
                    alt_label = alternative.get('label', '')
                    code_lines.append(f"else {alt_label}")
                    
                    if 'messages' in alternative:
                        for message in alternative['messages']:
                            # Handle activations
                            if message.get('activate', False):
                                code_lines.append(f"+{message['to']}")
                            
                            # Handle message type
                            arrow = '-->' if message.get('type') == 'dashed' else '->'
                            code_lines.append(f"{message['from']} {arrow} {message['to']}: {message['text']}")
                            
                            # Handle deactivations
                            if message.get('deactivate', False):
                                code_lines.append(f"-{message['to']}")
            else:
                # Handle other group types (loop, opt, par, etc.)
                code_lines.append(f"{group_type} {label}")
                
                if 'messages' in group:
                    for message in group['messages']:
                        # Handle activations
                        if message.get('activate', False):
                            code_lines.append(f"+{message['to']}")
                        
                        # Handle message type
                        arrow = '-->' if message.get('type') == 'dashed' else '->'
                        code_lines.append(f"{message['from']} {arrow} {message['to']}: {message['text']}")
                        
                        # Handle deactivations
                        if message.get('deactivate', False):
                            code_lines.append(f"-{message['to']}")
            
            # End group
            code_lines.append("end")
    
    # Process notes that should appear at the end
    if 'notes' in diagram_json:
        code_lines.append("")  # Add empty line for readability
        for note in diagram_json['notes']:
            if note.get('position') == 'end':
                participant = note['participant']
                position = note.get('position', 'over')
                text = note['text']
                
                if position in ['left', 'right']:
                    code_lines.append(f"note {position} of {participant}: {text}")
                else:
                    code_lines.append(f"note over {participant}: {text}")
    
    result = "\n".join(code_lines)
    return normalize_sequencediagram(result)


def normalize_sequencediagram(diagram_code: str) -> str:
    """
    Processes the given sequencediagram.org code, removing quotes from entities
    if the quoted text does not include any whitespace.

    Args:
        diagram_code (str): The input string with sequencediagram.org DSL code.

    Returns:
        str: The normalized code with unnecessary quotes removed.
    """
    # This regex finds all text enclosed in double quotes
    pattern = r'"([^"]+)"'

    def replace_quotes(match: re.Match) -> str:
        content = match.group(1)
        # If the content contains any whitespace, keep the quotes.
        if re.search(r"\s", content):
            return f'"{content}"'
        else:
            return content

    # Replace all occurrences using the replacement function
    normalized_code = re.sub(pattern, replace_quotes, diagram_code)
    return normalized_code