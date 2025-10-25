/**
 * Simple Page Loader
 * Plays Lottie animation once, then slides out and triggers events
 * Based on the working page-load-tracker.js
 */

class SimplePageLoader {
  constructor() {
    // Configuration
    this.config = {
      minDisplayTime: 500, // Minimum time to show loader (ms)
      slideOutDuration: 600, // Slide out animation duration (ms)
      enableDebugLogging: true, // Show detailed info in console
    };

    // State
    this.startTime = performance.now();
    this.loadingCompleted = false;
    this.lottiePlayed = false;
    this.webflowTriggered = false;

    // UI Elements
    this.loaderElement = null;
    this.lottieAnimation = null;
    this.backgroundElement = null;

    // Bind methods
    this.slideOutLoader = this.slideOutLoader.bind(this);
    
    // Ultra-aggressive deferral to minimize main thread blocking
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
    // Find loader elements
    const loaderSelectors = ['[data-loader]', '.loader', '#loader'];
    this.loaderElement = loaderSelectors.reduce((element, selector) => 
      element || document.querySelector(selector), null);
    
    // Find Lottie animation
    const lottieElement = document.querySelector('[data-loader="lottie"]');
    if (lottieElement) {
      this.lottieAnimation = lottieElement;
      console.log('🎬 Lottie animation found');
    }

    // Find background element for slide out
    this.backgroundElement = document.querySelector('[data-transition="bg"]');
    if (this.backgroundElement) {
      console.log('🎨 Background element found for slide out');
    }

    if (!this.loaderElement) {
      console.warn('SimplePageLoader: Loader element not found');
      return;
    }

    // Disable scroll during loading
    this.disableScroll();

    // Start the simple sequence
    this.startSimpleSequence();
  }

  startSimpleSequence() {
    console.log('🎬 Starting simple loader sequence');
    
    // Wait a bit for everything to be ready, then play Lottie
    setTimeout(() => {
      this.playLottieAnimation();
    }, 200);
  }

  playLottieAnimation() {
    if (!this.lottieAnimation || this.lottiePlayed) return;
    
    this.lottiePlayed = true;
    console.log('🎬 Playing Lottie animation');
    
    try {
      // Try different ways to access the Lottie animation instance
      let lottieInstance = null;
      
      // Method 1: Check if it's a direct Lottie instance
      if (this.lottieAnimation.goToAndStop) {
        lottieInstance = this.lottieAnimation;
      }
      // Method 2: Check for lottie property
      else if (this.lottieAnimation.lottie) {
        lottieInstance = this.lottieAnimation.lottie;
      }
      // Method 3: Check for data-lottie attribute
      else if (this.lottieAnimation.getAttribute('data-lottie')) {
        const animationId = this.lottieAnimation.getAttribute('data-lottie');
        lottieInstance = window.lottie?.getRegisteredAnimations?.()?.find(anim => anim.name === animationId);
      }
      
      if (lottieInstance && typeof lottieInstance.play === 'function') {
        // Play the animation from start to finish
        lottieInstance.play();
        
        // Listen for animation complete event
        const onComplete = () => {
          console.log('🎬 Lottie animation completed - sliding out');
          this.slideOutLoader();
          lottieInstance.removeEventListener('complete', onComplete);
        };
        
        lottieInstance.addEventListener('complete', onComplete);
        
        // Fallback: slide out after 1.5 seconds if complete event doesn't fire
        setTimeout(() => {
          if (!this.loadingCompleted) {
            console.log('🎬 Lottie animation fallback - sliding out after 1.5s');
            this.slideOutLoader();
          }
        }, 1500);
        
      } else {
        console.warn('Lottie instance not found or play method unavailable');
        // Fallback: slide out immediately
        this.slideOutLoader();
      }
    } catch (error) {
      console.warn('Error playing Lottie animation:', error);
      // Fallback: slide out immediately
      this.slideOutLoader();
    }
  }

  slideOutLoader() {
    if (!this.loaderElement) return;

    // Prevent multiple calls
    if (this.loadingCompleted) return;
    this.loadingCompleted = true;

    console.log('🎨 Sliding out loader');

    // Ensure minimum display time
    const elapsed = performance.now() - this.startTime;
    const remainingTime = Math.max(0, this.config.minDisplayTime - elapsed);

    setTimeout(() => {
      // Slide loader to the right with smooth ease-out
      this.loaderElement.style.transition = `transform ${this.config.slideOutDuration}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`;
      this.loaderElement.style.transform = 'translateX(100%)';
      
      // Re-enable scrolling
      this.enableScroll();
      
      // Remove from DOM after slide animation
      setTimeout(() => {
        if (this.loaderElement && this.loaderElement.parentNode) {
          this.loaderElement.style.display = 'none';
        }
        
        // Trigger custom event
        document.dispatchEvent(new CustomEvent('pageLoadComplete'));
        
        // Trigger Webflow animations with better error handling
        if (typeof Webflow !== 'undefined' && !this.webflowTriggered) {
          this.webflowTriggered = true;
          try {
            setTimeout(() => {
              try {
                const wfIx = Webflow.require("ix3");
                if (wfIx && typeof wfIx.emit === 'function') {
                  wfIx.emit("page-fully-loaded");
                  console.log('✅ Webflow animations triggered successfully');
                } else {
                  console.warn('⚠️ Webflow ix3 not available or emit function missing');
                }
              } catch (innerError) {
                console.warn('⚠️ Error triggering Webflow animations:', innerError.message);
              }
            }, 500);
          } catch (e) {
            console.warn('⚠️ Could not trigger Webflow animations:', e.message);
          }
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
                  console.log(`Rive animation ${index + 1} already playing - skipping`);
                }
              }
            } catch (e) {
              console.warn(`Could not start Rive animation ${index + 1}:`, e);
            }
          });
        }
        
        console.log('🎯 Simple loader sequence complete');
      }, this.config.slideOutDuration);
    }, remainingTime);
  }

  disableScroll() {
    // Prevent scrolling without affecting layout
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    
    // Disable GSAP ScrollTrigger during loading
    if (typeof gsap !== 'undefined' && gsap.ScrollTrigger) {
      gsap.ScrollTrigger.getAll().forEach(trigger => trigger.disable());
      console.log('ScrollTrigger disabled during loading');
    }
  }

  enableScroll() {
    // Remove scroll prevention styles
    document.documentElement.style.overflow = '';
    document.body.style.overflow = '';
    
    // Re-enable GSAP ScrollTrigger
    if (typeof gsap !== 'undefined' && gsap.ScrollTrigger) {
      setTimeout(() => {
        gsap.ScrollTrigger.getAll().forEach(trigger => trigger.enable());
        gsap.ScrollTrigger.refresh();
        console.log('ScrollTrigger re-enabled and refreshed after loader');
      }, 100);
    }
  }

  // Public API for manual control
  hide() {
    this.slideOutLoader();
  }

  // Debug controls
  enableDebugMode() {
    this.config.enableDebugLogging = true;
    console.log('🔍 Debug mode enabled');
  }

  disableDebugMode() {
    this.config.enableDebugLogging = false;
    console.log('🔍 Debug mode disabled');
  }
}

// Smart initialization - detect navigation vs fresh load
const initializeSimpleLoader = () => {
  // Browser detection
  const isFirefox = navigator.userAgent.toLowerCase().includes('firefox');
  const isChrome = navigator.userAgent.toLowerCase().includes('chrome');
  
  // Check if this is a navigation (back/forward) or fresh load
  const navigationEntry = window.performance.getEntriesByType('navigation')[0];
  const isBackForward = window.performance.navigation.type === 2 || 
                       navigationEntry?.type === 'back_forward';
  
  // Check if assets are likely cached (very quick load times)
  const loadTime = navigationEntry ? navigationEntry.loadEventEnd - navigationEntry.loadEventStart : 0;
  const isLikelyCached = loadTime < 20;
  
  console.log('🔍 Simple loader initialization check:', {
    browser: isFirefox ? 'Firefox' : isChrome ? 'Chrome' : 'Other',
    isBackForward,
    loadTime,
    isLikelyCached
  });
  
  // Firefox-specific: Be more conservative with skipping loader
  if (isFirefox) {
    if (isBackForward && loadTime < 10) {
      console.log('🚀 Firefox: Back/forward with very fast load - skipping loader');
      return;
    }
  } else {
    // Chrome/Brave: Use normal logic
    if (isBackForward && isLikelyCached) {
      console.log('🚀 Chrome/Brave: Back/forward navigation with cached content - skipping loader');
      return;
    }
  }
  
  // Show loader for fresh loads, reloads, or slow navigation
  console.log('🎬 Initializing simple page loader');
  window.simplePageLoader = new SimplePageLoader();
};

// Use requestIdleCallback for non-blocking initialization
if (window.requestIdleCallback) {
  requestIdleCallback(initializeSimpleLoader, { timeout: 2000 });
} else {
  setTimeout(initializeSimpleLoader, 100);
}

// Fallback: ensure loader hides even if something goes wrong
window.addEventListener('load', () => {
  setTimeout(() => {
    if (window.simplePageLoader && document.querySelector('[data-loader]')) {
      window.simplePageLoader.hide();
    }
  }, 3000); // Give it 3 seconds after window.load
});

// Global debug controls
window.enableSimpleLoaderDebug = () => {
  if (window.simplePageLoader) {
    window.simplePageLoader.enableDebugMode();
  } else {
    console.warn('SimplePageLoader not initialized yet');
  }
};

window.disableSimpleLoaderDebug = () => {
  if (window.simplePageLoader) {
    window.simplePageLoader.disableDebugMode();
  } else {
    console.warn('SimplePageLoader not initialized yet');
  }
};
