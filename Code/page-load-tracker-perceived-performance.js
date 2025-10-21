/**
 * Perceived Performance Optimized Loader
 * Shows content immediately, loads critical resources progressively
 * Based on modern web performance best practices
 */

class PerceivedPerformanceLoader {
  constructor() {
    this.config = {
      maxWaitTime: 1500, // Maximum 1.5 seconds wait
      fontLoadTimeout: 3000, // 3 seconds for fonts
      enableDebugLogging: true
    };
    
    this.loader = null;
    this.startTime = performance.now();
    this.criticalLoaded = false;
    this.loadingCompleted = false;
    this.webflowTriggered = false;
    
    this.init();
  }

  init() {
    console.log('🚀 Initializing perceived performance loader');
    
    this.loader = document.querySelector('[data-loader]');
    if (!this.loader) {
      console.warn('⚠️ Loader element not found');
      this.triggerAnimations();
      return;
    }

    this.disableScroll();
    this.loadCriticalResources();
    this.startFallbackTimer();
  }

  disableScroll() {
    document.body.style.overflow = 'hidden';
  }

  enableScroll() {
    document.body.style.overflow = '';
  }

  loadCriticalResources() {
    console.log('🎯 Loading critical above-the-fold resources');
    
    // 1. Load fonts first (most critical for layout)
    this.loadFonts();
    
    // 2. Load navigation (essential for UX)
    this.loadNavigation();
    
    // 3. Load title/subtitle content (core content)
    this.loadCoreContent();
    
    // 4. Load Rive animations (visual elements)
    this.loadRiveAnimations();
    
    // 5. Load GSAP animations (enhancement)
    this.loadGSAPAnimations();
  }

  loadFonts() {
    console.log('🔤 Loading custom fonts');
    
    // Check if fonts are already loaded
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        console.log('✅ Fonts loaded');
        this.checkCriticalComplete();
      });
    } else {
      // Fallback: assume fonts are loaded after a short delay
      setTimeout(() => {
        console.log('✅ Fonts assumed loaded (fallback)');
        this.checkCriticalComplete();
      }, 500);
    }
    
    // Font load timeout
    setTimeout(() => {
      console.log('⏰ Font load timeout - proceeding anyway');
      this.checkCriticalComplete();
    }, this.config.fontLoadTimeout);
  }

  loadNavigation() {
    console.log('🧭 Loading navigation');
    
    // Navigation is usually already in DOM, just ensure it's visible
    const nav = document.querySelector('nav, .nav, .navigation, [data-nav]');
    if (nav) {
      console.log('✅ Navigation found');
      this.checkCriticalComplete();
    } else {
      console.log('⚠️ Navigation not found - proceeding anyway');
      this.checkCriticalComplete();
    }
  }

  loadCoreContent() {
    console.log('📝 Loading core content (title/subtitle)');
    
    // Core content is usually already in DOM
    const title = document.querySelector('h1, .title, [data-title]');
    const subtitle = document.querySelector('h2, .subtitle, [data-subtitle]');
    
    if (title && subtitle) {
      console.log('✅ Core content found');
      this.checkCriticalComplete();
    } else {
      console.log('⚠️ Core content not found - proceeding anyway');
      this.checkCriticalComplete();
    }
  }

  loadRiveAnimations() {
    console.log('🎨 Loading Rive animations');
    
    // Check if Rive instances exist
    if (window.riveInstances && Array.isArray(window.riveInstances)) {
      console.log(`✅ Found ${window.riveInstances.length} Rive animations`);
      this.checkCriticalComplete();
    } else {
      // Wait a bit for Rive to initialize
      setTimeout(() => {
        if (window.riveInstances && Array.isArray(window.riveInstances)) {
          console.log(`✅ Found ${window.riveInstances.length} Rive animations (delayed)`);
        } else {
          console.log('⚠️ Rive animations not found - proceeding anyway');
        }
        this.checkCriticalComplete();
      }, 200);
    }
  }

  loadGSAPAnimations() {
    console.log('🎭 Preparing GSAP animations');
    
    // GSAP animations are triggered after everything else is ready
    // Don't wait for GSAP to load - it will be triggered later
    console.log('✅ GSAP animations prepared');
    this.checkCriticalComplete();
  }

  checkCriticalComplete() {
    // This method will be called multiple times
    // Only complete when all critical resources are ready
    if (!this.criticalLoaded) {
      this.criticalLoaded = true;
      console.log('🎯 Critical resources loaded - showing content');
      this.completeLoading();
    }
  }

  startFallbackTimer() {
    // Fallback: complete after max wait time regardless
    setTimeout(() => {
      if (!this.loadingCompleted) {
        console.log('⏰ Max wait time reached - showing content');
        this.completeLoading();
      }
    }, this.config.maxWaitTime);
  }

  completeLoading() {
    if (this.loadingCompleted) {
      console.log('ℹ️ Loading already completed - skipping');
      return;
    }
    
    this.loadingCompleted = true;
    console.log('🎯 Setting loading completed flag');

    // Ensure minimum display time (reduced for perceived performance)
    const elapsed = performance.now() - this.startTime;
    const remainingTime = Math.max(0, 300 - elapsed); // Reduced to 300ms

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
    
    this.loader.style.transition = `opacity 400ms ease-out`;
    this.loader.style.opacity = '0';

    setTimeout(() => {
      this.loader.style.display = 'none';
      this.enableScroll();
      this.triggerAnimations();
    }, 400);
  }

  triggerAnimations() {
    // 1. Trigger GSAP entry animations first
    this.triggerGSAPAnimations();
    
    // 2. Start Rive animations
    this.triggerRiveAnimations();
    
    // 3. Load non-critical resources in background
    this.loadNonCriticalResources();
  }

  triggerGSAPAnimations() {
    console.log('🎭 Triggering GSAP entry animations');
    
    if (typeof Webflow !== 'undefined' && !this.webflowTriggered) {
      this.webflowTriggered = true;
      
      setTimeout(() => {
        try {
          const wfIx = Webflow.require("ix3");
          if (wfIx && typeof wfIx.emit === 'function') {
            wfIx.emit("page-fully-loaded");
            console.log('✅ GSAP entry animations triggered');
          }
        } catch (e) {
          console.warn('⚠️ Could not trigger GSAP animations:', e.message);
        }
      }, 100); // Reduced delay for faster perceived performance
    }
  }

  triggerRiveAnimations() {
    console.log('🎨 Starting Rive animations');
    
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
  }

  loadNonCriticalResources() {
    console.log('🔄 Loading non-critical resources in background');
    
    // Load video thumbnails (2nd priority)
    this.loadVideoThumbnails();
    
    // Load other lazy resources
    this.loadLazyResources();
  }

  loadVideoThumbnails() {
    console.log('🎬 Loading video thumbnails');
    
    const videoThumbnails = document.querySelectorAll('video[data-priority="medium"], .video-thumbnail video');
    videoThumbnails.forEach((video, index) => {
      // Load with a small delay to not block critical resources
      setTimeout(() => {
        video.load();
        console.log(`✅ Video thumbnail ${index + 1} loading`);
      }, index * 100); // Stagger loading
    });
  }

  loadLazyResources() {
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
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new PerceivedPerformanceLoader();
  });
} else {
  new PerceivedPerformanceLoader();
}
