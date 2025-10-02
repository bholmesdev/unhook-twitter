# Unhook Twitter

A Chrome extension that strips down the X.com (Twitter) interface to its bare essentials, helping you stay focused and avoid distractions.

## Features

Unhook Twitter is fully configurable from the extension panel.

- **🔕 Hide Notifications**: Removes the notification button from the sidebar
- **📝 Hide Feeds**: Choose to hide your home feed or all feeds across profiles
  - Hides the home timeline while keeping the compose area, so you can focus on writing, not consuming.
  - Also hides trending topics and "who to follow" suggestions.

## Manual Installation

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
