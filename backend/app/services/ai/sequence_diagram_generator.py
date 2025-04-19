import base64
import json
import logging
import re
import time
from typing import Dict, Optional, Tuple, Any
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.common.exceptions import WebDriverException, TimeoutException, InvalidSessionIdException, StaleElementReferenceException
from webdriver_manager.chrome import ChromeDriverManager
from app.services.ai.diagram_prompts import (
    SEQUENCE_DIAGRAM_PROMPT_TEMPLATE,
    SEQUENCE_DIAGRAM_JSON_TEMPLATE,
    SEQUENCE_DIAGRAM_DIRECT_TEMPLATE)
from langchain.schema import HumanMessage
from langchain_core.language_models.llms import LLM

from app.utils.timing import timed

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

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
    
    def generate_png(self, diagram_source: str) -> Optional[bytes]:
        """
        Generate a PNG from the given diagram source with retry logic.
        
        Args:
            diagram_source: The source code for the sequence diagram
            
        Returns:
            The PNG content as bytes, or None if generation failed
        """
        for attempt in range(self.max_retries):
            try:
                # Check if driver is active
                if not self.driver or not self.is_session_active():
                    logger.info(f"Selenium session not active, reconnecting (attempt {attempt+1}/{self.max_retries})")
                    if not self.connect():
                        logger.error("Failed to reconnect to Selenium")
                        continue
                
                # Execute the JavaScript to generate the PNG
                png_data_url = self.driver.execute_async_script(
                    "const callback = arguments[arguments.length - 1];" +
                    "SEQ.api.generatePngDataUrl(arguments[0], callback)",
                    diagram_source
                )
                
                # Extract and decode the PNG data
                png_base64_data = png_data_url.split(",")[1]
                png_content = base64.b64decode(png_base64_data)
                
                logger.info(f"Successfully generated PNG diagram ({len(png_content)} bytes)")
                return png_content
                
            except Exception as e:
                logger.error(f"PNG generation attempt {attempt+1}/{self.max_retries} failed: {str(e)}")
                
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


# The rest of the functions remain unchanged
def json_to_sequence_diagram_code(diagram_json: Dict) -> str:
    """
    Convert a diagram JSON to sequencediagram.org syntax.
    
    Args:
        diagram_json: The diagram definition in JSON format
        
    Returns:
        The sequence diagram code
    """
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

def extract_code_from_text(text: str) -> str:
    """
    Extract code between ```sequence and ``` tags.
    
    Args:
        text: The text containing the code
        
    Returns:
        The extracted code, or the original text if no code blocks are found
    """
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

def extract_json_from_text(text: str) -> str:
    """
    Extract JSON between ```json and ``` tags.
    
    Args:
        text: The text containing the JSON
        
    Returns:
        The extracted JSON, or the original text if no JSON blocks are found
    """
    import re
    
    # Try to find JSON between ```json and ``` tags
    json_matches = re.search(r'```json\n(.*?)\n```', text, re.DOTALL)
    if json_matches:
        return json_matches.group(1).strip()
    
    # Try to find JSON between any ``` tags
    code_matches = re.search(r'```\n(.*?)\n```', text, re.DOTALL)
    if code_matches:
        return code_matches.group(1).strip()
    
    # If no code blocks found, check for JSON-like content
    # Look for text starting with { and ending with }
    json_like_matches = re.search(r'(\{.*\})', text, re.DOTALL)
    if json_like_matches:
        return json_like_matches.group(1).strip()
    
    # If no JSON blocks found, return the original text
    return text.strip()

@timed
async def generate_sequence_diagram(
    project_plan: str, 
    llm: LLM,
    existing_json: Optional[str] = None,
    change_request: Optional[str] = None,
    max_iterations: int = 3,
    selenium_url: Optional[str] = None,
    use_json_intermediate: bool = True,
    use_local_chrome: bool = False
) -> Dict[str, Any]:
    """
    Generate a sequence diagram based on a project plan.
    
    Args:
        project_plan: The project plan description
        llm: The language model to use
        existing_json: Existing diagram JSON if available
        change_request: Specific changes requested
        max_iterations: Maximum number of attempts to generate a valid diagram
        selenium_url: URL of the Selenium standalone Chrome instance (or None for local Chrome)
        use_json_intermediate: Whether to use JSON as an intermediate format
        use_local_chrome: Whether to use a local Chrome instance
        
    Returns:
        A dictionary containing the diagram source, SVG, and status information
    """
    # Initialize result dictionary
    result = {
        'success': False,
        'diagram_source': '',
        'svg': None,
        'iterations': 0,
        'error': None,
        'json': None
    }
    
    # Initialize the diagram generator with retry capabilities
    generator = SequenceDiagramGenerator(
        selenium_url=selenium_url,
        use_local_chrome=use_local_chrome,
        max_retries=3,  # Add retry capability
        retry_delay=2   # 2 second delay between retries
    )
    
    try:
        # Connect will now return a boolean indicating success
        if not generator.connect():
            result['error'] = "Failed to establish initial connection to Selenium"
            return result
        
        if use_json_intermediate:
            # Two-step approach: Generate JSON first, then convert to diagram code
            
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
                    
                    # Get JSON response from the AI service
                    json_response = await llm.ainvoke(json_messages)
                    json_str = extract_json_from_text(json_response.content)
                    
                    try:
                        # Parse the JSON to validate it
                        diagram_json = json.loads(json_str)
                        result['json'] = diagram_json
                        
                        # Step 2: Convert JSON to diagram code
                        # First try using our converter
                        try:
                            diagram_source = json_to_sequence_diagram_code(diagram_json)
                            
                            # Validate the generated diagram source
                            is_valid, error = generator.validate_diagram_source(diagram_source)
                            
                            if is_valid:
                                # Generate the SVG
                                svg_content = generator.generate_svg(diagram_source)
                                
                                if svg_content:
                                    result['success'] = True
                                    result['diagram_source'] = diagram_source
                                    result['svg'] = svg_content
                                    break
                                else:
                                    json_feedback = "The JSON was converted to diagram code successfully, but SVG generation failed. Please simplify the diagram structure."
                            else:
                                # If our converter failed, ask the LLM to do the conversion
                                formatted_code_prompt = SEQUENCE_DIAGRAM_PROMPT_TEMPLATE.format(
                                    diagram_json=json.dumps(diagram_json, indent=2)
                                )
                                code_messages = [HumanMessage(content=formatted_code_prompt)]
                                code_response = await llm.ainvoke(code_messages)
                                diagram_source = extract_code_from_text(code_response.content)
                                # Validate again
                                is_valid, error = generator.validate_diagram_source(diagram_source)
                                
                                if is_valid:
                                    # Generate the SVG
                                    svg_content = generator.generate_svg(diagram_source)
                                    
                                    if svg_content:
                                        result['success'] = True
                                        result['diagram_source'] = diagram_source
                                        result['svg'] = svg_content
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
            # Direct approach: Generate diagram code directly
            
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
            
            # Format the prompt
            formatted_prompt = SEQUENCE_DIAGRAM_DIRECT_TEMPLATE.format(
                project_plan=project_plan,
                existing_context=existing_context,
                change_request=change_request_text
            )
            
            # Create the LLM message
            messages = [HumanMessage(content=formatted_prompt)]
            
            # Attempt to generate a valid diagram
            iteration = 0
            feedback = ""
            
            while iteration < max_iterations:
                iteration += 1
                result['iterations'] = iteration
                
                try:
                    # Add feedback from previous iterations if available
                    if feedback and iteration > 1:
                        feedback_prompt = formatted_prompt + f"\n\nFeedback from previous attempt:\n{feedback}\n\nPlease correct the issues and try again."
                        messages = [HumanMessage(content=feedback_prompt)]
                    
                    # Get response from the AI service
                    response = await llm.ainvoke(messages)
                    diagram_source = extract_code_from_text(response.content)
                    # Validate the diagram source
                    is_valid, error = generator.validate_diagram_source(diagram_source)
                    
                    if is_valid:
                        # Generate the SVG
                        svg_content = generator.generate_svg(diagram_source)
                        
                        if svg_content:
                            result['success'] = True
                            result['diagram_source'] = diagram_source
                            result['svg'] = svg_content
                            break
                        else:
                            feedback = "The diagram syntax was valid, but SVG generation failed. Please simplify the diagram."
                    else:
                        feedback = f"The diagram syntax has errors: {error}. Please correct them."
                        
                except Exception as e:
                    feedback = f"An error occurred: {str(e)}. Please try again with a simpler diagram."
                    logger.error(f"Error in iteration {iteration}: {str(e)}")
            
            if not result['success']:
                result['error'] = f"Failed to generate a valid diagram after {iteration} iterations. Last feedback: {feedback}"
    
    except Exception as e:
        result['error'] = str(e)
        logger.error(f"Failed to generate sequence diagram: {str(e)}")
    finally:
        # Clean up
        generator.disconnect()
    
    return result


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