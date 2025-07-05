// Unhook Twitter - Background Service Worker
// Minimal background script

chrome.runtime.onInstalled.addListener(() => {
  console.log('Unhook Twitter extension installed');
});

// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'log') {
    console.log('Unhook Twitter:', request.message);
  }
});
