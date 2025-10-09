# Rive Animation Modification Guide

## Quick Reference: What to Change

For each of your 3 Rive animation scripts, make these two simple changes:

### Change 1: Disable Autoplay
Find this line:
```javascript
autoplay: true,
```

Change it to:
```javascript
autoplay: false,
```

### Change 2: Register the Instance
Find this line (usually near the end of the script):
```javascript
window._rive = r;
```

Change it to:
```javascript
window.riveInstances = window.riveInstances || [];
window.riveInstances.push(r);
```

---

## Complete Example

Here's your Yellow eye animation with the changes applied:

### BEFORE:
```javascript
const r = new rive.Rive({
  src: "https://cdn.prod.website-files.com/686fe533f545b4826346b826/68caa508fd7db26cfd74ed21_eye-yellow.riv",
  canvas: canvas,
  autoplay: true,  // ← CHANGE THIS
  stateMachines: "eye-stateMachine",
  // ... rest of config
});

window._rive = r;  // ← CHANGE THIS
```

### AFTER:
```javascript
const r = new rive.Rive({
  src: "https://cdn.prod.website-files.com/686fe533f545b4826346b826/68caa508fd7db26cfd74ed21_eye-yellow.riv",
  canvas: canvas,
  autoplay: false,  // ← CHANGED
  stateMachines: "eye-stateMachine",
  // ... rest of config
});

window.riveInstances = window.riveInstances || [];  // ← CHANGED
window.riveInstances.push(r);  // ← CHANGED
```

---

## What This Does

1. **`autoplay: false`** - Prevents the animation from starting immediately when loaded
2. **`window.riveInstances.push(r)`** - Adds each Rive instance to a global array
3. The page loader will automatically call `.play()` on all instances when loading completes

## Apply to All 3 Animations

Make these same changes to:
- Yellow eye animation
- Blue eye animation  
- Red eye animation (or whatever your third animation is)

All three will now:
- Load silently during page load
- Wait until the loader reaches 100%
- Start playing simultaneously for a synchronized effect

---

## Testing

After making these changes:
1. Refresh your page
2. You should see the loader counting up smoothly
3. Rive animations should NOT play during loading
4. When loader fades out, all 3 Rive animations should start together
5. Check console for "Started Rive animation 1/2/3" messages

