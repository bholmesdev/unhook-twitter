// Popup script for Unhook Twitter extension

document.addEventListener('DOMContentLoaded', function() {
  // Get toggle elements
  const hideNotificationsToggle = document.getElementById('hideNotifications');
  const hideHomeFeedToggle = document.getElementById('hideHomeFeed');
  const redirectNotificationsToggle = document.getElementById('redirectNotifications');

  // Load saved settings
  chrome.storage.sync.get({
    hideNotifications: true,
    hideHomeFeed: true,
    redirectNotifications: true
  }, function(items) {
    hideNotificationsToggle.checked = items.hideNotifications;
    hideHomeFeedToggle.checked = items.hideHomeFeed;
    redirectNotificationsToggle.checked = items.redirectNotifications;
  });

  // Save settings when toggles change
  hideNotificationsToggle.addEventListener('change', function() {
    const settings = { hideNotifications: this.checked };
    chrome.storage.sync.set(settings);
    updateCSS();
  });

  hideHomeFeedToggle.addEventListener('change', function() {
    const settings = { hideHomeFeed: this.checked };
    chrome.storage.sync.set(settings);
    updateCSS();
  });

  redirectNotificationsToggle.addEventListener('change', function() {
    const settings = { redirectNotifications: this.checked };
    chrome.storage.sync.set(settings);
    updateContentScript();
  });

  // Update CSS injection based on settings
  function updateCSS() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      if (tabs[0] && (tabs[0].url.includes('x.com') || tabs[0].url.includes('twitter.com'))) {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: 'updateCSS',
          settings: {
            hideNotifications: hideNotificationsToggle.checked,
            hideHomeFeed: hideHomeFeedToggle.checked
          }
        });
      }
    });
  }

  // Update content script behavior
  function updateContentScript() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      if (tabs[0] && (tabs[0].url.includes('x.com') || tabs[0].url.includes('twitter.com'))) {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: 'updateSettings',
          settings: {
            redirectNotifications: redirectNotificationsToggle.checked
          }
        });
      }
    });
  }
});
