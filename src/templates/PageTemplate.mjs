// Renders one page of the hub. Pure: data and art in, an HTML string out.

const escapeHtml = (text) =>
  String(text).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");

const SLAB =
  "relative rounded-[30px] shadow-[0_18px_38px_rgb(20_17_15/.16)] transition-[translate,box-shadow] duration-300 ease-out hover:-translate-y-[5px] hover:shadow-[0_26px_46px_rgb(20_17_15/.22)]";

const BUTTON =
  "inline-flex items-center gap-3 whitespace-nowrap rounded-[14px] font-display font-semibold no-underline transition-[translate,background-color] duration-150 ease-out";
const BUTTON_LIVE = `${BUTTON} h-14 bg-white px-[26px] text-[1.15rem] text-ink hover:-translate-y-0.5 hover:bg-[#ffe27a] active:translate-y-px max-[420px]:w-full max-[420px]:justify-center`;
const BUTTON_SOON = `${BUTTON} pointer-events-none h-12 cursor-not-allowed bg-black/16 px-[22px] text-[1.02rem] text-white/85`;

const alternateLocales = (site, locales) =>
  site.locales.map((key) => ({ key, hreflang: locales[key].htmlLang, href: `${site.url}${locales[key].path}` }));

const gameHtml = ({ game, locale, art }) => {
  const text = locale.games[game.id];
  const status = `<span class="status" data-status="${game.status}"><i></i><span>${escapeHtml(locale.status[game.status])}</span></span>`;

  if (game.status === "live") {
    return `
    <section id="${game.id}" aria-labelledby="${game.id}-title" class="${SLAB} col-span-full flex min-h-[600px] flex-col justify-center bg-zerod p-(--pad) pb-[calc(var(--pad)+var(--cw)*1.75+28px)] text-white [--cw:min(25vw,130px)] [--pad:clamp(24px,3.2vw,48px)] hub:min-h-0 hub:pb-(--pad) hub:[--cw:clamp(112px,min(10vw,18vh),160px)] motion-safe:animate-pop-1">
      ${status}
      <h1 id="${game.id}-title" class="relative z-[2] mt-[18px] font-display text-[clamp(3.4rem,1rem+6vw,7rem)] leading-[.92] font-bold tracking-[-.03em]">${escapeHtml(text.name)}</h1>
      <p class="relative z-[2] mt-[18px] max-w-[40ch] text-[clamp(1rem,.9rem+.4vw,1.1875rem)] font-medium text-white">${escapeHtml(text.text)}</p>
      <div class="relative z-[8] mt-[22px]"><a class="${BUTTON_LIVE}" href="${escapeHtml(game.url)}"><span>${escapeHtml(locale.cta.live)}</span>${art.arrow}</a></div>
      ${art.fan}
    </section>`;
  }

  const SOON =
    "group flex min-h-[300px] flex-col justify-end pt-[50px] pr-[clamp(20px,2.2vw,32px)] pb-[clamp(16px,1.8vw,26px)] pl-[clamp(20px,2.2vw,32px)] hub:min-h-0";
  const STATUS_POSITION =
    "[&>.status]:absolute [&>.status]:top-[clamp(16px,1.8vw,24px)] [&>.status]:left-[clamp(20px,2.2vw,32px)]";
  const COPY = "relative z-[4] grayscale-[.6] brightness-[.97] hub:max-w-[62%]";
  const BODY = "mt-1.5 max-w-[30ch] text-[.9rem] leading-[1.4] font-medium";
  const ACTIONS = "relative z-[8] mt-3";

  if (game.id === "pebo") {
    return `
    <article aria-labelledby="${game.id}-title" class="${SLAB} ${SOON} ${STATUS_POSITION} overflow-visible bg-pebo motion-safe:animate-pop-2">
      ${status}
      <img class="absolute right-[4%] bottom-[-3%] z-[3] h-full w-auto origin-bottom rotate-[4deg] [filter:drop-shadow(0_14px_16px_rgb(0_0_0/.3))_grayscale(.6)_brightness(.97)] transition-[rotate] duration-[400ms] ease-out group-hover:-rotate-1 hub:right-[6%] hub:h-[104%] motion-safe:animate-bob-slow" src="/img/pebo-figure.png" width="225" height="532" alt="" aria-hidden="true">
      <div class="${COPY}">
        <h2 id="${game.id}-title" class="sr-only">${escapeHtml(text.name)}</h2>
        <div aria-hidden="true">${art.peboWordmark}</div>
        <p class="${BODY}">${escapeHtml(text.text)}</p>
      </div>
      <div class="${ACTIONS}"><span class="${BUTTON_SOON}" aria-disabled="true">${escapeHtml(locale.cta.soon)}</span></div>
    </article>`;
  }

  return `
    <article aria-labelledby="${game.id}-title" class="${SLAB} ${SOON} ${STATUS_POSITION} overflow-visible bg-ogro motion-safe:animate-pop-3">
      ${status}
      <div class="absolute right-0 bottom-[5%] z-[3] w-[108px] rotate-6 [filter:drop-shadow(0_14px_16px_rgb(0_0_0/.3))_grayscale(.6)_brightness(.97)] transition-[rotate] duration-[400ms] ease-out group-hover:-rotate-3 hub:right-[-2%] hub:bottom-[3%] hub:w-[clamp(150px,15vw,230px)] motion-safe:animate-bob-fast" aria-hidden="true">${art.ogre}</div>
      <div class="${COPY}">
        <h2 id="${game.id}-title" class="font-display text-[clamp(2.2rem,.8rem+2.6vw,3.6rem)] leading-[.92] font-bold tracking-[-.03em]">${escapeHtml(text.name)}</h2>
        <p class="${BODY}">${escapeHtml(text.text)}</p>
      </div>
      <div class="${ACTIONS}"><span class="${BUTTON_SOON}" aria-disabled="true">${escapeHtml(locale.cta.soon)}</span></div>
    </article>`;
};

const jsonLd = ({ site, locale, games }) => {
  const liveGames = games.filter((game) => game.status === "live");
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${site.url}/#website`,
        url: `${site.url}/`,
        name: site.name,
        alternateName: "Ultimate Nostalgia Online",
        description: locale.description,
        inLanguage: locale.htmlLang,
        publisher: { "@id": `${site.url}/#autor` },
      },
      {
        "@type": "Person",
        "@id": `${site.url}/#autor`,
        name: site.author.name,
        url: site.author.url,
        sameAs: [site.author.url, site.repo],
      },
      ...liveGames.map((game) => ({
        "@type": "WebApplication",
        "@id": `${game.url}/#app`,
        name: locale.games[game.id].name,
        url: game.url,
        description: locale.games[game.id].text,
        applicationCategory: "GameApplication",
        operatingSystem: "Any (web browser)",
        isAccessibleForFree: true,
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        author: { "@id": `${site.url}/#autor` },
      })),
      {
        "@type": "WebPage",
        "@id": `${site.url}${locale.path}#pagina`,
        url: `${site.url}${locale.path}`,
        name: locale.title,
        inLanguage: locale.htmlLang,
        isPartOf: { "@id": `${site.url}/#website` },
        about: liveGames.map((game) => ({ "@id": `${game.url}/#app` })),
        primaryImageOfPage: { "@type": "ImageObject", url: `${site.url}/og.png`, width: 1200, height: 630 },
      },
    ],
  };
};

const head = ({ site, locale, locales, games }) => {
  const url = `${site.url}${locale.path}`;
  const alternates = alternateLocales(site, locales)
    .map((alt) => `<link rel="alternate" hreflang="${alt.hreflang}" href="${alt.href}">`)
    .join("\n");
  return `<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(locale.title)}</title>
<meta name="description" content="${escapeHtml(locale.description)}">
<link rel="canonical" href="${url}">
${alternates}
<link rel="alternate" hreflang="x-default" href="${site.url}/">
<meta name="robots" content="index, follow, max-image-preview:large">
<meta name="theme-color" content="#F5F3EE">
<link rel="icon" href="/favicon.ico" sizes="48x48">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${site.name}">
<meta property="og:title" content="${escapeHtml(locale.title)}">
<meta property="og:description" content="${escapeHtml(locale.description)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${site.url}/og.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${escapeHtml(locale.ogImageAlt)}">
<meta property="og:locale" content="${locale.ogLocale}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${escapeHtml(locale.title)}">
<meta name="twitter:description" content="${escapeHtml(locale.description)}">
<meta name="twitter:image" content="${site.url}/og.png">
<link rel="preload" href="/fonts/fredoka.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/fonts/figtree.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/style.css">
<script async src="${site.gtmScript}"></script>
<script type="application/ld+json">${JSON.stringify(jsonLd({ site, locale, games }))}</script>`;
};

const grainFilter = `<svg class="absolute" width="0" height="0" aria-hidden="true" focusable="false"><defs><filter id="grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" stitchTiles="stitch" result="n"/><feColorMatrix type="saturate" values="0"/></filter></defs></svg>`;

export const renderPage = ({ site, locale, locales, games, art }) => {
  const expansion = locale.expansion
    .map((word) => `<b class="font-extrabold text-ink">${escapeHtml(word[0])}</b>${escapeHtml(word.slice(1))}`)
    .join(" ");
  return `<!DOCTYPE html>
<html lang="${locale.htmlLang}">
<head>
${head({ site, locale, locales, games })}
</head>
<body class="flex min-h-dvh flex-col overflow-x-clip bg-paper font-body text-base leading-normal text-ink antialiased">
${grainFilter}
<a class="fixed top-2 left-2 z-[1000] -translate-y-[200%] rounded-lg bg-white px-4 py-2 text-black focus-visible:translate-y-0" href="#games">${escapeHtml(locale.skip)}</a>
<div class="grain" aria-hidden="true"></div>

<header class="relative z-[2] flex flex-col items-start gap-2.5 px-gutter pt-10 pb-6 hub:flex-row hub:items-center hub:gap-[clamp(16px,2vw,28px)] motion-safe:animate-rise">
  <a class="flex-none" href="${locale.path}" aria-label="${site.name}">${art.logo}</a>
  <p class="max-w-[40ch] font-display text-[clamp(1.3rem,.9rem+1.2vw,2.1rem)] leading-[1.12] font-semibold tracking-[-.02em]">${escapeHtml(locale.intro)}</p>
</header>

<main id="games" class="relative z-[2] flex-1 px-gutter pt-4 pb-6">
  <div class="grid grid-cols-1 gap-5 hub:min-h-[440px] hub:grid-cols-2 hub:grid-rows-[minmax(0,1.15fr)_minmax(0,1fr)]">${games.map((game) => gameHtml({ game, locale, art })).join("\n")}
  </div>
</main>

<footer class="relative z-[2] flex min-h-24 items-center justify-between gap-4 px-gutter pt-6 pb-7 text-[.9375rem] font-semibold text-ink-soft max-[560px]:items-start">
  <p class="max-[560px]:[&>span:not([aria-hidden])]:block"><span class="font-semibold">${expansion}</span><span class="max-[560px]:hidden" aria-hidden="true"> · </span><span>${escapeHtml(locale.moreGames)}</span></p>
  <a class="border-b-2 border-current py-1.5 text-inherit no-underline" href="${site.repo}">${escapeHtml(locale.githubLink)}</a>
</footer>
<script src="/fan-tilt.js" defer></script>
</body>
</html>
`;
};

export const renderNotFound = ({ site, locale, art }) => `<!DOCTYPE html>
<html lang="${locale.htmlLang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(locale.notFound.title)}</title>
<meta name="robots" content="noindex">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="/style.css">
</head>
<body class="flex min-h-dvh flex-col items-center justify-center gap-6 bg-paper p-6 font-body text-ink">
${art.logo}
<h1 class="font-display text-3xl font-semibold">${escapeHtml(locale.notFound.text)}</h1>
<a class="rounded-[14px] bg-ink px-[26px] py-3 font-display text-lg font-semibold text-white no-underline" href="${site.url}/">${escapeHtml(locale.notFound.home)}</a>
</body>
</html>
`;
