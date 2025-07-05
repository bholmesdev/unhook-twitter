// Unhook Twitter - Content Script
// Handles redirects and title cleanup (CSS handles visual hiding)

(function() {
  'use strict';
  
  // Configuration
  const config = {
    redirectNotifications: true,
    cleanTitle: true
  };

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
    
    if (config.removeNotifications) {
      removeNotificationButton();
    }
    
    if (config.removeHomeFeed) {
      removeHomeFeed();
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
