#!/bin/bash

# Run backend tests
echo "Running backend tests..."

# Install test dependencies if not already installed

# Run pytest with coverage
pytest -v --tb=short

# Optional: Run with coverage report
# pytest -v --tb=short --cov=app --cov-report=html