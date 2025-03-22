/**
 * UI Effects Module
 * Handles animations and visual effects
 */
export class UIEffects {
    /**
     * Create a UIEffects instance
     */
    constructor() {
        // Cache DOM elements
        this.elements = {
            activeCard: document.getElementById("active-card"),
            cardDeck: document.getElementById("card-deck"),
            wordDisplay: document.getElementById("word"),
            compoundWordDisplay: document.getElementById("compound-word"),
            timerDisplay: document.getElementById("timer"),
            timerFill: document.getElementById("timer-fill")
        };

        // Create confetti for game over screen
        this.createConfetti();

        // Add title animation on load
        this.animateTitle();
    }

    /**
     * Animate the title on page load
     */
    animateTitle() {
        const title = document.querySelector("h1");
        if (!title) return;

        // Add a subtle animation
        title.style.opacity = "0";
        title.style.transform = "translateY(-20px)";

        setTimeout(() => {
            title.style.transition = "opacity 1s ease, transform 1s ease";
            title.style.opacity = "1";
            title.style.transform = "translateY(0)";
        }, 300);
    }

    /**
     * Create confetti elements for the game over screen
     */
    createConfetti() {
        const gameOverScreen = document.getElementById("game-over");
        if (!gameOverScreen) return;

        const confettiCount = 30;
        const colors = [
            "#f39c12",
            "#3498db",
            "#2ecc71",
            "#e74c3c",
            "#9b59b6",
            "#1abc9c",
        ];

        for (let i = 0; i < confettiCount; i++) {
            const confetti = document.createElement("div");
            confetti.className = "confetti";

            // Random position, color and animation
            confetti.style.left = Math.random() * 100 + "%";
            confetti.style.top = "-10px";
            confetti.style.animationDelay = Math.random() * 4 + "s";

            // Random color
            confetti.style.backgroundColor =
                colors[Math.floor(Math.random() * colors.length)];

            // Random size
            const size = Math.random() * 8 + 4;
            confetti.style.width = size + "px";
            confetti.style.height = size + "px";

            gameOverScreen.appendChild(confetti);
        }
    }

    /**
     * Display text with a fade-in effect
     * @param {HTMLElement} element - The element to animate
     * @param {string} text - The text to display
     */
    animateText(element, text) {
        if (!element) return;

        element.textContent = text;

        // Animate the element
        element.style.opacity = "0";
        element.style.transform = "translateY(5px)";

        // Trigger animation
        setTimeout(() => {
            element.style.transition = "opacity 0.3s ease, transform 0.3s ease";
            element.style.opacity = "1";
            element.style.transform = "translateY(0)";
        }, 10);
    }

    /**
     * Hide the word display
     */
    hideCard() {
        if (this.elements.activeCard) this.elements.activeCard.style.display = "none";
        if (this.elements.cardDeck) this.elements.cardDeck.style.display = "block";
    }

    /**
     * Show the word display
     */
    showCard() {
        if (!this.elements.activeCard || !this.elements.cardDeck) return;

        this.elements.cardDeck.style.display = "none";
        this.elements.activeCard.style.display = "block";
        this.elements.activeCard.style.animation = "fade-in 0.5s ease-out forwards";
    }

    /**
     * Flip effect (changes the word display background)
     */
    flipCard() {
        // Highlight word backgrounds
        if (this.elements.wordDisplay) this.elements.wordDisplay.style.backgroundColor = "#f0f0f0";
        if (this.elements.compoundWordDisplay)
            this.elements.compoundWordDisplay.style.backgroundColor = "#f0f0f0";

        // Highlight labels
        const labels = document.querySelectorAll(".word-label");
        labels.forEach((label) => {
            label.style.color = "#3498db";
        });
    }

    /**
     * Unflip effect (resets the word display)
     */
    unflipCard() {
        // Reset word backgrounds
        if (this.elements.wordDisplay) this.elements.wordDisplay.style.backgroundColor = "#fff";
        if (this.elements.compoundWordDisplay)
            this.elements.compoundWordDisplay.style.backgroundColor = "#fff";

        // Reset labels
        const labels = document.querySelectorAll(".word-label");
        labels.forEach((label) => {
            label.style.color = "#777";
        });
    }

    /**
     * Show a score change animation
     * @param {number} teamIndex - The team index (0-based)
     * @param {number} points - The points to display
     */
    showScoreChange(teamIndex, points) {
        const element = document.getElementById(`team${teamIndex}-score-change`);
        if (!element) return;

        element.textContent = points > 0 ? `+${points}` : points;
        element.className =
            "score-change " + (points >= 0 ? "positive" : "negative");

        // Reset animation
        element.style.animation = "none";
        element.offsetHeight; // Trigger reflow
        element.style.animation = "score-float-up 1s ease-out";
    }

    /**
     * Update the timer bar visualization
     * @param {number} percentage - The percentage of time remaining (0-1)
     */
    updateTimerBar(percentage) {
        if (!this.elements.timerFill) {
            console.warn("Timer fill element not found");
            return;
        }

        // Fix for potential NaN or invalid percentage
        if (isNaN(percentage) || percentage < 0) percentage = 0;
        if (percentage > 1) percentage = 1;

        // Set width based on percentage
        this.elements.timerFill.style.width = `${percentage * 100}%`;

        // Apply warning styling when under 10 seconds
        const isWarning = percentage <= 0.17; // etwa 10 Sekunden bei 60 Sekunden Gesamtzeit

        if (isWarning) {
            this.elements.timerFill.classList.add('timer-fill--warning');
            if (this.elements.timerDisplay) {
                this.elements.timerDisplay.classList.add('timer--warning');
            }
        } else {
            this.elements.timerFill.classList.remove('timer-fill--warning');
            if (this.elements.timerDisplay) {
                this.elements.timerDisplay.classList.remove('timer--warning');
            }
        }
    }
}