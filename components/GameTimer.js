/**
 * GameTimer Component
 * Manages the countdown timer for game rounds
 */
export class GameTimer {
    /**
     * Create a new GameTimer instance
     * @param {HTMLElement} timerDisplay - DOM element to display timer value
     * @param {HTMLElement} timerFill - DOM element for timer fill effect
     * @param {number} initialTime - Initial time in seconds
     * @param {Function} onTimeEnd - Callback when timer reaches zero
     */
    constructor(timerDisplay, timerFill, initialTime, onTimeEnd) {
        this.timerDisplay = timerDisplay;
        this.timerFill = timerFill;
        this.totalTime = initialTime;
        this.timeLeft = initialTime;
        this.onTimeEnd = onTimeEnd;
        this.timer = null;
        this.isRunning = false;

        // Initial update
        this.updateDisplay();
    }

    /**
     * Start the timer
     */
    start() {
        if (this.isRunning) return;

        // Clear any existing interval to prevent duplicates
        this.stop();

        this.isRunning = true;

        // Initial update to ensure display is correct
        this.updateDisplay();

        this.timer = setInterval(() => {
            this.timeLeft--;
            this.updateDisplay();

            if (this.timeLeft <= 0) {
                this.stop();
                if (this.onTimeEnd) this.onTimeEnd();
            }
        }, 1000);
    }

    /**
     * Stop the timer
     */
    stop() {
        clearInterval(this.timer);
        this.isRunning = false;
    }

    /**
     * Reset timer to initial or specified time
     * @param {number} [newTime] - New time in seconds
     */
    reset(newTime) {
        this.stop();

        // Ensure we have a valid time
        if (newTime !== undefined) {
            this.timeLeft = Math.max(0, newTime);
        } else {
            this.timeLeft = Math.max(0, this.totalTime);
        }

        // Update display immediately after reset
        this.updateDisplay();
    }

    /**
     * Update timer display and visual effects
     */
    updateDisplay() {
        if (this.timerDisplay) {
            // Ensure we display a valid number
            const timeToDisplay = Math.max(0, Math.round(this.timeLeft));
            this.timerDisplay.innerText = timeToDisplay;

            // Apply warning color when time is running low
            const isWarning = timeToDisplay <= 10;
            this.timerDisplay.style.color = isWarning ? "#e74c3c" : "#2c3e50";
        }

        // Update the timer ring visualization with safety check
        const percentage = Math.max(0, Math.min(1, this.timeLeft / this.totalTime));
        this.updateTimerRing(percentage);
    }

    /**
     * Update the timer ring visualization
     * @param {number} percentage - The percentage of time remaining (0-1)
     */
    updateTimerRing(percentage) {
        if (!this.timerFill) return;

        // Fix for potential NaN or invalid percentage
        if (isNaN(percentage) || percentage < 0) percentage = 0;
        if (percentage > 1) percentage = 1;

        const degrees = Math.round(percentage * 360);

        // Color transition from blue to red as time decreases
        const startColorR = 52,
            startColorG = 152,
            startColorB = 219;
        const endColorR = 231,
            endColorG = 76,
            endColorB = 60;

        const r = Math.round(startColorR + (endColorR - startColorR) * (1 - percentage));
        const g = Math.round(startColorG + (endColorG - startColorG) * (1 - percentage));
        const b = Math.round(startColorB + (endColorB - startColorB) * (1 - percentage));

        const color = `rgb(${r}, ${g}, ${b})`;

        try {
            // Modern browsers support
            this.timerFill.style.background = `conic-gradient(${color} 0deg, ${color} ${degrees}deg, transparent ${degrees}deg, transparent 360deg)`;

            // Fallback for browsers that don't support conic-gradient
            if (this.timerFill.style.background === '') {
                this.useAlternativeVisualization(percentage, color);
            }
        } catch (e) {
            console.error("Error updating timer ring:", e);
            this.useAlternativeVisualization(percentage, color);
        }
    }

    /**
     * Alternative timer visualization for browsers without conic-gradient support
     * @param {number} percentage - The percentage of time remaining (0-1)
     * @param {string} color - The color to use
     */
    useAlternativeVisualization(percentage, color) {
        if (!this.timerFill) return;

        // Create a circular progress indicator using clip-path
        const clipPercentage = percentage * 100;
        this.timerFill.style.background = color;
        this.timerFill.style.clipPath = `polygon(50% 50%, 50% 0%, ${clipPercentage >= 25 ? '100% 0%' : `${50 + 50 * Math.tan(percentage * Math.PI / 2)}% 0%`}${clipPercentage >= 25 ? `, 100% ${clipPercentage >= 50 ? '100%' : `${50 * Math.tan((percentage - 0.25) * Math.PI)}%`}` : ''
            }${clipPercentage >= 50 ? `, ${clipPercentage >= 75 ? '0%' : `${100 - 50 * Math.tan((percentage - 0.5) * Math.PI)}%`} 100%` : ''
            }${clipPercentage >= 75 ? `, 0% ${100 - 50 * Math.tan((percentage - 0.75) * Math.PI)}%` : ''
            })`;
    }

    /**
     * Set event handler for when timer ends
     * @param {Function} callback - Function to call when timer ends
     */
    setOnTimeEnd(callback) {
        this.onTimeEnd = callback;
    }

    /**
     * Get current time left
     * @returns {number} Time left in seconds
     */
    getTimeLeft() {
        return this.timeLeft;
    }

    /**
     * Check if timer is currently running
     * @returns {boolean} True if timer is running
     */
    isActive() {
        return this.isRunning;
    }
}
