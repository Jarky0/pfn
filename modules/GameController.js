/**
 * Game Controller
 * Main controller that coordinates all game modules
 */
import { GameState } from '../state/GameState.js';
import { ScoreBoard } from '../components/ScoreBoard.js';
import { GameTimer } from '../components/GameTimer.js';
import { WordDisplay } from '../components/WordDisplay.js';

export class GameController {
    /**
     * Create a GameController instance
     * @param {WordLoader} wordLoader - WordLoader instance
     * @param {GameStatistics} gameStatistics - GameStatistics instance
     * @param {UIEffects} uiEffects - UIEffects instance
     */
    constructor(wordLoader, gameStatistics, uiEffects) {
        // Store dependencies
        this.wordLoader = wordLoader;
        this.gameStatistics = gameStatistics;
        this.uiEffects = uiEffects;

        // Create state
        this.gameState = new GameState();

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

        // Round tracking variables
        this.roundStartTime = null;

        // Initialize components
        this.initComponents();

        // Bind events
        this.bindEvents();
    }

    /**
     * Initialize UI components
     */
    initComponents() {
        // DOM elements
        this.screens = {
            mainMenu: document.getElementById("main-menu"),
            gamePlay: document.getElementById("game-play"),
            gameOver: document.getElementById("game-over")
        };

        this.buttons = {
            startGame: document.getElementById("start-game-btn"),
            startRound: document.getElementById("start-round-btn"),
            endRound: document.getElementById("end-round-btn"),
            pointBtn: document.getElementById("point-btn"),
            compoundBtn: document.getElementById("compound-btn"),
            skipBtn: document.getElementById("skip-btn"),
            newGameBtn: document.getElementById("new-game-btn")
        };

        this.displays = {
            currentTeam: document.getElementById("current-team"),
            finalResults: document.getElementById("final-results"),
            winnerAnnouncement: document.getElementById("winner-announcement"),
        };

        // Initialize components
        this.scoreBoard = new ScoreBoard(document.getElementById("scoreboard"));

        this.timer = new GameTimer(
            document.getElementById("timer"),
            document.getElementById("timer-fill"),
            60,
            this.handleTimerEnd.bind(this)
        );

        this.wordDisplay = new WordDisplay(
            document.getElementById("card-deck"),
            document.getElementById("active-card"),
            document.getElementById("word"),
            document.getElementById("compound-word")
        );
    }

    /**
     * Bind event listeners to state
     */
    bindEvents() {
        // Subscribe to state events
        this.gameState.subscribe('gameInit', data => {
            this.scoreBoard.setTeams(data.teams);
            this.timer.reset(data.roundTime);

            this.updateActiveTeam();
            this.updateButtonStates(false);

            // Hide card
            this.wordDisplay.showDeck();

            // Start tracking game statistics if available
            if (this.gameStatistics) {
                this.gameStatistics.startTracking(this.gameState);
                console.log("Spielstatistik-Tracking gestartet");
            }
        });

        this.gameState.subscribe('roundStart', data => {
            // Select a new word
            this.selectNewWord();

            // Start the timer
            this.timer.reset(data.timeLeft);
            this.timer.start();

            // Enable control buttons
            this.updateButtonStates(true);

            // Track round start time
            this.roundStartTime = Date.now();

            // Start tracking round statistics
            if (this.gameStatistics) {
                this.gameStatistics.startRound(data.teamIndex);
            }
        });

        this.gameState.subscribe('roundEnd', () => {
            // Stop the timer
            this.timer.stop();

            // Disable control buttons
            this.updateButtonStates(false);

            // Flip the card to show both words
            this.wordDisplay.flipCard();

            // End round tracking for statistics
            if (this.gameStatistics) {
                this.gameStatistics.endRound();
            }
        });

        this.gameState.subscribe('nextTeam', data => {
            // Update active team display
            this.updateActiveTeam();

            // Show start round button
            if (this.buttons.startRound) {
                this.buttons.startRound.classList.remove("hide");
            }

            if (this.buttons.endRound) {
                this.buttons.endRound.classList.add("hide");
            }

            // Hide word card
            this.wordDisplay.showDeck();

            // Reset word display
            this.wordDisplay.resetCard();
        });

        this.gameState.subscribe('scoreChange', data => {
            // Update scoreboard display
            this.scoreBoard.updateScore(data.teamIndex, data.newScore);

            // Show score change animation
            this.scoreBoard.showScoreChange(data.teamIndex, data.points);

            // Record statistics
            if (this.gameStatistics && this.gameState.currentWordPair) {
                // Determine action type based on points
                let actionType;

                if (data.points === 1) {
                    actionType = "simple";
                } else if (data.points === 3) {
                    actionType = "compound";
                } else if (data.points < 0) {
                    actionType = "skipped";
                } else {
                    // Default fallback
                    actionType = data.points > 0 ? "simple" : "skipped";
                }

                // Calculate time used for this word
                let timeUsed = 0;
                if (this.roundStartTime) {
                    timeUsed = (Date.now() - this.roundStartTime) / 1000; // in seconds
                    this.roundStartTime = Date.now(); // Reset for next word
                }

                // Record the action
                this.gameStatistics.recordWordAction(
                    this.gameState.currentWordPair,
                    actionType,
                    data.points,
                    timeUsed
                );
            }

            // If round is active, select a new word
            if (this.gameState.roundActive && this.timer.getTimeLeft() > 0) {
                this.selectNewWord();
            }
        });

        this.gameState.subscribe('wordChange', data => {
            if (data.wordPair) {
                this.wordDisplay.setWordPair(data.wordPair);
            }
        });

        this.gameState.subscribe('targetScoreReached', () => {
            // Update team display to show which team reached the target score
            this.updateActiveTeam();
        });

        this.gameState.subscribe('gameEnd', data => {
            this.handleGameEnd(data);
        });

        this.gameState.subscribe('gameReset', () => {
            if (this.screens.gameOver) this.screens.gameOver.classList.add("hide");
            if (this.screens.mainMenu) this.screens.mainMenu.classList.remove("hide");

            // Reset button states
            if (this.buttons.startRound) {
                this.buttons.startRound.disabled = false;
                this.buttons.startRound.classList.remove("hide");
            }

            if (this.buttons.endRound) {
                this.buttons.endRound.classList.add("hide");
            }

            // Reset timer display
            this.timer.reset();
        });

        // Bind button event listeners
        if (this.buttons.startGame) {
            this.buttons.startGame.addEventListener("click", this.initGame.bind(this));
        }

        if (this.buttons.startRound) {
            this.buttons.startRound.addEventListener("click", () => this.gameState.startRound());
        }

        if (this.buttons.endRound) {
            this.buttons.endRound.addEventListener("click", () => this.gameState.nextTeam());
        }

        if (this.buttons.pointBtn) {
            this.buttons.pointBtn.addEventListener("click", () => this.gameState.addPoints(1));
        }

        if (this.buttons.compoundBtn) {
            this.buttons.compoundBtn.addEventListener("click", () => this.gameState.addPoints(3));
        }

        if (this.buttons.skipBtn) {
            this.buttons.skipBtn.addEventListener("click", () => this.gameState.addPoints(-1));
        }

        if (this.buttons.newGameBtn) {
            this.buttons.newGameBtn.addEventListener("click", () => this.gameState.resetGame());
        }
    }

    /**
     * Update game control button states
     * @param {boolean} roundActive - Whether a round is currently active
     */
    updateButtonStates(roundActive) {
        if (this.buttons.pointBtn) this.buttons.pointBtn.disabled = !roundActive;
        if (this.buttons.compoundBtn) this.buttons.compoundBtn.disabled = !roundActive;
        if (this.buttons.skipBtn) this.buttons.skipBtn.disabled = !roundActive;
        if (this.buttons.startRound) this.buttons.startRound.disabled = roundActive;
        if (this.buttons.endRound) this.buttons.endRound.disabled = !roundActive;

        // Show/hide round buttons
        if (roundActive) {
            if (this.buttons.startRound) this.buttons.startRound.classList.add("hide");
            if (this.buttons.endRound) this.buttons.endRound.classList.remove("hide");
        } else {
            if (this.buttons.startRound && !this.gameState.gameOver) {
                this.buttons.startRound.classList.remove("hide");
            }
            if (this.buttons.endRound) this.buttons.endRound.classList.add("hide");
        }
    }

    /**
     * Update the team display to show the current team
     */
    updateActiveTeam() {
        if (!this.displays.currentTeam) return;

        const currentTeam = this.gameState.teams[this.gameState.currentTeamIndex];
        let teamText = `${currentTeam.name} ist dran`;

        // Show hint for last attempt
        if (
            this.gameState.targetScoreReached &&
            this.gameState.targetReachedByTeam !== this.gameState.currentTeamIndex
        ) {
            teamText += " (Letzte Chance aufzuholen!)";
        }

        this.displays.currentTeam.innerText = teamText;

        // Update active team in scoreboard
        this.scoreBoard.setActiveTeam(this.gameState.currentTeamIndex);
    }

    /**
     * Initialize a new game
     */
    initGame() {
        console.log("Initialisiere Spiel");

        // Get teams from team chips
        const teamChips = document.querySelectorAll(".team-chip");
        const teams = [];

        console.log(`${teamChips.length} Teams gefunden`);

        // Create teams from chips
        if (teamChips.length > 0) {
            teamChips.forEach((chip, index) => {
                const teamName = chip.dataset.teamName || `Team ${index + 1}`;
                const teamColor = chip.style.backgroundColor;

                teams.push({
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
        if (teams.length < 2) {
            teams.push(
                { name: "Team 1", score: 0, color: "#e6194B" },
                { name: "Team 2", score: 0, color: "#3cb44b" }
            );
            console.log("Standardteams erstellt: Team 1 und Team 2");
        }

        // Get game settings
        const roundTimeInput = document.getElementById("round-time");
        const targetScoreInput = document.getElementById("target-score");

        const roundTime = roundTimeInput ? parseInt(roundTimeInput.value) || 60 : 60;
        const targetScore = targetScoreInput ? parseInt(targetScoreInput.value) || 20 : 20;

        // Initialize game state
        this.gameState.initGame(teams, roundTime, targetScore);

        // Show game play screen
        if (this.screens.mainMenu) this.screens.mainMenu.classList.add("hide");
        if (this.screens.gamePlay) this.screens.gamePlay.classList.remove("hide");
        if (this.screens.gameOver) this.screens.gameOver.classList.add("hide");
    }

    /**
     * Select a new word from wordLoader
     */
    selectNewWord() {
        // Check if wordLoader is available and has words
        if (this.wordLoader && this.wordLoader.hasWords()) {
            let newWordPair = null;
            let attempts = 0;
            const maxAttempts = 100; // Limit attempts to prevent infinite loop

            // Try to get a word that hasn't been used in this game session
            while (attempts < maxAttempts) {
                newWordPair = this.wordLoader.getRandomWordPair();

                // If no word was returned or we've exhausted all possible words, exit loop
                if (!newWordPair || this.gameState.usedWordPairs.length >= this.wordLoader.getWordCounts().total) {
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
                newWordPair = this.wordLoader.getRandomWordPair();
            }

            // If we still don't have a word, use fallback
            if (!newWordPair) {
                console.log("Kein Wort gefunden, verwende Fallback-Wörter");
                const randomIndex = Math.floor(Math.random() * this.defaultWords.length);
                newWordPair = this.defaultWords[randomIndex];
            }

            // Set the current word
            this.gameState.setCurrentWordPair(newWordPair);
        } else {
            // Fallback to default words if wordLoader is not available
            console.log("Kein wordLoader gefunden, verwende Fallback-Wörter");
            const randomIndex = Math.floor(Math.random() * this.defaultWords.length);
            const wordPair = this.defaultWords[randomIndex];
            this.gameState.setCurrentWordPair(wordPair);
        }
    }

    /**
     * Handle timer end event
     */
    handleTimerEnd() {
        this.gameState.endRound();
    }

    /**
     * Handle game end
     * @param {Object} data - Data from gameEnd event
     */
    handleGameEnd(data) {
        // Finalize game statistics if available
        let gameStatData = null;
        if (this.gameStatistics) {
            // Pass the current game state to ensure accurate statistics
            gameStatData = this.gameStatistics.endGame(this.gameState);
            console.log("Spielstatistik-Tracking beendet");
        }

        // Wait a moment before showing game over screen
        setTimeout(() => {
            if (this.screens.gamePlay) this.screens.gamePlay.classList.add("hide");
            if (this.screens.gameOver) this.screens.gameOver.classList.remove("hide");

            if (!this.displays.winnerAnnouncement || !this.displays.finalResults) return;

            // Clear previous results except winner announcement
            while (this.displays.finalResults.children.length > 1) {
                this.displays.finalResults.removeChild(this.displays.finalResults.lastChild);
            }

            // Process each team's final score
            this.gameState.teams.forEach((team, index) => {
                // Create final score element
                const teamScoreDiv = document.createElement("div");
                teamScoreDiv.className = "final-team-score";
                teamScoreDiv.innerText = `${team.name}: ${team.score} Punkte`;

                // Highlight winner(s)
                if (data.winnerIndices.includes(index)) {
                    teamScoreDiv.style.backgroundColor = "rgba(255, 255, 255, 0.7)";
                } else {
                    teamScoreDiv.style.backgroundColor = "rgba(240, 240, 240, 0.5)";
                }

                // Add colored indicator
                if (team.color) {
                    teamScoreDiv.style.borderLeft = `4px solid ${team.color}`;
                    teamScoreDiv.style.paddingLeft = "8px";
                    teamScoreDiv.style.margin = "5px 0";
                }

                this.displays.finalResults.appendChild(teamScoreDiv);
            });

            // Display winner message
            if (data.isTie) {
                this.displays.winnerAnnouncement.innerText = "Unentschieden!";
                this.displays.winnerAnnouncement.style.color = "#8e44ad"; // Purple for tie
            } else {
                const winnerTeam = this.gameState.teams[data.winnerIndices[0]];
                this.displays.winnerAnnouncement.innerText = `${winnerTeam.name} gewinnt!`;
                if (winnerTeam.color) {
                    this.displays.winnerAnnouncement.style.color = winnerTeam.color;
                }
            }

            // Add statistics button to game over screen
            if (this.gameStatistics) {
                const statsButtonContainer = document.createElement("div");
                statsButtonContainer.className = "stats-button-container";
                statsButtonContainer.style.marginTop = "15px";

                const showStatsButton = document.createElement("button");
                showStatsButton.id = "show-stats-btn";
                showStatsButton.innerText = "📊 Detailstatistik anzeigen";
                showStatsButton.className = "stats-button";
                showStatsButton.style.backgroundColor = "#3498db";
                showStatsButton.addEventListener("click", () => {
                    this.gameStatistics.showStatsModal(gameStatData);
                });

                statsButtonContainer.appendChild(showStatsButton);
                this.displays.finalResults.appendChild(statsButtonContainer);
            }
        }, 1000);
    }
}