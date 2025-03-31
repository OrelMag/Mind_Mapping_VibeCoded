# File Operations Implementation Plan

## Overview
Add file save/load functionality to allow users to save their mind maps to files and load them back.

## UI Changes
Add two new buttons to the toolbar in `index.html`:
```html
<button id="saveToFileBtn" title="Save Mind Map to File">Save to File</button>
<button id="loadFromFileBtn" title="Load Mind Map from File">Load from File</button>
```

## Code Changes

### 1. Toolbar.js Updates
Add new methods to handle file operations:
```javascript
// Add file operation methods
saveToFile() {
    const data = this.mindMapManager.getData();
    this.storageManager.exportToFile(data);
}

loadFromFile() {
    // Create file input element
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            try {
                const data = await this.storageManager.importFromFile(file);
                if (data) {
                    this.mindMapManager.loadData(data);
                }
            } catch (error) {
                console.error('Error loading file:', error);
            }
        }
    };
    
    input.click();
}
```

Add event listeners in `initializeEventListeners()`:
```javascript
// File operation buttons
const saveToFileBtn = this.element.querySelector('#saveToFileBtn');
if (saveToFileBtn) {
    saveToFileBtn.addEventListener('click', () => this.saveToFile());
}

const loadFromFileBtn = this.element.querySelector('#loadFromFileBtn');
if (loadFromFileBtn) {
    loadFromFileBtn.addEventListener('click', () => this.loadFromFile());
}
```

## Implementation Steps

1. Switch to Code mode
2. Update index.html to add new buttons
3. Update Toolbar.js to add new methods and event listeners
4. Test functionality:
   - Create a mind map
   - Save to file
   - Create a new mind map
   - Load the saved file
   - Verify all nodes, connections, and their properties are preserved

## Sequence Diagram
```mermaid
sequenceDiagram
    participant UI as Toolbar Buttons 
    participant TB as Toolbar Class
    participant MM as MindMapManager
    participant SM as StorageManager
    
    %% Save Flow
    UI->>TB: Click "Save to File"
    TB->>MM: getData()
    MM-->>TB: mindMapData
    TB->>SM: exportToFile(mindMapData)
    SM-->>UI: File Download Dialog
    
    %% Load Flow
    UI->>TB: Click "Load from File"
    UI->>SM: File Upload Dialog
    SM->>SM: importFromFile()
    SM->>TB: parsedData
    TB->>MM: loadData(parsedData)
    MM-->>UI: Update Mind Map View