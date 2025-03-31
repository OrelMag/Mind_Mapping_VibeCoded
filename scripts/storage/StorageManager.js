/**
 * Manages saving and loading mind maps from local storage
 */
class StorageManager {
    /**
     * Create a new storage manager
     * @param {string} storageKey - The key to use for localStorage
     */
    constructor(storageKey = 'mindmap') {
        this.storageKey = storageKey;
    }

    /**
     * Save mind map data to localStorage
     * @param {Object} data - The mind map data to save
     * @returns {boolean} - True if save was successful
     */
    save(data) {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(data));
            this.showNotification('Mind map saved successfully!');
            return true;
        } catch (error) {
            console.error('Error saving mind map:', error);
            this.showNotification('Error saving mind map!', true);
            return false;
        }
    }

    /**
     * Load mind map data from localStorage
     * @returns {Object|null} - The loaded mind map data or null if not found
     */
    load() {
        try {
            const data = localStorage.getItem(this.storageKey);
            if (!data) {
                this.showNotification('No saved mind map found!', true);
                return null;
            }
            
            const parsedData = JSON.parse(data);
            this.showNotification('Mind map loaded successfully!');
            return parsedData;
        } catch (error) {
            console.error('Error loading mind map:', error);
            this.showNotification('Error loading mind map!', true);
            return null;
        }
    }

    /**
     * Delete saved mind map data from localStorage
     * @returns {boolean} - True if deletion was successful
     */
    delete() {
        try {
            localStorage.removeItem(this.storageKey);
            this.showNotification('Mind map deleted successfully!');
            return true;
        } catch (error) {
            console.error('Error deleting mind map:', error);
            this.showNotification('Error deleting mind map!', true);
            return false;
        }
    }

    /**
     * Check if a saved mind map exists
     * @returns {boolean} - True if a saved mind map exists
     */
    hasSavedData() {
        return !!localStorage.getItem(this.storageKey);
    }

    /**
     * Show a notification to the user
     * @param {string} message - The message to show
     * @param {boolean} isError - Whether this is an error message
     */
    showNotification(message, isError = false) {
        // For now, just use alert, but this could be replaced with a nicer notification
        if (isError) {
            alert(`Error: ${message}`);
        } else {
            alert(message);
        }
    }

    /**
     * Export mind map data to a file
     * @param {Object} data - The mind map data to export
     * @param {string} filename - The filename to use
     * @returns {Promise<void>} - Promise that resolves when the file is downloaded
     */
    exportToFile(data, filename = 'mindmap.json') {
        return new Promise((resolve, reject) => {
            try {
                console.log('Exporting data:', data);
                const jsonString = JSON.stringify(data, null, 2);
                const blob = new Blob([jsonString], { type: 'application/json' });
                const url = URL.createObjectURL(blob);

                // Create link and trigger download
                const a = document.createElement('a');
                a.style.display = 'none';
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);

                // Use setTimeout to ensure the link is in the DOM
                setTimeout(() => {
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                    this.showNotification('Mind map exported successfully!');
                    resolve();
                }, 0);
            } catch (error) {
                console.error('Error exporting mind map:', error);
                this.showNotification('Error exporting mind map!', true);
                reject(error);
            }
        });
    }

    /**
     * Import mind map data from a file
     * @param {File} file - The file to import
     * @returns {Promise<Object|null>} - Promise resolving to the imported data or null on error
     */
    importFromFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (event) => {
                try {
                    const data = JSON.parse(event.target.result);
                    this.showNotification('Mind map imported successfully!');
                    resolve(data);
                } catch (error) {
                    console.error('Error parsing imported mind map:', error);
                    this.showNotification('Error importing mind map!', true);
                    reject(error);
                }
            };
            
            reader.onerror = (error) => {
                console.error('Error reading file:', error);
                this.showNotification('Error reading file!', true);
                reject(error);
            };
            
            reader.readAsText(file);
        });
    }
}

export default StorageManager;