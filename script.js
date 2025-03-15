/**
 * Main script file
 * Sets up event listeners and initializes the app
 */

// Prevent zoom gestures
function preventZoom() {
    // Prevent pinch-zoom
    document.addEventListener('touchmove', function(event) {
        if (event.touches.length > 1) {
            event.preventDefault();
        }
    }, { passive: false });
    
    // Prevent double-tap zoom
    let lastTapTime = 0;
    document.addEventListener('touchend', function(event) {
        const currentTime = new Date().getTime();
        const tapLength = currentTime - lastTapTime;
        if (tapLength < 300 && tapLength > 0) {
            event.preventDefault();
        }
        lastTapTime = currentTime;
    }, { passive: false });
    
    // Check if this is an iOS device, and prevent overscroll-bounce effect
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    if (isIOS) {
        document.body.style.position = 'fixed';
        document.body.style.width = '100%';
        document.body.style.height = '100%';
        document.body.style.overflow = 'hidden';
    }
}

// Add cache busting function - adds a version timestamp to force resource reload
function addCacheBustingParam() {
    const timestamp = new Date().getTime();
    
    // Add timestamp to all stylesheet links and scripts
    document.querySelectorAll('link[rel="stylesheet"], script[src]').forEach(element => {
        if (element.href && !element.href.includes('cloudflare')) {
            element.href = element.href.split('?')[0] + '?v=' + timestamp;
        } else if (element.src && !element.src.includes('cloudflare')) {
            element.src = element.src.split('?')[0] + '?v=' + timestamp;
        }
    });
}

// Update service workers
function updateServiceWorker() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(registrations => {
            for (let registration of registrations) {
                registration.update();
            }
        });
    }
}

/**
 * Generates 8 distinct colors for teams
 * @param {number} count - Number of colors needed
 * @returns {Array} - Array with HEX color codes
 */
function generateDistinctColors(count) {
    // The 8 most distinguishable colors
    const teamColors = [
        '#e6194B', // Red
        '#3cb44b', // Green
        '#4363d8', // Blue
        '#f58231', // Orange
        '#911eb4', // Purple
        '#42d4f4', // Turquoise
        '#f032e6', // Magenta
        '#f3c300'  // Yellow
    ];
    
    return teamColors.slice(0, Math.min(count, teamColors.length));
}

/**
 * Setup team management controls with colored team chips
 */
function setupTeamControls() {
    const addTeamBtn = document.getElementById("add-team-btn");
    const removeTeamBtn = document.getElementById("remove-team-btn");
    const teamsContainer = document.getElementById("teams-container");
    
    // Maximum number of teams
    const MAX_TEAMS = 8;
    window.MAX_TEAMS = MAX_TEAMS; // Make available globally
    
    if (!addTeamBtn || !removeTeamBtn || !teamsContainer) {
        console.error("Team control elements not found", {
            addTeamBtn,
            removeTeamBtn,
            teamsContainer
        });
        return;
    }
    
    console.log("Initialisiere Team-Controls");
    
    // Initialize with 2 teams
    renderTeamChips(2);
    
    // Add team button
    addTeamBtn.addEventListener("click", function() {
        const teamChips = teamsContainer.querySelectorAll(".team-chip");
        const newTeamCount = teamChips.length + 1;
        
        // Check if max teams reached
        if (newTeamCount > MAX_TEAMS) {
            console.log(`Maximale Teamanzahl (${MAX_TEAMS}) erreicht`);
            return;
        }
        
        console.log(`Button geklickt: Team hinzufügen, neue Anzahl: ${newTeamCount}`);
        renderTeamChips(newTeamCount);
        
        // Enable remove button if more than 2 teams
        if (newTeamCount > 2) {
            removeTeamBtn.disabled = false;
        }
        
        // Disable add button if max teams reached
        if (newTeamCount >= MAX_TEAMS) {
            addTeamBtn.disabled = true;
        }
    });
    
    // Remove team button
    removeTeamBtn.addEventListener("click", function() {
        const teamChips = teamsContainer.querySelectorAll(".team-chip");
        if (teamChips.length > 2) {
            const newTeamCount = teamChips.length - 1;
            
            console.log(`Button geklickt: Team entfernen, neue Anzahl: ${newTeamCount}`);
            renderTeamChips(newTeamCount);
            
            // Disable remove button if only 2 teams left
            if (newTeamCount <= 2) {
                removeTeamBtn.disabled = true;
            }
            
            // Re-enable add button if below max teams
            if (newTeamCount < MAX_TEAMS) {
                addTeamBtn.disabled = false;
            }
        }
    });
    
    console.log("Team-Control Event-Listener hinzugefügt");
}

/**
 * Renders team chips in container
 * @param {number} count - Number of teams
 */
function renderTeamChips(count) {
    // Maximum number of teams
    const MAX_TEAMS = 8;
    
    // Ensure no more than MAX_TEAMS teams are created
    count = Math.min(count, MAX_TEAMS);
    
    const teamsContainer = document.getElementById("teams-container");
    if (!teamsContainer) {
        console.error("Teams Container not found!");
        return;
    }
    
    // Generate colors
    const colors = generateDistinctColors(count);
    
    // Clear container
    teamsContainer.innerHTML = '';
    
    // Add teams
    for (let i = 0; i < count; i++) {
        const teamChip = document.createElement('div');
        teamChip.className = 'team-chip';
        teamChip.dataset.teamIndex = i;
        teamChip.dataset.teamName = `Team ${i+1}`;
        teamChip.style.backgroundColor = colors[i];
        
        teamChip.innerHTML = `
            <span class="team-chip-number">${i+1}</span>
            <span class="team-chip-name">Team ${i+1}</span>
        `;
        
        teamsContainer.appendChild(teamChip);
    }
    
    console.log(`${count} Teams gerendert`);
    
    // Enable start game button if words are loaded
    const startGameBtn = document.getElementById("start-game-btn");
    if (startGameBtn && window.wordLoader && window.wordLoader.wordPairs && window.wordLoader.wordPairs.length > 0) {
        startGameBtn.disabled = false;
    }
    
    // Update button states
    updateTeamButtonsState(count);
}

/**
 * Updates team button states based on current team count
 * @param {number} teamCount - Current team count
 */
function updateTeamButtonsState(teamCount) {
    const MAX_TEAMS = 8;
    const MIN_TEAMS = 2;
    
    const addTeamBtn = document.getElementById("add-team-btn");
    const removeTeamBtn = document.getElementById("remove-team-btn");
    
    if (addTeamBtn) {
        addTeamBtn.disabled = teamCount >= MAX_TEAMS;
    }
    
    if (removeTeamBtn) {
        removeTeamBtn.disabled = teamCount <= MIN_TEAMS;
    }
}

// Entferne nicht benötigte Swipe-Funktionen und Wake-Lock
// (Vom Benutzer als nicht benötigt gekennzeichnet)

/**
 * Setup offline detection
 */
function setupOfflineDetection() {
    const offlineNotification = document.getElementById('offline-notification');
    
    if (offlineNotification) {
        // Update UI based on connection status
        function updateOnlineStatus() {
            offlineNotification.classList.toggle('hide', navigator.onLine);
        }
        
        // Add event listeners for online/offline events
        window.addEventListener('online', updateOnlineStatus);
        window.addEventListener('offline', updateOnlineStatus);
        
        // Call initially to set correct state
        updateOnlineStatus();
    }
}

/**
 * Set up event listeners and initialize game
 */
function initializeGame() {
    // Verify that all required objects are defined
    if (typeof wordLoader === 'undefined' || 
        typeof uiEffects === 'undefined' || 
        typeof gameLogic === 'undefined') {
        
        console.error('Error: One or more required scripts failed to load properly');
        
        // Show error message to user
        const fileStatus = document.getElementById("file-status");
        if (fileStatus) {
            fileStatus.textContent = "Error loading game resources. Please reload the page.";
            fileStatus.className = "status-message error";
        }
        
        return;
    }
    
    // Get button elements
    const buttons = {
        startGame: document.getElementById("start-game-btn"),
        startRound: document.getElementById("start-round-btn"),
        point: document.getElementById("point-btn"),
        compound: document.getElementById("compound-btn"),
        skip: document.getElementById("skip-btn"),
        endRound: document.getElementById("end-round-btn"),
        newGame: document.getElementById("new-game-btn")
    };
    
    // Add event listeners to buttons
    if (buttons.startGame) buttons.startGame.addEventListener("click", () => gameLogic.initGame());
    if (buttons.startRound) buttons.startRound.addEventListener("click", () => gameLogic.startRound());
    if (buttons.point) buttons.point.addEventListener("click", () => gameLogic.addPoints(1));
    if (buttons.compound) buttons.compound.addEventListener("click", () => gameLogic.addPoints(3));
    if (buttons.skip) buttons.skip.addEventListener("click", () => gameLogic.addPoints(-1));
    if (buttons.endRound) buttons.endRound.addEventListener("click", () => gameLogic.endCurrentRound());
    if (buttons.newGame) buttons.newGame.addEventListener("click", () => gameLogic.resetGame());
    
    // Check if the game start should be enabled
    if (wordLoader && wordLoader.wordPairs && wordLoader.wordPairs.length > 0 && buttons.startGame) {
        buttons.startGame.disabled = false;
    }
    
    // Add swipe functionality for mobile devices
    addSwipeSupport();
    
    // Add support for screen wake lock if available
    addWakeLockSupport();
    
    // Add offline detection
    setupOfflineDetection();
}

// Call zoom prevention right after loading
window.addEventListener('DOMContentLoaded', preventZoom);

// Run cache busting on page load
addCacheBustingParam();

// Wait for DOM to be fully loaded and all scripts to be loaded
window.addEventListener('load', () => {
    // Update service worker
    updateServiceWorker();
    
    // Setup team controls with initial teams
    setupTeamControls();
    
    // Initialize game
    initializeGame();
    
    // Manuelle Deaktivierung des Buttons-Fokus bei jedem Touch auf dem Dokument
    document.addEventListener('touchstart', function() {
        document.activeElement.blur();
    }, false);
});

/**
 * Enable offline capability with Service Worker
 */
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('service-worker.js')
            .then(registration => {
                console.log('ServiceWorker registered:', registration.scope);
                
                // Check for updates every 15 minutes
                setInterval(() => {
                    registration.update();
                }, 15 * 60 * 1000);
            })
            .catch(error => {
                console.log('ServiceWorker registration failed:', error);
            });
    });
}