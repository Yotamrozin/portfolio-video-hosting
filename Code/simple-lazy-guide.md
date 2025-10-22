# Simple Lazy Loading Implementation

## Overview
This is a minimal lazy loading system that follows the exact pattern you requested. It loads mobile/desktop content when the user scrolls past 500px.

## Quick Implementation

### 1. Include the Script
```html
<script src="simple-lazy-loader.js"></script>
```

### 2. Add Your Sections
```html
<!-- Mobile-only section -->
<div data-lazy-load="mobile">
    <!-- Your mobile content here -->
</div>

<!-- Desktop-only section -->
<div data-lazy-load="desktop">
    <!-- Your desktop content here -->
</div>

<!-- Both devices section -->
<div data-lazy-load="both">
    <!-- Your content for all devices -->
</div>
```

### 3. That's It!
The system automatically:
- Detects if the user is on mobile (width ≤ 768px) or desktop
- Loads sections with `data-lazy-load="mobile"` when scrolled past 500px on mobile
- Loads sections with `data-lazy-load="desktop"` when scrolled past 500px on desktop
- Loads sections with `data-lazy-load="both"` on both device types
- Only loads each section once

## How It Works

The system follows your exact pattern:

```javascript
window.addEventListener('scroll', function () {
    if (window.scrollY > 500) {
        // Find all sections with data-lazy-load attributes
        const sections = document.querySelectorAll('[data-lazy-load]');
        
        sections.forEach(section => {
            const loadType = section.getAttribute('data-lazy-load');
            // Load based on device type and loadType
        });
    }
});
```

## External Content Loading

If you want to load content from external files, modify the `getContentSource()` method in `simple-lazy-loader.js`:

```javascript
getContentSource(type) {
    switch (type) {
        case 'mobile':
            return '/path/to/mobile-projects.html';
        case 'desktop':
            return '/path/to/craft-mobile.html';
        default:
            return null; // Use inline content
    }
}
```

## Testing

1. Open `simple-lazy-demo.html` in your browser
2. Scroll down past 500px
3. Watch the appropriate content load based on your device type
4. Resize your browser window to test device detection

## Benefits

- **Minimal code** - Only ~80 lines
- **Follows your pattern** - Uses the exact scroll-based approach you requested
- **Device-aware** - Automatically detects mobile vs desktop
- **Performance** - Only loads content when needed
- **Simple** - Easy to understand and modify

## File Structure
```
Code/
├── simple-lazy-loader.js    # Main simple lazy loader
├── simple-lazy-demo.html    # Demo page
└── simple-lazy-guide.md     # This guide
```

This is much simpler than the full-featured system and does exactly what you asked for!
