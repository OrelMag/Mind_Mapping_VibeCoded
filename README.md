# Mind Mapping Tool

A web-based mind mapping application that allows users to create, edit, and organize thoughts and ideas visually.

## Features

- Create and edit nodes with custom text
- Connect nodes with labeled relationships
- Drag and drop nodes to organize
- Pan and zoom functionality
- Context menu for node operations
- Color customization for nodes
- Save/load mind maps locally
- Export functionality

## Project Structure

```
scripts/
├── components/         # UI Components
│   ├── ContextMenu.js
│   ├── Toolbar.js
│   └── PanZoomController.js
├── core/              # Core Mind Map Logic
│   ├── Node.js
│   ├── Connection.js
│   └── MindMapManager.js
├── storage/           # Data Persistence
│   ├── StorageManager.js
│   └── ExportManager.js
├── utils/             # Utility Functions
│   ├── GeometryUtils.js
│   └── SVGUtils.js
└── main.js           # Entry Point

styles/
└── main.css          # Styles

index.html            # Main HTML
```

## Getting Started

1. Clone the repository
2. Open `index.html` in a modern web browser
3. Start creating your mind map!

## Usage

- Click "New Node" to create a root node
- Use the "+" button on nodes to create child nodes
- Right-click nodes for additional options:
  - Edit text
  - Add child node
  - Change color
  - Delete node
- Drag nodes to reposition
- Save your work using the Save button
- Load previously saved mind maps
- Export your mind maps

## Browser Compatibility

Tested and working in modern versions of:
- Chrome
- Firefox
- Safari
- Edge

## License

MIT License