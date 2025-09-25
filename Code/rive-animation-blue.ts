<!-- pin to a runtime that supports data-binding -->

<style>
#riveCanvasBlue {
  width: 100%;
  height: 100%;
  display: block;
}
</style>
<script src="https://unpkg.com/@rive-app/canvas@2.30.3"></script>
<canvas id="riveCanvasBlue" width="500" height="500" data-rive-ignore></canvas>

<script>
document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("riveCanvasBlue");

  // --- Make canvas responsive ---
  function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
  }
  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  const r = new rive.Rive({
        src: "https://cdn.prod.website-files.com/686fe533f545b4826346b826/68cab95f7d24b10a0c772787_eye-blue.riv",
    canvas: canvas,
    autoplay: true,
    stateMachines: "eye-stateMachine",
    autoBind: true,
    onLoad: () => {
      console.log("✅ Rive loaded - BLUE ANIMATION");

      const vmi = r.viewModelInstance;
      if (!vmi) {
        console.warn("No bound view model instance found");
        return;
      }

      const inputs = r.stateMachineInputs("eye-stateMachine") || [];
      const lookTrigger = inputs.find(i => i.name === "Change Look Direction");
      const hoveringInput = inputs.find(i => i.name === "Hovering");

      if (!hoveringInput) console.warn("⚠️ Boolean input 'Hovering' not found");

      // Track Hovering state
      let lastHovering = null;
      let animationFrameId = null;

      // Function to check if cursor tracking is ready
      function checkCursorAvailability() {
        return typeof window.heroCursor !== 'undefined' && 
               typeof window.heroCursor.x === 'number' && 
               typeof window.heroCursor.y === 'number';
      }

      function updateHovering() {
        if (!hoveringInput) return;

        // Check if cursor tracking is available
        if (!checkCursorAvailability()) {
          return; // Exit early if cursor not ready
        }

        const rect = canvas.getBoundingClientRect();
        const nx = (window.heroCursor.x / 100 + 0.5) * window.innerWidth;
        const ny = (window.heroCursor.y / 100 + 0.5) * window.innerHeight;

        const hovering = nx >= rect.left && nx <= rect.right &&
                         ny >= rect.top && ny <= rect.bottom;

        if (hovering !== lastHovering) {
          hoveringInput.value = hovering;
          lastHovering = hovering;
          console.log(`BLUE: Hovering changed to ${hovering}`);
        }

        // If hovering, update posx/poxy
        if (hovering && vmi) {
          vmi.number("posx").value = window.heroCursor.x;
          vmi.number("poxy").value = window.heroCursor.y;
        }
      }

      // Update every frame with error handling
      function tick() {
        try {
          updateHovering();
        } catch (error) {
          console.warn("BLUE ANIMATION ERROR:", error);
        }
        animationFrameId = requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);

      // Randomized trigger firing when not hovering
      function scheduleLookTrigger() {
        if (!lookTrigger) return;
        const delay = 1300 + Math.random() * 500; // 1.3s–1.8s
        setTimeout(() => {
          try {
            if (!hoveringInput || !hoveringInput.value) {
              lookTrigger.fire();
            }
          } catch (error) {
            console.warn("BLUE ANIMATION TRIGGER ERROR:", error);
          }
          scheduleLookTrigger();
        }, delay);
      }
      scheduleLookTrigger();

      // Cleanup function
      window.addEventListener('beforeunload', () => {
        if (animationFrameId) {
          cancelAnimationFrame(animationFrameId);
        }
      });
    }
  });

  window._rive = r;
});
</script>