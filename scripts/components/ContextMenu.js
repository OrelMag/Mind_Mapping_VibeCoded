/**
 * Manages the context menu for nodes and connections
 */
class ContextMenu {
    /**
     * Create a new context menu manager
     * @param {HTMLElement} contextMenuElement - The context menu DOM element
     * @param {MindMapManager} mindMapManager - The mind map manager instance
     */
    constructor(contextMenuElement, mindMapManager) {
        this.element = contextMenuElement;
        this.mindMapManager = mindMapManager;
        this.isVisible = false;
        
        this.initializeEventListeners();
    }

    /**
     * Initialize event listeners for the context menu
     */
    initializeEventListeners() {
        // Hide context menu on document click
        document.addEventListener('click', () => {
            this.hide();
        });
        
        // Prevent default context menu on document
        document.addEventListener('contextmenu', (e) => {
            // Only prevent default if it's not on a node (nodes have their own contextmenu handler)
            if (!e.target.closest('.node') && !e.target.closest('.connection')) {
                e.preventDefault();
                this.hide();
            }
        });
        
        // Listen for node context menu events
        document.addEventListener('node:contextmenu', (e) => {
            const { node, x, y } = e.detail;
            this.showForNode(node, x, y);
        });
        
        // Listen for connection context menu events
        document.addEventListener('connection:contextmenu', (e) => {
            const { connection, x, y } = e.detail;
            this.showForConnection(connection, x, y);
        });
        
        // Handle context menu actions
        this.element.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent event from bubbling up
            
            const action = e.target.dataset.action;
            const color = e.target.dataset.color;
            
            // If clicking on the custom color button
            if (action === 'customColor') {
                const customColor = document.getElementById('customColorInput').value;
                if (customColor && this.mindMapManager.selectedNode) {
                    this.mindMapManager.selectedNode.updateColor(customColor);
                    this.hide();
                }
                return;
            }
            
            if ((!action && !color) || !this.mindMapManager.selectedNode) return;
            
            this.handleAction(action, color);
            this.hide();
        });
    }

    /**
     * Handle a context menu action
     * @param {string} action - The action to perform
     * @param {string} color - The color (for color change actions)
     */
    handleAction(action, color) {
        const selectedNode = this.mindMapManager.selectedNode;
        
        switch (action) {
            case 'edit':
                this.mindMapManager.editNodeText(selectedNode);
                break;
                
            case 'addChild':
                this.mindMapManager.createChildNode(selectedNode);
                break;
                
            case 'delete':
                this.mindMapManager.deleteNode(selectedNode);
                break;
                
            case 'color':
                if (color) {
                    selectedNode.updateColor(color);
                }
                break;
                
            case 'editConnection':
                // Find connections involving the selected node
                this.mindMapManager.connections.forEach(conn => {
                    if (conn.involvesNode(selectedNode)) {
                        this.mindMapManager.editConnectionText(conn);
                    }
                });
                break;
        }
    }

    /**
     * Show the context menu for a node
     * @param {Node} node - The node
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     */
    showForNode(node, x, y) {
        // Position the menu
        this.element.style.display = 'block';
        this.element.style.left = `${x}px`;
        this.element.style.top = `${y}px`;
        
        // Set up color swatches
        const colorSubmenu = this.element.querySelector('.color-submenu');
        if (colorSubmenu) {
            colorSubmenu.querySelectorAll('li').forEach(li => {
                const color = li.dataset.color;
                if (color) {
                    li.style.setProperty('--color', color);
                }
            });
        }
        
        // Show all menu items
        this.element.querySelectorAll('li').forEach(item => {
            item.style.display = 'block';
        });
        
        this.isVisible = true;
    }

    /**
     * Show the context menu for a connection
     * @param {Connection} connection - The connection
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     */
    showForConnection(connection, x, y) {
        // Position the menu
        this.element.style.display = 'block';
        this.element.style.left = `${x}px`;
        this.element.style.top = `${y}px`;
        
        // Hide irrelevant menu items, only show edit connection
        this.element.querySelectorAll('li').forEach(item => {
            if (item.dataset.action === 'editConnection') {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });
        
        // Store the connection for editing
        this.currentConnection = connection;
        
        this.isVisible = true;
    }

    /**
     * Show the context menu at a specific position
     * @param {Node} node - The node to show the menu for
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     */
    show(node, x, y) {
        this.showForNode(node, x, y);
    }

    /**
     * Hide the context menu
     */
    hide() {
        this.element.style.display = 'none';
        this.isVisible = false;
        this.currentConnection = null;
    }

    /**
     * Toggle the context menu visibility
     * @param {Node} node - The node to show the menu for
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     */
    toggle(node, x, y) {
        if (this.isVisible) {
            this.hide();
        } else {
            this.show(node, x, y);
        }
    }
}

export default ContextMenu;