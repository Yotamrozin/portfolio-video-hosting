/**
 * Scroll Animation System - FIXED VERSION
 * This script handles the animation of elements as they scroll into view
 * Works with the CSS animation system to apply animations based on scroll-animate attributes
 */

document.addEventListener('DOMContentLoaded', function() {
  
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
  
  // Remove is-inview class from all animated elements initially
  animatedElements.forEach(el => {
    el.classList.remove('is-inview');
  });
  
  // Handle stagger containers - SCOPED to animatedElements for better performance
  const staggerContainers = Array.from(animatedElements).filter(el => 
    el.getAttribute('scroll-animate').includes('stagger')
  );
  
  staggerContainers.forEach((container, index) => {
    
    // Get all children that should be staggered
    let children = container.querySelectorAll('[stagger-item]');
    if (children.length === 0) {
      children = container.querySelectorAll(':scope > [role="listitem"]');
    }
    if (children.length === 0) {
      children = container.querySelectorAll(':scope > *');
    }
    
    if (children.length) {
      
      // IMPORTANT: Make the container visible and remove its animation
      container.style.opacity = '1';
      container.style.transform = 'none';
      
      // Setup children for staggered animation - FIXED: Reverse the stagger order
      children.forEach((child, childIndex) => {
        // Remove is-inview class from children
        child.classList.remove('is-inview');
        
        // Remove any existing stagger delay classes first
        for (let i = 1; i <= 8; i++) {
          child.classList.remove(`stagger-delay-${i}`);
        }
        
        // FIXED: Reverse the stagger order so first element appears first
        // Calculate delay: first element gets delay-1, second gets delay-2, etc.
        const delayClass = `stagger-delay-${Math.min(childIndex + 1, 8)}`;
        child.classList.add(delayClass);
        
        // Get the base animation type (remove -stagger suffix)
        const containerAnimationType = container.getAttribute('scroll-animate');
        const childAnimationType = containerAnimationType.replace('-stagger', '');
        
        // Set the animation attribute on the child
        child.setAttribute('scroll-animate', childAnimationType);
        
        // Observe the child element
        observer.observe(child);
      });
      
      // Don't observe the container itself since children handle the animation
    } else {
      // Fall back to animating the container itself
      observer.observe(container);
    }
  });
  
  // Handle non-stagger elements - SCOPED for better performance
  const nonStaggerElements = Array.from(animatedElements).filter(el => 
    !el.getAttribute('scroll-animate').includes('stagger') && 
    !el.hasAttribute('stagger-item')
  );
  
  nonStaggerElements.forEach(el => {
    observer.observe(el);
  });
  
  // Handle elements that should be visible immediately (above the fold)
  // Use requestAnimationFrame for better timing
  requestAnimationFrame(() => {
    setTimeout(() => {
      const viewportHeight = window.innerHeight;
      
      // Check non-stagger elements
      nonStaggerElements.forEach(el => {
        const rect = el.getBoundingClientRect();
        
        // If element is already in the initial viewport, animate it immediately
        if (rect.top < viewportHeight * 0.8 && rect.bottom > 0) {
          el.classList.add('is-inview');
        }
      });
      
      // Also check stagger items that might be above the fold
      document.querySelectorAll('[stagger-item], [scroll-animate*="stagger"] > *').forEach(el => {
        if (el.hasAttribute('scroll-animate') && !el.getAttribute('scroll-animate').includes('stagger')) {
          const rect = el.getBoundingClientRect();
          if (rect.top < viewportHeight * 0.8 && rect.bottom > 0) {
            el.classList.add('is-inview');
          }
        }
      });
    }, 100);
  });
});