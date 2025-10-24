# Lottie Animation Integration Guide

## Overview
The page load tracker now supports syncing Lottie animations to loading progress and includes a smooth slide-out animation instead of fade.

## Features Added

### 1. Lottie Progress Sync with Smooth Easing
- Lottie animation frame updates based on loading percentage
- **Smooth easing curves** prevent abrupt frame jumps
- Multiple easing types: cubic, quart, expo, bounce, elastic
- When loading reaches 100%, animation smoothly reaches the final frame
- Multiple detection methods for different Lottie implementations

### 2. Slide-Out Animation
- Replaced fade-out with smooth slide-to-right reveal
- Uses `transform: translateX(100%)` for hardware acceleration
- Smooth cubic-bezier easing for professional feel

## Implementation

### HTML Structure
Add the `data-loader="lottie"` attribute to your Lottie element:

```html
<div class="loader" data-loader>
  <!-- Your Lottie animation -->
  <div data-loader="lottie" id="lottie-loader"></div>
  
  <!-- Progress elements -->
  <div class="loader-percent" data-loader-percent>0%</div>
  <div class="loader-bar-container">
    <div class="loader-bar" data-loader-bar></div>
  </div>
</div>
```

### CSS for Slide Animation
Ensure your loader has proper positioning for the slide effect:

```css
.loader {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: #ffffff;
  z-index: 9999;
  /* Ensure smooth transforms */
  will-change: transform;
  backface-visibility: hidden;
}
```

### Lottie Integration Methods

The script automatically detects Lottie animations using multiple methods:

#### Method 1: Direct Lottie Instance
```javascript
// If your Lottie element has goToAndStop method directly
const lottieElement = document.getElementById('lottie-loader');
// Script will detect and use it
```

#### Method 2: Lottie Property
```javascript
// If Lottie instance is stored in .lottie property
lottieElement.lottie = animationInstance;
```

#### Method 3: Data Attribute
```html
<div data-loader="lottie" data-lottie="my-animation"></div>
```

## How It Works

### Progress Sync with Easing
1. **0% Loading** → Lottie shows frame 0 (slow start)
2. **50% Loading** → Lottie shows middle frame (fast middle)
3. **100% Loading** → Lottie shows final frame (slow end)
4. **Slide Out** → Entire loader slides right, revealing hero

### Animation Flow with Easing
```
Loading Progress: 0% → 25% → 50% → 75% → 100%
Raw Frame:       0   → 25   → 50   → 75   → 100
Eased Frame:     0   → 15   → 50   → 85   → 100  (smooth curve)
Loader Action:   Show → Update → Update → Update → Slide Right
```

### Available Easing Types
- **`easeInOutCubic`** (default) - Smooth S-curve, slow start/end
- **`easeInOutQuart`** - Even smoother acceleration/deceleration  
- **`easeInOutExpo`** - Very smooth, almost linear in middle
- **`easeOutBounce`** - Playful bounce effect at the end
- **`easeOutElastic`** - Elastic spring effect
- **`linear`** - No easing, direct frame mapping

## Troubleshooting

### Lottie Not Syncing
1. **Check Console**: Look for "Lottie animation found" message
2. **Verify Element**: Ensure `data-loader="lottie"` is on the correct element
3. **Lottie Ready**: Make sure Lottie is loaded before the tracker initializes

### Slide Animation Issues
1. **CSS Conflicts**: Ensure no conflicting `transform` styles
2. **Z-Index**: Verify loader has higher z-index than hero content
3. **Position**: Check that loader is `position: fixed`

### Debug Commands
```javascript
// Check if Lottie is detected
console.log(window.pageLoadTracker.lottieAnimation);

// Manually test Lottie sync
window.pageLoadTracker.updateLottieProgress(0.5); // 50%

// Test slide animation
window.pageLoadTracker.fadeOutLoader();

// Change easing type
window.pageLoadTracker.setLottieEasing('easeOutBounce');

// Test different easing types
window.pageLoadTracker.setLottieEasing('easeInOutExpo');
```

## Advanced Customization

### Lottie Easing Control
Change the easing type dynamically:
```javascript
// Set easing type (default: 'easeInOutCubic')
window.pageLoadTracker.setLottieEasing('easeOutBounce');

// Available easing types:
// - 'easeInOutCubic' (default) - Smooth S-curve
// - 'easeInOutQuart' - Even smoother
// - 'easeInOutExpo' - Very smooth, linear middle
// - 'easeOutBounce' - Playful bounce at end
// - 'easeOutElastic' - Elastic spring effect
// - 'linear' - No easing
```

### Custom Slide Animation Easing
Modify the slide animation easing in the script:
```javascript
// In fadeOutLoader() method, line ~447
this.loaderElement.style.transition = `transform ${this.config.fadeOutDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`;
```

### Different Slide Directions
Change `translateX(100%)` to:
- `translateX(-100%)` - Slide left
- `translateY(100%)` - Slide down  
- `translateY(-100%)` - Slide up

### Lottie Frame Rate Control
The script automatically calculates frames with easing, but you can override:
```javascript
// In updateLottieProgress() method
const totalFrames = 120; // Force specific frame count
const easedProgress = this.easeProgress(progress);
const targetFrame = Math.floor(easedProgress * totalFrames);
```

## Performance Notes

- **Hardware Acceleration**: Uses `transform` for smooth 60fps animation
- **Will-Change**: Automatically optimizes for transform animations
- **Frame Calculation**: Efficiently calculates target frames without performance impact
- **Error Handling**: Gracefully handles Lottie loading delays

## Browser Support

- **Modern Browsers**: Full support for transform animations
- **Lottie**: Compatible with Lottie Web v5.7+
- **Fallback**: Graceful degradation if Lottie not available

## Example Complete Setup

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
      background: #ffffff;
      z-index: 9999;
      will-change: transform;
    }
    
    .loader-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
    }
    
    #lottie-loader {
      width: 200px;
      height: 200px;
    }
    
    .loader-percent {
      font-size: 48px;
      margin-top: 20px;
    }
  </style>
</head>
<body>
  
  <div class="loader" data-loader>
    <div class="loader-content">
      <div data-loader="lottie" id="lottie-loader"></div>
      <div class="loader-percent" data-loader-percent>0%</div>
    </div>
  </div>

  <!-- Your page content -->
  <div class="hero">
    <h1>Welcome!</h1>
  </div>

  <!-- Scripts -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/lottie-web/5.12.2/lottie.min.js"></script>
  <script src="page-load-tracker.js"></script>
  
  <script>
    // Initialize Lottie
    const animation = lottie.loadAnimation({
      container: document.getElementById('lottie-loader'),
      renderer: 'svg',
      loop: false,
      autoplay: false,
      path: 'path/to/your/animation.json'
    });
    
    // The page load tracker will automatically sync this animation
  </script>
  
</body>
</html>
```

This setup provides a smooth, professional loading experience with your Lottie animation perfectly synced to the actual loading progress!
