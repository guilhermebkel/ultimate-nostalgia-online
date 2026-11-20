// Events for the owner's GTM container. They go to window.dataLayer; nothing else leaves the page.
// What each event carries is in docs/tracking-standards.md; keep the two in step (a test compares them).
const dataLayer = (window.dataLayer = window.dataLayer || []);

const MIN_HOVER_MS = 500;
const MAX_HOVER_MS = 30000;
const MAX_HOVERS_PER_CARD = 5;
const HOVER_ROUND_MS = 100;

const track = (event, params) => dataLayer.push({ event, locale: document.documentElement.lang, ...params });

const cardOf = (element) => element.closest("[data-track-card]");
const gameOf = (card) => ({ game_id: card.dataset.trackCard, status: card.dataset.trackStatus });

const onClick = (event) => {
  // The main button and the middle button both open the link; a right click does not.
  if (event.button > 1) return;
  const target = event.target.closest("[data-track-click], [data-track-link]");
  if (!target) return;
  if (target.dataset.trackClick) {
    const card = cardOf(target);
    if (card) track("game_card_click", { ...gameOf(card), placement: target.dataset.trackClick });
  } else {
    track("footer_link_click", { link: target.dataset.trackLink });
  }
};
document.addEventListener("click", onClick);
document.addEventListener("auxclick", (event) => event.button === 1 && onClick(event));

if (matchMedia("(hover: hover)").matches) {
  for (const card of document.querySelectorAll("[data-track-card]")) {
    let startMs = null;
    let sentCount = 0;

    const flush = () => {
      if (startMs === null) return;
      const durationMs = Math.min(performance.now() - startMs, MAX_HOVER_MS);
      startMs = null;
      if (durationMs < MIN_HOVER_MS || sentCount >= MAX_HOVERS_PER_CARD) return;
      sentCount += 1;
      track("game_card_hover", {
        ...gameOf(card),
        duration_ms: Math.round(durationMs / HOVER_ROUND_MS) * HOVER_ROUND_MS,
      });
    };

    card.addEventListener("pointerenter", (event) => {
      if (event.pointerType === "mouse") startMs = performance.now();
    });
    // After the tab was hidden the pointer may still be over the card: count again from the next move.
    card.addEventListener("pointermove", (event) => {
      if (startMs === null && event.pointerType === "mouse") startMs = performance.now();
    });
    card.addEventListener("pointerleave", flush);
    addEventListener("pagehide", flush);
    document.addEventListener("visibilitychange", () => document.hidden && flush());
  }
}
