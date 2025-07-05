// Unhook Twitter - Content Script
// Removes notification button and home feed to reduce distractions

(function() {
  'use strict';
  
  // Configuration
  const config = {
    removeNotifications: true,
    removeHomeFeed: true,
    redirectNotifications: true
  };

  // Redirect notifications page to home
  function redirectNotificationsToHome() {
    const currentPath = window.location.pathname;
    if (currentPath === '/notifications' || currentPath.startsWith('/notifications/')) {
      window.location.href = 'https://x.com/home';
    }
  }

  // Remove notification button from sidebar
  function removeNotificationButton() {
    // Various selectors for notification links/buttons
    const notificationSelectors = [
      'a[href="/notifications"]',
      'a[data-testid="AppTabBar_Notifications_Link"]',
      'a[aria-label*="Notifications"]',
      'a[aria-label*="notifications"]',
      // Navigation items that contain "Notifications"
      'nav a[href="/notifications"]',
      'nav a[href*="/notifications"]',
      // Sidebar navigation items
      '[role="navigation"] a[href="/notifications"]',
      '[role="navigation"] a[href*="/notifications"]',
      // Generic notification link patterns
      'a[href*="notifications"]'
    ];

    notificationSelectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(element => {
        // Hide the entire list item or parent container
        const listItem = element.closest('li') || element.closest('[role="listitem"]') || element.closest('div[role="tab"]');
        if (listItem) {
          listItem.style.display = 'none';
        } else {
          element.style.display = 'none';
        }
      });
    });
  }

  // Remove home feed timeline
  function removeHomeFeed() {
    const feedSelectors = [
      // Main timeline container
      '[data-testid="primaryColumn"] [role="main"]',
      '[data-testid="primaryColumn"] section[role="region"]',
      // Timeline itself
      '[data-testid="timeline"]',
      '[aria-label*="Timeline"]',
      // Home timeline specifically
      '[aria-label*="Home timeline"]',
      // Tweet containers
      'article[data-testid="tweet"]',
      'div[data-testid="cellInnerDiv"]'
    ];

    // Only remove feed on home page
    const isHomePage = window.location.pathname === '/home' || window.location.pathname === '/';
    
    if (isHomePage) {
      feedSelectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
          // Don't remove the compose tweet area
          if (!element.querySelector('[data-testid="tweetTextarea_0"]') && 
              !element.querySelector('[data-testid="tweet-text-editor"]')) {
            // Check if this is the main timeline container
            if (selector.includes('primaryColumn') || selector.includes('timeline')) {
              // Hide the timeline but keep the compose area
              const children = element.children;
              for (let child of children) {
                if (!child.querySelector('[data-testid="tweetTextarea_0"]') && 
                    !child.querySelector('[data-testid="tweet-text-editor"]') &&
                    !child.querySelector('[role="textbox"]')) {
                  child.style.display = 'none';
                }
              }
            } else {
              element.style.display = 'none';
            }
          }
        });
      });
    }
  }

  // Main function to apply all modifications
  function applyModifications() {
    if (config.redirectNotifications) {
      redirectNotificationsToHome();
    }
    
    if (config.removeNotifications) {
      removeNotificationButton();
    }
    
    if (config.removeHomeFeed) {
      removeHomeFeed();
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

  // Start observing
  function startObserving() {
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      applyModifications();
      startObserving();
    });
  } else {
    applyModifications();
    startObserving();
  }

  // Also run on page navigation (for SPA behavior)
  window.addEventListener('popstate', applyModifications);
  
  // Run periodically to catch any missed elements
  setInterval(applyModifications, 2000);
})();
