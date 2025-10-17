<!-- Video.js CSS and JS -->
<link href="https://vjs.zencdn.net/8.6.1/video-js.css" rel="stylesheet">
<script src="https://vjs.zencdn.net/8.6.1/video.min.js"></script>

<script>
document.addEventListener("DOMContentLoaded", () => {
  
  // Find the wrapper element first
  const wrapperElement = document.querySelector("[f-data-video='wrapper']");
  if (!wrapperElement) {
    return; // Exit if no wrapper found
  }
  
  // Scope all selectors to the wrapper element
  const video = wrapperElement.querySelector("[f-data-video='video-element']");
  const wrapper = wrapperElement; // The wrapperElement IS the wrapper
  const poster = wrapperElement.querySelector("[f-data-video='poster-button']");
  
  // Find the video controls container
  const videoControls = wrapperElement.querySelector("[f-data-video='video-controls']");
  if (!videoControls) {
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
  const MAX_RETRIES = 5; // Increased retries
  const LOADING_TIMEOUT = 20000; // Reduced to 20 seconds for faster recovery
  let isManualRetry = false;
  let lastErrorTime = 0;
  let consecutiveFailures = 0;

  // Test HLS stream availability before loading
  async function testHLSStream(hlsUrl) {
    try {
      
      // Try to fetch the manifest
      const response = await fetch(hlsUrl, {
        method: 'HEAD',
        mode: 'cors',
        cache: 'no-cache'
      });
      
      if (response.ok) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      return false;
    }
  }

  // Enhanced initialization with stream testing
  async function initializeVideoJS() {
    if (isVideoJSInitialized || !video) return;
    
    // Check if video element already has a Video.js player and dispose it
    if (video.player) {
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
      showStreamError("No video source found");
      return;
    }
    
    // Test stream availability first
    const isStreamAvailable = await testHLSStream(hlsUrl);
    if (!isStreamAvailable && !isManualRetry) {
    }
    
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
        handleLoadingTimeout();
      }
    }, LOADING_TIMEOUT);
  }

  // Handle loading timeout
  function handleLoadingTimeout() {
    if (retryCount < MAX_RETRIES) {
      retryCount++;
      
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
      showLoadingError();
    }
  }

  // Show loading error message with retry option
  function showLoadingError() {
    consecutiveFailures++;
    
    // Show user-friendly error message with retry button
    showStreamError("Video failed to load. Please try again.", true);
  }

  // Show stream error with optional retry button
  function showStreamError(message, showRetry = false) {
    
    // Create error overlay if it doesn't exist
    let errorOverlay = wrapperElement.querySelector('.video-error-overlay');
    if (!errorOverlay) {
      errorOverlay = document.createElement('div');
      errorOverlay.className = 'video-error-overlay';
      errorOverlay.innerHTML = `
        <div class="error-content">
          <div class="error-icon">⚠️</div>
          <div class="error-message">${message}</div>
          ${showRetry ? '<button class="retry-button">Retry Loading</button>' : ''}
        </div>
      `;
      wrapperElement.appendChild(errorOverlay);
      
      // Add retry button functionality
      if (showRetry) {
        const retryButton = errorOverlay.querySelector('.retry-button');
        retryButton.addEventListener('click', () => {
          isManualRetry = true;
          retryCount = 0;
          consecutiveFailures = 0;
          errorOverlay.remove();
          initializeVideoJS();
        });
      }
    }
  }

  // Hide error overlay
  function hideStreamError() {
    const errorOverlay = wrapperElement.querySelector('.video-error-overlay');
    if (errorOverlay) {
      errorOverlay.remove();
    }
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
      clearLoadingTimeout();
      hideStreamError();
      setAspectRatio();
      
      // Set up control event listeners after player is ready
      setupControlEventListeners();
    });
    
    // Video.js loadstart event - video starts loading
    player.on('loadstart', () => {
      hideStreamError();
      setupLoadingTimeout();
    });
    
    // Video.js canplay event - video can start playing
    player.on('canplay', () => {
      clearLoadingTimeout();
      hideStreamError();
      retryCount = 0; // Reset retry count on successful load
      consecutiveFailures = 0;
      isManualRetry = false;
    });
    
    // Video.js loadedmetadata event
    player.on('loadedmetadata', () => {
      clearLoadingTimeout();
      setAspectRatio();
    });
    
    // Video.js play event
    player.on('play', () => {
      clearLoadingTimeout();
      if (poster) poster.style.display = "none";
      if (play) play.style.display = "none";
      if (pause) pause.style.display = "inline-block";
    });
    
    // Video.js pause event
    player.on('pause', () => {
      if (play) play.style.display = "inline-block";
      if (pause) pause.style.display = "none";
    });
    
    // Video.js ended event
    player.on('ended', () => {
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
    });
    
    // Video.js canplaythrough event - video can play through without buffering
    player.on('canplaythrough', () => {
      clearLoadingTimeout();
    });
    
    // Enhanced error handling with retry mechanism
    player.on('error', (error) => {
      const currentTime = Date.now();
      const timeSinceLastError = currentTime - lastErrorTime;
      lastErrorTime = currentTime;
      
      const errorCode = player.error() ? player.error().code : 'unknown';
      
      // Handle different types of errors
      if (errorCode === 4) { // MEDIA_ERR_SRC_NOT_SUPPORTED
        showStreamError("This video format is not supported by your browser.");
      } else if (errorCode === 3) { // MEDIA_ERR_DECODE
        handleLoadingTimeout();
      } else if (errorCode === 2) { // MEDIA_ERR_NETWORK
        handleLoadingTimeout();
      } else {
        // For other errors, try to reload
        if (retryCount < MAX_RETRIES) {
          
          // Progressive delay: 1s, 2s, 4s, 8s, 16s
          const delay = Math.min(1000 * Math.pow(2, retryCount), 16000);
          
          setTimeout(() => {
            if (player && player.currentSource()) {
              player.src({ src: player.currentSource().src, type: player.currentSource().type });
              player.load();
              setupLoadingTimeout();
            } else {
              handleLoadingTimeout();
            }
          }, delay);
        } else {
          handleLoadingTimeout();
        }
      }
    });
  }
  

// Optimized aspect ratio setting for Video.js
function setAspectRatio() {
  
  // Add null checks to prevent errors
  if (!video || !wrapper || !wrapperElement) {
    return;
  }
  
  let videoWidth, videoHeight;
  
  // Get dimensions from Video.js player if available, otherwise from video element
  if (player && typeof player.videoWidth === 'function' && typeof player.videoHeight === 'function') {
    videoWidth = player.videoWidth();
    videoHeight = player.videoHeight();
  } else if (player && player.videoWidth && player.videoHeight && typeof player.videoWidth === 'number') {
    videoWidth = player.videoWidth;
    videoHeight = player.videoHeight;
  } else if (video.videoWidth && video.videoHeight) {
    videoWidth = video.videoWidth;
    videoHeight = video.videoHeight;
  } else {
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
      } catch (error) {
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
  }
}

// Use requestAnimationFrame for smoother updates
function setAspectRatioRAF() {
  requestAnimationFrame(setAspectRatio);
}

// Initialize Video.js when DOM is ready
initializeVideoJS().catch(error => {
  showStreamError("Failed to initialize video player. Please refresh the page.");
});

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
    if (!player) {
      console.warn("⚠️ Player not ready for control setup");
      return;
    }
    
    console.log("🎮 Setting up control event listeners...");
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
      console.log("▶️ Play button clicked");
      player.play();
    });

    // Pause button
    pause?.addEventListener("click", () => {
      console.log("⏸️ Pause button clicked");
      player.pause();
    });

    // Fullscreen button
    fullscreen?.addEventListener("click", () => {
      console.log("📺 Fullscreen button clicked");
      if (player.isFullscreen()) {
        console.log("📺 Exiting fullscreen");
        player.exitFullscreen();
        // Hide Video.js controls when exiting fullscreen
        player.controls(false);
      } else {
        console.log("📺 Entering fullscreen");
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
      } else {
        // Exiting fullscreen - hide Video.js controls
        player.controls(false);
        console.log("📺 Exited fullscreen - hiding Video.js controls");
      }
    });
  }

  // Control listeners are now set up in the player.ready() event

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

/* Custom error overlay */
.video-error-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  color: white;
  font-family: Arial, sans-serif;
}

.error-content {
  text-align: center;
  padding: 20px;
  max-width: 300px;
}

.error-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.error-message {
  font-size: 16px;
  margin-bottom: 20px;
  line-height: 1.4;
}

.retry-button {
  background: #007bff;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.retry-button:hover {
  background: #0056b3;
}

.retry-button:active {
  background: #004085;
}

</style>