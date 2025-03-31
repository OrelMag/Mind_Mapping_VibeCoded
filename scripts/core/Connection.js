import SVGUtils from '../utils/SVGUtils.js';
import GeometryUtils from '../utils/GeometryUtils.js';

/**
 * Represents a connection between two nodes in the mind map
 */
class Connection {
    /**
     * Create a new connection
     * @param {string} id - Unique identifier for the connection
     * @param {Node} sourceNode - Source node
     * @param {Node} targetNode - Target node
     * @param {string} label - Optional label for the connection
     */
    constructor(id, sourceNode, targetNode, label = '') {
        this.id = id;
        this.source = sourceNode;
        this.target = targetNode;
        this.label = label;
        this.element = null;
        this.group = null;
        this.text = null;
        this.textBackground = null;
        
        this.createConnectionElement();
    }

    /**
     * Create the SVG elements for this connection
     */
    createConnectionElement() {
        // Create main group for the connection
        this.group = SVGUtils.createGroup('connection-group');
        
        // Create path element
        this.element = SVGUtils.createPath(
            '', // Will be set in updatePath
            {
                className: 'connection',
                id: this.id,
                markerEnd: 'url(#arrowhead)'
            }
        );
        
        // Create text background (for better readability)
        this.textBackground = SVGUtils.createText(
            0, 0, '', // Will be set in updatePath
            {
                className: 'connection-text-background'
            }
        );
        
        // Create text element
        this.text = SVGUtils.createText(
            0, 0, this.label,
            {
                className: 'connection-text'
            }
        );
        
        // Assemble the connection
        this.group.appendChild(this.element);
        this.group.appendChild(this.textBackground);
        this.group.appendChild(this.text);
        
        // Update the path to set initial positions
        this.updatePath();
    }

    /**
     * Update the connection path and text positions
     */
    updatePath() {
        // Calculate path data
        const pathData = GeometryUtils.calculateBezierPath(
            this.source.x, this.source.y,
            this.target.x, this.target.y
        );
        
        // Update path
        this.element.setAttribute('d', pathData);
        
        // Calculate text position (midpoint)
        const midpoint = GeometryUtils.calculateMidpoint(
            this.source.x, this.source.y,
            this.target.x, this.target.y
        );
        
        // Calculate angle for text rotation
        const angle = GeometryUtils.calculateAngle(
            this.source.x, this.source.y,
            this.target.x, this.target.y
        );
        
        // Update text and text background
        this.updateTextElements(midpoint.x, midpoint.y, angle);
    }

    /**
     * Update text elements position and rotation
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @param {number} angle - Rotation angle in degrees
     */
    updateTextElements(x, y, angle) {
        // Set common attributes for both text elements
        const textAttributes = {
            x: x,
            y: y,
            transform: `rotate(${angle}, ${x}, ${y})`,
            'text-anchor': 'middle',
            'alignment-baseline': 'middle'
        };
        
        // Update text element
        for (const [attr, value] of Object.entries(textAttributes)) {
            this.text.setAttribute(attr, value);
        }
        
        // Update text background (same attributes)
        for (const [attr, value] of Object.entries(textAttributes)) {
            this.textBackground.setAttribute(attr, value);
        }
        
        // Ensure text content is set
        this.text.textContent = this.label;
        this.textBackground.textContent = this.label;
    }

    /**
     * Update the connection label
     * @param {string} newLabel - New label text
     */
    updateLabel(newLabel) {
        this.label = newLabel;
        this.text.textContent = newLabel;
        this.textBackground.textContent = newLabel;
        this.updatePath(); // Refresh the path and text positioning
    }

    /**
     * Check if this connection involves a specific node
     * @param {Node} node - The node to check
     * @returns {boolean} - True if the connection involves the node
     */
    involvesNode(node) {
        return this.source === node || this.target === node;
    }

    /**
     * Remove this connection's elements from the DOM
     */
    remove() {
        if (this.group && this.group.parentNode) {
            this.group.parentNode.removeChild(this.group);
        }
    }
}

export default Connection;