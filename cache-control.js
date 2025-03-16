/**
 * Cache-Control-Script
 * Ensures the latest resources are loaded when reloading the page
 */

// Add cache-busting timestamp as query parameter to all resources
function addCacheBustingParam() {
  const timestamp = new Date().getTime();

  // Add timestamp to all stylesheet links
  document.querySelectorAll('link[rel="stylesheet"]').forEach((link) => {
    if (link.href.includes("cloudflare")) return; // Skip CDN resources
    link.href = link.href.split("?")[0] + "?v=" + timestamp;
  });

  // Add timestamp to all script tags
  document.querySelectorAll("script").forEach((script) => {
    if (script.src && !script.src.includes("cloudflare")) {
      script.src = script.src.split("?")[0] + "?v=" + timestamp;
    }
  });
}

// Update Service Worker
function updateServiceWorker() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (let registration of registrations) {
        registration.update();
        console.log("ServiceWorker update requested");
      }
    });
  }
}

// Clear cache when page is reloaded
function clearBrowserCache() {
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

// Prevent zoom gestures
function preventZoom() {
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
}

// Execute functions
document.addEventListener("DOMContentLoaded", function () {
  addCacheBustingParam();
  updateServiceWorker();
  clearBrowserCache();
  preventZoom();
});
