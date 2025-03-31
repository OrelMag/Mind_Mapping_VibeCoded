/**
 * Utility functions for SVG element creation and manipulation
 */
class SVGUtils {
    /**
     * SVG namespace for creating elements
     */
    static SVG_NS = 'http://www.w3.org/2000/svg';

    /**
     * Create an SVG element with the given tag name
     * @param {string} tagName - The SVG element tag name
     * @returns {SVGElement} - The created SVG element
     */
    static createSVGElement(tagName) {
        return document.createElementNS(this.SVG_NS, tagName);
    }

    /**
     * Set multiple attributes on an SVG element
     * @param {SVGElement} element - The SVG element
     * @param {Object} attributes - Object containing attribute name-value pairs
     */
    static setAttributes(element, attributes) {
        for (const [attr, value] of Object.entries(attributes)) {
            element.setAttribute(attr, value);
        }
    }

    /**
     * Create an SVG group element
     * @param {string} className - Optional class name for the group
     * @param {string} id - Optional id for the group
     * @returns {SVGGElement} - The created group element
     */
    static createGroup(className = null, id = null) {
        const group = this.createSVGElement('g');
        if (className) group.setAttribute('class', className);
        if (id) group.setAttribute('id', id);
        return group;
    }

    /**
     * Create an SVG rectangle element
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @param {number} width - Width of rectangle
     * @param {number} height - Height of rectangle
     * @param {string} fill - Fill color
     * @returns {SVGRectElement} - The created rectangle element
     */
    static createRect(x, y, width, height, fill = '#ffffff') {
        const rect = this.createSVGElement('rect');
        this.setAttributes(rect, {
            x, y, width, height, fill
        });
        return rect;
    }

    /**
     * Create an SVG circle element
     * @param {number} cx - Center X coordinate
     * @param {number} cy - Center Y coordinate
     * @param {number} r - Radius
     * @param {string} fill - Fill color
     * @returns {SVGCircleElement} - The created circle element
     */
    static createCircle(cx, cy, r, fill = '#ffffff') {
        const circle = this.createSVGElement('circle');
        this.setAttributes(circle, {
            cx, cy, r, fill
        });
        return circle;
    }

    /**
     * Create an SVG text element
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @param {string} content - Text content
     * @param {Object} options - Additional options (textAnchor, fill, etc.)
     * @returns {SVGTextElement} - The created text element
     */
    static createText(x, y, content, options = {}) {
        const text = this.createSVGElement('text');
        this.setAttributes(text, {
            x, y,
            'text-anchor': options.textAnchor || 'middle',
            'alignment-baseline': options.alignmentBaseline || 'middle',
            'fill': options.fill || 'black',
            'pointer-events': options.pointerEvents || 'auto'
        });
        text.textContent = content;
        return text;
    }

    /**
     * Create an SVG path element
     * @param {string} pathData - SVG path data string
     * @param {Object} options - Additional options (stroke, fill, etc.)
     * @returns {SVGPathElement} - The created path element
     */
    static createPath(pathData, options = {}) {
        const path = this.createSVGElement('path');
        this.setAttributes(path, {
            'd': pathData,
            'stroke': options.stroke || '#666',
            'stroke-width': options.strokeWidth || '2',
            'fill': options.fill || 'none',
            'marker-end': options.markerEnd || null
        });
        if (options.className) {
            path.setAttribute('class', options.className);
        }
        if (options.id) {
            path.setAttribute('id', options.id);
        }
        return path;
    }

    /**
     * Create an SVG marker element (e.g., for arrowheads)
     * @param {string} id - Marker ID
     * @param {Object} options - Marker options
     * @returns {SVGMarkerElement} - The created marker element
     */
    static createMarker(id, options = {}) {
        const marker = this.createSVGElement('marker');
        this.setAttributes(marker, {
            'id': id,
            'markerWidth': options.markerWidth || '10',
            'markerHeight': options.markerHeight || '7',
            'refX': options.refX || '9',
            'refY': options.refY || '3.5',
            'orient': options.orient || 'auto'
        });
        
        // Add marker content (typically a polygon for arrowheads)
        const polygon = this.createSVGElement('polygon');
        polygon.setAttribute('points', options.points || '0 0, 10 3.5, 0 7');
        polygon.setAttribute('fill', options.fill || '#666');
        marker.appendChild(polygon);
        
        return marker;
    }

    /**
     * Apply a transform to an SVG element
     * @param {SVGElement} element - The SVG element
     * @param {Object} transform - Transform parameters
     */
    static applyTransform(element, transform) {
        let transformString = '';
        
        if (transform.translate) {
            const { x, y } = transform.translate;
            transformString += `translate(${x}px, ${y}px) `;
        }
        
        if (transform.rotate) {
            const { angle, x, y } = transform.rotate;
            transformString += `rotate(${angle}, ${x}, ${y}) `;
        }
        
        if (transform.scale) {
            transformString += `scale(${transform.scale}) `;
        }
        
        element.style.transform = transformString.trim();
    }
}

export default SVGUtils;