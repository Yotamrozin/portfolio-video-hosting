window.heroCursor = { x: 0, y: 0 };
window.heroCursorRawX = 0;
window.heroCursorRawY = 0;

document.addEventListener("DOMContentLoaded", () => {
  const hero = document.querySelector(".hero");
  if (!hero) return;

  function updateCursor(e) {
    window.heroCursorRawX = e.clientX;
    window.heroCursorRawY = e.clientY;

    const nx = e.clientX / window.innerWidth;
    const ny = e.clientY / window.innerHeight;

    window.heroCursor.x = (nx - 0.5) * 100;
    window.heroCursor.y = (ny - 0.5) * 100;
  }

  hero.addEventListener("pointermove", updateCursor);
  hero.addEventListener("pointerleave", () => {
    window.heroCursor.x = 0;
    window.heroCursor.y = 0;
    window.heroCursorRawX = 0;
    window.heroCursorRawY = 0;
  });
});
