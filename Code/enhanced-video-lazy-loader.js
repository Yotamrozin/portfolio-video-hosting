/**
 * Enhanced Video Lazy Loading System
 * 
 * This script handles lazy loading for videos that are loaded both initially
 * and dynamically through the tabs system. It listens for tabsConstructorReady
 * events and uses MutationObserver to catch dynamically added videos.
 */

class VideoLazyLoader {
  constructor() {
    this.observer = null;
    this.processedVideos = new Set();
    this.isInitialized = false;
    this.init();
  }

  init() {
    // Create IntersectionObserver for lazy loading
    if ("IntersectionObserver" in window) {
      this.observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.loadVideo(entry.target);
          }
        });
      }, {
        rootMargin: '50px 0px',
        threshold: 0.1
      });
    }

    // Initial load of existing videos
    this.loadExistingVideos();

    // Listen for tabs system ready event
    document.addEventListener('tabsConstructorReady', () => {
      console.log('Tabs system ready, checking for new videos...');
      this.loadExistingVideos();
    });

    // Set up MutationObserver to catch dynamically added videos
    this.setupMutationObserver();

    this.isInitialized = true;
  }

  loadExistingVideos() {
    const lazyVideos = document.querySelectorAll("video.lazy");
    
    lazyVideos.forEach(video => {
      if (!this.processedVideos.has(video)) {
        this.processedVideos.add(video);
        
        if (this.observer) {
          this.observer.observe(video);
        } else {
          // Fallback for browsers without IntersectionObserver
          this.loadVideo(video);
        }
      }
    });
  }

  setupMutationObserver() {
    if (typeof MutationObserver === 'undefined') {
      return;
    }

    const mutationObserver = new MutationObserver((mutations) => {
      let hasNewVideos = false;

      mutations.forEach(mutation => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              // Check if the added node is a video or contains videos
              if (node.tagName === 'VIDEO' && node.classList.contains('lazy')) {
                hasNewVideos = true;
              } else if (node.querySelector) {
                const videos = node.querySelectorAll('video.lazy');
                if (videos.length > 0) {
                  hasNewVideos = true;
                }
              }
            }
          });
        }
      });

      if (hasNewVideos) {
        // Small delay to ensure DOM is fully updated
        setTimeout(() => {
          this.loadExistingVideos();
        }, 100);
      }
    });

    // Observe the entire document for added nodes
    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  loadVideo(video) {
    if (!video || this.processedVideos.has(video)) {
      return;
    }

    this.processedVideos.add(video);

    // Load all source elements
    for (let i = 0; i < video.children.length; i++) {
      const videoSource = video.children[i];
      if (videoSource.tagName === "SOURCE" && videoSource.dataset.src) {
        videoSource.src = videoSource.dataset.src;
      }
    }

    // Load the video
    video.load();
    video.classList.remove("lazy");

    // Stop observing this video
    if (this.observer) {
      this.observer.unobserve(video);
    }

    console.log('Video loaded:', video);
  }

  // Method to manually trigger video loading (useful for debugging)
  loadAllVideos() {
    const lazyVideos = document.querySelectorAll("video.lazy");
    lazyVideos.forEach(video => this.loadVideo(video));
  }

  // Method to reinitialize (useful if tabs system refreshes)
  reinitialize() {
    this.processedVideos.clear();
    this.loadExistingVideos();
  }
}

// Initialize the video lazy loader
document.addEventListener("DOMContentLoaded", function() {
  window.videoLazyLoader = new VideoLazyLoader();
  
  // Make it globally available for debugging
  window.loadAllVideos = () => window.videoLazyLoader.loadAllVideos();
  window.reinitializeVideoLoader = () => window.videoLazyLoader.reinitialize();
});

// Also initialize if DOM is already ready
if (document.readyState !== 'loading') {
  window.videoLazyLoader = new VideoLazyLoader();
  window.loadAllVideos = () => window.videoLazyLoader.loadAllVideos();
  window.reinitializeVideoLoader = () => window.videoLazyLoader.reinitialize();
}
