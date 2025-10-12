<!-- Video.js CSS and JS -->
<link href="https://vjs.zencdn.net/8.6.1/video-js.css" rel="stylesheet">
<script src="https://vjs.zencdn.net/8.6.1/video.min.js"></script>

<script>
document.addEventListener("DOMContentLoaded", () => {
  console.log("🎬 Video.js HLS Player Script Starting...");
  
  // Find the wrapper element first
  const wrapperElement = document.querySelector("[f-data-video='wrapper']");
  console.log("📦 Wrapper Element:", wrapperElement);
  if (!wrapperElement) {
    console.error("❌ No wrapper element found with [f-data-video='wrapper']");
    return; // Exit if no wrapper found
  }
  
  // Scope all selectors to the wrapper element
  const video = wrapperElement.querySelector("[f-data-video='video-element']");
  const wrapper = wrapperElement; // The wrapperElement IS the wrapper
  const poster = wrapperElement.querySelector("[f-data-video='poster-button']");
  
  console.log("🎥 Video Element:", video);
  console.log("📐 Wrapper:", wrapper);
  console.log("🖼️ Poster:", poster);
  
  // Find the video controls container
  const videoControls = wrapperElement.querySelector("[f-data-video='video-controls']");
  console.log("🎮 Video Controls:", videoControls);
  if (!videoControls) {
    console.error("❌ No video controls found with [f-data-video='video-controls']");
    return; // Exit if no controls found
  }
  
  // Scope all control selectors to the video controls container
  const play = videoControls.querySelector("[f-data-video='play-button']");
  const pause = videoControls.querySelector("[f-data-video='pause-button']");
  const fullscreen = videoControls.querySelector("[f-data-video='fullscreen']");
  const minimize = videoControls.querySelector("[f-data-video='minimize']");
  const replay = videoControls.querySelector("[f-data-video='replay-button']");
  const forward = videoControls.querySelector("[f-data-video='forward-button']");
  const backward = videoControls.querySelector("[f-data-video='backward-button']");
  const volumeSlider = videoControls.querySelector("[f-data-video='volume-slider'] input");
  const progressBar = videoControls.querySelector("[f-data-video='progress-bar']");
  const progressIndicator = videoControls.querySelector("[f-data-video='progress']");
  const playHead = videoControls.querySelector("[f-data-video='play-head']");
  const currentTime = videoControls.querySelector("[f-data-video='current-time']");
  const duration = videoControls.querySelector("[f-data-video='duration']");
  
  console.log("🎮 Controls found:", {
    play: !!play,
    pause: !!pause,
    fullscreen: !!fullscreen,
    minimize: !!minimize,
    replay: !!replay,
    forward: !!forward,
    backward: !!backward,
    volumeSlider: !!volumeSlider,
    progressBar: !!progressBar,
    progressIndicator: !!progressIndicator,
    playHead: !!playHead,
    currentTime: !!currentTime,
    duration: !!duration
  });

  // Initialize volume slider visual fill
  if (volumeSlider) {
    const initialValue = parseFloat(volumeSlider.value);
    const percentage = initialValue * 100;
    volumeSlider.style.setProperty('--slider-fill-percentage', `${percentage}%`);
  }

  // Initialize Video.js player
  let player;
  let isVideoJSInitialized = false;
  let loadingTimeout;
  let retryCount = 0;
  const MAX_RETRIES = 3;
  const LOADING_TIMEOUT = 30000; // 30 seconds

  function initializeVideoJS() {
    if (isVideoJSInitialized || !video) return;
    
    console.log("🎬 Initializing Video.js player...");
    
    // Check if video element already has a Video.js player and dispose it
    if (video.player) {
      console.log("⚠️ Existing Video.js player found, disposing...");
      video.player.dispose();
    }
    
    // Remove any existing Video.js classes and IDs
    video.classList.remove('vjs-tech');
    if (video.id && video.id.startsWith('vjs_video_')) {
      video.removeAttribute('id');
    }
    
    // Add video-js class to video element
    video.classList.add('video-js');
    video.classList.add('vjs-default-skin');
    
    // Get the HLS source from the video element
    const sourceElement = video.querySelector('source');
    const hlsUrl = sourceElement ? sourceElement.src : null;
    
    if (!hlsUrl) {
      console.error("❌ No HLS source found in video element");
      return;
    }
    
    console.log("🔗 HLS URL found:", hlsUrl);
    
    // Initialize Video.js player with enhanced HLS configuration
    player = videojs(video, {
      controls: false, // We'll use our custom controls
      fluid: true,
      responsive: true,
      aspectRatio: '16:9', // Will be updated dynamically
      playbackRates: [0.5, 1, 1.25, 1.5, 2],
      sources: [{
        src: hlsUrl,
        type: 'application/x-mpegURL'
      }],
      html5: {
        vhs: {
          overrideNative: true,
          // Enhanced HLS configuration for better reliability
          enableLowInitialPlaylist: true,
          smoothQualityChange: true,
          allowSeeksWithinUnsafeLiveWindow: true,
          // Retry configuration
          maxPlaylistRetries: 5,
          playlistLoadTimeout: 10000,
          manifestLoadTimeout: 10000,
          // Bandwidth configuration
          bandwidth: 4194304, // 4 Mbps default
          // Live edge configuration
          liveRangeSafeTimeDelta: 30,
          liveRangeSafeTimeDeltaMultiple: 1.5
        }
      },
      // Additional player options for reliability
      preload: 'metadata',
      autoplay: false,
      muted: false
    });
    
    isVideoJSInitialized = true;
    console.log("✅ Video.js player initialized");
    
    // Set up Video.js event listeners
    setupVideoJSEvents();
    
    // Set up loading timeout
    setupLoadingTimeout();
  }

  // Set up loading timeout to prevent infinite loading
  function setupLoadingTimeout() {
    if (loadingTimeout) {
      clearTimeout(loadingTimeout);
    }
    
    loadingTimeout = setTimeout(() => {
      if (player && player.readyState() < 2) {
        console.warn("⏰ Loading timeout reached, attempting recovery...");
        handleLoadingTimeout();
      }
    }, LOADING_TIMEOUT);
  }

  // Handle loading timeout
  function handleLoadingTimeout() {
    if (retryCount < MAX_RETRIES) {
      retryCount++;
      console.log(`🔄 Retry attempt ${retryCount}/${MAX_RETRIES}`);
      
      // Clear the timeout
      if (loadingTimeout) {
        clearTimeout(loadingTimeout);
        loadingTimeout = null;
      }
      
      // Reset player state
      if (player) {
        player.reset();
        player.load();
        setupLoadingTimeout();
      }
    } else {
      console.error("❌ Max retries reached, showing error message");
      showLoadingError();
    }
  }

  // Show loading error message
  function showLoadingError() {
    console.error("❌ Video failed to load after multiple attempts");
    // You could show a user-friendly error message here
    // For now, we'll just log it
  }

  // Clear loading timeout when video starts loading successfully
  function clearLoadingTimeout() {
    if (loadingTimeout) {
      clearTimeout(loadingTimeout);
      loadingTimeout = null;
    }
  }

  function setupVideoJSEvents() {
    if (!player) return;
    
    // Video.js ready event
    player.ready(() => {
      console.log("🎯 Video.js player ready");
      clearLoadingTimeout();
      setAspectRatio();
    });
    
    // Video.js loadstart event - video starts loading
    player.on('loadstart', () => {
      console.log("🔄 Video.js loadstart event fired");
      setupLoadingTimeout();
    });
    
    // Video.js canplay event - video can start playing
    player.on('canplay', () => {
      console.log("✅ Video.js canplay event fired");
      clearLoadingTimeout();
      retryCount = 0; // Reset retry count on successful load
    });
    
    // Video.js loadedmetadata event
    player.on('loadedmetadata', () => {
      console.log("📊 Video.js loadedmetadata event fired");
      clearLoadingTimeout();
      setAspectRatio();
    });
    
    // Video.js play event
    player.on('play', () => {
      console.log("▶️ Video.js play event fired");
      clearLoadingTimeout();
      if (poster) poster.style.display = "none";
      if (play) play.style.display = "none";
      if (pause) pause.style.display = "inline-block";
    });
    
    // Video.js pause event
    player.on('pause', () => {
      console.log("⏸️ Video.js pause event fired");
      if (play) play.style.display = "inline-block";
      if (pause) pause.style.display = "none";
    });
    
    // Video.js ended event
    player.on('ended', () => {
      console.log("🏁 Video.js ended event fired");
      if (play) play.style.display = "inline-block";
      if (pause) pause.style.display = "none";
    });
    
    // Video.js timeupdate event
    player.on('timeupdate', () => {
      if (!isDragging) updateProgressUI();
    });
    
    // Video.js volumechange event
    player.on('volumechange', () => {
      if (volumeSlider) {
        volumeSlider.value = player.volume().toFixed(2);
        updateVolumeSliderFill();
      }
    });
    
    // Video.js durationchange event
    player.on('durationchange', () => {
      if (duration) duration.textContent = formatTime(player.duration());
    });
    
    // Video.js waiting event - video is buffering
    player.on('waiting', () => {
      console.log("⏳ Video.js waiting event fired - buffering");
    });
    
    // Video.js canplaythrough event - video can play through without buffering
    player.on('canplaythrough', () => {
      console.log("✅ Video.js canplaythrough event fired");
      clearLoadingTimeout();
    });
    
    // Enhanced error handling with retry mechanism
    player.on('error', (error) => {
      console.error("❌ Video.js error:", player.error());
      clearLoadingTimeout();
      
      const errorCode = player.error() ? player.error().code : 'unknown';
      console.error("❌ Error code:", errorCode);
      
      // Handle different types of errors
      if (errorCode === 4) { // MEDIA_ERR_SRC_NOT_SUPPORTED
        console.error("❌ Media source not supported");
        handleLoadingTimeout();
      } else if (errorCode === 3) { // MEDIA_ERR_DECODE
        console.error("❌ Media decode error");
        handleLoadingTimeout();
      } else if (errorCode === 2) { // MEDIA_ERR_NETWORK
        console.error("❌ Network error");
        handleLoadingTimeout();
      } else {
        // For other errors, try to reload once
        if (!player.hasStarted_ && retryCount < MAX_RETRIES) {
          console.log("🔄 Attempting to reload video...");
          setTimeout(() => {
            player.src({ src: player.currentSource().src, type: player.currentSource().type });
            player.load();
            setupLoadingTimeout();
          }, 1000);
        } else {
          handleLoadingTimeout();
        }
      }
    });
  }
  

// Optimized aspect ratio setting for Video.js
function setAspectRatio() {
  console.log("🔄 setAspectRatio called");
  
  // Add null checks to prevent errors
  if (!video || !wrapper || !wrapperElement) {
    console.error("❌ Missing elements:", {
      video: !!video,
      wrapper: !!wrapper,
      wrapperElement: !!wrapperElement
    });
    return;
  }
  
  let videoWidth, videoHeight;
  
  // Get dimensions from Video.js player if available, otherwise from video element
  if (player && typeof player.videoWidth === 'function' && typeof player.videoHeight === 'function') {
    videoWidth = player.videoWidth();
    videoHeight = player.videoHeight();
    console.log("📊 Video.js dimensions:", { videoWidth, videoHeight });
  } else if (player && player.videoWidth && player.videoHeight && typeof player.videoWidth === 'number') {
    videoWidth = player.videoWidth;
    videoHeight = player.videoHeight;
    console.log("📊 Video.js dimensions (direct):", { videoWidth, videoHeight });
  } else if (video.videoWidth && video.videoHeight) {
    videoWidth = video.videoWidth;
    videoHeight = video.videoHeight;
    console.log("📊 Video element dimensions:", { videoWidth, videoHeight });
  } else {
    console.warn("⚠️ Video dimensions not available yet, will retry...");
    // Retry after a short delay if dimensions aren't available
    setTimeout(() => {
      if (player && player.readyState() >= 1) {
        setAspectRatio();
      }
    }, 500);
    return;
  }

  // Ensure we have valid, non-zero dimensions
  if (videoWidth && videoHeight && videoWidth > 0 && videoHeight > 0) {
    const aspectRatio = `${videoWidth} / ${videoHeight}`;
    
    // Update Video.js player aspect ratio
    if (player && videoWidth && videoHeight && videoWidth > 0 && videoHeight > 0) {
      try {
        const aspectRatioColon = `${videoWidth}:${videoHeight}`;
        player.aspectRatio(aspectRatioColon);
        console.log("✅ Video.js aspect ratio set to:", aspectRatioColon);
      } catch (error) {
        console.warn("⚠️ Could not set Video.js aspect ratio:", error);
      }
    }
    
    // Apply CSS styling
    const style = document.createElement('style');
    style.textContent = `
      /* Wrapper - controls overall container size */
      .html-video-wrapper {
        aspect-ratio: ${aspectRatio} !important;
        width: 100% !important;
        max-height: 80vh !important;
        display: block !important;
        overflow: hidden !important;
        position: relative !important;
      }
      
      /* Video.js player styling - must match wrapper aspect ratio */
      .video-js { 
        width: 100% !important; 
        height: 100% !important; 
        max-height: 80vh !important;
        display: block !important;
        position: relative !important;
        aspect-ratio: ${aspectRatio} !important;
      }
      
      /* Video.js tech element (the actual video) - override Video.js default width */
      .vjs-tech {
        width: auto !important;
        height: 100% !important;
        object-fit: contain !important;
      }
      
      /* Parent containers - allow natural sizing */
      .video-player-wrapper-2,
      .container-large-2,
      .section_player-2,
      .video-player-section_layout,
      .video-player_contain {
        height: auto !important;
        max-height: 80vh !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
      }
      
      /* Hide Video.js default controls */
      .video-js .vjs-control-bar {
        display: none !important;
      }
    `;
    document.head.appendChild(style);
    
    console.log(`✅ Aspect ratio set: ${aspectRatio} (${videoWidth}x${videoHeight})`);
  }
}

// Use requestAnimationFrame for smoother updates
function setAspectRatioRAF() {
  requestAnimationFrame(setAspectRatio);
}

// Initialize Video.js when DOM is ready
initializeVideoJS();

// Optimized resize handler with debouncing
let resizeTimeout;
window.addEventListener("resize", () => {
  if (player && player.readyState() >= 1) {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(setAspectRatioRAF, 16); // ~60fps
  }
});


  let hasGoneFullscreen = false;
  let isDragging = false;

  function formatTime(time) {
    const minutes = Math.floor(time / 60).toString().padStart(2, "0");
    const seconds = Math.floor(time % 60).toString().padStart(2, "0");
    return `${minutes}:${seconds}`;
  }

  // Function to update volume slider visual fill
  function updateVolumeSliderFill() {
    if (volumeSlider) {
      const value = parseFloat(volumeSlider.value);
      const percentage = value * 100;
      // Use CSS custom property for color, only set the percentage
      volumeSlider.style.setProperty('--slider-fill-percentage', `${percentage}%`);
    }
  }

  function updateProgressUI() {
    if (!player) return;
    const percent = (player.currentTime() / player.duration()) * 100;
    if (progressIndicator) progressIndicator.style.width = `${percent}%`;
    if (playHead) playHead.style.left = `${percent}%`;
    if (currentTime) currentTime.textContent = formatTime(player.currentTime());
  }

  // Set up control event listeners after Video.js is initialized
  function setupControlEventListeners() {
    if (!player) return;

    // Click the video to play / pause 
    video.addEventListener("click", () => {
      if (player.paused()) {
        player.play();
      } else {
        player.pause();
      }
    });
    
    // Play button
    play?.addEventListener("click", () => {
      player.play();
    });

    // Pause button
    pause?.addEventListener("click", () => {
      player.pause();
    });

    // Fullscreen button
    fullscreen?.addEventListener("click", () => {
      if (player.isFullscreen()) {
        player.exitFullscreen();
        // Hide Video.js controls when exiting fullscreen
        player.controls(false);
      } else {
        player.requestFullscreen();
        // Show Video.js controls when entering fullscreen
        player.controls(true);
      }
    });

    // Minimize button
    minimize?.addEventListener("click", () => {
      if (player.isFullscreen()) {
        player.exitFullscreen();
        // Hide Video.js controls when exiting fullscreen
        player.controls(false);
      }
    });

    // Volume slider
    volumeSlider?.addEventListener("input", () => {
      const value = parseFloat(volumeSlider.value);
      player.volume(Math.min(1, Math.max(0, value)));
      updateVolumeSliderFill();
    });

    // Replay button
    replay?.addEventListener("click", () => {
      player.currentTime(0);
      player.play();
    });

    // Forward button (15 seconds)
    forward?.addEventListener("click", () => {
      player.currentTime(Math.min(player.duration(), player.currentTime() + 15));
    });

    // Backward button (15 seconds)
    backward?.addEventListener("click", () => {
      player.currentTime(Math.max(0, player.currentTime() - 15));
    });

    // Progress bar click
    progressBar?.addEventListener("click", (e) => {
      const rect = progressBar.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const ratio = clickX / rect.width;
      player.currentTime(ratio * player.duration());
      updateProgressUI();
    });

    // === DRAGGABLE PLAYHEAD ===
    function handleDrag(e) {
      const rect = progressBar.getBoundingClientRect();
      const clientX = e.type.includes("touch") ? e.touches[0].clientX : e.clientX;
      let offsetX = Math.max(0, Math.min(clientX - rect.left, rect.width));
      const ratio = offsetX / rect.width;
      const time = ratio * player.duration();
      player.currentTime(time);
      updateProgressUI();
    }

    if (playHead) {
      playHead.addEventListener("mousedown", (e) => {
        e.preventDefault();
        isDragging = true;
        document.addEventListener("mousemove", handleDrag);
        document.addEventListener("mouseup", () => {
          isDragging = false;
          document.removeEventListener("mousemove", handleDrag);
        }, { once: true });
      });

      playHead.addEventListener("touchstart", (e) => {
        isDragging = true;
        document.addEventListener("touchmove", handleDrag, { passive: false });
        document.addEventListener("touchend", () => {
          isDragging = false;
          document.removeEventListener("touchmove", handleDrag);
        }, { once: true });
      });
    }

    // Fullscreen change handler
    document.addEventListener("fullscreenchange", () => {
      if (!hasGoneFullscreen && document.fullscreenElement) {
        if (poster) poster.style.display = "none";
        hasGoneFullscreen = true;
      }
      
      // Handle Video.js controls based on fullscreen state
      if (document.fullscreenElement) {
        // Entering fullscreen - show Video.js controls
        player.controls(true);
        console.log("📺 Entered fullscreen - showing Video.js controls");
      } else {
        // Exiting fullscreen - hide Video.js controls
        player.controls(false);
        console.log("📺 Exited fullscreen - hiding Video.js controls");
      }
    });
  }

  // Set up control listeners after Video.js initialization
  setTimeout(() => {
    setupControlEventListeners();
  }, 100);

  // Cleanup function to prevent memory leaks
  function cleanup() {
    if (loadingTimeout) {
      clearTimeout(loadingTimeout);
      loadingTimeout = null;
    }
    if (player) {
      player.dispose();
      player = null;
    }
    isVideoJSInitialized = false;
    retryCount = 0;
  }

  // Cleanup on page unload
  window.addEventListener('beforeunload', cleanup);
  window.addEventListener('unload', cleanup);

  // Expose cleanup function globally for manual cleanup if needed
  window.videoPlayerCleanup = cleanup;

});

</script>

<style>
/* Default styles before JavaScript sets dynamic aspect ratio */
.html-video-wrapper {
  width: 100%;
  max-width: 100%;
  aspect-ratio: 16 / 9; /* Default fallback */
  display: block;
  overflow: hidden;
  position: relative;
}

/* Video.js player container */
.video-js {
  width: 100% !important;
  height: 100% !important;
  background-color: #000;
  position: relative !important;
  display: block !important;
}

/* Video.js tech element (the actual video) - override default width */
.html-video-wrapper .vjs-tech {
  width: auto !important;
  height: 100% !important;
  object-fit: contain !important;
}

/* Hide Video.js default controls */
.video-js .vjs-control-bar {
  display: none !important;
}

/* Video.js poster image */
.video-js .vjs-poster {
  background-size: contain !important;
  background-repeat: no-repeat !important;
  background-position: center !important;
}

/* Ensure video element fills container */
.video-js video {
  width: 100% !important;
  height: 100% !important;
  object-fit: contain !important;
}

/* Loading spinner */
.video-js .vjs-loading-spinner {
  border-color: rgba(255, 255, 255, 0.8) transparent transparent transparent;
}

/* Big play button */
.video-js .vjs-big-play-button {
  display: none !important;
}

/* Error messages */
.video-js .vjs-error-display {
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 20px;
  text-align: center;
}

</style>