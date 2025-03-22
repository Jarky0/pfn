/**
 * GameTimer Component
 * Manages the countdown timer for game rounds with a bar display
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

        // Initialize the timer bar with full width
        if (this.timerFill) {
            this.timerFill.style.width = "100%";
            console.log("Timer bar initialized with full width");
        }

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
            this.totalTime = Math.max(0, newTime); // Aktualisiere auch totalTime
            this.timeLeft = Math.max(0, newTime);
        } else {
            this.timeLeft = Math.max(0, this.totalTime);
        }

        // Always set the timer fill to 100% on reset
        if (this.timerFill) {
            this.timerFill.style.width = "100%";
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

            // Apply warning class when time is running low
            const isWarning = timeToDisplay <= 10;

            if (isWarning) {
                this.timerDisplay.classList.add('timer--warning');
            } else {
                this.timerDisplay.classList.remove('timer--warning');
            }
        }

        // Update the timer bar visualization with safety check
        const percentage = Math.max(0, Math.min(1, this.timeLeft / this.totalTime));
        this.updateTimerBar(percentage);
    }

    /**
     * Update the timer bar visualization
     * @param {number} percentage - The percentage of time remaining (0-1)
     */
    updateTimerBar(percentage) {
        if (!this.timerFill) {
            console.warn("Timer fill element not found");
            return;
        }

        // Fix for potential NaN or invalid percentage
        if (isNaN(percentage) || percentage < 0) percentage = 0;
        if (percentage > 1) percentage = 1;

        // Explicitly set width based on percentage
        this.timerFill.style.width = `${percentage * 100}%`;

        // Apply warning styling when under 10 seconds
        if (this.timeLeft <= 10) {
            this.timerFill.classList.add('timer-fill--warning');
        } else {
            this.timerFill.classList.remove('timer-fill--warning');
        }
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