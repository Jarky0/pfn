/**
 * TeamSetup Component
 * Manages team creation and options
 */
import { generateDistinctColors } from '../utils/common.js';

export class TeamSetup {
    /**
     * Create a new TeamSetup instance
     * @param {HTMLElement} container - DOM element to render team controls in
     * @param {HTMLElement} teamContainer - DOM element to render team chips in
     * @param {Function} onTeamsChange - Callback when teams change
     */
    constructor(container, teamContainer, onTeamsChange) {
        this.container = container;
        this.teamContainer = teamContainer;
        this.onTeamsChange = onTeamsChange;

        // Constants
        this.MAX_TEAMS = 8;
        this.MIN_TEAMS = 2;

        // DOM elements
        this.addTeamBtn = null;
        this.removeTeamBtn = null;

        // Initialize
        this.setupControls();
        this.renderTeamChips(2); // Start with 2 teams
    }

    /**
     * Setup team management controls
     */
    setupControls() {
        if (!this.container) return;

        // Create buttons if they don't exist
        if (!this.addTeamBtn) {
            this.addTeamBtn = document.createElement('button');
            this.addTeamBtn.id = 'add-team-btn';
            this.addTeamBtn.textContent = '+ Team';
            this.container.appendChild(this.addTeamBtn);
        }

        if (!this.removeTeamBtn) {
            this.removeTeamBtn = document.createElement('button');
            this.removeTeamBtn.id = 'remove-team-btn';
            this.removeTeamBtn.textContent = '- Team';
            this.removeTeamBtn.disabled = true;
            this.container.appendChild(this.removeTeamBtn);
        }

        // Add event listeners
        this.addTeamBtn.addEventListener('click', () => {
            const teamChips = this.teamContainer.querySelectorAll('.team-chip');
            const newTeamCount = teamChips.length + 1;

            // Check if max teams reached
            if (newTeamCount > this.MAX_TEAMS) {
                console.log(`Maximale Teamanzahl (${this.MAX_TEAMS}) erreicht`);
                return;
            }

            console.log(`Button geklickt: Team hinzufügen, neue Anzahl: ${newTeamCount}`);
            this.renderTeamChips(newTeamCount);

            // Enable remove button if more than MIN_TEAMS teams
            this.updateButtonStates(newTeamCount);
        });

        this.removeTeamBtn.addEventListener('click', () => {
            const teamChips = this.teamContainer.querySelectorAll('.team-chip');
            if (teamChips.length > this.MIN_TEAMS) {
                const newTeamCount = teamChips.length - 1;

                console.log(`Button geklickt: Team entfernen, neue Anzahl: ${newTeamCount}`);
                this.renderTeamChips(newTeamCount);

                // Update button states
                this.updateButtonStates(newTeamCount);
            }
        });

        console.log('Team-Control Event-Listener hinzugefügt');
    }

    /**
     * Render team chips in container
     * @param {number} count - Number of teams
     */
    renderTeamChips(count) {
        if (!this.teamContainer) return;

        // Ensure no more than MAX_TEAMS teams are created
        count = Math.min(count, this.MAX_TEAMS);

        // Generate colors
        const colors = generateDistinctColors(count);

        // Clear container
        this.teamContainer.innerHTML = '';

        // Add teams
        for (let i = 0; i < count; i++) {
            const teamChip = document.createElement('div');
            teamChip.className = 'team-chip';
            teamChip.dataset.teamIndex = i;
            teamChip.dataset.teamName = `Team ${i + 1}`;
            teamChip.style.backgroundColor = colors[i];

            teamChip.innerHTML = `
        <span class="team-chip-number">${i + 1}</span>
        <span class="team-chip-name">Team ${i + 1}</span>
      `;

            this.teamContainer.appendChild(teamChip);
        }

        console.log(`${count} Teams gerendert`);

        // Update button states
        this.updateButtonStates(count);

        // Notify about team changes
        if (this.onTeamsChange) {
            const teams = this.getTeams();
            this.onTeamsChange(teams);
        }
    }

    /**
     * Updates team button states based on current team count
     * @param {number} teamCount - Current team count
     */
    updateButtonStates(teamCount) {
        if (this.addTeamBtn) {
            this.addTeamBtn.disabled = teamCount >= this.MAX_TEAMS;
        }

        if (this.removeTeamBtn) {
            this.removeTeamBtn.disabled = teamCount <= this.MIN_TEAMS;
        }
    }

    /**
     * Get current teams data
     * @returns {Array} Array of team objects
     */
    getTeams() {
        const teamChips = this.teamContainer.querySelectorAll('.team-chip');
        const teams = [];

        teamChips.forEach((chip, index) => {
            teams.push({
                name: chip.dataset.teamName || `Team ${index + 1}`,
                score: 0,
                color: chip.style.backgroundColor
            });
        });

        return teams;
    }
}