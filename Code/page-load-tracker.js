/**
 * Page Load Progress Tracker
 * Tracks actual loading progress of all page assets including images, videos, stylesheets, scripts, etc.
 * 
 * Usage:
 * 1. Add data attributes to your loader elements:
 *    - data-loader-percent: text element to show percentage
 *    - data-loader-bar: colored div for progress bar
 * 2. Include this script in your page
 */

class PageLoadTracker {
  constructor() {
    // Configuration
    this.config = {
      minDisplayTime: 500, // Minimum time to show loader (ms)
      fadeOutDuration: 400, // Fade out animation duration (ms)
      updateThrottle: 16, // Update UI every 16ms (60fps)
    };

    // State
    this.totalResources = 0;
    this.loadedResources = 0;
    this.domProgress = 0;
    this.resourceProgress = 0;
    this.startTime = performance.now();
    this.lastUpdateTime = 0;

    // UI Elements
    this.loaderElement = null;
    this.percentElement = null;
    this.barElement = null;

    // Resource tracking
    this.trackedResources = new Set();
    this.resourceTypes = ['img', 'script', 'link', 'video', 'audio', 'iframe'];
    
    // Scroll management
    this.scrollY = 0;
    
    // Percentage animation
    this.currentDisplayPercentage = 0;
    this.targetPercentage = 0;
    this.isAnimating = false;
    
    // Bind methods
    this.updateProgress = this.updateProgress.bind(this);
    this.completeLoading = this.completeLoading.bind(this);
    
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
      console.warn('PageLoadTracker: Loader elements not found. Looking for [data-loader-percent] and [data-loader-bar]');
      return;
    }

    // Disable scrolling while loading
    this.disableScroll();

    // Start tracking
    this.trackDOMProgress();
    this.setupPerformanceObserver();
    
    // Initial update
    this.updateUI(0);
  }

  trackDOMProgress() {
    // Track document ready states
    const updateDOMProgress = () => {
      switch (document.readyState) {
        case 'loading':
          this.domProgress = 0.1; // 10% for starting
          break;
        case 'interactive':
          this.domProgress = 0.3; // 30% when DOM is ready
          this.scanForResources(); // Scan for all resources
          break;
        case 'complete':
          this.domProgress = 0.5; // 50% when document is complete
          break;
      }
      this.updateProgress();
    };

    document.addEventListener('readystatechange', updateDOMProgress);
    updateDOMProgress(); // Check current state
  }

  scanForResources() {
    // Scan the DOM for all media resources
    this.resourceTypes.forEach(type => {
      const elements = document.querySelectorAll(type);
      elements.forEach(element => this.trackElement(element));
    });

    // Also check for background images in CSS
    this.trackBackgroundImages();

    // Set initial total
    this.totalResources = Math.max(this.trackedResources.size, 1);
    this.updateProgress();
  }

  trackBackgroundImages() {
    // Check all elements for background images
    const allElements = document.querySelectorAll('*');
    allElements.forEach(element => {
      const bgImage = window.getComputedStyle(element).backgroundImage;
      if (bgImage && bgImage !== 'none') {
        const urls = bgImage.match(/url\(['"]?(.*?)['"]?\)/g);
        if (urls) {
          urls.forEach(url => {
            const cleanUrl = url.replace(/url\(['"]?|['"]?\)/g, '');
            if (cleanUrl && !cleanUrl.startsWith('data:')) {
              this.trackedResources.add(cleanUrl);
            }
          });
        }
      }
    });
  }

  trackElement(element) {
    const src = element.src || element.href || element.currentSrc;
    
    if (!src || src.startsWith('data:') || this.trackedResources.has(src)) {
      return;
    }

    this.trackedResources.add(src);

    // Check if already loaded
    if (this.isElementLoaded(element)) {
      this.loadedResources++;
      this.updateProgress();
      return;
    }

    // Track loading
    const onLoad = () => {
      this.loadedResources++;
      this.updateProgress();
      cleanup();
    };

    const onError = () => {
      console.warn('Failed to load resource:', src);
      this.loadedResources++; // Count errors as loaded to prevent hanging
      this.updateProgress();
      cleanup();
    };

    const cleanup = () => {
      element.removeEventListener('load', onLoad);
      element.removeEventListener('error', onError);
    };

    element.addEventListener('load', onLoad);
    element.addEventListener('error', onError);

    // For videos, also track canplaythrough
    if (element.tagName === 'VIDEO') {
      element.addEventListener('canplaythrough', onLoad, { once: true });
    }
  }

  isElementLoaded(element) {
    if (element.tagName === 'IMG') {
      return element.complete && element.naturalHeight !== 0;
    }
    if (element.tagName === 'VIDEO') {
      return element.readyState >= 3; // HAVE_FUTURE_DATA or better
    }
    if (element.tagName === 'LINK') {
      return element.sheet !== null;
    }
    if (element.tagName === 'SCRIPT') {
      return element.readyState === 'complete' || element.readyState === 'loaded';
    }
    return false;
  }

  setupPerformanceObserver() {
    // Use PerformanceObserver to track resources loaded via fetch, XHR, etc.
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach(entry => {
            if (entry.entryType === 'resource') {
              // Track resources loaded via network
              if (!this.trackedResources.has(entry.name)) {
                this.trackedResources.add(entry.name);
                this.totalResources++;
                
                // If it's already loaded, count it
                if (entry.responseEnd > 0) {
                  this.loadedResources++;
                  this.updateProgress();
                }
              }
            }
          });
        });

        observer.observe({ entryTypes: ['resource'] });
      } catch (e) {
        console.warn('PerformanceObserver not fully supported:', e);
      }
    }

    // Also check already loaded resources
    if (window.performance && window.performance.getEntriesByType) {
      const resources = window.performance.getEntriesByType('resource');
      resources.forEach(resource => {
        if (!this.trackedResources.has(resource.name)) {
          this.trackedResources.add(resource.name);
          this.totalResources++;
          this.loadedResources++;
        }
      });
      this.updateProgress();
    }
  }

  updateProgress() {
    // Calculate resource loading progress (0-0.5)
    this.resourceProgress = this.totalResources > 0 
      ? (this.loadedResources / this.totalResources) * 0.5 
      : 0;

    // Combined progress: DOM progress (0-0.5) + Resource progress (0-0.5)
    const totalProgress = Math.min(this.domProgress + this.resourceProgress, 1);

    // Throttle UI updates
    const now = performance.now();
    if (now - this.lastUpdateTime >= this.config.updateThrottle) {
      this.updateUI(totalProgress);
      this.lastUpdateTime = now;
    }

    // Check if complete
    if (document.readyState === 'complete' && 
        this.loadedResources >= this.totalResources && 
        totalProgress >= 0.99) {
      this.completeLoading();
    }
  }

  updateUI(progress) {
    this.targetPercentage = Math.round(progress * 100);
    
    // Start animation if not already running
    if (!this.isAnimating) {
      this.animatePercentage();
    }
    
    if (this.barElement) {
      // Update width for horizontal bars or height for vertical bars
      this.barElement.style.width = `${this.targetPercentage}%`;
      // Alternatively, for vertical bars, uncomment:
      // this.barElement.style.height = `${this.targetPercentage}%`;
      
      // Optional: update custom property for more flexible styling
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
    // Ensure minimum display time
    const elapsed = performance.now() - this.startTime;
    const remainingTime = Math.max(0, this.config.minDisplayTime - elapsed);

    setTimeout(() => {
      // Set to 100%
      this.updateUI(1);
      
      // Wait a bit at 100%, then fade out
      setTimeout(() => {
        this.fadeOutLoader();
      }, 200);
    }, remainingTime);
  }

  fadeOutLoader() {
    if (!this.loaderElement) return;

    // Add fade out class or apply inline styles
    this.loaderElement.style.transition = `opacity ${this.config.fadeOutDuration}ms ease-out`;
    this.loaderElement.style.opacity = '0';
    
    // Re-enable scrolling
    this.enableScroll();
    
    // Remove from DOM after fade out
    setTimeout(() => {
      if (this.loaderElement && this.loaderElement.parentNode) {
        this.loaderElement.style.display = 'none';
        // Optional: completely remove from DOM
        // this.loaderElement.remove();
      }
      
      // Trigger custom event
      document.dispatchEvent(new CustomEvent('pageLoadComplete'));
      
      // Trigger Webflow animations
      if (typeof Webflow !== 'undefined') {
        try {
          const wfIx = Webflow.require("ix3")
          wfIx.emit("page-fully-loaded");
        } catch (e) {
          console.warn('Could not trigger Webflow animations:', e);
        }
      }
      
      // Trigger Rive animations
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
    }, this.config.fadeOutDuration);
  }

  disableScroll() {
    // Store current scroll position
    this.scrollY = window.scrollY;
    
    // Apply styles to prevent scrolling
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = `-${this.scrollY}px`;
    document.body.style.width = '100%';
  }

  enableScroll() {
    // Remove scroll prevention styles
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';
    
    // Restore scroll position
    window.scrollTo(0, this.scrollY || 0);
  }

  // Public API for manual control
  setProgress(percentage) {
    this.updateUI(percentage / 100);
  }

  hide() {
    this.fadeOutLoader();
  }
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.pageLoadTracker = new PageLoadTracker();
  });
} else {
  window.pageLoadTracker = new PageLoadTracker();
}

// Fallback: ensure loader hides even if something goes wrong
window.addEventListener('load', () => {
  setTimeout(() => {
    if (window.pageLoadTracker && document.querySelector('[data-loader]')) {
      window.pageLoadTracker.completeLoading();
    }
  }, 3000); // Give it 3 seconds after window.load
});

