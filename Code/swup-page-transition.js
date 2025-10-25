/**
 * Simplified Page Transition System
 * Based on the original working script but with swup for content swapping
 * Uses .transition-trigger click for Lottie animation and GSAP for background effects
 * 
 * Usage:
 * 1. Include swup.js library
 * 2. Add elements:
 *    - .transition-trigger - clickable element that triggers Lottie animation
 *    - [data-transition="bg"] - background slide element
 * 3. Add #swup id to page wrapper
 * 4. Include this script
 */

class SimplifiedPageTransition {
  constructor() {
    // Configuration (matching original script)
    this.config = {
      introDurationMS: 0,           // Duration for intro animation
      exitDurationMS: 1200,         // Duration for exit animation (1.2s)
      backgroundSlideDelay: 600,     // 0.6s delay before background slides
      backgroundSlideDuration: 600,  // 0.6s background slide duration
      transitionSlideDuration: 400, // 0.4s transition slide duration
      excludedClass: 'no-transition',
      enableDebugLogging: true
    };

    // Elements
    this.transitionTrigger = null;
    this.backgroundElement = null;
    this.swup = null;
    
    this.init();
  }

  init() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setup());
    } else {
      this.setup();
    }
  }

  setup() {
    // Find elements
    this.transitionTrigger = document.querySelector('.transition-trigger');
    this.backgroundElement = document.querySelector('[data-transition="bg"]');
    
    this.log('Element detection results:');
    this.log('- Transition trigger:', !!this.transitionTrigger);
    this.log('- Background element:', !!this.backgroundElement);
    
    if (!this.transitionTrigger || !this.backgroundElement) {
      console.warn('SimplifiedPageTransition: Required elements not found. Looking for .transition-trigger and [data-transition="bg"]');
      return;
    }

    // Initialize swup (minimal config)
    this.swup = new Swup({
      containers: ['#swup'],
      animationSelector: false,
      cache: true
    });

    // Setup link click interception (like original script)
    this.setupLinkInterception();
    
    // Handle initial page load (like original script)
    this.handleInitialLoad();
    
    this.log('Simplified page transition system initialized');
  }

  setupLinkInterception() {
    // Intercept all link clicks (like original script)
    document.addEventListener('click', (event) => {
      const link = event.target.closest('a[href]');
      if (link) {
        this.handleLinkClick(event, link);
      }
    }, true);
  }

  handleLinkClick(event, link) {
    const href = link.getAttribute('href');
    const hostname = new URL(href, window.location.href).hostname;
    const isInternal = hostname === window.location.hostname;
    const isNotHash = href.indexOf('#') === -1;
    const isNotExcluded = !link.classList.contains(this.config.excludedClass);
    const isNotBlank = link.getAttribute('target') !== '_blank';
    const hasTrigger = !!this.transitionTrigger;
    
    this.log('Link clicked:', {
      href: href,
      isInternal: isInternal,
      isNotHash: isNotHash,
      isNotExcluded: isNotExcluded,
      isNotBlank: isNotBlank,
      hasTrigger: hasTrigger,
      shouldTransition: isInternal && isNotHash && isNotExcluded && isNotBlank && hasTrigger
    });
    
    if (isInternal && isNotHash && isNotExcluded && isNotBlank && hasTrigger) {
      event.preventDefault();
      this.log('Starting page transition to:', href);
      this.startPageTransition(href);
    }
  }

  setupSwupHooks() {
    // Hook into swup's page view to run page load sequence after content is replaced
    this.swup.hooks.on('page:view', () => {
      this.log('Swup page view - content replaced and visible');
      if (this.isTransitioning) {
        // Small delay to ensure DOM is fully updated
        setTimeout(() => {
          this.runPageLoadSequence();
          this.isTransitioning = false;
          this.enableScroll();
        }, 100);
      }
    });
    
    // Hook into content replacement to trigger Webflow and Rive
    this.swup.hooks.on('content:replace', () => {
      this.log('Swup content replacement complete');
      // Trigger Webflow and Rive after content is replaced
      setTimeout(() => {
        this.triggerWebflowAndRive();
      }, 200);
    });
  }

  setupLinkInterception() {
    // Intercept all link clicks manually (like the original script)
    document.addEventListener('click', (event) => {
      const link = event.target.closest('a[href]');
      if (link) {
        this.handleLinkClick(event, link);
      }
    }, true); // Use capture phase
  }

  handleLinkClick(event, link) {
    // Check if this link should trigger a transition
    const href = link.getAttribute('href');
    const hostname = new URL(href, window.location.href).hostname;
    const isInternal = hostname === window.location.hostname;
    const isNotHash = href.indexOf('#') === -1;
    const isNotExcluded = !link.classList.contains(this.config.excludedClass);
    const isNotBlank = link.getAttribute('target') !== '_blank';
    const hasTrigger = !!this.transitionTrigger;
    
    this.log('Link clicked:', {
      href: href,
      text: link.textContent.trim().substring(0, 30),
      isInternal: isInternal,
      isNotHash: isNotHash,
      isNotExcluded: isNotExcluded,
      isNotBlank: isNotBlank,
      hasTrigger: hasTrigger,
      shouldTransition: isInternal && isNotHash && isNotExcluded && isNotBlank && hasTrigger
    });
    
    if (isInternal && isNotHash && isNotExcluded && isNotBlank && hasTrigger) {
      event.preventDefault();
      this.log('Starting page transition to:', href);
      this.startPageTransition(href);
    }
  }

  startPageTransition(url) {
    this.log('Starting page transition to:', url);
    
    // Disable scroll during transition
    this.disableScroll();
    
    // Step 1: Background slide in from left
    this.slideBackgroundIn().then(() => {
      this.log('Background slide in complete, loading new page');
      
      // Step 2: Load new page content with swup
      this.swup.navigate(url);
      
      // Step 3: After a delay, run page load sequence (like original script)
      setTimeout(() => {
        this.log('Running page load sequence after content swap');
        this.runPageLoadSequence();
      }, 200); // Small delay to ensure content is loaded
    });
  }

  handleInitialLoad() {
    this.log('Handling initial page load');
    
    // Wait for Lottie to be ready before triggering
    this.waitForLottieReady().then(() => {
      if (this.transitionTrigger) {
        this.log('Lottie is ready, triggering initial animation');
        
        if (typeof Webflow !== 'undefined' && Webflow.push) {
          Webflow.push(() => {
            this.transitionTrigger.click();
            this.log('Initial Lottie triggered via Webflow.push');
          });
        } else {
          this.transitionTrigger.click();
          this.log('Initial Lottie triggered directly');
        }
        
        // Add scroll prevention class (like original script)
        document.body.classList.add('no-scroll-transition');
        setTimeout(() => {
          document.body.classList.remove('no-scroll-transition');
        }, this.config.introDurationMS);
      }
    }).catch(() => {
      this.log('Lottie not ready, skipping initial animation');
    });
  }

  waitForLottieReady() {
    return new Promise((resolve, reject) => {
      const maxAttempts = 50; // 5 seconds max wait
      let attempts = 0;
      
      const checkLottie = () => {
        attempts++;
        
        // Check if Lottie is loaded and ready
        if (typeof lottie !== 'undefined' && lottie.loadAnimation) {
          this.log('Lottie library found');
          resolve();
          return;
        }
        
        // Check if transition trigger exists and is ready
        if (this.transitionTrigger && this.transitionTrigger.offsetParent !== null) {
          this.log('Transition trigger is ready');
          resolve();
          return;
        }
        
        if (attempts >= maxAttempts) {
          this.log('Lottie ready timeout reached');
          reject();
          return;
        }
        
        setTimeout(checkLottie, 100);
      };
      
      checkLottie();
    });
  }

  slideBackgroundIn() {
    return new Promise((resolve) => {
      if (!this.backgroundElement) {
        resolve();
        return;
      }

      this.log('Sliding background in from left');

      // Position background off-screen left and make visible
      gsap.set(this.backgroundElement, {
        x: '-100%',
        display: 'block'
      });

      // Slide background to center
      gsap.to(this.backgroundElement, {
        x: '0%',
        duration: this.config.transitionSlideDuration / 1000,
        ease: 'power2.out',
        onComplete: () => {
          this.log('Background slide in complete');
          resolve();
        }
      });
    });
  }

  handleInitialLoad() {
    this.log('Handling initial page load');
    this.isInitialLoad = true;
    
    // Wait for Webflow to be ready before running page load sequence
    if (typeof Webflow !== 'undefined' && Webflow.push) {
      Webflow.push(() => {
        this.runPageLoadSequence();
      });
    } else {
      // Fallback: add a delay
      setTimeout(() => {
        this.runPageLoadSequence();
      }, 500);
    }
  }

  handlePageTransition() {
    this.log('Starting page transition');
    this.isTransitioning = true;
    this.isInitialLoad = false;
    this.webflowTriggered = false;
    this.lottiePlayed = false;
    
    // Disable scroll during transition
    this.disableScroll();
    
    this.log('Page transition setup complete');
  }

  handleTransitionSlideIn() {
    this.log('Running transition slide in sequence');
    
    return new Promise((resolve) => {
      if (!this.backgroundElement) {
        this.log('No background element found for transition slide in');
        resolve();
        return;
      }

      this.log('Background element found, starting slide in animation');
      
      // Position background off-screen left and make visible
      gsap.set(this.backgroundElement, {
        x: '-100%',
        display: 'block'
      });

      this.log('Background positioned off-screen left, starting slide animation');

      // Slide background to center
      gsap.to(this.backgroundElement, {
        x: '0%',
        duration: this.config.transitionSlideDuration / 1000,
        ease: 'power2.out',
        onStart: () => {
          this.log('Transition slide animation started');
        },
        onComplete: () => {
          this.log('Transition slide in complete');
          resolve();
        }
      });
    });
  }

  handleContentReplaced() {
    this.log('Content replaced, starting page load sequence');
    // Content has been replaced, now we'll run the page load sequence
    // This will be handled by the animation:in:await hook
  }

  handlePageLoadSequence() {
    this.log('Running page load sequence');
    
    return new Promise((resolve) => {
      this.runPageLoadSequence().then(() => {
        this.log('Page load sequence complete');
        resolve();
      });
    });
  }

  handleTransitionComplete() {
    this.log('Transition complete');
    this.isTransitioning = false;
    
    // Re-enable scroll
    this.enableScroll();
    
    // Trigger Webflow and Rive animations
    this.triggerWebflowAndRive();
  }

  refindElements() {
    // Re-find elements after content swap (they get replaced by swup)
    this.transitionTrigger = document.querySelector('.transition-trigger');
    this.backgroundElement = document.querySelector('[data-transition="bg"]');
    
    this.log('Re-finding elements after content swap:');
    this.log('- Transition trigger:', !!this.transitionTrigger);
    this.log('- Background element:', !!this.backgroundElement);
  }

  runPageLoadSequence() {
    this.log('Running page load sequence');
    
    // Re-find elements after content swap (they get replaced)
    this.refindElements();
    
    if (!this.transitionTrigger || !this.backgroundElement) {
      this.log('Missing elements for page load sequence');
      this.enableScroll();
      return;
    }

    // Position background at center (visible)
    gsap.set(this.backgroundElement, {
      x: '0%',
      display: 'block'
    });

    // Wait for Lottie to be ready before triggering
    this.waitForLottieReady().then(() => {
      this.log('Lottie is ready, triggering animation');
      
      // Trigger Lottie animation (like original script)
      if (typeof Webflow !== 'undefined' && Webflow.push) {
        Webflow.push(() => {
          this.transitionTrigger.click();
          this.log('Lottie triggered via Webflow.push');
        });
      } else {
        this.transitionTrigger.click();
        this.log('Lottie triggered directly');
      }
    }).catch(() => {
      this.log('Lottie not ready, skipping animation');
    });

    // Add scroll prevention class (like original script)
    document.body.classList.add('no-scroll-transition');

    // Start background slide out after delay
    setTimeout(() => {
      this.slideBackgroundOut();
    }, this.config.backgroundSlideDelay);

    // Complete sequence after total duration (like original script)
    setTimeout(() => {
      this.hideBackground();
      document.body.classList.remove('no-scroll-transition');
      this.enableScroll();
      this.log('Page load sequence complete');
    }, this.config.exitDurationMS);
  }

  playLottieAnimation() {
    if (!this.lottieElement || this.lottiePlayed) return;
    
    this.lottiePlayed = true;
    this.log('Playing Lottie animation');

    // Try to access Webflow's Lottie player registry directly
    try {
      // Method 1: Check Webflow's global Lottie registry
      if (window.Webflow && window.Webflow.require) {
        try {
          const wfIx = window.Webflow.require("ix3");
          if (wfIx && wfIx.getRegisteredAnimations) {
            const animations = wfIx.getRegisteredAnimations();
            this.log('Found Webflow animations:', animations.length);
            
            // Look for our specific Lottie animation
            const wfId = this.lottieElement.getAttribute('data-w-id');
            const ourAnimation = animations.find(anim => 
              anim.element === this.lottieElement || 
              anim.element?.getAttribute('data-w-id') === wfId
            );
            
            if (ourAnimation) {
              this.log('Found our Lottie animation in Webflow registry');
              if (ourAnimation.play) {
                ourAnimation.play();
                this.log('Triggered Lottie via Webflow registry');
                return;
              }
            }
          }
        } catch (error) {
          this.log('Error accessing Webflow registry:', error);
        }
      }
      
      // Method 2: Check for bodymovin/lottie-web instances
      if (window.bodymovin) {
        this.log('Found bodymovin library');
        // Try to find our animation in bodymovin registry
        const animations = window.bodymovin.getRegisteredAnimations();
        if (animations && animations.length > 0) {
          this.log('Found bodymovin animations:', animations.length);
          const ourAnim = animations.find(anim => anim.wrapper === this.lottieElement);
          if (ourAnim) {
            ourAnim.play();
            this.log('Triggered Lottie via bodymovin registry');
            return;
          }
        }
      }
      
      // Method 3: Check for lottie-web instances
      if (window.lottie) {
        this.log('Found lottie-web library');
        const animations = window.lottie.getRegisteredAnimations();
        if (animations && animations.length > 0) {
          this.log('Found lottie-web animations:', animations.length);
          const ourAnim = animations.find(anim => anim.wrapper === this.lottieElement);
          if (ourAnim) {
            ourAnim.play();
            this.log('Triggered Lottie via lottie-web registry');
            return;
          }
        }
      }
      
      // Method 4: Direct element property check
      const elementProps = Object.getOwnPropertyNames(this.lottieElement);
      this.log('Lottie element properties:', elementProps);
      
      // Check for common Lottie instance properties
      const lottieProps = ['lottie', 'bodymovin', 'animationItem', '_lottie', 'player'];
      for (const prop of lottieProps) {
        if (this.lottieElement[prop] && typeof this.lottieElement[prop].play === 'function') {
          this.lottieElement[prop].play();
          this.log(`Triggered Lottie via element.${prop}.play()`);
          return;
        }
      }
      
      // Method 5: Try to trigger via Webflow's animation system
      const wfId = this.lottieElement.getAttribute('data-w-id');
      if (wfId && typeof Webflow !== 'undefined') {
        this.log('Attempting to trigger Lottie via Webflow wfId:', wfId);
        
        setTimeout(() => {
          try {
            const wfIx = Webflow.require("ix3");
            if (wfIx && wfIx.emit) {
              wfIx.emit("animation-start", { element: this.lottieElement, wfId: wfId });
              wfIx.emit("lottie-play", this.lottieElement);
              wfIx.emit("play", this.lottieElement);
              this.log('Triggered multiple Webflow animation events');
            }
          } catch (error) {
            this.log('Error triggering Webflow animations:', error);
          }
        }, 100);
      }
      
      // Method 6: Fallback - try data attributes and CSS
      if (this.lottieElement.hasAttribute('data-autoplay')) {
        this.lottieElement.setAttribute('data-autoplay', '1');
        this.log('Set data-autoplay to 1');
      }
      
      this.lottieElement.style.animationPlayState = 'running';
      this.lottieElement.classList.add('lottie-playing');
      this.log('Added CSS animation triggers');
      
      // Method 7: Dispatch events
      this.lottieElement.dispatchEvent(new CustomEvent('lottie-play'));
      this.lottieElement.dispatchEvent(new CustomEvent('play'));
      this.log('Dispatched custom events');
      
    } catch (error) {
      this.log('Error in Lottie animation trigger:', error);
    }
  }

  slideBackgroundOut() {
    if (!this.backgroundElement) return;
    
    this.log('Sliding background out');

    gsap.to(this.backgroundElement, {
      x: '100%',
      duration: this.config.backgroundSlideDuration / 1000,
      ease: this.config.backgroundEasing,
      onComplete: () => {
        this.log('Background slide out complete');
      }
    });
  }

  hideBackground() {
    if (!this.backgroundElement) return;
    
    this.log('Hiding background');
    gsap.set(this.backgroundElement, {
      display: 'none'
    });
  }

  triggerWebflowAndRive() {
    this.log('=== TRIGGERING WEBFLOW AND RIVE ANIMATIONS ===');
    
    // Prevent multiple triggers
    if (this.webflowTriggered) {
      this.log('Webflow and Rive already triggered - skipping');
      return;
    }
    this.webflowTriggered = true;

    // Trigger custom event
    document.dispatchEvent(new CustomEvent('pageLoadComplete'));
    this.log('Custom event "pageLoadComplete" dispatched');
    
    // Trigger Webflow animations with better error handling and readiness check
    this.log('Checking for Webflow availability...');
    if (typeof Webflow !== 'undefined') {
      this.log('Webflow found, attempting to trigger animations');
      try {
        // Wait longer for Webflow to be fully ready
        setTimeout(() => {
          try {
            const wfIx = Webflow.require("ix3");
            if (wfIx && typeof wfIx.emit === 'function') {
              // Try to trigger - if it fails, we'll catch it
              wfIx.emit("page-fully-loaded");
              this.log('✅ Webflow animations triggered successfully');
            } else {
              this.log('⚠️ Webflow ix3 not available or emit function missing');
            }
          } catch (innerError) {
            this.log('⚠️ Error triggering Webflow animations:', innerError.message);
            // Don't retry - this prevents multiple attempts
          }
        }, 500); // Increased delay to 500ms
      } catch (e) {
        this.log('⚠️ Could not trigger Webflow animations:', e.message);
      }
    } else {
      this.log('⚠️ Webflow not available');
    }
    
    // Trigger Rive animations with safety checks
    this.log('Checking for Rive instances...');
    if (window.riveInstances && Array.isArray(window.riveInstances)) {
      this.log(`Found ${window.riveInstances.length} Rive instances`);
      window.riveInstances.forEach((riveInstance, index) => {
        try {
          // Safety check: only play if not already playing
          if (riveInstance && typeof riveInstance.play === 'function') {
            // Check if animation is already playing to prevent infinite loops
            if (!riveInstance.isPlaying || riveInstance.isPlaying() === false) {
              riveInstance.play();
              this.log(`✅ Started Rive animation ${index + 1}`);
            } else {
              this.log(`⏭️ Rive animation ${index + 1} already playing - skipping`);
            }
          } else {
            this.log(`⚠️ Rive instance ${index + 1} invalid or no play method`);
          }
        } catch (e) {
          this.log(`❌ Could not start Rive animation ${index + 1}:`, e);
        }
      });
    } else {
      this.log('⚠️ No Rive instances found (window.riveInstances not available)');
    }
    
    this.log('=== WEBFLOW AND RIVE TRIGGER COMPLETE ===');
  }

  disableScroll() {
    // Prevent scrolling without affecting layout
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    
    // Disable GSAP ScrollTrigger during transition
    if (typeof gsap !== 'undefined' && gsap.ScrollTrigger) {
      gsap.ScrollTrigger.getAll().forEach(trigger => trigger.disable());
      this.log('ScrollTrigger disabled during transition');
    }
  }

  enableScroll() {
    // Remove scroll prevention styles
    document.documentElement.style.overflow = '';
    document.body.style.overflow = '';
    
    // Re-enable GSAP ScrollTrigger
    if (typeof gsap !== 'undefined' && gsap.ScrollTrigger) {
      // Small delay to ensure overflow is fully restored
      setTimeout(() => {
        // Re-enable all triggers and refresh
        gsap.ScrollTrigger.getAll().forEach(trigger => trigger.enable());
        gsap.ScrollTrigger.refresh();
        
        this.log('ScrollTrigger re-enabled and refreshed after transition');
      }, 100);
    }
  }

  log(message, ...args) {
    if (this.config.enableDebugLogging) {
      console.log(`[SwupPageTransition] ${message}`, ...args);
    }
  }

  // Public API for manual control
  setConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    this.log('Configuration updated:', newConfig);
  }

  enableDebugMode() {
    this.config.enableDebugLogging = true;
    this.log('Debug mode enabled');
  }

  disableDebugMode() {
    this.config.enableDebugLogging = false;
    this.log('Debug mode disabled');
  }
}

// Initialize when DOM is ready
const initializeSimplifiedTransition = () => {
  // Check if swup is available
  if (typeof Swup === 'undefined') {
    console.error('SimplifiedPageTransition: Swup library not found. Please include swup.js before this script.');
    return;
  }

  // Check if GSAP is available
  if (typeof gsap === 'undefined') {
    console.error('SimplifiedPageTransition: GSAP library not found. Please include GSAP before this script.');
    return;
  }

  // Initialize the transition system
  window.simplifiedPageTransition = new SimplifiedPageTransition();
};

// Use requestIdleCallback for non-blocking initialization
if (window.requestIdleCallback) {
  requestIdleCallback(initializeSimplifiedTransition, { timeout: 2000 });
} else if (window.requestAnimationFrame) {
  requestAnimationFrame(() => {
    requestAnimationFrame(initializeSimplifiedTransition);
  });
} else {
  setTimeout(initializeSimplifiedTransition, 100);
}

// Global debug controls
window.enableSimplifiedDebug = () => {
  if (window.simplifiedPageTransition) {
    window.simplifiedPageTransition.enableDebugMode();
  } else {
    console.warn('SimplifiedPageTransition not initialized yet');
  }
};

window.disableSimplifiedDebug = () => {
  if (window.simplifiedPageTransition) {
    window.simplifiedPageTransition.disableDebugMode();
  } else {
    console.warn('SimplifiedPageTransition not initialized yet');
  }
};
