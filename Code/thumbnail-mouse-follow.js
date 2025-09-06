/**
 * Thumbnail Rotation System
 * Adds realistic rotation effects to thumbnails based on mouse movement
 * Works alongside Webflow Interactions for position and scale
 * Compatible with existing hover-mouse-follow="thumbnail" attributes
 */

document.addEventListener("DOMContentLoaded", function() {
  // Throttle function
  function throttle(func, limit) {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    }
  }

  // Configuration object for easy customization
  const config = {
    maxRotation: 25,
    resetSpeed: 0.8,
    smoothingFactor: 0.8,
    rotationDamping: 0.8,
    maxMoveLeftPercent: 0.25,
    maxMoveRightPercent: 0.8,
    maxMoveUpPercent: 0.2,
    maxMoveDownPercent: 0.2,
    leftMovementMultiplier: 0.3,
    rightMovementMultiplier: 0.8,
    verticalMovementMultiplier: 0.4,
    followStrength: 50,
    rotationStrength: 15,
    // New Fiddle Digital inspired settings
    velocity: {
      enabled: true,
      skewMultiplier: 0.3,
      scaleMultiplier: 0.05,
      maxSkew: 15,
      maxScale: 0.2
    },
    parallax: {
      enabled: true,
      strength: 0.1
    },
    lerp: {
      position: 0.1,
      velocity: 0.08
    }
  };

  // Mouse tracking variables
  let mouseX = 0;
  let mouseY = 0;
  let prevMouseX = 0;
  let prevMouseY = 0;
  let velocityX = 0;
  let velocityY = 0;
  let lerpedVelocityX = 0;
  let lerpedVelocityY = 0;
  let activeInstances = new Set();

  // Throttled mouse move handler
  const throttledMouseMove = throttle((e) => {
    prevMouseX = mouseX;
    prevMouseY = mouseY;
    mouseX = e.clientX;
    mouseY = e.clientY;
    
    // Calculate velocity
    velocityX = mouseX - prevMouseX;
    velocityY = mouseY - prevMouseY;
    
    // Update CSS custom properties for global cursor
    document.documentElement.style.setProperty('--mouse-x', mouseX + 'px');
    document.documentElement.style.setProperty('--mouse-y', mouseY + 'px');
  }, 16);

  // Optimized: Use passive listener and throttle mouse tracking
  let mouseMoveThrottle = null;
  document.addEventListener('mousemove', (e) => {
    // Update basic mouse tracking
    throttledMouseMove(e);
    
    // Only process if there are active instances
    if (activeInstances.size === 0) return;
    
    // Throttle mouse updates for better performance
    if (mouseMoveThrottle) return;
    mouseMoveThrottle = requestAnimationFrame(() => {
      mouseMoveThrottle = null;
    });
  }, { passive: true });

  // Enhanced thumbnail update function
  function updateThumbnailPositionEnhanced(thumbnail, parentRect) {
    const centerX = parentRect.left + parentRect.width / 2;
    const centerY = parentRect.top + parentRect.height / 2;
    
    // Calculate relative position
    const relativeX = (mouseX - centerX) / parentRect.width;
    const relativeY = (mouseY - centerY) / parentRect.height;
    
    // Lerp velocity for smooth effects
    lerpedVelocityX += (velocityX - lerpedVelocityX) * config.lerp.velocity;
    lerpedVelocityY += (velocityY - lerpedVelocityY) * config.lerp.velocity;
    
    // Calculate effects
    const skewX = config.velocity.enabled ? 
      Math.max(-config.velocity.maxSkew, Math.min(config.velocity.maxSkew, lerpedVelocityX * config.velocity.skewMultiplier)) : 0;
    const skewY = config.velocity.enabled ? 
      Math.max(-config.velocity.maxSkew, Math.min(config.velocity.maxSkew, lerpedVelocityY * config.velocity.skewMultiplier)) : 0;
    
    const scaleBoost = config.velocity.enabled ? 
      1 + Math.min(config.velocity.maxScale, Math.abs(lerpedVelocityX + lerpedVelocityY) * config.velocity.scaleMultiplier) : 1;
    
    // Apply transforms using GSAP
    gsap.set(thumbnail, {
      x: relativeX * config.followStrength,
      y: relativeY * config.followStrength,
      rotationY: relativeX * config.rotationStrength,
      rotationX: -relativeY * config.rotationStrength,
      skewX: skewX,
      skewY: skewY,
      scale: scaleBoost,
      transformOrigin: "center center"
    });
    
    // Apply parallax to child images if enabled
    if (config.parallax.enabled) {
      const images = thumbnail.querySelectorAll('img, video');
      images.forEach(img => {
        gsap.set(img, {
          x: relativeX * config.parallax.strength * 20,
          y: relativeY * config.parallax.strength * 20
        });
      });
    }
    
    // Update CSS custom properties for this thumbnail
    thumbnail.style.setProperty('--velocity-x', lerpedVelocityX);
    thumbnail.style.setProperty('--velocity-y', lerpedVelocityY);
  }

  // Optimized: Cache selectors and use more specific query
  const thumbnails = document.querySelectorAll('[hover-mouse-follow="thumbnail"]');
  
  // Remove lines 152-153:
  // console.log(`🔍 Found ${thumbnails.length} thumbnails with mouse-follow behavior`);
  // console.log('📋 Thumbnail elements:', Array.from(thumbnails));
  
  // Remove line 200:
  // console.log(`Initialized thumbnail ${index}:`, {
  
  // Remove line 320:
  // console.log(`🐭 Mouse Enter on thumbnail ${index}`, {
  
  // Remove line 376:
  // console.log(`✅ Thumbnail ${index} animation complete:`, {
  
  // Remove line 388:
  // console.log(`🐭 Mouse Leave on thumbnail ${index}`, {
  
  // Remove line 415:
  // console.log(`❌ Thumbnail ${index} hidden:`, {
  if (thumbnails.length === 0) {
    console.warn('⚠️ No thumbnails found! Make sure elements have hover-mouse-follow="thumbnail" attribute');
    return;
  }

  thumbnails.forEach((thumbnail, index) => {
    // Optimized: Cache parent lookup with more specific selectors
    const listItem = thumbnail.closest('.project-list-item') || 
                    thumbnail.closest('.project-item') || 
                    thumbnail.closest('.list-item') || 
                    thumbnail.closest('[class*="project"]') || 
                    thumbnail.closest('[class*="item"]');
    
    if (!listItem) {
      console.warn(`Thumbnail ${index} could not find parent container`);
      return;
    }

    // Store initial state
    let isHovering = false;
    let animationFrame = null;
    let currentRotationX = 0;
    let currentRotationY = 0;
    
    // Physics-based swaying variables
    let previousX = 0;
    let previousY = 0;
    let localVelocityX = 0;
    let localVelocityY = 0;
    let swayRotation = 0;
    let swayVelocity = 0;

    // Initialize thumbnail - clear any conflicting transforms
    gsap.set(thumbnail, {
      transformOrigin: 'center center',
      rotationX: 0,
      rotationY: 0,
      x: 0,
      y: 0,
      scale: 0,
      opacity: 0,
      clearProps: "transform",
      force3D: true
    });
    
    console.log(`Initialized thumbnail ${index}:`, {
      element: thumbnail,
      parent: listItem,
      initialScale: gsap.getProperty(thumbnail, "scale"),
      initialOpacity: gsap.getProperty(thumbnail, "opacity")
    });

    // Optimized: Cache rect calculations and reduce DOM queries
    let cachedRect = null;
    let rectCacheTime = 0;
    const RECT_CACHE_DURATION = 100;
    
    function getCachedRect() {
      const now = Date.now();
      if (!cachedRect || (now - rectCacheTime) > RECT_CACHE_DURATION) {
        cachedRect = listItem.getBoundingClientRect();
        rectCacheTime = now;
      }
      return cachedRect;
    }

    // Animation loop for smooth mouse following
    function updateThumbnailPosition() {
      if (!isHovering) return;

      const listItemRect = getCachedRect();
      
      // Calculate mouse position relative to list item
      const relativeX = mouseX - listItemRect.left;
      const relativeY = mouseY - listItemRect.top;
      
      // Calculate mouse position relative to list item center for rotation
      const centerX = listItemRect.width * 0.5;
      const centerY = listItemRect.height * 0.5;
      
      const deltaX = relativeX - centerX;
      const deltaY = relativeY - centerY;
      
      // Separate limits for left and right movement
      const maxMoveLeft = listItemRect.width * config.maxMoveLeftPercent;
      const maxMoveRight = listItemRect.width * config.maxMoveRightPercent;
      const maxMoveUp = listItemRect.height * config.maxMoveUpPercent;
      const maxMoveDown = listItemRect.height * config.maxMoveDownPercent;
      
      // Apply different limits based on direction
      let clampedDeltaX, clampedDeltaY;
      
      if (deltaX < 0) {
        clampedDeltaX = Math.max(-maxMoveLeft, deltaX);
      } else {
        clampedDeltaX = Math.min(maxMoveRight, deltaX);
      }
      
      if (deltaY < 0) {
        clampedDeltaY = Math.max(-maxMoveUp, deltaY);
      } else {
        clampedDeltaY = Math.min(maxMoveDown, deltaY);
      }
      
      // Calculate velocity for swaying effect
      localVelocityX = (deltaX - previousX) * 0.5;
      localVelocityY = (deltaY - previousY) * 0.5;
      previousX = deltaX;
      previousY = deltaY;
      
      // Calculate rotation based on mouse position relative to container
      const maxDistance = Math.max(listItemRect.width, listItemRect.height) * 0.5;
      
      // Normalize mouse position (-1 to 1)
      const normalizedX = Math.max(-1, Math.min(1, deltaX / maxDistance));
      const normalizedY = Math.max(-1, Math.min(1, deltaY / maxDistance));
      
      // Calculate rotation based on normalized position
      const targetRotationY = normalizedX * config.maxRotation;
      const targetRotationX = -normalizedY * config.maxRotation;
      
      // Improved smoothing with better interpolation
      const smoothingFactor = 0.08;
      currentRotationX += (targetRotationX - currentRotationX) * smoothingFactor;
      currentRotationY += (targetRotationY - currentRotationY) * smoothingFactor;
      
      // Physics-based swaying rotation
      const swayForce = localVelocityX * 0.3;
      swayVelocity += swayForce * 0.1;
      swayVelocity *= 0.85;
      swayRotation += swayVelocity;
      swayRotation *= 0.92;
      
      // Apply different movement multipliers based on direction
      let finalX, finalY;
      
      if (clampedDeltaX < 0) {
        finalX = clampedDeltaX * config.leftMovementMultiplier;
      } else {
        finalX = clampedDeltaX * config.rightMovementMultiplier;
      }
      
      finalY = clampedDeltaY * config.verticalMovementMultiplier;
      
      // Apply position following and rotation with controlled range
      gsap.set(thumbnail, {
        x: finalX,
        y: finalY,
        rotationX: currentRotationX,
        rotationY: currentRotationY,
        rotationZ: swayRotation,
        force3D: true
      });
      
      // Continue animation loop
      if (isHovering) {
        animationFrame = requestAnimationFrame(updateThumbnailPosition);
      }
    }

    // Optimized: Use passive listeners and track active instances
    const instanceId = `thumb_${index}`;
    
    // Mouse enter - start rotation tracking and show thumbnail
    listItem.addEventListener('mouseenter', (e) => {
      console.log(`🐭 Mouse Enter on thumbnail ${index}`, {
        target: e.target,
        currentTarget: e.currentTarget,
        isHovering: isHovering
      });
      
      isHovering = true;
      activeInstances.add(instanceId);
      cachedRect = null;
      
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
      
      gsap.killTweensOf(thumbnail);
      
      // Set initial position to mouse entry point
      const listItemRect = listItem.getBoundingClientRect();
      const relativeX = e.clientX - listItemRect.left;
      const relativeY = e.clientY - listItemRect.top;
      const centerX = listItemRect.width * 0.5;
      const centerY = listItemRect.height * 0.5;
      const initialDeltaX = relativeX - centerX;
      const initialDeltaY = relativeY - centerY;
      
      // Apply movement limits to initial position
      const maxMoveLeft = listItemRect.width * config.maxMoveLeftPercent;
      const maxMoveRight = listItemRect.width * config.maxMoveRightPercent;
      const maxMoveUp = listItemRect.height * config.maxMoveUpPercent;
      const maxMoveDown = listItemRect.height * config.maxMoveDownPercent;
      
      let clampedInitialX, clampedInitialY;
      
      if (initialDeltaX < 0) {
        clampedInitialX = Math.max(-maxMoveLeft, initialDeltaX) * config.leftMovementMultiplier;
      } else {
        clampedInitialX = Math.min(maxMoveRight, initialDeltaX) * config.rightMovementMultiplier;
      }
      
      if (initialDeltaY < 0) {
        clampedInitialY = Math.max(-maxMoveUp, initialDeltaY) * config.verticalMovementMultiplier;
      } else {
        clampedInitialY = Math.min(maxMoveDown, initialDeltaY) * config.verticalMovementMultiplier;
      }
      
      gsap.set(thumbnail, {
        x: clampedInitialX,
        y: clampedInitialY
      });
      
      gsap.to(thumbnail, {
        scale: 1,
        opacity: 1,
        duration: 0.6,
        ease: "back.out(1.7)",
        onComplete: () => {
          console.log(`✅ Thumbnail ${index} animation complete:`, {
            scale: gsap.getProperty(thumbnail, "scale"),
            opacity: gsap.getProperty(thumbnail, "opacity")
          });
        }
      });
      
      updateThumbnailPosition();
    }, { passive: true });

    // Mouse leave - reset rotation and hide thumbnail
    listItem.addEventListener('mouseleave', (e) => {
      console.log(`🐭 Mouse Leave on thumbnail ${index}`, {
        target: e.target,
        currentTarget: e.currentTarget,
        isHovering: isHovering
      });
      
      isHovering = false;
      activeInstances.delete(instanceId);
      
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
        animationFrame = null;
      }
      
      gsap.killTweensOf(thumbnail);
      
      gsap.to(thumbnail, {
        scale: 0,
        opacity: 0,
        x: 0,
        y: 0,
        rotationX: 0,
        rotationY: 0,
        rotationZ: 0,
        duration: config.resetSpeed,
        ease: "power2.out",
        onComplete: () => {
          console.log(`❌ Thumbnail ${index} hidden:`, {
            scale: gsap.getProperty(thumbnail, "scale"),
            opacity: gsap.getProperty(thumbnail, "opacity")
          });
        }
      });
      
      // Reset variables
      currentRotationX = 0;
      currentRotationY = 0;
      previousX = 0;
      previousY = 0;
      localVelocityX = 0;
      localVelocityY = 0;
      swayRotation = 0;
      swayVelocity = 0;
    }, { passive: true });

    // Optimized: Debounced resize handler
    let resizeTimeout = null;
    window.addEventListener('resize', () => {
      cachedRect = null;
      
      if (resizeTimeout) clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        if (isHovering) {
          if (animationFrame) {
            cancelAnimationFrame(animationFrame);
          }
          setTimeout(() => {
            if (isHovering) {
              updateThumbnailPosition();
            }
          }, 50);
        }
      }, 150);
    }, { passive: true });
  });

  // Optional: Add CSS for better performance
  const style = document.createElement('style');
  style.textContent = `
    [hover-mouse-follow="thumbnail"] {
      will-change: transform;
      backface-visibility: hidden;
      perspective: 1000px;
    }
    
    .project-list-item,
    .project-item,
    .list-item {
      position: relative;
      overflow: visible;
    }
  `;
  document.head.appendChild(style);
});

// Export for potential external use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { config };
}