/**
 * 🚀 Integrated Priority Loader for Webflow + GSAP + Rive
 * Combines best practices from both implementations
 * Optimized for perceived performance and reliability
 */

class IntegratedPriorityLoader {
  constructor() {
    this.config = {
      minDisplayTime: 300,        // Minimum loader visible time (ms)
      fadeOutDuration: 400,       // Loader fade-out duration (ms)
      essentialLoadTimeout: 2500, // Safety timeout for essentials
      enableDebug: true
    };

    this.loader = document.querySelector('[data-loader]');
    this.startTime = performance.now();
    this.loadingCompleted = false;
    this.webflowTriggered = false;
    this.fontsLoaded = false;
    this.essentialsLoaded = false;

    this.init();
  }

  log(...args) {
    if (this.config.enableDebug) console.log('[Loader]', ...args);
  }

  init() {
    if (!this.loader) {
      this.log('⚠️ No loader element found — skipping loader logic.');
      this.triggerAnimations();
      return;
    }

    this.disableScroll();

    // Wait for all essential resources in parallel
    Promise.allSettled([
      this.waitForFonts(),
      this.waitForEssentialElements(),
      this.waitForRiveAnimations()
    ]).then(() => {
      this.log('✅ All essentials resolved — completing loader');
      this.completeLoading();
    });

    // Safety fallback if something never resolves
    setTimeout(() => {
      if (!this.essentialsLoaded) {
        this.log('⏰ Timeout reached — forcing completion');
        this.completeLoading();
      }
    }, this.config.essentialLoadTimeout);
  }

  disableScroll() {
    document.documentElement.style.overflow = 'hidden';
  }

  enableScroll() {
    document.documentElement.style.overflow = '';
  }

  /**
   * Wait for custom fonts using the Font Loading API
   * Critical for preventing layout shift
   */
  async waitForFonts() {
    if (!('fonts' in document)) {
      this.log('⚠️ Font Loading API not supported — skipping font tracking.');
      return;
    }
    
    try {
      await document.fonts.ready;
      this.fontsLoaded = true;
      this.log('✅ All custom fonts ready');
    } catch (e) {
      this.log('⚠️ Font loading failed:', e);
    }
  }

  /**
   * Wait for essential DOM elements above the fold:
   * - Navigation
   * - Title/subtitle
   * - High priority images/videos
   */
  async waitForEssentialElements() {
    const essentials = [
      '[data-priority="high"]',
      'nav',
      '.hero-title',
      '.hero-subtitle',
      '.title',
      '.subtitle'
    ];

    const elements = document.querySelectorAll(essentials.join(','));
    const promises = [];

    elements.forEach((el) => {
      if (el.tagName === 'IMG') {
        promises.push(this.waitForImage(el));
      } else if (el.tagName === 'VIDEO') {
        promises.push(this.waitForVideo(el));
      } else {
        // Non-media element: wait for it to be in DOM
        promises.push(Promise.resolve(el));
      }
    });

    await Promise.allSettled(promises);
    this.essentialsLoaded = true;
    this.log('✅ Essential elements loaded');
  }

  /**
   * Wait for Rive animations to be initialized
   * Critical for your 3 Rive animations
   */
  async waitForRiveAnimations() {
    return new Promise((resolve) => {
      const checkRive = () => {
        if (window.riveInstances && window.riveInstances.length > 0) {
          this.log('✅ Rive instances detected');
          resolve();
        } else {
          setTimeout(checkRive, 100);
        }
      };
      checkRive();
    });
  }

  waitForImage(img) {
    return new Promise((resolve) => {
      if (img.complete) return resolve();
      img.addEventListener('load', resolve, { once: true });
      img.addEventListener('error', resolve, { once: true });
    });
  }

  waitForVideo(video) {
    return new Promise((resolve) => {
      if (video.readyState >= 3) return resolve();
      video.addEventListener('loadeddata', resolve, { once: true });
      video.addEventListener('error', resolve, { once: true });
    });
  }

  completeLoading() {
    if (this.loadingCompleted) return;
    this.loadingCompleted = true;

    const elapsed = performance.now() - this.startTime;
    const remaining = Math.max(0, this.config.minDisplayTime - elapsed);

    setTimeout(() => this.fadeOutLoader(), remaining);
  }

  fadeOutLoader() {
    this.log('🎬 Fading out loader');

    this.loader.style.transition = `opacity ${this.config.fadeOutDuration}ms ease-out`;
    this.loader.style.opacity = '0';

    setTimeout(() => {
      this.loader.style.display = 'none';
      this.enableScroll();
      this.triggerAnimations();
      this.loadNonCriticalResources();
    }, this.config.fadeOutDuration);
  }

  /**
   * Triggers GSAP and Webflow animations after essentials are visible
   * Optimized for your specific use case
   */
  triggerAnimations() {
    // 1. Trigger GSAP entry animations first (your title/subtitle animations)
    this.triggerGSAPAnimations();
    
    // 2. Trigger Webflow IX3 animations
    this.triggerWebflowAnimations();
    
    // 3. Start Rive animations
    this.triggerRiveAnimations();
  }

  triggerGSAPAnimations() {
    this.log('🎭 Triggering GSAP entry animations');
    
    // Use both methods for maximum compatibility
    if (window.gsap) {
      try {
        window.gsap.delayedCall(0.2, () => {
          window.dispatchEvent(new Event('page-fully-loaded'));
        });
        this.log('✅ GSAP entry animation triggered');
      } catch (e) {
        this.log('⚠️ GSAP trigger failed:', e);
      }
    }
  }

  triggerWebflowAnimations() {
    this.log('🎭 Triggering Webflow animations');
    
    try {
      const wfIx = Webflow && Webflow.require && Webflow.require('ix3');
      if (wfIx && typeof wfIx.emit === 'function') {
        wfIx.emit('page-fully-loaded');
        this.log('✅ Webflow animations triggered');
      } else {
        this.log('⚠️ Webflow IX3 not ready — retrying');
        setTimeout(() => this.triggerWebflowAnimations(), 500);
      }
    } catch (e) {
      this.log('⚠️ Webflow trigger error:', e);
    }
  }

  triggerRiveAnimations() {
    this.log('🎨 Starting Rive animations');
    
    if (window.riveInstances && Array.isArray(window.riveInstances)) {
      window.riveInstances.forEach((rive, i) => {
        try {
          if (typeof rive.play === 'function') {
            // Safety check: only play if not already playing
            if (!rive.isPlaying || rive.isPlaying() === false) {
              rive.play();
              this.log(`✅ Rive animation ${i + 1} started`);
            } else {
              this.log(`ℹ️ Rive animation ${i + 1} already playing - skipping`);
            }
          }
        } catch (e) {
          this.log(`⚠️ Could not start Rive ${i + 1}:`, e);
        }
      });
    }
  }

  /**
   * Load non-critical resources in background
   * Includes your video thumbnails (2nd priority)
   */
  loadNonCriticalResources() {
    this.log('💤 Loading non-critical resources in background');

    const loadLazyMedia = () => {
      // Load video thumbnails (2nd priority)
      const videoThumbnails = document.querySelectorAll('[data-priority="medium"], video[loading="lazy"]');
      videoThumbnails.forEach((vid, index) => {
        try { 
          vid.load(); 
          this.log(`✅ Video thumbnail ${index + 1} loading`);
        } catch (_) {}
      });

      // Load lazy images
      const lazyImages = document.querySelectorAll('img[loading="lazy"], img[data-priority="medium"]');
      lazyImages.forEach((img) => {
        if (img.dataset.src && !img.src) img.src = img.dataset.src;
      });
    };

    // Use requestIdleCallback for better performance
    if ('requestIdleCallback' in window) {
      requestIdleCallback(loadLazyMedia);
    } else {
      setTimeout(loadLazyMedia, 500);
    }
  }
}

/* Initialize loader once DOM is ready */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new IntegratedPriorityLoader());
} else {
  new IntegratedPriorityLoader();
}
