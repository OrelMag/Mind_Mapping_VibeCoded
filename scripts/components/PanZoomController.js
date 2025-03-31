/**
 * Manages pan and zoom functionality for the mind map
 */
class PanZoomController {
    /**
     * Create a new pan/zoom controller
     * @param {SVGElement} svg - The SVG element containing the mind map
     * @param {SVGGElement} nodesGroup - The group element for nodes
     * @param {SVGGElement} connectionsGroup - The group element for connections
     */
    constructor(svg, nodesGroup, connectionsGroup) {
        this.svg = svg;
        this.nodesGroup = nodesGroup;
        this.connectionsGroup = connectionsGroup;
        this.isPanning = false;
        this.startPoint = { x: 0, y: 0 };
        this.currentTranslate = { x: 0, y: 0 };
        this.scale = 1;
        
        this.initializeEventListeners();
    }

    /**
     * Initialize event listeners for pan and zoom
     */
    initializeEventListeners() {
        // Mouse down event for panning
        this.svg.addEventListener('mousedown', (e) => {
            // Only start panning if clicking on the SVG background or groups, not on nodes
            if (e.target === this.svg || e.target === this.nodesGroup || e.target === this.connectionsGroup) {
                this.startPanning(e);
            }
        });
        
        // Mouse move event for panning
        document.addEventListener('mousemove', (e) => {
            if (this.isPanning) {
                this.pan(e);
            }
        });
        
        // Mouse up event to stop panning
        document.addEventListener('mouseup', () => {
            this.stopPanning();
        });
        
        // Wheel event for zooming
        this.svg.addEventListener('wheel', (e) => {
            e.preventDefault();
            this.zoom(e);
        });
    }

    /**
     * Start panning
     * @param {MouseEvent} e - The mouse event
     */
    startPanning(e) {
        this.isPanning = true;
        this.startPoint = {
            x: e.clientX - this.currentTranslate.x,
            y: e.clientY - this.currentTranslate.y
        };
    }

    /**
     * Pan the mind map
     * @param {MouseEvent} e - The mouse event
     */
    pan(e) {
        this.currentTranslate = {
            x: e.clientX - this.startPoint.x,
            y: e.clientY - this.startPoint.y
        };
        
        this.applyTransform();
    }

    /**
     * Stop panning
     */
    stopPanning() {
        this.isPanning = false;
    }

    /**
     * Zoom the mind map
     * @param {WheelEvent} e - The wheel event
     */
    zoom(e) {
        // Determine zoom direction
        const delta = e.deltaY < 0 ? 1.1 : 0.9;
        
        // Calculate new scale
        const newScale = this.scale * delta;
        
        // Limit scale to reasonable bounds
        if (newScale > 0.2 && newScale < 5) {
            // Get mouse position relative to SVG
            const rect = this.svg.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            
            // Calculate new translate to zoom toward mouse position
            this.currentTranslate.x = mouseX - (mouseX - this.currentTranslate.x) * delta;
            this.currentTranslate.y = mouseY - (mouseY - this.currentTranslate.y) * delta;
            
            this.scale = newScale;
            this.applyTransform();
        }
    }

    /**
     * Apply the current transform to the node and connection groups
     */
    applyTransform() {
        const transform = `translate(${this.currentTranslate.x}px, ${this.currentTranslate.y}px) scale(${this.scale})`;
        this.nodesGroup.style.transform = transform;
        this.connectionsGroup.style.transform = transform;
    }

    /**
     * Reset the pan and zoom to default values
     */
    reset() {
        this.currentTranslate = { x: 0, y: 0 };
        this.scale = 1;
        this.applyTransform();
    }

    /**
     * Center the view on a specific node
     * @param {Node} node - The node to center on
     */
    centerOnNode(node) {
        const svgRect = this.svg.getBoundingClientRect();
        const centerX = svgRect.width / 2;
        const centerY = svgRect.height / 2;
        
        this.currentTranslate.x = centerX - node.x * this.scale;
        this.currentTranslate.y = centerY - node.y * this.scale;
        
        this.applyTransform();
    }
}

export default PanZoomController;