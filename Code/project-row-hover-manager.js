document.addEventListener("DOMContentLoaded", () => {
  const items = document.querySelectorAll(".project-list-item");

  items.forEach(item => {
    const title = item.querySelector('[hover="title"]');
    const flash = item.querySelector('[hover="opacity-flash"]');
    const fadeEl = item.querySelector('[hover="opacity-fade"]');
    
    // Find the video thumbnail in this row
    const videoElement = item.querySelector('.lazy-video');
    const playerId = videoElement ? videoElement.getAttribute('data-player-id') : null;
    
    // Debug logging
    if (videoElement) {
      console.log('Found video element in row:', playerId);
    } else {
      console.log('No video element found in row');
    }

    // store original font color of the item
    const originalColor = getComputedStyle(item).color;

    item.addEventListener("mouseenter", () => {
      // Change font color of the item
      gsap.to(item, { color: "#272727", duration: 0.3, ease: "power1.out" });

      // Slide right the title
      if (title) {
        gsap.to(title, { x: "0.7rem", duration: 0.4, ease: "back.out(1.7)" });
      }

      // Flash animation
      if (flash) {
        gsap.fromTo(flash, 
          { opacity: 0 }, 
          { 
            opacity: 0.65, 
            duration: 0.1, 
            ease: "none",
            onComplete: () => {
              // Start fading in the secondary element *before* flash-out ends
              if (fadeEl) {
                gsap.to(fadeEl, { opacity: 1, duration: 0.3, ease: "power1.out", delay: 0.05 });
              }

              // Fade out the flash
              gsap.to(flash, { opacity: 0, duration: 0.3, ease: "power1.out" });
            }
          }
        );
      }

      // Play video thumbnail if it exists
      if (playerId && window.playThumbnailVideo) {
        console.log('Hover enter - attempting to play video:', playerId);
        // Small delay to ensure smooth transition with other animations
        setTimeout(() => {
          window.playThumbnailVideo(playerId);
        }, 100);
      } else {
        console.log('Hover enter - no video to play:', { playerId, hasFunction: !!window.playThumbnailVideo });
      }
    });

    item.addEventListener("mouseleave", () => {
      // Reset font color
      gsap.to(item, { color: originalColor, duration: 0.3, ease: "power1.out" });

      // Slide back the title
      if (title) {
        gsap.to(title, { x: "0rem", duration: 0.25, ease: "power3.inOut" });
      }

      // Hide fade element smoothly
      if (fadeEl) {
        gsap.to(fadeEl, { opacity: 0, duration: 0.3, ease: "power1.inOut" });
      }

      // Pause video thumbnail if it exists
      if (playerId && window.pauseThumbnailVideo) {
        console.log('Hover leave - attempting to pause video:', playerId);
        window.pauseThumbnailVideo(playerId);
      } else {
        console.log('Hover leave - no video to pause:', { playerId, hasFunction: !!window.pauseThumbnailVideo });
      }
    });
  });
});
