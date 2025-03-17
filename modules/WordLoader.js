/**
 * Word Loader Module
 * Handles loading and parsing of word lists
 */
export class WordLoader {
    /**
     * Create a WordLoader instance
     */
    constructor() {
        this.defaultWordPairs = [];     // Standard word list
        this.customWordPairs = [];      // Custom user-uploaded word list
        this.defaultProbability = 50;   // Default probability (%) to draw from standard list

        // Cache DOM selectors
        this.elements = {
            fileStatus: document.getElementById("file-status"),
            startGameBtn: document.getElementById("start-game-btn"),
            fileInput: document.getElementById("wordlist-file"),
            probabilitySlider: document.getElementById("word-probability"),
            probContainer: document.querySelector(".word-list-prob"),
            percentageDisplay: document.getElementById("percentage-display"),
            listInfoDisplay: document.getElementById("list-info-display")
        };

        // Set up event listeners
        if (this.elements.fileInput) {
            this.elements.fileInput.addEventListener("change", this.handleFileUpload.bind(this));
        }

        if (this.elements.probabilitySlider) {
            this.elements.probabilitySlider.addEventListener("input", this.handleProbabilityChange.bind(this));
        }

        this.checkForWordsInterval = null;
    }

    /**
     * Initialize word loader with default words or from storage
     */
    init() {
        // Try to load default word list if available
        this.tryLoadDefaultWordList();
    }

    /**
     * Try to load the default word list (words_deDE.txt)
     */
    async tryLoadDefaultWordList() {
        try {
            const response = await fetch("words_deDE.txt");
            if (response.ok) {
                const text = await response.text();
                this.parseDefaultWordPairs(text);

                if (this.elements.fileStatus) {
                    this.elements.fileStatus.textContent = `Standard-Wortliste geladen: ${this.defaultWordPairs.length} Wortpaare.`;
                    this.elements.fileStatus.className = "status-message success";
                }

                this.enableStartButton();
                this.saveToSessionStorage();
                this.updateListInfoDisplay();
            } else {
                console.log("Keine Standard-Wortliste gefunden oder nicht zugänglich.");
                this.tryLoadFromSessionStorage();
            }
        } catch (error) {
            console.log("Fehler beim Laden der Standard-Wortliste:", error);
            this.tryLoadFromSessionStorage();
        }

        // Start interval check for button status
        this.setupButtonCheck();
    }

    /**
     * Handle changes to the probability slider
     * @param {Event} event - The input event
     */
    handleProbabilityChange(event) {
        this.defaultProbability = parseInt(event.target.value) || 0;

        // Update the displayed percentage
        if (this.elements.percentageDisplay) {
            this.elements.percentageDisplay.textContent = `${this.defaultProbability}% Standard / ${100 - this.defaultProbability}% Eigene`;
        }

        // Update list information display
        this.updateListInfoDisplay();

        // Save the current setting
        this.saveToSessionStorage();
    }

    /**
     * Update the list information display
     */
    updateListInfoDisplay() {
        if (!this.elements.listInfoDisplay) return;

        const defaultCount = this.defaultWordPairs.length;
        const customCount = this.customWordPairs.length;

        // Show/hide probability slider based on whether custom list exists
        if (this.elements.probContainer) {
            if (customCount > 0 && defaultCount > 0) {
                this.elements.probContainer.classList.remove("hide");
            } else {
                this.elements.probContainer.classList.add("hide");
            }
        }

        if (defaultCount === 0 && customCount === 0) {
            this.elements.listInfoDisplay.textContent = "Keine Wortlisten verfügbar";
            return;
        }

        let infoText = "";

        if (defaultCount > 0) {
            infoText += `Standard: ${defaultCount} Wörter`;
        }

        if (defaultCount > 0 && customCount > 0) {
            infoText += " | ";
        }

        if (customCount > 0) {
            infoText += `Eigene: ${customCount} Wörter`;
        }

        // Add status info
        if (defaultCount > 0 && customCount === 0) {
            infoText += "\nNur Standard-Wörter verfügbar";
        } else if (defaultCount === 0 && customCount > 0) {
            infoText += "\nNur eigene Wörter verfügbar";
        }

        this.elements.listInfoDisplay.textContent = infoText;
    }

    /**
     * Get a random word pair based on current probability settings
     * @returns {Object|null} A randomly selected word pair or null if no words available
     */
    getRandomWordPair() {
        // Check if we have any words available
        const hasDefaultWords = this.defaultWordPairs.length > 0;
        const hasCustomWords = this.customWordPairs.length > 0;

        if (!hasDefaultWords && !hasCustomWords) {
            console.log("Keine Wortpaare verfügbar");
            return null;
        }

        // If only one list has words, use that one
        if (!hasDefaultWords) {
            return this.getRandomFromList(this.customWordPairs);
        }

        if (!hasCustomWords) {
            return this.getRandomFromList(this.defaultWordPairs);
        }

        // Both lists have words, use probability to choose
        const random = Math.random() * 100;

        if (random < this.defaultProbability) {
            return this.getRandomFromList(this.defaultWordPairs);
        } else {
            return this.getRandomFromList(this.customWordPairs);
        }
    }

    /**
     * Get a random word pair from a specific list
     * @param {Array} list - The list to select from
     * @returns {Object} A randomly selected word pair
     */
    getRandomFromList(list) {
        const randomIndex = Math.floor(Math.random() * list.length);
        return list[randomIndex];
    }

    /**
     * Save word pairs to session storage
     */
    saveToSessionStorage() {
        try {
            sessionStorage.setItem("defaultWordPairs", JSON.stringify(this.defaultWordPairs));
            sessionStorage.setItem("customWordPairs", JSON.stringify(this.customWordPairs));
            sessionStorage.setItem("defaultProbability", this.defaultProbability);
            sessionStorage.setItem("wordPairsTimestamp", Date.now());
        } catch (e) {
            console.log(
                "Wortlisten konnten nicht im sessionStorage gespeichert werden:",
                e
            );
        }
    }

    /**
     * Try to load words from sessionStorage
     */
    tryLoadFromSessionStorage() {
        try {
            const savedDefaultPairs = sessionStorage.getItem("defaultWordPairs");
            const savedCustomPairs = sessionStorage.getItem("customWordPairs");
            const savedProbability = sessionStorage.getItem("defaultProbability");

            if (savedDefaultPairs) {
                this.defaultWordPairs = JSON.parse(savedDefaultPairs);
            }

            if (savedCustomPairs) {
                this.customWordPairs = JSON.parse(savedCustomPairs);
            }

            if (savedProbability) {
                this.defaultProbability = parseInt(savedProbability);

                // Update the slider if it exists
                if (this.elements.probabilitySlider) {
                    this.elements.probabilitySlider.value = this.defaultProbability;
                }

                // Update the displayed percentage
                if (this.elements.percentageDisplay) {
                    this.elements.percentageDisplay.textContent = `${this.defaultProbability}% Standard / ${100 - this.defaultProbability}% Eigene`;
                }
            }

            if ((this.defaultWordPairs.length > 0 || this.customWordPairs.length > 0) && this.elements.fileStatus) {
                const defaultCount = this.defaultWordPairs.length;
                const customCount = this.customWordPairs.length;

                this.elements.fileStatus.textContent = `Wortlisten geladen: ${defaultCount} Standard / ${customCount} Eigene Wortpaare.`;
                this.elements.fileStatus.className = "status-message success";

                this.enableStartButton();
                this.updateListInfoDisplay();
                return true;
            }
        } catch (e) {
            console.log("Fehler beim Laden aus sessionStorage:", e);
        }
        return false;
    }

    /**
     * Enable the start button
     */
    enableStartButton() {
        if (this.elements.startGameBtn && (this.defaultWordPairs.length > 0 || this.customWordPairs.length > 0)) {
            this.elements.startGameBtn.disabled = false;
            console.log(
                "Start-Button aktiviert mit",
                this.defaultWordPairs.length,
                "Standard-Wortpaaren und",
                this.customWordPairs.length,
                "eigenen Wortpaaren"
            );
        } else {
            console.log(
                "Start-Button konnte nicht aktiviert werden",
                this.elements.startGameBtn ? "Button gefunden" : "Button nicht gefunden",
                this.defaultWordPairs.length,
                "Standard-Wortpaare",
                this.customWordPairs.length,
                "eigene Wortpaare"
            );
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
            this.elements.startGameBtn = document.getElementById("start-game-btn");

            if (this.defaultWordPairs.length > 0 || this.customWordPairs.length > 0) {
                this.enableStartButton();
            }

            // Maximum 20 attempts (10 seconds)
            if (
                attempts >= 20 ||
                (this.elements.startGameBtn && !this.elements.startGameBtn.disabled)
            ) {
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
                this.parseCustomWordPairs(fileContent);
                this.saveToSessionStorage();
                this.updateListInfoDisplay();
            } catch (error) {
                if (this.elements.fileStatus) {
                    this.elements.fileStatus.textContent =
                        "Fehler beim Lesen der Datei: " + error.message;
                    this.elements.fileStatus.className = "status-message error";
                }
            }
        };

        reader.onerror = () => {
            if (this.elements.fileStatus) {
                this.elements.fileStatus.textContent = "Fehler beim Lesen der Datei.";
                this.elements.fileStatus.className = "status-message error";
            }
        };

        reader.readAsText(file);
    }

    /**
     * Parse text content into default word pairs
     * @param {string} text - The text content to parse
     */
    parseDefaultWordPairs(text) {
        try {
            const lines = text.split("\n").filter((line) => line.trim() !== "");
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
                throw new Error("Keine gültigen Wortpaare in der Standardliste gefunden.");
            }

            this.defaultWordPairs = pairs;
        } catch (error) {
            console.error("Fehler beim Parsen der Standardliste:", error.message);
        }
    }

    /**
     * Parse text content into custom word pairs
     * @param {string} text - The text content to parse
     */
    parseCustomWordPairs(text) {
        try {
            const lines = text.split("\n").filter((line) => line.trim() !== "");
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
                throw new Error("Keine gültigen Wortpaare in der hochgeladenen Datei gefunden.");
            }

            this.customWordPairs = pairs;

            if (this.elements.fileStatus) {
                this.elements.fileStatus.textContent = `${pairs.length} eigene Wortpaare geladen.`;
                this.elements.fileStatus.className = "status-message success";
            }

            this.enableStartButton();

            // Show probability slider when both lists are available
            if (this.defaultWordPairs.length > 0 && this.elements.probContainer) {
                this.elements.probContainer.classList.remove("hide");
            }
        } catch (error) {
            if (this.elements.fileStatus) {
                this.elements.fileStatus.textContent = "Fehler beim Parsen: " + error.message;
                this.elements.fileStatus.className = "status-message error";
            }
        }
    }

    /**
     * Check if any word lists are available
     * @returns {boolean} True if at least one word list is available
     */
    hasWords() {
        return this.defaultWordPairs.length > 0 || this.customWordPairs.length > 0;
    }

    /**
     * Get counts of available word pairs
     * @returns {Object} Object with counts of default and custom word pairs
     */
    getWordCounts() {
        return {
            defaultCount: this.defaultWordPairs.length,
            customCount: this.customWordPairs.length,
            total: this.defaultWordPairs.length + this.customWordPairs.length
        };
    }
}