import Node from './Node.js';
import Connection from './Connection.js';

/**
 * Manages the mind map, orchestrating nodes and connections
 */
class MindMapManager {
    /**
     * Create a new mind map manager
     * @param {SVGElement} svg - The SVG element containing the mind map
     * @param {SVGGElement} nodesGroup - The group element for nodes
     * @param {SVGGElement} connectionsGroup - The group element for connections
     */
    constructor(svg, nodesGroup, connectionsGroup) {
        this.svg = svg;
        this.nodesGroup = nodesGroup;
        this.connectionsGroup = connectionsGroup;
        this.nodes = new Map();
        this.connections = new Map();
        this.selectedNode = null;
        this.isDragging = false;
        this.offset = { x: 0, y: 0 };
        
        // Set up event handlers for node interactions
        this.setupNodeInteractionHandlers();
    }

    /**
     * Set up event handlers for node interactions
     */
    setupNodeInteractionHandlers() {
        // These handlers will be attached to individual nodes
        // when they are created, but we define the methods here
        // to keep the node interaction logic in one place
    }

    /**
     * Create a new node
     * @param {number} x - X coordinate (defaults to center of viewport)
     * @param {number} y - Y coordinate (defaults to center of viewport)
     * @returns {Node} - The created node
     */
    createNode(x = window.innerWidth / 2, y = window.innerHeight / 2) {
        const nodeId = `node-${Date.now()}`;
        const node = new Node(nodeId, x, y);
        
        // Add the node element to the DOM
        this.nodesGroup.appendChild(node.element);
        
        // Set up interactions for this node
        this.setupNodeInteractions(node);
        
        // Store the node
        this.nodes.set(nodeId, node);
        
        return node;
    }

    /**
     * Set up interactions for a specific node
     * @param {Node} node - The node to set up interactions for
     */
    setupNodeInteractions(node) {
        let dragStart = null;
        
        // Handle mouse down on node (for dragging and selection)
        node.element.addEventListener('mousedown', (e) => {
            // Ignore if clicking on add-child button
            if (e.target.classList.contains('add-child')) return;
            
            this.isDragging = true;
            dragStart = {
                x: e.clientX,
                y: e.clientY
            };
            
            this.offset = {
                x: node.x - e.clientX,
                y: node.y - e.clientY
            };
            
            this.selectNode(node.id);
        });
        
        // Handle context menu on node
        node.element.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            // Trigger context menu event
            const event = new CustomEvent('node:contextmenu', {
                detail: {
                    node: node,
                    x: e.clientX,
                    y: e.clientY
                }
            });
            document.dispatchEvent(event);
            
            this.selectNode(node.id);
            
            // Prevent the context menu from being closed immediately
            e.stopPropagation();
            return false;
        });
        
        // Set up add child button
        const addChildButton = node.element.querySelector('.add-child-group');
        addChildButton.addEventListener('click', (e) => {
            e.stopPropagation();
            this.createChildNode(node);
        });
        
        // Global mouse move handler for dragging
        document.addEventListener('mousemove', (e) => {
            if (!this.isDragging || !dragStart || this.selectedNode !== node) return;
            
            const newX = e.clientX + this.offset.x;
            const newY = e.clientY + this.offset.y;
            
            // Update node position
            node.updatePosition(newX, newY);
            
            // Update connections
            this.updateNodeConnections(node);
        });
        
        // Global mouse up handler to end dragging
        document.addEventListener('mouseup', () => {
            if (this.selectedNode === node) {
                this.isDragging = false;
                dragStart = null;
            }
        });
    }

    /**
     * Create a child node for a parent node
     * @param {Node} parentNode - The parent node
     * @returns {Node} - The created child node
     */
    createChildNode(parentNode) {
        // Use the parent's createChildNode method which handles positioning
        const childNode = parentNode.createChildNode((id, x, y) => this.createNode(x, y));
        
        // Create a connection between parent and child
        this.createConnection(parentNode, childNode);
        
        return childNode;
    }

    /**
     * Create a connection between two nodes
     * @param {Node} sourceNode - Source node
     * @param {Node} targetNode - Target node
     * @returns {Connection} - The created connection
     */
    createConnection(sourceNode, targetNode) {
        const connectionId = `connection-${sourceNode.id}-${targetNode.id}`;
        const connection = new Connection(connectionId, sourceNode, targetNode);
        
        // Add the connection element to the DOM
        this.connectionsGroup.appendChild(connection.group);
        
        // Store the connection
        this.connections.set(connectionId, connection);
        
        // Set up context menu for connection
        connection.element.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            
            // Trigger connection context menu event
            const event = new CustomEvent('connection:contextmenu', {
                detail: {
                    connection: connection,
                    x: e.clientX,
                    y: e.clientY
                }
            });
            document.dispatchEvent(event);
        });
        
        return connection;
    }

    /**
     * Update all connections involving a specific node
     * @param {Node} node - The node whose connections need updating
     */
    updateNodeConnections(node) {
        this.connections.forEach(connection => {
            if (connection.involvesNode(node)) {
                connection.updatePath();
            }
        });
    }

    /**
     * Select a node by ID
     * @param {string} nodeId - ID of the node to select
     */
    selectNode(nodeId) {
        // Deselect current node if any
        if (this.selectedNode) {
            this.selectedNode.deselect();
        }
        
        // Select new node
        this.selectedNode = this.nodes.get(nodeId);
        if (this.selectedNode) {
            this.selectedNode.select();
        }
    }

    /**
     * Edit the text of a node
     * @param {Node} node - The node to edit
     */
    editNodeText(node) {
        // Create an input element for editing
        const input = document.createElement('input');
        input.type = 'text';
        input.value = node.text;
        input.style.position = 'fixed';
        input.style.left = `${node.x - 60}px`;
        input.style.top = `${node.y - 10}px`;
        input.style.width = '120px';
        
        document.body.appendChild(input);
        input.focus();
        
        // Handle blur event (when focus is lost)
        input.addEventListener('blur', () => {
            node.updateText(input.value);
            document.body.removeChild(input);
        });
        
        // Handle Enter key
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                input.blur();
            }
        });
    }

    /**
     * Edit the text of a connection
     * @param {Connection} connection - The connection to edit
     */
    editConnectionText(connection) {
        // Calculate midpoint for input positioning
        const midX = (connection.source.x + connection.target.x) / 2;
        const midY = (connection.source.y + connection.target.y) / 2;
        
        // Create an input element for editing
        const input = document.createElement('input');
        input.type = 'text';
        input.value = connection.label || '';
        input.style.position = 'fixed';
        input.style.left = `${midX - 60}px`;
        input.style.top = `${midY - 10}px`;
        input.style.width = '120px';
        
        document.body.appendChild(input);
        input.focus();
        
        // Handle blur event (when focus is lost)
        input.addEventListener('blur', () => {
            connection.updateLabel(input.value);
            document.body.removeChild(input);
        });
        
        // Handle Enter key
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                input.blur();
            }
        });
    }

    /**
     * Delete a node and its connections
     * @param {Node} node - The node to delete
     */
    deleteNode(node) {
        // Remove connections involving this node
        this.connections.forEach((connection, id) => {
            if (connection.involvesNode(node)) {
                connection.remove();
                this.connections.delete(id);
            }
        });
        
        // Update parent's children
        if (node.parent) {
            node.parent.removeChild(node);
        }
        
        // Remove node from DOM
        node.element.remove();
        
        // Remove from nodes map
        this.nodes.delete(node.id);
        
        // Clear selection if this was the selected node
        if (this.selectedNode === node) {
            this.selectedNode = null;
        }
    }

    /**
     * Clear the mind map (remove all nodes and connections)
     */
    clear() {
        // Remove all connections
        this.connections.forEach(connection => {
            connection.remove();
        });
        this.connections.clear();
        
        // Remove all nodes
        this.nodes.forEach(node => {
            node.element.remove();
        });
        this.nodes.clear();
        
        this.selectedNode = null;
    }

    /**
     * Get the data representation of the mind map
     * @returns {Object} - Data object representing the mind map
     */
    getData() {
        return {
            nodes: Array.from(this.nodes.entries()).map(([id, node]) => ({
                id,
                text: node.text,
                x: node.x,
                y: node.y,
                color: node.color,
                parentId: node.parent ? node.parent.id : null
            })),
            connections: Array.from(this.connections.entries()).map(([id, conn]) => ({
                id,
                sourceId: conn.source.id,
                targetId: conn.target.id,
                label: conn.label || ''
            }))
        };
    }

    /**
     * Load data into the mind map
     * @param {Object} data - Data object representing the mind map
     */
    loadData(data) {
        // Clear existing mind map
        this.clear();
        
        const nodeMap = new Map();
        
        // First pass: create all nodes
        data.nodes.forEach(nodeData => {
            const node = this.createNode(nodeData.x, nodeData.y);
            node.updateText(nodeData.text);
            node.updateColor(nodeData.color || '#ffffff');
            
            // Store in temporary map for second pass
            nodeMap.set(nodeData.id, {
                node,
                parentId: nodeData.parentId
            });
        });
        
        // Second pass: establish parent-child relationships and create connections
        nodeMap.forEach(({node, parentId}) => {
            if (parentId) {
                const parentData = nodeMap.get(parentId);
                if (parentData) {
                    parentData.node.addChild(node);
                    this.createConnection(parentData.node, node);
                }
            }
        });
        
        // Third pass: restore connection labels
        if (data.connections) {
            data.connections.forEach(connData => {
                const sourceNode = this.nodes.get(connData.sourceId);
                const targetNode = this.nodes.get(connData.targetId);
                
                if (sourceNode && targetNode) {
                    const connectionId = `connection-${connData.sourceId}-${connData.targetId}`;
                    const connection = this.connections.get(connectionId);
                    
                    if (connection && connData.label) {
                        connection.updateLabel(connData.label);
                    }
                }
            });
        }
    }
}

export default MindMapManager;