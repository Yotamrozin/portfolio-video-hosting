/**
 * Thumbnail Mouse Follow with Rotation System
 * Adds realistic rotation effects to thumbnails that follow mouse movement
 * Compatible with existing hover-mouse-follow="thumbnail" attributes
 */

document.addEventListener("DOMContentLoaded", function() {
  // Configuration
  const config = {
    maxRotation: 8,        // Maximum rotation in degrees
    maxTranslation: 15,    // Maximum movement in pixels
    rotationDamping: 0.3,  // How much rotation is applied (0-1)
    followDamping: 0.15,   // How much the thumbnail follows mouse (0-1)
    animationSpeed: 0.6,   // Animation duration in seconds
    resetSpeed: 0.8,       // Speed when returning to center
    boundaryPadding: 20    // Padding from container edges
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
  
  console.log(`Found ${thumbnails.length} thumbnails with mouse-follow behavior`);

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
    let currentX = 0;
    let currentY = 0;

    // Initialize thumbnail styles
    gsap.set(thumbnail, {
      transformOrigin: 'center center',
      scale: 0, // Start hidden
      rotationX: 0,
      rotationY: 0,
      x: 0,
      y: 0,
      force3D: true
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
      
      // Calculate mouse position relative to list item center
      const centerX = listItemRect.left + listItemRect.width * 0.5;
      const centerY = listItemRect.top + listItemRect.height * 0.5;
      
      const deltaX = mouseX - centerX;
      const deltaY = mouseY - centerY;
      
      // Calculate boundaries (keep thumbnail within list item bounds)
      const maxX = (listItemRect.width * 0.5) - config.boundaryPadding;
      const maxY = (listItemRect.height * 0.5) - config.boundaryPadding;
      
      // Constrain movement within boundaries
      const constrainedX = Math.max(-maxX, Math.min(maxX, deltaX * config.followDamping));
      const constrainedY = Math.max(-maxY, Math.min(maxY, deltaY * config.followDamping));
      
      // Calculate rotation based on movement direction and speed
      const rotationY = (constrainedX / maxX) * config.maxRotation * config.rotationDamping;
      const rotationX = -(constrainedY / maxY) * config.maxRotation * config.rotationDamping;
      
      // Smooth interpolation for natural movement
      currentX += (constrainedX - currentX) * 0.1;
      currentY += (constrainedY - currentY) * 0.1;
      currentRotationX += (rotationX - currentRotationX) * 0.1;
      currentRotationY += (rotationY - currentRotationY) * 0.1;
      
      // Apply transforms
      gsap.set(thumbnail, {
        x: currentX,
        y: currentY,
        rotationX: currentRotationX,
        rotationY: currentRotationY,
        force3D: true
      });
      
      // Continue animation loop
      if (isHovering) {
        animationFrame = requestAnimationFrame(updateThumbnailPosition);
      }
    }

    // Optimized: Use passive listeners and track active instances
    const instanceId = `thumb_${index}`;
    
    // Mouse enter - scale up and start following
    listItem.addEventListener('mouseenter', () => {
      isHovering = true;
      activeInstances.add(instanceId);
      cachedRect = null; // Invalidate cache on hover start
      
      // Cancel any existing animation frame
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
      
      // Scale up thumbnail with bounce effect
      gsap.to(thumbnail, {
        scale: 1,
        duration: config.animationSpeed,
        ease: "back.out(1.7)",
        onComplete: () => {
          // Start mouse following after scale animation
          updateThumbnailPosition();
        }
      });
    }, { passive: true });

    // Mouse leave - scale down and reset position
    listItem.addEventListener('mouseleave', () => {
      isHovering = false;
      activeInstances.delete(instanceId);
      
      // Cancel animation frame
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
        animationFrame = null;
      }
      
      // Reset position and scale with smooth animation
      gsap.to(thumbnail, {
        scale: 0,
        x: 0,
        y: 0,
        rotationX: 0,
        rotationY: 0,
        duration: config.resetSpeed,
        ease: "power2.inOut"
      });
      
      // Reset tracking variables
      currentX = 0;
      currentY = 0;
      currentRotationX = 0;
      currentRotationY = 0;
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
      overflow: hidden;
    }
  `;
  document.head.appendChild(style);
});

// Export for potential external use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { config };
}