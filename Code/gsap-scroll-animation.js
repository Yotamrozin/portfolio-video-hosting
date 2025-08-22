/**
 * GSAP-Based Scroll Animation System
 * Maintains compatibility with existing custom attributes while leveraging GSAP's superior performance
 * 
 * Supported animations:
 * - slide-up, slide-down, slide-left, slide-right
 * - fade-in
 * - scale-up
 * - slide-up-backout (with bounce easing)
 * - Stagger variants: slide-up-stagger, fade-in-stagger, etc.
 * 
 * Usage:
 * - Add scroll-animate="animation-name" to elements
 * - For stagger containers, use scroll-animate="animation-name-stagger"
 * - Children will automatically inherit the base animation
 */


console.log('GSAP Scroll animation system initialized');

// Animation configurations
const animationConfig = {
  // Basic animations
  'slide-up': {
    from: { y: 30, opacity: 0 },
    to: { y: 0, opacity: 1, duration: 0.5, ease: 'power3.out' },
    exit: { y: -10, opacity: 0, duration: 0.15, ease: 'power2.out' }
  },
  'slide-down': {
    from: { y: -30, opacity: 0 },
    to: { y: 0, opacity: 1, duration: 0.5, ease: 'power3.out' },
    exit: { y: 10, opacity: 0, duration: 0.15, ease: 'power2.out' }
  },
  'slide-left': {
    from: { x: 30, opacity: 0 },
    to: { x: 0, opacity: 1, duration: 0.5, ease: 'power3.out' },
    exit: { x: -10, opacity: 0, duration: 0.15, ease: 'power2.out' }
  },
  'slide-right': {
    from: { x: -30, opacity: 0 },
    to: { x: 0, opacity: 1, duration: 0.5, ease: 'power3.out' },
    exit: { x: 10, opacity: 0, duration: 0.15, ease: 'power2.out' }
  },
  'fade-in': {
    from: { opacity: 0 },
    to: { opacity: 1, duration: 0.6, ease: 'none' }
  },
  'scale-up': {
    from: { scale: 0.95, opacity: 0 },
    to: { scale: 1, opacity: 1, duration: 0.6, ease: 'power3.out' }
  },
  // Backout animations with bounce easing
  'slide-up-backout': {
    from: { y: 40, opacity: 0 },
    to: { y: 0, opacity: 1, duration: 0.8, ease: 'back.out(2.2)' }
  },
  'scale-up-backout': {
    from: { scale: 0.92, opacity: 0 },
    to: { scale: 1, opacity: 1, duration: 0.8, ease: 'back.out(2.2)' }
  }
};

// Stagger configuration
const staggerConfig = {
  amount: 0.4, // Total time for all staggers
  from: 'start', // Start from first element
  ease: 'power2.out'
};

// Initialize animations when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  initializeScrollAnimations();
});

function initializeScrollAnimations() {
  // Find all elements with scroll-animate attribute
  const animatedElements = document.querySelectorAll('[scroll-animate]');
  console.log(`Found ${animatedElements.length} elements with scroll animations`);
  
  animatedElements.forEach((element, index) => {
    const animationType = element.getAttribute('scroll-animate');
    
    // Check if this is a stagger container
    if (animationType.includes('-stagger')) {
      setupStaggerAnimation(element, index);
    } else {
      setupSingleAnimation(element, animationType);
    }
  });
  
  // Refresh ScrollTrigger to ensure proper calculations
  ScrollTrigger.refresh();
}

function setupSingleAnimation(element, animationType) {
  const config = animationConfig[animationType];
  
  if (!config) {
    console.warn(`Unknown animation type: ${animationType}`);
    return;
  }
  
  // Clear any existing CSS transforms to prevent conflicts
  gsap.set(element, { clearProps: 'transform' });
  
  // Set initial state
  gsap.set(element, config.from);
  
  // Create scroll-triggered animation with custom exit
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: element,
      start: 'top 90%', // Start earlier when element is 90% in viewport
      end: 'bottom 10%',
      toggleActions: config.exit ? 'play none none none' : 'play none none reverse',
      onEnter: () => {
        gsap.to(element, config.to);
      },
      onLeave: config.exit ? () => {
        gsap.to(element, config.exit);
      } : undefined,
      onLeaveBack: config.exit ? () => {
        gsap.to(element, config.exit);
      } : undefined,
      onEnterBack: () => {
        gsap.to(element, config.to);
      },
      // markers: true // Uncomment for debugging
    }
  });
  
  tl.to(element, config.to);
}

function setupStaggerAnimation(container, containerIndex) {
  const animationType = container.getAttribute('scroll-animate');
  const baseAnimationType = animationType.replace('-stagger', '');
  const config = animationConfig[baseAnimationType];
  
  console.log(`Setting up staggered animation for container ${containerIndex}`);
  
  if (!config) {
    console.warn(`Unknown base animation type: ${baseAnimationType}`);
    return;
  }
  
  // Find stagger children using the same logic as the original system
  let staggerChildren = [];
  
  // Priority 1: Elements with stagger-item attribute
  const staggerItems = container.querySelectorAll('[stagger-item]');
  if (staggerItems.length > 0) {
    staggerChildren = Array.from(staggerItems);
  }
  // Priority 2: Elements with role="listitem"
  else {
    const listItems = container.querySelectorAll('[role="listitem"]');
    if (listItems.length > 0) {
      staggerChildren = Array.from(listItems);
    }
    // Priority 3: Direct children
    else {
      staggerChildren = Array.from(container.children);
    }
  }
  
  console.log(`Found ${staggerChildren.length} stagger items`);
  
  if (staggerChildren.length === 0) {
    console.warn('Stagger container has no children to animate');
    return;
  }
  
  // Clear any existing CSS transforms to prevent conflicts
  gsap.set(staggerChildren, { clearProps: 'transform' });
  
  // Set initial state for all children
  gsap.set(staggerChildren, config.from);
  
  // Create staggered animation with custom exit
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: container,
      start: 'top 90%', // Start earlier
      end: 'bottom 10%',
      toggleActions: config.exit ? 'play none none none' : 'play none none reverse',
      onEnter: () => {
        gsap.to(staggerChildren, {
          ...config.to,
          stagger: {
            each: 0.05,
            from: 'start',
            ease: 'power2.out'
          }
        });
      },
      onLeave: config.exit ? () => {
        gsap.to(staggerChildren, {
          ...config.exit,
          stagger: {
            each: 0.015, // Even faster exit stagger
            from: 'start',
            ease: 'power2.out'
          }
        });
      } : undefined,
      onLeaveBack: config.exit ? () => {
        gsap.to(staggerChildren, {
          ...config.exit,
          stagger: {
            each: 0.015, // Fast exit when scrolling up
            from: 'start',
            ease: 'power2.out'
          }
        });
      } : undefined,
      onEnterBack: () => {
        gsap.to(staggerChildren, {
          ...config.to,
          stagger: {
            each: 0.05,
            from: 'start',
            ease: 'power2.out'
          }
        });
      },
      // markers: true // Uncomment for debugging
    }
  });
  
  tl.to(staggerChildren, {
    ...config.to,
    stagger: {
      each: 0.05, // 0.05 seconds between each element (faster than CSS version)
      from: 'start',
      ease: 'power2.out'
    }
  });
  
  // Set animation attribute on children for consistency
  staggerChildren.forEach(child => {
    child.setAttribute('scroll-animate', baseAnimationType);
  });
}

// Utility function to refresh animations (useful for dynamic content)
function refreshScrollAnimations() {
  ScrollTrigger.refresh();
  console.log('ScrollTrigger refreshed');
}

// Export for global access
window.refreshScrollAnimations = refreshScrollAnimations;

// Handle window resize
window.addEventListener('resize', () => {
  ScrollTrigger.refresh();
});