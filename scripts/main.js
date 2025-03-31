import MindMapManager from './core/MindMapManager.js';
import ContextMenu from './components/ContextMenu.js';
import Toolbar from './components/Toolbar.js';
import PanZoomController from './components/PanZoomController.js';
import StorageManager from './storage/StorageManager.js';
import ExportManager from './storage/ExportManager.js';

/**
 * Main application class that initializes and connects all components
 */
class MindMapApp {
    /**
     * Initialize the mind map application
     */
    constructor() {
        // Get SVG elements
        this.svg = document.getElementById('mindmap');
        this.nodesGroup = document.getElementById('nodes');
        this.connectionsGroup = document.getElementById('connections');
        
        // Initialize managers
        this.initializeManagers();
        
        // Initialize components
        this.initializeComponents();
        
        // Create initial node if needed
        this.createInitialNode();
    }

    /**
     * Initialize the core managers
     */
    initializeManagers() {
        // Create mind map manager
        this.mindMapManager = new MindMapManager(
            this.svg,
            this.nodesGroup,
            this.connectionsGroup
        );
        
        // Create storage manager
        this.storageManager = new StorageManager('mindmap');
        
        // Create export manager
        this.exportManager = new ExportManager();
    }

    /**
     * Initialize UI components
     */
    initializeComponents() {
        // Get UI elements
        const toolbarElement = document.querySelector('.toolbar');
        const contextMenuElement = document.getElementById('contextMenu');
        
        // Create context menu
        this.contextMenu = new ContextMenu(contextMenuElement, this.mindMapManager);
        
        // Create toolbar
        this.toolbar = new Toolbar(
            toolbarElement,
            this.mindMapManager,
            this.storageManager,
            this.exportManager
        );
        
        // Create pan/zoom controller
        this.panZoomController = new PanZoomController(
            this.svg,
            this.nodesGroup,
            this.connectionsGroup
        );
    }

    /**
     * Create an initial node if the mind map is empty
     */
    createInitialNode() {
        // Check if we should create an initial node
        // This is useful for first-time users
        setTimeout(() => {
            if (this.mindMapManager.nodes.size === 0) {
                const node = this.mindMapManager.createNode();
                
                // Optionally show context menu for the new node
                const event = new CustomEvent('node:contextmenu', {
                    detail: {
                        node: node,
                        x: 350,
                        y: 200
                    }
                });
                document.dispatchEvent(event);
            }
        }, 1000);
    }
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const app = new MindMapApp();
});