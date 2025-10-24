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
      enableDebugLogging: true, // Show detailed loading info in console
      enableDebugPanel: false, // Show visual debug panel
      lottieEasing: 'easeInOutCubic', // Easing type for Lottie animation
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
    this.lottieAnimation = null;

    // Resource tracking
    this.trackedResources = new Set();
    this.resourceTypes = ['img', 'script', 'link', 'video', 'audio', 'iframe'];
    this.resourceDetails = new Map(); // Track detailed info about each resource
    this.loadingResources = new Set(); // Currently loading resources
    
    // Animation triggers
    this.webflowTriggered = false; // Prevent multiple Webflow triggers
    this.loadingCompleted = false; // Prevent multiple completion calls
    this.lottiePlayed = false; // Prevent multiple Lottie plays
    
    // Percentage animation
    this.currentDisplayPercentage = 0;
    this.targetPercentage = 0;
    this.isAnimating = false;
    
    // Bind methods
    this.updateProgress = this.updateProgress.bind(this);
    this.completeLoading = this.completeLoading.bind(this);
    
    // Ultra-aggressive deferral to minimize main thread blocking
    // Use multiple fallbacks to ensure initialization happens
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
    // Find loader elements (batch DOM queries)
    const loaderSelectors = ['[data-loader]', '.loader', '#loader'];
    this.loaderElement = loaderSelectors.reduce((element, selector) => 
      element || document.querySelector(selector), null);
    
    this.percentElement = document.querySelector('[data-loader-percent]');
    this.barElement = document.querySelector('[data-loader-bar]');
    
    // Find Lottie animation
    const lottieElement = document.querySelector('[data-loader="lottie"]');
    if (lottieElement) {
      this.lottieAnimation = lottieElement;
      console.log('🎬 Lottie animation found - will sync to progress');
    }

    if (!this.percentElement || !this.barElement) {
      console.warn('PageLoadTracker: Loader elements not found. Looking for [data-loader-percent] and [data-loader-bar]');
      return;
    }

    // Initial update (keep this immediate for visual feedback)
    this.updateUI(0);

    // Ultra-defer all non-critical operations to minimize blocking
    const deferredInit = () => {
      this.disableScroll();
      this.trackDOMProgress();
      this.setupPerformanceObserver();
      
      if (this.config.enableDebugPanel) {
        this.createDebugPanel();
      }
    };

    // Use multiple deferral strategies for maximum efficiency
    if (window.requestIdleCallback) {
      requestIdleCallback(deferredInit, { timeout: 1000 });
    } else if (window.requestAnimationFrame) {
      requestAnimationFrame(() => {
        requestAnimationFrame(deferredInit);
      });
    } else {
      setTimeout(deferredInit, 50);
    }
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

    // Skip lazy-loaded videos - they shouldn't be tracked for initial load
    if (element.tagName === 'VIDEO') {
      const loading = element.getAttribute('loading');
      const preload = element.getAttribute('preload');
      const isLazy = loading === 'lazy' || preload === 'none' || preload === 'metadata';
      
      if (isLazy) {
        console.log(`⏭️ Skipping lazy video: ${this.getShortUrl(src)} [${this.getElementSection(element)}]`);
        return;
      }
    }

    this.trackedResources.add(src);
    
    // Store resource details
    const resourceInfo = {
      url: src,
      type: element.tagName.toLowerCase(),
      startTime: performance.now(),
      size: this.getResourceSize(element),
      status: 'pending',
      element: element // Store element reference for section detection
    };
    this.resourceDetails.set(src, resourceInfo);

    // Check if already loaded
    if (this.isElementLoaded(element)) {
      resourceInfo.status = 'loaded';
      resourceInfo.endTime = performance.now();
      resourceInfo.duration = resourceInfo.endTime - resourceInfo.startTime;
      this.loadedResources++;
      this.logResourceLoaded(resourceInfo);
      this.updateProgress();
      return;
    }

    // Track loading
    this.loadingResources.add(src);
    resourceInfo.status = 'loading';
    this.logResourceStarted(resourceInfo);

    const onLoad = () => {
      resourceInfo.status = 'loaded';
      resourceInfo.endTime = performance.now();
      resourceInfo.duration = resourceInfo.endTime - resourceInfo.startTime;
      this.loadingResources.delete(src);
      this.loadedResources++;
      this.logResourceLoaded(resourceInfo);
      this.updateProgress();
      cleanup();
    };

    const onError = () => {
      resourceInfo.status = 'error';
      resourceInfo.endTime = performance.now();
      resourceInfo.duration = resourceInfo.endTime - resourceInfo.startTime;
      this.loadingResources.delete(src);
      console.warn('Failed to load resource:', src);
      this.loadedResources++; // Count errors as loaded to prevent hanging
      this.logResourceError(resourceInfo);
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

    // Check if we should trigger Lottie animation (90% threshold)
    if (totalProgress >= 0.9 && !this.lottiePlayed) {
      this.playLottieAnimation();
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
    
    // Update Lottie animation frame based on progress
    this.updateLottieProgress(progress);
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

  playLottieAnimation() {
    if (!this.lottieAnimation || this.lottiePlayed) return;
    
    this.lottiePlayed = true;
    console.log('🎬 Playing Lottie animation at 90% loading');
    
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
          console.log('🎬 Lottie animation completed - sliding loader');
          this.slideOutLoader();
          lottieInstance.removeEventListener('complete', onComplete);
        };
        
        lottieInstance.addEventListener('complete', onComplete);
        
        // Fallback: slide out after 1 second if complete event doesn't fire
        setTimeout(() => {
          if (!this.loadingCompleted) {
            console.log('🎬 Lottie animation fallback - sliding loader after 1s');
            this.slideOutLoader();
          }
        }, 1000);
        
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

  updateLottieProgress(progress) {
    // This method is now only used for progress sync before 90%
    // After 90%, we play the full animation instead
    if (this.lottiePlayed) return;
    
    if (!this.lottieAnimation) return;
    
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
      
      if (lottieInstance && typeof lottieInstance.goToAndStop === 'function') {
        // Get total frames and calculate target frame with easing
        const totalFrames = lottieInstance.totalFrames || lottieInstance.frameRate * lottieInstance.duration || 100;
        const easedProgress = this.easeProgress(progress);
        const targetFrame = Math.floor(easedProgress * totalFrames);
        
        // Update animation frame
        lottieInstance.goToAndStop(targetFrame, true);
      }
    } catch (error) {
      // Silently handle errors - Lottie might not be loaded yet
      console.debug('Lottie animation not ready yet:', error.message);
    }
  }

  easeProgress(progress) {
    // Apply easing curve to make animation feel more natural
    if (progress <= 0) return 0;
    if (progress >= 1) return 1;
    
    switch (this.config.lottieEasing) {
      case 'easeInOutCubic':
        // Slow start, fast middle, slow end
        if (progress < 0.5) {
          return 4 * progress * progress * progress;
        } else {
          const t = 2 * progress - 2;
          return 1 + t * t * t / 2;
        }
        
      case 'easeInOutQuart':
        // Even smoother acceleration/deceleration
        if (progress < 0.5) {
          return 8 * progress * progress * progress * progress;
        } else {
          const t = 2 * progress - 2;
          return 1 - 8 * t * t * t * t;
        }
        
      case 'easeInOutExpo':
        // Very smooth, almost linear in middle
        if (progress === 0) return 0;
        if (progress === 1) return 1;
        if (progress < 0.5) {
          return Math.pow(2, 20 * progress - 10) / 2;
        } else {
          return (2 - Math.pow(2, -20 * progress + 10)) / 2;
        }
        
      case 'easeOutBounce':
        // Playful bounce effect at the end
        const n1 = 7.5625;
        const d1 = 2.75;
        if (progress < 1 / d1) {
          return n1 * progress * progress;
        } else if (progress < 2 / d1) {
          return n1 * (progress -= 1.5 / d1) * progress + 0.75;
        } else if (progress < 2.5 / d1) {
          return n1 * (progress -= 2.25 / d1) * progress + 0.9375;
        } else {
          return n1 * (progress -= 2.625 / d1) * progress + 0.984375;
        }
        
      case 'easeOutElastic':
        // Elastic spring effect
        const c4 = (2 * Math.PI) / 3;
        return progress === 0 ? 0 : progress === 1 ? 1 : 
               Math.pow(2, -10 * progress) * Math.sin((progress * 10 - 0.75) * c4) + 1;
        
      case 'linear':
      default:
        // No easing - direct mapping
        return progress;
    }
  }

  completeLoading() {
    // Prevent multiple completion calls
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
      // Set to 100%
      this.updateUI(1);
      
      // Wait a bit at 100%, then fade out
      setTimeout(() => {
        this.fadeOutLoader();
      }, 200);
    }, remainingTime);
  }

  slideOutLoader() {
    if (!this.loaderElement) return;

    // Prevent multiple calls
    if (this.loadingCompleted) return;
    this.loadingCompleted = true;

    // Slide loader to the left with powerful ease-out
    this.loaderElement.style.transition = `transform ${this.config.fadeOutDuration}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`;
    this.loaderElement.style.transform = 'translateX(-100%)';
    
    // Re-enable scrolling
    this.enableScroll();
    
    // Remove from DOM after slide animation
    setTimeout(() => {
      if (this.loaderElement && this.loaderElement.parentNode) {
        this.loaderElement.style.display = 'none';
        // Optional: completely remove from DOM
        // this.loaderElement.remove();
      }
      
      // Trigger custom event
      document.dispatchEvent(new CustomEvent('pageLoadComplete'));
      
      // Trigger Webflow animations with better error handling and readiness check
      if (typeof Webflow !== 'undefined' && !this.webflowTriggered) {
        this.webflowTriggered = true; // Prevent multiple triggers
        try {
          // Wait longer for Webflow to be fully ready
          setTimeout(() => {
            try {
              const wfIx = Webflow.require("ix3");
              if (wfIx && typeof wfIx.emit === 'function') {
                // Try to trigger - if it fails, we'll catch it
                wfIx.emit("page-fully-loaded");
                console.log('✅ Webflow animations triggered successfully');
              } else {
                console.warn('⚠️ Webflow ix3 not available or emit function missing');
              }
            } catch (innerError) {
              console.warn('⚠️ Error triggering Webflow animations:', innerError.message);
              // Don't retry - this prevents multiple attempts
            }
          }, 500); // Increased delay to 500ms
        } catch (e) {
          console.warn('⚠️ Could not trigger Webflow animations:', e.message);
        }
      } else {
        console.warn('⚠️ Webflow not available');
      }
      
      // Trigger Rive animations with safety checks
      if (window.riveInstances && Array.isArray(window.riveInstances)) {
        window.riveInstances.forEach((riveInstance, index) => {
          try {
            // Safety check: only play if not already playing
            if (riveInstance && typeof riveInstance.play === 'function') {
              // Check if animation is already playing to prevent infinite loops
              if (!riveInstance.isPlaying || riveInstance.isPlaying() === false) {
                riveInstance.play();
                console.log(`Started Rive animation ${index + 1}`);
              } else {
                console.log(`Rive animation ${index + 1} already playing - skipping`);
              }
            }
          } catch (e) {
            console.warn(`Could not start Rive animation ${index + 1}:`, e);
          }
        });
      }
    }, this.config.fadeOutDuration);
  }

  fadeOutLoader() {
    // Legacy method - now calls slideOutLoader
    this.slideOutLoader();
  }

  disableScroll() {
    // Prevent scrolling without affecting layout (no position: fixed)
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
      // Small delay to ensure overflow is fully restored
      setTimeout(() => {
        // Re-enable all triggers and refresh
        gsap.ScrollTrigger.getAll().forEach(trigger => trigger.enable());
        gsap.ScrollTrigger.refresh();
        
        console.log('ScrollTrigger re-enabled and refreshed after loader');
      }, 100);
    }
  }

  // Resource size estimation
  getResourceSize(element) {
    if (element.tagName === 'IMG') {
      return `${element.naturalWidth || '?'}x${element.naturalHeight || '?'}`;
    }
    if (element.tagName === 'VIDEO') {
      return `${element.videoWidth || '?'}x${element.videoHeight || '?'}`;
    }
    return 'unknown';
  }

  // Debug logging methods
  logResourceStarted(resourceInfo) {
    if (!this.config.enableDebugLogging) return;
    
    const section = this.getElementSection(resourceInfo.element);
    const sectionInfo = section ? ` [${section}]` : '';
    console.log(`🔄 Loading ${resourceInfo.type.toUpperCase()}: ${this.getShortUrl(resourceInfo.url)} (${resourceInfo.size})${sectionInfo}`);
    this.updateDebugPanel();
  }

  logResourceLoaded(resourceInfo) {
    if (!this.config.enableDebugLogging) return;
    
    const duration = Math.round(resourceInfo.duration);
    console.log(`✅ Loaded ${resourceInfo.type.toUpperCase()}: ${this.getShortUrl(resourceInfo.url)} (${duration}ms)`);
    this.updateDebugPanel();
  }

  logResourceError(resourceInfo) {
    if (!this.config.enableDebugLogging) return;
    
    const duration = Math.round(resourceInfo.duration);
    console.error(`❌ Failed ${resourceInfo.type.toUpperCase()}: ${this.getShortUrl(resourceInfo.url)} (${duration}ms)`);
    this.updateDebugPanel();
  }

  getShortUrl(url) {
    try {
      const urlObj = new URL(url);
      return urlObj.pathname.split('/').pop() || urlObj.hostname;
    } catch {
      return url.split('/').pop() || url;
    }
  }

  getElementSection(element) {
    if (!element) return null;
    
    // Look for common section identifiers
    const sectionSelectors = [
      '[data-section]',
      '.section',
      '.hero',
      '.portfolio',
      '.gallery',
      '.projects',
      '.work',
      '.about',
      '.contact',
      '.footer',
      '.header',
      '.nav'
    ];
    
    let current = element;
    while (current && current !== document.body) {
      // Check for data-section attribute
      if (current.hasAttribute('data-section')) {
        return current.getAttribute('data-section');
      }
      
      // Check for common class names
      for (const selector of sectionSelectors) {
        if (current.matches && current.matches(selector)) {
          return selector.replace(/[\[\].]/g, '');
        }
      }
      
      // Check for ID
      if (current.id) {
        return `#${current.id}`;
      }
      
      current = current.parentElement;
    }
    
    return 'unknown-section';
  }

  // Debug panel methods
  createDebugPanel() {
    if (this.debugPanel) return;
    
    this.debugPanel = document.createElement('div');
    this.debugPanel.id = 'page-load-debug-panel';
    this.debugPanel.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      width: 300px;
      max-height: 400px;
      background: rgba(0, 0, 0, 0.9);
      color: white;
      font-family: monospace;
      font-size: 12px;
      padding: 10px;
      border-radius: 5px;
      z-index: 10000;
      overflow-y: auto;
      border: 1px solid #333;
    `;
    
    document.body.appendChild(this.debugPanel);
    this.updateDebugPanel();
  }

  updateDebugPanel() {
    if (!this.debugPanel) return;
    
    const loadingCount = this.loadingResources.size;
    const loadedCount = this.loadedResources;
    const totalCount = this.totalResources;
    const progress = totalCount > 0 ? Math.round((loadedCount / totalCount) * 100) : 0;
    
    let html = `
      <div style="margin-bottom: 10px; border-bottom: 1px solid #333; padding-bottom: 5px;">
        <strong>Page Load Debug</strong><br>
        Progress: ${progress}% (${loadedCount}/${totalCount})<br>
        Currently loading: ${loadingCount}
      </div>
    `;
    
    // Show currently loading resources
    if (loadingCount > 0) {
      html += '<div style="margin-bottom: 10px;"><strong>Loading:</strong><br>';
      this.loadingResources.forEach(url => {
        const info = this.resourceDetails.get(url);
        if (info) {
          const elapsed = Math.round(performance.now() - info.startTime);
          html += `🔄 ${info.type.toUpperCase()}: ${this.getShortUrl(url)} (${elapsed}ms)<br>`;
        }
      });
      html += '</div>';
    }
    
    // Show recently loaded resources (last 5)
    const loadedResources = Array.from(this.resourceDetails.values())
      .filter(info => info.status === 'loaded')
      .sort((a, b) => b.endTime - a.endTime)
      .slice(0, 5);
    
    if (loadedResources.length > 0) {
      html += '<div><strong>Recently loaded:</strong><br>';
      loadedResources.forEach(info => {
        html += `✅ ${info.type.toUpperCase()}: ${this.getShortUrl(info.url)} (${Math.round(info.duration)}ms)<br>`;
      });
      html += '</div>';
    }
    
    this.debugPanel.innerHTML = html;
  }

  // Performance analysis methods
  getPerformanceReport() {
    const resources = Array.from(this.resourceDetails.values());
    const loadedResources = resources.filter(r => r.status === 'loaded');
    const errorResources = resources.filter(r => r.status === 'error');
    
    const report = {
      totalResources: this.totalResources,
      loadedResources: this.loadedResources,
      errorResources: errorResources.length,
      loadingTime: performance.now() - this.startTime,
      resourcesByType: {},
      slowestResources: [],
      largestResources: []
    };
    
    // Group by type
    loadedResources.forEach(resource => {
      if (!report.resourcesByType[resource.type]) {
        report.resourcesByType[resource.type] = { count: 0, totalTime: 0 };
      }
      report.resourcesByType[resource.type].count++;
      report.resourcesByType[resource.type].totalTime += resource.duration;
    });
    
    // Find slowest resources
    report.slowestResources = loadedResources
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 5)
      .map(r => ({
        url: r.url,
        type: r.type,
        duration: Math.round(r.duration),
        size: r.size
      }));
    
    return report;
  }

  logPerformanceReport() {
    const report = this.getPerformanceReport();
    
    console.group('📊 Page Load Performance Report');
    console.log(`Total loading time: ${Math.round(report.loadingTime)}ms`);
    console.log(`Resources loaded: ${report.loadedResources}/${report.totalResources}`);
    console.log(`Errors: ${report.errorResources}`);
    
    console.group('Resources by type:');
    Object.entries(report.resourcesByType).forEach(([type, data]) => {
      const avgTime = Math.round(data.totalTime / data.count);
      console.log(`${type.toUpperCase()}: ${data.count} files, avg ${avgTime}ms each`);
    });
    console.groupEnd();
    
    if (report.slowestResources.length > 0) {
      console.group('Slowest resources:');
      report.slowestResources.forEach(resource => {
        console.log(`${resource.type.toUpperCase()}: ${this.getShortUrl(resource.url)} (${resource.duration}ms)`);
      });
      console.groupEnd();
    }
    
    console.groupEnd();
    
    return report;
  }

  // Public API for manual control
  setProgress(percentage) {
    this.updateUI(percentage / 100);
  }

  hide() {
    this.fadeOutLoader();
  }

  // Lottie easing control
  setLottieEasing(easingType) {
    const validEasing = ['linear', 'easeInOutCubic', 'easeInOutQuart', 'easeInOutExpo', 'easeOutBounce', 'easeOutElastic'];
    if (validEasing.includes(easingType)) {
      this.config.lottieEasing = easingType;
      console.log(`🎬 Lottie easing changed to: ${easingType}`);
    } else {
      console.warn(`Invalid easing type. Valid options: ${validEasing.join(', ')}`);
    }
  }

  // Debug controls
  enableDebugMode() {
    this.config.enableDebugLogging = true;
    this.config.enableDebugPanel = true;
    this.createDebugPanel();
    console.log('🔍 Debug mode enabled');
  }

  disableDebugMode() {
    this.config.enableDebugLogging = false;
    this.config.enableDebugPanel = false;
    if (this.debugPanel) {
      this.debugPanel.remove();
      this.debugPanel = null;
    }
    console.log('🔍 Debug mode disabled');
  }

  showPerformanceReport() {
    return this.logPerformanceReport();
  }
}

// Smart initialization - detect navigation vs fresh load
const initializePageLoadTracker = () => {
  // Browser detection
  const isFirefox = navigator.userAgent.toLowerCase().includes('firefox');
  const isChrome = navigator.userAgent.toLowerCase().includes('chrome');
  
  // Check if this is a navigation (back/forward) or fresh load
  const navigationEntry = window.performance.getEntriesByType('navigation')[0];
  const isBackForward = window.performance.navigation.type === 2 || 
                       navigationEntry?.type === 'back_forward';
  
  // Check if assets are likely cached (very quick load times)
  const loadTime = navigationEntry ? navigationEntry.loadEventEnd - navigationEntry.loadEventStart : 0;
  const isLikelyCached = loadTime < 20; // Very strict - only skip if < 20ms
  
  console.log('🔍 Initialization check:', {
    browser: isFirefox ? 'Firefox' : isChrome ? 'Chrome' : 'Other',
    isBackForward,
    loadTime,
    isLikelyCached,
    navigationType: window.performance.navigation.type,
    navigationEntryType: navigationEntry?.type,
    userAgent: navigator.userAgent.substring(0, 50) + '...'
  });
  
  // Firefox-specific: Be more conservative with skipping loader
  if (isFirefox) {
    console.log('🦊 Firefox detected - using conservative loader behavior');
    // Only skip for very obvious back/forward with very fast load
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
  console.log('🎬 Initializing page load tracker');
  window.pageLoadTracker = new PageLoadTracker();
};

// Use requestIdleCallback for non-blocking initialization
if (window.requestIdleCallback) {
  requestIdleCallback(initializePageLoadTracker, { timeout: 2000 });
} else {
  // Fallback for browsers without requestIdleCallback
  setTimeout(initializePageLoadTracker, 100);
}

// Additional optimization: Use requestAnimationFrame for smoother execution
if (window.requestAnimationFrame) {
  requestAnimationFrame(() => {
    // This runs after the next paint, reducing main thread blocking
  });
}

// Fallback: ensure loader hides even if something goes wrong
window.addEventListener('load', () => {
  setTimeout(() => {
    if (window.pageLoadTracker && document.querySelector('[data-loader]')) {
      window.pageLoadTracker.completeLoading();
      
      // Auto-generate performance report when loading completes
      if (window.pageLoadTracker.config.enableDebugLogging) {
        setTimeout(() => {
          window.pageLoadTracker.showPerformanceReport();
        }, 1000);
      }
    }
  }, 3000); // Give it 3 seconds after window.load
});

// Global debug controls
window.enablePageLoadDebug = () => {
  if (window.pageLoadTracker) {
    window.pageLoadTracker.enableDebugMode();
  } else {
    console.warn('PageLoadTracker not initialized yet');
  }
};

window.disablePageLoadDebug = () => {
  if (window.pageLoadTracker) {
    window.pageLoadTracker.disableDebugMode();
  } else {
    console.warn('PageLoadTracker not initialized yet');
  }
};

window.showPageLoadReport = () => {
  if (window.pageLoadTracker) {
    return window.pageLoadTracker.showPerformanceReport();
  } else {
    console.warn('PageLoadTracker not initialized yet');
    return null;
  }
};

