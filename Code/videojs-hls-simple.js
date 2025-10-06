<video
  class="video-js vjs-default-skin lazy-video"
  playsinline
  muted
  loop
  preload="metadata"
  data-src="{{wf {&quot;path&quot;:&quot;video-link-url&quot;,&quot;type&quot;:&quot;PlainText&quot; } }}"
  style="width:100%; height:auto; object-fit:cover;"
></video>

<script>
(function() {
  // Prevent multiple initializations
  if (window.thumbnailPlayersInitialized) {
    console.log('Thumbnail system already initialized, skipping...');
    return;
  }
  
  // Store players globally so hover manager can control them
  window.thumbnailPlayers = new Map();
  window.thumbnailPlayersInitialized = true;

  // Wait for DOM to be ready
  function initializeThumbnailSystem() {
    // Observe videos as they enter the viewport
    const lazyVideos = document.querySelectorAll('.lazy-video');
    console.log('Found', lazyVideos.length, 'lazy video elements');
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          
          // Skip if already initialized
          if (el.player || el.hasAttribute('data-player-id')) {
            return;
          }
          
          // Load the actual video source
          const src = el.getAttribute('data-src');
          if (!src) return;

          el.innerHTML = `<source src="${src}" type="application/x-mpegURL" />`;

          // Generate player ID before initialization
          const playerId = el.id || `player-${Math.random().toString(36).substr(2, 9)}`;
          
          // Add player ID to element for hover manager to find
          el.setAttribute('data-player-id', playerId);
          console.log('Added player ID to element:', playerId);

          // Initialize Video.js player
          const player = videojs(el, {
            autoplay: false, // Don't autoplay - wait for hover
            muted: true,
            loop: true,
            controls: false,
            fluid: true,
            preload: 'metadata', // Load metadata but don't play
          });

          // Store player reference
          window.thumbnailPlayers.set(playerId, player);
          console.log('Player initialized and stored:', playerId);

          // Limit playback to low resolution for thumbnails
          player.on('loadedmetadata', function() {
            const tech = player.tech();
            if (tech && tech.vhs && tech.vhs.representations) {
              const reps = tech.vhs.representations();
              const maxWidth = 400; // 25rem ≈ 400px at default font size
              
              reps.forEach(rep => {
                // Enable only representations that match or are smaller than our thumbnail width
                rep.enabled(rep.width <= maxWidth);
              });
            }
          });

          // Pause video when it's not in viewport
          player.on('play', function() {
            const videoElement = player.el();
            const rect = videoElement.getBoundingClientRect();
            const isInViewport = rect.top < window.innerHeight && rect.bottom > 0;
            
            if (!isInViewport) {
              player.pause();
            }
          });

          // Stop observing once loaded
          observer.unobserve(el);
        }
      });
    }, { rootMargin: '200px 0px' }); // start loading slightly before visible

    lazyVideos.forEach(video => observer.observe(video));
  }

  // Expose global functions for hover manager to use
  window.playThumbnailVideo = function(playerId) {
    console.log('Attempting to play video:', playerId);
    const player = window.thumbnailPlayers.get(playerId);
    if (player && player.paused()) {
      console.log('Playing video:', playerId);
      player.play().catch(error => console.log('Video play prevented:', error));
    } else {
      console.log('Player not found or already playing:', playerId);
    }
  };

  window.pauseThumbnailVideo = function(playerId) {
    console.log('Attempting to pause video:', playerId);
    const player = window.thumbnailPlayers.get(playerId);
    if (player && !player.paused()) {
      console.log('Pausing video:', playerId);
      player.pause();
    } else {
      console.log('Player not found or already paused:', playerId);
    }
  };

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeThumbnailSystem);
  } else {
    initializeThumbnailSystem();
  }
  
  console.log('Thumbnail video control functions initialized');
})();
</script>
