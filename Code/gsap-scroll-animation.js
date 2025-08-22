
/**
 * GSAP-Based Scroll Animation System - SIMPLIFIED & RELIABLE
 * Maintains compatibility with existing custom attributes while leveraging GSAP's superior performance
 */

console.log('GSAP Scroll animation system initialized');

// Animation configurations - SIMPLIFIED with faster timings
const animationConfig = {
  'slide-up': {
    from: { y: -30, opacity: 0 }, // Start above (negative y)
    to: { y: 0, opacity: 1, duration: 0.4, ease: 'power1.out' }, // Smoother slide down to center
    exit: { y: 15, opacity: 0, duration: 0.2, ease: 'power1.in' } // Smoother exit below
  },
  'slide-down': {
    from: { y: -30, opacity: 0 },
    to: { y: 0, opacity: 1, duration: 0.3, ease: 'power2.out' },
    exit: { y: 15, opacity: 0, duration: 0.15, ease: 'power2.in' }
  },
  'slide-left': {
    from: { x: 30, opacity: 0 },
    to: { x: 0, opacity: 1, duration: 0.4, ease: 'power2.out' },
    exit: { x: -15, opacity: 0, duration: 0.25, ease: 'power2.in' }
  },
  'slide-right': {
    from: { x: -30, opacity: 0 },
    to: { x: 0, opacity: 1, duration: 0.4, ease: 'power2.out' },
    exit: { x: 15, opacity: 0, duration: 0.25, ease: 'power2.in' }
  },
  'fade-in': {
    from: { opacity: 0 },
    to: { opacity: 1, duration: 0.5, ease: 'none' },
    exit: { opacity: 0, duration: 0.2, ease: 'none' }
  },
  'scale-up': {
    from: { scale: 0.95, opacity: 0 },
    to: { scale: 1, opacity: 1, duration: 0.3, ease: 'power3.out' },
    exit: { scale: 0.98, opacity: 0, duration: 0.25, ease: 'power2.in' }
  },
  'slide-up-backout': {
    from: { y: 40, opacity: 0 },
    to: { y: 0, opacity: 1, duration: 0.6, ease: 'back.out(1.7)' }, // Less aggressive bounce
    exit: { y: -20, opacity: 0, duration: 0.3, ease: 'power2.in' }
  },
  'scale-up-backout': {
    from: { scale: 0.9, opacity: 0 },
    to: { scale: 1, opacity: 1, duration: 0.3, ease: 'back.out(1.7)' },
    exit: { scale: 0.95, opacity: 0, duration: 0.3, ease: 'power2.in' }
  }
};

// Initialize animations when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  initializeScrollAnimations();
});

function initializeScrollAnimations() {
  const animatedElements = document.querySelectorAll('[scroll-animate]');
  console.log(`Found ${animatedElements.length} elements with scroll animations`);
  
  animatedElements.forEach((element, index) => {
    const animationType = element.getAttribute('scroll-animate');
    
    if (animationType.includes('-stagger')) {
      setupStaggerAnimation(element, index);
    } else {
      setupSingleAnimation(element, animationType);
    }
  });
  
  ScrollTrigger.refresh();
}

function setupSingleAnimation(element, animationType) {
  const config = animationConfig[animationType];
  
  if (!config) {
    console.warn(`Unknown animation type: ${animationType}`);
    return;
  }
  
  // Set initial state immediately, but preserve existing transforms for hover effects
  gsap.set(element, {
    ...config.from,
    clearProps: "none" // Don't clear existing CSS transforms
  });
  
  // Create ScrollTrigger - SIMPLIFIED approach without timeline conflicts
  ScrollTrigger.create({
        markers: true, // Uncomment for debugging

    trigger: element,
    start: 'top 80%', // Balanced trigger point for reliable animations
    end: 'bottom 5%', // Exit only when almost completely out of viewport
    onEnter: () => {
      // Kill any existing animations on this element
      gsap.killTweensOf(element);
      gsap.to(element, {
        ...config.to,
        clearProps: "none" // Preserve CSS hover transforms
      });
    },
    onLeave: () => {
      if (config.exit) {
        gsap.killTweensOf(element);
        gsap.to(element, {
          ...config.exit,
          clearProps: "none" // Preserve CSS hover transforms
        });
      }
    },
    onEnterBack: () => {
      gsap.killTweensOf(element);
      gsap.to(element, {
        ...config.to,
        clearProps: "none" // Preserve CSS hover transforms
      });
    },
    onLeaveBack: () => {
      if (config.exit) {
        gsap.killTweensOf(element);
        gsap.to(element, {
          ...config.exit,
          clearProps: "none" // Preserve CSS hover transforms
        });
      }
    }
  });
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
  
  // Find stagger children
  let staggerChildren = [];
  
  const staggerItems = container.querySelectorAll('[stagger-item]');
  if (staggerItems.length > 0) {
    staggerChildren = Array.from(staggerItems);
  } else {
    const listItems = container.querySelectorAll('[role="listitem"]');
    if (listItems.length > 0) {
      staggerChildren = Array.from(listItems);
    } else {
      staggerChildren = Array.from(container.children);
    }
  }
  
  console.log(`Found ${staggerChildren.length} stagger items`);
  
  if (staggerChildren.length === 0) {
    console.warn('Stagger container has no children to animate');
    return;
  }
  
  // Set initial state for all children immediately, preserving CSS transforms
  gsap.set(staggerChildren, {
    ...config.from,
    clearProps: "none" // Preserve CSS hover transforms
  });
  
  // Create ScrollTrigger for stagger animation - MUCH SIMPLER
  ScrollTrigger.create({
    trigger: container,
    start: 'top 80%', // Balanced trigger point for reliable animations
    end: 'bottom 5%', // Exit only when almost completely out of viewport
    onEnter: () => {
      gsap.killTweensOf(staggerChildren);
      gsap.to(staggerChildren, {
        ...config.to,
        clearProps: "none", // Preserve CSS hover transforms
        stagger: {
          each: 0.05, // Much faster stagger for immediate response
          from: 'start'
        }
      });
    },
    onLeave: () => {
      if (config.exit) {
        gsap.killTweensOf(staggerChildren);
        gsap.to(staggerChildren, {
          ...config.exit,
          clearProps: "none", // Preserve CSS hover transforms
          stagger: {
            each: 0.02, // Ultra-fast exit
            from: 'start'
          }
        });
      }
    },
    onEnterBack: () => {
      gsap.killTweensOf(staggerChildren);
      gsap.to(staggerChildren, {
        ...config.to,
        clearProps: "none", // Preserve CSS hover transforms
        stagger: {
          each: 0.08,
          from: 'start'
        }
      });
    },
    onLeaveBack: () => {
      if (config.exit) {
        gsap.killTweensOf(staggerChildren);
        gsap.to(staggerChildren, {
          ...config.exit,
          clearProps: "none", // Preserve CSS hover transforms
          stagger: {
            each: 0.03,
            from: 'start'
          }
        });
      }
    }
    // markers: true // Uncomment for debugging
  });
  
  // Set animation attribute on children for consistency
  staggerChildren.forEach(child => {
    child.setAttribute('scroll-animate', baseAnimationType);
  });
}

// Utility functions
function refreshScrollAnimations() {
  ScrollTrigger.refresh();
  console.log('ScrollTrigger refreshed');
}

window.refreshScrollAnimations = refreshScrollAnimations;

window.addEventListener('resize', () => {
  ScrollTrigger.refresh();
});
