// Unhook Twitter - Content Script
// Handles dynamic CSS injection, redirects and title cleanup

(function () {
  'use strict';

  // Configuration - will be updated from storage
  let config = {
    hideNotifications: true,
    feedHideMode: 'home', // 'none', 'home', 'all'
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

    hideFeeds: `
      /* Hide home feed timeline */
      [data-testid="timeline"] article[data-testid="tweet"],
      [data-testid="timeline"] div[data-testid="cellInnerDiv"]:not(:has([data-testid="tweetTextarea_0"])),
      [aria-label*="Home timeline"] article,
      [aria-label*="Timeline"] article[data-testid="tweet"],
      article[data-testid="tweet"],
      [data-testid="primaryColumn"] section[role="region"] > div > div:not(:has([data-testid="tweetTextarea_0"])):not(:has([role="textbox"])):not(:has([data-testid="tweet-text-editor"])) {
        display: none !important;
      }
      
      /* Hide "new posts" notification badge */
      [aria-label*="New posts are available"] {
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
    `,

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

  // Detect current route type
  function getCurrentRoute() {
    const path = window.location.pathname;
    if (path === '/home' || path === '/') {
      return 'home';
    } else if (path.startsWith('/') && path.match(/^\/.+$/)) {
      return 'profile';
    }
    return 'other';
  }

  // Update feed hiding based on current route and settings
  function updateFeedHiding() {
    const currentRoute = getCurrentRoute();
    const { feedHideMode } = config;

    updateCSS('hideFeeds', false);

    if (feedHideMode === 'home' && currentRoute === 'home') {
      updateCSS('hideFeeds', true);
    } else if (feedHideMode === 'all') {
      updateCSS('hideFeeds', true);
    }
  }

  // Load settings from storage and apply
  function loadSettings() {
    chrome.storage.sync.get({
      hideNotifications: true,
      feedHideMode: 'home', // 'none', 'home', 'all'
      redirectNotifications: true
    }, function (items) {
      config.hideNotifications = items.hideNotifications;
      config.feedHideMode = items.feedHideMode;
      config.redirectNotifications = items.redirectNotifications;

      // Update CSS based on loaded settings
      updateCSS('hideNotifications', config.hideNotifications);
      updateFeedHiding();
    });
  }

  // Listen for messages from popup
  chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.action === 'updateCSS') {
      const settings = request.settings;
      if (settings.hideNotifications !== undefined) {
        config.hideNotifications = settings.hideNotifications;
        updateCSS('hideNotifications', config.hideNotifications);
      }
      if (settings.feedHideMode !== undefined) {
        config.feedHideMode = settings.feedHideMode;
        updateFeedHiding();
      }
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

  // Observer specifically for title changes
  const titleObserver = new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
      if (mutation.type === 'childList' && mutation.target.nodeName === 'TITLE') {
        if (config.cleanTitle) {
          cleanPageTitle();
        }
        // Check for route changes when title changes
        checkForRouteChange();
      }
    });
  });

  function observeTitle() {
    const titleElement = document.querySelector('title');
    if (titleElement) {
      titleObserver.observe(titleElement.parentNode, {
        childList: true,
        subtree: true
      });
    } else {
      // If no title exists, retry after a short delay
      setTimeout(observeTitle, 100);
    }
  }

  // Route change detection tied to title changes
  let currentPath = window.location.pathname;
  
  function checkForRouteChange() {
    if (window.location.pathname !== currentPath) {
      currentPath = window.location.pathname;
      updateFeedHiding();
    }
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      loadSettings();
      redirectNotificationsToHome();
      observeTitle();
    });
  } else {
    loadSettings();
    redirectNotificationsToHome();
    observeTitle();
  }
})();
