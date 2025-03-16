/**
 * UI Effects Module
 * Handles animations and visual effects
 */

class UIEffects {
  constructor() {
    this.activeCard = document.getElementById("active-card");
    this.cardDeck = document.getElementById("card-deck");
    this.wordDisplay = document.getElementById("word");
    this.compoundWordDisplay = document.getElementById("compound-word");
    this.timerDisplay = document.getElementById("timer");
    this.timerFill = document.getElementById("timer-fill");

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
    if (this.activeCard) this.activeCard.style.display = "none";
    if (this.cardDeck) this.cardDeck.style.display = "block";
  }

  /**
   * Show the word display
   */
  showCard() {
    if (!this.activeCard || !this.cardDeck) return;

    this.cardDeck.style.display = "none";
    this.activeCard.style.display = "block";
    this.activeCard.style.animation = "fade-in 0.5s ease-out forwards";
  }

  /**
   * Flip effect (changes the word display background)
   */
  flipCard() {
    // Highlight word backgrounds
    if (this.wordDisplay) this.wordDisplay.style.backgroundColor = "#f0f0f0";
    if (this.compoundWordDisplay)
      this.compoundWordDisplay.style.backgroundColor = "#f0f0f0";

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
    if (this.wordDisplay) this.wordDisplay.style.backgroundColor = "#fff";
    if (this.compoundWordDisplay)
      this.compoundWordDisplay.style.backgroundColor = "#fff";

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
    element.style.animation = "score-pop 1s ease-out";
  }

  /**
   * Update the timer ring visualization
   * @param {number} percentage - The percentage of time remaining (0-1)
   */
  updateTimerRing(percentage) {
    if (!this.timerFill || !this.timerDisplay) return;

    const degrees = percentage * 360;

    // Color transition from blue to red as time decreases
    const startColorR = 52,
      startColorG = 152,
      startColorB = 219;
    const endColorR = 231,
      endColorG = 76,
      endColorB = 60;

    const r = Math.round(
      startColorR + (endColorR - startColorR) * (1 - percentage)
    );
    const g = Math.round(
      startColorG + (endColorG - startColorG) * (1 - percentage)
    );
    const b = Math.round(
      startColorB + (endColorB - startColorB) * (1 - percentage)
    );

    const color = `rgb(${r}, ${g}, ${b})`;

    this.timerFill.style.background = `conic-gradient(${color} 0deg, ${color} ${degrees}deg, transparent ${degrees}deg, transparent 360deg)`;

    // Change timer text color when time is running out
    this.timerDisplay.style.color = percentage <= 0.17 ? "#e74c3c" : "#2c3e50";
  }
}

// Create global uiEffects instance
const uiEffects = new UIEffects();
window.uiEffects = uiEffects;
