/**
 * ScoreBoard Component
 * Displays and manages team scores
 */
export class ScoreBoard {
    /**
     * Create a new ScoreBoard instance
     * @param {HTMLElement} container - DOM element to render scoreboard in
     * @param {Array} teams - Array of team objects
     */
    constructor(container) {
        this.container = container;
        this.teams = [];
    }

    /**
     * Set or update teams
     * @param {Array} teams - Array of team objects
     */
    setTeams(teams) {
        this.teams = teams;
        this.render();
    }

    /**
     * Render the scoreboard
     */
    render() {
        if (!this.container) return;

        // Clear existing scoreboard
        this.container.innerHTML = "";

        // Add class for team count (for CSS styling)
        const teamCount = this.teams.length;
        this.container.className = `scoreboard teams-${teamCount}`;

        // Add team score displays
        this.teams.forEach((team, index) => {
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
            scoreNumberDiv.innerText = team.score || 0;

            const scoreChangeDiv = document.createElement("div");
            scoreChangeDiv.className = "score-change";
            scoreChangeDiv.id = `team${index}-score-change`;

            teamScoreDiv.appendChild(teamNameDiv);
            teamScoreDiv.appendChild(scoreNumberDiv);
            teamScoreDiv.appendChild(scoreChangeDiv);

            this.container.appendChild(teamScoreDiv);
        });
    }

    /**
     * Update score for a team
     * @param {number} teamIndex - Index of team to update
     * @param {number} score - New score value
     */
    updateScore(teamIndex, score) {
        const scoreElement = document.getElementById(`team${teamIndex}-score-number`);
        if (scoreElement) {
            scoreElement.innerText = score;
        }
    }

    /**
     * Show score change animation
     * @param {number} teamIndex - Index of team
     * @param {number} points - Points to display
     */
    showScoreChange(teamIndex, points) {
        const element = document.getElementById(`team${teamIndex}-score-change`);
        if (!element) return;

        element.textContent = points > 0 ? `+${points}` : points;
        element.className = "score-change " + (points >= 0 ? "positive" : "negative");

        // Reset animation
        element.style.animation = "none";
        element.offsetHeight; // Trigger reflow
        element.style.animation = "score-pop 1s ease-out";
    }

    /**
     * Set active team
     * @param {number} teamIndex - Index of active team
     */
    setActiveTeam(teamIndex) {
        // Remove active class from all teams
        this.teams.forEach((_, index) => {
            const teamScoreDisplay = document.getElementById(`team${index}-score-display`);
            if (teamScoreDisplay) {
                teamScoreDisplay.classList.remove("active");
            }
        });

        // Add active class to current team
        const currentTeamScoreDisplay = document.getElementById(`team${teamIndex}-score-display`);
        if (currentTeamScoreDisplay) {
            currentTeamScoreDisplay.classList.add("active");
        }
    }
}