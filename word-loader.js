/**
 * Word Loader Module
 * Handles loading and parsing of word lists
 */

class WordLoader {
    constructor() {
        this.wordPairs = [];
        this.fileStatus = document.getElementById("file-status");
        this.startGameBtn = document.getElementById("start-game-btn");
        this.fileInput = document.getElementById("wordlist-file");
        
        // Set up event listener
        if (this.fileInput) {
            this.fileInput.addEventListener("change", this.handleFileUpload.bind(this));
        }
        
        this.checkForWordsInterval = null;
        
        // Try to load default word list if available
        this.tryLoadDefaultWordList();
    }
    
    /**
     * Try to load the default word list (words_deDE.txt)
     */
    async tryLoadDefaultWordList() {
        try {
            const response = await fetch('words_deDE.txt');
            if (response.ok) {
                const text = await response.text();
                this.parseWordPairs(text);
                
                if (this.fileStatus) {
                    this.fileStatus.textContent = `Standard-Wortliste geladen: ${this.wordPairs.length} Wortpaare.`;
                    this.fileStatus.className = "status-message success";
                }
                
                this.enableStartButton();
                this.saveToSessionStorage();
            } else {
                console.log("No default wordlist found or not accessible.");
                this.tryLoadFromSessionStorage();
            }
        } catch (error) {
            console.log("Error loading default wordlist:", error);
            this.tryLoadFromSessionStorage();
        }
        
        // Start interval check for button status
        this.setupButtonCheck();
    }
    
    /**
     * Save word pairs to session storage
     */
    saveToSessionStorage() {
        try {
            sessionStorage.setItem('wordPairs', JSON.stringify(this.wordPairs));
            sessionStorage.setItem('wordPairsTimestamp', Date.now());
        } catch (e) {
            console.log('Could not save word list in sessionStorage:', e);
        }
    }
    
    /**
     * Try to load words from sessionStorage
     */
    tryLoadFromSessionStorage() {
        try {
            const savedPairs = sessionStorage.getItem('wordPairs');
            if (savedPairs) {
                this.wordPairs = JSON.parse(savedPairs);
                
                if (this.fileStatus) {
                    this.fileStatus.textContent = `Gespeicherte Wortliste geladen: ${this.wordPairs.length} Wortpaare.`;
                    this.fileStatus.className = "status-message success";
                }
                
                this.enableStartButton();
                return true;
            }
        } catch (e) {
            console.log('Error loading from sessionStorage:', e);
        }
        return false;
    }
    
    /**
     * Enable the start button
     */
    enableStartButton() {
        if (this.startGameBtn && this.wordPairs.length > 0) {
            this.startGameBtn.disabled = false;
            console.log('Start button enabled with', this.wordPairs.length, 'word pairs');
        } else {
            console.log('Start button could not be enabled', 
                      this.startGameBtn ? 'Button found' : 'Button not found', 
                      this.wordPairs.length, 'word pairs');
        }
    }
    
    /**
     * Set an interval to check if the button can be enabled
     */
    setupButtonCheck() {
        if (this.checkForWordsInterval) {
            clearInterval(this.checkForWordsInterval);
        }
        
        // Check every 500ms for max. 10 seconds
        let attempts = 0;
        this.checkForWordsInterval = setInterval(() => {
            attempts++;
            
            // Update button reference
            this.startGameBtn = document.getElementById("start-game-btn");
            
            if (this.wordPairs.length > 0) {
                this.enableStartButton();
            }
            
            // Maximum 20 attempts (10 seconds)
            if (attempts >= 20 || (this.startGameBtn && !this.startGameBtn.disabled)) {
                clearInterval(this.checkForWordsInterval);
                this.checkForWordsInterval = null;
            }
        }, 500);
    }
    
    /**
     * Handle file upload event
     * @param {Event} event - The file input change event
     */
    handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const fileContent = e.target.result;
                this.parseWordPairs(fileContent);
                this.saveToSessionStorage();
            } catch (error) {
                if (this.fileStatus) {
                    this.fileStatus.textContent = "Fehler beim Lesen der Datei: " + error.message;
                    this.fileStatus.className = "status-message error";
                }
            }
        };
        
        reader.onerror = () => {
            if (this.fileStatus) {
                this.fileStatus.textContent = "Fehler beim Lesen der Datei.";
                this.fileStatus.className = "status-message error";
            }
        };
        
        reader.readAsText(file);
    }
    
    /**
     * Parse text content into word pairs
     * @param {string} text - The text content to parse
     */
    parseWordPairs(text) {
        try {
            const lines = text.split("\n").filter(line => line.trim() !== "");
            const pairs = [];

            for (const line of lines) {
                const parts = line.split(";");
                if (parts.length === 2) {
                    const compound = parts[0].trim();
                    const simple = parts[1].trim();
                    if (compound && simple) {
                        pairs.push({ compound, simple });
                    }
                }
            }

            if (pairs.length === 0) {
                throw new Error("Keine gültigen Wortpaare gefunden.");
            }

            this.wordPairs = pairs;
            
            if (this.fileStatus) {
                this.fileStatus.textContent = `${pairs.length} Wortpaare geladen.`;
                this.fileStatus.className = "status-message success";
            }
            
            this.enableStartButton();
        } catch (error) {
            if (this.fileStatus) {
                this.fileStatus.textContent = "Fehler beim Parsen: " + error.message;
                this.fileStatus.className = "status-message error";
            }
        }
    }
    
    /**
     * Get the loaded word pairs
     * @returns {Array} The loaded word pairs
     */
    getWordPairs() {
        return this.wordPairs;
    }
}

// Create global wordLoader instance
const wordLoader = new WordLoader();
window.wordLoader = wordLoader;