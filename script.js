/**
 * Main script file
 * Sets up event listeners and initializes the app
 */
import { preventZoom, addCacheBustingParam, updateServiceWorker } from './utils/common.js';
import { WordLoader } from './modules/WordLoader.js';
import { UIEffects } from './modules/UIEffects.js';
import { GameController } from './modules/GameController.js';
import { TeamSetup } from './components/TeamSetup.js';
import { GameStatistics } from './modules/GameStatistics.js';

/**
 * Add screen wake lock support if available in the browser
 */
function addWakeLockSupport() {
    // Check if the Wake Lock API is supported
    if ("wakeLock" in navigator) {
        let wakeLock = null;

        // Function to request a wake lock
        const requestWakeLock = async () => {
            try {
                wakeLock = await navigator.wakeLock.request("screen");
                console.log("Wake Lock activated");

                // Listen for page visibility changes
                document.addEventListener("visibilitychange", handleVisibilityChange);
            } catch (err) {
                console.log(`Wake Lock could not be activated: ${err.message}`);
            }
        };

        // Function to handle visibility changes
        const handleVisibilityChange = async () => {
            if (wakeLock !== null && document.visibilityState === "visible") {
                // Re-request wake lock when page becomes visible again
                wakeLock = await navigator.wakeLock.request("screen");
            }
        };

        // Add event listeners for game start/end to manage wake lock
        const startGameBtn = document.getElementById("start-game-btn");
        const newGameBtn = document.getElementById("new-game-btn");

        if (startGameBtn) {
            startGameBtn.addEventListener("click", requestWakeLock);
        }

        if (newGameBtn) {
            newGameBtn.addEventListener("click", () => {
                if (wakeLock !== null) {
                    wakeLock.release();
                    wakeLock = null;
                    console.log("Wake Lock deactivated");
                }
            });
        }
    }
}

/**
 * Setup offline detection
 */
function setupOfflineDetection() {
    const offlineNotification = document.getElementById("offline-notification");

    if (offlineNotification) {
        // Update UI based on connection status
        function updateOnlineStatus() {
            offlineNotification.classList.toggle("hide", navigator.onLine);
        }

        // Add event listeners for online/offline events
        window.addEventListener("online", updateOnlineStatus);
        window.addEventListener("offline", updateOnlineStatus);

        // Call initially to set correct state
        updateOnlineStatus();
    }
}

/**
 * Initialize the application
 */
function initializeApp() {
    // Create module instances
    const wordLoader = new WordLoader();
    const uiEffects = new UIEffects();
    const gameStatistics = new GameStatistics();

    // Initialize TeamSetup
    const teamSetup = new TeamSetup(
        document.querySelector('.team-buttons'),
        document.getElementById('teams-container'),
        teams => {
            console.log('Teams updated:', teams);
            // Future functionality for team updates
        }
    );

    // Create and initialize game controller
    const gameController = new GameController(wordLoader, gameStatistics, uiEffects);

    // Initialize modules
    wordLoader.init();

    // Add support for screen wake lock if available
    addWakeLockSupport();

    // Add offline detection
    setupOfflineDetection();

    console.log("App initialized successfully");
}

// Call zoom prevention right after loading
window.addEventListener("DOMContentLoaded", preventZoom);

// Run cache busting on page load
addCacheBustingParam();

// Wait for DOM to be fully loaded and all scripts to be loaded
window.addEventListener("load", () => {
    // Update service worker
    updateServiceWorker();

    // Initialize app
    initializeApp();
});

/**
 * Enable offline capability with Service Worker
 */
if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker
            .register("service-worker.js")
            .then((registration) => {
                console.log("ServiceWorker registered:", registration.scope);

                // Check for updates every 15 minutes
                setInterval(() => {
                    registration.update();
                }, 15 * 60 * 1000);
            })
            .catch((error) => {
                console.log("ServiceWorker registration failed:", error);
            });
    });
}
