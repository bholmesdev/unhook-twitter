# Unhook Twitter

A Chrome extension that strips down the X.com (Twitter) interface to its bare essentials, helping you stay focused and avoid distractions.

## Features

- **🔕 Remove Notifications**: Completely removes the notification button from the sidebar across all X.com pages
- **🔄 Redirect Notifications**: Automatically redirects any notification page visits back to the home page
- **📝 Compose-Only Home**: Hides the entire home feed, leaving only the compose tweet area visible
- **🎯 Distraction-Free**: Also removes trending topics and "who to follow" suggestions

## Installation

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" by toggling the switch in the top right
3. Click "Load unpacked"
4. Select the `unhook-twitter` folder
5. The extension should now appear in your extensions list

## Usage

Once installed, the extension works automatically on:
- `https://x.com/*`
- `https://twitter.com/*`

## Files Structure

- `manifest.json` - Extension configuration
- `content.js` - Main logic for hiding elements
- `popup.html` - Extension popup interface

## Troubleshooting

- **Changes not appearing**: Refresh the X.com page
- **Extension not working**: Check if it's enabled in `chrome://extensions/`

## Privacy

This extension:
- ✅ Only runs on X.com and Twitter.com
- ✅ Does not collect or transmit any data
- ✅ Works entirely locally in your browser
- ✅ No external network requests

## License

MIT License - feel free to modify and distribute as needed.
