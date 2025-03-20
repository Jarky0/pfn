/**
 * GameState
 * Central state management for the game
 */
export class GameState {
    constructor() {
        // Game configuration
        this.teams = [];
        this.roundTime = 60;
        this.targetScore = 20;

        // Current game state
        this.currentTeamIndex = 0;
        this.timeLeft = 60;
        this.timer = null;
        this.currentWordPair = null;
        this.usedWordPairs = [];
        this.roundActive = false;
        this.gameOver = false;
        this.targetScoreReached = false;
        this.targetReachedByTeam = -1;

        // Event listeners
        this.listeners = {};
    }

    /**
     * Reset game state to initial values
     */
    resetGame() {
        this.currentTeamIndex = 0;
        this.timeLeft = this.roundTime;
        this.currentWordPair = null;
        this.usedWordPairs = [];
        this.roundActive = false;
        this.gameOver = false;
        this.targetScoreReached = false;
        this.targetReachedByTeam = -1;

        // Reset team scores
        this.teams.forEach(team => {
            team.score = 0;
        });

        this.notify('gameReset');
    }

    /**
     * Initialize a new game with teams
     * @param {Array} teams - Array of team objects
     * @param {number} roundTime - Time per round in seconds
     * @param {number} targetScore - Score needed to win
     */
    initGame(teams, roundTime, targetScore) {
        this.teams = teams || [];
        this.roundTime = roundTime || 60;
        this.targetScore = targetScore || 20;
        this.timeLeft = this.roundTime;

        this.resetGame();
        this.notify('gameInit', {
            teams: this.teams,
            roundTime: this.roundTime,
            targetScore: this.targetScore
        });
    }

    /**
     * Start a new round
     */
    startRound() {
        if (this.gameOver) return;

        this.roundActive = true;
        this.timeLeft = this.roundTime;

        this.notify('roundStart', {
            teamIndex: this.currentTeamIndex,
            timeLeft: this.timeLeft
        });
    }

    /**
     * End the current round
     */
    endRound() {
        this.roundActive = false;

        this.notify('roundEnd', {
            teamIndex: this.currentTeamIndex
        });
    }

    /**
     * End current round and move to next team
     */
    nextTeam() {
        this.endRound();

        // Check if the game should end
        if (this.shouldEndGame()) {
            this.endGame();
            return;
        }

        // Switch to next team
        const teamCount = this.teams.length;
        this.currentTeamIndex = (this.currentTeamIndex + 1) % teamCount;

        this.notify('nextTeam', {
            teamIndex: this.currentTeamIndex
        });
    }

    /**
     * Add points to the current team
     * @param {number} points - Points to add
     */
    addPoints(points) {
        if (this.gameOver || !this.roundActive) return;

        const teamIndex = this.currentTeamIndex;
        this.teams[teamIndex].score += points;

        this.notify('scoreChange', {
            teamIndex: teamIndex,
            points: points,
            newScore: this.teams[teamIndex].score
        });

        // Check if target score has been reached
        if (!this.targetScoreReached && this.checkTargetScoreReached()) {
            this.targetScoreReached = true;
            this.targetReachedByTeam = teamIndex;

            this.notify('targetScoreReached', {
                teamIndex: teamIndex,
                score: this.teams[teamIndex].score
            });
        }
    }

    /**
     * Set current word pair
     * @param {Object} wordPair - Word pair object
     */
    setCurrentWordPair(wordPair) {
        this.currentWordPair = wordPair;

        // Add to used words
        if (wordPair) {
            this.usedWordPairs.push(wordPair);
        }

        this.notify('wordChange', {
            wordPair: this.currentWordPair
        });
    }

    /**
     * Check if target score has been reached by any team
     * @returns {boolean} True if target score reached
     */
    checkTargetScoreReached() {
        return this.teams.some(team => team.score >= this.targetScore);
    }

    /**
     * Determine if the game should end
     * @returns {boolean} True if game should end
     */
    shouldEndGame() {
        if (!this.targetScoreReached) return false;

        // The game should end if we've finished the round of the last team
        return this.currentTeamIndex === this.teams.length - 1;
    }

    /**
     * End the game
     */
    endGame() {
        this.gameOver = true;
        this.roundActive = false;

        // Find winner
        let highestScore = -1;
        let winnerIndices = [];

        this.teams.forEach((team, index) => {
            if (team.score > highestScore) {
                highestScore = team.score;
                winnerIndices = [index];
            } else if (team.score === highestScore) {
                winnerIndices.push(index);
            }
        });

        this.notify('gameEnd', {
            winnerIndices: winnerIndices,
            isTie: winnerIndices.length > 1,
            finalScores: this.teams.map(team => team.score)
        });
    }

    /**
     * Subscribe to state changes
     * @param {string} event - Event name
     * @param {Function} callback - Function to call when event occurs
     * @returns {Function} Unsubscribe function
     */
    subscribe(event, callback) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }

        this.listeners[event].push(callback);

        // Return unsubscribe function
        return () => {
            this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
        };
    }

    /**
     * Notify subscribers of state change
     * @param {string} event - Event name
     * @param {Object} data - Event data
     */
    notify(event, data) {
        if (this.listeners[event]) {
            this.listeners[event].forEach(callback => callback(data));
        }
    }
}