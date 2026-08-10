/* ============================================================================
   scroll-world — portable scroll-scrubbed camera-flight engine
   ----------------------------------------------------------------------------
   Framework-agnostic. Vanilla JS, zero dependencies. It builds its own DOM and
   injects its own (namespaced) CSS into a container you give it, so it drops into
   plain HTML, Next.js (call from a ref/useEffect), Vue (onMounted), a server-
   rendered page, anything.

   USAGE
     mountScrollWorld(document.getElementById('world'), {
       brand: { name: 'Pearl & Co.', href: '#top' },
       diveScroll: 1.3,   // viewport-heights of scroll per dive clip
       connScroll: 0.9,   // ...per connector clip
       hint: 'scroll to fly in',
       nav: true,         // show the top section nav
       atmosphere: true,  // subtle gradient + drifting particles behind the clips
       sections: [
         { id, label, still, stillMobile, clip, clipMobile, accent,
           scroll: 1.6,   // optional per-section override of diveScroll — more scroll
                          // distance = a slower, longer dwell in this scene
           linger: 0.5,   // optional 0..1 — remaps time so the camera settles mid-scene
                          // (exactly where the copy peaks) and moves quicker at the
                          // edges. 0 = linear (default). Keep ≤ 0.6; 1 = full pause.
           eyebrow, title, body, tags:[…],
           cta:{ primary:{label,href}, secondary:{label,href} } }, // last section only
         …
       ],
       connectors: [clipUrl, …],          // length = sections.length - 1 (nulls allowed)
       connectorsMobile: [clipUrl, …],    // optional lighter connectors for phones (same length)

   SNAPPY SCROLL (optional — `snap: true` or `snap: {…}`; off by default)
     Without it, one wheel notch moves the flight by ~100px and the visitor has to
     grind through every frame of a 15-second camera move to reach the next scene.
     With it, a scroll gesture no longer transports pixels: it launches an animated
     flight to the NEXT STOP and the camera flies there on its own. Stops are the
     same landing positions the nav/route dots use (where each section's copy peaks),
     plus one final stop at whatever follows the world (`exit`).
       snap: {
         exit: '#epilog',   // selector of the section after the world. Below it the
                            // page scrolls natively again (long content must stay
                            // readable); an upward gesture at its top flies back in.
         perVh: 900,        // ms of flight per viewport-height of distance
         min: 700, max: 3200,
         wheelThreshold: 18,// accumulated wheel delta before a gesture counts
         cooldown: 240,     // ms after landing in which trackpad inertia is swallowed
         touch: true,       // hijack touch too (drag gives ~⅓ live preview, release snaps)
         keys: true,        // ↑/↓/PageUp/PageDown/Space/Home/End
         drag: 0.32,        // how far the world follows the finger during a drag
       }
     Ignored under prefers-reduced-motion (native scrolling stays; the segments
     also shrink to short uniform widths — see DIVE_W_R at the segment chain — so
     the still tour is a brief scroll instead of the full flight distance).
     Those users also get a small fixed pill (.sw-motion) to opt INTO the full
     flight — persisted as localStorage sw-motion=full, opting out removes it,
     the switch re-mounts via reload. Nobody else ever sees the pill.
     motionToggle:false disables it, motionToggle:{on,off} localizes the labels.
     mountScrollWorld
     returns { jumpTo(i), scrollTo(y, ms?), stops(), layout() } so page code can use
     the same flight for its own links.
     With `touch`, the engine puts `.sw-nopan` on <html> while the visitor is inside
     the world so the browser can't pan vertically on its own — without it iOS commits
     the gesture to native scrolling on the first un-prevented touchmove and every
     snap flight gets overrun by momentum. It is removed again at `exit`.

   MOBILE (the clipMobile/connectorsMobile variants are the opt-in mobile version;
   the rest of the phone handling below is always on)
     The engine is phone-aware out of the box: on a coarse-pointer / ≤860px viewport it
       - loads `clipMobile` / `connectorsMobile` when provided (encode these smaller +
         tighter-GOP — seek cost on a phone decoder is dominated by frames-from-keyframe,
         so a 720p, -g 4 file scrubs far smoother than the 1080p desktop master; see
         pipeline.md). Falls back to the desktop `clip` if no mobile variant is given.
       - uses `stillMobile` as the scene poster when provided (pair it with native 9:16
         clipMobile renders so the poster matches the portrait video's first frame instead
         of flashing from a landscape crop). Chosen once at mount; a desktop resize into
         phone width keeps the desktop poster (clips still switch via isMobile()).
       - coalesces seeks (never issues a new currentTime while the decoder is still
         `seeking`) so fast flicks can't pile up and freeze the video.
       - scrubs flights via fastSeek() where WebKit offers it (keyframe-precision,
         no pipeline stall — THE reason the -g 4 encodes matter) and switches to
         exact currentTime seeks near the stop for precise seam frames.
       - background-prefetches the whole chain in flight order, one clip at a
         time. The near-radius alone is tuned for desktop bandwidth; on phones
         it requested each connector only on arrival at the previous stop, and
         the ~1–2 s until departure were not enough on cellular.
       - set `assetRev` (any string/number) to append ?av= to every clip fetch;
         bump it whenever clip files change, or phones keep serving the old
         encodes from HTTP cache for up to max-age after a deploy.
       - keeps only a window of ±`clipWindow` segments (default 1, so three) attached as
         real <video> elements and hands every other decoder back. iOS only keeps a
         handful of media elements decodable at once; past that limit a clip silently
         never paints a frame and its scene looks like it has no animation at all. The
         blob stays cached, so re-attaching costs no network. Desktop keeps them all.
       - keeps the still as a live poster until the clip actually paints its first frame,
         and primes each video (muted play→pause) on first touch — this is what stops iOS
         from showing a blank scene before the first seek.
       - drops the drifting particles and ignores URL-bar-only resizes (no scroll jump).
     Nothing here is required — a config with only `clip`/`connectors` still works on
     phones; the mobile variants just make it lighter and smoother.

   THEME (CSS custom properties; set on the container or :root to override)
     --sw-bg         page background (match your scene bg for seamless posters)
     --sw-ink        primary text
     --sw-ink-soft   secondary text
     --sw-accent     default accent (each section overrides via its `accent`)
     --sw-font-display / --sw-font-body

   REQUIREMENTS ON YOUR ASSETS
     - clips encoded native-res, crf~20, -g 8, +faststart, no audio (see pipeline.md)
     - connectors' endpoints are the neighbouring dives' ACTUAL frames (see SKILL Step 5)
     - (optional) mobile variants at ~720p, -g 4 for smoother phone scrubbing
   The engine loads each clip as a Blob (always seekable) and scrubs currentTime; it does
   NOT depend on HTTP byte-range support.
   ========================================================================== */

// Bei jeder Engine-Änderung mitziehen (und ?v= in index.astro): das Debug-HUD
// und /sw-debug.html zeigen die Revision an — nur so ist auf einem Telefon
// beweisbar, WELCHER Stand dort wirklich läuft (HTTP-Cache, Tab-Restore).
var SW_ENGINE_REV = '2026-08-11b';

function mountScrollWorld(container, config) {
  // Bedienhilfe respektieren, aber überstimmbar: sysReduce ist der OS-Wunsch
  // (prefers-reduced-motion), sw-motion=full in localStorage die bewusste
  // Nutzerwahl über den .sw-motion-Schalter (siehe unten). Nur wer die
  // Bedienhilfe aktiv hat, sieht den Schalter überhaupt — für alle anderen
  // existiert das Feature nicht. `reduce` bleibt die eine Wahrheit für den
  // Rest der Engine (Snap, Clips, Segmentweiten, Kurven, Partikel).
  const sysReduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let motionFull = false;
  try { motionFull = localStorage.getItem('sw-motion') === 'full'; } catch (e) {}
  const reduce = sysReduce && !motionFull;
  // Phone detection. `coarse` is captured once (input type doesn't change mid-session);
  // the ≤860px query is read live via isMobile() so a desktop resize/DevTools toggle
  // switches sources and seek behaviour without a reload.
  const coarse = window.matchMedia('(hover: none) and (pointer: coarse)').matches;
  const smallMQ = window.matchMedia('(max-width: 860px)');
  const isMobile = () => coarse || smallMQ.matches;
  const SECTIONS = config.sections || [];
  const CONNECTORS = config.connectors || [];
  const CONNECTORS_M = config.connectorsMobile || [];
  const DIVE_W = config.diveScroll || 1.3;
  const CONN_W = config.connScroll || 0.9;
  const CROSSFADE = (config.crossfade != null) ? config.crossfade : 0.12;  // seam dissolve width (vh)
  // Snappy scroll: a gesture flies to the next stop instead of transporting pixels.
  // Never under prefers-reduced-motion — there the page scrolls natively.
  const SNAP = (!reduce && config.snap) ? Object.assign({
    perVh: 900, min: 700, max: 3200, wheelThreshold: 18, cooldown: 240,
    touch: true, keys: true, drag: 0.32, exit: null
  }, config.snap === true ? {} : config.snap) : null;
  // Opt-in/-out-Schalter für Nutzer mit aktiver Bedienhilfe (siehe sysReduce
  // oben). motionToggle:false schaltet das Feature ab; {on,off} übersetzt die
  // Beschriftungen (Defaults englisch, die Engine ist portabel).
  const MOTION_T = (config.motionToggle !== false) ? Object.assign({
    on: 'Turn animation on', off: 'Turn animation off'
  }, config.motionToggle || {}) : null;
  const N = SECTIONS.length;
  if (!N) return;

  injectCSS();
  container.classList.add('sw-root');

  // ---- Debug-HUD (nur mit ?swdebug in der URL) ------------------------------
  // Auf dem Telefon gibt es keine Konsole, und genau dort liegen die Fälle, die
  // die DevTools-Emulation nicht abbildet (Bedienhilfen wie Pro-App-"Bewegung
  // reduzieren", Cache-Stand, WebKit-Gestenmodell). Das HUD zeigt die
  // Entscheidungsgrundlagen der Engine als Statuszeile und loggt Gesten-,
  // Flug- und Video-Ereignisse auf der Seite; "Report anzeigen" öffnet den
  // kompletten Verlauf als markierbaren Text zum Kopieren/Screenshotten.
  const dbg = /[?&#]swdebug/.test(location.href) ? makeDebugHud(SW_ENGINE_REV) : null;
  const dlog = dbg ? dbg.log : function () {};

  // ---- build the interleaved segment chain: dive0, conn0, dive1, … diveN-1 ----
  // Unter prefers-reduced-motion schrumpfen alle Segmente auf kurze, uniforme
  // Strecken. Clips und Snap sind dort bewusst aus — die konfigurierten Weiten
  // sind aber auf den Kameraflug gerechnet, übrig bliebe nur eine Wisch-Wüste
  // aus Stills (bei Domvesta: ~13,8 Bildschirmhöhen, und durch die per-Section-
  // Overrides samt linger fühlten sich spätere Szenen auch noch zäher an).
  // Kurze Segmente machen daraus eine Wischgeste pro Szene; Copy-Kurven, Stops
  // und Crossfade rechnen in Segmentanteilen und skalieren automatisch mit.
  const DIVE_W_R = 0.6, CONN_W_R = 0.35;   // vh je Dive/Connector unter reduce
  const SEGMENTS = [];
  SECTIONS.forEach((s, i) => {
    const dive = { kind: 'dive', si: i, clip: s.clip, clipM: s.clipMobile, still: s.still, stillM: s.stillMobile,
                   accent: s.accent, w: reduce ? DIVE_W_R : (s.scroll || DIVE_W), linger: s.linger || 0 };
    SEGMENTS.push(dive);
    s._seg = dive;
    // A connector is optional: if connectors[i] is falsy, the two dives simply
    // crossfade directly (no fly-over). Lets a page complete even when a
    // connector can't be generated (e.g. a content-filter false-positive).
    if (i < N - 1 && CONNECTORS[i]) {
      SEGMENTS.push({ kind: 'conn', si: i, clip: CONNECTORS[i], clipM: CONNECTORS_M[i],
                      still: SECTIONS[i + 1].still, stillM: SECTIONS[i + 1].stillMobile,
                      accent: SECTIONS[i + 1].accent, w: reduce ? CONN_W_R : CONN_W });
    }
  });
  const NSEG = SEGMENTS.length;
  dlog('mount: sections=' + N + ' segs=' + NSEG + ' reduce=' + (reduce ? 1 : 0) +
       ' coarse=' + (coarse ? 1 : 0) + ' snap=' + (SNAP ? 1 : 0));

  // ---- DOM ----
  const sky = el('div', 'sw-sky');
  if (config.atmosphere !== false) {
    sky.appendChild(el('div', 'sw-sky__grad'));
    sky.appendChild(el('div', 'sw-sky__glow'));
  }
  const particles = el('div', 'sw-particles'); sky.appendChild(particles);

  const scrollbar = el('div', 'sw-scrollbar');
  const scrollbarFill = el('span'); scrollbar.appendChild(scrollbarFill);

  const topbar = el('div', 'sw-topbar');
  if (config.brand) {
    const brand = el('a', 'sw-brand'); brand.href = (config.brand.href || '#');
    brand.appendChild(el('span', 'sw-brand__mark'));
    const nm = el('span', 'sw-brand__name'); nm.textContent = config.brand.name || ''; brand.appendChild(nm);
    topbar.appendChild(brand);
  }
  const nav = el('nav', 'sw-nav'); if (config.nav !== false) topbar.appendChild(nav);
  if (config.cta && config.cta.label) {
    const c = el('a', 'sw-topcta'); c.href = config.cta.href || '#'; c.textContent = config.cta.label;
    topbar.appendChild(c);
  }

  const stage = el('div', 'sw-stage');
  const copylayer = el('div', 'sw-copylayer');
  const route = el('div', 'sw-route');
  const hint = el('div', 'sw-hint');
  const hintText = el('span'); hintText.textContent = config.hint || 'scroll'; hint.appendChild(hintText);
  hint.appendChild(el('i'));
  const track = el('div', 'sw-track');

  [sky, scrollbar, topbar, stage, copylayer, route, hint, track].forEach(n => container.appendChild(n));

  // Der Animations-Schalter: startet die volle Fassung (Opt-in) bzw. kehrt zur
  // Still-Tour zurück. Der Wechsel betrifft Segmentweiten, Listener und das
  // Clip-Laden zugleich — ein Reload ist der ehrliche Re-Mount, die Wahl ist
  // ohnehin persistiert. Ohne funktionierendes localStorage (dann wäre der
  // Schalter eine Attrappe, die bei jedem Reload zurückspringt) erscheint er
  // gar nicht erst.
  if (sysReduce && MOTION_T) {
    let canStore = false;
    try { localStorage.setItem('sw-mt', '1'); localStorage.removeItem('sw-mt'); canStore = true; } catch (e) {}
    if (canStore) {
      const mt = el('button', 'sw-motion');
      mt.type = 'button';
      mt.textContent = reduce ? MOTION_T.on : MOTION_T.off;
      mt.addEventListener('click', () => {
        try {
          if (reduce) localStorage.setItem('sw-motion', 'full');
          else localStorage.removeItem('sw-motion');
        } catch (e) {}
        location.reload();
      });
      container.appendChild(mt);
    }
  }

  // segment scenes
  SEGMENTS.forEach(s => {
    const scene = el('div', 'sw-scene'); scene.style.setProperty('--sw-accent', s.accent || '');
    const img = el('img', 'sw-scene__still'); img.alt = ''; img.decoding = 'async'; img.loading = 'lazy';
    const poster = (isMobile() && s.stillM) ? s.stillM : s.still;
    if (poster) img.src = poster;
    scene.appendChild(img); stage.appendChild(scene);
    s.el = scene; s.img = img; s.video = null; s.hasClip = false;
    // url = Blob-URL des Clips (überlebt ein releaseClip), fetching/fails = Netz-Zustand.
    s.url = null; s.fetching = false; s.fails = 0;
    s.ready = false; s.cur = 0; s.target = 0; s.visible = false;
    // seekAt = wann der letzte Seek angestoßen wurde (Watchdog in raf, siehe
    // SEEK_STALL); priming = gerade ein play()/pause()-Zyklus unterwegs.
    s.seekAt = 0; s.priming = false; s.primingAt = 0;
  });

  // per-section copy / route / nav
  const copies = [], dots = [];
  SECTIONS.forEach((s, i) => {
    const c = el('article', 'sw-copy'); c.style.setProperty('--sw-accent', s.accent || '');
    c.innerHTML =
      `<span class="sw-copy__num">${pad(i + 1)} / ${pad(N)}</span>` +
      (s.eyebrow ? `<span class="sw-copy__eyebrow">${esc(s.eyebrow)}</span>` : '') +
      (s.title ? `<h2 class="sw-copy__title">${esc(s.title)}</h2>` : '') +
      (s.body ? `<p class="sw-copy__body">${esc(s.body)}</p>` : '') +
      (s.tags && s.tags.length ? `<ul class="sw-copy__tags">${s.tags.map(t => `<li>${esc(t)}</li>`).join('')}</ul>` : '') +
      (s.cta ? `<div class="sw-copy__cta">${ctaBtns(s.cta)}</div>` : '');
    copylayer.appendChild(c); copies.push(c);

    const dot = el('button', 'sw-route__dot'); dot.style.setProperty('--sw-accent', s.accent || '');
    dot.innerHTML = `<span class="sw-route__label">${esc(s.label || '')}</span><i></i>`;
    dot.addEventListener('click', () => jumpTo(i)); route.appendChild(dot); dots.push(dot);

    if (config.nav !== false) {
      const b = el('button', 'sw-nav__item'); b.textContent = s.label || '';
      b.addEventListener('click', () => jumpTo(i)); nav.appendChild(b);
    }
  });

  // ---- math ----
  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  const smooth = x => { x = clamp(x); return x * x * (3 - 2 * x); };
  // Per-section dwell: monotone remap of scroll→time so the camera settles mid-scene
  // (where the copy peaks) and moves quicker near the seams. L=0 linear, L=1 full
  // mid-scene pause. f(0)=0, f(1)=1 always, so seam frames are untouched.
  const lingerEase = (x, L) => { L = clamp(L); const c = x - 0.5; return (1 - L) * x + L * (4 * c * c * c + 0.5); };
  let vh = window.innerHeight, stageX = 0, totalW = 0, activeIndex = -1, ticking = false;
  let laidOutW = window.innerWidth;   // width the current layout was computed at (see onResize)

  function layout() {
    vh = window.innerHeight;
    laidOutW = window.innerWidth;
    stageX = window.innerWidth > 860 ? 4 : 0;
    let off = 0;
    SEGMENTS.forEach(s => { s.start = off * vh; off += s.w; s.end = off * vh; });
    totalW = off;
    track.style.height = (totalW * vh + vh) + 'px';   // +1vh so the last flight completes
    buildStops();
    if (dbg) dbg.status('reduce=' + (reduce ? 1 : 0) + (sysReduce && motionFull ? '(override)' : '') + ' coarse=' + (coarse ? 1 : 0) +
      ' snap=' + (SNAP ? (SNAP.touch ? 'on+touch' : 'on') : 'OFF') +
      ' vh=' + vh + ' track=' + (Math.round(totalW * 10) / 10) + 'vh exitY=' + exitY);
    read();
  }

  // ---- stops: the scroll positions a jump/snap may land on -------------------
  // Land where this section's copy actually peaks — see the opacity curves in
  // read(). The first section greets on landing (full at pr=0 and fading from
  // there), so a mid-segment jump would drop you into a half-faded headline.
  // The last one holds from pr=0.4 on, mid-segment is fine; all others peak at 0.5.
  // The final stop is the top of whatever follows the world (snap.exit), i.e. the
  // point where the flight is over and the page becomes an ordinary page again.
  let stops = [], exitY = Infinity;
  function buildStops() {
    stops = SECTIONS.map((s, i) => {
      const seg = s._seg, at = i === 0 ? 0 : 0.5;
      return Math.round(seg.start + (seg.end - seg.start) * at);
    });
    const ex = (SNAP && SNAP.exit) ? document.querySelector(SNAP.exit) : null;
    exitY = ex ? Math.round(ex.getBoundingClientRect().top + scrollPos()) : Math.round(totalW * vh);
    exitY = Math.min(exitY, maxScroll());
    stops.push(exitY);
  }
  function stopAfter(y) { for (let i = 0; i < stops.length; i++) if (stops[i] > y + 6) return stops[i]; return null; }
  function stopBefore(y) { for (let i = stops.length - 1; i >= 0; i--) if (stops[i] < y - 6) return stops[i]; return null; }

  function jumpTo(i) {
    const y = stops[i];
    if (y == null) return;
    if (SNAP) { flyTo(y); return; }
    window.scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' });
  }

  // ---- the flight: a rAF tween of window.scrollY ----------------------------
  // Not scrollTo({behavior:'smooth'}) — its duration isn't ours to choose, and the
  // browser's snap-fast curve would whip a 15-second camera move past in ~300ms.
  // Every frame we set the scroll position, the engine's own scroll listener picks
  // it up and scrubs the clips, so the flight plays exactly as if hand-scrolled.
  const scrollPos = () => window.scrollY || window.pageYOffset || 0;
  const maxScroll = () => Math.max(0, (document.documentElement.scrollHeight || 0) - window.innerHeight);
  // Quadratic in-out, not cubic: a cubic ease covers 0.6% of the distance in its
  // first 300ms, which after a wheel notch reads as "nothing happened". Quad moves
  // ~4x as far in that window (the gesture is answered immediately) and still
  // departs and lands at rest — and its slope is continuous at the midpoint, so
  // there's no kick halfway through the flight.
  const easeIO = x => (x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2);
  let fly = null, flyRAF = 0, setY = -1, coolUntil = 0, dbgSeeks = 0;

  // FIX (iOS): window.scrollTo ist in WebKit nicht synchron. Das scroll-Event
  // meldet die Position 1–2 Frames NACHDEM sie gesetzt wurde — die rAF-Schleife
  // hat dann längst das nächste Ziel gesetzt. Der alte Punktvergleich
  // (|scrollPos − setY| > 8) hielt diesen eigenen Nachzügler für einen fremden
  // Eingriff, sobald der Ease schneller als ~8px/Frame wurde (~0,4 s nach dem
  // Start), und brach JEDEN Flug ab: eine Geste bewegte die Seite nur noch
  // ~150px statt zur nächsten Szene. In Blink ist scrollTo synchron (Differenz
  // immer 0) — deshalb war der Fehler in den DevTools per Definition unsichtbar
  // und trat nur auf echten iPhones auf.
  // Deshalb Spanne statt Punkt: die letzten selbst angefahrenen Positionen
  // bleiben in setHist, und nur eine Position AUSSERHALB dieser Spanne gilt als
  // fremd (Scrollbalken-Drag, Seitensuche, Browser-Restore — die sollen den
  // Flug weiterhin abbrechen). Eigene Nachzügler liegen konstruktionsbedingt
  // immer darin. Die Historie wird bei flyTo bewusst NICHT geleert: direkt nach
  // einem Drag können noch verspätete Drag-Positionen eintreffen, auch die sind
  // unsere. Tiefe 8 = ~7 Frames Rückstand abgedeckt (Kompositor-Pipeline liegt
  // bei 1–3, auf 120Hz-Displays mit 60Hz-Event-Takt entsprechend mehr) — als
  // Fenster trotzdem nur ~100 ms Eigenpfad, ein Scrollbalken-Sprung landet
  // praktisch nie darin.
  let setHist = [];
  function pushSet(y) { setY = y; setHist.push(y); if (setHist.length > 8) setHist.shift(); }
  function ownScroll(y) {
    let lo = Infinity, hi = -Infinity;
    for (let i = 0; i < setHist.length; i++) { const v = setHist[i]; if (v < lo) lo = v; if (v > hi) hi = v; }
    return y >= lo - 9 && y <= hi + 9;
  }

  function flyTo(y, dur) {
    const from = scrollPos();
    y = clamp(Math.round(y), 0, maxScroll());
    if (Math.abs(y - from) < 2) return;
    const d = (dur != null) ? dur
      : clamp(Math.abs(y - from) / Math.max(1, vh) * SNAP.perVh, SNAP.min, SNAP.max);
    dlog('fly ' + Math.round(from) + '->' + y + ' dur=' + Math.round(d));
    dbgSeeks = 0;
    pushSet(from);
    fly = { from: from, to: y, t0: performance.now(), dur: d };
    if (!flyRAF) flyRAF = requestAnimationFrame(stepFly);
  }

  function stepFly(now) {
    flyRAF = 0;
    if (!fly) return;
    const p = clamp((now - fly.t0) / fly.dur);
    pushSet(Math.round(fly.from + (fly.to - fly.from) * easeIO(p)));
    window.scrollTo(0, setY);
    if (p >= 1) { dlog('fly landed @' + setY + ' seeks=' + dbgSeeks + (dbg ? ' | ' + vidState() : '')); fly = null; coolUntil = now + SNAP.cooldown; return; }
    flyRAF = requestAnimationFrame(stepFly);
  }

  function cancelFly() { if (fly) dlog('fly CANCEL @' + Math.round(scrollPos())); fly = null; if (flyRAF) { cancelAnimationFrame(flyRAF); flyRAF = 0; } }

  // Momentaufnahme der angehängten Videos für die Landed-Zeile im HUD:
  // "conn1:rs4" = readyState 4, ein "*" dahinter = hängt gerade in seeking.
  // rs0/rs1 ohne data-Zeile heißt: iOS hat dem Element nie einen Frame erlaubt.
  function vidState() {
    const a = [];
    for (let i = 0; i < NSEG; i++) {
      const s = SEGMENTS[i];
      if (s.video) a.push(s.kind + s.si + ':rs' + s.video.readyState + (s.video.seeking ? '*' : ''));
    }
    return a.join(' ');
  }

  // Chained gestures count from the *target*, so a second flick during a flight
  // queues the section after the one we're heading to instead of the one we left.
  function snapStep(dir) {
    const base = fly ? fly.to : scrollPos();
    const t = dir > 0 ? stopAfter(base) : stopBefore(base);
    dlog('snapStep dir=' + dir + ' base=' + Math.round(base) + ' -> ' + (t == null ? 'null' : Math.round(t)));
    if (t == null) return false;
    flyTo(t);
    return true;
  }

  // Solange wir in der Welt sind, bekommt der Browser das vertikale Pannen per
  // touch-action ganz entzogen (siehe .sw-nopan im CSS und den FIX-Kommentar an
  // onTouchMove) — sonst überfährt der native Scroll samt Momentum jeden Snap-Flug.
  // pan-x und pinch-zoom bleiben erlaubt, Zoom als Bedienhilfe funktioniert also
  // weiter. Ab dem Epilog fällt der Riegel: dort steht Fließtext, Teamfoto, Video
  // und Footer, das muss ganz normal scrollen.
  let noPan = false;
  function setNoPan(on) {
    if (on === noPan) return;
    noPan = on;
    dlog('nopan ' + (on ? 'ON' : 'off'));
    document.documentElement.classList.toggle('sw-nopan', on);
  }

  // Hijack only inside the world. Past the exit the page is ordinary content that
  // has to scroll normally; sitting exactly at the exit, an upward gesture is the
  // way back into the flight.
  function hijack(dir) {
    if (!SNAP) return false;
    const y = scrollPos();
    if (y < exitY - 2) return true;
    return dir < 0 && y < exitY + 2;
  }

  // ---- clip lifecycle: fetch (network) und attach (decoder) getrennt ----------
  // Die beiden Ressourcen sind unterschiedlich knapp und wollen deshalb zu
  // unterschiedlichen Zeitpunkten ausgegeben werden:
  //   Bandbreite  FRÜH  — der Blob soll liegen, bevor das Segment sichtbar wird.
  //   Decoder     SPÄT  — iOS hält nur eine Handvoll <video> gleichzeitig
  //                       dekodierfähig. Ab dieser Grenze liefert das nächste
  //                       Element schlicht keinen Frame: `seeked` feuert nie, die
  //                       Engine lässt das Still stehen und die Szene sieht aus,
  //                       als hätte sie gar keine Scroll-Animation. Am Desktop
  //                       fällt das nicht auf, dort dürfen alle neun Clips leben.
  // Auf Telefonen hängt darum immer nur ein Fenster von CLIP_WINDOW Segmenten um
  // die aktuelle Position herum wirklich im DOM. Alle anderen geben ihren Decoder
  // zurück und behalten nur die Blob-URL — ein späteres attachClip() kostet also
  // kein Netz. Das Fenster ist mindestens ein volles Segment breit, ein wieder
  // angehängter Clip hat seinen ersten Frame also lange vor dem Crossfade.
  const CLIP_WINDOW = (config.clipWindow != null) ? config.clipWindow : 1;

  function fetchClip(s) {
    // Under prefers-reduced-motion we never load the clips at all — the stills stay up
    // and simply cross-dissolve as you scroll. No scrubbed video motion, no decode cost.
    if (reduce || s.url || s.fetching || !s.clip || s.fails > 2) return;
    s.fetching = true;
    // Serve the lighter mobile encode on phones when one was provided.
    const base = (isMobile() && s.clipM) ? s.clipM : s.clip;
    // Asset-Cache-Buster, gleiche Konvention wie ?v= an der Engine selbst: die
    // Clip-URLs sind über Deploys hinweg identisch, und ein Telefon darf eine
    // alte Datei bis max-age ungefragt weiterverwenden — nach einem Re-Encode
    // testet man sonst gegen Geister (alte GOP-20-Clips aus dem HTTP-Cache).
    // config.assetRev bei jeder Asset-Änderung mitziehen.
    const url = (config.assetRev != null)
      ? base + (base.indexOf('?') < 0 ? '?av=' : '&av=') + config.assetRev
      : base;
    const t0 = performance.now();
    fetch(url).then(r => r.ok ? r.blob() : Promise.reject(new Error('404')))
      .then(blob => {
        s.url = URL.createObjectURL(blob); s.fetching = false;
        dlog('blob ' + s.kind + s.si + ' ' + Math.round(blob.size / 1024) + 'kB ' + Math.round(performance.now() - t0) + 'ms');
        read();
      })
      .catch(() => { s.fetching = false; s.fails = (s.fails || 0) + 1; dlog('fetch FAIL ' + s.kind + s.si + ' n=' + s.fails); });
  }

  function attachClip(s) {
    if (reduce || s.video || !s.url) return;
    const v = document.createElement('video');
    v.className = 'sw-scene__video';
    v.muted = true; v.playsInline = true; v.preload = 'auto';
    v.setAttribute('muted', ''); v.setAttribute('playsinline', '');
    v.src = s.url;
    v.addEventListener('loadedmetadata', () => {
      dlog('meta ' + s.kind + s.si);
      s.ready = true;
      // Erzwingt einen ersten echten Seek. Ohne ihn stünde currentTime auf 0, die
      // raf-Schleife hätte (bei s.cur ≈ 0) nichts zu tun, und weder `seeked` noch
      // requestVideoFrameCallback feuerten — das Still bliebe für immer stehen.
      try { s.seekAt = performance.now(); v.currentTime = clamp(s.cur, 0.002, 0.999) * (v.duration || 1); } catch (e) {}
      read();
    });
    // Reveal the video (hide the still poster) only once a real frame has
    // painted — on iOS a seeked-but-never-played muted video stays blank, so
    // hiding the still on metadata alone would flash an empty scene.
    // rVFC feuert genau bei der Frame-Präsentation; `seeked` ist der Fallback.
    const reveal = () => { dlog('frame ' + s.kind + s.si); s.el.classList.add('has-clip'); };
    if (v.requestVideoFrameCallback) v.requestVideoFrameCallback(reveal);
    else v.addEventListener('seeked', reveal, { once: true });
    // Telemetrie für Geräte-Reports: feuert seek0 nie, hängt das Element im
    // seeking-Deadlock (siehe FIX-Kommentar am Priming); fehlt data, hat iOS
    // dem Element nie einen Frame dekodiert.
    v.addEventListener('seeked', () => dlog('seek0 ok ' + s.kind + s.si), { once: true });
    // Kein primeVideo mehr von hier (Geräte-Report 2026-08-11): auf Safari
    // feuert loadeddata vor der Freischaltung ohnehin nie (Henne-Ei, siehe
    // Priming-Kommentar), auf CriOS war es nur ein zusätzlicher Play/Pause-
    // Störer mitten im Flug. pause() nur, wenn gerade kein Prime läuft — sonst
    // bricht es dessen play() mit AbortError ab (die FAIL-Paare im Report).
    v.addEventListener('loadeddata', () => { dlog('data ' + s.kind + s.si); if (!s.priming) { try { v.pause(); } catch (e) {} } });
    s.el.appendChild(v); s.video = v; s.hasClip = true;
  }

  // Decoder zurückgeben. Das Element nur aus dem DOM zu nehmen reicht in WebKit
  // nicht — erst `src` leeren plus load() gibt die Media-Ressource frei.
  function releaseClip(s) {
    const v = s.video;
    if (!v) return;
    s.video = null; s.hasClip = false; s.ready = false;
    s.priming = false; s.seekAt = 0;
    s.el.classList.remove('has-clip');
    try { v.pause(); } catch (e) {}
    v.removeAttribute('src');
    try { v.load(); } catch (e) {}
    v.remove();
  }

  function read() {
    const y = window.scrollY || window.pageYOffset;
    const fade = CROSSFADE * vh;
    let ci = 0;
    for (let i = 0; i < NSEG; i++) if (y >= SEGMENTS[i].start) ci = i;

    // Decoder-Budget (siehe attachClip). Freigeben passiert VOR dem Anhängen,
    // damit beim Segmentwechsel nie kurzzeitig ein Element zu viel existiert —
    // genau dieser eine Frame würde auf iOS den neuen Clip stumm scheitern lassen.
    const budget = isMobile();
    if (budget) {
      for (let i = 0; i < NSEG; i++) if (Math.abs(i - ci) > CLIP_WINDOW) releaseClip(SEGMENTS[i]);
    }

    for (let i = 0; i < NSEG; i++) {
      const s = SEGMENTS[i];
      const near = y > s.start - 1.6 * vh && y < s.end + 1.6 * vh;
      if (near) fetchClip(s);
      if (budget ? Math.abs(i - ci) <= CLIP_WINDOW : near) attachClip(s);
      const local = clamp((y - s.start) / (s.end - s.start), 0, 1);
      s.target = s.linger ? lingerEase(local, s.linger) : local;
      let outside = 0;
      // LOKALE ANPASSUNG (Domvesta /welt): Die letzte Szene NICHT ausblenden, wenn
      // darüber hinaus gescrollt wird. Der Track ist absichtlich 1vh höher als die
      // Segmente ("+1vh so the last flight completes"); ohne diese Ausnahme fadet
      // die Schlussszene nach crossfade*vh auf 0 und man sieht bis zum Epilog nur
      // leeren Himmel. So bleibt das Schlussbild stehen, bis der Epilog darüber
      // schiebt. Betrifft ausschließlich das letzte Segment.
      if (y < s.start) outside = s.start - y;
      else if (y > s.end && i < NSEG - 1) outside = y - s.end;
      const op = smooth(1 - outside / fade);
      s.el.style.opacity = op; s.visible = op > 0.001;
      s.el.style.zIndex = (i === ci) ? '120' : String(100 + Math.round(op * 10));
      if (!s.hasClip || !s.ready) {
        const sc = reduce ? 1 : 1.03 + local * 0.14;
        s.img.style.transform = `translateX(${stageX - 2}vw) scale(${sc.toFixed(3)})`;
      }
    }

    for (let i = 0; i < N; i++) {
      const seg = SECTIONS[i]._seg;
      const pr = clamp((y - seg.start) / (seg.end - seg.start), 0, 1);
      const before = y < seg.start, after = y > seg.end;
      let cop;
      if (i === 0) cop = after ? 0 : smooth(1 - pr / 0.62);            // greets on landing
      else if (i === N - 1) cop = before ? 0 : smooth(pr / 0.4);       // holds CTA at the end
      else cop = (before || after) ? 0 : smooth(1 - Math.abs(pr - 0.5) / 0.5);
      const c = copies[i];
      c.style.opacity = cop;
      c.style.transform = reduce ? 'none' : `translateY(${(0.5 - pr) * 4}vh)`;
      c.style.pointerEvents = cop > 0.5 ? 'auto' : 'none';
    }

    const cur = SEGMENTS[ci];
    const near = clamp(cur.kind === 'dive' ? cur.si
      : (((y - cur.start) / (cur.end - cur.start)) > 0.5 ? cur.si + 1 : cur.si), 0, N - 1);
    if (near !== activeIndex) {
      activeIndex = near;
      dots.forEach((d, k) => d.classList.toggle('is-active', k === near));
      nav.querySelectorAll('.sw-nav__item').forEach((n, k) => n.classList.toggle('is-active', k === near));
      container.style.setProperty('--sw-accent', SECTIONS[near].accent || '');
    }
    if (SNAP && SNAP.touch) setNoPan(y < exitY - 2);
    scrollbarFill.style.transform = `scaleX(${clamp(y / (totalW * vh))})`;
    hint.style.opacity = clamp(1 - y / (0.5 * vh));
    if (particles) particles.style.transform = `translate3d(0, ${-y * 0.05}px, 0)`;
    ticking = false;
  }

  // FIX (Geräte-Report 2026-08-11, iPhone/CriOS): Seeks können in WebKit
  // VERKLEMMEN — `seeking` blieb dort über Sekunden bis Minuten true (conn1 war
  // über drei Flüge hinweg ein Zombie und musste an jedem tstart neu geprimt
  // werden). Der alte Guard "nie einen neuen Seek anstoßen, solange der alte
  // läuft" wurde damit zur Endlosschleife: die raf-Schleife übersprang das
  // Element für den GANZEN Flug, die Szene stand — "nur ein Frame zwischen den
  // Sections". Deshalb der Watchdog: hängt ein Seek länger als SEEK_STALL,
  // wird er neu angestoßen (currentTime mitten in einem pending seek ist legal
  // und startet den Seek-Algorithmus neu). Ein Wedge kostet so maximal ~0,4 s
  // statt des ganzen Flugs.
  const SEEK_STALL = 400;
  function raf(now) {
    const eps = isMobile() ? 0.02 : 0.008;   // coarser seek step on phones = fewer decodes
    // Zweiter Befund aus demselben Report: der iOS-Media-Stack serialisiert
    // Seeks über Elemente hinweg. Liefen 3-4 gleichzeitig (Scrub auf zwei
    // sichtbaren Clips + Metadata-Seeks frisch angehängter), verhungerten
    // einzelne komplett — die Flüge mit seeks=1/2 hatten alle mehrere parallele
    // Seeker, die mit seeks=55/91 nicht. Deshalb auf Telefonen: höchstens 2
    // Elemente gleichzeitig im Seek, und Sichtbares (pass 0) ist zuerst dran,
    // damit der gerade gescrubbte Clip nie hinter unsichtbarem Settling ansteht.
    let busy = 0;
    if (isMobile()) {
      for (let i = 0; i < NSEG; i++) { const v = SEGMENTS[i].video; if (v && v.seeking) busy++; }
    }
    for (let pass = 0; pass < 2; pass++) {
      for (let i = 0; i < NSEG; i++) {
        const s = SEGMENTS[i];
        if ((pass === 0) !== !!s.visible) continue;
        if (!s.hasClip || !s.ready || !s.video) continue;
        // Never queue a seek while the decoder is still resolving the last one.
        // On phones a fast flick would otherwise pile up seeks and freeze the clip;
        // cur keeps lerping, so we snap to the latest target the moment it's free.
        if (s.video.seeking) {
          if (now - s.seekAt > SEEK_STALL) {
            s.seekAt = now;
            try { s.video.currentTime = clamp(s.cur, 0, 0.999) * (s.video.duration || 1); } catch (e) {}
            dlog('rekick ' + s.kind + s.si);
          }
          continue;
        }
        if (!s.visible && Math.abs(s.cur - s.target) < 0.002) continue;
        if (isMobile() && busy >= 2) continue;
        s.cur += (s.target - s.cur) * (reduce ? 1 : 0.18);
        const dur = s.video.duration || 1;
        const t = clamp(s.cur, 0, 0.999) * dur;
        const d = Math.abs(s.video.currentTime - t);
        if (d <= eps) continue;
        // FIX (iOS, gehört zum -g-4-Re-Encode der m/-Kette): ein exakter
        // currentTime-Seek flusht in WebKit die Decoder-Pipeline und dekodiert
        // dann vom letzten Keyframe bis zum Zielframe durch. Bei GOP 20 und
        // Flugtempo schaffte ein iPhone so nur ein paar Frames pro Sekunde —
        // der Kameraflug war eine Diashow, während derselbe Code am Desktop
        // butterweich lief. fastSeek() springt stattdessen auf den nächsten
        // Keyframe: mit -g 4 maximal 2 Frames (~83 ms Film) daneben, bei rund
        // 4-fachem Zeitraffer unsichtbar. Erst nahe am Ziel (< 0,25 s) wird
        // wieder exakt gesetzt, damit der Halt auf dem präzisen Seam-Frame
        // landet. Blink kennt kein fastSeek und bleibt auf dem alten Pfad.
        try {
          if (d > 0.25 && isMobile() && s.video.fastSeek) s.video.fastSeek(t);
          else s.video.currentTime = t;
          s.seekAt = now;
          busy++;
          if (dbg) dbgSeeks++;
        } catch (e) {}
      }
    }
    requestAnimationFrame(raf);
  }

  // iOS needs a user gesture before a muted video will decode/paint reliably.
  //
  // FIX (iOS, Geräte-Report 2026-08-09 23:35): "beim ersten Touch primen" reicht
  // NICHT. Die Erlaubnis gibt WebKit nur einem play() im Gesten-Kontext — und
  // die alte Fassung primte ausschließlich bei der ALLERERSTEN Geste (once:true)
  // die bis dahin angehängten Videos. Jedes später angehängte Element verließ
  // sich auf sein loadeddata-Priming, aber loadeddata feuert erst NACH dem
  // ersten dekodierten Frame — den es ohne Erlaubnis nie gibt. Henne-Ei: der
  // erzwungene Metadata-Seek wird nie fertig, seeking bleibt für immer true,
  // die raf-Schleife überspringt das Element ewig (Report: seeks=0 auf jedem
  // Flug, meta ohne data/frame). Auf schnellem Netz maskiert (Videos hängen
  // vor der ersten Geste im DOM und werden in ihr geprimt — der eine
  // "Zufallstreffer"), auf langsamem Netz systematisch.
  // Deshalb primt jetzt JEDE Geste (Listener bleiben dran) alle Videos, die
  // noch keinen Frame gezeigt haben oder im seeking-Deadlock stecken — Gesten
  // gibt es auf einer Scroll-Seite im Sekundentakt.
  //
  // NACHSCHÄRFUNG (Geräte-Report 2026-08-11): das Priming selbst war ein
  // Störer. (1) pointerdown UND touchstart feuern für dieselbe Geste — der
  // Doppel-play() erzeugte die AbortError-Paare im Report. (2) "oder seeking"
  // traf auch Videos, die nur gerade gesund mitten im Scrub steckten — die
  // bekamen an jedem tstart einen Play/Pause-Zyklus übergebraten (Report:
  // "prime ok conn1" an jedem Gestenstart, während conn1 hätte scrubben
  // sollen). Jetzt: nur nie-gemalte Elemente oder echte Zombies (> 500 ms im
  // Seek verklemmt), ein Zyklus pro Element zur Zeit, eine Priming-Runde pro
  // Geste. (3) Der Re-Seek direkt im pause()-Tick war Teil des Wedge-Musters —
  // stattdessen seekAt=0: der Watchdog in raf() setzt im nächsten Frame neu
  // an, außerhalb des Pause-Ticks.
  function primeVideo(v, s) {
    if (!isMobile() || !v) return;
    if (s) {
      // Ein hängendes play()-Promise (kommt vor, wenn WebKit das Element nie
      // freigibt) darf spätere Rettungsversuche nicht ewig blockieren.
      if (s.priming && performance.now() - s.primingAt < 3000) return;
      s.priming = true; s.primingAt = performance.now();
    }
    try {
      const p = v.play();
      if (p && p.then) {
        p.then(() => {
          try { v.pause(); } catch (e) {}
          if (s) {
            s.priming = false;
            dlog('prime ok ' + s.kind + s.si);
            if (s.video === v) s.seekAt = 0;   // Watchdog: im nächsten Frame frisch seeken
          }
        }).catch(err => { if (s) { s.priming = false; } dlog('prime FAIL ' + (s ? s.kind + s.si : '?') + ' ' + (err && err.name)); });
      } else if (s) s.priming = false;
    } catch (e) { if (s) s.priming = false; }
  }
  function primePending() {
    const n = performance.now();
    for (let i = 0; i < NSEG; i++) {
      const s = SEGMENTS[i];
      if (!s.video) continue;
      if (!s.el.classList.contains('has-clip') || (s.video.seeking && n - s.seekAt > 500)) primeVideo(s.video, s);
    }
  }
  let gestureAt = 0;
  function onGesture() {
    const n = performance.now();
    if (n - gestureAt < 80) return;   // pointerdown+touchstart derselben Geste
    gestureAt = n;
    primePending();
  }
  window.addEventListener('pointerdown', onGesture, { passive: true });
  window.addEventListener('touchstart', onGesture, { passive: true });

  // ---- snap input: wheel / touch / keys --------------------------------------
  let acc = 0, accAt = 0;
  function onWheel(e) {
    if (e.ctrlKey) return;                                   // pinch-zoom stays the browser's
    // Über dem Debug-HUD/Report gehört das Rad dem Overlay (Textarea scrollen),
    // nicht dem Snap — sonst blättert jeder Scrollversuch im Report die Welt um.
    if (dbg && e.target && e.target.closest && e.target.closest('.sw-dbg')) return;
    const dir = e.deltaY > 0 ? 1 : e.deltaY < 0 ? -1 : 0;
    if (!dir || !hijack(dir)) return;
    if (e.cancelable) e.preventDefault();
    const now = performance.now();
    // During a flight (and briefly after) everything is swallowed: one trackpad
    // flick emits wheel events for most of a second, and each of them would
    // otherwise book another section.
    if (fly || now < coolUntil) { acc = 0; accAt = now; return; }
    // deltaMode 1 = lines (Firefox on Windows/Linux), 2 = pages.
    const dy = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaMode === 2 ? e.deltaY * vh : e.deltaY;
    if (now - accAt > 220) acc = 0;                          // new gesture
    accAt = now; acc += dy;
    if (Math.abs(acc) < SNAP.wheelThreshold) return;         // stray trackpad twitch
    acc = 0;
    snapStep(dir);
  }

  // Touch: the world follows the finger for a fraction of the distance (so the drag
  // feels alive and reversible) and the release either completes the flight or
  // settles back. Direction is decided on the first move — after that iOS won't let
  // us take the gesture back anyway.
  //
  // FIX (iOS): "danach lässt sich die Geste ohnehin nicht mehr zurückholen" ist
  // wörtlicher gemeint, als es aussah. WebKit entscheidet beim ERSTEN touchmove,
  // das ohne preventDefault durchläuft, dass diese Geste nativ scrollt; ab da sind
  // alle weiteren touchmove-Events non-cancelable und preventDefault() wirkungslos.
  // Genau das passierte hier: der erste Move (<6px, Richtung noch unklar) lief
  // durch, danach scrollte die Seite nativ, unser window.scrollTo kämpfte dagegen
  // und der Momentum-Scroll nach dem Loslassen brach über den scroll-Listener
  // sofort jeden Snap-Flug ab. Am Desktop (auch in den DevTools) gibt es diese
  // Regel nicht — deshalb funktionierte es dort. Zwei Gegenmaßnahmen:
  //   1. tOwn: innerhalb der Welt gehört uns jede Geste, also schon der allererste
  //      Move preventDefault — dann kommt WebKit gar nicht erst in den Scroll-Modus.
  //   2. .sw-nopan (touch-action, siehe setNoPan) als robuster Riegel davor.
  let tLock = 0, tOwn = false, tY0 = 0, tX0 = 0, tT0 = 0, tBase = 0, tDy = 0, tMoved = 0;
  function onTouchStart(e) {
    // Gesten, die auf dem Debug-HUD/Report beginnen, bleiben beim Browser: dort
    // muss markiert, gescrollt und getippt werden können. Ohne diese Ausnahme
    // preventDefault-et onTouchMove jede Kopier-/Scrollgeste im Report-Overlay —
    // genau daran ist der Report-Export auf dem Telefon gescheitert.
    if (dbg && e.target && e.target.closest && e.target.closest('.sw-dbg')) { tLock = -1; return; }
    tLock = (e.touches.length === 1) ? 0 : -1;
    if (tLock < 0) return;
    // Nur strikt INNERHALB der Welt vorab beanspruchen. Genau am Ausgang gehört
    // uns nur die Aufwärtsgeste — dort muss die Abwärtsgeste nativ in den Epilog
    // scrollen dürfen, also erst die Richtung abwarten.
    tOwn = hijack(1);
    tY0 = e.touches[0].clientY; tX0 = e.touches[0].clientX;
    tT0 = performance.now(); tDy = 0; tBase = scrollPos(); tMoved = 0;
    dlog('tstart tOwn=' + (tOwn ? 1 : 0) + ' y=' + Math.round(tBase));
  }
  function onTouchMove(e) {
    if (tLock < 0 || e.touches.length !== 1) return;
    const t = e.touches[0], dy = t.clientY - tY0, dx = t.clientX - tX0;
    if (!tLock) {
      if (tOwn && e.cancelable) e.preventDefault();
      // Der erste Move entscheidet in WebKit, wem die Geste gehört — genau die
      // Werte, an denen jede iOS-Fehlersuche hängt, deshalb einmal pro Geste.
      if (tMoved === 0) dlog('tmove1 cancelable=' + (e.cancelable ? 1 : 0) + ' prevented=' + (e.defaultPrevented ? 1 : 0));
      tMoved++;
      if (Math.abs(dy) < 6 && Math.abs(dx) < 6) return;      // direction still unclear
      if (Math.abs(dx) > Math.abs(dy) || !hijack(dy < 0 ? 1 : -1)) { tLock = -1; dlog('t released (horiz/exit)'); return; }
      tLock = 1; cancelFly();
      dlog('t locked ' + (dy < 0 ? 'fwd' : 'back'));
      tY0 = t.clientY; tT0 = performance.now(); tBase = scrollPos();
      return;
    }
    if (e.cancelable) e.preventDefault();
    tDy = t.clientY - tY0;
    const next = tDy < 0 ? stopAfter(tBase) : stopBefore(tBase);
    const room = (next == null) ? 0 : Math.abs(next - tBase) * 0.38;
    pushSet(Math.round(clamp(tBase + clamp(-tDy * SNAP.drag, -room, room), 0, maxScroll())));
    window.scrollTo(0, setY);
  }
  function onTouchEnd() {
    if (tLock !== 1) { tLock = 0; return; }
    tLock = 0;
    const v = Math.abs(tDy) / Math.max(1, performance.now() - tT0);   // px/ms
    dlog('tend dy=' + Math.round(tDy) + ' v=' + v.toFixed(2));
    if ((Math.abs(tDy) > 46 || v > 0.35) && snapStep(tDy < 0 ? 1 : -1)) return;
    flyTo(tBase, 420);                                       // not enough — settle back
  }

  function onKey(e) {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const t = e.target, tag = t && t.tagName;
    if (t && (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || t.isContentEditable)) return;
    const k = e.key;
    const space = (k === ' ' || k === 'Spacebar');
    if (space && (tag === 'BUTTON' || tag === 'A')) return;  // space activates the control
    let dir = 0, to = null;
    if (k === 'ArrowDown' || k === 'PageDown') dir = 1;
    else if (k === 'ArrowUp' || k === 'PageUp') dir = -1;
    else if (space) dir = e.shiftKey ? -1 : 1;
    else if (k === 'Home') to = 0;
    else if (k === 'End') to = exitY;
    else return;
    if (to != null) { e.preventDefault(); cancelFly(); flyTo(to); return; }
    if (!hijack(dir)) return;
    e.preventDefault();
    if (fly || performance.now() < coolUntil) return;
    snapStep(dir);
  }

  if (SNAP) {
    window.addEventListener('wheel', onWheel, { passive: false });
    if (SNAP.keys) window.addEventListener('keydown', onKey);
    if (SNAP.touch) {
      window.addEventListener('touchstart', onTouchStart, { passive: true });
      window.addEventListener('touchmove', onTouchMove, { passive: false });
      window.addEventListener('touchend', onTouchEnd, { passive: true });
      window.addEventListener('touchcancel', onTouchEnd, { passive: true });
    }
  }

  // Particles are a per-frame cost we can't afford alongside video scrubbing on a phone.
  seedParticles(particles, reduce || coarse);
  window.addEventListener('scroll', () => {
    // Scrollbar drag, in-page search, browser restore: something moved the page
    // that isn't our flight. Hand it back instead of fighting over the position.
    if (fly && !ownScroll(scrollPos())) { dlog('fly overrun y=' + Math.round(scrollPos()) + ' hist=' + setHist.join(',')); cancelFly(); }
    if (!ticking) { ticking = true; requestAnimationFrame(read); }
  }, { passive: true });
  // Mobile browsers fire `resize` every time the URL bar slides in/out. Re-running
  // layout() there rebuilds the track height and yanks the scroll position, so on
  // touch we ignore height-only changes and only relayout when the width actually
  // changes (rotation still comes through orientationchange). layout() records the
  // width it laid out at.
  function onResize() {
    if (coarse && window.innerWidth === laidOutW) return;
    layout();
  }
  window.addEventListener('resize', onResize);
  window.addEventListener('orientationchange', layout);
  window.addEventListener('load', layout);
  layout();
  requestAnimationFrame(raf);

  // Telefone: der near-Radius (±1,6 vh) ist auf Desktop-Bandbreite gerechnet.
  // Er fordert jeden Connector erst beim Eintreffen am vorigen Halt an — auf
  // Mobilfunk sind die verbleibenden ~1–2 s bis zum Abflug zu wenig, der Clip
  // ist beim Durchflug nicht da und die Szene steht still, obwohl der Besucher
  // insgesamt längst genug Zeit auf der Seite verbracht hat (messbar: nach 10 s
  // Verweilen bei Szene 2 waren erst 4 von 9 Clips überhaupt angefordert).
  // Deshalb saugt eine Hintergrund-Queue die ganze Kette in Flugreihenfolge
  // leer — einen Clip zur Zeit, damit die Downloads nicht untereinander um
  // Bandbreite kämpfen und der als Nächstes gebrauchte zuerst fertig wird.
  // fetchClip ist idempotent; near-Anfragen aus read() überholen einfach.
  if (!reduce && isMobile()) {
    const pumpT = setInterval(() => {
      for (let i = 0; i < NSEG; i++) if (SEGMENTS[i].fetching) return;   // einer zur Zeit
      const nxt = SEGMENTS.find(s => !s.url && s.clip && s.fails <= 2);
      if (!nxt) { clearInterval(pumpT); dlog('prefetch done'); return; }
      fetchClip(nxt);
    }, 350);
  }

  // Page code can reuse the same flight for its own links (see index.astro's
  // epilog nav item) instead of teleporting past the whole camera move.
  const api = {
    jumpTo: jumpTo,
    scrollTo: function (y, ms) { if (SNAP) { cancelFly(); flyTo(y, ms); } else window.scrollTo(0, y); },
    stops: function () { return stops.slice(); },
    layout: layout
  };

  // ---- helpers ----
  function el(tag, cls) { const n = document.createElement(tag); if (cls) n.className = cls; return n; }
  function pad(n) { return String(n).padStart(2, '0'); }
  function esc(s) { return String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }
  function ctaBtns(cta) {
    let h = '';
    if (cta.primary) h += `<a class="sw-btn sw-btn--primary" href="${esc(cta.primary.href || '#')}">${esc(cta.primary.label)}</a>`;
    if (cta.secondary) h += `<a class="sw-btn sw-btn--ghost" href="${esc(cta.secondary.href || '#')}">${esc(cta.secondary.label)}</a>`;
    return h;
  }

  return api;
}

// Debug-HUD für die Telefon-Fehlersuche (siehe Kommentar am dbg-Init im Mount).
// Bewusst ohne jede Abhängigkeit von Engine-Zustand: nur eine Statuszeile, ein
// Ringpuffer der letzten Ereignisse und ein Vollreport als <textarea> (der
// versucht, sich selbst in die Zwischenablage zu kopieren — execCommand statt
// navigator.clipboard, weil Letzteres im LAN ohne HTTPS nicht verfügbar ist).
function makeDebugHud(rev) {
  const box = document.createElement('div');
  // .sw-dbg markiert HUD und Report-Overlay für die Gesten-Ausnahmen der Engine
  // (onTouchStart/onWheel): Berührungen hier drin gehören dem Browser.
  box.className = 'sw-dbg';
  box.style.cssText = 'position:fixed;left:8px;top:calc(64px + env(safe-area-inset-top,0px));z-index:2000;' +
    'max-width:80vw;font:10px/1.5 ui-monospace,Menlo,monospace;color:#fff;background:rgba(20,14,8,.85);' +
    'padding:8px 10px;border-radius:10px;pointer-events:none;white-space:pre-wrap;word-break:break-word;';
  const head = document.createElement('div'); head.style.color = '#ffb37a';
  const pre = document.createElement('div');
  const btn = document.createElement('button');
  btn.textContent = 'Report anzeigen';
  btn.style.cssText = 'pointer-events:auto;margin-top:6px;font:inherit;padding:5px 9px;border-radius:6px;border:0;background:#e8651b;color:#fff;';
  const hist = ['ua ' + navigator.userAgent];
  // Volle Historie für Tooling (Headless-Tests, Remote-Inspector): das Panel
  // zeigt nur die letzten 12 Zeilen, der Report und __swlog haben alles.
  window.__swlog = hist;
  // Report-Export. Die alte Fassung (textarea + select() + execCommand beim
  // Öffnen, Schließen bei blur) war auf iOS unbrauchbar: WebKit selektiert
  // readonly-Textareas nicht zuverlässig, die Engine-Touch-Handler haben jede
  // Markier-/Scrollgeste im Overlay preventDefault-et, und der erste Tap
  // daneben (= blur) hat das Overlay sofort wieder abgeräumt. Deshalb jetzt
  // explizite Buttons: Clipboard-API (braucht HTTPS — auf domvesta.de gegeben;
  // vom iPhone aus landet der Text per Universal Clipboard direkt auf dem Mac),
  // Share-Sheet (AirDrop/Notizen/Mail — der robusteste iOS-Weg), execCommand
  // nur noch als Fallback fürs LAN ohne HTTPS. Schließen nur per Button.
  btn.addEventListener('click', () => {
    const text = 'rev ' + rev + '\n' + head.textContent + '\n' + hist.join('\n');
    const wrap = document.createElement('div');
    wrap.className = 'sw-dbg';
    wrap.style.cssText = 'position:fixed;inset:4vh 4vw calc(4vh + env(safe-area-inset-bottom,0px));z-index:2001;' +
      'display:flex;flex-direction:column;gap:8px;';
    const ta = document.createElement('textarea');
    ta.value = text; ta.readOnly = true;
    ta.style.cssText = 'flex:1;min-height:0;font:12px/1.4 ui-monospace,Menlo,monospace;background:#fff;color:#2a1c10;' +
      'border:2px solid #2a1c10;border-radius:12px;padding:10px;resize:none;' +
      '-webkit-user-select:text;user-select:text;overscroll-behavior:contain;';
    const row = document.createElement('div');
    row.style.cssText = 'display:flex;gap:8px;';
    const mkBtn = (label) => {
      const b = document.createElement('button');
      b.type = 'button'; b.textContent = label;
      b.style.cssText = 'flex:1;font:600 13px/1 -apple-system,system-ui,sans-serif;padding:13px 8px;' +
        'border-radius:8px;border:0;background:#e8651b;color:#fff;';
      row.appendChild(b);
      return b;
    };
    const copyB = mkBtn('Kopieren');
    copyB.addEventListener('click', () => {
      const done = ok => { copyB.textContent = ok ? 'Kopiert ✓' : 'Fehler — Text bitte von Hand markieren'; };
      const legacy = () => { try { ta.focus(); ta.select(); done(document.execCommand('copy')); } catch (e) { done(false); } };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => done(true), legacy);
      } else legacy();
    });
    if (navigator.share) {
      mkBtn('Teilen …').addEventListener('click', () => {
        // Abbruch des Share-Sheets wirft — das ist kein Fehler.
        navigator.share({ title: 'Scroll-World Report', text: text }).catch(() => {});
      });
    }
    const closeB = mkBtn('Schließen');
    closeB.style.background = '#6b5742';
    closeB.addEventListener('click', () => wrap.remove());
    wrap.appendChild(ta); wrap.appendChild(row);
    document.body.appendChild(wrap);
  });
  box.appendChild(head); box.appendChild(pre); box.appendChild(btn);
  document.body.appendChild(box);
  return {
    status(s) { head.textContent = 'rev ' + rev + ' | ' + s; },
    log() {
      hist.push((performance.now() / 1000).toFixed(2) + 's ' + Array.prototype.slice.call(arguments).join(' '));
      pre.textContent = hist.slice(-12).join('\n');
    }
  };
}

function seedParticles(host, reduce) {
  if (!host || reduce) return;
  const kinds = ['dot', 'dot', 'ring'];
  const seeds = [7, 23, 41, 58, 71, 88, 12, 34, 52, 66, 83, 95, 18, 29, 47, 63, 77, 91, 5, 38, 55, 69, 82, 97];
  for (let k = 0; k < 20; k++) {
    const s = document.createElement('span');
    s.className = 'sw-pt sw-pt--' + kinds[k % kinds.length];
    s.style.left = seeds[k % seeds.length] + 'vw';
    s.style.top = ((seeds[(k * 3) % seeds.length] * 1.3) % 100) + 'vh';
    s.style.setProperty('--sw-sc', (0.5 + ((seeds[(k * 5) % seeds.length] % 60) / 60) * 1.1).toFixed(2));
    const dur = 14 + (seeds[(k * 7) % seeds.length] % 22);
    s.style.animationDuration = dur + 's';
    s.style.animationDelay = (-(seeds[(k * 2) % seeds.length] % dur)) + 's';
    host.appendChild(s);
  }
}

function injectCSS() {
  if (document.getElementById('sw-css')) return;
  const css = `
  .sw-root{--sw-bg:#F5EDE0;--sw-ink:#241d2b;--sw-ink-soft:#6a6072;--sw-accent:#8a7bb5;
    --sw-font-display:ui-rounded,"SF Pro Rounded","Segoe UI",system-ui,sans-serif;
    --sw-font-body:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,system-ui,sans-serif;
    color:var(--sw-ink);font-family:var(--sw-font-body);}
  html,body{margin:0;background:var(--sw-bg,#F5EDE0);overflow-x:hidden;}
  .sw-sky{position:fixed;inset:0;z-index:0;overflow:hidden;pointer-events:none;background:var(--sw-bg);}
  .sw-sky__grad{position:absolute;inset:-10%;background:linear-gradient(178deg,color-mix(in srgb,var(--sw-accent) 12%,var(--sw-bg)) 0%,var(--sw-bg) 55%,color-mix(in srgb,var(--sw-accent) 6%,var(--sw-bg)) 100%);}
  .sw-sky__glow{position:absolute;inset:0;background:radial-gradient(60% 42% at 74% 16%,color-mix(in srgb,var(--sw-accent) 22%,transparent),transparent 70%),radial-gradient(46% 34% at 50% 50%,color-mix(in srgb,#fff 45%,transparent),transparent 70%);}
  .sw-particles{position:absolute;inset:-6% -2%;will-change:transform;}
  .sw-pt{position:absolute;width:13px;height:13px;transform:scale(var(--sw-sc,1));opacity:0;animation:sw-drift linear infinite;}
  .sw-pt::before{content:"";position:absolute;inset:0;border-radius:50%;}
  .sw-pt--dot::before{background:radial-gradient(circle at 34% 30%,color-mix(in srgb,var(--sw-accent) 60%,#000),#000 82%);}
  .sw-pt--ring::before{background:transparent;border:2px solid color-mix(in srgb,var(--sw-accent) 55%,transparent);}
  @keyframes sw-drift{0%{opacity:0;transform:scale(var(--sw-sc)) translate(0,12vh) rotate(0)}12%{opacity:.5}88%{opacity:.45}100%{opacity:0;transform:scale(var(--sw-sc)) translate(4vw,-22vh) rotate(210deg)}}
  .sw-scrollbar{position:fixed;top:0;left:0;right:0;height:3px;z-index:60;background:color-mix(in srgb,var(--sw-accent) 14%,transparent);}
  .sw-scrollbar span{display:block;height:100%;width:100%;transform-origin:0 50%;transform:scaleX(0);background:var(--sw-accent);}
  .sw-topbar{position:fixed;top:0;left:0;right:0;z-index:50;display:flex;align-items:center;justify-content:space-between;gap:16px;padding:clamp(14px,2.4vw,26px) clamp(18px,5vw,64px);}
  .sw-brand{display:flex;align-items:center;gap:10px;text-decoration:none;color:var(--sw-ink);}
  .sw-brand__mark{width:24px;height:28px;border-radius:7px 7px 10px 10px;background:linear-gradient(160deg,var(--sw-accent),color-mix(in srgb,var(--sw-accent) 60%,#000));box-shadow:0 6px 14px color-mix(in srgb,var(--sw-accent) 40%,transparent);}
  .sw-brand__name{font-family:var(--sw-font-display);font-weight:700;font-size:1.1rem;}
  .sw-nav{display:flex;gap:4px;padding:5px;background:color-mix(in srgb,#fff 55%,transparent);backdrop-filter:blur(10px);border:1px solid color-mix(in srgb,var(--sw-accent) 16%,transparent);border-radius:999px;}
  .sw-nav__item{font:inherit;font-size:.82rem;color:var(--sw-ink-soft);border:0;background:transparent;cursor:pointer;padding:7px 14px;border-radius:999px;transition:color .25s,background .25s;}
  .sw-nav__item:hover{color:var(--sw-ink);} .sw-nav__item.is-active{color:#fff;background:var(--sw-accent);}
  .sw-topcta{text-decoration:none;font-weight:600;font-size:.9rem;color:#fff;background:var(--sw-ink);padding:10px 20px;border-radius:999px;white-space:nowrap;}
  .sw-stage{position:fixed;inset:0;z-index:10;pointer-events:none;}
  .sw-scene{position:absolute;inset:0;opacity:0;overflow:hidden;will-change:opacity;}
  .sw-scene__video,.sw-scene__still{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center 42%;}
  .sw-scene__still{will-change:transform;} .sw-scene.has-clip .sw-scene__still{opacity:0;} .sw-scene__video{z-index:1;}
  .sw-copylayer{position:fixed;inset:0;z-index:20;pointer-events:none;}
  .sw-copylayer::before{content:"";position:absolute;inset:0;width:min(58vw,780px);background:linear-gradient(90deg,var(--sw-bg) 0%,color-mix(in srgb,var(--sw-bg) 82%,transparent) 34%,color-mix(in srgb,var(--sw-bg) 40%,transparent) 62%,transparent 100%);}
  .sw-copy{position:absolute;left:clamp(18px,5vw,64px);top:50%;transform:translateY(-50%);width:min(42vw,460px);opacity:0;will-change:opacity,transform;}
  .sw-copy__num{font-family:ui-monospace,Menlo,monospace;font-size:.74rem;letter-spacing:.12em;color:var(--sw-ink-soft);}
  .sw-copy__eyebrow{display:block;margin-top:18px;font-family:var(--sw-font-display);font-weight:700;font-size:.8rem;letter-spacing:.16em;text-transform:uppercase;color:var(--sw-accent);}
  .sw-copy__title{font-family:var(--sw-font-display);font-weight:700;color:var(--sw-ink);font-size:clamp(2rem,4.4vw,3.5rem);line-height:1.03;margin:12px 0 0;letter-spacing:-.01em;text-shadow:0 2px 20px color-mix(in srgb,var(--sw-bg) 70%,transparent);}
  .sw-copy__body{margin-top:18px;font-size:clamp(1rem,1.25vw,1.14rem);line-height:1.55;color:color-mix(in srgb,var(--sw-ink) 78%,var(--sw-ink-soft));max-width:40ch;text-shadow:0 1px 12px color-mix(in srgb,var(--sw-bg) 90%,transparent);}
  .sw-copy__tags{list-style:none;display:flex;flex-wrap:wrap;gap:8px;margin:24px 0 0;padding:0;}
  .sw-copy__tags li{font-size:.82rem;font-weight:600;color:color-mix(in srgb,var(--sw-accent) 70%,#000);padding:7px 14px;border-radius:999px;background:color-mix(in srgb,var(--sw-accent) 14%,#fff);border:1px solid color-mix(in srgb,var(--sw-accent) 30%,transparent);}
  .sw-copy__cta{display:flex;flex-wrap:wrap;gap:12px;margin-top:28px;pointer-events:auto;}
  .sw-btn{text-decoration:none;font-weight:600;font-size:.95rem;padding:13px 24px;border-radius:999px;transition:transform .2s;}
  .sw-btn--primary{color:#fff;background:var(--sw-ink);} .sw-btn--primary:hover{transform:translateY(-2px);}
  .sw-btn--ghost{color:var(--sw-ink);border:1.5px solid color-mix(in srgb,var(--sw-ink) 25%,transparent);} .sw-btn--ghost:hover{transform:translateY(-2px);}
  .sw-route{position:fixed;right:clamp(14px,2.4vw,30px);top:50%;z-index:40;transform:translateY(-50%);display:flex;flex-direction:column;gap:22px;padding:18px 10px;}
  .sw-route::before{content:"";position:absolute;left:50%;top:22px;bottom:22px;width:2px;transform:translateX(-50%);background:var(--sw-accent);opacity:.28;}
  .sw-route__dot{position:relative;border:0;background:transparent;cursor:pointer;width:14px;height:14px;display:grid;place-items:center;}
  .sw-route__dot i{width:9px;height:9px;border-radius:50%;background:color-mix(in srgb,var(--sw-accent) 40%,transparent);transition:transform .3s,background .3s,box-shadow .3s;}
  .sw-route__dot:hover i{transform:scale(1.25);background:var(--sw-accent);}
  .sw-route__dot.is-active i{background:var(--sw-accent);transform:scale(1.4);box-shadow:0 0 0 5px color-mix(in srgb,var(--sw-accent) 22%,transparent);}
  .sw-route__label{position:absolute;right:24px;top:50%;transform:translateY(-50%) translateX(6px);white-space:nowrap;font-size:.78rem;font-weight:600;color:var(--sw-ink);background:color-mix(in srgb,#fff 85%,transparent);backdrop-filter:blur(6px);padding:5px 11px;border-radius:999px;opacity:0;pointer-events:none;transition:opacity .25s,transform .25s;border:1px solid color-mix(in srgb,var(--sw-accent) 14%,transparent);}
  .sw-route__dot:hover .sw-route__label,.sw-route__dot.is-active .sw-route__label{opacity:1;transform:translateY(-50%) translateX(0);}
  .sw-hint{position:fixed;left:50%;bottom:26px;z-index:30;transform:translateX(-50%);display:flex;flex-direction:column;align-items:center;gap:10px;font-size:.76rem;letter-spacing:.14em;text-transform:uppercase;color:var(--sw-ink-soft);transition:opacity .3s;}
  .sw-hint i{width:22px;height:34px;border-radius:12px;border:2px solid color-mix(in srgb,var(--sw-ink) 28%,transparent);position:relative;}
  .sw-hint i::after{content:"";position:absolute;left:50%;top:7px;width:4px;height:7px;border-radius:2px;background:var(--sw-accent);transform:translateX(-50%);animation:sw-wheel 1.7s ease-in-out infinite;}
  @keyframes sw-wheel{0%{opacity:0;top:6px}40%{opacity:1}100%{opacity:0;top:17px}}
  .sw-track{position:relative;z-index:1;width:100%;pointer-events:none;}
  /* Animations-Schalter: nur für Nutzer mit prefers-reduced-motion im DOM.
     Oben links unter der Topbar — der ruhigste Platz während der ganzen Tour
     (Route rechts, Copy unten/links-mittig, Hint unten mittig) und dauerhaft
     erreichbar, damit der Rückweg ("ausschalten") nie verloren geht.
     z44: über Stage/Copy/Route, unter Topbar (50) und Epilog (45 in der Seite —
     im Epilog verschwindet der Schalter wie die übrige Welt-UI). */
  .sw-motion{position:fixed;left:clamp(14px,3vw,28px);top:calc(clamp(66px,10vh,96px) + env(safe-area-inset-top,0px));z-index:44;font-family:var(--sw-font-body);font-size:.78rem;font-weight:600;color:var(--sw-ink);background:color-mix(in srgb,#fff 82%,transparent);border:1px solid color-mix(in srgb,var(--sw-accent) 35%,transparent);border-radius:999px;padding:8px 14px;cursor:pointer;box-shadow:0 4px 14px color-mix(in srgb,var(--sw-ink) 14%,transparent);}
  .sw-motion::before{content:"✦";color:var(--sw-accent);margin-right:7px;}
  .sw-motion:hover{background:#fff;}
  .sw-motion:focus-visible{outline:3px solid var(--sw-ink);outline-offset:2px;}
  /* Snappy scroll auf Touch: solange die Klasse steht, pannt der Browser nicht
     selbst vertikal — die Flüge kommen ausschließlich aus onTouchMove/flyTo.
     Wird von setNoPan() ab dem Ausgang der Welt wieder entfernt. */
  html.sw-nopan,html.sw-nopan body{touch-action:pan-x pinch-zoom;overscroll-behavior-y:none;}
  @media (max-width:860px){
    .sw-nav{display:none;}
    .sw-copylayer::before{width:100%;height:60%;top:auto;bottom:0;background:linear-gradient(0deg,var(--sw-bg) 8%,color-mix(in srgb,var(--sw-bg) 70%,transparent) 46%,transparent 100%);}
    /* Anchor copy to the bottom, clear of the home indicator / collapsing URL bar.
       dvh + env() are progressive: browsers that lack them keep the vh fallback line. */
    .sw-copy{left:clamp(18px,5vw,64px);right:clamp(18px,5vw,64px);top:auto;bottom:clamp(64px,14vh,120px);transform:none;width:auto;max-width:560px;}
    .sw-copy{bottom:calc(clamp(56px,12dvh,110px) + env(safe-area-inset-bottom));}
    .sw-copy__title{font-size:clamp(1.9rem,7.5vw,2.7rem);}
    .sw-copy__body{max-width:none;font-size:clamp(.98rem,3.6vw,1.1rem);} .sw-scene__video,.sw-scene__still{object-position:center 46%;}
    .sw-hint{bottom:calc(20px + env(safe-area-inset-bottom));}
    .sw-route{gap:16px;right:6px;} .sw-route__label{display:none;}
  }
  /* Portrait phones crop a 16:9 clip hard; keep the framing centred so the focal
     subject (which the camera dives toward) stays in view. */
  @media (max-width:860px) and (orientation:portrait){
    .sw-scene__video,.sw-scene__still{object-position:center 44%;}
  }
  /* Touch: give the route dots a finger-sized hit area without growing the visible dot. */
  @media (hover:none) and (pointer:coarse){
    .sw-route{padding:14px 6px;}
    .sw-route__dot{width:28px;height:28px;}
    .sw-btn{padding:15px 26px;}
  }
  @media (prefers-reduced-motion:reduce){ .sw-hint i::after{animation:none;} .sw-pt{display:none;} }
  `;
  // Wrap in a cascade layer so the page's own theme tokens (unlayered
  // :root / .sw-root { --sw-bg / --sw-ink / --sw-accent … }) always win over
  // these defaults, regardless of injection order. Enables clean dark themes.
  const style = document.createElement('style'); style.id = 'sw-css';
  style.textContent = '@layer sw {\n' + css + '\n}';
  document.head.appendChild(style);
}

// Expose for module + global use.
if (typeof module !== 'undefined' && module.exports) module.exports = { mountScrollWorld };
if (typeof window !== 'undefined') window.mountScrollWorld = mountScrollWorld;
