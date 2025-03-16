/**
 * Game Logic Module
 * Handles the core game functionality
 */

class GameLogic {
  constructor() {
    // Default words as fallback
    this.defaultWords = [
      { compound: "Hausboot", simple: "Boot" },
      { compound: "Spielfeld", simple: "Feld" },
      { compound: "Waldweg", simple: "Weg" },
      { compound: "Tischlampe", simple: "Lampe" },
      { compound: "Sonnenlicht", simple: "Licht" },
      { compound: "Buchseite", simple: "Seite" },
      { compound: "Regenmantel", simple: "Mantel" },
      { compound: "Fußball", simple: "Ball" },
      { compound: "Apfelbaum", simple: "Baum" },
      { compound: "Türschloss", simple: "Schloss" },
    ];

    // Initialize game state with teams array
    this.gameState = {
      teams: [
        { name: "Team 1", score: 0 },
        { name: "Team 2", score: 0 },
      ],
      currentTeamIndex: 0,
      roundTime: 60,
      targetScore: 20,
      timer: null,
      timeLeft: 60,
      currentWordPair: null,
      usedWordPairs: [],
      roundActive: false,
      gameOver: false,
      targetScoreReached: false,
      targetReachedByTeam: -1, // Index of the team that first reached target score (-1 means none)
    };

    // Statistics tracking variables
    this.isTracking = false;
    this.roundStartTime = null;

    // Get DOM elements
    this.getGameElements();
  }

  /**
   * Get all required game DOM elements
   */
  getGameElements() {
    // DOM elements for game screens
    this.mainMenu = document.getElementById("main-menu");
    this.gamePlay = document.getElementById("game-play");
    this.gameOver = document.getElementById("game-over");

    // DOM elements for current team display
    this.currentTeamDisplay = document.getElementById("current-team");

    // DOM elements for game controls
    this.timerDisplay = document.getElementById("timer");
    this.startRoundBtn = document.getElementById("start-round-btn");
    this.endRoundBtn = document.getElementById("end-round-btn");
    this.pointBtn = document.getElementById("point-btn");
    this.compoundBtn = document.getElementById("compound-btn");
    this.skipBtn = document.getElementById("skip-btn");

    // Scoreboard container
    this.scoreboard = document.getElementById("scoreboard");

    // Use uiEffects for UI operations if available
    this.uiEffects = window.uiEffects || {
      showCard: () => {
        const activeCard = document.getElementById("active-card");
        const cardDeck = document.getElementById("card-deck");
        if (activeCard) activeCard.style.display = "block";
        if (cardDeck) cardDeck.style.display = "none";
      },

      hideCard: () => {
        const activeCard = document.getElementById("active-card");
        const cardDeck = document.getElementById("card-deck");
        if (activeCard) activeCard.style.display = "none";
        if (cardDeck) cardDeck.style.display = "block";
      },

      flipCard: () => {
        const wordDisplay = document.getElementById("word");
        const compoundWordDisplay = document.getElementById("compound-word");
        if (wordDisplay) wordDisplay.style.backgroundColor = "#f0f0f0";
        if (compoundWordDisplay)
          compoundWordDisplay.style.backgroundColor = "#f0f0f0";
      },

      animateText: (element, text) => {
        if (element) element.textContent = text;
      },

      updateTimerRing: (percentage) => {
        const timerFill = document.getElementById("timer-fill");
        if (!timerFill) return;

        const degrees = percentage * 360;
        const r = Math.round(52 + (231 - 52) * (1 - percentage));
        const g = Math.round(152 + (76 - 152) * (1 - percentage));
        const b = Math.round(219 + (60 - 219) * (1 - percentage));

        const color = `rgb(${r}, ${g}, ${b})`;
        timerFill.style.background = `conic-gradient(${color} 0deg, ${color} ${degrees}deg, transparent ${degrees}deg, transparent 360deg)`;
      },

      showScoreChange: (teamIndex, points) => {
        const element = document.getElementById(
          `team${teamIndex}-score-change`
        );
        if (!element) return;

        element.textContent = points > 0 ? `+${points}` : points;
        element.className =
          "score-change " + (points >= 0 ? "positive" : "negative");

        element.style.animation = "none";
        element.offsetHeight; // Trigger reflow
        element.style.animation = "score-pop 1s ease-out";
      },
    };
  }

  /**
   * Initialize a new game with teams
   */
  initGame() {
    console.log("Initialisiere Spiel");

    // Reset used word pairs
    this.gameState.usedWordPairs = [];

    // Get teams from team chips
    const teamChips = document.querySelectorAll(".team-chip");
    this.gameState.teams = [];

    console.log(`${teamChips.length} Teams gefunden`);

    // Create teams from chips
    if (teamChips.length > 0) {
      teamChips.forEach((chip, index) => {
        const teamName = chip.dataset.teamName || `Team ${index + 1}`;
        const teamColor = chip.style.backgroundColor;

        this.gameState.teams.push({
          name: teamName,
          score: 0,
          color: teamColor,
        });

        console.log(`Team erstellt: ${teamName} mit Farbe ${teamColor}`);
      });
    } else {
      console.log("Keine Team-Chips gefunden, erstelle Standardteams");
    }

    // Ensure we have at least 2 teams
    if (this.gameState.teams.length < 2) {
      this.gameState.teams = [
        { name: "Team 1", score: 0, color: "#e6194B" },
        { name: "Team 2", score: 0, color: "#3cb44b" },
      ];
      console.log("Standardteams erstellt: Team 1 und Team 2");
    }

    // Get game settings
    const roundTimeInput = document.getElementById("round-time");
    const targetScoreInput = document.getElementById("target-score");

    this.gameState.roundTime = roundTimeInput
      ? parseInt(roundTimeInput.value) || 60
      : 60;
    this.gameState.targetScore = targetScoreInput
      ? parseInt(targetScoreInput.value) || 20
      : 20;

    // Reset game state
    this.gameState.currentTeamIndex = 0;
    this.gameState.timeLeft = this.gameState.roundTime;
    this.gameState.roundActive = false;
    this.gameState.gameOver = false;
    this.gameState.targetScoreReached = false;
    this.gameState.targetReachedByTeam = -1;
    this.gameState.timer = null;

    // Generate scoreboard
    this.generateScoreboard();

    // Update UI
    this.updateScoreDisplay();
    this.updateTeamDisplay();

    if (this.timerDisplay) {
      this.timerDisplay.innerText = this.gameState.timeLeft;
    }

    this.uiEffects.updateTimerRing(1); // Reset timer ring

    // Show game play screen
    if (this.mainMenu) this.mainMenu.classList.add("hide");
    if (this.gamePlay) this.gamePlay.classList.remove("hide");
    if (this.gameOver) this.gameOver.classList.add("hide");

    // Update button states
    if (this.startRoundBtn) this.startRoundBtn.classList.remove("hide");
    if (this.endRoundBtn) this.endRoundBtn.classList.add("hide");

    this.updateButtonStates(false);

    // Hide card
    this.uiEffects.hideCard();

    // Start tracking game statistics if available
    if (window.gameStatistics) {
      window.gameStatistics.startTracking(this.gameState);
      console.log("Spielstatistik-Tracking gestartet");
    }
  }

  /**
   * Update game control button states
   * @param {boolean} roundActive - Whether a round is currently active
   */
  updateButtonStates(roundActive) {
    if (this.pointBtn) this.pointBtn.disabled = !roundActive;
    if (this.compoundBtn) this.compoundBtn.disabled = !roundActive;
    if (this.skipBtn) this.skipBtn.disabled = !roundActive;
    if (this.startRoundBtn) this.startRoundBtn.disabled = roundActive;
    if (this.endRoundBtn) this.endRoundBtn.disabled = !roundActive;
  }

  /**
   * Generate scoreboard based on number of teams
   */
  generateScoreboard() {
    if (!this.scoreboard) return;

    // Clear existing scoreboard
    this.scoreboard.innerHTML = "";

    // Add class for team count (for CSS styling without :has() selector)
    const teamCount = this.gameState.teams.length;
    this.scoreboard.className = `scoreboard teams-${teamCount}`;

    // Add team score displays
    this.gameState.teams.forEach((team, index) => {
      const teamScoreDiv = document.createElement("div");
      teamScoreDiv.className = "team-score";
      teamScoreDiv.id = `team${index}-score-display`;

      // Set team background color
      if (team.color) {
        teamScoreDiv.style.backgroundColor = team.color;

        // Use dark text color for light backgrounds
        if (team.color.includes("#42d4f4") || team.color.includes("#f3c300")) {
          teamScoreDiv.style.color = "#333";
        }
      }

      const teamNameDiv = document.createElement("div");
      teamNameDiv.className = "team-name-display";
      teamNameDiv.id = `team${index}-name-display`;
      teamNameDiv.innerText = team.name;

      const scoreNumberDiv = document.createElement("div");
      scoreNumberDiv.className = "score-number";
      scoreNumberDiv.id = `team${index}-score-number`;
      scoreNumberDiv.innerText = "0";

      const scoreChangeDiv = document.createElement("div");
      scoreChangeDiv.className = "score-change";
      scoreChangeDiv.id = `team${index}-score-change`;

      teamScoreDiv.appendChild(teamNameDiv);
      teamScoreDiv.appendChild(scoreNumberDiv);
      teamScoreDiv.appendChild(scoreChangeDiv);

      this.scoreboard.appendChild(teamScoreDiv);
    });
  }

  /**
   * Update the team display to show the current team
   */
  updateTeamDisplay() {
    if (!this.currentTeamDisplay) return;

    const currentTeam = this.gameState.teams[this.gameState.currentTeamIndex];
    let teamText = `${currentTeam.name} ist dran`;

    // Show hint for last attempt
    if (
      this.gameState.targetScoreReached &&
      this.gameState.targetReachedByTeam !== this.gameState.currentTeamIndex
    ) {
      teamText += " (Letzte Chance aufzuholen!)";
    }

    this.currentTeamDisplay.innerText = teamText;

    // Remove active class from all teams
    this.gameState.teams.forEach((_, index) => {
      const teamScoreDisplay = document.getElementById(
        `team${index}-score-display`
      );
      if (teamScoreDisplay) {
        teamScoreDisplay.classList.remove("active");
      }
    });

    // Add active class to current team
    const currentTeamScoreDisplay = document.getElementById(
      `team${this.gameState.currentTeamIndex}-score-display`
    );
    if (currentTeamScoreDisplay) {
      currentTeamScoreDisplay.classList.add("active");
    }
  }

  /**
   * Update the score display for all teams
   */
  updateScoreDisplay() {
    this.gameState.teams.forEach((team, index) => {
      const scoreElement = document.getElementById(`team${index}-score-number`);
      if (scoreElement) {
        scoreElement.innerText = team.score;
      }
    });
  }

  /**
   * Select a new random word from wordLoader
   */
  selectNewWord() {
    // Check if wordLoader is available and has words
    if (window.wordLoader && window.wordLoader.hasWords()) {
      let newWordPair = null;
      let attempts = 0;
      const maxAttempts = 100; // Limit attempts to prevent infinite loop

      // Try to get a word that hasn't been used in this game session
      while (attempts < maxAttempts) {
        newWordPair = window.wordLoader.getRandomWordPair();

        // If no word was returned or we've exhausted all possible words, exit loop
        if (!newWordPair || this.gameState.usedWordPairs.length >= window.wordLoader.getWordCounts().total) {
          break;
        }

        // Check if this word has already been used this session
        const isUsed = this.gameState.usedWordPairs.some(
          usedPair =>
            usedPair.compound === newWordPair.compound &&
            usedPair.simple === newWordPair.simple
        );

        if (!isUsed) {
          // Found a new word, break out of loop
          break;
        }

        attempts++;
      }

      // If we couldn't find a new word or no words are available, reset used words
      if (!newWordPair || attempts >= maxAttempts) {
        console.log("Alle Wörter verwendet, setze zurück");
        this.gameState.usedWordPairs = [];
        newWordPair = window.wordLoader.getRandomWordPair();
      }

      // If we still don't have a word, use fallback
      if (!newWordPair) {
        console.log("Kein Wort gefunden, verwende Fallback-Wörter");
        const randomIndex = Math.floor(Math.random() * this.defaultWords.length);
        newWordPair = this.defaultWords[randomIndex];
      }

      // Store the current word
      this.gameState.currentWordPair = newWordPair;

      // Add to used words
      this.gameState.usedWordPairs.push(newWordPair);
    } else {
      // Fallback to default words if wordLoader is not available
      console.log("Kein wordLoader gefunden, verwende Fallback-Wörter");
      const randomIndex = Math.floor(Math.random() * this.defaultWords.length);
      this.gameState.currentWordPair = this.defaultWords[randomIndex];
    }

    // Show the card
    this.uiEffects.showCard();

    // Display the word with animation
    const wordPair = this.gameState.currentWordPair;
    this.uiEffects.animateText(
      document.getElementById("word"),
      wordPair.simple
    );
    this.uiEffects.animateText(
      document.getElementById("compound-word"),
      wordPair.compound
    );
  }

  /**
   * Start the game timer
   */
  startTimer() {
    clearInterval(this.gameState.timer);
    const totalTime = this.gameState.roundTime;

    this.gameState.timer = setInterval(() => {
      this.gameState.timeLeft--;

      if (this.timerDisplay) {
        this.timerDisplay.innerText = this.gameState.timeLeft;
      }

      const percentage = this.gameState.timeLeft / totalTime;
      this.uiEffects.updateTimerRing(percentage);

      if (this.gameState.timeLeft <= 0) {
        clearInterval(this.gameState.timer);
        this.endRound();
      }
    }, 1000);

    this.uiEffects.updateTimerRing(1);
  }

  /**
   * Start a new round
   */
  startRound() {
    // If the game is already over, do nothing
    if (this.gameState.gameOver) {
      console.log(
        "Spiel ist bereits beendet, Runde kann nicht gestartet werden"
      );
      return;
    }

    this.gameState.roundActive = true;

    // Select a new word and show card
    this.selectNewWord();

    // Enable control buttons
    this.updateButtonStates(true);

    // Show end round button
    if (this.startRoundBtn) this.startRoundBtn.classList.add("hide");
    if (this.endRoundBtn) {
      this.endRoundBtn.classList.remove("hide");
      this.endRoundBtn.disabled = false;
    }

    // Reset timer if necessary
    this.gameState.timeLeft = this.gameState.roundTime;

    if (this.timerDisplay) {
      this.timerDisplay.innerText = this.gameState.timeLeft;
      this.timerDisplay.style.color = "#2c3e50";
    }

    // Start the timer
    this.startTimer();

    // Start tracking round statistics
    this.roundStartTime = Date.now(); // Track when the round started

    // Start tracking round statistics if available
    if (window.gameStatistics) {
      window.gameStatistics.startRound(this.gameState.currentTeamIndex);
      console.log(`Started round tracking for team ${this.gameState.currentTeamIndex}`);
    }
    else {
      console.log("Cannot start statistics tracking - gameStatistics not available");
    }
  }

  /**
   * End the current round (when timer reaches 0)
   */
  endRound() {
    clearInterval(this.gameState.timer);
    this.gameState.roundActive = false;

    this.updateButtonStates(false);
    if (this.endRoundBtn) this.endRoundBtn.disabled = false;

    if (this.timerDisplay) {
      this.timerDisplay.innerText = "0";
      this.timerDisplay.style.color = "#e74c3c";
    }

    // Flip the card
    this.uiEffects.flipCard();
  }

  /**
   * End current round and switch teams (when end round button is clicked)
   */
  endCurrentRound() {
    clearInterval(this.gameState.timer);
    this.gameState.roundActive = false;

    // End round tracking for statistics
    if (window.gameStatistics) {
      window.gameStatistics.endRound();
      console.log("Rundenstatistik-Tracking beendet");
    }

    // Disable control buttons
    this.updateButtonStates(false);
    if (this.endRoundBtn) this.endRoundBtn.classList.add("hide");

    // Check if the game should end
    if (this.shouldEndGame()) {
      this.endGame();
      return;
    }

    // Switch to next team
    const teamCount = this.gameState.teams.length;
    this.gameState.currentTeamIndex =
      (this.gameState.currentTeamIndex + 1) % teamCount;
    this.updateTeamDisplay();

    // Show start round button
    if (this.startRoundBtn) this.startRoundBtn.classList.remove("hide");

    // Hide card
    this.uiEffects.hideCard();

    // Reset timer
    this.gameState.timeLeft = this.gameState.roundTime;

    if (this.timerDisplay) {
      this.timerDisplay.innerText = this.gameState.timeLeft;
      this.timerDisplay.style.color = "#2c3e50";
    }

    this.uiEffects.updateTimerRing(1);
  }

  /**
   * Add points to the current team
   * @param {number} points - The points to add
   */
  addPoints(points) {
    if (this.gameState.gameOver) {
      return;
    }

    // Add points to the current team
    const currentTeamIndex = this.gameState.currentTeamIndex;
    this.gameState.teams[currentTeamIndex].score += points;

    // Show score change effect
    this.uiEffects.showScoreChange(currentTeamIndex, points);

    // Update score display
    this.updateScoreDisplay();

    // Record statistics if available
    if (window.gameStatistics && this.gameState.currentWordPair) {
      // Determine action type based on points
      let actionType;

      if (points === 1) {
        actionType = "simple";
        console.log("Recording SIMPLE word action");
      }
      else if (points === 3) {
        actionType = "compound";
        console.log("Recording COMPOUND word action");
      }
      else if (points < 0) {
        actionType = "skipped";
        console.log("Recording SKIPPED word action");
      }
      else {
        // Default fallback
        actionType = points > 0 ? "simple" : "skipped";
        console.log(`Recording ${actionType} word action (fallback)`);
      }

      // Calculate time used for this word
      let timeUsed = 0;
      if (this.roundStartTime) {
        timeUsed = (Date.now() - this.roundStartTime) / 1000; // in seconds
        this.roundStartTime = Date.now(); // Reset for next word
      }

      // Record the action with detailed information
      window.gameStatistics.recordWordAction(
        this.gameState.currentWordPair,
        actionType,
        points,
        timeUsed
      );

      console.log(`Recorded word action: ${this.gameState.currentWordPair.simple}/${this.gameState.currentWordPair.compound}, type: ${actionType}, points: ${points}`);
    }
    else {
      console.log("Cannot record statistics - gameStatistics not available or no current word pair");
    }

    // Check if the target score has been reached, but don't set gameOver yet
    if (!this.gameState.targetScoreReached && this.checkTargetScoreReached()) {
      this.gameState.targetScoreReached = true;
      this.gameState.targetReachedByTeam = currentTeamIndex;
      // Update the display
      this.updateTeamDisplay();
    }

    // If round is active, select a new word
    if (this.gameState.roundActive && this.gameState.timeLeft > 0) {
      this.selectNewWord();
    } else {
      // Disable buttons if round is over
      this.updateButtonStates(false);
    }
  }

  /**
   * Check if any team has reached the target score
   * @returns {boolean} True if a team has reached the target score
   */
  checkTargetScoreReached() {
    return this.gameState.teams.some(
      (team) => team.score >= this.gameState.targetScore
    );
  }

  /**
   * Determine if the game should end now
   * @returns {boolean} True if the game should end
   */
  shouldEndGame() {
    // If the target score has not been reached, the game should not end
    if (!this.gameState.targetScoreReached) {
      return false;
    }

    // The game should end if:
    // 1. The target score has been reached
    // 2. AND we've finished the round of the last team (the team with the highest index)
    return this.gameState.currentTeamIndex === this.gameState.teams.length - 1;
  }

  /**
   * Disable all game control buttons
   */
  disableAllButtons() {
    if (this.pointBtn) this.pointBtn.disabled = true;
    if (this.compoundBtn) this.compoundBtn.disabled = true;
    if (this.skipBtn) this.skipBtn.disabled = true;
    if (this.endRoundBtn) this.endRoundBtn.disabled = true;
    if (this.startRoundBtn) this.startRoundBtn.disabled = true;
  }

  /**
   * End the game and show results
   */
  endGame() {
    clearInterval(this.gameState.timer);

    // Game is over
    this.gameState.gameOver = true;

    // Disable all buttons
    this.disableAllButtons();

    // Finalize game statistics if available
    let gameStatData = null;
    if (window.gameStatistics) {
      // Pass the current game state to ensure accurate statistics
      gameStatData = window.gameStatistics.endGame(this.gameState);
      console.log("Spielstatistik-Tracking beendet");
    }

    // Wait a moment before showing game over screen
    setTimeout(() => {
      if (this.gamePlay) this.gamePlay.classList.add("hide");
      if (this.gameOver) this.gameOver.classList.remove("hide");

      const winnerAnnouncement = document.getElementById("winner-announcement");
      const finalResults = document.getElementById("final-results");

      if (!winnerAnnouncement || !finalResults) return;

      // Clear previous results except winner announcement
      while (finalResults.children.length > 1) {
        finalResults.removeChild(finalResults.lastChild);
      }

      // Find team with highest score
      let winnerIndex = 0;
      let highestScore = this.gameState.teams[0].score;

      // Process each team's final score
      this.gameState.teams.forEach((team, index) => {
        // Check if this team has the highest score
        if (team.score > highestScore) {
          winnerIndex = index;
          highestScore = team.score;
        }

        // Create final score element
        const teamScoreDiv = document.createElement("div");
        teamScoreDiv.className = "final-team-score";
        teamScoreDiv.innerText = `${team.name}: ${team.score} Punkte`;

        // Add colored indicator
        if (team.color) {
          teamScoreDiv.style.borderLeft = `4px solid ${team.color}`;
          teamScoreDiv.style.paddingLeft = "8px";
          teamScoreDiv.style.margin = "5px 0";
          teamScoreDiv.style.backgroundColor =
            team.score === highestScore
              ? "rgba(255, 255, 255, 0.7)"
              : "rgba(240, 240, 240, 0.5)";
        }

        finalResults.appendChild(teamScoreDiv);
      });

      // Check for tie
      const teamsWithHighestScore = this.gameState.teams.filter(
        (team) => team.score === highestScore
      );

      if (teamsWithHighestScore.length > 1) {
        winnerAnnouncement.innerText = "Unentschieden!";
        winnerAnnouncement.style.color = "#8e44ad"; // Purple for tie
      } else {
        const winnerTeam = this.gameState.teams[winnerIndex];
        winnerAnnouncement.innerText = `${winnerTeam.name} gewinnt!`;
        if (winnerTeam.color) {
          winnerAnnouncement.style.color = winnerTeam.color;
        }
      }

      // Add statistics button to game over screen
      if (window.gameStatistics) {
        const statsButtonContainer = document.createElement("div");
        statsButtonContainer.className = "stats-button-container";
        statsButtonContainer.style.marginTop = "15px";

        const showStatsButton = document.createElement("button");
        showStatsButton.id = "show-stats-btn";
        showStatsButton.innerText = "📊 Detailstatistik anzeigen";
        showStatsButton.className = "stats-button";
        showStatsButton.style.backgroundColor = "#3498db";
        showStatsButton.addEventListener("click", () => {
          window.gameStatistics.showStatsModal(gameStatData);
        });

        statsButtonContainer.appendChild(showStatsButton);
        finalResults.appendChild(statsButtonContainer);
      }
    }, 1000);
  }

  /**
   * Reset the game and return to main menu
   */
  resetGame() {
    if (this.gameOver) this.gameOver.classList.add("hide");
    if (this.mainMenu) this.mainMenu.classList.remove("hide");

    // Reset timer
    clearInterval(this.gameState.timer);

    // Reset all relevant game states
    this.gameState.gameOver = false;
    this.gameState.roundActive = false;
    this.gameState.targetScoreReached = false;
    this.gameState.targetReachedByTeam = -1;
    this.gameState.usedWordPairs = [];

    // Reset button states
    if (this.startRoundBtn) {
      this.startRoundBtn.disabled = false;
      this.startRoundBtn.classList.remove("hide");
    }

    if (this.endRoundBtn) {
      this.endRoundBtn.classList.add("hide");
    }

    // Reset timer display
    if (this.timerDisplay) {
      this.timerDisplay.style.color = "#2c3e50";
      this.timerDisplay.innerText = this.gameState.roundTime || "60";
    }

    // Reset timer ring
    this.uiEffects.updateTimerRing(1);
  }
}

// Create global gameLogic instance
const gameLogic = new GameLogic();

// Make sure gameLogic is available in the global scope
window.gameLogic = gameLogic;
