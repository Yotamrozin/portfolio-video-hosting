/**
 * Thumbnail Rotation System
 * Adds realistic rotation effects to thumbnails based on mouse movement
 * Works alongside Webflow Interactions for position and scale
 * Compatible with existing hover-mouse-follow="thumbnail" attributes
 */

document.addEventListener("DOMContentLoaded", function() {
  // Configuration
  const config = {
    maxRotation: 12,       // Maximum rotation in degrees
    rotationDamping: 0.4,  // How much rotation is applied (0-1)
    animationSpeed: 0.3,   // Animation speed for rotation changes
    resetSpeed: 0.6        // Speed when returning to neutral rotation
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

    // Initialize thumbnail - clear any conflicting transforms
    gsap.set(thumbnail, {
      transformOrigin: 'center center',
      rotationX: 0,
      rotationY: 0,
      clearProps: "transform", // Clear any existing CSS transforms
      force3D: true
    });
    
    // Set initial position using GSAP to avoid conflicts
    gsap.set(thumbnail, {
      x: 0, // Start at center, will be updated by mouse movement
      y: 0, // Start at center, will be updated by mouse movement
      scale: 0, // Start hidden
      opacity: 0 // Also start transparent for smoother transitions
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
      
      // Calculate rotation based on mouse position relative to container
      const maxDistance = Math.max(listItemRect.width, listItemRect.height) * 0.5;
      
      // Normalize mouse position (-1 to 1)
      const normalizedX = Math.max(-1, Math.min(1, deltaX / maxDistance));
      const normalizedY = Math.max(-1, Math.min(1, deltaY / maxDistance));
      
      // Calculate rotation based on normalized position
      const targetRotationY = normalizedX * config.maxRotation * config.rotationDamping;
      const targetRotationX = -normalizedY * config.maxRotation * config.rotationDamping;
      
      // Smooth interpolation for natural rotation
      currentRotationX += (targetRotationX - currentRotationX) * 0.15;
      currentRotationY += (targetRotationY - currentRotationY) * 0.15;
      
      // Apply position following and rotation
      gsap.set(thumbnail, {
        x: relativeX - centerX, // Follow mouse horizontally
        y: relativeY - centerY, // Follow mouse vertically
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
      
      // Hide thumbnail and reset rotation
      gsap.to(thumbnail, {
        scale: 0,
        opacity: 0,
        rotationX: 0,
        rotationY: 0,
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