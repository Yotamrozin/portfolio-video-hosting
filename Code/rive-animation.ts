<!-- pin to a runtime that supports data-binding -->
<script src="https://unpkg.com/@rive-app/canvas@2.30.3"></script>
<canvas id="riveCanvasRed" width="500" height="500" data-rive-ignore></canvas>

<style>
#riveCanvasRed {
  width: 100%;
  height: 100%;
  display: block;
}
</style>
<script>
document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("riveCanvasRed");

  // --- Make canvas responsive ---
  function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
  }
  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  const r = new rive.Rive({
    src: "https://cdn.prod.website-files.com/686fe533f545b4826346b826/68d2b12e6068ab8db41ed52a_eye-red.riv",
    canvas: canvas,
    autoplay: true,
    stateMachines: "eye-stateMachine",
    autoBind: true,
    onLoad: () => {
      console.log("✅ Rive loaded - RED ANIMATION");

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

      function updateHovering() {
        if (!hoveringInput) return;

        const rect = canvas.getBoundingClientRect();
        const nx = (window.heroCursor.x / 100 + 0.5) * window.innerWidth;
        const ny = (window.heroCursor.y / 100 + 0.5) * window.innerHeight;

        const hovering = nx >= rect.left && nx <= rect.right &&
                         ny >= rect.top && ny <= rect.bottom;

        if (hovering !== lastHovering) {
          hoveringInput.value = hovering;
          lastHovering = hovering;
          console.log(`RED: Hovering changed to ${hovering}`);
        }

        // If hovering, update posx/poxy
        if (hovering && vmi) {
          vmi.number("posx").value = window.heroCursor.x;
          vmi.number("poxy").value = window.heroCursor.y;
        }
      }

      // Update every frame
      function tick() {
        updateHovering();
        requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);

      // Randomized trigger firing when not hovering
      function scheduleLookTrigger() {
        if (!lookTrigger) return;
        const delay = 1300 + Math.random() * 500; // 1.3s–1.8s
        setTimeout(() => {
          if (!hoveringInput || !hoveringInput.value) {
            lookTrigger.fire();
          }
          scheduleLookTrigger();
        }, delay);
      }
      scheduleLookTrigger();
    }
  });

  window._rive = r;
});
</script>