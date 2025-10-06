<!-- Video.js CSS and JS -->
<link href="https://vjs.zencdn.net/8.6.1/video-js.css" rel="stylesheet">
<script src="https://vjs.zencdn.net/8.6.1/video.min.js"></script>

<script>
document.addEventListener("DOMContentLoaded", () => {
  console.log("🎬 Video.js HLS Player Script Starting (Simple Version)...");
  
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

  function initializeVideoJS() {
    if (isVideoJSInitialized || !video) return;
    
    console.log("🎬 Initializing Video.js player...");
    
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
    
    // Initialize Video.js player - let it handle aspect ratio automatically
    player = videojs(video, {
      controls: false, // We'll use our custom controls
      fluid: true,
      responsive: true,
      // Let Video.js handle aspect ratio automatically
      playbackRates: [0.5, 1, 1.25, 1.5, 2],
      sources: [{
        src: hlsUrl,
        type: 'application/x-mpegURL'
      }],
      html5: {
        vhs: {
          overrideNative: true
        }
      }
    });
    
    isVideoJSInitialized = true;
    console.log("✅ Video.js player initialized");
    
    // Set up Video.js event listeners
    setupVideoJSEvents();
  }

  function setupVideoJSEvents() {
    if (!player) return;
    
    // Video.js ready event
    player.ready(() => {
      console.log("🎯 Video.js player ready");
    });
    
    // Video.js loadedmetadata event
    player.on('loadedmetadata', () => {
      console.log("📊 Video.js loadedmetadata event fired");
      console.log("📊 Video dimensions:", {
        videoWidth: player.videoWidth(),
        videoHeight: player.videoHeight()
      });
      
      // Debug wrapper dimensions
      console.log("📐 Wrapper dimensions:", {
        width: wrapperElement.offsetWidth,
        height: wrapperElement.offsetHeight,
        computedWidth: window.getComputedStyle(wrapperElement).width,
        computedHeight: window.getComputedStyle(wrapperElement).height
      });
      
      // Debug Video.js player dimensions
      const playerEl = player.el();
      console.log("📐 Video.js player dimensions:", {
        width: playerEl.offsetWidth,
        height: playerEl.offsetHeight,
        computedWidth: window.getComputedStyle(playerEl).width,
        computedHeight: window.getComputedStyle(playerEl).height
      });
    });
    
    // Video.js play event
    player.on('play', () => {
      console.log("▶️ Video.js play event fired");
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
  }

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
      } else {
        player.requestFullscreen();
      }
    });

    // Minimize button
    minimize?.addEventListener("click", () => {
      if (player.isFullscreen()) {
        player.exitFullscreen();
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
    });
  }

  // Initialize Video.js when DOM is ready
  initializeVideoJS();

  // Set up control listeners after Video.js initialization
  setTimeout(() => {
    setupControlEventListeners();
  }, 100);

});

</script>

<style>
/* Simple Video.js HLS Player Styles - Let Video.js handle aspect ratio */
.html-video-wrapper {
  width: 100%;
  max-width: 100%;
  min-width: 300px; /* Ensure minimum width */
  display: block;
  overflow: hidden;
  position: relative;
}

.html-video-wrapper video,
.html-video-wrapper .vjs-tech {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

/* Video.js player container */
.video-js {
  width: 100% !important;
  height: 100% !important;
  min-width: 300px !important; /* Ensure minimum width */
  background-color: #000;
  position: relative !important;
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
