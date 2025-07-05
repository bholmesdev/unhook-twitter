// Unhook Twitter - Content Script
// Handles dynamic CSS injection, redirects and title cleanup

(function() {
  'use strict';
  
  // Configuration - will be updated from storage
  let config = {
    hideNotifications: true,
    hideHomeFeed: true,
    redirectNotifications: true,
    cleanTitle: true
  };
  
  // CSS Rules for different features
  const cssRules = {
    hideNotifications: `
      /* Hide notification button and badges */
      a[href="/notifications"],
      a[href*="/notifications"],
      a[data-testid="AppTabBar_Notifications_Link"],
      a[aria-label*="Notifications"],
      a[aria-label*="notifications"],
      nav a[href="/notifications"],
      nav a[href*="/notifications"],
      [role="navigation"] a[href="/notifications"],
      [role="navigation"] a[href*="/notifications"] {
        display: none !important;
      }
      
      li:has(a[href="/notifications"]),
      li:has(a[href*="/notifications"]),
      li:has(a[data-testid="AppTabBar_Notifications_Link"]),
      [role="listitem"]:has(a[href="/notifications"]),
      [role="listitem"]:has(a[href*="/notifications"]),
      div[role="tab"]:has(a[href="/notifications"]) {
        display: none !important;
      }
      
      [data-testid="notification-badge"],
      [aria-label*="notification"],
      .notification-badge,
      .badge[data-count],
      [data-testid="AppTabBar_Notifications_Link"] [data-testid="badge"] {
        display: none !important;
      }
    `,
    
    hideHomeFeed: `
      /* Hide home feed timeline */
      [data-testid="timeline"] article[data-testid="tweet"],
      [data-testid="timeline"] div[data-testid="cellInnerDiv"]:not(:has([data-testid="tweetTextarea_0"])),
      [aria-label*="Home timeline"] article,
      [aria-label*="Timeline"] article[data-testid="tweet"],
      article[data-testid="tweet"],
      [data-testid="primaryColumn"] section[role="region"] > div > div:not(:has([data-testid="tweetTextarea_0"])):not(:has([role="textbox"])):not(:has([data-testid="tweet-text-editor"])) {
        display: none !important;
      }
      
      /* Hide sidebar distractions */
      [data-testid="sidebarColumn"] [data-testid="trend"],
      [data-testid="sidebarColumn"] [data-testid="UserCell"],
      [aria-label*="Timeline: Trending now"],
      [aria-label*="Who to follow"],
      [data-testid="sidebarColumn"] section[aria-labelledby*="accessible-list"] {
        display: none !important;
      }
    `
  };
  
  let injectedStyles = new Map();
  
  // Inject or remove CSS based on feature toggle
  function updateCSS(feature, enabled) {
    const styleId = `unhook-twitter-${feature}`;
    
    if (enabled) {
      // Inject CSS if not already present
      if (!injectedStyles.has(feature)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = cssRules[feature];
        document.head.appendChild(style);
        injectedStyles.set(feature, style);
      }
    } else {
      // Remove CSS if present
      if (injectedStyles.has(feature)) {
        const style = injectedStyles.get(feature);
        if (style && style.parentNode) {
          style.parentNode.removeChild(style);
        }
        injectedStyles.delete(feature);
      }
    }
  }
  
  // Load settings from storage and apply
  function loadSettings() {
    chrome.storage.sync.get({
      hideNotifications: true,
      hideHomeFeed: true,
      redirectNotifications: true
    }, function(items) {
      config.hideNotifications = items.hideNotifications;
      config.hideHomeFeed = items.hideHomeFeed;
      config.redirectNotifications = items.redirectNotifications;
      
      // Update CSS based on loaded settings
      updateCSS('hideNotifications', config.hideNotifications);
      updateCSS('hideHomeFeed', config.hideHomeFeed);
    });
  }
  
  // Listen for messages from popup
  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === 'updateCSS') {
      const settings = request.settings;
      config.hideNotifications = settings.hideNotifications;
      config.hideHomeFeed = settings.hideHomeFeed;
      
      updateCSS('hideNotifications', config.hideNotifications);
      updateCSS('hideHomeFeed', config.hideHomeFeed);
    }
    
    if (request.action === 'updateSettings') {
      const settings = request.settings;
      config.redirectNotifications = settings.redirectNotifications;
    }
  });

  // Redirect notifications page to home
  function redirectNotificationsToHome() {
    const currentPath = window.location.pathname;
    if (currentPath === '/notifications' || currentPath.startsWith('/notifications/')) {
      window.location.href = 'https://x.com/home';
    }
  }


  // Clean page title to remove notification count
  function cleanPageTitle() {
    const title = document.title;
    
    // Remove notification count pattern like "(12) Home / X" -> "Home / X"
    const cleanedTitle = title.replace(/^\(\d+\)\s*/, '');
    
    if (title !== cleanedTitle) {
      document.title = cleanedTitle;
    }
  }


  // Main function to apply all modifications
  function applyModifications() {
    if (config.redirectNotifications) {
      redirectNotificationsToHome();
    }
    
    if (config.cleanTitle) {
      cleanPageTitle();
    }
  }

  // Observer to handle dynamic content loading
  const observer = new MutationObserver(function(mutations) {
    let shouldReapply = false;
    
    mutations.forEach(function(mutation) {
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        shouldReapply = true;
      }
    });
    
    if (shouldReapply) {
      // Debounce the reapplication
      clearTimeout(window.unhookTwitterTimeout);
      window.unhookTwitterTimeout = setTimeout(applyModifications, 100);
    }
  });

  // Observer specifically for title changes
  const titleObserver = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (mutation.type === 'childList' && mutation.target.nodeName === 'TITLE') {
        if (config.cleanTitle) {
          cleanPageTitle();
        }
      }
    });
  });

  // Start observing
  function startObserving() {
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    // Also observe title changes
    const titleElement = document.querySelector('title');
    if (titleElement) {
      titleObserver.observe(titleElement.parentNode, {
        childList: true,
        subtree: true
      });
    }
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      loadSettings();
      applyModifications();
      startObserving();
    });
  } else {
    loadSettings();
    applyModifications();
    startObserving();
  }

  // Also run on page navigation (for SPA behavior)
  window.addEventListener('popstate', applyModifications);
  
  // Run periodically to catch any missed elements
  setInterval(applyModifications, 2000);
})();
