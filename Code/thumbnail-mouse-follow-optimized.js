/**
 * Optimized Thumbnail Rotation System
 * High-performance mouse following with realistic rotation effects
 * Optimized for better performance while maintaining functionality
 */

document.addEventListener("DOMContentLoaded", function() {
  // Configuration object for easy customization
  const config = {
    maxRotation: 25,
    resetSpeed: 0.8,
    smoothingFactor: 0.08,
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

  // Global mouse tracking - single source of truth
  let mouseState = {
    x: 0,
    y: 0,
    prevX: 0,
    prevY: 0,
    velocityX: 0,
    velocityY: 0,
    lerpedVelocityX: 0,
    lerpedVelocityY: 0
  };

  // Performance optimization: Single RAF loop for all thumbnails
  let animationFrameId = null;
  let activeThumbnails = new Map(); // Use Map for better performance
  let isAnimating = false;

  // Optimized mouse tracking with single event listener
  function updateMouseState(e) {
    mouseState.prevX = mouseState.x;
    mouseState.prevY = mouseState.y;
    mouseState.x = e.clientX;
    mouseState.y = e.clientY;
    
    // Calculate velocity
    mouseState.velocityX = mouseState.x - mouseState.prevX;
    mouseState.velocityY = mouseState.y - mouseState.prevY;
    
    // Lerp velocity for smooth effects
    mouseState.lerpedVelocityX += (mouseState.velocityX - mouseState.lerpedVelocityX) * config.lerp.velocity;
    mouseState.lerpedVelocityY += (mouseState.velocityY - mouseState.lerpedVelocityY) * config.lerp.velocity;
    
    // Update CSS custom properties for global cursor
    document.documentElement.style.setProperty('--mouse-x', mouseState.x + 'px');
    document.documentElement.style.setProperty('--mouse-y', mouseState.y + 'px');
  }

  // Single mouse move listener with passive flag
  document.addEventListener('mousemove', updateMouseState, { passive: true });

  // Optimized animation loop - single RAF for all thumbnails
  function animationLoop() {
    if (activeThumbnails.size === 0) {
      isAnimating = false;
      return;
    }

    // Process all active thumbnails in one frame
    activeThumbnails.forEach((thumbnailData, thumbnail) => {
      if (!thumbnailData.isHovering) return;

      const { listItem, cachedRect } = thumbnailData;
      
      // Use cached rect or get fresh one
      const rect = cachedRect || listItem.getBoundingClientRect();
      
      // Calculate mouse position relative to list item
      const relativeX = mouseState.x - rect.left;
      const relativeY = mouseState.y - rect.top;
      
      // Calculate mouse position relative to list item center for rotation
      const centerX = rect.width * 0.5;
      const centerY = rect.height * 0.5;
      
      const deltaX = relativeX - centerX;
      const deltaY = relativeY - centerY;
      
      // Apply movement limits
      const maxMoveLeft = rect.width * config.maxMoveLeftPercent;
      const maxMoveRight = rect.width * config.maxMoveRightPercent;
      const maxMoveUp = rect.height * config.maxMoveUpPercent;
      const maxMoveDown = rect.height * config.maxMoveDownPercent;
      
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
      const localVelocityX = (deltaX - thumbnailData.previousX) * 0.5;
      const localVelocityY = (deltaY - thumbnailData.previousY) * 0.5;
      thumbnailData.previousX = deltaX;
      thumbnailData.previousY = deltaY;
      
      // Calculate rotation based on mouse position
      const maxDistance = Math.max(rect.width, rect.height) * 0.5;
      const normalizedX = Math.max(-1, Math.min(1, deltaX / maxDistance));
      const normalizedY = Math.max(-1, Math.min(1, deltaY / maxDistance));
      
      const targetRotationY = normalizedX * config.maxRotation;
      const targetRotationX = -normalizedY * config.maxRotation;
      
      // Smooth rotation interpolation
      thumbnailData.currentRotationX += (targetRotationX - thumbnailData.currentRotationX) * config.smoothingFactor;
      thumbnailData.currentRotationY += (targetRotationY - thumbnailData.currentRotationY) * config.smoothingFactor;
      
      // Physics-based swaying rotation
      const swayForce = localVelocityX * 0.3;
      thumbnailData.swayVelocity += swayForce * 0.1;
      thumbnailData.swayVelocity *= 0.85;
      thumbnailData.swayRotation += thumbnailData.swayVelocity;
      thumbnailData.swayRotation *= 0.92;
      
      // Apply movement multipliers
      let finalX, finalY;
      
      if (clampedDeltaX < 0) {
        finalX = clampedDeltaX * config.leftMovementMultiplier;
      } else {
        finalX = clampedDeltaX * config.rightMovementMultiplier;
      }
      
      finalY = clampedDeltaY * config.verticalMovementMultiplier;
      
      // Single GSAP set call for better performance
      gsap.set(thumbnail, {
        x: finalX,
        y: finalY,
        rotationX: thumbnailData.currentRotationX,
        rotationY: thumbnailData.currentRotationY,
        rotationZ: thumbnailData.swayRotation,
        force3D: true
      });
      
      // Apply parallax to child images if enabled
      if (config.parallax.enabled && thumbnailData.images) {
        thumbnailData.images.forEach(img => {
          gsap.set(img, {
            x: normalizedX * config.parallax.strength * 20,
            y: normalizedY * config.parallax.strength * 20
          });
        });
      }
    });

    // Continue animation loop
    animationFrameId = requestAnimationFrame(animationLoop);
  }

  // Start animation loop when needed
  function startAnimationLoop() {
    if (!isAnimating) {
      isAnimating = true;
      animationFrameId = requestAnimationFrame(animationLoop);
    }
  }

  // Stop animation loop when no thumbnails are active
  function stopAnimationLoop() {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }
    isAnimating = false;
  }

  // Cache DOM elements and pre-calculate static data
  const thumbnails = document.querySelectorAll('[hover-mouse-follow="thumbnail"]');
  
  if (thumbnails.length === 0) {
    return;
  }

  // Pre-cache all thumbnail data
  thumbnails.forEach((thumbnail, index) => {
    const listItem = thumbnail.closest('.project-list-item') || 
                    thumbnail.closest('.project-item') || 
                    thumbnail.closest('.list-item') || 
                    thumbnail.closest('[class*="project"]') || 
                    thumbnail.closest('[class*="item"]');
    
    if (!listItem) {
      return;
    }

    // Pre-cache images for parallax
    const images = config.parallax.enabled ? thumbnail.querySelectorAll('img, video') : null;

    // Initialize thumbnail state
    const thumbnailData = {
      listItem,
      images,
      isHovering: false,
      currentRotationX: 0,
      currentRotationY: 0,
      previousX: 0,
      previousY: 0,
      swayRotation: 0,
      swayVelocity: 0,
      cachedRect: null,
      rectCacheTime: 0
    };

    // Initialize thumbnail transforms
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

    // Optimized rect caching
    function getCachedRect() {
      const now = Date.now();
      if (!thumbnailData.cachedRect || (now - thumbnailData.rectCacheTime) > 100) {
        thumbnailData.cachedRect = listItem.getBoundingClientRect();
        thumbnailData.rectCacheTime = now;
      }
      return thumbnailData.cachedRect;
    }

    // Mouse enter handler
    listItem.addEventListener('mouseenter', (e) => {
      thumbnailData.isHovering = true;
      thumbnailData.cachedRect = null; // Force fresh rect calculation
      
      // Add to active thumbnails
      activeThumbnails.set(thumbnail, thumbnailData);
      
      // Kill any existing tweens
      gsap.killTweensOf(thumbnail);
      
      // Set initial position based on mouse entry point
      const rect = getCachedRect();
      const relativeX = e.clientX - rect.left;
      const relativeY = e.clientY - rect.top;
      const centerX = rect.width * 0.5;
      const centerY = rect.height * 0.5;
      const initialDeltaX = relativeX - centerX;
      const initialDeltaY = relativeY - centerY;
      
      // Apply movement limits to initial position
      const maxMoveLeft = rect.width * config.maxMoveLeftPercent;
      const maxMoveRight = rect.width * config.maxMoveRightPercent;
      const maxMoveUp = rect.height * config.maxMoveUpPercent;
      const maxMoveDown = rect.height * config.maxMoveDownPercent;
      
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
      
      // Animate in
      gsap.to(thumbnail, {
        scale: 1,
        opacity: 1,
        duration: 0.6,
        ease: "back.out(1.7)"
      });
      
      // Start animation loop if not already running
      startAnimationLoop();
    }, { passive: true });

    // Mouse leave handler
    listItem.addEventListener('mouseleave', () => {
      thumbnailData.isHovering = false;
      
      // Remove from active thumbnails
      activeThumbnails.delete(thumbnail);
      
      // Stop animation loop if no active thumbnails
      if (activeThumbnails.size === 0) {
        stopAnimationLoop();
      }
      
      // Kill any existing tweens
      gsap.killTweensOf(thumbnail);
      
      // Animate out
      gsap.to(thumbnail, {
        scale: 0,
        opacity: 0,
        x: 0,
        y: 0,
        rotationX: 0,
        rotationY: 0,
        rotationZ: 0,
        duration: config.resetSpeed,
        ease: "power2.out"
      });
      
      // Reset variables
      thumbnailData.currentRotationX = 0;
      thumbnailData.currentRotationY = 0;
      thumbnailData.previousX = 0;
      thumbnailData.previousY = 0;
      thumbnailData.swayRotation = 0;
      thumbnailData.swayVelocity = 0;
    }, { passive: true });

    // Optimized resize handler with debouncing
    let resizeTimeout = null;
    window.addEventListener('resize', () => {
      thumbnailData.cachedRect = null;
      
      if (resizeTimeout) clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        if (thumbnailData.isHovering) {
          thumbnailData.cachedRect = null; // Force fresh rect calculation
        }
      }, 150);
    }, { passive: true });
  });

  // Add CSS for better performance
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
