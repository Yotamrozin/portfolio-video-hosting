# Page Load Tracker Implementation Guide

## Overview
The Page Load Tracker accurately monitors the loading progress of all page assets including:
- Images (including background images)
- Videos and audio files
- Stylesheets and scripts
- Iframes
- Resources loaded via fetch/XHR

## Quick Start

### 1. HTML Structure
Add these data attributes to your existing loader elements:

```html
<div class="loader" data-loader>
  <div class="loader-percent" data-loader-percent>0%</div>
  <div class="loader-bar-container">
    <div class="loader-bar" data-loader-bar></div>
  </div>
</div>
```

**Required attributes:**
- `data-loader-percent` - Element that displays the percentage text
- `data-loader-bar` - Element that shows the progress (width will be updated)
- `data-loader` (optional) - The main loader container for fade out

### 2. Include the Script
Add the script to your page (before closing `</body>`):

```html
<script src="page-load-tracker.js"></script>
```

### 3. Basic CSS
The script updates the progress bar's width automatically:

```css
.loader-bar {
  width: 0%; /* Will be updated by the script */
  height: 100%;
  background: #4f46e5;
  transition: width 0.3s ease-out;
}
```

## How It Works

### Progress Calculation
The tracker uses a weighted system:

1. **DOM Progress (0-50%)**
   - 10% - Document starts loading
   - 30% - DOM is interactive
   - 50% - Document is complete

2. **Resource Progress (0-50%)**
   - Tracks all assets
   - Each asset contributes equally to the 50%
   - Final progress = DOM Progress + Resource Progress

### Tracking Methods

1. **DOM Scanning**
   - Scans for `<img>`, `<video>`, `<audio>`, `<script>`, `<link>`, `<iframe>`
   - Checks CSS background-images
   - Monitors element load/error events

2. **Performance API**
   - Uses PerformanceObserver to track network requests
   - Captures dynamically loaded resources
   - Tracks resources loaded before script initialization

3. **Ready State Monitoring**
   - Monitors `document.readyState` changes
   - Ensures progression through loading stages

## Configuration

You can customize the behavior by modifying the config object in the script:

```javascript
this.config = {
  minDisplayTime: 500,    // Minimum time to show loader (ms)
  fadeOutDuration: 400,   // Fade out animation duration (ms)
  updateThrottle: 16,     // Update UI every 16ms (60fps)
};
```

## Advanced Usage

### Manual Control

```javascript
// Access the tracker instance
const tracker = window.pageLoadTracker;

// Set specific progress
tracker.setProgress(75); // Sets to 75%

// Force hide the loader
tracker.hide();
```

### Listen for Completion

```javascript
document.addEventListener('pageLoadComplete', () => {
  console.log('All assets loaded!');
  // Start your app animations
  // Initialize interactive features
});
```

### Custom Styling Options

#### Horizontal Progress Bar (Default)
```css
.loader-bar {
  width: 0%;
  height: 4px;
  background: linear-gradient(90deg, #4f46e5, #7c3aed);
  transition: width 0.3s ease-out;
}
```

#### Vertical Progress Bar
Modify the script to use height instead of width:
```javascript
// In updateUI method, change this line:
this.barElement.style.height = `${percentage}%`;
```

```css
.loader-bar {
  width: 100%;
  height: 0%;
  background: linear-gradient(180deg, #4f46e5, #7c3aed);
  transition: height 0.3s ease-out;
}
```

#### Circular Progress
Use the custom CSS property `--progress`:

```css
.loader-bar-container {
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background: conic-gradient(
    #7c3aed 0deg,
    #7c3aed calc(var(--progress, 0) * 3.6deg),
    #e0e0e0 calc(var(--progress, 0) * 3.6deg)
  );
}
```

## Integration with Webflow

If using Webflow:

1. Add custom attributes in Webflow Designer:
   - Select your percentage text → Add custom attribute: `data-loader-percent`
   - Select your progress bar → Add custom attribute: `data-loader-bar`
   - Select your loader container → Add custom attribute: `data-loader`

2. In Project Settings → Custom Code → Footer Code:
```html
<script src="https://your-cdn.com/page-load-tracker.js"></script>
```

## Troubleshooting

### Loader doesn't update
- Check browser console for warnings
- Ensure data attributes are correctly added
- Verify elements exist when script runs

### Progress jumps to 100% too quickly
- Increase `minDisplayTime` in config
- Check if resources are cached (faster load)
- Resources may be loading from cache

### Progress gets stuck
- Check for resources that fail to load
- The script counts failed resources as loaded to prevent hanging
- Fallback timeout is set at 3 seconds after window.load

### Video progress not tracking
- Ensure videos have `preload="auto"` or `preload="metadata"`
- Videos without preload won't load until played

## Performance Considerations

- Script is lightweight (~6KB unminified)
- UI updates are throttled to 60fps
- PerformanceObserver has minimal overhead
- Event listeners are cleaned up after use

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Graceful degradation for older browsers
- PerformanceObserver is optional (fallback included)

## Best Practices

1. **Preload Critical Resources**
   ```html
   <link rel="preload" href="hero-image.jpg" as="image">
   <link rel="preload" href="hero-video.webm" as="video">
   ```

2. **Optimize Assets**
   - Compress images and videos
   - Use modern formats (WebP, WebM)
   - Lazy load non-critical content

3. **Set Video Preload**
   ```html
   <video preload="metadata">
   <!-- or -->
   <video preload="auto">
   ```

4. **Handle Failed Loads**
   - Script automatically handles this
   - Failed resources count as "loaded"

5. **Test with Throttling**
   - Use DevTools Network throttling
   - Test on slow 3G to see the loader in action

## Example Integration

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    .loader {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: white;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
    }
    
    .loader-percent {
      font-size: 48px;
      font-weight: 700;
      margin-bottom: 20px;
    }
    
    .loader-bar-container {
      width: 300px;
      height: 4px;
      background: #e0e0e0;
      border-radius: 2px;
      overflow: hidden;
    }
    
    .loader-bar {
      height: 100%;
      background: #4f46e5;
      transition: width 0.3s ease;
    }
  </style>
</head>
<body>
  
  <div class="loader" data-loader>
    <div>
      <div class="loader-percent" data-loader-percent>0%</div>
      <div class="loader-bar-container">
        <div class="loader-bar" data-loader-bar></div>
      </div>
    </div>
  </div>

  <!-- Your page content -->
  <img src="large-image.jpg">
  <video src="video.webm" preload="auto"></video>
  
  <!-- Scripts -->
  <script src="page-load-tracker.js"></script>
  
</body>
</html>
```

## License
Free to use in personal and commercial projects.

