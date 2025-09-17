// Global cursor object
window.heroCursor = { x: 0, y: 0 };

// Pointer tracking (only when hovering hero section)
document.addEventListener("DOMContentLoaded", () => {
  const hero = document.querySelector(".hero");
  if (!hero) return;

  function updateCursor(e) {
    // Normalize cursor to 0..1
    const nx = e.clientX / window.innerWidth;
    const ny = e.clientY / window.innerHeight;

    // Map to -50..50 (adjust to match your Rive VM)
    window.heroCursor.x = (nx - 0.5) * 100;
    window.heroCursor.y = (ny - 0.5) * 100;
  }

  hero.addEventListener("pointermove", updateCursor);

  // Optional: reset cursor when leaving hero
  hero.addEventListener("pointerleave", () => {
    window.heroCursor.x = 0;
    window.heroCursor.y = 0;
  });
});
