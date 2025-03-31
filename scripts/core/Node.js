import SVGUtils from '../utils/SVGUtils.js';
import GeometryUtils from '../utils/GeometryUtils.js';

/**
 * Represents a node in the mind map
 */
class Node {
    /**
     * Create a new node
     * @param {string} id - Unique identifier for the node
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @param {string} text - Node text content
     * @param {string} color - Node background color
     */
    constructor(id, x, y, text = 'New Node', color = '#ffffff') {
        this.id = id;
        this.x = x;
        this.y = y;
        this.text = text;
        this.color = color;
        this.children = new Set();
        this.parent = null;
        this.element = this.createNodeElement();
    }

    /**
     * Create the SVG element for this node
     * @returns {SVGGElement} - The node's SVG group element
     */
    createNodeElement() {
        // Create main group for the node
        const nodeGroup = SVGUtils.createGroup('node', this.id);
        
        // Create rectangle background
        const nodeRect = SVGUtils.createRect(
            this.x - 60, // x
            this.y - 20, // y
            120, // width
            40,  // height
            this.color // fill
        );
        
        // Create text element
        const nodeText = SVGUtils.createText(
            this.x, // x
            this.y + 5, // y
            this.text, // content
            { textAnchor: 'middle' } // options
        );
        
        // Create add child button
        const addChildButton = this.createAddChildButton();
        
        // Assemble the node
        nodeGroup.appendChild(nodeRect);
        nodeGroup.appendChild(nodeText);
        nodeGroup.appendChild(addChildButton);
        
        return nodeGroup;
    }

    /**
     * Create the add child button for this node
     * @returns {SVGGElement} - The button's SVG group element
     */
    createAddChildButton() {
        const buttonGroup = SVGUtils.createGroup('add-child-group');
        
        // Create circle button
        const button = SVGUtils.createCircle(
            this.x + 55, // cx
            this.y,      // cy
            8,           // radius
            '#4a4a4a'    // fill
        );
        button.setAttribute('class', 'add-child');
        
        // Create plus sign
        const plus = SVGUtils.createText(
            this.x + 55, // x
            this.y + 5,  // y
            '+',         // content
            { 
                fill: 'white',
                pointerEvents: 'none'
            }
        );
        
        buttonGroup.appendChild(button);
        buttonGroup.appendChild(plus);
        
        return buttonGroup;
    }

    /**
     * Update the node's position
     * @param {number} x - New X coordinate
     * @param {number} y - New Y coordinate
     */
    updatePosition(x, y) {
        this.x = x;
        this.y = y;
        
        // Update rectangle position
        const rect = this.element.querySelector('rect');
        rect.setAttribute('x', x - 60);
        rect.setAttribute('y', y - 20);
        
        // Update text position
        const text = this.element.querySelector('text:not(.add-child-group text)');
        text.setAttribute('x', x);
        text.setAttribute('y', y + 5);
        
        // Update add child button position
        const addChildGroup = this.element.querySelector('.add-child-group');
        const addChildCircle = addChildGroup.querySelector('circle');
        const addChildText = addChildGroup.querySelector('text');
        
        addChildCircle.setAttribute('cx', x + 55);
        addChildCircle.setAttribute('cy', y);
        addChildText.setAttribute('x', x + 55);
        addChildText.setAttribute('y', y + 5);
    }

    /**
     * Update the node's text
     * @param {string} newText - New text content
     */
    updateText(newText) {
        this.text = newText;
        const textElement = this.element.querySelector('text:not(.add-child-group text)');
        textElement.textContent = newText;
    }

    /**
     * Update the node's color
     * @param {string} newColor - New color (hex code)
     */
    updateColor(newColor) {
        this.color = newColor;
        const rect = this.element.querySelector('rect');
        rect.setAttribute('fill', newColor);
    }

    /**
     * Add a child node to this node
     * @param {Node} childNode - The child node to add
     */
    addChild(childNode) {
        this.children.add(childNode);
        childNode.parent = this;
    }

    /**
     * Remove a child node from this node
     * @param {Node} childNode - The child node to remove
     */
    removeChild(childNode) {
        this.children.delete(childNode);
        childNode.parent = null;
    }

    /**
     * Create a child node at a random position around this node
     * @param {function} createNodeCallback - Callback function to create a new node
     * @returns {Node} - The created child node
     */
    createChildNode(createNodeCallback) {
        const distance = 150;
        const { x, y } = GeometryUtils.generateRandomPointAtDistance(this.x, this.y, distance);
        
        // Use the callback to create a new node
        const childNode = createNodeCallback(`node-${Date.now()}`, x, y);
        
        // Set up parent-child relationship
        this.addChild(childNode);
        
        return childNode;
    }

    /**
     * Select this node (add selected class)
     */
    select() {
        this.element.classList.add('selected');
    }

    /**
     * Deselect this node (remove selected class)
     */
    deselect() {
        this.element.classList.remove('selected');
    }
}

export default Node;