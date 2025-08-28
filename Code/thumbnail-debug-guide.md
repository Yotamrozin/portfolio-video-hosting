# 🔧 Thumbnail Debug Guide

Based on your console output, the thumbnails are invisible because they have `scale: 0` and `opacity: 0`. This guide will help you diagnose and fix the issue.

## 🚨 Current Issue Analysis

From your debug output:
```
GSAP Properties: {rotationX: 0, rotationY: 0, scale: 0, x: 305.404, y: 0}
Bounding Rect: {width: 0, height: 0, ...}
```

**Problem**: Thumbnails are initialized with `scale: 0` and only become visible on hover, but the hover events aren't triggering properly.

## 🔍 Step 1: Run Debug Script

1. Open browser console (F12)
2. Copy and paste this command:

```javascript
// Load the debug script
fetch('/debug-thumbnails.js')
  .then(response => response.text())
  .then(script => eval(script))
  .catch(err => console.error('Failed to load debug script:', err));
```

3. Look for output like:
   - `📊 Found X thumbnails`
   - `✅ GSAP is loaded`
   - `🎯 GSAP Properties for thumbnail X`

## 🔍 Step 2: Test Manual Show/Hide

In the console, run:

```javascript
// Force show all thumbnails
forceShowThumbnails();

// Wait 3 seconds, then hide them
setTimeout(() => forceHideThumbnails(), 3000);
```

**Expected**: Thumbnails should appear and then disappear.

## 🔍 Step 3: Test Individual Animation

```javascript
// Test animation on first thumbnail
testThumbnailAnimation(0);
```

**Expected**: First thumbnail should animate in, stay for 2 seconds, then animate out.

## 🔍 Step 4: Test Hover Events

Run this in console to monitor hover events:

```javascript
// Monitor all mouse events on project items
document.querySelectorAll('.project-list-item').forEach((item, index) => {
  item.addEventListener('mouseenter', () => {
    console.log(`🐭 ENTER: Project item ${index}`);
  });
  
  item.addEventListener('mouseleave', () => {
    console.log(`🐭 LEAVE: Project item ${index}`);
  });
  
  item.addEventListener('mousemove', (e) => {
    console.log(`🐭 MOVE: Project item ${index}`, e.clientX, e.clientY);
  });
});
```

Then hover over the project items and check if events are logged.

## 🔧 Quick Fixes to Try

### Fix 1: Force Initial Visibility

```javascript
// Make thumbnails visible by default for testing
document.querySelectorAll('[hover-mouse-follow="thumbnail"]').forEach(thumb => {
  gsap.set(thumb, {
    scale: 0.5,  // Half size but visible
    opacity: 0.5 // Semi-transparent but visible
  });
});
```

### Fix 2: Reset All Animations

```javascript
// Kill all GSAP animations and reset
gsap.killTweensOf("[hover-mouse-follow='thumbnail']");

document.querySelectorAll('[hover-mouse-follow="thumbnail"]').forEach(thumb => {
  gsap.set(thumb, {
    clearProps: "all",
    scale: 1,
    opacity: 1,
    rotationX: 0,
    rotationY: 0
  });
});
```

### Fix 3: Check CSS Conflicts

```javascript
// Check for CSS conflicts
document.querySelectorAll('[hover-mouse-follow="thumbnail"]').forEach((thumb, index) => {
  const computed = getComputedStyle(thumb);
  console.log(`CSS for thumbnail ${index}:`, {
    transform: computed.transform,
    opacity: computed.opacity,
    display: computed.display,
    visibility: computed.visibility,
    position: computed.position
  });
});
```

## 🎯 Expected Behavior

1. **On page load**: Thumbnails should be invisible (`scale: 0, opacity: 0`)
2. **On hover**: Thumbnails should animate to visible (`scale: 1, opacity: 1`)
3. **During hover**: Rotation should follow mouse movement
4. **On leave**: Thumbnails should animate back to invisible

## 🚨 Common Issues & Solutions

### Issue: "No thumbnails found"
**Solution**: Check HTML structure has `hover-mouse-follow="thumbnail"` attribute

### Issue: "GSAP not loaded"
**Solution**: Ensure GSAP script is loaded before thumbnail script

### Issue: "Hover events not firing"
**Solutions**:
- Check if parent elements have correct classes
- Ensure thumbnails aren't blocking mouse events
- Check CSS `pointer-events` property

### Issue: "Thumbnails stay invisible"
**Solutions**:
- Run `forceShowThumbnails()` to test GSAP functionality
- Check for CSS conflicts overriding GSAP
- Verify no other scripts are interfering

### Issue: "Rapid flickering"
**Solutions**:
- Check for multiple event listeners
- Ensure no CSS transitions conflict with GSAP
- Verify `clearProps` is working

## 📋 Diagnostic Checklist

- [ ] GSAP is loaded
- [ ] Thumbnails found with correct attribute
- [ ] Parent containers found
- [ ] Initial GSAP properties set correctly
- [ ] Hover events fire on parent containers
- [ ] Manual show/hide functions work
- [ ] No CSS conflicts
- [ ] No console errors

## 🔄 Next Steps

1. Run through all diagnostic steps
2. Report which tests pass/fail
3. Share any new console output
4. Try the quick fixes that seem relevant

This will help identify the exact cause of the thumbnail visibility issue!