/**
 * Manages exporting mind maps to various formats
 */
class ExportManager {
    /**
     * Create a new export manager
     */
    constructor() {
        // Export format handlers
        this.exportHandlers = {
            svg: this.exportToSVG.bind(this),
            png: this.exportToPNG.bind(this),
            json: this.exportToJSON.bind(this)
        };
    }

    /**
     * Export the mind map
     * @param {SVGElement} svg - The SVG element containing the mind map
     * @param {string} format - The export format (svg, png, json)
     * @param {Object} data - The mind map data (for JSON export)
     */
    export(svg, format = 'svg', data = null) {
        const handler = this.exportHandlers[format.toLowerCase()];
        
        if (handler) {
            handler(svg, data);
        } else {
            console.error(`Unsupported export format: ${format}`);
            alert(`Unsupported export format: ${format}`);
        }
    }

    /**
     * Export the mind map to SVG
     * @param {SVGElement} svg - The SVG element containing the mind map
     */
    exportToSVG(svg) {
        try {
            // Clone the SVG to avoid modifying the original
            const clonedSvg = svg.cloneNode(true);
            
            // Add some styling to ensure the exported SVG looks good
            const style = document.createElement('style');
            style.textContent = `
                .node rect { stroke: #666; stroke-width: 1px; }
                .connection { stroke: #666; stroke-width: 2px; fill: none; }
                .connection-text { font-size: 12px; }
                .add-child { fill: #4a4a4a; }
            `;
            clonedSvg.appendChild(style);
            
            // Serialize the SVG to a string
            const serializer = new XMLSerializer();
            const svgString = serializer.serializeToString(clonedSvg);
            
            // Create a blob and download link
            const blob = new Blob([svgString], { type: 'image/svg+xml' });
            const url = URL.createObjectURL(blob);
            
            this.downloadFile(url, 'mindmap.svg');
        } catch (error) {
            console.error('Error exporting to SVG:', error);
            alert('Error exporting to SVG!');
        }
    }

    /**
     * Export the mind map to PNG
     * @param {SVGElement} svg - The SVG element containing the mind map
     */
    exportToPNG(svg) {
        try {
            // Clone the SVG to avoid modifying the original
            const clonedSvg = svg.cloneNode(true);
            
            // Add some styling to ensure the exported PNG looks good
            const style = document.createElement('style');
            style.textContent = `
                .node rect { stroke: #666; stroke-width: 1px; }
                .connection { stroke: #666; stroke-width: 2px; fill: none; }
                .connection-text { font-size: 12px; }
                .add-child { fill: #4a4a4a; }
            `;
            clonedSvg.appendChild(style);
            
            // Set width and height attributes if they're not already set
            if (!clonedSvg.hasAttribute('width')) {
                clonedSvg.setAttribute('width', '1200');
            }
            if (!clonedSvg.hasAttribute('height')) {
                clonedSvg.setAttribute('height', '800');
            }
            
            // Serialize the SVG to a string
            const serializer = new XMLSerializer();
            const svgString = serializer.serializeToString(clonedSvg);
            
            // Create a blob URL for the SVG
            const svgBlob = new Blob([svgString], { type: 'image/svg+xml' });
            const url = URL.createObjectURL(svgBlob);
            
            // Create an Image object to load the SVG
            const img = new Image();
            
            img.onload = () => {
                // Create a canvas to draw the image
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                
                // Draw the image on the canvas
                const ctx = canvas.getContext('2d');
                ctx.fillStyle = 'white';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0);
                
                // Convert canvas to PNG
                try {
                    const pngUrl = canvas.toDataURL('image/png');
                    this.downloadFile(pngUrl, 'mindmap.png');
                } catch (error) {
                    console.error('Error converting to PNG:', error);
                    alert('Error converting to PNG!');
                }
                
                // Clean up
                URL.revokeObjectURL(url);
            };
            
            img.onerror = () => {
                console.error('Error loading SVG for PNG export');
                alert('Error loading SVG for PNG export!');
                URL.revokeObjectURL(url);
            };
            
            // Set the source to the blob URL to start loading
            img.src = url;
        } catch (error) {
            console.error('Error exporting to PNG:', error);
            alert('Error exporting to PNG!');
        }
    }

    /**
     * Export the mind map to JSON
     * @param {SVGElement} svg - Not used for JSON export
     * @param {Object} data - The mind map data
     */
    exportToJSON(svg, data) {
        if (!data) {
            console.error('No data provided for JSON export');
            alert('No data provided for JSON export!');
            return;
        }
        
        try {
            // Convert data to JSON string with pretty formatting
            const jsonString = JSON.stringify(data, null, 2);
            
            // Create a blob and download link
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            this.downloadFile(url, 'mindmap.json');
        } catch (error) {
            console.error('Error exporting to JSON:', error);
            alert('Error exporting to JSON!');
        }
    }

    /**
     * Helper method to download a file
     * @param {string} url - The URL of the file to download
     * @param {string} filename - The filename to use
     */
    downloadFile(url, filename) {
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}

export default ExportManager;