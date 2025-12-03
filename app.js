// Pen Plotter Image to G-Code Converter
// Implements Hatch Sawtooth algorithm with Catmull-Rom splines

class PenPlotterConverter {
    constructor() {
        this.imageData = null;
        this.currentSVG = null;
        this.currentGCode = null;
        this.canvas = document.getElementById('canvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Algorithm constants
        this.MAX_SEGMENT_GAP = 5;  // Maximum distance between points in the same segment
        this.BEZIER_SEGMENTS = 10;  // Number of line segments to approximate Bézier curves
        
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        document.getElementById('imageInput').addEventListener('change', (e) => this.handleImageUpload(e));
        document.getElementById('generateBtn').addEventListener('click', () => this.generateSVG());
        document.getElementById('generateGCodeBtn').addEventListener('click', () => this.generateGCode());
        document.getElementById('downloadSVGBtn').addEventListener('click', () => this.downloadSVG());
        document.getElementById('downloadGCodeBtn').addEventListener('click', () => this.downloadGCode());
        
        // Update range value displays
        document.getElementById('penWidth').addEventListener('input', (e) => {
            document.getElementById('penWidthValue').textContent = parseFloat(e.target.value).toFixed(1);
        });
        
        document.getElementById('curveTension').addEventListener('input', (e) => {
            document.getElementById('curveTensionValue').textContent = parseFloat(e.target.value).toFixed(1);
        });
    }

    showStatus(message, type = 'info') {
        const status = document.getElementById('status');
        status.textContent = message;
        status.className = `status ${type}`;
        status.style.display = 'block';
        
        if (type === 'success' || type === 'info') {
            setTimeout(() => {
                status.style.display = 'none';
            }, 3000);
        }
    }

    handleImageUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        this.showStatus('Loading image...', 'info');

        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                this.processImage(img);
                document.getElementById('generateBtn').disabled = false;
                this.showStatus('Image loaded successfully! Click "Generate SVG Path" to create the drawing.', 'success');
            };
            img.onerror = () => {
                this.showStatus('Failed to load image. Please try another file.', 'error');
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    processImage(img) {
        const width = parseInt(document.getElementById('canvasWidth').value);
        const height = parseInt(document.getElementById('canvasHeight').value);
        
        this.canvas.width = width;
        this.canvas.height = height;
        
        // Draw image scaled to canvas
        const scale = Math.min(width / img.width, height / img.height);
        const scaledWidth = img.width * scale;
        const scaledHeight = img.height * scale;
        const x = (width - scaledWidth) / 2;
        const y = (height - scaledHeight) / 2;
        
        this.ctx.fillStyle = 'white';
        this.ctx.fillRect(0, 0, width, height);
        this.ctx.drawImage(img, x, y, scaledWidth, scaledHeight);
        
        this.imageData = this.ctx.getImageData(0, 0, width, height);
    }

    getBrightness(x, y) {
        if (!this.imageData) return 255;
        
        x = Math.floor(x);
        y = Math.floor(y);
        
        if (x < 0 || x >= this.imageData.width || y < 0 || y >= this.imageData.height) {
            return 255;
        }
        
        const index = (y * this.imageData.width + x) * 4;
        const r = this.imageData.data[index];
        const g = this.imageData.data[index + 1];
        const b = this.imageData.data[index + 2];
        
        // Convert to grayscale using luminance formula
        return 0.299 * r + 0.587 * g + 0.114 * b;
    }

    generateSVG() {
        if (!this.imageData) {
            this.showStatus('Please upload an image first.', 'error');
            return;
        }

        this.showStatus('Generating SVG path...', 'info');

        try {
            const lineSpacing = parseFloat(document.getElementById('lineSpacing').value);
            const angle = parseFloat(document.getElementById('angle').value);
            const maxAmplitude = parseFloat(document.getElementById('maxAmplitude').value);
            const minFrequency = parseFloat(document.getElementById('minFrequency').value);
            const maxFrequency = parseFloat(document.getElementById('maxFrequency').value);
            const linkEnds = document.getElementById('linkEnds').value === 'true';
            const minVelocity = parseFloat(document.getElementById('minVelocity').value);
            const maxVelocity = parseFloat(document.getElementById('maxVelocity').value);
            const curveTension = parseFloat(document.getElementById('curveTension').value);
            const cellSize = parseFloat(document.getElementById('cellSize').value);
            const penWidth = parseFloat(document.getElementById('penWidth').value);

            const paths = this.generateHatchSawtoothPaths(
                lineSpacing,
                angle,
                maxAmplitude,
                minFrequency,
                maxFrequency,
                linkEnds,
                minVelocity,
                maxVelocity,
                curveTension,
                cellSize
            );

            this.currentSVG = this.createSVG(paths, penWidth);
            this.displaySVG(this.currentSVG);
            
            document.getElementById('generateGCodeBtn').disabled = false;
            document.getElementById('downloadSVGBtn').disabled = false;
            
            this.showStatus('SVG generated successfully!', 'success');
        } catch (error) {
            console.error('Error generating SVG:', error);
            this.showStatus('Error generating SVG: ' + error.message, 'error');
        }
    }

    generateHatchSawtoothPaths(lineSpacing, angle, maxAmplitude, minFrequency, maxFrequency, linkEnds, minVelocity, maxVelocity, curveTension, cellSize) {
        const width = this.imageData.width;
        const height = this.imageData.height;
        const angleRad = (angle * Math.PI) / 180;
        
        const paths = [];
        
        // Calculate bounds for rotated lines
        const diagonal = Math.sqrt(width * width + height * height);
        const numLines = Math.ceil(diagonal / lineSpacing);
        
        // Generate lines in a zigzag pattern (forward, then backward)
        for (let i = 0; i < numLines; i++) {
            const offset = i * lineSpacing - diagonal / 2;
            const isReverse = (i % 2 === 1); // Alternate direction for zigzag
            
            const points = this.generateLinePoints(
                offset, 
                angleRad, 
                maxAmplitude, 
                minFrequency, 
                maxFrequency, 
                minVelocity, 
                maxVelocity, 
                cellSize,
                width, 
                height,
                isReverse
            );
            
            if (points.length >= 2) {
                paths.push(points);
                
                // Link ends between consecutive lines if enabled
                if (linkEnds && i < numLines - 1 && paths.length >= 2) {
                    // The next line will be generated in reverse, so we'll link naturally
                }
            }
        }
        
        // If linkEnds is true, connect all paths into one continuous path
        if (linkEnds && paths.length > 0) {
            const linkedPath = [];
            for (let i = 0; i < paths.length; i++) {
                linkedPath.push(...paths[i]);
            }
            return [linkedPath];
        }
        
        return paths;
    }

    generateLinePoints(offset, angleRad, maxAmplitude, minFrequency, maxFrequency, minVelocity, maxVelocity, cellSize, width, height, isReverse) {
        const points = [];
        const cos = Math.cos(angleRad);
        const sin = Math.sin(angleRad);
        
        // Calculate perpendicular direction (for the line offset)
        const perpX = -sin;
        const perpY = cos;
        
        // Sample along the line
        const diagonal = Math.sqrt(width * width + height * height);
        
        // Start and end points for the line crossing the image
        let t = -diagonal;
        let tEnd = diagonal;
        
        // Track position along the wave for continuous oscillation
        let wavePhase = 0;
        
        while (t <= tEnd) {
            // Base position along the line
            const baseX = perpX * offset + cos * t + width / 2;
            const baseY = perpY * offset + sin * t + height / 2;
            
            // Check if base point is within bounds
            if (baseX >= 0 && baseX < width && baseY >= 0 && baseY < height) {
                // Get average brightness of cell around this point
                const brightness = this.getAverageBrightness(baseX, baseY, cellSize);
                
                // Normalize brightness to 0-1 range (0 = black, 1 = white)
                const normalizedBrightness = brightness / 255;
                
                // Calculate amplitude: dark areas = full amplitude, light areas = zero
                const amplitude = maxAmplitude * (1 - normalizedBrightness);
                
                // Calculate frequency: dark areas = high frequency, light areas = low frequency
                const frequency = minFrequency + (maxFrequency - minFrequency) * (1 - normalizedBrightness);
                
                // Calculate velocity (step size): dark areas = slower (more detail), light areas = faster
                const velocity = minVelocity + (maxVelocity - minVelocity) * normalizedBrightness;
                
                // Add sawtooth wave displacement perpendicular to the line direction
                const wave = amplitude * Math.sin(wavePhase);
                const x = baseX + perpX * wave;
                const y = baseY + perpY * wave;
                
                // Add point
                points.push({ x, y, brightness });
                
                // Update wave phase based on frequency
                wavePhase += frequency;
                
                // Move to next point along the line based on velocity
                t += velocity;
            } else {
                // Move forward even if outside bounds
                t += maxVelocity;
            }
        }
        
        // Reverse the points if this is a return line
        if (isReverse) {
            points.reverse();
        }
        
        return points;
    }

    // Get average brightness of a cell around a point
    getAverageBrightness(cx, cy, cellSize) {
        let sum = 0;
        let count = 0;
        const halfCell = Math.floor(cellSize / 2);
        
        for (let dy = -halfCell; dy <= halfCell; dy++) {
            for (let dx = -halfCell; dx <= halfCell; dx++) {
                const x = Math.floor(cx + dx);
                const y = Math.floor(cy + dy);
                
                if (x >= 0 && x < this.imageData.width && y >= 0 && y < this.imageData.height) {
                    sum += this.getBrightness(x, y);
                    count++;
                }
            }
        }
        
        return count > 0 ? sum / count : 255;
    }

    calculatePathLength(points) {
        let length = 0;
        for (let i = 1; i < points.length; i++) {
            const dx = points[i].x - points[i - 1].x;
            const dy = points[i].y - points[i - 1].y;
            length += Math.sqrt(dx * dx + dy * dy);
        }
        return length;
    }

    // Convert Catmull-Rom spline to cubic Bézier curves with configurable tension
    catmullRomToBezier(points, tension = 0.5) {
        if (points.length < 2) return [];
        
        const bezierSegments = [];
        
        // For a smooth curve, we need at least 4 points for Catmull-Rom
        // If we have fewer, just use straight lines
        if (points.length < 4) {
            return points;
        }
        
        // Catmull-Rom implementation with tension parameter
        // tension = 0: cardinal spline (loose)
        // tension = 0.5: Catmull-Rom spline (balanced)
        // tension = 1: tight curve
        const s = (1 - tension) / 2;
        
        for (let i = 0; i < points.length - 1; i++) {
            const p0 = i > 0 ? points[i - 1] : points[i];
            const p1 = points[i];
            const p2 = points[i + 1];
            const p3 = i < points.length - 2 ? points[i + 2] : points[i + 1];
            
            // Calculate control points for cubic Bézier using tension
            const cp1 = {
                x: p1.x + s * (p2.x - p0.x),
                y: p1.y + s * (p2.y - p0.y)
            };
            
            const cp2 = {
                x: p2.x - s * (p3.x - p1.x),
                y: p2.y - s * (p3.y - p1.y)
            };
            
            bezierSegments.push({
                start: p1,
                cp1: cp1,
                cp2: cp2,
                end: p2
            });
        }
        
        return bezierSegments;
    }

    createSVG(paths, penWidth) {
        const width = this.imageData.width;
        const height = this.imageData.height;
        const curveTension = parseFloat(document.getElementById('curveTension').value);
        
        let svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}">`;
        svg += `<rect width="${width}" height="${height}" fill="white"/>`;
        svg += `<g stroke="black" fill="none" stroke-width="${penWidth}" stroke-linecap="round" stroke-linejoin="round">`;
        
        for (const path of paths) {
            const bezierSegments = this.catmullRomToBezier(path, curveTension);
            
            if (bezierSegments.length === 0) continue;
            
            let pathData = '';
            
            if (Array.isArray(bezierSegments) && bezierSegments[0].x !== undefined) {
                // Simple points (less than 4 points)
                pathData = `M ${bezierSegments[0].x.toFixed(2)} ${bezierSegments[0].y.toFixed(2)}`;
                for (let i = 1; i < bezierSegments.length; i++) {
                    pathData += ` L ${bezierSegments[i].x.toFixed(2)} ${bezierSegments[i].y.toFixed(2)}`;
                }
            } else {
                // Bézier curves
                pathData = `M ${bezierSegments[0].start.x.toFixed(2)} ${bezierSegments[0].start.y.toFixed(2)}`;
                for (const segment of bezierSegments) {
                    pathData += ` C ${segment.cp1.x.toFixed(2)} ${segment.cp1.y.toFixed(2)}, `;
                    pathData += `${segment.cp2.x.toFixed(2)} ${segment.cp2.y.toFixed(2)}, `;
                    pathData += `${segment.end.x.toFixed(2)} ${segment.end.y.toFixed(2)}`;
                }
            }
            
            svg += `<path d="${pathData}"/>`;
        }
        
        svg += '</g></svg>';
        
        return svg;
    }

    displaySVG(svgString) {
        const container = document.getElementById('svgContainer');
        container.innerHTML = svgString;
    }

    generateGCode() {
        if (!this.currentSVG) {
            this.showStatus('Please generate SVG first.', 'error');
            return;
        }

        this.showStatus('Generating G-Code...', 'info');

        try {
            // Parse SVG and convert to G-Code
            const parser = new DOMParser();
            const svgDoc = parser.parseFromString(this.currentSVG, 'image/svg+xml');
            const paths = svgDoc.querySelectorAll('path');
            
            let gcode = [];
            
            // G-Code header
            gcode.push('; Generated by Pen Plotter Converter');
            gcode.push('; Hatch Sawtooth Algorithm');
            gcode.push('G21 ; Set units to millimeters');
            gcode.push('G90 ; Use absolute positioning');
            gcode.push('G0 Z5 ; Lift pen');
            gcode.push('G0 X0 Y0 ; Move to origin');
            gcode.push('');
            
            let pathCount = 0;
            
            paths.forEach((path, index) => {
                const d = path.getAttribute('d');
                if (!d) return;
                
                gcode.push(`; Path ${index + 1}`);
                
                const commands = this.parseSVGPath(d);
                let isFirstPoint = true;
                
                commands.forEach(cmd => {
                    if (cmd.type === 'M') {
                        // Move to position with pen up
                        gcode.push(`G0 Z5 ; Pen up`);
                        gcode.push(`G0 X${(cmd.x / 10).toFixed(3)} Y${(cmd.y / 10).toFixed(3)}`);
                        gcode.push(`G0 Z0 ; Pen down`);
                        isFirstPoint = false;
                    } else if (cmd.type === 'L') {
                        // Line to position
                        gcode.push(`G1 X${(cmd.x / 10).toFixed(3)} Y${(cmd.y / 10).toFixed(3)} F1000`);
                    } else if (cmd.type === 'C') {
                        // Cubic Bézier - approximate with line segments
                        const segments = this.bezierToLineSegments(
                            cmd.x0, cmd.y0,
                            cmd.x1, cmd.y1,
                            cmd.x2, cmd.y2,
                            cmd.x, cmd.y,
                            this.BEZIER_SEGMENTS
                        );
                        
                        segments.forEach(point => {
                            gcode.push(`G1 X${(point.x / 10).toFixed(3)} Y${(point.y / 10).toFixed(3)} F1000`);
                        });
                    }
                });
                
                pathCount++;
                gcode.push('');
            });
            
            // G-Code footer
            gcode.push('G0 Z5 ; Pen up');
            gcode.push('G0 X0 Y0 ; Return to origin');
            gcode.push('M2 ; End program');
            gcode.push(`; Total paths: ${pathCount}`);
            
            this.currentGCode = gcode.join('\n');
            
            // Display G-Code
            document.getElementById('gcodeContent').textContent = this.currentGCode;
            document.getElementById('gcodeOutput').style.display = 'block';
            document.getElementById('downloadGCodeBtn').disabled = false;
            
            this.showStatus('G-Code generated successfully!', 'success');
        } catch (error) {
            console.error('Error generating G-Code:', error);
            this.showStatus('Error generating G-Code: ' + error.message, 'error');
        }
    }

    parseSVGPath(pathData) {
        const commands = [];
        const regex = /([MLCZ])\s*([-0-9.,\s]*)/gi;
        let match;
        let currentX = 0, currentY = 0;
        
        while ((match = regex.exec(pathData)) !== null) {
            const type = match[1].toUpperCase();
            const coords = match[2].trim().split(/[\s,]+/).filter(s => s).map(parseFloat);
            
            if (type === 'M' && coords.length >= 2) {
                currentX = coords[0];
                currentY = coords[1];
                commands.push({ type: 'M', x: currentX, y: currentY });
            } else if (type === 'L' && coords.length >= 2) {
                currentX = coords[0];
                currentY = coords[1];
                commands.push({ type: 'L', x: currentX, y: currentY });
            } else if (type === 'C' && coords.length >= 6) {
                const cmd = {
                    type: 'C',
                    x0: currentX,
                    y0: currentY,
                    x1: coords[0],
                    y1: coords[1],
                    x2: coords[2],
                    y2: coords[3],
                    x: coords[4],
                    y: coords[5]
                };
                currentX = coords[4];
                currentY = coords[5];
                commands.push(cmd);
            }
        }
        
        return commands;
    }

    bezierToLineSegments(x0, y0, x1, y1, x2, y2, x3, y3, numSegments = 10) {
        const points = [];
        
        for (let i = 1; i <= numSegments; i++) {
            const t = i / numSegments;
            const mt = 1 - t;
            
            const x = mt * mt * mt * x0 +
                     3 * mt * mt * t * x1 +
                     3 * mt * t * t * x2 +
                     t * t * t * x3;
                     
            const y = mt * mt * mt * y0 +
                     3 * mt * mt * t * y1 +
                     3 * mt * t * t * y2 +
                     t * t * t * y3;
            
            points.push({ x, y });
        }
        
        return points;
    }

    downloadSVG() {
        if (!this.currentSVG) {
            this.showStatus('No SVG to download. Generate one first.', 'error');
            return;
        }

        const blob = new Blob([this.currentSVG], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'plotter-path.svg';
        a.click();
        URL.revokeObjectURL(url);
        
        this.showStatus('SVG downloaded!', 'success');
    }

    downloadGCode() {
        if (!this.currentGCode) {
            this.showStatus('No G-Code to download. Generate one first.', 'error');
            return;
        }

        const blob = new Blob([this.currentGCode], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'plotter-path.gcode';
        a.click();
        URL.revokeObjectURL(url);
        
        this.showStatus('G-Code downloaded!', 'success');
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    new PenPlotterConverter();
});
