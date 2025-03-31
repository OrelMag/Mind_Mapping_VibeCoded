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
        
        // Ensure DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initializeEventListeners());
        } else {
            this.initializeEventListeners();
        }
    }

    /**
     * Initialize event listeners for toolbar buttons
     */
    initializeEventListeners() {
        try {
            console.log('Initializing toolbar event listeners...');
            
            const buttonHandlers = {
                'newNodeBtn': this.createNewNode.bind(this),
                'saveBtn': this.saveMindMap.bind(this),
                'loadBtn': this.loadMindMap.bind(this),
                'saveToFileBtn': this.saveToFile.bind(this),
                'loadFromFileBtn': this.loadFromFile.bind(this),
                'exportBtn': this.exportMindMap.bind(this),
                'testContextMenuBtn': this.testContextMenu.bind(this)
            };

            // Set up event listeners for all buttons
            Object.entries(buttonHandlers).forEach(([id, handler]) => {
                const button = this.element.querySelector(`#${id}`);
                if (button) {
                    console.log(`Setting up handler for ${id}`);
                    button.removeEventListener('click', handler); // Remove any existing handler
                    button.addEventListener('click', (e) => {
                        console.log(`Button clicked: ${id}`);
                        e.preventDefault();
                        e.stopPropagation();
                        handler();
                    });
                } else {
                    console.error(`Button not found: #${id}`);
                }
            });

            console.log('Event listeners initialized successfully');
        } catch (error) {
            console.error('Error initializing event listeners:', error);
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
     * Save the mind map to a file
     */
    async saveToFile() {
        console.log('saveToFile called');
        try {
            const data = this.mindMapManager.getData();
            console.log('Mind map data:', data);
            if (!data.nodes || data.nodes.length === 0) {
                this.storageManager.showNotification('No mind map data to save!', true);
                return;
            }

            // Create a unique filename with timestamp
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const filename = `mindmap-${timestamp}.json`;
            
            console.log('Saving to file:', filename);
            await this.storageManager.exportToFile(data, filename);
            console.log('File save completed');
        } catch (error) {
            console.error('Error saving mind map to file:', error);
            this.storageManager.showNotification('Error saving mind map to file!', true);
        }
    }

    /**
     * Load a mind map from a file
     */
    loadFromFile() {
        console.log('loadFromFile called');
        try {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.json';
            input.style.display = 'none';
            
            // Ensure old input is removed
            const oldInput = document.querySelector('#fileInput');
            if (oldInput) {
                oldInput.remove();
            }
            
            input.id = 'fileInput';
            document.body.appendChild(input);
            
            const cleanup = () => {
                if (document.body.contains(input)) {
                    input.remove();
                }
            };
            
            input.onchange = async (e) => {
                console.log('File selected');
                const file = e.target.files[0];
                if (file) {
                    try {
                        console.log('Loading file:', file.name);
                        const data = await this.storageManager.importFromFile(file);
                        console.log('File data:', data);
                        if (data && data.nodes) {
                            this.mindMapManager.loadData(data);
                        } else {
                            this.storageManager.showNotification('Invalid mind map file!', true);
                        }
                    } catch (error) {
                        console.error('Error loading file:', error);
                        this.storageManager.showNotification('Error loading file!', true);
                    } finally {
                        cleanup();
                    }
                }
            };

            // Handle cancellation
            window.addEventListener('focus', () => {
                // Wait a bit to see if a file was selected
                setTimeout(cleanup, 1000);
            }, { once: true });
            
            console.log('Triggering file dialog');
            input.click();
        } catch (error) {
            console.error('Error in loadFromFile:', error);
            this.storageManager.showNotification('Error loading file!', true);
        }
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