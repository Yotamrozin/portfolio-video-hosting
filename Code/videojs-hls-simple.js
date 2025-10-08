<video
  class="video-js vjs-default-skin lazy-video"
  playsinline
  muted
  loop
  preload="auto"
  data-src="{{wf {&quot;path&quot;:&quot;video-link-url&quot;,&quot;type&quot;:&quot;PlainText&quot; } }}"
  style="width:100%; height:auto; object-fit:cover;"
></video>

<script>
(function() {
  // Prevent multiple initializations
  if (window.thumbnailPlayersInitialized) {
    return;
  }
  
  window.thumbnailPlayersInitialized = true;

  // Wait for DOM to be ready
  function initializeThumbnailSystem() {
    // Observe videos as they enter the viewport
    const lazyVideos = document.querySelectorAll('.lazy-video');
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          
          // Skip if already initialized
          if (el.player) {
            return;
          }
          
          // Load the actual video source
          const src = el.getAttribute('data-src');
          if (!src) return;

          el.innerHTML = `<source src="${src}" type="application/x-mpegURL" />`;

          // Initialize Video.js player
          const player = videojs(el, {
            autoplay: 'muted', // Autoplay with muted audio
            muted: true,
            loop: true,
            controls: false,
            fill: true, // Fill mode to fit container
            preload: 'auto',
          });

          // Stop observing once loaded
          observer.unobserve(el);
        }
      });
    }, { rootMargin: '200px 0px' }); // start loading slightly before visible

    lazyVideos.forEach(video => observer.observe(video));
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeThumbnailSystem);
  } else {
    initializeThumbnailSystem();
  }
  
  // Add CSS to force fill mode to respect container height
  const style = document.createElement('style');
  style.textContent = `
    /* Force fill mode to strictly respect container dimensions */
    .lazy-video.video-js.vjs-fill {
      position: absolute !important;
      top: 0 !important;
      left: 0 !important;
      width: 100% !important;
      height: 100% !important;
      border-radius: var(--radius--main) !important;
      overflow: hidden !important;
    }
    
    /* Ensure video tech fills and covers */
    .lazy-video.video-js .vjs-tech {
      position: absolute !important;
      top: 0 !important;
      left: 0 !important;
      width: 100% !important;
      height: 100% !important;
      object-fit: cover !important;
    }
  `;
  document.head.appendChild(style);
})();
</script>

