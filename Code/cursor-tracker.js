// Initialize cursor tracking globally
window.heroCursor = { x: 0, y: 0 };
window.heroCursorRawX = 0;
window.heroCursorRawY = 0;

// Global cursor update function
function updateCursor(e) {
  window.heroCursorRawX = e.clientX;
  window.heroCursorRawY = e.clientY;

  const nx = e.clientX / window.innerWidth;
  const ny = e.clientY / window.innerHeight;

  window.heroCursor.x = (nx - 0.5) * 100;
  window.heroCursor.y = (ny - 0.5) * 100;
}

// Reset cursor function
function resetCursor() {
  window.heroCursor.x = 0;
  window.heroCursor.y = 0;
  window.heroCursorRawX = 0;
  window.heroCursorRawY = 0;
}

document.addEventListener("DOMContentLoaded", () => {
  const hero = document.querySelector(".hero");
  if (!hero) {
    console.warn("No .hero element found - cursor tracking disabled");
    return;
  }

  hero.addEventListener("pointermove", updateCursor);
  hero.addEventListener("pointerleave", resetCursor);
  
  console.log("✅ Cursor tracker initialized");
});
