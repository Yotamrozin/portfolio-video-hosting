/**
 * Thumbnail Rotation System
 * Adds realistic rotation effects to thumbnails based on mouse movement
 * Works alongside Webflow Interactions for position and scale
 * Compatible with existing hover-mouse-follow="thumbnail" attributes
 */

document.addEventListener("DOMContentLoaded", function() {
  // Configuration object for easy customization
  const config = {
    maxRotation: 25,
    resetSpeed: 0.8,
    smoothingFactor: 0.8,
    rotationDamping: 0.8,
    maxMoveLeftPercent: 0.25,
    maxMoveRightPercent: 0.8, // Increase this
    maxMoveUpPercent: 0.2,
    maxMoveDownPercent: 0.2,
    leftMovementMultiplier: 0.3,
    rightMovementMultiplier: 0.8, // AND increase this too!
    verticalMovementMultiplier: 0.4
  };

  // Mouse tracking variables
  let mouseX = 0;
  let mouseY = 0;
  let activeInstances = new Set(); // Track active hover instances

  // Optimized: Use passive listener and throttle mouse tracking
  let mouseMoveThrottle = null;
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    
    // Only process if there are active instances
    if (activeInstances.size === 0) return;
    
    // Throttle mouse updates for better performance
    if (mouseMoveThrottle) return;
    mouseMoveThrottle = requestAnimationFrame(() => {
      mouseMoveThrottle = null;
    });
  }, { passive: true });

  // Optimized: Cache selectors and use more specific query
  const thumbnails = document.querySelectorAll('[hover-mouse-follow="thumbnail"]');
  
  console.log(`🔍 Found ${thumbnails.length} thumbnails with mouse-follow behavior`);
  console.log('📋 Thumbnail elements:', Array.from(thumbnails));
  
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
    let velocityX = 0;
    let velocityY = 0;
    let swayRotation = 0;
    let swayVelocity = 0;

    // Initialize thumbnail - clear any conflicting transforms
    gsap.set(thumbnail, {
      transformOrigin: 'center center',
      rotationX: 0,
      rotationY: 0,
      x: 0,
      y: 0,
      scale: 0, // Start hidden
      opacity: 0, // Also start transparent for smoother transitions
      clearProps: "transform", // Clear any existing CSS transforms
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
    const RECT_CACHE_DURATION = 100; // Cache for 100ms
    
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
        // Moving left
        clampedDeltaX = Math.max(-maxMoveLeft, deltaX);
      } else {
        // Moving right
        clampedDeltaX = Math.min(maxMoveRight, deltaX);
      }
      
      if (deltaY < 0) {
        // Moving up
        clampedDeltaY = Math.max(-maxMoveUp, deltaY);
      } else {
        // Moving down
        clampedDeltaY = Math.min(maxMoveDown, deltaY);
      }
      
      // Calculate velocity for swaying effect
      velocityX = (deltaX - previousX) * 0.5;
      velocityY = (deltaY - previousY) * 0.5;
      previousX = deltaX;
      previousY = deltaY;
      
      // Calculate rotation based on mouse position relative to container
      const maxDistance = Math.max(listItemRect.width, listItemRect.height) * 0.5;
      
      // Normalize mouse position (-1 to 1)
      const normalizedX = Math.max(-1, Math.min(1, deltaX / maxDistance));
      const normalizedY = Math.max(-1, Math.min(1, deltaY / maxDistance));
      
      // Calculate rotation based on normalized position (increased for visibility)
      const targetRotationY = normalizedX * config.maxRotation;
      const targetRotationX = -normalizedY * config.maxRotation;
      
      // Improved smoothing with better interpolation
      const smoothingFactor = 0.08; // Slower, smoother movement
      currentRotationX += (targetRotationX - currentRotationX) * smoothingFactor;
      currentRotationY += (targetRotationY - currentRotationY) * smoothingFactor;
      
      // Physics-based swaying rotation
      const swayForce = velocityX * 0.3; // Convert velocity to sway force
      swayVelocity += swayForce * 0.1; // Apply force to sway velocity
      swayVelocity *= 0.85; // Damping - gradually slow down
      swayRotation += swayVelocity;
      swayRotation *= 0.92; // Settle towards center
      
      // Apply different movement multipliers based on direction
      let finalX, finalY;
      
      if (clampedDeltaX < 0) {
        // Moving left
        finalX = clampedDeltaX * config.leftMovementMultiplier;
      } else {
        // Moving right
        finalX = clampedDeltaX * config.rightMovementMultiplier;
      }
      
      finalY = clampedDeltaY * config.verticalMovementMultiplier;
      
      // Apply position following and rotation with controlled range
      gsap.set(thumbnail, {
        x: finalX,
        y: finalY,
        rotationX: currentRotationX,
        rotationY: currentRotationY,
        rotationZ: swayRotation, // Add swaying rotation
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
      cachedRect = null; // Invalidate cache on hover start
      
      // Cancel any existing animation frame
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
      
      // IMPORTANT: Kill any existing animations on this thumbnail to prevent conflicts
      gsap.killTweensOf(thumbnail);
      
      // Set initial position to mouse entry point
      const listItemRect = listItem.getBoundingClientRect();
      const relativeX = e.clientX - listItemRect.left;
      const relativeY = e.clientY - listItemRect.top;
      const centerX = listItemRect.width * 0.5;
      const centerY = listItemRect.height * 0.5;
      const initialDeltaX = relativeX - centerX;
      const initialDeltaY = relativeY - centerY;
      
      // Apply movement limits to initial position using new config
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
      
      // Set initial position before showing
      gsap.set(thumbnail, {
        x: clampedInitialX,
        y: clampedInitialY
      });
      
      // Show thumbnail with scale and opacity animation
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
      
      // Start rotation tracking immediately
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
      
      // Cancel animation frame
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
        animationFrame = null;
      }
      
      // IMPORTANT: Kill any existing animations to prevent conflicts
      gsap.killTweensOf(thumbnail);
      
      // Hide thumbnail and reset rotation and position
      gsap.to(thumbnail, {
        scale: 0,
        opacity: 0,
        x: 0, // Reset position
        y: 0, // Reset position
        rotationX: 0,
        rotationY: 0,
        rotationZ: 0, // Also reset the sway rotation
        duration: config.resetSpeed,
        ease: "power2.out",
        onComplete: () => {
          console.log(`❌ Thumbnail ${index} hidden:`, {
            scale: gsap.getProperty(thumbnail, "scale"),
            opacity: gsap.getProperty(thumbnail, "opacity")
          });
        }
      });
      
      // Reset rotation tracking variables
      currentRotationX = 0;
      currentRotationY = 0;
      
      // Reset physics variables
      previousX = 0;
      previousY = 0;
      velocityX = 0;
      velocityY = 0;
      swayRotation = 0;
      swayVelocity = 0;
    }, { passive: true });

    // Optimized: Debounced resize handler with cache invalidation
    let resizeTimeout = null;
    window.addEventListener('resize', () => {
      cachedRect = null; // Invalidate cache immediately
      
      if (resizeTimeout) clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        if (isHovering) {
          // Briefly pause and restart animation to recalculate boundaries
          if (animationFrame) {
            cancelAnimationFrame(animationFrame);
          }
          setTimeout(() => {
            if (isHovering) {
              updateThumbnailPosition();
            }
          }, 50); // Reduced delay
        }
      }, 150); // Debounce resize events
    }, { passive: true });
  });

  // Optional: Add CSS for better performance (can be added via Webflow custom code)
  const style = document.createElement('style');
  style.textContent = `
    [hover-mouse-follow="thumbnail"] {
      will-change: transform;
      backface-visibility: hidden;
      perspective: 1000px;
    }
    
    /* Ensure parent containers have proper positioning */
    .project-list-item,
    .project-item,
    .list-item {
      position: relative;
      overflow: visible; /* Allow thumbnails to extend outside */
    }
  `;
  document.head.appendChild(style);
});

// Export for potential external use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { config };
}