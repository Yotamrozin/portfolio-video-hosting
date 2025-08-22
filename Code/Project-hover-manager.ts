
document.addEventListener("DOMContentLoaded", () => {
  // === Thumbnail hover (flash + scale) ===
  const flashes = document.querySelectorAll(".thumbnail-white-flash-code");

  flashes.forEach(flash => {
    const parent = flash.closest(".project-card-thumbnail");

    flash.addEventListener("mouseenter", () => {
      // White flash animation
      gsap.fromTo(flash, 
        { opacity: 0 }, 
        { opacity: 0.65, duration: 0.1, ease: "none",
          onComplete: () => {
            gsap.to(flash, { opacity: 0, duration: 0.3, ease: "power1.out" });
          }
        }
      );

      // Scale up parent
      gsap.to(parent, { scale: 1.035, duration: 0.4, ease: "back.out(1.7)" });
    });

    flash.addEventListener("mouseleave", () => {
      // Scale back down
      gsap.to(parent, { scale: 1, duration: 0.4, ease: "power3.inOut" });
    });
  });


  // === Title hover (color flash + slide) ===
  const titles = document.querySelectorAll('[hover="title"]');

  titles.forEach(title => {
    // Store original color dynamically
    const originalColor = getComputedStyle(title).color;

    title.addEventListener("mouseenter", () => {
      // Flash to white then back
      gsap.fromTo(title, 
        { color: "#ffffff" }, 
        { color: originalColor, duration: 0.3, ease: "power1.out", delay: 0.1 }
      );

      // Slide right
      gsap.to(title, { x: "0.7rem", duration: 0.4, ease: "back.out(1.7)" });
    });

    title.addEventListener("mouseleave", () => {
      // Slide back
      gsap.to(title, { x: "0rem", duration: 0.25, ease: "power3.inOut" });
    });
  });
});
