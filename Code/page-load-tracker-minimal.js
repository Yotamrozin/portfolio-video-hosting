/**
 * Minimal Page Load Progress Tracker
 * Ultra-lightweight version for performance testing
 * Only tracks essential loading progress without animations, logging, or debug features
 */

class MinimalPageLoadTracker {
  constructor() {
    // Minimal configuration
    this.config = {
      minDisplayTime: 500,
      fadeOutDuration: 400,
    };

    // Essential state only
    this.totalResources = 0;
    this.loadedResources = 0;
    this.startTime = performance.now();

    // UI Elements
    this.loaderElement = null;
    this.percentElement = null;
    this.barElement = null;

    // Resource tracking (minimal)
    this.trackedResources = new Set();
    this.resourceTypes = ['img', 'script', 'link', 'video', 'audio', 'iframe'];
    
    // Bind methods
    this.updateProgress = this.updateProgress.bind(this);
    this.completeLoading = this.completeLoading.bind(this);
    
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
    // Find loader elements (minimal DOM queries)
    this.loaderElement = document.querySelector('[data-loader]') || 
                        document.querySelector('.loader') || 
                        document.querySelector('#loader');
    
    this.percentElement = document.querySelector('[data-loader-percent]');
    this.barElement = document.querySelector('[data-loader-bar]');

    if (!this.percentElement || !this.barElement) {
      console.warn('MinimalPageLoadTracker: Loader elements not found');
      return;
    }

    // Initial update
    this.updateUI(0);

    // Defer non-critical operations
    const deferredInit = () => {
      this.disableScroll();
      this.trackDOMProgress();
    };

    if (window.requestIdleCallback) {
      requestIdleCallback(deferredInit, { timeout: 1000 });
    } else {
      setTimeout(deferredInit, 50);
    }
  }

  trackDOMProgress() {
    const updateDOMProgress = () => {
      switch (document.readyState) {
        case 'loading':
          this.domProgress = 10;
          break;
        case 'interactive':
          this.domProgress = 50;
          break;
        case 'complete':
          this.domProgress = 100;
          break;
      }
      this.updateProgress();
    };

    updateDOMProgress();
    document.addEventListener('readystatechange', updateDOMProgress);
  }

  disableScroll() {
    if (this.loaderElement) {
      document.body.style.overflow = 'hidden';
    }
  }

  enableScroll() {
    document.body.style.overflow = '';
  }

  trackElement(element) {
    if (!element || this.trackedResources.has(element)) return;

    this.trackedResources.add(element);
    this.totalResources++;

    // Skip lazy videos
    if (element.tagName === 'VIDEO' && 
        (element.loading === 'lazy' || element.preload === 'none' || element.preload === 'metadata')) {
      return;
    }

    const onLoad = () => {
      this.loadedResources++;
      this.updateProgress();
    };

    const onError = () => {
      this.loadedResources++;
      this.updateProgress();
    };

    if (element.tagName === 'IMG') {
      if (element.complete) {
        onLoad();
      } else {
        element.addEventListener('load', onLoad);
        element.addEventListener('error', onError);
      }
    } else if (element.tagName === 'SCRIPT') {
      if (element.readyState === 'complete' || element.readyState === 'loaded') {
        onLoad();
      } else {
        element.addEventListener('load', onLoad);
        element.addEventListener('error', onError);
      }
    } else if (element.tagName === 'LINK') {
      if (element.sheet) {
        onLoad();
      } else {
        element.addEventListener('load', onLoad);
        element.addEventListener('error', onError);
      }
    }
  }

  trackAllResources() {
    this.resourceTypes.forEach(tagName => {
      const elements = document.querySelectorAll(tagName);
      elements.forEach(element => this.trackElement(element));
    });
  }

  updateProgress() {
    const domWeight = 0.3;
    const resourceWeight = 0.7;
    
    const domProgress = this.domProgress || 0;
    const resourceProgress = this.totalResources > 0 ? 
      (this.loadedResources / this.totalResources) * 100 : 0;
    
    const totalProgress = (domProgress * domWeight) + (resourceProgress * resourceWeight);
    
    this.updateUI(totalProgress);
  }

  updateUI(percentage) {
    if (!this.percentElement || !this.barElement) return;

    // Simple, non-animated updates
    this.percentElement.textContent = Math.round(percentage) + '%';
    this.barElement.style.width = percentage + '%';

    // Complete loading when ready
    if (percentage >= 100) {
      this.completeLoading();
    }
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

    this.enableScroll();

    // Simple fade out
    this.loaderElement.style.transition = `opacity ${this.config.fadeOutDuration}ms ease-out`;
    this.loaderElement.style.opacity = '0';

    setTimeout(() => {
      if (this.loaderElement) {
        this.loaderElement.style.display = 'none';
      }
    }, this.config.fadeOutDuration);

    // Trigger Webflow animations (essential)
    if (typeof Webflow !== 'undefined') {
      try {
        setTimeout(() => {
          try {
            const wfIx = Webflow.require("ix3");
            if (wfIx && typeof wfIx.emit === 'function') {
              wfIx.emit("page-fully-loaded");
            }
          } catch (innerError) {
            console.warn('⚠️ Error triggering Webflow animations:', innerError.message);
          }
        }, 100);
      } catch (e) {
        console.warn('⚠️ Could not trigger Webflow animations:', e.message);
      }
    }

    // Trigger Rive animations (essential)
    if (window.riveInstances && Array.isArray(window.riveInstances)) {
      window.riveInstances.forEach((riveInstance, index) => {
        try {
          if (riveInstance && typeof riveInstance.play === 'function') {
            riveInstance.play();
          }
        } catch (error) {
          console.warn(`⚠️ Error starting Rive animation ${index + 1}:`, error.message);
        }
      });
    }
  }
}

// Initialize when DOM is ready
function initializeMinimalPageLoadTracker() {
  // Check if this is a navigation vs fresh load
  const isBackForward = window.performance.navigation.type === 2;
  const loadTime = performance.now();
  const isLikelyCached = loadTime < 20; // Very fast load suggests cached content

  // Skip loader for cached navigations
  if (isBackForward && isLikelyCached) {
    console.log('🚀 Navigation detected - skipping minimal loader');
    return;
  }

  console.log('🎬 Initializing minimal page load tracker');
  new MinimalPageLoadTracker();
}

// Start tracking when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeMinimalPageLoadTracker);
} else {
  initializeMinimalPageLoadTracker();
}

// Global functions for external access
window.enableMinimalPageLoadDebug = function() {
  console.log('Minimal tracker debug enabled');
};

window.disableMinimalPageLoadDebug = function() {
  console.log('Minimal tracker debug disabled');
};

window.showMinimalPageLoadReport = function() {
  console.log('Minimal tracker report requested');
};
