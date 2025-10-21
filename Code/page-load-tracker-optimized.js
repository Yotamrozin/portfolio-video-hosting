/**
 * Optimized Page Load Tracker - Only waits for essential resources
 * Shows page content immediately, loads non-critical resources in background
 */

class OptimizedPageLoadTracker {
  constructor() {
    this.config = {
      minDisplayTime: 300, // Reduced minimum display time
      fadeOutDuration: 400,
      enableDebugLogging: true,
      essentialResources: [
        'hero', 'navigation', 'main-content', 'above-fold'
      ]
    };
    
    this.loader = null;
    this.startTime = performance.now();
    this.essentialLoaded = false;
    this.loadingCompleted = false;
    this.webflowTriggered = false;
    
    // Smart initialization
    this.initializePageLoadTracker();
  }

  initializePageLoadTracker() {
    // Skip loader for back/forward navigation
    if (this.isNavigationLoad()) {
      console.log('🚀 Navigation detected - skipping loader');
      this.triggerAnimations();
      return;
    }

    // Initialize loader
    this.init();
  }

  isNavigationLoad() {
    const navEntries = performance.getEntriesByType('navigation');
    if (navEntries.length === 0) return false;
    
    const nav = navEntries[0];
    const loadTime = nav.loadEventEnd - nav.loadEventStart;
    
    // Very fast loads are likely cached navigations
    return loadTime < 20;
  }

  init() {
    console.log('🎬 Initializing optimized page load tracker');
    
    this.loader = document.querySelector('[data-loader]');
    if (!this.loader) {
      console.warn('⚠️ Loader element not found');
      this.triggerAnimations();
      return;
    }

    this.disableScroll();
    this.trackEssentialResources();
    this.startCompletionTimer();
  }

  disableScroll() {
    document.body.style.overflow = 'hidden';
  }

  enableScroll() {
    document.body.style.overflow = '';
  }

  trackEssentialResources() {
    console.log('🔍 Tracking essential resources only');
    
    // Track critical images (hero, above-fold)
    const criticalImages = document.querySelectorAll('img[data-priority="high"], .hero img, .above-fold img');
    let criticalImagesLoaded = 0;
    const totalCriticalImages = criticalImages.length;

    criticalImages.forEach((img, index) => {
      if (img.complete) {
        criticalImagesLoaded++;
      } else {
        img.addEventListener('load', () => {
          criticalImagesLoaded++;
          console.log(`✅ Critical image ${index + 1} loaded`);
          this.checkEssentialComplete(criticalImagesLoaded, totalCriticalImages);
        });
      }
    });

    // Track critical scripts
    const criticalScripts = document.querySelectorAll('script[data-priority="high"], script:not([defer]):not([async])');
    let criticalScriptsLoaded = 0;
    const totalCriticalScripts = criticalScripts.length;

    criticalScripts.forEach((script, index) => {
      if (script.readyState === 'complete' || script.readyState === 'loaded') {
        criticalScriptsLoaded++;
      } else {
        script.addEventListener('load', () => {
          criticalScriptsLoaded++;
          console.log(`✅ Critical script ${index + 1} loaded`);
          this.checkEssentialComplete(criticalScriptsLoaded, totalCriticalScripts);
        });
      }
    });

    // If no critical resources, complete immediately
    if (totalCriticalImages === 0 && totalCriticalScripts === 0) {
      console.log('ℹ️ No critical resources found - completing immediately');
      this.completeLoading();
    }
  }

  checkEssentialComplete(loaded, total) {
    if (loaded >= total && !this.essentialLoaded) {
      this.essentialLoaded = true;
      console.log('🎯 Essential resources loaded - showing content');
      this.completeLoading();
    }
  }

  startCompletionTimer() {
    // Fallback: complete after 2 seconds regardless
    setTimeout(() => {
      if (!this.loadingCompleted) {
        console.log('⏰ Completion timer reached - showing content');
        this.completeLoading();
      }
    }, 2000);
  }

  completeLoading() {
    if (this.loadingCompleted) {
      console.log('ℹ️ Loading already completed - skipping');
      return;
    }
    
    this.loadingCompleted = true;
    console.log('🎯 Setting loading completed flag');

    // Ensure minimum display time
    const elapsed = performance.now() - this.startTime;
    const remainingTime = Math.max(0, this.config.minDisplayTime - elapsed);

    setTimeout(() => {
      this.fadeOutLoader();
    }, remainingTime);
  }

  fadeOutLoader() {
    if (!this.loader) {
      this.triggerAnimations();
      return;
    }

    console.log('🎬 Fading out loader');
    
    this.loader.style.transition = `opacity ${this.config.fadeOutDuration}ms ease-out`;
    this.loader.style.opacity = '0';

    setTimeout(() => {
      this.loader.style.display = 'none';
      this.enableScroll();
      this.triggerAnimations();
    }, this.config.fadeOutDuration);
  }

  triggerAnimations() {
    // Trigger Webflow animations
    if (typeof Webflow !== 'undefined' && !this.webflowTriggered) {
      this.webflowTriggered = true;
      console.log('🎭 Triggering Webflow animations');
      
      setTimeout(() => {
        try {
          const wfIx = Webflow.require("ix3");
          if (wfIx && typeof wfIx.emit === 'function') {
            wfIx.emit("page-fully-loaded");
            console.log('✅ Webflow animations triggered');
          }
        } catch (e) {
          console.warn('⚠️ Could not trigger Webflow animations:', e.message);
        }
      }, 300);
    }

    // Trigger Rive animations with safety checks
    if (window.riveInstances && Array.isArray(window.riveInstances)) {
      window.riveInstances.forEach((riveInstance, index) => {
        try {
          if (riveInstance && typeof riveInstance.play === 'function') {
            if (!riveInstance.isPlaying || riveInstance.isPlaying() === false) {
              riveInstance.play();
              console.log(`✅ Started Rive animation ${index + 1}`);
            } else {
              console.log(`ℹ️ Rive animation ${index + 1} already playing - skipping`);
            }
          }
        } catch (e) {
          console.warn(`⚠️ Could not start Rive animation ${index + 1}:`, e);
        }
      });
    }

    // Load non-critical resources in background
    this.loadNonCriticalResources();
  }

  loadNonCriticalResources() {
    console.log('🔄 Loading non-critical resources in background');
    
    // Load lazy images
    const lazyImages = document.querySelectorAll('img[loading="lazy"]');
    lazyImages.forEach(img => {
      if (img.dataset.src) {
        img.src = img.dataset.src;
      }
    });

    // Load lazy videos
    const lazyVideos = document.querySelectorAll('video[loading="lazy"]');
    lazyVideos.forEach(video => {
      video.load();
    });

    // Load deferred scripts
    const deferredScripts = document.querySelectorAll('script[defer]');
    deferredScripts.forEach(script => {
      if (!script.src) return;
      
      const newScript = document.createElement('script');
      newScript.src = script.src;
      newScript.defer = true;
      document.head.appendChild(newScript);
    });
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new OptimizedPageLoadTracker();
  });
} else {
  new OptimizedPageLoadTracker();
}
