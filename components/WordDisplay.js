/**
 * WordDisplay Component
 * Displays the current word pair
 */
export class WordDisplay {
    /**
     * Create a new WordDisplay instance
     * @param {HTMLElement} cardDeck - DOM element for card deck
     * @param {HTMLElement} activeCard - DOM element for active card
     * @param {HTMLElement} wordElement - DOM element for simple word
     * @param {HTMLElement} compoundWordElement - DOM element for compound word
     */
    constructor(cardDeck, activeCard, wordElement, compoundWordElement) {
        this.cardDeck = cardDeck;
        this.activeCard = activeCard;
        this.wordElement = wordElement;
        this.compoundWordElement = compoundWordElement;

        // Current word pair
        this.currentWordPair = null;
    }

    /**
     * Show the card deck (hide active card)
     */
    showDeck() {
        if (this.activeCard) this.activeCard.style.display = 'none';
        if (this.cardDeck) this.cardDeck.style.display = 'block';
    }

    /**
     * Show the active card (hide deck)
     */
    showCard() {
        if (!this.activeCard || !this.cardDeck) return;

        this.cardDeck.style.display = 'none';
        this.activeCard.style.display = 'block';
        this.activeCard.style.animation = 'fade-in 0.5s ease-out forwards';
    }

    /**
     * Set the current word pair
     * @param {Object} wordPair - Word pair object with simple and compound properties
     */
    setWordPair(wordPair) {
        this.currentWordPair = wordPair;

        // Display the word with animation
        this.animateText(this.wordElement, wordPair.simple);
        this.animateText(this.compoundWordElement, wordPair.compound);

        // Show the card
        this.showCard();
    }

    /**
     * Animate text with fade-in effect
     * @param {HTMLElement} element - Element to animate
     * @param {string} text - Text to display
     */
    animateText(element, text) {
        if (!element) return;

        element.textContent = text;

        // Animate the element
        element.style.opacity = '0';
        element.style.transform = 'translateY(5px)';

        // Trigger animation
        setTimeout(() => {
            element.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }, 10);
    }

    /**
     * Flip effect (highlight word backgrounds)
     */
    flipCard() {
        // Highlight word backgrounds
        if (this.wordElement) this.wordElement.style.backgroundColor = '#f0f0f0';
        if (this.compoundWordElement) this.compoundWordElement.style.backgroundColor = '#f0f0f0';

        // Highlight labels
        const labels = document.querySelectorAll('.word-label');
        labels.forEach(label => {
            label.style.color = '#3498db';
        });
    }

    /**
     * Reset card display (un-flip)
     */
    resetCard() {
        // Reset word backgrounds
        if (this.wordElement) this.wordElement.style.backgroundColor = '#fff';
        if (this.compoundWordElement) this.compoundWordElement.style.backgroundColor = '#fff';

        // Reset labels
        const labels = document.querySelectorAll('.word-label');
        labels.forEach(label => {
            label.style.color = '#777';
        });
    }

    /**
     * Get the current word pair
     * @returns {Object} Current word pair
     */
    getCurrentWordPair() {
        return this.currentWordPair;
    }
}