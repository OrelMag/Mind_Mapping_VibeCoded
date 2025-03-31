class MindMap {
    constructor() {
        this.svg = document.getElementById('mindmap');
        this.nodesGroup = document.getElementById('nodes');
        this.connectionsGroup = document.getElementById('connections');
        this.nodes = new Map();
        this.connections = new Map();
        this.selectedNode = null;
        this.isDragging = false;
        this.offset = { x: 0, y: 0 };
        
        this.initializeEventListeners();
        this.initializePanZoom();
    }

    initializeEventListeners() {
        // Toolbar buttons
        document.getElementById('newNodeBtn').addEventListener('click', () => this.createNode());
        document.getElementById('saveBtn').addEventListener('click', () => this.save());
        document.getElementById('loadBtn').addEventListener('click', () => this.load());
        document.getElementById('exportBtn').addEventListener('click', () => this.export());
        
        // Test context menu button
        document.getElementById('testContextMenuBtn').addEventListener('click', () => {
            // Find the first node and simulate a right-click on it
            if (this.nodes.size > 0) {
                const firstNode = this.nodes.values().next().value;
                this.showContextMenu(firstNode, 300, 300);
            } else {
                alert('Create a node first!');
            }
        });

        // Context menu
        const contextMenu = document.getElementById('contextMenu');
        document.addEventListener('click', () => contextMenu.style.display = 'none');
        
        // Prevent default context menu
        document.addEventListener('contextmenu', (e) => {
            // Only prevent default if it's not on a node (nodes have their own contextmenu handler)
            if (!e.target.closest('.node')) {
                e.preventDefault();
                contextMenu.style.display = 'none';
            }
        });
        
        // Context menu actions
        contextMenu.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent event from bubbling up
            
            const action = e.target.dataset.action;
            const color = e.target.dataset.color;
            
            // If clicking on the custom color button
            if (action === 'customColor') {
                const customColor = document.getElementById('customColorInput').value;
                if (customColor && this.selectedNode) {
                    const rect = this.selectedNode.element.querySelector('rect');
                    rect.setAttribute('fill', customColor);
                    // Store the color in the node data
                    this.selectedNode.color = customColor;
                    contextMenu.style.display = 'none';
                }
                return;
            }
            
            if ((!action && !color) || !this.selectedNode) return;

            switch (action) {
                case 'edit':
                    this.editNodeText(this.selectedNode);
                    break;
                case 'addChild':
                    this.createChildNode(this.selectedNode);
                    break;
                case 'delete':
                    this.deleteNode(this.selectedNode);
                    break;
                case 'color':
                    if (color) {
                        const rect = this.selectedNode.element.querySelector('rect');
                        rect.setAttribute('fill', color);
                        // Store the color in the node data
                        this.selectedNode.color = color;
                    }
                    break;
                case 'editConnection':
                    // Find the selected connection
                    this.connections.forEach(conn => {
                        if (conn.source === this.selectedNode || conn.target === this.selectedNode) {
                            this.editConnectionText(conn);
                        }
                    });
                    break;
            }
            contextMenu.style.display = 'none';
        });
    }

    initializePanZoom() {
        let isPanning = false;
        let startPoint = { x: 0, y: 0 };
        let currentTranslate = { x: 0, y: 0 };

        this.svg.addEventListener('mousedown', (e) => {
            if (e.target === this.svg || e.target === this.nodesGroup || e.target === this.connectionsGroup) {
                isPanning = true;
                startPoint = {
                    x: e.clientX - currentTranslate.x,
                    y: e.clientY - currentTranslate.y
                };
            }
        });

        document.addEventListener('mousemove', (e) => {
            if (!isPanning) return;
            
            currentTranslate = {
                x: e.clientX - startPoint.x,
                y: e.clientY - startPoint.y
            };

            this.nodesGroup.style.transform = `translate(${currentTranslate.x}px, ${currentTranslate.y}px)`;
            this.connectionsGroup.style.transform = `translate(${currentTranslate.x}px, ${currentTranslate.y}px)`;
        });

        document.addEventListener('mouseup', () => {
            isPanning = false;
        });
    }

    createNode(x = window.innerWidth / 2, y = window.innerHeight / 2) {
        const nodeId = `node-${Date.now()}`;
        const nodeGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        nodeGroup.setAttribute('class', 'node');
        nodeGroup.setAttribute('id', nodeId);

        const nodeRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        nodeRect.setAttribute('width', '120');
        nodeRect.setAttribute('height', '40');
        nodeRect.setAttribute('x', x - 60);
        nodeRect.setAttribute('y', y - 20);
        nodeRect.setAttribute('fill', '#ffffff'); // Default color

        const nodeText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        nodeText.setAttribute('x', x);
        nodeText.setAttribute('y', y + 5);
        nodeText.setAttribute('text-anchor', 'middle');
        nodeText.textContent = 'New Node';

        const addChildButton = this.createAddChildButton(x + 55, y);

        nodeGroup.appendChild(nodeRect);
        nodeGroup.appendChild(nodeText);
        nodeGroup.appendChild(addChildButton);
        this.nodesGroup.appendChild(nodeGroup);

        this.setupNodeInteractions(nodeGroup);
        
        const nodeData = {
            element: nodeGroup,
            text: 'New Node',
            x: x,
            y: y,
            children: new Set(),
            parent: null,
            color: '#ffffff' // Store default color
        };
        
        this.nodes.set(nodeId, nodeData);
        return nodeData;
    }

    createAddChildButton(x, y) {
        const button = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        button.setAttribute('class', 'add-child');
        button.setAttribute('cx', x);
        button.setAttribute('cy', y);
        button.setAttribute('r', '8');
        
        const plus = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        plus.setAttribute('x', x);
        plus.setAttribute('y', y + 5);
        plus.setAttribute('text-anchor', 'middle');
        plus.setAttribute('fill', 'white');
        plus.setAttribute('pointer-events', 'none');
        plus.textContent = '+';

        const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        group.setAttribute('class', 'add-child-group');
        group.appendChild(button);
        group.appendChild(plus);

        group.addEventListener('click', (e) => {
            e.stopPropagation();
            const parentNode = this.nodes.get(group.parentNode.id);
            this.createChildNode(parentNode);
        });

        return group;
    }

    createChildNode(parentNode) {
        const angle = Math.random() * Math.PI * 2;
        const distance = 150;
        const x = parentNode.x + Math.cos(angle) * distance;
        const y = parentNode.y + Math.sin(angle) * distance;

        const childNode = this.createNode(x, y);
        childNode.parent = parentNode;
        parentNode.children.add(childNode);

        this.createConnection(parentNode, childNode);
    }

    createConnection(sourceNode, targetNode) {
        const connectionId = `connection-${sourceNode.element.id}-${targetNode.element.id}`;
        const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        group.setAttribute('class', 'connection-group');
        
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('class', 'connection');
        path.setAttribute('id', connectionId);
        
        const textBackground = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        textBackground.setAttribute('class', 'connection-text-background');
        
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('class', 'connection-text');
        text.textContent = '';
        
        group.appendChild(path);
        group.appendChild(textBackground);
        group.appendChild(text);
        this.connectionsGroup.appendChild(group);
        
        this.updateConnectionPath(path, sourceNode, targetNode, text, textBackground);

        const connectionData = {
            element: path,
            group: group,
            text: text,
            textBackground: textBackground,
            source: sourceNode,
            target: targetNode,
            label: ''
        };

        this.connections.set(connectionId, connectionData);
        
        path.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this.editConnectionText(connectionData);
        });
    }

    updateConnectionPath(path, sourceNode, targetNode, text, textBackground) {
        const dx = targetNode.x - sourceNode.x;
        const dy = targetNode.y - sourceNode.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx) * 180 / Math.PI;
        
        const controlPoint1 = {
            x: sourceNode.x + dx / 3,
            y: sourceNode.y + dy / 3
        };
        
        const controlPoint2 = {
            x: sourceNode.x + dx * 2 / 3,
            y: sourceNode.y + dy * 2 / 3
        };

        const pathData = `M ${sourceNode.x} ${sourceNode.y} 
                         C ${controlPoint1.x} ${controlPoint1.y},
                           ${controlPoint2.x} ${controlPoint2.y},
                           ${targetNode.x} ${targetNode.y}`;
        
        path.setAttribute('d', pathData);

        // Always update the position of text elements, even if they're empty
        const midX = sourceNode.x + dx / 2;
        const midY = sourceNode.y + dy / 2;
        
        if (text) {
            text.setAttribute('x', midX);
            text.setAttribute('y', midY);
            text.setAttribute('transform', `rotate(${angle}, ${midX}, ${midY})`);
            text.setAttribute('text-anchor', 'middle');
            text.setAttribute('alignment-baseline', 'middle');
        }
        
        if (textBackground) {
            textBackground.textContent = text ? text.textContent : '';
            textBackground.setAttribute('x', midX);
            textBackground.setAttribute('y', midY);
            textBackground.setAttribute('transform', `rotate(${angle}, ${midX}, ${midY})`);
            textBackground.setAttribute('text-anchor', 'middle');
            textBackground.setAttribute('alignment-baseline', 'middle');
        }
    }

    setupNodeInteractions(nodeGroup) {
        let dragStart = null;

        nodeGroup.addEventListener('mousedown', (e) => {
            if (e.target.classList.contains('add-child')) return;
            
            this.isDragging = true;
            dragStart = {
                x: e.clientX,
                y: e.clientY
            };

            const nodeData = this.nodes.get(nodeGroup.id);
            this.offset = {
                x: nodeData.x - e.clientX,
                y: nodeData.y - e.clientY
            };

            this.selectNode(nodeGroup.id);
        });

        nodeGroup.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            const contextMenu = document.getElementById('contextMenu');
            contextMenu.style.display = 'block';
            contextMenu.style.left = `${e.clientX}px`;
            contextMenu.style.top = `${e.clientY}px`;
            
            const colorSubmenu = contextMenu.querySelector('.color-submenu');
            if (colorSubmenu) {
                colorSubmenu.querySelectorAll('li').forEach(li => {
                    const color = li.dataset.color;
                    if (color) {
                        li.style.setProperty('--color', color);
                    }
                });
            }
            
            this.selectNode(nodeGroup.id);
            
            // Prevent the context menu from being closed immediately
            e.stopPropagation();
            return false;
        });

        document.addEventListener('mousemove', (e) => {
            if (!this.isDragging || !dragStart) return;

            const nodeData = this.nodes.get(nodeGroup.id);
            const newX = e.clientX + this.offset.x;
            const newY = e.clientY + this.offset.y;

            nodeData.x = newX;
            nodeData.y = newY;

            const rect = nodeGroup.querySelector('rect');
            const text = nodeGroup.querySelector('text');
            const addChildGroup = nodeGroup.querySelector('.add-child-group');
            const addChildCircle = addChildGroup.querySelector('circle');
            const addChildText = addChildGroup.querySelector('text');

            rect.setAttribute('x', newX - 60);
            rect.setAttribute('y', newY - 20);
            text.setAttribute('x', newX);
            text.setAttribute('y', newY + 5);
            addChildCircle.setAttribute('cx', newX + 55);
            addChildCircle.setAttribute('cy', newY);
            addChildText.setAttribute('x', newX + 55);
            addChildText.setAttribute('y', newY + 5);

            // Update connections
            this.connections.forEach(conn => {
                if (conn.source === nodeData || conn.target === nodeData) {
                    this.updateConnectionPath(conn.element, conn.source, conn.target, conn.text, conn.textBackground);
                }
            });
        });

        document.addEventListener('mouseup', () => {
            this.isDragging = false;
            dragStart = null;
        });
    }

    selectNode(nodeId) {
        if (this.selectedNode) {
            this.selectedNode.element.classList.remove('selected');
        }
        this.selectedNode = this.nodes.get(nodeId);
        this.selectedNode.element.classList.add('selected');
    }

    editNodeText(nodeData) {
        const text = nodeData.element.querySelector('text');
        const input = document.createElement('input');
        input.type = 'text';
        input.value = nodeData.text;
        input.style.position = 'fixed';
        input.style.left = `${nodeData.x - 60}px`;
        input.style.top = `${nodeData.y - 10}px`;
        input.style.width = '120px';
        
        document.body.appendChild(input);
        input.focus();
        
        input.addEventListener('blur', () => {
            nodeData.text = input.value;
            text.textContent = input.value;
            document.body.removeChild(input);
        });
        
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                input.blur();
            }
        });
    }

    editConnectionText(connectionData) {
        const input = document.createElement('input');
        input.type = 'text';
        input.value = connectionData.label || '';
        
        const midX = (connectionData.source.x + connectionData.target.x) / 2;
        const midY = (connectionData.source.y + connectionData.target.y) / 2;
        
        input.style.position = 'fixed';
        input.style.left = `${midX - 60}px`;
        input.style.top = `${midY - 10}px`;
        input.style.width = '120px';
        
        document.body.appendChild(input);
        input.focus();
        
        input.addEventListener('blur', () => {
            connectionData.label = input.value;
            connectionData.text.textContent = input.value;
            connectionData.textBackground.textContent = input.value;
            this.updateConnectionPath(
                connectionData.element,
                connectionData.source,
                connectionData.target,
                connectionData.text,
                connectionData.textBackground
            );
            document.body.removeChild(input);
        });
        
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                input.blur();
            }
        });
    }

    deleteNode(nodeData) {
        // Remove connections
        this.connections.forEach((conn, id) => {
            if (conn.source === nodeData || conn.target === nodeData) {
                conn.element.remove();
                this.connections.delete(id);
            }
        });

        // Update parent's children
        if (nodeData.parent) {
            nodeData.parent.children.delete(nodeData);
        }

        // Remove node
        nodeData.element.remove();
        this.nodes.delete(nodeData.element.id);
        this.selectedNode = null;
    }

    save() {
        const data = {
            nodes: Array.from(this.nodes.entries()).map(([id, node]) => ({
                id,
                text: node.text,
                x: node.x,
                y: node.y,
                color: node.color || '#ffffff',
                parentId: node.parent ? node.parent.element.id : null
            })),
            connections: Array.from(this.connections.entries()).map(([id, conn]) => ({
                sourceId: conn.source.element.id,
                targetId: conn.target.element.id,
                label: conn.label || ''
            }))
        };
        
        localStorage.setItem('mindmap', JSON.stringify(data));
        alert('Mind map saved successfully!');
    }

    load() {
        const data = localStorage.getItem('mindmap');
        if (!data) {
            alert('No saved mind map found!');
            return;
        }

        // Clear current mind map
        this.nodes.forEach(node => node.element.remove());
        this.connections.forEach(conn => conn.element.remove());
        this.nodes.clear();
        this.connections.clear();

        // Load saved data
        const savedData = JSON.parse(data);
        const nodeMap = new Map();

        // First pass: create all nodes
        savedData.nodes.forEach(nodeData => {
            const node = this.createNode(nodeData.x, nodeData.y);
            node.text = nodeData.text;
            node.color = nodeData.color || '#ffffff';
            node.element.querySelector('text').textContent = nodeData.text;
            node.element.querySelector('rect').setAttribute('fill', node.color);
            nodeMap.set(nodeData.id, {
                node,
                parentId: nodeData.parentId
            });
        });

        // Second pass: establish parent-child relationships
        nodeMap.forEach(({node, parentId}) => {
            if (parentId) {
                const parentData = nodeMap.get(parentId);
                if (parentData) {
                    node.parent = parentData.node;
                    parentData.node.children.add(node);
                    this.createConnection(parentData.node, node);
                }
            }
        });

        // Restore connection labels if available
        if (savedData.connections) {
            savedData.connections.forEach(connData => {
                const sourceNode = this.nodes.get(connData.sourceId);
                const targetNode = this.nodes.get(connData.targetId);
                if (sourceNode && targetNode) {
                    const connectionId = `connection-${connData.sourceId}-${connData.targetId}`;
                    const connection = this.connections.get(connectionId);
                    if (connection && connData.label) {
                        connection.label = connData.label;
                        connection.text.textContent = connData.label;
                        connection.textBackground.textContent = connData.label;
                        this.updateConnectionPath(
                            connection.element,
                            connection.source,
                            connection.target,
                            connection.text,
                            connection.textBackground
                        );
                    }
                }
            });
        }
    }

    export() {
        const svg = this.svg.cloneNode(true);
        const serializer = new XMLSerializer();
        const svgString = serializer.serializeToString(svg);
        const blob = new Blob([svgString], {type: 'image/svg+xml'});
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'mindmap.svg';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
    
    showContextMenu(nodeData, x, y) {
        console.log('showContextMenu called', nodeData, x, y);
        
        // Select the node
        this.selectNode(nodeData.element.id);
        console.log('Node selected', this.selectedNode);
        
        // Show the context menu at a fixed position in the center of the screen
        const contextMenu = document.getElementById('contextMenu');
        console.log('Context menu element', contextMenu);
        
        // Position in the center of the screen
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;
        const menuWidth = 200; // Approximate width of the menu
        const menuHeight = 200; // Approximate height of the menu
        
        const left = (screenWidth - menuWidth) / 2;
        const top = (screenHeight - menuHeight) / 2;
        
        contextMenu.style.display = 'block';
        contextMenu.style.left = `${left}px`;
        contextMenu.style.top = `${top}px`;
        console.log('Context menu positioned at', left, top);
        
        // Set up the color swatches
        const colorSubmenu = contextMenu.querySelector('.color-submenu');
        const colorMenu = contextMenu.querySelector('.color-menu');
        
        if (colorSubmenu) {
            colorSubmenu.querySelectorAll('li').forEach(li => {
                const color = li.dataset.color;
                if (color) {
                    li.style.setProperty('--color', color);
                }
            });
            console.log('Color swatches set up');
            
            // Add active class to show the submenu
            if (colorMenu) {
                colorMenu.classList.add('active');
            }
        }
        
        // Ensure the context menu is visible by setting a high z-index and other styles
        contextMenu.style.zIndex = '2000';
        contextMenu.style.backgroundColor = 'white';
        contextMenu.style.border = '2px solid #333';
        contextMenu.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.5)';
    }
}

// Initialize the mind map when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const mindMap = new MindMap();
    
    // Create a node and show the context menu automatically for testing
    setTimeout(() => {
        if (mindMap.nodes.size === 0) {
            const node = mindMap.createNode();
            mindMap.showContextMenu(node, 350, 200);
        }
    }, 1000);
});