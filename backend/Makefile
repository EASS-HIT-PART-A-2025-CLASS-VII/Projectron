# Projectron Backend Test Makefile
# Simple, reliable test runner

# Colors for output
GREEN := \033[32m
YELLOW := \033[33m
RED := \033[31m
BLUE := \033[34m
CYAN := \033[36m
BOLD := \033[1m
RESET := \033[0m

# Emojis
ROCKET := 🚀
CHECK := ✅
CROSS := ❌
GEAR := ⚙️
FAST := ⚡
SLOW := 🐌
CLEAN := 🧹

# Configuration
PYTHON := python3
PYTEST := pytest
TESTS_DIR := tests
UNIT_DIR := $(TESTS_DIR)/unit
INTEGRATION_DIR := $(TESTS_DIR)/integration

.DEFAULT_GOAL := help

# =============================================================================
# HELP
# =============================================================================

.PHONY: help
help: ## Show available commands
	@echo "$(BOLD)$(CYAN)Projectron Test Runner$(RESET)"
	@echo "$(BLUE)━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━$(RESET)"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(CYAN)%-15s$(RESET) %s\n", $$1, $$2}'
	@echo ""
	@echo "$(BOLD)Quick Start:$(RESET)"
	@echo "  $(GREEN)make test$(RESET)        $(ROCKET) Run all tests"
	@echo "  $(GREEN)make unit$(RESET)        $(FAST) Run unit tests only"
	@echo "  $(GREEN)make integration$(RESET) $(SLOW) Run integration tests only"
	@echo ""

# =============================================================================
# SETUP
# =============================================================================

.PHONY: setup
setup: ## Install test dependencies
	@echo "$(BOLD)$(YELLOW)$(GEAR) Installing test dependencies...$(RESET)"
	@pip install pytest pytest-asyncio pytest-cov mongomock
	@echo "$(GREEN)$(CHECK) Dependencies installed!$(RESET)"

# =============================================================================
# MAIN TEST COMMANDS
# =============================================================================

.PHONY: test
test: ## Run all tests (unit + integration)
	@echo "$(BOLD)$(CYAN)$(ROCKET) Running All Tests$(RESET)"
	@echo "$(BLUE)━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━$(RESET)"
	@$(PYTEST) $(TESTS_DIR) -v --tb=short
	@if [ $$? -eq 0 ]; then \
		echo ""; \
		echo "$(BOLD)$(GREEN)$(ROCKET) ALL TESTS PASSED! $(ROCKET)$(RESET)"; \
	else \
		echo ""; \
		echo "$(BOLD)$(RED)$(CROSS) SOME TESTS FAILED$(RESET)"; \
		exit 1; \
	fi

.PHONY: unit
unit: ## Run unit tests only
	@echo "$(BOLD)$(CYAN)$(FAST) Running Unit Tests$(RESET)"
	@echo "$(BLUE)━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━$(RESET)"
	@$(PYTEST) $(UNIT_DIR) -v --tb=short
	@if [ $$? -eq 0 ]; then \
		echo "$(GREEN)$(CHECK) Unit tests passed!$(RESET)"; \
	else \
		echo "$(RED)$(CROSS) Unit tests failed!$(RESET)"; \
		exit 1; \
	fi

.PHONY: integration
integration: ## Run integration tests only
	@echo "$(BOLD)$(CYAN)$(SLOW) Running Integration Tests$(RESET)"
	@echo "$(BLUE)━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━$(RESET)"
	@$(PYTEST) $(INTEGRATION_DIR) -v --tb=short
	@if [ $$? -eq 0 ]; then \
		echo "$(GREEN)$(CHECK) Integration tests passed!$(RESET)"; \
	else \
		echo "$(RED)$(CROSS) Integration tests failed!$(RESET)"; \
		exit 1; \
	fi

# =============================================================================
# QUICK COMMANDS
# =============================================================================

.PHONY: quick
quick: ## Run all tests with minimal output
	@echo "$(CYAN)$(ROCKET) Quick test run...$(RESET)"
	@$(PYTEST) $(TESTS_DIR) -q

.PHONY: verbose
verbose: ## Run all tests with detailed output
	@echo "$(BOLD)$(CYAN)$(ROCKET) Verbose Test Run$(RESET)"
	@echo "$(BLUE)━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━$(RESET)"
	@$(PYTEST) $(TESTS_DIR) -vv -s --tb=long

# =============================================================================
# COVERAGE
# =============================================================================

.PHONY: coverage
coverage: ## Run tests with coverage report
	@echo "$(BOLD)$(CYAN)📊 Running Tests with Coverage$(RESET)"
	@echo "$(BLUE)━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━$(RESET)"
	@$(PYTEST) $(TESTS_DIR) --cov=app --cov-report=html --cov-report=term-missing
	@echo "$(GREEN)$(CHECK) Coverage report generated in htmlcov/$(RESET)"

# =============================================================================
# SPECIFIC TESTS
# =============================================================================

.PHONY: auth
auth: ## Run authentication tests
	@echo "$(CYAN)🔐 Running auth tests...$(RESET)"
	@$(PYTEST) $(TESTS_DIR) -v -k "auth" --tb=short

.PHONY: api
api: ## Run API tests
	@echo "$(CYAN)🔌 Running API tests...$(RESET)"
	@$(PYTEST) $(TESTS_DIR) -v -k "api or endpoint" --tb=short

.PHONY: ai
ai: ## Run AI service tests
	@echo "$(CYAN)🤖 Running AI tests...$(RESET)"
	@$(PYTEST) $(TESTS_DIR) -v -k "ai" --tb=short

# =============================================================================
# UTILITIES
# =============================================================================

.PHONY: clean
clean: ## Clean test artifacts
	@echo "$(YELLOW)$(CLEAN) Cleaning up...$(RESET)"
	@rm -rf .pytest_cache __pycache__ htmlcov .coverage
	@find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
	@find . -type f -name "*.pyc" -delete 2>/dev/null || true
	@echo "$(GREEN)$(CHECK) Cleanup complete!$(RESET)"

.PHONY: failed
failed: ## Re-run only failed tests
	@echo "$(CYAN)🔄 Re-running failed tests...$(RESET)"
	@$(PYTEST) --lf -v --tb=short

.PHONY: debug
debug: ## Run tests with debugging output
	@echo "$(CYAN)🐛 Debug mode...$(RESET)"
	@$(PYTEST) $(TESTS_DIR) -vv -s --tb=long --capture=no

# =============================================================================
# STATUS
# =============================================================================

.PHONY: status
status: ## Show test environment status
	@echo "$(BOLD)$(CYAN)Test Environment Status$(RESET)"
	@echo "$(BLUE)━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━$(RESET)"
	@echo "$(YELLOW)Python:$(RESET)          $$($(PYTHON) --version)"
	@echo "$(YELLOW)Pytest:$(RESET)          $$($(PYTEST) --version | head -n1)"
	@echo "$(YELLOW)Unit tests:$(RESET)      $$(find $(UNIT_DIR) -name "test_*.py" 2>/dev/null | wc -l) files"
	@echo "$(YELLOW)Integration:$(RESET)     $$(find $(INTEGRATION_DIR) -name "test_*.py" 2>/dev/null | wc -l) files"
	@echo ""