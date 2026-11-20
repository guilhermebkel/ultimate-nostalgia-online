const fan = document.getElementById("fan");
const card = document.getElementById("zerod");

if (fan && card && !matchMedia("(prefers-reduced-motion: reduce)").matches && matchMedia("(hover: hover)").matches) {
  card.addEventListener("pointermove", (event) => {
    const box = card.getBoundingClientRect();
    fan.style.setProperty("--tilt", ((event.clientX - box.left) / box.width - 0.5) * 8);
  });
  card.addEventListener("pointerleave", () => fan.style.setProperty("--tilt", 0));
}
