/**
 * Simplified Page Load Tracker
 * Core functionality only: loader progress, Webflow/Rive animations, GSAP ScrollTrigger
 * 
 * Usage:
 * 1. Add data attributes to your loader elements:
 *    - data-loader-percent: text element to show percentage
 *    - data-loader-bar: colored div for progress bar
 * 2. Include this script in your page
 */

class SimplePageLoadTracker {
  constructor() {
    // Configuration
    this.config = {
      minDisplayTime: 500, // Minimum time to show loader (ms)
      fadeOutDuration: 400, // Fade out animation duration (ms)
      updateThrottle: 16, // Update UI every 16ms (60fps)
    };

    // State
    this.startTime = performance.now();
    this.lastUpdateTime = 0;
    this.loadingCompleted = false;
    this.webflowTriggered = false;

    // UI Elements
    this.loaderElement = null;
    this.percentElement = null;
    this.barElement = null;

    // Percentage animation
    this.currentDisplayPercentage = 0;
    this.targetPercentage = 0;
    this.isAnimating = false;

    // Initialize
    this.init();
  }

  init() {
    // Find loader elements
    this.loaderElement = document.querySelector('[data-loader]') || 
                       document.querySelector('.loader') || 
                       document.querySelector('#loader');
    
    this.percentElement = document.querySelector('[data-loader-percent]');
    this.barElement = document.querySelector('[data-loader-bar]');

    if (!this.percentElement || !this.barElement) {
      console.warn('SimplePageLoadTracker: Loader elements not found. Looking for [data-loader-percent] and [data-loader-bar]');
      return;
    }

    // Initial update
    this.updateUI(0);

    // Disable scroll during loading
    this.disableScroll();

    // Start progress simulation
    this.startProgressSimulation();
  }

  startProgressSimulation() {
    // Simple progress simulation based on document ready state
    const updateProgress = () => {
      let progress = 0;
      
      switch (document.readyState) {
        case 'loading':
          progress = 0.1; // 10%
          break;
        case 'interactive':
          progress = 0.5; // 50%
          break;
        case 'complete':
          progress = 0.8; // 80%
          break;
      }

      this.updateUI(progress);

      // Complete when document is ready and minimum time has passed
      if (document.readyState === 'complete') {
        const elapsed = performance.now() - this.startTime;
        const remainingTime = Math.max(0, this.config.minDisplayTime - elapsed);
        
        setTimeout(() => {
          this.completeLoading();
        }, remainingTime);
      } else {
        // Continue checking
        setTimeout(updateProgress, 100);
      }
    };

    updateProgress();
  }

  updateUI(progress) {
    this.targetPercentage = Math.round(progress * 100);
    
    // Start animation if not already running
    if (!this.isAnimating) {
      this.animatePercentage();
    }
    
    if (this.barElement) {
      this.barElement.style.width = `${this.targetPercentage}%`;
      this.barElement.style.setProperty('--progress', this.targetPercentage);
    }
  }

  animatePercentage() {
    this.isAnimating = true;
    
    const animate = () => {
      if (this.currentDisplayPercentage < this.targetPercentage) {
        this.currentDisplayPercentage += 1;
        if (this.percentElement) {
          this.percentElement.textContent = `${this.currentDisplayPercentage}%`;
        }
        requestAnimationFrame(animate);
      } else {
        this.currentDisplayPercentage = this.targetPercentage;
        if (this.percentElement) {
          this.percentElement.textContent = `${this.currentDisplayPercentage}%`;
        }
        this.isAnimating = false;
      }
    };
    
    requestAnimationFrame(animate);
  }

  completeLoading() {
    if (this.loadingCompleted) return;
    this.loadingCompleted = true;

    // Set to 100%
    this.updateUI(1);
    
    // Wait a bit at 100%, then fade out
    setTimeout(() => {
      this.fadeOutLoader();
    }, 200);
  }

  fadeOutLoader() {
    if (!this.loaderElement) return;

    // Fade out
    this.loaderElement.style.transition = `opacity ${this.config.fadeOutDuration}ms ease-out`;
    this.loaderElement.style.opacity = '0';
    
    // Re-enable scrolling
    this.enableScroll();
    
    // Hide after fade out
    setTimeout(() => {
      if (this.loaderElement && this.loaderElement.parentNode) {
        this.loaderElement.style.display = 'none';
      }
      
      // Trigger animations
      this.triggerAnimations();
    }, this.config.fadeOutDuration);
  }

  triggerAnimations() {
    // Trigger Webflow animations (simplified)
    this.triggerWebflowAnimations();
    
    // Trigger Rive animations (simplified)
    this.triggerRiveAnimations();
    
    // Dispatch custom event
    document.dispatchEvent(new CustomEvent('pageLoadComplete'));
  }

  triggerWebflowAnimations() {
    if (typeof Webflow !== 'undefined' && !this.webflowTriggered) {
      this.webflowTriggered = true;
      
      // Single attempt with proper timing
      setTimeout(() => {
        try {
          const wfIx = Webflow.require("ix3");
          if (wfIx && typeof wfIx.emit === 'function') {
            wfIx.emit("page-fully-loaded");
            console.log('✅ Webflow animations triggered');
          }
        } catch (e) {
          console.warn('⚠️ Webflow animation trigger failed:', e.message);
        }
      }, 300); // Single delay, no retries
    }
  }

  triggerRiveAnimations() {
    if (window.riveInstances && Array.isArray(window.riveInstances)) {
      window.riveInstances.forEach((riveInstance, index) => {
        try {
          if (riveInstance && typeof riveInstance.play === 'function') {
            riveInstance.play();
            console.log(`✅ Rive animation ${index + 1} started`);
          }
        } catch (e) {
          console.warn(`⚠️ Rive animation ${index + 1} failed:`, e.message);
        }
      });
    }
  }

  disableScroll() {
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    
    // Disable GSAP ScrollTrigger during loading
    if (typeof gsap !== 'undefined' && gsap.ScrollTrigger) {
      gsap.ScrollTrigger.getAll().forEach(trigger => trigger.disable());
    }
  }

  enableScroll() {
    document.documentElement.style.overflow = '';
    document.body.style.overflow = '';
    
    // Re-enable GSAP ScrollTrigger
    if (typeof gsap !== 'undefined' && gsap.ScrollTrigger) {
      setTimeout(() => {
        gsap.ScrollTrigger.getAll().forEach(trigger => trigger.enable());
        gsap.ScrollTrigger.refresh();
        console.log('✅ ScrollTrigger re-enabled');
      }, 100);
    }
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.simplePageLoadTracker = new SimplePageLoadTracker();
  });
} else {
  window.simplePageLoadTracker = new SimplePageLoadTracker();
}

// Fallback: ensure loader hides even if something goes wrong
window.addEventListener('load', () => {
  setTimeout(() => {
    if (window.simplePageLoadTracker && !window.simplePageLoadTracker.loadingCompleted) {
      window.simplePageLoadTracker.completeLoading();
    }
  }, 2000); // Give it 2 seconds after window.load
});
