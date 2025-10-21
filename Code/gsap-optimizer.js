/**
 * GSAP Optimization Script
 * Defers GSAP scripts to prevent render blocking
 * Triggers animations only after essential content is visible
 */

class GSAPOptimizer {
  constructor() {
    this.gsapReady = false;
    this.animationsQueued = [];
    this.init();
  }

  init() {
    console.log('🎭 Initializing GSAP optimizer');
    
    // Defer GSAP scripts
    this.deferGSAPScripts();
    
    // Wait for GSAP to be ready
    this.waitForGSAP();
    
    // Queue animations until GSAP is ready
    this.queueAnimations();
  }

  deferGSAPScripts() {
    // Find all GSAP-related scripts
    const gsapScripts = document.querySelectorAll('script[src*="gsap"], script[src*="webflow"]');
    
    gsapScripts.forEach(script => {
      if (!script.defer && !script.async) {
        console.log('⏳ Deferring GSAP script:', script.src);
        script.defer = true;
      }
    });
  }

  waitForGSAP() {
    const checkGSAP = () => {
      if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        this.gsapReady = true;
        console.log('✅ GSAP ready - executing queued animations');
        this.executeQueuedAnimations();
      } else {
        setTimeout(checkGSAP, 100);
      }
    };
    
    // Start checking after a short delay
    setTimeout(checkGSAP, 500);
  }

  queueAnimations() {
    // Override Webflow's animation trigger
    const originalEmit = window.Webflow?.require?.("ix3")?.emit;
    if (originalEmit) {
      window.Webflow.require("ix3").emit = (event) => {
        if (event === "page-fully-loaded") {
          if (this.gsapReady) {
            console.log('🎬 Executing Webflow animations');
            originalEmit.call(this, event);
          } else {
            console.log('⏳ Queuing Webflow animations until GSAP is ready');
            this.animationsQueued.push(() => originalEmit.call(this, event));
          }
        } else {
          originalEmit.call(this, event);
        }
      };
    }
  }

  executeQueuedAnimations() {
    // Execute all queued animations
    this.animationsQueued.forEach(animation => {
      try {
        animation();
      } catch (e) {
        console.warn('⚠️ Error executing queued animation:', e);
      }
    });
    
    this.animationsQueued = [];
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new GSAPOptimizer();
  });
} else {
  new GSAPOptimizer();
}
