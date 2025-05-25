# Makefile for Projectron Backend Testing

# Colors for output
GREEN := \033[0;32m
YELLOW := \033[0;33m
RED := \033[0;31m
NC := \033[0m # No Color

# Python environment
PYTHON := python3
VENV := .venv
PIP := $(VENV)/bin/pip
PYTEST := $(VENV)/bin/pytest
COVERAGE := $(VENV)/bin/coverage

.PHONY: help install test test-auth test-projects test-plan test-diagrams test-profile test-all test-fast test-coverage test-html clean lint format check

help: ## Show this help message
	@echo "$(GREEN)Projectron Backend Test Commands$(NC)"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "$(YELLOW)%-20s$(NC) %s\n", $$1, $$2}'

install: ## Install dependencies and set up environment
	@echo "$(GREEN)Setting up Python environment...$(NC)"
	$(PYTHON) -m venv $(VENV)
	$(PIP) install -r requirements.txt
	@echo "$(GREEN)✅ Environment ready!$(NC)"

# Individual test suites
test-auth: ## Run authentication tests only
	@echo "$(GREEN)Running authentication tests...$(NC)"
	$(PYTEST) tests/test_auth.py -v

test-projects: ## Run project management tests only
	@echo "$(GREEN)Running project tests...$(NC)"
	$(PYTEST) tests/test_projects.py -v

test-plan: ## Run AI plan generation tests only
	@echo "$(GREEN)Running plan generation tests...$(NC)"
	$(PYTEST) tests/test_plan.py -v

test-diagrams: ## Run diagram generation tests only
	@echo "$(GREEN)Running diagram tests...$(NC)"
	$(PYTEST) tests/test_diagrams.py -v

test-profile: ## Run user profile tests only
	@echo "$(GREEN)Running profile tests...$(NC)"
	$(PYTEST) tests/test_profile.py -v

# Test suites
test-fast: ## Run all tests without coverage (faster)
	@echo "$(GREEN)Running all tests (fast mode)...$(NC)"
	$(PYTEST) tests/ -v --tb=short

test: ## Run all tests with basic output
	@echo "$(GREEN)Running all tests...$(NC)"
	$(PYTEST) tests/ -v

test-all: ## Run all tests with detailed output
	@echo "$(GREEN)Running comprehensive test suite...$(NC)"
	$(PYTEST) tests/ -v -s --tb=long

# Coverage testing
test-coverage: ## Run tests with coverage report
	@echo "$(GREEN)Running tests with coverage...$(NC)"
	$(COVERAGE) run -m pytest tests/ -v
	$(COVERAGE) report -m
	@echo ""
	@echo "$(YELLOW)💡 Use 'make test-html' to generate HTML coverage report$(NC)"

test-html: ## Generate HTML coverage report
	@echo "$(GREEN)Generating HTML coverage report...$(NC)"
	$(COVERAGE) run -m pytest tests/ -v
	$(COVERAGE) html
	@echo "$(GREEN)✅ Coverage report generated in htmlcov/index.html$(NC)"
	@echo "$(YELLOW)Open htmlcov/index.html in your browser$(NC)"

test-ci: ## Run tests suitable for CI/CD (with coverage and JUnit XML)
	@echo "$(GREEN)Running CI test suite...$(NC)"
	$(COVERAGE) run -m pytest tests/ -v --junitxml=test-results.xml
	$(COVERAGE) xml
	$(COVERAGE) report -m

# Development helpers
lint: ## Run code linting
	@echo "$(GREEN)Running code linting...$(NC)"
	$(VENV)/bin/flake8 app/ tests/ --max-line-length=100 --exclude=migrations

format: ## Format code with black
	@echo "$(GREEN)Formatting code...$(NC)"
	$(VENV)/bin/black app/ tests/ --line-length=100

check: ## Run all code quality checks
	@echo "$(GREEN)Running code quality checks...$(NC)"
	make lint
	make format
	@echo "$(GREEN)✅ Code quality checks complete$(NC)"

# Database helpers
test-db-reset: ## Reset test database
	@echo "$(GREEN)Resetting test database...$(NC)"
	$(PYTHON) -c "from mongoengine import connect, disconnect; disconnect(); connect('projectron_test'); from app.db.models.auth import User; from app.db.models.project import Project; User.drop_collection(); Project.drop_collection(); print('✅ Test database reset')"

# Cleanup
clean: ## Clean up generated files
	@echo "$(GREEN)Cleaning up...$(NC)"
	rm -rf .coverage
	rm -rf htmlcov/
	rm -rf .pytest_cache/
	rm -rf test-results.xml
	rm -rf coverage.xml
	find . -type d -name __pycache__ -exec rm -rf {} +
	find . -type f -name "*.pyc" -delete
	@echo "$(GREEN)✅ Cleanup complete$(NC)"

# Quick test categories
test-api: ## Test all API endpoints (auth, projects, plan, diagrams, profile)
	@echo "$(GREEN)Testing all API endpoints...$(NC)"
	$(PYTEST) tests/test_auth.py tests/test_projects.py tests/test_profile.py -v

test-ai: ## Test AI services (plan generation, diagrams)
	@echo "$(GREEN)Testing AI services...$(NC)"
	$(PYTEST) tests/test_plan.py tests/test_diagrams.py -v

# Performance testing
test-perf: ## Run performance-focused tests
	@echo "$(GREEN)Running performance tests...$(NC)"
	$(PYTEST) tests/ -v --durations=10

# Test with different verbosity levels
test-quiet: ## Run tests with minimal output
	$(PYTEST) tests/ -q

test-verbose: ## Run tests with maximum verbosity
	$(PYTEST) tests/ -vvv -s

# Parallel testing (if pytest-xdist is installed)
test-parallel: ## Run tests in parallel (faster)
	@echo "$(GREEN)Running tests in parallel...$(NC)"
	$(PYTEST) tests/ -v -n auto 2>/dev/null || $(PYTEST) tests/ -v

# Status check
status: ## Show current test status
	@echo "$(GREEN)Projectron Backend Test Status$(NC)"
	@echo "$(YELLOW)Test Files:$(NC)"
	@ls -la tests/test_*.py 2>/dev/null || echo "No test files found"
	@echo ""
	@echo "$(YELLOW)Last Test Run:$(NC)"
	@if [ -f .coverage ]; then echo "Coverage data available - run 'make test-coverage'"; else echo "No recent test data - run 'make test'"; fi

# Development workflow
dev-test: ## Development testing workflow (fast + coverage)
	@echo "$(GREEN)Development Test Workflow$(NC)"
	make test-fast
	make test-coverage

# Full CI workflow simulation
ci-full: ## Simulate full CI workflow
	@echo "$(GREEN)Simulating CI/CD workflow...$(NC)"
	make clean
	make install
	make check
	make test-ci
	@echo "$(GREEN)✅ CI workflow simulation complete$(NC)"