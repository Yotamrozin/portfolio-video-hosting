# Thumbnail Mouse Follow with Rotation - Implementation Guide

## Overview
This guide shows you how to add realistic rotation effects to your thumbnails that simulate physical movement as they follow the mouse. The rotation creates a "swaying" effect that makes the thumbnails feel more dynamic and responsive.

## 🎯 What This Adds
- **Rotation on X-axis**: Tilts up/down based on vertical mouse movement
- **Rotation on Y-axis**: Tilts left/right based on horizontal mouse movement  
- **Smooth interpolation**: Natural, physics-like movement
- **Boundary constraints**: Keeps thumbnails within list item bounds
- **Performance optimized**: Uses requestAnimationFrame and GSAP

## 🚀 Implementation Options

### Option 1: JavaScript Solution (Recommended)

#### Step 1: Add the Script
Include the `thumbnail-mouse-follow.js` file in your project:

```html
<!-- Add after GSAP but before closing </body> tag -->
<script src="thumbnail-mouse-follow.js"></script>
```

#### Step 2: HTML Structure
Ensure your HTML follows this pattern:

```html
<div class="project-list-item">
  <!-- Your existing content -->
  <div class="project-title">Project Name</div>
  <div class="project-description">Description...</div>
  
  <!-- Thumbnail with the special attribute -->
  <img hover-mouse-follow="thumbnail" 
       src="thumbnail.jpg" 
       alt="Project thumbnail" 
       class="project-thumbnail" />
</div>
```

#### Step 3: CSS (Optional Enhancement)
Add this CSS for better performance:

```css
[hover-mouse-follow="thumbnail"] {
  will-change: transform;
  backface-visibility: hidden;
  perspective: 1000px;
}

.project-list-item {
  position: relative;
  overflow: hidden;
}
```

### Option 2: Webflow Custom Code Solution

#### Step 1: Add Custom Code in Webflow
1. Go to **Project Settings** → **Custom Code**
2. Add this to the **Footer Code** section:

```html
<script>
// Paste the entire contents of thumbnail-mouse-follow.js here
// (Copy from the generated file)
</script>
```

#### Step 2: Set Up Elements in Webflow
1. **Create your list structure** in the Webflow Designer
2. **Add a custom attribute** to your thumbnail image:
   - Select the thumbnail image
   - In the Settings panel, add Custom Attribute:
     - Name: `hover-mouse-follow`
     - Value: `thumbnail`

#### Step 3: Style the Thumbnail
1. Set the thumbnail's initial **Scale** to `0` (it will animate to scale 1 on hover)
2. Set **Position** to `Absolute` if you want it to overlay content
3. Add **Transform Origin** as `Center Center`

## ⚙️ Configuration Options

You can customize the behavior by modifying the config object in the JavaScript:

```javascript
const config = {
  maxRotation: 8,        // Maximum rotation in degrees (try 5-15)
  maxTranslation: 15,    // Maximum movement in pixels (try 10-25)
  rotationDamping: 0.3,  // How much rotation is applied (0-1)
  followDamping: 0.15,   // How much the thumbnail follows mouse (0-1)
  animationSpeed: 0.6,   // Animation duration in seconds
  resetSpeed: 0.8,       // Speed when returning to center
  boundaryPadding: 20    // Padding from container edges
};
```

### Rotation Effect Explanations:

- **`maxRotation`**: Higher values = more dramatic tilting
- **`rotationDamping`**: Lower values = subtler rotation effect
- **`followDamping`**: Lower values = thumbnail follows mouse less aggressively
- **`animationSpeed`**: Faster = snappier scale-up animation
- **`boundaryPadding`**: Prevents thumbnail from touching container edges

## 🎨 Visual Effects Breakdown

### The Physics Simulation:
1. **Mouse moves right** → Thumbnail rotates slightly right (Y-axis)
2. **Mouse moves up** → Thumbnail tilts slightly up (X-axis)
3. **Mouse moves diagonally** → Combined rotation on both axes
4. **Smooth interpolation** → Movement feels natural, not jerky

### The Rotation Math:
```javascript
// Y-axis rotation (left/right tilt)
const rotationY = (mouseX / containerWidth) * maxRotation;

// X-axis rotation (up/down tilt) - inverted for natural feel
const rotationX = -(mouseY / containerHeight) * maxRotation;
```

## 🔧 Troubleshooting

### Common Issues:

1. **Thumbnail doesn't appear**
   - Check that GSAP is loaded before your script
   - Verify the `hover-mouse-follow="thumbnail"` attribute is set correctly

2. **Rotation is too subtle/dramatic**
   - Adjust `maxRotation` and `rotationDamping` values
   - Try values between 5-15 for `maxRotation`

3. **Movement feels jerky**
   - Increase the interpolation values (the `0.1` in the smooth interpolation)
   - Check that `requestAnimationFrame` is supported

4. **Thumbnail goes outside container**
   - Increase `boundaryPadding` value
   - Ensure parent container has `overflow: hidden`

### Performance Tips:
- The script uses `requestAnimationFrame` for smooth 60fps animation
- GSAP's `force3D: true` enables hardware acceleration
- Animation only runs when hovering (no unnecessary processing)

## 🎯 Expected Result

When working correctly, you should see:
1. **Hover over list item** → Thumbnail scales up from 0 to 1
2. **Move mouse around** → Thumbnail follows mouse with subtle rotation
3. **Mouse moves right** → Thumbnail tilts right slightly
4. **Mouse moves up** → Thumbnail tilts up slightly  
5. **Leave list item** → Thumbnail scales down and resets position/rotation

The rotation effect simulates the thumbnail being a physical object that sways as it moves, creating a more engaging and realistic interaction.

## 🔄 Integration with Existing Code

This solution is designed to work alongside your existing:
- GSAP scroll animations
- CSS hover effects
- Project hover managers

It specifically targets elements with `hover-mouse-follow="thumbnail"` so it won't interfere with other animations.

---

**Need to adjust the effect?** Modify the config values at the top of the JavaScript file to fine-tune the rotation intensity and movement behavior to match your design preferences.