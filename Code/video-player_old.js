<script>
document.addEventListener("DOMContentLoaded", () => {
  console.log("🎬 Video Player Script Starting...");
  
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
  

// Optimized aspect ratio setting
function setAspectRatio() {
  console.log("🔄 setAspectRatio called");
  console.log("📊 Video dimensions:", {
    videoWidth: video?.videoWidth,
    videoHeight: video?.videoHeight,
    readyState: video?.readyState
  });
  
  // Add null checks to prevent errors
  if (!video || !wrapper || !wrapperElement) {
    console.error("❌ Missing elements:", {
      video: !!video,
      wrapper: !!wrapper,
      wrapperElement: !!wrapperElement
    });
    return;
  }
  
  const videoWidth = video.videoWidth;
  const videoHeight = video.videoHeight;

  if (videoWidth && videoHeight) {
    const aspectRatio = `${videoWidth} / ${videoHeight}`;
    
    // ChatGPT's recommended approach: Focus on video element sizing
    // Method 1: Apply proper sizing to video element
    video.style.setProperty('width', '100%', 'important');
    video.style.setProperty('height', 'auto', 'important');
    video.style.setProperty('max-height', '80vh', 'important');
    video.style.setProperty('object-fit', 'contain', 'important');
    
    // Method 2: Apply aspect ratio to wrapper to control container size
    wrapperElement.style.setProperty('aspect-ratio', aspectRatio, 'important');
    wrapperElement.style.setProperty('width', '100%', 'important');
    wrapperElement.style.setProperty('height', 'auto', 'important');
    wrapperElement.style.setProperty('max-height', '80vh', 'important');
    
    // Method 3: Create clean CSS rules following ChatGPT's advice
    const style = document.createElement('style');
    style.textContent = `
      /* Video element - respects intrinsic aspect ratio */
      .video-player-style { 
        width: 100% !important; 
        height: auto !important; 
        max-height: 80vh !important;
        object-fit: contain !important;
        display: block !important;
      }
      
      /* Wrapper - controls overall container size */
      .html-video-wrapper {
        aspect-ratio: ${aspectRatio} !important;
        width: 100% !important;
        height: auto !important;
        max-height: 80vh !important;
        display: block !important;
        overflow: hidden !important;
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
    `;
    document.head.appendChild(style);
    
    console.log(`✅ Aspect ratio set: ${aspectRatio} (${videoWidth}x${videoHeight})`);
    console.log("📐 Applied to video element:", video.style.aspectRatio);
    console.log("📐 Applied to wrapperElement:", wrapperElement.style.aspectRatio);
  } else {
    console.warn("⚠️ Video dimensions not available yet");
  }
}

// Use requestAnimationFrame for smoother updates
function setAspectRatioRAF() {
  requestAnimationFrame(setAspectRatio);
}

// Multiple event listeners for faster aspect ratio detection
video.addEventListener("loadstart", () => {
  console.log("🎬 Video loadstart event fired");
  setAspectRatioRAF();
});
video.addEventListener("loadedmetadata", () => {
  console.log("📊 Video loadedmetadata event fired");
  setAspectRatioRAF();
});
video.addEventListener("loadeddata", () => {
  console.log("📁 Video loadeddata event fired");
  setAspectRatioRAF();
});
video.addEventListener("canplay", () => {
  console.log("▶️ Video canplay event fired");
  setAspectRatioRAF();
});
video.addEventListener("canplaythrough", () => {
  console.log("🎯 Video canplaythrough event fired");
  setAspectRatioRAF();
});

// Immediate check if video is already loaded
console.log("🔍 Initial video readyState:", video?.readyState);
if (video && video.readyState >= 1) {
  console.log("⚡ Video already loaded, setting aspect ratio immediately");
  setAspectRatioRAF();
}

// Additional check with a small delay to catch cases where dimensions load after metadata
setTimeout(() => {
  console.log("⏰ 50ms delayed check - readyState:", video?.readyState);
  if (video && video.readyState >= 1) {
    console.log("⚡ 50ms delayed check - setting aspect ratio");
    setAspectRatioRAF();
  }
}, 50);

// Check periodically until we get dimensions (with timeout)
let dimensionCheckInterval;
let dimensionCheckTimeout;

function startDimensionCheck() {
  console.log("🔄 Starting periodic dimension check");
  dimensionCheckInterval = setInterval(() => {
    if (video && video.videoWidth && video.videoHeight) {
      console.log("✅ Periodic check found dimensions, setting aspect ratio");
      setAspectRatioRAF();
      clearInterval(dimensionCheckInterval);
      clearTimeout(dimensionCheckTimeout);
    }
  }, 10);
  
  // Stop checking after 2 seconds
  dimensionCheckTimeout = setTimeout(() => {
    console.log("⏰ Stopping periodic dimension check after 2 seconds");
    clearInterval(dimensionCheckInterval);
  }, 2000);
}

// Start checking immediately
startDimensionCheck();

// Optimized resize handler with debouncing
let resizeTimeout;
window.addEventListener("resize", () => {
  if (video && video.readyState >= 1) {
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

  video?.addEventListener("play", () => {
    if (poster) poster.style.display = "none";
  });

  document.addEventListener("fullscreenchange", () => {
    if (!hasGoneFullscreen && document.fullscreenElement) {
      if (poster) poster.style.display = "none";
      hasGoneFullscreen = true;
    }
  });
  
  // click the video to play / pause 
    video.addEventListener("click", () => {
      if (video.paused) {
        video.play();
        play.style.display = "none";
        pause.style.display = "inline-block";
      } else {
        video.pause();
        play.style.display = "inline-block";
        pause.style.display = "none";
      }
    });
    
    // play button
  play?.addEventListener("click", () => {
    video.play();
    play.style.display = "none";
    pause.style.display = "inline-block";
  });

  pause?.addEventListener("click", () => {
    video.pause();
    pause.style.display = "none";
    play.style.display = "inline-block";
  });

  fullscreen?.addEventListener("click", () => {
    video.requestFullscreen?.();
  });

  minimize?.addEventListener("click", () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
      minimize.style.display = "none";
      fullscreen.style.display = "inline-block";
    }
  });

  // Function to update volume slider visual fill
  function updateVolumeSliderFill() {
    if (volumeSlider) {
      const value = parseFloat(volumeSlider.value);
      const percentage = value * 100;
      // Use CSS custom property for color, only set the percentage
      volumeSlider.style.setProperty('--slider-fill-percentage', `${percentage}%`);
    }
  }

  volumeSlider?.addEventListener("input", () => {
    const value = parseFloat(volumeSlider.value);
    video.volume = Math.min(1, Math.max(0, value));
    updateVolumeSliderFill(); // Update visual fill
  });

  replay?.addEventListener("click", () => {
    video.currentTime = 0;
    video.play();
    play.style.display = "none";
    pause.style.display = "inline-block";
  });

  forward?.addEventListener("click", () => {
    video.currentTime = Math.min(video.duration, video.currentTime + 15);
  });

  backward?.addEventListener("click", () => {
    video.currentTime = Math.max(0, video.currentTime - 15);
  });

  function updateProgressUI() {
    const percent = (video.currentTime / video.duration) * 100;
    if (progressIndicator) progressIndicator.style.width = `${percent}%`;
    if (playHead) playHead.style.left = `${percent}%`;
    if (currentTime) currentTime.textContent = formatTime(video.currentTime);
  }

  video.addEventListener("timeupdate", () => {
    if (!isDragging) updateProgressUI();
  });

  progressBar?.addEventListener("click", (e) => {
    const rect = progressBar.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = clickX / rect.width;
    video.currentTime = ratio * video.duration;
    updateProgressUI();
  });

  // === DRAGGABLE PLAYHEAD ===
  function handleDrag(e) {
    const rect = progressBar.getBoundingClientRect();
    const clientX = e.type.includes("touch") ? e.touches[0].clientX : e.clientX;
    let offsetX = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const ratio = offsetX / rect.width;
    const time = ratio * video.duration;
    video.currentTime = time;
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

  video.addEventListener("loadedmetadata", () => {
    if (duration) duration.textContent = formatTime(video.duration);
  });

  video.addEventListener("ended", () => {
    play.style.display = "inline-block";
    pause.style.display = "none";
  });
  // Ensure volume is synced both ways
video.addEventListener("volumechange", () => {
  if (volumeSlider) {
    volumeSlider.value = video.volume.toFixed(2);
    updateVolumeSliderFill(); // Update visual fill when volume changes
  }
});

volumeSlider?.addEventListener("input", () => {
  const newVolume = parseFloat(volumeSlider.value);
  video.volume = newVolume;
  updateVolumeSliderFill(); // Update visual fill
});


});

</script>

<style>
.html-video-wrapper {
  width: 100%;
  max-width: 100%;
  aspect-ratio: 9 / 16; /* Default fallback */
  display: block;
  overflow: hidden;
}

.html-video-wrapper video {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

</style>