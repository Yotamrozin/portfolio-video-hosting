document.addEventListener("DOMContentLoaded", () => {
  // Find the hero section by ID
  const hero = document.getElementById("hero"); // replace with your actual hero ID
  if (!hero) return;

  // Select only .eye-container elements inside this hero section
  const eyeContainers = hero.querySelectorAll(".eye-container");

  eyeContainers.forEach((el, index) => {
    const delay = index * 0.3; // optional stagger

    gsap.to(el, {
      bottom: "10%",
      duration: 1.5,
      yoyo: true,
      repeat: -1,
      ease: "sine.inOut",
      delay: delay
    });
  });
});
