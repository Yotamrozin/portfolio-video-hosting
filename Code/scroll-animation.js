/**
 * Scroll Animation System
 * This script handles the animation of elements as they scroll into view
 * Works with the CSS animation system to apply animations based on scroll-animate attributes
 */

document.addEventListener('DOMContentLoaded', function() {
  console.log('Scroll animation system initialized');
  
  // Set up Intersection Observer
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      // Add class when element is in view
      if (entry.isIntersecting) {
        entry.target.classList.add('is-inview');
        // Optional: unobserve after animation is triggered to save resources
        // observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1, // Trigger when 10% of the element is visible
    rootMargin: '0px 0px -10% 0px' // Slightly offset from bottom
  });

  // Find all elements with scroll-animate attribute
  const animatedElements = document.querySelectorAll('[scroll-animate]');
  
  console.log(`Found ${animatedElements.length} elements with scroll animations`);
  
  // First, handle stagger containers
  const staggerContainers = document.querySelectorAll('[scroll-animate*="stagger"]');
  
  staggerContainers.forEach((container, index) => {
    console.log(`Setting up staggered animation for container ${index}`);
    
    // Get all children that should be staggered
    // Try stagger-item first, then role="listitem", then all direct children
    let children = container.querySelectorAll('[stagger-item]');
    if (children.length === 0) {
      children = container.querySelectorAll(':scope > [role="listitem"]');
    }
    if (children.length === 0) {
      children = container.querySelectorAll(':scope > *');
    }
    
    if (children.length) {
      console.log(`Found ${children.length} stagger items`);
      
      // Remove is-inview class from children if they already have it
      children.forEach((child, childIndex) => {
        child.classList.remove('is-inview');
        
        // Remove any existing stagger delay classes first
        for (let i = 1; i <= 8; i++) {
          child.classList.remove(`stagger-delay-${i}`);
        }
        
        // Add the correct stagger delay class based on position
        const delayClass = `stagger-delay-${Math.min(childIndex + 1, 8)}`;
        child.classList.add(delayClass);
        
        // Ensure the child has the correct animation type
        const animationType = container.getAttribute('scroll-animate');
        child.setAttribute('scroll-animate', animationType.replace('-stagger', ''));
        
        // Observe the child element
        observer.observe(child);
      });
    } else {
      console.warn('Stagger container has no stagger-item children');
      // Fall back to animating the container itself
      observer.observe(container);
    }
  });
  
  // Then handle non-stagger elements
  const nonStaggerElements = document.querySelectorAll('[scroll-animate]:not([scroll-animate*="stagger"]):not([stagger-item])');
  
  nonStaggerElements.forEach(el => {
    observer.observe(el);
  });
  
  // Remove is-inview class from all animated elements initially
  // This ensures stagger animations work properly
  animatedElements.forEach(el => {
    el.classList.remove('is-inview');
  });
  
  // Handle elements that should be visible immediately (above the fold)
  setTimeout(() => {
    const viewportHeight = window.innerHeight;
    
    animatedElements.forEach(el => {
      const rect = el.getBoundingClientRect();
      
      // If element is already in the initial viewport, animate it immediately
      const isStaggerItem = el.classList.contains('stagger-delay-1') || el.classList.contains('stagger-delay-2') || el.classList.contains('stagger-delay-3') || el.classList.contains('stagger-delay-4') || el.classList.contains('stagger-delay-5') || el.classList.contains('stagger-delay-6') || el.classList.contains('stagger-delay-7') || el.classList.contains('stagger-delay-8');
      const isStaggerContainer = el.getAttribute('scroll-animate') && el.getAttribute('scroll-animate').includes('stagger');
      
      // Animate non-stagger elements and stagger items (but not stagger containers)
      if (rect.top < viewportHeight && !isStaggerContainer) {
        el.classList.add('is-inview');
      }
    });
  }, 100); // Small delay to ensure DOM is ready
});