# Modal System Documentation

## Overview
The Better Auth project uses a beautiful, custom modal system instead of browser default `alert()` and `confirm()` popups. The modal system provides a consistent, modern UI across all pages.

## Features
- ✨ Beautiful Material Design modals with animations
- 🎨 Dark/Light theme support (matches current theme)
- 🔔 4 modal types: Alert, Confirm, Success, Error
- ⌨️ Keyboard support (ESC to close)
- 📱 Responsive and mobile-friendly
- 🎯 Global - works on all pages automatically

## Modal Types

### 1. Alert Modal (Information)
```javascript
showAlert('Your message here', 'Optional Title');
// or simply
alert('Your message here');
```

### 2. Confirm Modal (Yes/No)
```javascript
const confirmed = await showConfirm('Are you sure?', null, 'Optional Title');
if (confirmed) {
    // User clicked Confirm
} else {
    // User clicked Cancel
}
```

### 3. Success Modal
```javascript
showSuccess('Operation completed successfully!', 'Success');
```

### 4. Error Modal
```javascript
showError('Something went wrong', 'Error');
```

## Implementation
The modal system is automatically loaded on all pages via `modal-system.js`:

```html
<script src="/modal-system.js"></script>
```

## Styling
Modals automatically inherit theme colors:
- `--bg-secondary`: Modal background
- `--border-color`: Modal border
- `--text-primary`: Heading text
- `--text-secondary`: Body text
- `--accent-primary`: Info icon color
- `--warning`: Warning icon color
- `--success`: Success icon color
- `--error`: Error icon color

## Icons
All modals use Font Awesome icons:
- **Alert**: `fa-info-circle`
- **Confirm**: `fa-exclamation-triangle`
- **Success**: `fa-check-circle`
- **Error**: `fa-times-circle`

## Usage in Project

### Admin Dashboard
- User creation success/error
- User update success/error
- User deletion confirmation
- Session revocation confirmation
- Sign out confirmation
- Access denied errors

### Dashboard
- Email verification sent
- Email verification errors
- Network errors

## Migration from Browser Alerts
All instances of `alert()` and `confirm()` have been replaced:
- `alert()` → `showAlert()` or `showError()` or `showSuccess()`
- `confirm()` → `await showConfirm()`

## Customization
To customize modal appearance, edit `/public/modal-system.js`:
- Modify styles in `addModalStyles()` function
- Adjust animations (fadeIn, slideUp)
- Change modal sizes, colors, or icons
