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

### What it does:

1. **Removes notification button**: The notification bell icon is completely hidden from the sidebar navigation
2. **Redirects notification pages**: If you somehow navigate to `/notifications`, you'll be redirected to `/home`
3. **Hides home feed**: On the home page, all tweets are hidden, leaving only the compose area
4. **Removes distractions**: Trending topics and suggested follows are also hidden

### To verify it's working:

1. Visit `https://x.com/home`
2. You should see:
   - ✅ No notification button in the sidebar
   - ✅ Only the compose tweet area (no timeline)
   - ✅ No trending topics or suggestions
3. Try visiting `https://x.com/notifications` - you should be redirected to home

## Customization

You can modify the behavior by editing the configuration in `content.js`:

```javascript
const config = {
  removeNotifications: true,    // Hide notification button
  removeHomeFeed: true,         // Hide home timeline
  redirectNotifications: true   // Redirect notification pages
};
```

## Files Structure

- `manifest.json` - Extension configuration
- `content.js` - Main logic for hiding elements
- `styles.css` - Additional CSS rules
- `background.js` - Background service worker
- `popup.html` - Extension popup interface

## Troubleshooting

- **Changes not appearing**: Refresh the X.com page
- **Extension not working**: Check if it's enabled in `chrome://extensions/`
- **Elements still visible**: X.com frequently changes their HTML structure. The extension may need updates to adapt to new layouts.

## Privacy

This extension:
- ✅ Only runs on X.com and Twitter.com
- ✅ Does not collect or transmit any data
- ✅ Works entirely locally in your browser
- ✅ No external network requests

## License

MIT License - feel free to modify and distribute as needed.
