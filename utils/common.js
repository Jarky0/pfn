/**
 * Utility functions shared across the application
 */

/**
 * Prevent zoom gestures on mobile devices
 */
export function preventZoom() {
    // Prevent pinch-zoom
    document.addEventListener(
        "touchmove",
        function (event) {
            if (event.touches.length > 1) {
                event.preventDefault();
            }
        },
        { passive: false }
    );

    // Prevent double-tap zoom
    let lastTapTime = 0;
    document.addEventListener(
        "touchend",
        function (event) {
            const currentTime = new Date().getTime();
            const tapLength = currentTime - lastTapTime;
            if (tapLength < 300 && tapLength > 0) {
                event.preventDefault();
            }
            lastTapTime = currentTime;
        },
        { passive: false }
    );

    // Check if this is an iOS device, and prevent overscroll-bounce effect
    const isIOS =
        /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    if (isIOS) {
        document.body.style.position = "fixed";
        document.body.style.width = "100%";
        document.body.style.height = "100%";
        document.body.style.overflow = "hidden";
    }
}

/**
 * Add cache busting parameter to resources
 */
export function addCacheBustingParam() {
    const timestamp = new Date().getTime();

    // Add timestamp to all stylesheet links and scripts
    document
        .querySelectorAll('link[rel="stylesheet"], script[src]')
        .forEach((element) => {
            if (element.href && !element.href.includes("cloudflare")) {
                element.href = element.href.split("?")[0] + "?v=" + timestamp;
            } else if (element.src && !element.src.includes("cloudflare")) {
                element.src = element.src.split("?")[0] + "?v=" + timestamp;
            }
        });
}

/**
 * Update service workers
 */
export function updateServiceWorker() {
    if ("serviceWorker" in navigator) {
        navigator.serviceWorker.getRegistrations().then((registrations) => {
            for (let registration of registrations) {
                registration.update();
            }
        });
    }
}

/**
 * Clear browser cache
 */
export function clearBrowserCache() {
    // Try to clear Application Cache (deprecated, but still supported)
    if (window.applicationCache) {
        try {
            window.applicationCache.swapCache();
        } catch (e) {
            console.log("Application Cache could not be cleared", e);
        }
    }

    // Try to clear local storage
    try {
        localStorage.removeItem("cachedResources");
    } catch (e) {
        console.log("Local cache could not be cleared", e);
    }
}

/**
 * Generates distinct colors for teams
 * @param {number} count - Number of colors needed
 * @returns {Array} - Array with HEX color codes
 */
export function generateDistinctColors(count) {
    // The 8 most distinguishable colors
    const teamColors = [
        "#e6194B", // Red
        "#3cb44b", // Green
        "#4363d8", // Blue
        "#f58231", // Orange
        "#911eb4", // Purple
        "#42d4f4", // Turquoise
        "#f032e6", // Magenta
        "#f3c300", // Yellow
    ];

    return teamColors.slice(0, Math.min(count, teamColors.length));
}