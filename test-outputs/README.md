# Test Outputs

This directory contains comprehensive test outputs for the Hatch Sawtooth algorithm implementation.

## Test Images

1. **West Virginia Mountaineers Flying WV Logo** - High contrast vector-based logo
2. **Zebra Photograph** - Natural image with varying tones and textures

## Test Configurations

Five different configurations were tested to demonstrate the algorithm's capabilities:

### WV Logo Tests

1. **Default Settings** (`wv-logo-default.*`)
   - Line Spacing: 5px
   - Angle: 45°
   - Amplitude: 0-10px
   - Frequency: 0.05-0.2
   - Link Ends: Yes

2. **Tight Spacing** (`wv-logo-tight-spacing.*`)
   - Line Spacing: 3px (denser)
   - Angle: 45°
   - Amplitude: 0-8px
   - Frequency: 0.05-0.3 (higher max)
   - Link Ends: Yes

3. **Vertical Hatching** (`wv-logo-vertical.*`)
   - Line Spacing: 5px
   - Angle: 90° (vertical)
   - Amplitude: 0-12px (larger)
   - Frequency: 0.05-0.2
   - Link Ends: No (separate paths)

### Zebra Tests

4. **Default Settings** (`zebra-default.*`)
   - Line Spacing: 5px
   - Angle: 45°
   - Amplitude: 0-10px
   - Frequency: 0.05-0.2
   - Link Ends: Yes

5. **High Frequency Detail** (`zebra-high-freq.*`)
   - Line Spacing: 4px
   - Angle: 0° (horizontal)
   - Amplitude: 0-15px (larger range)
   - Frequency: 0.08-0.4 (wider range)
   - Link Ends: Yes

## Files Per Test

Each test configuration generates the following files:

- **`*-config.json`** - Complete parameter configuration
- **`*.png`** - PNG preview of the output (committed to repo)
- **`*-sample.txt`** - G-Code sample (first 30 and last 10 lines)
- **`*.gcode`** - Full G-Code file (NOT in repo due to size, see below)
- **`*.svg`** - Full SVG file (NOT in repo due to size, see below)

## Accessing Full G-Code and SVG Files

The complete G-Code and SVG files are too large to store in the Git repository (15-31 MB per file). They are available in the following ways:

### Option 1: Generate Locally
Run the test generator script to create all outputs:
```bash
cd /tmp
npm install canvas
node test-generator.js
```

### Option 2: Use the Web Application
1. Open the web application at the deployed URL
2. Upload the test images:
   - WV Logo: https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/West_Virginia_Mountaineers_logo.svg/511px-West_Virginia_Mountaineers_logo.svg.png
   - Zebra: https://upload.wikimedia.org/wikipedia/commons/0/09/Zebra_July_2008-3_white_background.jpg
3. Use the configurations from `*-config.json` files
4. Click "Generate SVG Path" and "Generate G-Code"
5. Download the files using the download buttons

### Option 3: GitHub Actions Artifacts
The full G-Code and SVG files may be available as GitHub Actions artifacts after workflow runs.

## File Sizes

| File Type | Approx Size | Notes |
|-----------|-------------|-------|
| Config JSON | ~300 bytes | Committed to repo |
| PNG Preview | 600KB - 1MB | Committed to repo |
| G-Code Sample | ~900 bytes | Committed to repo |
| Full G-Code | 15-31 MB | NOT in repo |
| Full SVG | 2.7-5.6 MB | NOT in repo |

Compressed archive of all G-Code files: ~22 MB (gzip)

## Viewing Results

### PNG Previews
PNG preview images are included in this directory and can be viewed directly on GitHub:

- [WV Logo - Default](./wv-logo-default.png)
- [WV Logo - Tight Spacing](./wv-logo-tight-spacing.png)
- [WV Logo - Vertical](./wv-logo-vertical.png)
- [Zebra - Default](./zebra-default.png)
- [Zebra - High Frequency](./zebra-high-freq.png)

### G-Code Samples
Each `*-sample.txt` file contains the header (first 30 lines) and footer (last 10 lines) of the G-Code output, which is sufficient for understanding the format and structure.

## Algorithm Verification

See [TEST-RESULTS.md](./TEST-RESULTS.md) for comprehensive documentation including:
- Algorithm overview and formulas
- Detailed description of each test
- Parameter reference guide
- Algorithm correctness verification
- Performance notes

## Reproducing Results

To reproduce any test configuration:

1. Use the web application or run the test generator
2. Load the corresponding test image
3. Apply the parameters from the `*-config.json` file
4. Generate SVG and G-Code
5. Compare with the PNG preview to verify correctness

All results are fully reproducible using the provided configuration files.
