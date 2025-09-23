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

function initializeCursorTracker() {
  const hero = document.querySelector(".hero");
  if (!hero) {
    console.log("Hero element not found yet, retrying in 100ms...");
    setTimeout(initializeCursorTracker, 100);
    return;
  }

  hero.addEventListener("pointermove", updateCursor);
  hero.addEventListener("pointerleave", resetCursor);
  
  console.log("✅ Cursor tracker initialized");
}

document.addEventListener("DOMContentLoaded", () => {
  // Try to initialize immediately
  initializeCursorTracker();
  
  // Also try after a short delay in case elements are still loading
  setTimeout(initializeCursorTracker, 50);
});
