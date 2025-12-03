# UI Testing

This directory contains Playwright-based UI tests for the Pen Plotter Image Converter web application.

## Test Coverage

The test suite (`ui-tests.spec.js`) verifies:

1. **Page Load & Initial State**
   - Page loads with correct title
   - All buttons are initially disabled (until image upload)
   - Placeholder message is displayed
   - No console errors on load

2. **Parameter Controls**
   - All parameters have correct default values
   - Parameters can be changed by user
   - Range sliders update their value displays
   - Dropdown selections work correctly

3. **Image Upload Flow**
   - File upload enables the Generate SVG button
   - Status messages appear appropriately
   - Image processing completes without errors

4. **SVG Generation**
   - SVG is generated after clicking Generate button
   - SVG is displayed in the preview area
   - Download and G-Code buttons become enabled

5. **G-Code Generation**
   - G-Code is generated from SVG
   - G-Code output is displayed
   - Download G-Code button becomes enabled
   - Generated G-Code contains valid commands

6. **Parameter Validation**
   - Application handles different parameter values
   - Extreme parameter values don't cause errors
   - Generation works with various settings

## Running Tests

### Prerequisites

Install dependencies:
```bash
npm install
```

Install Playwright browsers:
```bash
npx playwright install chromium
```

### Run Tests

Run all tests (headless):
```bash
npm test
```

Run tests with browser visible:
```bash
npm run test:headed
```

Run tests with UI mode (interactive):
```bash
npm run test:ui
```

### Test Results

After running tests, view the HTML report:
```bash
npx playwright show-report
```

## Test Configuration

Tests are configured in `playwright.config.js`:
- Runs on Chromium browser
- Automatically starts local HTTP server on port 8083
- Takes screenshots on failure
- Retains video on failure
- Generates HTML report

## Test Data

Test images are stored in `test-images/`:
- `wv-logo.png` - West Virginia Mountaineers logo (used for testing)

## CI/CD Integration

Tests can be integrated into CI/CD pipelines:
- Set `CI=true` environment variable
- Tests will retry twice on failure
- Parallel execution is disabled on CI
- Test artifacts (screenshots, videos) are saved on failure

## Test Results Summary

✅ All 10 tests passing (31.6s execution time)

### Test List:
1. should load the page with correct title and initial state
2. should have all parameter controls with correct default values
3. should update parameter values when changed
4. should update range slider value displays
5. should enable Generate SVG button after image upload
6. should generate SVG after image upload and button click
7. should generate G-Code after SVG generation
8. should handle different parameter values without errors
9. should not have any console errors on page load
10. should display status messages appropriately
