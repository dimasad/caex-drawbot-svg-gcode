# Pen Plotter Image Converter

A web-based tool that transforms raster images into beautiful pen plotter paths using the Hatch Sawtooth algorithm with Centripetal Catmull-Rom splines.

Access the page at https://dimasad.github.io/caex-drawbot-svg-gcode/

## Features

- **Image Upload**: Upload any raster image (PNG, JPG, etc.)
- **Hatch Sawtooth Algorithm**: Generates curved paths similar to DrawingBotV3's hatch sawtooth Path-Finding Module
- **Catmull-Rom Splines**: Smooth curves using Centripetal Catmull-Rom splines converted to cubic Bézier curves
- **SVG Generation**: Creates SVG output with adjustable pen width for visualization
- **G-Code Export**: Converts SVG paths to G-Code for pen plotters
- **Parameter Controls**: Adjust line spacing, angle, wave amplitude, frequency, and more

## Usage

### Local Testing

1. Start a simple HTTP server:
   ```bash
   npx http-server
   ```

2. Open your browser to the URL shown (typically `http://localhost:8080`)

3. Upload an image and adjust parameters:
   - **Line Spacing**: Distance between hatch lines (pixels)
   - **Angle**: Direction of hatch lines (0-180 degrees)
   - **Wave Amplitude**: Strength of the sawtooth wave effect
   - **Wave Frequency**: Frequency of the sawtooth oscillation
   - **Brightness Threshold**: Controls which areas get drawn (0-255)
   - **Minimum Line Length**: Filters out short segments
   - **Pen Width**: Visualization thickness for the SVG preview
   - **Canvas Width/Height**: Output dimensions

4. Click "Generate SVG Path" to create the drawing

5. Click "Generate G-Code" to convert to plotter commands

6. Download SVG or G-Code files using the respective buttons

## Deployment

This is a static webpage with no build steps required. It can be deployed directly to GitHub Pages or any static hosting service.

For GitHub Pages:
1. Push the files to your repository
2. Enable GitHub Pages in repository settings
3. Set the source to the main/master branch root directory

## References

- [DrawingBotV3 Hatch Sawtooth PFM](https://docs.drawingbotv3.com/en/latest/pfms.html#hatch-sawtooth)
- [Centripetal Catmull-Rom Spline](https://en.wikipedia.org/wiki/Centripetal_Catmull%E2%80%93Rom_spline)

## License

See LICENSE file for details.
