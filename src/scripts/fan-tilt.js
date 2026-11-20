// Pointer tilt: a card sets --tilt (degrees) on the art inside it while the pointer moves over the card.
if (!matchMedia("(prefers-reduced-motion: reduce)").matches && matchMedia("(hover: hover)").matches) {
  for (const card of document.querySelectorAll("[data-tilt-card]")) {
    const target = card.querySelector("[data-tilt-target]");
    const range = Number(card.dataset.tiltCard);
    if (!target) continue;
    card.addEventListener("pointermove", (event) => {
      const box = card.getBoundingClientRect();
      target.style.setProperty("--tilt", ((event.clientX - box.left) / box.width - 0.5) * range);
    });
    card.addEventListener("pointerleave", () => target.style.setProperty("--tilt", 0));
  }
}
