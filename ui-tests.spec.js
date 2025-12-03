/**
 * Playwright UI Tests for Pen Plotter Image Converter
 * 
 * Tests verify that the web application UI is functional and interactive.
 * Run with: npx playwright test ui-tests.spec.js
 */

const { test, expect } = require('@playwright/test');
const path = require('path');

test.describe('Pen Plotter Image Converter UI Tests', () => {
    test.beforeEach(async ({ page }) => {
        // Navigate to the application
        await page.goto('http://127.0.0.1:8083');
        
        // Wait for the page to be fully loaded
        await page.waitForLoadState('networkidle');
    });

    test('should load the page with correct title and initial state', async ({ page }) => {
        // Check page title
        await expect(page).toHaveTitle('Pen Plotter Image to G-Code Converter');
        
        // Check main heading
        const heading = page.locator('h1');
        await expect(heading).toContainText('Pen Plotter Image Converter');
        
        // Check that buttons are initially disabled
        await expect(page.locator('#generateBtn')).toBeDisabled();
        await expect(page.locator('#generateGCodeBtn')).toBeDisabled();
        await expect(page.locator('#downloadSVGBtn')).toBeDisabled();
        await expect(page.locator('#downloadGCodeBtn')).toBeDisabled();
        
        // Check placeholder is visible
        await expect(page.locator('.placeholder')).toBeVisible();
        await expect(page.locator('.placeholder')).toContainText('Upload an image to get started');
    });

    test('should have all parameter controls with correct default values', async ({ page }) => {
        // Line Spacing
        await expect(page.locator('#lineSpacing')).toHaveValue('5');
        
        // Angle
        await expect(page.locator('#angle')).toHaveValue('45');
        
        // Max Amplitude
        await expect(page.locator('#maxAmplitude')).toHaveValue('10');
        
        // Min Frequency
        await expect(page.locator('#minFrequency')).toHaveValue('0.05');
        
        // Max Frequency
        await expect(page.locator('#maxFrequency')).toHaveValue('0.2');
        
        // Link Ends
        await expect(page.locator('#linkEnds')).toHaveValue('true');
        
        // Min Velocity
        await expect(page.locator('#minVelocity')).toHaveValue('0.5');
        
        // Max Velocity
        await expect(page.locator('#maxVelocity')).toHaveValue('2');
        
        // Curve Tension
        await expect(page.locator('#curveTension')).toHaveValue('0.5');
        
        // Cell Size
        await expect(page.locator('#cellSize')).toHaveValue('3');
        
        // Pen Width
        await expect(page.locator('#penWidth')).toHaveValue('1');
        
        // Canvas Width
        await expect(page.locator('#canvasWidth')).toHaveValue('800');
        
        // Canvas Height
        await expect(page.locator('#canvasHeight')).toHaveValue('600');
    });

    test('should update parameter values when changed', async ({ page }) => {
        // Change line spacing
        await page.locator('#lineSpacing').fill('10');
        await expect(page.locator('#lineSpacing')).toHaveValue('10');
        
        // Change angle
        await page.locator('#angle').fill('90');
        await expect(page.locator('#angle')).toHaveValue('90');
        
        // Change max amplitude
        await page.locator('#maxAmplitude').fill('20');
        await expect(page.locator('#maxAmplitude')).toHaveValue('20');
        
        // Change link ends dropdown
        await page.locator('#linkEnds').selectOption('false');
        await expect(page.locator('#linkEnds')).toHaveValue('false');
    });

    test('should update range slider value displays', async ({ page }) => {
        // Check initial pen width value display
        await expect(page.locator('#penWidthValue')).toHaveText('1.0');
        
        // Change pen width slider
        await page.locator('#penWidth').fill('2.5');
        await expect(page.locator('#penWidthValue')).toHaveText('2.5');
        
        // Check initial curve tension value display
        await expect(page.locator('#curveTensionValue')).toHaveText('0.5');
        
        // Change curve tension slider
        await page.locator('#curveTension').fill('0.8');
        await expect(page.locator('#curveTensionValue')).toHaveText('0.8');
    });

    test('should enable Generate SVG button after image upload', async ({ page }) => {
        // Get the file input
        const fileInput = page.locator('#imageInput');
        
        // Upload test image
        const testImagePath = path.join(__dirname, 'test-images', 'wv-logo.png');
        await fileInput.setInputFiles(testImagePath);
        
        // Wait for image to be processed
        await page.waitForTimeout(1000);
        
        // Check status message appears
        const status = page.locator('#status');
        await expect(status).toBeVisible();
        
        // Generate SVG button should be enabled
        await expect(page.locator('#generateBtn')).toBeEnabled();
    });

    test('should generate SVG after image upload and button click', async ({ page }) => {
        // Upload test image
        const fileInput = page.locator('#imageInput');
        const testImagePath = path.join(__dirname, 'test-images', 'wv-logo.png');
        await fileInput.setInputFiles(testImagePath);
        
        // Wait for image processing
        await page.waitForTimeout(1000);
        
        // Click Generate SVG button
        await page.locator('#generateBtn').click();
        
        // Wait for SVG generation (this can take time)
        await page.waitForTimeout(3000);
        
        // Check that SVG is displayed
        const svgContainer = page.locator('#svgContainer');
        const svg = svgContainer.locator('svg');
        await expect(svg).toBeVisible();
        
        // Check that download and G-code buttons are enabled
        await expect(page.locator('#generateGCodeBtn')).toBeEnabled();
        await expect(page.locator('#downloadSVGBtn')).toBeEnabled();
    });

    test('should generate G-Code after SVG generation', async ({ page }) => {
        // Upload test image
        const fileInput = page.locator('#imageInput');
        const testImagePath = path.join(__dirname, 'test-images', 'wv-logo.png');
        await fileInput.setInputFiles(testImagePath);
        
        // Wait for image processing
        await page.waitForTimeout(1000);
        
        // Generate SVG
        await page.locator('#generateBtn').click();
        await page.waitForTimeout(3000);
        
        // Click Generate G-Code button
        await page.locator('#generateGCodeBtn').click();
        
        // Wait for G-Code generation
        await page.waitForTimeout(2000);
        
        // Check that G-Code output is visible
        const gcodeOutput = page.locator('#gcodeOutput');
        await expect(gcodeOutput).toBeVisible();
        
        // Check that G-Code content is not empty
        const gcodeContent = page.locator('#gcodeContent');
        const contentText = await gcodeContent.textContent();
        expect(contentText.length).toBeGreaterThan(0);
        expect(contentText).toContain('G21'); // Check for G-Code command
        
        // Check that download G-Code button is enabled
        await expect(page.locator('#downloadGCodeBtn')).toBeEnabled();
    });

    test('should handle different parameter values without errors', async ({ page }) => {
        // Set up console error listener
        const consoleErrors = [];
        page.on('console', msg => {
            if (msg.type() === 'error') {
                consoleErrors.push(msg.text());
            }
        });
        
        // Upload test image
        const fileInput = page.locator('#imageInput');
        const testImagePath = path.join(__dirname, 'test-images', 'wv-logo.png');
        await fileInput.setInputFiles(testImagePath);
        await page.waitForTimeout(1000);
        
        // Change parameters to extreme values
        await page.locator('#lineSpacing').fill('20');
        await page.locator('#angle').fill('0');
        await page.locator('#maxAmplitude').fill('30');
        await page.locator('#minFrequency').fill('0.01');
        await page.locator('#maxFrequency').fill('0.5');
        await page.locator('#linkEnds').selectOption('false');
        
        // Generate SVG with new parameters
        await page.locator('#generateBtn').click();
        await page.waitForTimeout(3000);
        
        // Check that SVG is still generated without errors
        const svg = page.locator('#svgContainer svg');
        await expect(svg).toBeVisible();
        
        // Verify no console errors occurred
        expect(consoleErrors.length).toBe(0);
    });

    test('should not have any console errors on page load', async ({ page }) => {
        // Set up console error listener
        const consoleErrors = [];
        page.on('console', msg => {
            if (msg.type() === 'error') {
                consoleErrors.push(msg.text());
            }
        });
        
        // Reload the page
        await page.reload();
        await page.waitForLoadState('networkidle');
        
        // Check no console errors
        expect(consoleErrors.length).toBe(0);
    });

    test('should display status messages appropriately', async ({ page }) => {
        // Initially status should be hidden
        const status = page.locator('#status');
        await expect(status).toHaveCSS('display', 'none');
        
        // Upload image
        const fileInput = page.locator('#imageInput');
        const testImagePath = path.join(__dirname, 'test-images', 'wv-logo.png');
        await fileInput.setInputFiles(testImagePath);
        
        // Status should become visible
        await page.waitForTimeout(500);
        await expect(status).toBeVisible();
        
        // Generate SVG
        await page.locator('#generateBtn').click();
        await page.waitForTimeout(500);
        
        // Status should show generation message
        await expect(status).toBeVisible();
    });
});
