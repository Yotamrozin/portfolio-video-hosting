<video
  class="video-js vjs-default-skin lazy-video"
  playsinline
  autoplay
  muted
  loop
  preload="metadata"
  data-src="{{wf {&quot;path&quot;:&quot;video-link-url&quot;,&quot;type&quot;:&quot;PlainText&quot; } }}"
  style="width:100%; height:auto; object-fit:cover;"
></video>

<script>
(function() {
  // Store players globally so hover manager can control them
  window.thumbnailPlayers = new Map();

  // Observe videos as they enter the viewport
  const lazyVideos = document.querySelectorAll('.lazy-video');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        // Load the actual video source
        const src = el.getAttribute('data-src');
        if (!src) return;

        el.innerHTML = `<source src="${src}" type="application/x-mpegURL" />`;

        // Initialize Video.js player
        const player = videojs(el, {
          autoplay: false, // Don't autoplay - wait for hover
          muted: true,
          loop: true,
          controls: false,
          fluid: true,
          preload: 'metadata', // Load metadata but don't play
        });

        // Store player reference with element ID or data attribute
        const playerId = el.id || el.getAttribute('data-player-id') || `player-${Math.random().toString(36).substr(2, 9)}`;
        window.thumbnailPlayers.set(playerId, player);

        // Add player ID to element for hover manager to find
        el.setAttribute('data-player-id', playerId);

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

  // Expose global functions for hover manager to use
  window.playThumbnailVideo = function(playerId) {
    const player = window.thumbnailPlayers.get(playerId);
    if (player && player.paused()) {
      player.play().catch(error => console.log('Video play prevented:', error));
    }
  };

  window.pauseThumbnailVideo = function(playerId) {
    const player = window.thumbnailPlayers.get(playerId);
    if (player && !player.paused()) {
      player.pause();
    }
  };
})();
</script>
