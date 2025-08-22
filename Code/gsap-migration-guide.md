# GSAP Migration Guide

## Overview
This guide helps you migrate from the CSS-based scroll animation system to the new GSAP-powered system while maintaining your existing custom attribute approach.

## Why Migrate to GSAP?

### Performance Benefits
- **60fps animations**: GSAP is optimized for smooth, high-performance animations
- **Better memory management**: More efficient than CSS transitions for complex sequences
- **Hardware acceleration**: Automatic GPU acceleration when beneficial

### Feature Improvements
- **Built-in stagger**: Native stagger functionality with advanced configuration
- **Precise timing control**: Fine-tuned easing and duration control
- **Better cross-browser support**: Consistent behavior across all browsers
- **Advanced easing**: Access to sophisticated easing functions like `back.out()`

### Developer Experience
- **Debugging tools**: Better debugging with GSAP DevTools
- **Timeline control**: Advanced sequencing capabilities
- **Dynamic updates**: Easy to modify animations at runtime

## Migration Steps

### 1. Add GSAP CDN Links

Replace or add these script tags in your HTML `<head>` section:

```html
<!-- GSAP Core -->
<script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js"></script>
<!-- ScrollTrigger Plugin -->
<script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/ScrollTrigger.min.js"></script>
```

### 2. Replace Animation System

**Old CSS System:**
```html
<script src="scroll-animation.js"></script>
<link rel="stylesheet" href="css-animation-system.css">
```

**New GSAP System:**
```html
<script src="gsap-scroll-animation.js"></script>
```

### 3. HTML Attributes (No Changes Required!)

Your existing HTML attributes work exactly the same:

```html
<!-- Single animations -->
<div scroll-animate="slide-up">Content</div>
<div scroll-animate="fade-in">Content</div>
<div scroll-animate="slide-up-backout">Content</div>

<!-- Stagger animations -->
<div scroll-animate="slide-up-stagger">
    <div stagger-item>Item 1</div>
    <div stagger-item>Item 2</div>
    <div stagger-item>Item 3</div>
</div>
```

## Animation Mapping

### Supported Animations

| Animation Type | CSS System | GSAP System | Notes |
|----------------|------------|-------------|---------|
| `slide-up` | ✅ | ✅ | Improved easing |
| `slide-down` | ✅ | ✅ | Improved easing |
| `slide-left` | ✅ | ✅ | Improved easing |
| `slide-right` | ✅ | ✅ | Improved easing |
| `fade-in` | ✅ | ✅ | Smoother transitions |
| `scale-up` | ✅ | ✅ | Better scaling |
| `slide-up-backout` | ✅ | ✅ | Enhanced bounce effect |
| `scale-up-backout` | ✅ | ✅ | Enhanced bounce effect |

### Stagger Improvements

| Feature | CSS System | GSAP System |
|---------|------------|-------------|
| Stagger timing | Fixed CSS delays | Dynamic, configurable |
| Performance | CSS transitions | Hardware-accelerated |
| Easing | Limited options | Advanced easing functions |
| Debugging | Browser inspector | GSAP DevTools |
| Reverse animations | Basic | Smooth reverse on scroll up |

## Configuration Differences

### Timing Changes

**CSS System:**
- Base duration: 0.6s
- Stagger delays: 0.05s - 0.4s
- Backout duration: 0.8s

**GSAP System:**
- Base duration: 0.6s (same)
- Stagger delays: 0.05s each (faster, more responsive)
- Backout duration: 0.8s (same)
- Better easing: `power2.out` and `back.out(1.7)`

### Viewport Triggers

**CSS System:**
- Trigger: When element enters viewport
- Threshold: 80% viewport height

**GSAP System:**
- Trigger: `start: 'top 80%'`
- End: `end: 'bottom 20%'`
- Toggle actions: `play none none reverse`
- Automatic reverse when scrolling up

## Testing Your Migration

### 1. Side-by-Side Comparison

Create a test page with both systems to compare:

```html
<!-- Test with CSS system -->
<div class="css-test" scroll-animate="slide-up">CSS Animation</div>

<!-- Test with GSAP system -->
<div class="gsap-test" scroll-animate="slide-up">GSAP Animation</div>
```

### 2. Performance Testing

Use browser DevTools to compare:
- **Performance tab**: Check frame rates during animations
- **Memory tab**: Monitor memory usage
- **Network tab**: Compare file sizes

### 3. Cross-browser Testing

Test on:
- Chrome/Edge (Chromium)
- Firefox
- Safari
- Mobile browsers

## Troubleshooting

### Common Issues

**1. Animations not triggering**
```javascript
// Add this to debug
ScrollTrigger.refresh();
console.log('ScrollTrigger refreshed');
```

**2. Stagger children not found**
- Ensure `stagger-item` attributes are present
- Check console for "Found X stagger items" messages

**3. Performance issues**
- Reduce stagger timing: `each: 0.03` instead of `each: 0.05`
- Use `will-change: transform` CSS for animated elements

### Debug Mode

Enable markers for debugging:

```javascript
// In gsap-scroll-animation.js, uncomment:
// markers: true
```

## Rollback Plan

If you need to rollback:

1. Remove GSAP script tags
2. Re-add CSS animation system files
3. Your HTML attributes remain unchanged

## Advanced Customization

### Custom Animation Types

Add new animations to `animationConfig`:

```javascript
const animationConfig = {
  // ... existing animations
  'custom-bounce': {
    from: { y: 50, scale: 0.8, opacity: 0 },
    to: { y: 0, scale: 1, opacity: 1, duration: 1, ease: 'elastic.out(1, 0.3)' }
  }
};
```

### Custom Stagger Timing

Modify stagger configuration:

```javascript
const staggerConfig = {
  each: 0.1, // Time between each element
  from: 'center', // Start from center
  ease: 'power2.inOut'
};
```

## Support

For issues or questions:
1. Check browser console for error messages
2. Verify GSAP CDN links are loading
3. Test with the provided demo file: `gsap-scroll-demo.html`

## Next Steps

1. Test the new system with `gsap-scroll-demo.html`
2. Gradually migrate pages one at a time
3. Monitor performance improvements
4. Consider adding custom animations for enhanced effects