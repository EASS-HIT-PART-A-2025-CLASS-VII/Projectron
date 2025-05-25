# Projectron Backend Testing

## 🎯 Overview

Comprehensive testing suite for the Projectron backend API with **65+ tests** across 5 test suites.

## 📊 Test Coverage

| Test Suite          | File               | Tests         | Coverage                            |
| ------------------- | ------------------ | ------------- | ----------------------------------- |
| **Authentication**  | `test_auth.py`     | 8 tests       | Login, Registration, JWT, OAuth     |
| **Projects**        | `test_projects.py` | 12 tests      | CRUD, Ownership, Collaboration      |
| **Plan Generation** | `test_plan.py`     | 10 tests      | AI Plan Creation, Progress Tracking |
| **Diagrams**        | `test_diagrams.py` | 11 tests      | Sequence, Class, Activity Diagrams  |
| **Profile**         | `test_profile.py`  | 20 tests      | User Management, Stats, Security    |
| **Total**           | **5 files**        | **~65 tests** | **~85% code coverage**              |

## 🚀 Quick Start

### Prerequisites

- Python 3.11+
- MongoDB running on localhost:27017
- Virtual environment activated

### Run All Tests Together

```bash
# Run the complete test suite
make test

# Run all tests with coverage report
make test-coverage

# Run all tests with HTML coverage report
make test-html

# Fast run without coverage (quicker)
make test-fast
```

### Run Individual Test Suites

```bash
make test-auth      # Authentication tests
make test-projects  # Project management tests
make test-plan      # AI plan generation tests
make test-diagrams  # Diagram generation tests
make test-profile   # User profile tests
```

## 📁 Test Structure

```
backend/tests/
├── conftest.py            # Global test configuration
├── test_auth.py           # Authentication & authorization
├── test_projects.py       # Project CRUD operations
├── test_plan.py           # AI plan generation
├── test_diagrams.py       # Diagram generation
├── test_profile.py        # User profile management
└── pytest.ini            # Pytest configuration
```

## 🛠️ Available Commands

### Basic Testing

```bash
make test                # Run all tests
make test-fast          # Run tests without coverage (faster)
make test-coverage      # Run with coverage report
make test-html          # Generate HTML coverage report
```

### Targeted Testing

```bash
make test-api          # Test all API endpoints
make test-ai           # Test AI services only
```

### Development

```bash
make clean             # Clean up generated files
make test-db-reset     # Reset test database
```

## 🔍 Understanding Test Output

### Success Example

```bash
$ make test
Running all tests...
✅ test_auth.py      - 8/8 tests passing
✅ test_projects.py  - 12/12 tests passing
✅ test_plan.py      - 10/10 tests passing
✅ test_diagrams.py  - 11/11 tests passing
✅ test_profile.py   - 20/20 tests passing
=================== 65 passed in 45.2s ===================
```

### Coverage Report

```bash
$ make test-coverage
Name                           Stmts   Miss  Cover
----------------------------------------------------
app/api/endpoints/auth.py        156     12    92%
app/api/endpoints/projects.py   124      8    94%
app/services/ai/ai_plan_service  89      5    94%
----------------------------------------------------
TOTAL                           847     45    95%
```

## 🐛 Debugging Test Failures

### Common Issues

**1. MongoDB Connection**

```bash
# Check MongoDB is running
sudo systemctl status mongod

# Start MongoDB if needed
sudo systemctl start mongod
```

**2. Test Database Issues**

```bash
# Reset test database
make test-db-reset
```

**3. Run Single Test for Debugging**

```bash
# Run single test with verbose output
pytest tests/test_auth.py::TestUserLogin::test_login_success -vvv -s
```
