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

        clearInterval(this.timer);
        this.isRunning = true;

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
        this.timeLeft = newTime !== undefined ? newTime : this.totalTime;
        this.updateDisplay();
    }

    /**
     * Update timer display and visual effects
     */
    updateDisplay() {
        if (this.timerDisplay) {
            this.timerDisplay.innerText = this.timeLeft;
            this.timerDisplay.style.color = this.timeLeft <= 10 ? "#e74c3c" : "#2c3e50";
        }

        this.updateTimerRing(this.timeLeft / this.totalTime);
    }

    /**
     * Update the timer ring visualization
     * @param {number} percentage - The percentage of time remaining (0-1)
     */
    updateTimerRing(percentage) {
        if (!this.timerFill) return;

        const degrees = percentage * 360;

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

        this.timerFill.style.background = `conic-gradient(${color} 0deg, ${color} ${degrees}deg, transparent ${degrees}deg, transparent 360deg)`;
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