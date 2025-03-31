/**
 * Manages the toolbar buttons and their actions
 */
class Toolbar {
    /**
     * Create a new toolbar manager
     * @param {HTMLElement} toolbarElement - The toolbar DOM element
     * @param {MindMapManager} mindMapManager - The mind map manager instance
     * @param {Object} storageManager - The storage manager instance
     * @param {Object} exportManager - The export manager instance
     */
    constructor(toolbarElement, mindMapManager, storageManager, exportManager) {
        this.element = toolbarElement;
        this.mindMapManager = mindMapManager;
        this.storageManager = storageManager;
        this.exportManager = exportManager;
        
        this.initializeEventListeners();
    }

    /**
     * Initialize event listeners for toolbar buttons
     */
    initializeEventListeners() {
        // New Node button
        const newNodeBtn = this.element.querySelector('#newNodeBtn');
        if (newNodeBtn) {
            newNodeBtn.addEventListener('click', () => this.createNewNode());
        }
        
        // Save button
        const saveBtn = this.element.querySelector('#saveBtn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.saveMindMap());
        }
        
        // Load button
        const loadBtn = this.element.querySelector('#loadBtn');
        if (loadBtn) {
            loadBtn.addEventListener('click', () => this.loadMindMap());
        }
        
        // Export button
        const exportBtn = this.element.querySelector('#exportBtn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportMindMap());
        }
        
        // Test Context Menu button (if present)
        const testContextMenuBtn = this.element.querySelector('#testContextMenuBtn');
        if (testContextMenuBtn) {
            testContextMenuBtn.addEventListener('click', () => this.testContextMenu());
        }
    }

    /**
     * Create a new node
     */
    createNewNode() {
        this.mindMapManager.createNode();
    }

    /**
     * Save the mind map
     */
    saveMindMap() {
        const data = this.mindMapManager.getData();
        this.storageManager.save(data);
    }

    /**
     * Load a mind map
     */
    loadMindMap() {
        const data = this.storageManager.load();
        if (data) {
            this.mindMapManager.loadData(data);
        }
    }

    /**
     * Export the mind map
     */
    exportMindMap() {
        this.exportManager.export(this.mindMapManager.svg);
    }

    /**
     * Test the context menu on the first available node
     */
    testContextMenu() {
        // Find the first node and simulate a right-click on it
        if (this.mindMapManager.nodes.size > 0) {
            const firstNode = this.mindMapManager.nodes.values().next().value;
            
            // Trigger a custom event for the context menu
            const event = new CustomEvent('node:contextmenu', {
                detail: {
                    node: firstNode,
                    x: 300,
                    y: 300
                }
            });
            document.dispatchEvent(event);
        } else {
            alert('Create a node first!');
        }
    }

    /**
     * Add a custom button to the toolbar
     * @param {string} id - Button ID
     * @param {string} text - Button text
     * @param {string} title - Button tooltip
     * @param {Function} clickHandler - Click event handler
     * @returns {HTMLButtonElement} - The created button
     */
    addButton(id, text, title, clickHandler) {
        const button = document.createElement('button');
        button.id = id;
        button.textContent = text;
        button.title = title;
        
        button.addEventListener('click', clickHandler);
        this.element.appendChild(button);
        
        return button;
    }
}

export default Toolbar;