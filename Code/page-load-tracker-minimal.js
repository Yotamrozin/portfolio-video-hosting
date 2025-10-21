/**
 * Ultra-Minimal Page Load Tracker
 * Performance testing version - no percentage tracking, just essential functionality
 */

class UltraMinimalPageLoadTracker {
  constructor() {
    // Minimal configuration
    this.config = {
      minDisplayTime: 500,
      fadeOutDuration: 400,
    };

    // Essential state only
    this.startTime = performance.now();

    // UI Elements
    this.loaderElement = null;
    
    // Ultra-aggressive deferral
    if (window.requestIdleCallback) {
      requestIdleCallback(() => this.init(), { timeout: 2000 });
    } else if (window.requestAnimationFrame) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => this.init());
      });
    } else {
      setTimeout(() => this.init(), 100);
    }
  }

  init() {
    // Find loader element only
    this.loaderElement = document.querySelector('[data-loader]') || 
                        document.querySelector('.loader') || 
                        document.querySelector('#loader');

    if (!this.loaderElement) {
      console.warn('UltraMinimalPageLoadTracker: Loader element not found');
      return;
    }

    // Disable scroll immediately
    this.disableScroll();

    // Wait for page to be ready, then complete
    this.waitForCompletion();
  }

  waitForCompletion() {
    const checkCompletion = () => {
      const elapsedTime = performance.now() - this.startTime;
      
      // Complete after minimum display time
      if (elapsedTime >= this.config.minDisplayTime) {
        this.completeLoading();
      } else {
        setTimeout(checkCompletion, 100);
      }
    };

    // Start checking
    setTimeout(checkCompletion, this.config.minDisplayTime);
  }

  disableScroll() {
    if (this.loaderElement) {
      document.body.style.overflow = 'hidden';
    }
  }

  enableScroll() {
    document.body.style.overflow = '';
  }


  completeLoading() {
    const elapsedTime = performance.now() - this.startTime;
    
    if (elapsedTime < this.config.minDisplayTime) {
      setTimeout(() => this.fadeOutLoader(), this.config.minDisplayTime - elapsedTime);
    } else {
      this.fadeOutLoader();
    }
  }

  fadeOutLoader() {
    if (!this.loaderElement) return;

    console.log('🎬 Minimal tracker: Starting fade out');

    // Enable scroll immediately
    this.enableScroll();

    // Simple fade out
    this.loaderElement.style.transition = `opacity ${this.config.fadeOutDuration}ms ease-out`;
    this.loaderElement.style.opacity = '0';

    setTimeout(() => {
      if (this.loaderElement) {
        this.loaderElement.style.display = 'none';
        console.log('✅ Minimal tracker: Loader hidden');
      }
    }, this.config.fadeOutDuration);

    // Trigger Webflow animations (essential) - copied from original script
    if (typeof Webflow !== 'undefined') {
      try {
        // Wait a bit for Webflow to be fully ready
        setTimeout(() => {
          try {
            const wfIx = Webflow.require("ix3");
            if (wfIx && typeof wfIx.emit === 'function') {
              wfIx.emit("page-fully-loaded");
              console.log('✅ Ultra-minimal tracker: Webflow animations triggered successfully');
            } else {
              console.warn('⚠️ Ultra-minimal tracker: Webflow ix3 not available or emit function missing');
            }
          } catch (innerError) {
            console.warn('⚠️ Ultra-minimal tracker: Error triggering Webflow animations:', innerError.message);
          }
        }, 100);
      } catch (e) {
        console.warn('⚠️ Ultra-minimal tracker: Could not trigger Webflow animations:', e.message);
      }
    } else {
      console.warn('⚠️ Ultra-minimal tracker: Webflow not available');
    }

    // Trigger Rive animations (essential) - copied from original script
    if (window.riveInstances && Array.isArray(window.riveInstances)) {
      window.riveInstances.forEach((riveInstance, index) => {
        try {
          riveInstance.play();
          console.log(`Started Rive animation ${index + 1}`);
        } catch (e) {
          console.warn(`Could not start Rive animation ${index + 1}:`, e);
        }
      });
    }
  }
}

// Initialize when DOM is ready
function initializeUltraMinimalPageLoadTracker() {
  // Check if this is a navigation vs fresh load
  const isBackForward = window.performance.navigation.type === 2;
  const loadTime = performance.now();
  const isLikelyCached = loadTime < 20; // Very fast load suggests cached content

  // Skip loader for cached navigations
  if (isBackForward && isLikelyCached) {
    console.log('🚀 Navigation detected - skipping ultra-minimal loader');
    return;
  }

  console.log('🎬 Initializing ultra-minimal page load tracker');
  new UltraMinimalPageLoadTracker();
}

// Start tracking when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeUltraMinimalPageLoadTracker);
} else {
  initializeUltraMinimalPageLoadTracker();
}

// Global functions for external access
window.enableUltraMinimalPageLoadDebug = function() {
  console.log('Ultra-minimal tracker debug enabled');
};

window.disableUltraMinimalPageLoadDebug = function() {
  console.log('Ultra-minimal tracker debug disabled');
};

window.showUltraMinimalPageLoadReport = function() {
  console.log('Ultra-minimal tracker report requested');
};
