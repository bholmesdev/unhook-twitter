// Popup script for Unhook Twitter extension

document.addEventListener('DOMContentLoaded', function() {
  // Get elements
  const hideNotificationsToggle = document.getElementById('hideNotifications');
  const hideFeedDropdown = document.getElementById('hideFeedDropdown');
  const redirectNotificationsToggle = document.getElementById('redirectNotifications');
  const hideProfileToggle = document.getElementById('hideProfile');

  // Load saved settings
  chrome.storage.sync.get({
    hideNotifications: true,
    feedHideMode: 'home', // 'none', 'home', 'all'
    redirectNotifications: true,
    hideProfile: false
  }, function(items) {
    hideNotificationsToggle.checked = items.hideNotifications;
    hideFeedDropdown.value = items.feedHideMode;
    redirectNotificationsToggle.checked = items.redirectNotifications;
    hideProfileToggle.checked = items.hideProfile;
  });

  // Save settings when toggles change
  hideNotificationsToggle.addEventListener('change', function() {
    const settings = { hideNotifications: this.checked };
    chrome.storage.sync.set(settings);
    updateCSS();
  });

  hideFeedDropdown.addEventListener('change', function() {
    const settings = { feedHideMode: this.value };
    chrome.storage.sync.set(settings);
    updateCSS();
  });

  redirectNotificationsToggle.addEventListener('change', function() {
    const settings = { redirectNotifications: this.checked };
    chrome.storage.sync.set(settings);
    updateContentScript();
  });

  hideProfileToggle.addEventListener('change', function() {
    const settings = { hideProfile: this.checked };
    chrome.storage.sync.set(settings);
    updateCSS();
  });

  // Update CSS injection based on settings
  function updateCSS() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      if (tabs[0] && (tabs[0].url.includes('x.com') || tabs[0].url.includes('twitter.com'))) {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: 'updateCSS',
          settings: {
            hideNotifications: hideNotificationsToggle.checked,
            feedHideMode: hideFeedDropdown.value,
            hideProfile: hideProfileToggle.checked
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
