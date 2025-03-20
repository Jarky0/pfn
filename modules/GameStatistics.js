// @ts-nocheck
/**
 * Game Statistics Module
 * Tracks, analyzes, and displays game statistics
 */
export class GameStatistics {
  constructor() {
    this.gameHistory = [];
    this.currentGame = null;
    this.isTracking = false;

    // DOM elements for statistics display
    this.statsContainer = null;
    this.chartContainer = null;

    // Load previous game history when available
    this.loadFromLocalStorage();
  }

  /**
   * Initialize a new game statistics tracking session
   * @param {Object} gameConfig - Initial game configuration
   */
  startTracking(gameConfig) {
    console.log("Starting statistics tracking with config:", gameConfig);

    // Create a new game record
    this.currentGame = {
      id: Date.now(),
      date: new Date(),
      settings: {
        teams: gameConfig.teams.map(team => ({
          name: team.name,
          color: team.color
        })),
        roundTime: gameConfig.roundTime,
        targetScore: gameConfig.targetScore
      },
      rounds: [],
      teamStats: gameConfig.teams.map((team, index) => ({
        teamIndex: index,
        teamName: team.name,
        color: team.color,
        totalScore: team.score || 0, // Initialize with the current score
        roundScores: [],
        wordActions: {
          simple: 0,
          compound: 0,
          skipped: 0
        },
        averageTimePerWord: 0,
        totalWordsExplained: 0
      })),
      currentRound: null,
      totalRoundsPlayed: 0,
      totalGameDuration: 0,
      gameStartTime: Date.now(),
      wordStats: {
        totalWordsPlayed: 0,
        simpleWords: 0,
        compoundWords: 0,
        skippedWords: 0,
        mostSkippedWords: []
      }
    };

    this.isTracking = true;
    console.log("Game statistics tracking started");
  }

  /**
   * Start tracking a new round
   * @param {number} teamIndex - Index of the team playing this round
   */
  startRound(teamIndex) {
    if (!this.isTracking || !this.currentGame) return;

    console.log(`Starting round tracking for team index ${teamIndex}`);

    this.currentGame.currentRound = {
      roundNumber: this.currentGame.totalRoundsPlayed + 1,
      teamIndex: teamIndex,
      teamName: this.currentGame.settings.teams[teamIndex].name,
      startTime: Date.now(),
      endTime: null,
      duration: 0,
      words: [],
      pointsEarned: 0,
      wordActions: {
        simple: 0,
        compound: 0,
        skipped: 0
      }
    };
  }

  /**
   * Record a word action during a round
   * @param {Object} wordPair - The word pair that was played
   * @param {string} actionType - The action taken (simple, compound, or skipped)
   * @param {number} points - Points earned for this action
   * @param {number} timeUsed - Time used in seconds
   */
  recordWordAction(wordPair, actionType, points, timeUsed) {
    if (!this.isTracking || !this.currentGame || !this.currentGame.currentRound) {
      console.error("Cannot record word action - tracking state is invalid");
      return;
    }

    const teamIndex = this.currentGame.currentRound.teamIndex;

    console.log(`Recording word action: ${wordPair.simple}/${wordPair.compound}, action: ${actionType}, points: ${points} for team ${teamIndex}`);

    // Add word to current round
    this.currentGame.currentRound.words.push({
      simple: wordPair.simple,
      compound: wordPair.compound,
      actionType: actionType,
      points: points,
      timeUsed: timeUsed
    });

    // Update round stats
    this.currentGame.currentRound.pointsEarned += points;
    this.currentGame.currentRound.wordActions[actionType]++;

    // Update team stats
    this.currentGame.teamStats[teamIndex].wordActions[actionType]++;
    this.currentGame.teamStats[teamIndex].totalWordsExplained++;
    this.currentGame.teamStats[teamIndex].totalScore += points;

    // Update global word stats
    this.currentGame.wordStats.totalWordsPlayed++;
    this.currentGame.wordStats[actionType + "Words"]++;

    // Track skipped words for analysis
    if (actionType === "skipped") {
      const existingSkippedWord = this.currentGame.wordStats.mostSkippedWords.find(
        item => item.simple === wordPair.simple && item.compound === wordPair.compound
      );

      if (existingSkippedWord) {
        existingSkippedWord.count++;
      } else {
        this.currentGame.wordStats.mostSkippedWords.push({
          simple: wordPair.simple,
          compound: wordPair.compound,
          count: 1
        });
      }
    }

    console.log(`Updated stats for team ${teamIndex}: `, this.currentGame.teamStats[teamIndex]);
  }

  /**
   * End the current round and save statistics
   */
  endRound() {
    if (!this.isTracking || !this.currentGame || !this.currentGame.currentRound) {
      console.error("Cannot end round - tracking state is invalid");
      return;
    }

    const round = this.currentGame.currentRound;
    const teamIndex = round.teamIndex;

    console.log(`Ending round ${round.roundNumber} for team ${teamIndex} with ${round.pointsEarned} points`);

    // Calculate round duration
    round.endTime = Date.now();
    round.duration = (round.endTime - round.startTime) / 1000; // in seconds

    // Update team stats with round results
    this.currentGame.teamStats[teamIndex].roundScores.push({
      roundNumber: round.roundNumber,
      score: round.pointsEarned
    });

    // Calculate average time per word if any words were played
    if (round.words.length > 0) {
      const totalTimeUsed = round.words.reduce((sum, word) => sum + word.timeUsed, 0);
      const averageTimePerWord = totalTimeUsed / round.words.length;
      this.currentGame.teamStats[teamIndex].averageTimePerWord =
        (this.currentGame.teamStats[teamIndex].averageTimePerWord *
          (this.currentGame.teamStats[teamIndex].totalWordsExplained - round.words.length) +
          totalTimeUsed) / this.currentGame.teamStats[teamIndex].totalWordsExplained;
    }

    // Add round to game history
    this.currentGame.rounds.push({ ...round }); // Create a copy
    this.currentGame.totalRoundsPlayed++;

    // Reset current round
    this.currentGame.currentRound = null;

    console.log(`Round ended. Team stats now: ${JSON.stringify(this.currentGame.teamStats[teamIndex])}`);
  }

  /**
   * Synchronize statistics with the current game state
   * @param {Object} gameState - Current game state to sync with
   */
  syncWithGameState(gameState) {
    if (!this.isTracking || !this.currentGame || !gameState || !gameState.teams) {
      console.error("Cannot sync with game state - invalid data");
      return;
    }

    console.log("Syncing statistics with current game state:", gameState);

    // Update team scores from game state
    for (let i = 0; i < gameState.teams.length && i < this.currentGame.teamStats.length; i++) {
      // If the game state score is different, use it as it's the source of truth
      if (this.currentGame.teamStats[i].totalScore !== gameState.teams[i].score) {
        console.log(`Updating team ${i} score from ${this.currentGame.teamStats[i].totalScore} to ${gameState.teams[i].score}`);
        this.currentGame.teamStats[i].totalScore = gameState.teams[i].score;
      }
    }
  }

  /**
   * End the game and finalize statistics
   * @param {Object} [finalGameState] - Optional final game state to ensure accuracy
   * @returns {Object} Final game statistics
   */
  endGame(finalGameState) {
    if (!this.isTracking || !this.currentGame) {
      console.error("Cannot end game - tracking state is invalid");
      return null;
    }

    console.log("Ending game and finalizing statistics");

    // If there's an active round, end it first
    if (this.currentGame.currentRound) {
      this.endRound();
    }

    // Sync with final game state if provided
    if (finalGameState && finalGameState.teams) {
      this.syncWithGameState(finalGameState);
    }

    // Calculate total game duration
    this.currentGame.totalGameDuration = (Date.now() - this.currentGame.gameStartTime) / 1000; // in seconds

    // Log final stats
    console.log("Final team stats:", this.currentGame.teamStats);
    console.log("Final word stats:", this.currentGame.wordStats);

    // Sort most skipped words
    this.currentGame.wordStats.mostSkippedWords.sort((a, b) => b.count - a.count);

    // Add to game history (keep only last 10 games)
    const completedGame = { ...this.currentGame }; // Create a copy
    this.gameHistory.push(completedGame);
    if (this.gameHistory.length > 10) {
      this.gameHistory.shift();
    }

    // Save to localStorage
    this.saveToLocalStorage();

    // Reset current game
    this.currentGame = null;
    this.isTracking = false;

    console.log("Game statistics tracking completed");

    return completedGame;
  }

  /**
   * Save game history to localStorage
   */
  saveToLocalStorage() {
    try {
      localStorage.setItem("pfn_game_history", JSON.stringify(this.gameHistory));
      console.log("Game history saved to localStorage");
    } catch (e) {
      console.error("Failed to save game history to localStorage:", e);
    }
  }

  /**
   * Load game history from localStorage
   */
  loadFromLocalStorage() {
    try {
      const savedHistory = localStorage.getItem("pfn_game_history");
      if (savedHistory) {
        this.gameHistory = JSON.parse(savedHistory);
        console.log(`Loaded ${this.gameHistory.length} games from localStorage`);
      }
    } catch (e) {
      console.error("Failed to load game history from localStorage:", e);
    }
  }

  /**
   * Generate HTML content for statistics
   * @param {Object} gameData - Game data to display statistics for
   * @returns {string} HTML content
   */
  generateStatsHTML(gameData) {
    if (!gameData) {
      gameData = this.currentGame || (this.gameHistory.length > 0 ? this.gameHistory[this.gameHistory.length - 1] : null);
    }

    if (!gameData) return "<p>Keine Spieldaten verfügbar</p>";

    console.log("Generating stats from game data:", gameData);

    const formatTime = (seconds) => {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = Math.floor(seconds % 60);
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const formatDate = (date) => {
      if (!(date instanceof Date)) {
        date = new Date(date);
      }
      return date.toLocaleDateString('de-DE', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    // Sort teams by total score (descending)
    const sortedTeams = [...gameData.teamStats].sort((a, b) => b.totalScore - a.totalScore);

    // Generate team statistics
    let teamStatsHTML = sortedTeams.map(team => {
      const wordTotal = team.wordActions.simple + team.wordActions.compound + team.wordActions.skipped;
      const successRate = wordTotal > 0
        ? Math.round(((team.wordActions.simple + team.wordActions.compound) / wordTotal) * 100)
        : 0;

      return `
        <div class="statistics__team-card" style="border-left: 4px solid ${team.color}">
          <h3 class="statistics__team-heading">${team.teamName}</h3>
          <div class="statistics__team-score">${team.totalScore} Punkte</div>
          <div class="statistics__team-stats">
            <div class="statistics__stat-item">
              <div class="statistics__stat-label">Einfache</div>
              <div class="statistics__stat-value">${team.wordActions.simple}</div>
            </div>
            <div class="statistics__stat-item">
              <div class="statistics__stat-label">Komplex</div>
              <div class="statistics__stat-value">${team.wordActions.compound}</div>
            </div>
            <div class="statistics__stat-item">
              <div class="statistics__stat-label">Überspr.</div>
              <div class="statistics__stat-value">${team.wordActions.skipped}</div>
            </div>
            <div class="statistics__stat-item">
              <div class="statistics__stat-label">Quote</div>
              <div class="statistics__stat-value">${successRate}%</div>
            </div>
          </div>
        </div>
      `;
    }).join("");

    // Generate overall game statistics
    let totalWords = gameData.wordStats.simpleWords + gameData.wordStats.compoundWords + gameData.wordStats.skippedWords;
    let successRate = totalWords > 0
      ? Math.round(((gameData.wordStats.simpleWords + gameData.wordStats.compoundWords) / totalWords) * 100)
      : 0;

    let gameStatsHTML = `
      <div class="statistics__overview">
        <div class="statistics__date">Gespielt am ${formatDate(gameData.date)}</div>
        <div class="statistics__duration">Gesamtdauer: ${formatTime(gameData.totalGameDuration)}</div>
        <div class="statistics__settings">
          <span>${gameData.settings.teams.length} Teams</span> • 
          <span>${gameData.settings.roundTime} Sek. pro Runde</span> • 
          <span>${gameData.settings.targetScore} Punkte zum Sieg</span>
        </div>
        
        <div class="statistics__summary">
          <div class="statistics__summary-item">
            <div class="statistics__summary-value">${gameData.totalRoundsPlayed}</div>
            <div class="statistics__summary-label">Runden</div>
          </div>
          <div class="statistics__summary-item">
            <div class="statistics__summary-value">${totalWords}</div>
            <div class="statistics__summary-label">Wörter</div>
          </div>
          <div class="statistics__summary-item">
            <div class="statistics__summary-value">${successRate}%</div>
            <div class="statistics__summary-label">Erfolgsquote</div>
          </div>
        </div>
      </div>
    `;

    // Generate table of most skipped words (top 5)
    let skippedWordsHTML = '';
    if (gameData.wordStats.mostSkippedWords.length > 0) {
      const topSkippedWords = gameData.wordStats.mostSkippedWords.slice(0, 5);
      skippedWordsHTML = `
        <div class="statistics__skipped-section">
          <h3 class="statistics__subheading">Häufig übersprungene Wörter</h3>
          <div class="statistics__skipped-list">
            ${topSkippedWords.map(word => `
              <div class="statistics__skipped-item">
                <span class="statistics__compound">${word.compound}</span>
                <span class="statistics__simple">${word.simple}</span>
                <span class="statistics__count">${word.count}x</span>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    // Complete stats HTML
    return `
      <div class="statistics">
        <h2 class="statistics__heading">Spielstatistik</h2>
        ${gameStatsHTML}
        
        <h3 class="statistics__subheading">Teamergebnisse</h3>
        <div class="statistics__team-grid">
          ${teamStatsHTML}
        </div>
        
        ${skippedWordsHTML}
        
        <div id="stats-chart-container" class="statistics__chart-container"></div>
        
        <div class="statistics__actions">
          <button id="share-stats-btn" class="statistics__button statistics__button--share">Statistik teilen</button>
          <button id="close-stats-btn" class="statistics__button statistics__button--close">Schließen</button>
        </div>
      </div>
    `;
  }

  /**
   * Render charts for game statistics
   * @param {Element} container - DOM element to render charts in
   * @param {Object} gameData - Game data to visualize
   */
  renderCharts(container, gameData) {
    if (!container || !gameData) return;

    // Create team scores chart
    const teamScoresDiv = document.createElement('div');
    teamScoresDiv.className = 'statistics__chart statistics__team-chart';
    teamScoresDiv.style.height = 'auto'; // Anpassung an Teamanzahl
    container.appendChild(teamScoresDiv);

    // Create word types chart
    const wordTypesDiv = document.createElement('div');
    wordTypesDiv.className = 'statistics__chart statistics__wordtypes-chart';
    wordTypesDiv.style.height = '230px';
    container.appendChild(wordTypesDiv);

    // Team scores chart
    const maxScore = Math.max(...gameData.teamStats.map(team => team.totalScore || 0), 1); // Ensure non-zero
    const teamScoresHTML = gameData.teamStats.map(team => {
      const percentage = (team.totalScore / maxScore) * 100;
      return `
        <div class="statistics__chart-item">
          <div class="statistics__chart-label">${team.teamName}</div>
          <div class="statistics__chart-wrapper">
            <div class="statistics__chart-bar" style="width: ${percentage || 1}%; background-color: ${team.color}">
              <span class="statistics__chart-value">${team.totalScore}</span>
            </div>
          </div>
        </div>
      `;
    }).join('');

    teamScoresDiv.innerHTML = `
      <h3 class="statistics__subheading">Teamergebnisse</h3>
      <div class="statistics__chart-bars">
        ${teamScoresHTML}
      </div>
    `;

    // Word types chart - Simplified horizontal bar chart implementation
    const totalWords = gameData.wordStats.simpleWords + gameData.wordStats.compoundWords + gameData.wordStats.skippedWords;

    if (totalWords > 0) {
      const simplePercentage = (gameData.wordStats.simpleWords / totalWords) * 100;
      const compoundPercentage = (gameData.wordStats.compoundWords / totalWords) * 100;
      const skippedPercentage = (gameData.wordStats.skippedWords / totalWords) * 100;

      wordTypesDiv.innerHTML = `
        <h3 class="statistics__subheading">Worttypen</h3>
        <div class="statistics__word-types">
          <!-- Simple words bar -->
          <div class="statistics__word-item">
            <div class="statistics__word-label">Einfach</div>
            <div class="statistics__word-wrapper">
              <div class="statistics__word-bar statistics__word-bar--simple" style="width: ${simplePercentage}%">
                <span class="statistics__word-value">${gameData.wordStats.simpleWords}</span>
              </div>
            </div>
          </div>
          
          <!-- Compound words bar -->
          <div class="statistics__word-item">
            <div class="statistics__word-label">Komplex</div>
            <div class="statistics__word-wrapper">
              <div class="statistics__word-bar statistics__word-bar--compound" style="width: ${compoundPercentage}%">
                <span class="statistics__word-value">${gameData.wordStats.compoundWords}</span>
              </div>
            </div>
          </div>
          
          <!-- Skipped words bar -->
          <div class="statistics__word-item">
            <div class="statistics__word-label">Überspr.</div>
            <div class="statistics__word-wrapper">
              <div class="statistics__word-bar statistics__word-bar--skipped" style="width: ${skippedPercentage}%">
                <span class="statistics__word-value">${gameData.wordStats.skippedWords}</span>
              </div>
            </div>
          </div>
          
          <!-- Total counter -->
          <div class="statistics__word-total">
            Wörter insgesamt: ${totalWords}
          </div>
        </div>
      `;
    } else {
      // Fallback for no data
      wordTypesDiv.innerHTML = `
        <h3 class="statistics__subheading">Worttypen</h3>
        <div class="statistics__no-data">
          Keine Wortdaten verfügbar
        </div>
      `;
    }
  }

  /**
   * Generate a text summary for sharing
   * @param {Object} gameData - Game data to generate summary for
   * @returns {string} Text summary
   */
  generateTextSummary(gameData) {
    if (!gameData) {
      gameData = this.currentGame || (this.gameHistory.length > 0 ? this.gameHistory[this.gameHistory.length - 1] : null);
    }

    if (!gameData) return "Keine Spieldaten verfügbar";

    const formatDate = (date) => {
      if (!(date instanceof Date)) {
        date = new Date(date);
      }
      return date.toLocaleDateString('de-DE', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    };

    const formatTime = (seconds) => {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = Math.floor(seconds % 60);
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    // Sort teams by total score (descending)
    const sortedTeams = [...gameData.teamStats].sort((a, b) => b.totalScore - a.totalScore);

    // Generate team results
    let teamResults = sortedTeams.map((team, index) => {
      return `${index + 1}. ${team.teamName}: ${team.totalScore} Punkte`;
    }).join('\n');

    // Generate summary
    let totalWords = gameData.wordStats.simpleWords + gameData.wordStats.compoundWords + gameData.wordStats.skippedWords;

    return `📊 PRIMITIVE FORMULIERUNGEN FÜR NEUDENKER 📊
Spielstatistik vom ${formatDate(gameData.date)}

🏆 ERGEBNIS:
${teamResults}

📈 SPIELDETAILS:
• Spieldauer: ${formatTime(gameData.totalGameDuration)}
• ${gameData.totalRoundsPlayed} Runden gespielt
• ${totalWords} Wörter insgesamt
• ${gameData.wordStats.simpleWords} einfache Wörter
• ${gameData.wordStats.compoundWords} zusammengesetzte Wörter
• ${gameData.wordStats.skippedWords} übersprungene Wörter`;
  }

  /**
   * Display statistics modal
   * @param {Object} gameData - Game data to display statistics for
   */
  showStatsModal(gameData) {
    // Create modal if it doesn't exist
    let modal = document.getElementById('stats-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'stats-modal';
      modal.className = 'statistics-modal';
      document.body.appendChild(modal);
    }

    // Create modal content
    const modalContent = document.createElement('div');
    modalContent.className = 'statistics-modal__content';
    modalContent.innerHTML = this.generateStatsHTML(gameData);

    // Clear and append new content
    modal.innerHTML = '';
    modal.appendChild(modalContent);

    // Show modal
    modal.style.display = 'flex';

    // Add event listeners
    const closeBtn = document.getElementById('close-stats-btn');
    const shareBtn = document.getElementById('share-stats-btn');
    const chartContainer = document.getElementById('stats-chart-container');

    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
      });
    }

    if (shareBtn) {
      shareBtn.addEventListener('click', () => {
        const summary = this.generateTextSummary(gameData);

        // Check if the Web Share API is available
        if (navigator.share) {
          navigator.share({
            title: 'Primitive Formulierungen für Neudenker - Spielstatistik',
            text: summary
          }).catch(err => {
            console.error('Error sharing:', err);
            this.copyToClipboard(summary);
          });
        } else {
          this.copyToClipboard(summary);
        }
      });
    }

    // Render charts with a slight delay to ensure the container is fully rendered
    if (chartContainer) {
      setTimeout(() => {
        this.renderCharts(chartContainer, gameData);
      }, 50);
    }

    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.style.display = 'none';
      }
    });
  }

  /**
   * Copy text to clipboard and show notification
   * @param {string} text - Text to copy
   */
  copyToClipboard(text) {
    // Create temporary textarea
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'absolute';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);

    // Select and copy
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);

    // Show notification
    const notification = document.createElement('div');
    notification.className = 'statistics__notification';
    notification.textContent = 'Statistik in die Zwischenablage kopiert!';
    document.body.appendChild(notification);

    // Remove notification after delay
    setTimeout(() => {
      notification.style.opacity = '0';
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 500);
    }, 2000);
  }
}