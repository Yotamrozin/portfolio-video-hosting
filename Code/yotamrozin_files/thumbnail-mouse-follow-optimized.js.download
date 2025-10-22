/**
 * Optimized Thumbnail Rotation System
 * Addresses performance issues with jittery animations and video playback optimization
 * Uses single animation loop and intelligent video pause/play management
 */

document.addEventListener("DOMContentLoaded", function() {
  // Throttle function for mouse events
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
    // Performance optimizations
    animationFrameRate: 60, // Target FPS
    rectCacheDuration: 100, // Cache rect calculations for 100ms
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

  // Global mouse tracking variables
  let mouseX = 0;
  let mouseY = 0;
  let prevMouseX = 0;
  let prevMouseY = 0;
  let velocityX = 0;
  let velocityY = 0;
  let lerpedVelocityX = 0;
  let lerpedVelocityY = 0;

  // Single animation loop for all thumbnails
  let animationFrameId = null;
  let isAnimating = false;
  let activeThumbnails = new Map(); // Map of active thumbnail data
  let lastFrameTime = 0;
  const targetFrameTime = 1000 / config.animationFrameRate;

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

  // Optimized mouse move listener
  document.addEventListener('mousemove', throttledMouseMove, { passive: true });

  // Single animation loop for all thumbnails
  function animationLoop(currentTime) {
    if (!isAnimating || activeThumbnails.size === 0) {
      isAnimating = false;
      return;
    }

    // Frame rate limiting
    if (currentTime - lastFrameTime < targetFrameTime) {
      animationFrameId = requestAnimationFrame(animationLoop);
      return;
    }
    lastFrameTime = currentTime;

    // Lerp velocity for smooth effects
    lerpedVelocityX += (velocityX - lerpedVelocityX) * config.lerp.velocity;
    lerpedVelocityY += (velocityY - lerpedVelocityY) * config.lerp.velocity;

    // Process all active thumbnails
    activeThumbnails.forEach((thumbnailData, thumbnail) => {
      if (!thumbnailData.isHovering) return;

      const { listItem, currentRotationX, currentRotationY, previousX, previousY, swayRotation, swayVelocity } = thumbnailData;

      // Get cached rect
      const now = Date.now();
      if (!thumbnailData.cachedRect || (now - thumbnailData.rectCacheTime) > config.rectCacheDuration) {
        thumbnailData.cachedRect = listItem.getBoundingClientRect();
        thumbnailData.rectCacheTime = now;
      }
      const listItemRect = thumbnailData.cachedRect;

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
      const localVelocityX = (deltaX - previousX) * 0.5;
      const localVelocityY = (deltaY - previousY) * 0.5;
      
      // Update previous positions
      thumbnailData.previousX = deltaX;
      thumbnailData.previousY = deltaY;
      
      // Calculate rotation based on mouse position relative to container
      const maxDistance = Math.max(listItemRect.width, listItemRect.height) * 0.5;
      
      // Normalize mouse position (-1 to 1)
      const normalizedX = Math.max(-1, Math.min(1, deltaX / maxDistance));
      const normalizedY = Math.max(-1, Math.min(1, deltaY / maxDistance));
      
      // Calculate rotation based on normalized position
      const targetRotationY = normalizedX * config.maxRotation;
      const targetRotationX = -normalizedY * config.maxRotation;
      
      // Improved smoothing with better interpolation
      thumbnailData.currentRotationX += (targetRotationX - thumbnailData.currentRotationX) * config.smoothingFactor;
      thumbnailData.currentRotationY += (targetRotationY - thumbnailData.currentRotationY) * config.smoothingFactor;
      
      // Physics-based swaying rotation
      const swayForce = localVelocityX * 0.3;
      thumbnailData.swayVelocity += swayForce * 0.1;
      thumbnailData.swayVelocity *= 0.85;
      thumbnailData.swayRotation += thumbnailData.swayVelocity;
      thumbnailData.swayRotation *= 0.92;
      
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
        rotationX: thumbnailData.currentRotationX,
        rotationY: thumbnailData.currentRotationY,
        rotationZ: thumbnailData.swayRotation,
        force3D: true
      });
      
      // Apply parallax to child images if enabled
      if (config.parallax.enabled && thumbnailData.images) {
        thumbnailData.images.forEach(img => {
          gsap.set(img, {
            x: deltaX * config.parallax.strength * 0.1,
            y: deltaY * config.parallax.strength * 0.1
          });
        });
      }
      
      // Update CSS custom properties for this thumbnail
      thumbnail.style.setProperty('--velocity-x', lerpedVelocityX);
      thumbnail.style.setProperty('--velocity-y', lerpedVelocityY);
    });

    // Continue animation loop
    animationFrameId = requestAnimationFrame(animationLoop);
  }

  // Start animation loop when needed
  function startAnimationLoop() {
    if (!isAnimating) {
      isAnimating = true;
      lastFrameTime = performance.now();
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

  // Video management functions
  function pauseAllVideos() {
    // Pause all video elements in thumbnails
    document.querySelectorAll('[hover-mouse-follow="thumbnail"] video').forEach(video => {
      if (!video.paused) {
        video.pause();
      }
    });
    
    // Also pause Video.js players if they exist
    if (window.thumbnailPlayers) {
      window.thumbnailPlayers.forEach(player => {
        if (player && !player.paused()) {
          player.pause();
        }
      });
    }
  }

  function playVideoForThumbnail(thumbnail) {
    const video = thumbnail.querySelector('video');
    if (video && video.paused) {
      video.play().catch(() => {}); // Silent error handling
    }
    
    // Also handle Video.js players
    const playerId = thumbnail.getAttribute('data-player-id');
    if (playerId && window.playThumbnailVideo) {
      window.playThumbnailVideo(playerId);
    }
  }

  function pauseVideoForThumbnail(thumbnail) {
    const video = thumbnail.querySelector('video');
    if (video && !video.paused) {
      video.pause();
    }
    
    // Also handle Video.js players
    const playerId = thumbnail.getAttribute('data-player-id');
    if (playerId && window.pauseThumbnailVideo) {
      window.pauseThumbnailVideo(playerId);
    }
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

    // Store thumbnail data
    activeThumbnails.set(thumbnail, thumbnailData);

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

    // Mouse enter - start rotation tracking and show thumbnail
    listItem.addEventListener('mouseenter', (e) => {
      thumbnailData.isHovering = true;
      thumbnailData.cachedRect = null; // Force rect recalculation
      
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
        ease: "back.out(1.7)"
      });
      
      // Start video playback for this thumbnail
      playVideoForThumbnail(thumbnail);
      
      // Start animation loop if not already running
      startAnimationLoop();
    }, { passive: true });

    // Mouse leave - reset rotation and hide thumbnail
    listItem.addEventListener('mouseleave', (e) => {
      thumbnailData.isHovering = false;
      
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
        ease: "power2.out"
      });
      
      // Pause video for this thumbnail
      pauseVideoForThumbnail(thumbnail);
      
      // Reset variables
      thumbnailData.currentRotationX = 0;
      thumbnailData.currentRotationY = 0;
      thumbnailData.previousX = 0;
      thumbnailData.previousY = 0;
      thumbnailData.swayRotation = 0;
      thumbnailData.swayVelocity = 0;
      
      // Stop animation loop if no thumbnails are active
      if (activeThumbnails.size === 0) {
        stopAnimationLoop();
      }
    }, { passive: true });

    // Optimized: Debounced resize handler
    let resizeTimeout = null;
    window.addEventListener('resize', () => {
      thumbnailData.cachedRect = null;
      
      if (resizeTimeout) clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        if (thumbnailData.isHovering) {
          thumbnailData.cachedRect = null; // Force rect recalculation
        }
      }, 150);
    }, { passive: true });
  });

  // Pause all videos on page load for better performance
  pauseAllVideos();

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
    
    /* Optimize video performance */
    [hover-mouse-follow="thumbnail"] video {
      will-change: transform;
    }
  `;
  document.head.appendChild(style);
});

// Export for potential external use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { config };
}