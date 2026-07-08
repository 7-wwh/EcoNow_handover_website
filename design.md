# EcoNow — Liquid Glass Navigation System
### Design Specification (extracted from `isolated_liquid_glass_navigation_template.html`)

This document captures the full design system used in the navigation template: color tokens, typography, the custom water-droplet cursor, the scroll-morphing liquid nav, the mobile dropdown, the scroll progress "burn rail," and all animation timing/easing values — with exact property names so it can be reused or extended consistently across other EcoNow pages.

---

## 1. Design Concept

The navigation simulates a **viscous, translucent liquid** (evoking melted candle wax / glass) that:
- Floats as a pill-shaped bar and morphs out of a spread header bar on scroll.
- Stretches asymmetrically like a droplet when the active-tab indicator slides between links.
- Adapts its tint (light vs. dark glass) depending on what's behind it.
- Drips open/closed on mobile like a hanging bead of liquid.
- Is accompanied by a custom cursor that behaves like a trailing water droplet, and a candle "burn rail" that tracks scroll progress by melting down a wick.

---

## 2. Color Tokens (CSS Custom Properties)

Defined on `:root`:

| Variable | Hex | Usage |
|---|---|---|
| `--ink` | `#241d15` | Primary text / dark ink |
| `--oil` | `#3c2f20` | Secondary dark brown (on-light nav text) |
| `--wick` | `#150f0a` | Near-black, hover state on light backgrounds |
| `--olive` | `#4b5320` | **Primary accent** — active nav indicator, link color, badge borders, focus/hover states |
| `--olive-light` | `#6b7a3f` | Accent highlight — hover tint, headings `em`, secondary emphasis |
| `--olive-pale` | `#a9b380` | Palest accent — text selection background, subtle fills |
| `--wax` | `#c07a2e` | Literal flame color only — candle-flame SVG gradient base, burn-rail flame/fill (kept warm since these render actual fire, not brand color) |
| `--wax-light` | `#e3a758` | Flame mid-tone / glow highlight |
| `--paper` | `#ece2cd` | Light text on dark zones |
| `--paper-deep` | `#ddcfae` | Default nav link/text color (dark zones) |
| `--cream` | `#f6efdf` | Page background |
| `--receipt` | `#fbf6ea` | Receipt-style panel background (used elsewhere in site) |
| `--line` | `rgba(36,29,21,0.16)` | Hairline dividers |

Additional non-root but reused raw colors: chromatic-aberration diffraction edges use `rgba(255,0,80,*)` (magenta/red) and `rgba(0,220,255,*)` (cyan) to fake glass refraction — unaffected by the primary color change since these are optical/glass effects, not brand color.

> **Design decision — primary color change:** the previous system used `--wax` (amber/orange) as both the primary UI accent *and* the literal flame color, since they happened to be the same warm tone. Now that the primary is **dark olive green** (`--olive`), those two roles are split:
> - `--olive` family → all **UI accent** usage: the active pill/dropdown indicator fill, link color, badge borders, hover/focus states.
> - `--wax` family → kept **only** for things that render actual fire (the candle-flame SVG gradient, the burn-rail's flame dot and glowing fill) — these depict flame, not brand identity, so they stay warm-toned regardless of primary color. Flip this if you'd rather have the flame itself go olive too; just say so.
> - `--sage` / `--sage-dark` from the original palette are retired — `--olive` covers that role now at a slightly darker, more saturated value more in line with "dark olive green."



---

## 3. Typography

Loaded via Google Fonts:
- **Big Shoulders Display** (weights 500/700/900) — used for `h1, h2, h3, .label`, brand wordmark. Uppercase, `letter-spacing: 0.02em`.
- **Literata** (italic + weights 400–600, optical sizing 18–144) — body font, `font-family: 'Literata', serif`, base `font-size: 17px`, `line-height: 1.7`.
- **Space Mono** (400/700) — `.mono` utility class, and all nav-link labels / mono-styled UI text (uppercase, letter-spaced).

`::selection` uses `background: var(--olive-pale)`.

---

## 4. Custom Water-Droplet Cursor

### 4.1 Activation rule
Only active on precision pointers:
```css
@media (pointer: fine) {
  html, body, a, button, select, textarea, input, [role="button"], .nav-brand {
    cursor: none !important;
  }
  .water-cursor { display: block !important; }
}
@media (pointer: coarse) {
  .water-cursor { display: none !important; }
}
```

### 4.2 Structure
Built entirely in JS (not markup) as a **10-bead trail** (`numSegments = 10`), appended to a container div in `document.body`.

Each segment (`.water-cursor`):
- `position: fixed`, `28px × 28px`, centered via `margin: -14px`.
- Contains `.water-cursor__lens` (the visible glass circle).
- Segment 0 (head) additionally contains `.water-cursor__ripple` (click splash).

### 4.3 Lens styling (`.water-cursor__lens`)
- `background: rgba(255,255,255,0.005)`
- `backdrop-filter: blur(4px) saturate(160%)`
- Layered `box-shadow` simulating glass refraction:
  - Inset white specular highlight: `inset 1.2px 1.2px 1.8px 0px rgba(255,255,255,0.85)`
  - Inset dark shadow: `inset -1.2px -1.2px 2.2px 0px rgba(0,0,0,0.06)`
  - Red diffraction ring: `0 0 0 0.8px rgba(255,0,80,0.42)`
  - Cyan diffraction ring: `0 0 0 1.6px rgba(0,220,255,0.42)`
  - Dark outer boundary: `0 0 0 0.5px rgba(36,29,21,0.12)`
  - Soft white containment: `0 0 0 2px rgba(255,255,255,0.1)`
  - Drop shadow: `0 6px 15px -4px rgba(21,15,10,0.15)`
  - Ambient cyan glow: `0 0 6px 0.5px rgba(0,210,255,0.12)`
- Transition: `transform 300ms cubic-bezier(0.19,1,0.22,1), background-color 300ms ease, box-shadow 300ms cubic-bezier(0.19,1,0.22,1)`

### 4.4 States
- **`.is-hovering`** (over `a, button, [role="button"], .nav-brand, .liquid-nav__link`): lens scales to `1.4`, deeper blur (`6px`) and saturation (`190%`), intensified shadow ring values.
- **`.is-clicking`** (on `mousedown`): lens scales down to `0.8` (squash), reduced shadow spread.
- **Ripple** (`.water-cursor__ripple`): on click, animates `waterRipple` 500ms `cubic-bezier(0.1,0.8,0.1,1)`:
  ```css
  @keyframes waterRipple {
    0%   { transform: translate(-50%,-50%) scale(0.8); opacity: 0.8; }
    100% { transform: translate(-50%,-50%) scale(2.8); opacity: 0; }
  }
  ```

### 4.5 Trail physics (JS)
Per-segment computed each `requestAnimationFrame` tick:
- **Target**: segment 0 chases `mouseX/mouseY`; each subsequent segment chases the previous segment's position.
- **Lag/delay coefficient**: `0.09` for head, `0.28` for all trailing beads (`seg.x += dx * delay`).
- **Size falloff**: `sizeMultiplier = Math.pow(0.82, i)` — each bead ~82% the size of the one before it.
- **Opacity falloff**: `baseOpacity = Math.pow(0.65, i)` — exponential fade toward the tail.
- **Elastic stretch**: computed from velocity/speed:
  - `maxStretch`: `0.55` (head) / `0.70` (tail)
  - `stretchCoeff`: `0.08` (head) / `0.12` (tail)
  - `scaleX = sizeMultiplier * (1 + stretch)`, `scaleY = sizeMultiplier * (1 - stretch*0.45)`
  - Rotation angle: `Math.atan2(dy, dx) * (180/Math.PI)` — trail orients along movement direction.
- **Speed-based fade**: `movementAlphaModifier = Math.max(0.4, 1 - speed*0.015)` — fast swipes thin out the trail.
- Applied via `transform: translate3d(x, y, 0) rotate(angle) scale(scaleX, scaleY)`.

---

## 5. Liquid Nav (Desktop Floating Pill)

### 5.1 Container — `.liquid-nav`
```
position: fixed; top: 18px; left: 50%;
transform: translateX(-50%) translateY(var(--nav-y,10px)) scale(var(--nav-scale,0.92));
opacity: var(--nav-opacity, 0);
padding: 6px; border-radius: 999px; gap: 2px; display:flex; align-items:center;
```
Glass surface:
- `background-color: rgba(242,201,138,0.02)`
- `backdrop-filter: blur(16px) saturate(240%)`
- Multi-layer `box-shadow` (inset rim, top specular streak, bottom specular streak, inner shadow depth, outer drop shadow):
  ```
  inset 0 0 0 1px rgba(255,255,255,0.15),
  inset 1.5px 2.5px 0px -2px rgba(255,255,255,0.65),
  inset -1.5px -2.5px 0px -2px rgba(255,255,255,0.2),
  inset -0.4px -1px 4px 0px rgba(21,15,10,0.15),
  inset 0px 3px 4px -2px rgba(21,15,10,0.1),
  0px 12px 32px -8px rgba(0,0,0,0.35)
  ```
- Transition: `background-color 280ms ease`

### 5.2 Adaptive contrast — `.liquid-nav.on-light`
Swaps to a darker/subtler glass tint for readability over light page zones:
- `background-color: rgba(36,29,21,0.025)`
- Reduced-intensity box-shadow using `rgba(36,29,21,*)` instead of white/black mixes.

### 5.3 Active indicator — `.liquid-nav__indicator` (the "droplet")
```
position: absolute; top:6px; bottom:6px;
left: var(--left,0px); right: var(--right,100%);
border-radius: 999px;
background-color: color-mix(in srgb, var(--olive) 80%, transparent);
box-shadow: inset 0 0 0 1px rgba(255,255,255,0.3), 0 3px 12px -2px rgba(0,0,0,0.4);
z-index: 1;
```
Position driven entirely by CSS variables `--left` / `--right`, set from JS via `offsetLeft` / computed remaining width.

**Directional stretch** (asymmetric timing so the indicator appears to "ooze" rather than slide linearly):
- `[data-direction="right"]`: `right` transitions faster (420ms, `cubic-bezier(0.4,0.02,0.1,1)`) than `left` (480ms, `cubic-bezier(0.5,0.05,0.15,1.15)`, `50ms` delay) — leading edge races ahead, trailing edge lags → stretch effect. Also applies `transform: scaleY(0.82) scaleX(1.05) translateY(0.5px)`.
- `[data-direction="left"]`: mirrored (left edge leads).
- **Resting/snapback** (`:not(.is-animating)`): both edges transition together at 460ms with an overshoot easing `cubic-bezier(0.2,0.8,0.2,1.15)`, and `transform` uses `cubic-bezier(0.175,0.885,0.42,1.35)` (bounce-back to `scaleY(1) scaleX(1)`).

### 5.4 Nav links — `.liquid-nav__link`
- `padding: 10px 22px`, `border-radius: 999px`, Space Mono `12px`, uppercase, `letter-spacing: 0.08em`.
- Default color `var(--paper-deep)`; hover/`.active` → `#fff`.
- On `.on-light`: default `var(--oil)`, hover `var(--wick)`.

### 5.5 Brand mark — `.nav-brand`
- Flex row, `gap: 7px`, `padding: 8px 16px 8px 10px`.
- `::after` pseudo-element renders a 1px vertical divider (`rgba(236,226,205,0.2)`) to the right of the brand.
- `:active` → `transform: scale(0.9)` (tap feedback).
- SVG mark (`.nav-brand__mark`, `17×24`) = a candle: rectangle body + olive wax-pool stripe (was `--sage`, now `--olive`) + flame path filled with a linear gradient (`#fff2c9 → var(--wax-light) → var(--wax)`) — flame keeps its warm gradient since it renders literal fire.
- `.nav-brand__flame` idles with **`flameFlicker`** keyframe (2.6s loop, ease-in-out infinite):
  ```css
  @keyframes flameFlicker {
    0%,100% { transform: scale(1) rotate(0deg); }
    25%     { transform: scale(1.06,0.94) rotate(-3deg); }
    50%     { transform: scale(0.94,1.06) rotate(2deg); }
    75%     { transform: scale(1.04,0.96) rotate(-1deg); }
  }
  ```
  Speeds up to `0.8s` on brand hover.
- Clicking the brand (logo) triggers **`.nav-brand--pulse`** (420ms `cubic-bezier(0.34,1.56,0.64,1)`, squash-then-overshoot via `brandPulse` keyframe) and smooth-scrolls to top.

### 5.6 Burger button (mobile) — `.nav-burger`
- `38×38px` circular hit target, hidden by default (`display:none`), shown `<767px`.
- Three `.nav-burger__line` bars (`16×2px`), spring transition `cubic-bezier(0.34,1.56,0.64,1)` (380ms).
- `[aria-expanded="true"]` morphs to an X: line 1 → `translateY(7px) rotate(45deg) scaleX(1.1)`, line 2 → `opacity:0 scale(0)`, line 3 → `translateY(-7px) rotate(-45deg) scaleX(1.1)`.

---

## 6. Mobile Dropdown — `.nav-dropdown`

### 6.1 Container
- `position: fixed; top: 78px;` (66px at ≤640px), centered via `left:50%; transform-origin: top center`.
- Same glass treatment as the pill nav but `border-radius: 24px`, `blur(18px) saturate(240%)`.
- Base (closed) transform: `translateX(-50%) translateY(-35px) scaleX(0.5) scaleY(0.1)`.

### 6.2 Open animation — `liquidDripOpen` (680ms, `cubic-bezier(0.22,1,0.36,1)`)
Simulates a droplet stretching down under gravity, then rebounding:
```
0%   translateY(-35px) scaleX(0.4) scaleY(0.1)  blur(3px)  opacity:0
45%  translateY(22px)  scaleX(0.8) scaleY(1.35) blur(1px)  opacity:0.85   ← heavy stretched drop
70%  translateY(-6px)  scaleX(1.12) scaleY(0.84)           opacity:1     ← kinetic rebound squash
88%  translateY(3px)   scaleX(0.96) scaleY(1.04)                          ← settling wobble
100% translateY(0)     scaleX(1) scaleY(1)      blur(0)   opacity:1
```

### 6.3 Close animation — `liquidDripClose` (480ms, `cubic-bezier(0.76,0,0.24,1)`)
Pull-down tension then elastic collapse upward:
```
0%   translateY(0)   scaleX(1)    scaleY(1)    opacity:1
30%  translateY(8px) scaleX(0.88) scaleY(1.16) opacity:0.9   ← resistance stretch
100% translateY(-65px) scaleX(0.3) scaleY(0.05) blur(5px) opacity:0
```
JS syncs a `closingTimeout` of `480ms` to match, before removing the `.closing` class.

### 6.4 Vertical indicator — `.nav-dropdown__indicator`
Same `color-mix(in srgb, var(--olive) 80%, transparent)` fill as desktop, but positioned with `--top`/`--bottom` custom properties (vertical stretch instead of horizontal). Directional easing mirrors §5.3 but for `top`/`bottom` (`[data-direction="down"]` / `[data-direction="up"]`).

### 6.5 Cascading link entrance — `.nav-dropdown__link`
Closed state: `opacity:0; transform: translateY(-16px) scaleY(0.75)`.
On `.nav-dropdown.open`: animates in with `opacity 380ms cubic-bezier(0.25,1,0.5,1)` + `transform 480ms cubic-bezier(0.175,0.885,0.32,1.275)`.
Staggered per child: `nth-child(2)` +140ms, `nth-child(3)` +210ms, `nth-child(4)` +280ms delay — links cascade in one after another.

---

## 7. Scroll-Linked Header Morph (Top Bar → Liquid Nav)

Two nav presentations coexist: a spread `.top-bar` (full-width, left brand / right menu) for the page top, and the floating `.liquid-nav` pill. JS cross-fades and repositions them based on scroll position using a **viscosity-smoothed** interpolation (not a raw scroll-linked value) so the morph feels fluid rather than mechanical.

Key JS constants (self-invoking scope):
- `startPx = 10`, `endPx = 150` — scroll range over which the morph happens.
- `viscosity = 0.085` — lerp factor per animation frame: `current += (target - current) * viscosity`.
- `target` computed each scroll/resize: `Math.min(1, Math.max(0, (y - startPx)/(endPx - startPx)))`.

Per-frame `render(t)` sets CSS custom properties:
- `topBar`: `--bar-opacity: 1 - t` (fades out).
- `.top-bar__brand`: `--brand-x: 46 * t` px (slides right as it fades).
- `.top-bar__menu`: `--menu-x: -46 * t` px (slides left as it fades).
- `liquidNav`: `--nav-opacity: t`, `--nav-y: 10*(1-t)` px, `--nav-scale: 0.92 + 0.08*t`.
- **Pointer-event handoff**: once `t > 0.55`, `topBar.style.pointerEvents='none'` and `liquidNav` becomes interactive — prevents both from being clickable mid-transition.

Loop runs via `requestAnimationFrame` only while `|target - current| >= 0.0006`, then halts (`rafId = null`) to avoid needless ticking at rest.

---

## 8. Dynamic Contrast Monitor

Runs on scroll/resize (throttled via a `ticking` flag + `requestAnimationFrame`):
1. Compute a sample point just **below** the nav pill: `x = navRect.left + navRect.width/2`, `y = navRect.bottom + 6`.
2. `document.elementFromPoint(x, y)` → walk up with `.closest('.dark-zone')`.
3. Toggle `.on-light` class (inverse of whether a `.dark-zone` ancestor was found) on:
   - `#liquidNav` (floating pill)
   - `#navDropdown` (mobile menu)
   - `#burnRail` (progress rail — see §9)

This is what lets the same nav automatically read as light-glass-on-dark or dark-glass-on-light without manual per-section configuration; sections just need the `.dark-zone` marker class.

---

## 9. Glass Capillary Scroll Progress Rail — `#burnRail`

A vertical "candle" fixed to the right edge (`right: 22px`, vertically centered, `16×250px`, hidden below `900px` width) that fills like melting wax as the user scrolls.

- `.flame` (10×10px): radial-gradient blob (`#fff2c9 → var(--wax-light) → var(--wax)`) with glow shadow — decorative candle tip.
- `.stick`: the glass tube, same glass treatment pattern as nav (`blur(8px) saturate(200%)`, inset specular highlights, dark boundary ring `0 0 0 0.5px rgba(36,29,21,0.06)`), `overflow: hidden`.
- `.burned` (`#burnedFill`): absolutely positioned fill from the bottom, `height` driven by JS scroll percentage, transition `height 120ms cubic-bezier(0.2,0.8,0.2,1)`. Gradient `linear-gradient(to top, var(--wax), var(--wax-light))` simulates glowing liquid wax.
- `.burned::after`: a small radial cap (`#fff2c9`) at the top of the fill — a "meniscus bubble" so the fill edge doesn't look flat.
- JS: `pct = (scrollTop / (scrollHeight - clientHeight)) * 100`, clamped 0–100, applied directly as `fill.style.height = pct + '%'`.
- Also receives `.on-light` swap from the contrast monitor (§8).

---

## 10. Responsive Breakpoints

| Breakpoint | Behavior |
|---|---|
| `≤ 900px` | `#burnRail` hidden entirely. |
| `≤ 767px` | `.liquid-nav__link` and `.liquid-nav__indicator` hidden; `.nav-burger` shown (switches to burger/dropdown mode). |
| `≤ 640px` | `.liquid-nav` tightens (`top:12px`, `padding:5px`); link/brand padding & font sizes shrink; `.nav-dropdown` top offset becomes `66px`; `.top-bar` padding shrinks; `.top-bar__menu` gap/font shrink. |

---

## 11. JS Architecture Summary

All behavior is organized as independent IIFEs (self-contained modules), each guarding on required DOM nodes existing before running:

1. **Water cursor** — creates the 10-bead trail, tracks mouse position/velocity, applies hover/click states.
2. **Burn rail scroll progress** — updates `#burnedFill` height on scroll/resize.
3. **Synced double-indicator physics** — single source of truth (`syncActiveIndicators(index)`) drives both the desktop horizontal indicator and the mobile vertical indicator in parallel; handles anchor clicks, smooth-scroll, and scroll-based active-section detection (`updateActiveOnScroll`, threshold `offsetTop - 150`).
4. **Logo pulse** — click handler for brand mark scroll-to-top + pulse animation.
5. **Scroll-linked morph** — top-bar ⇄ liquid-nav cross-fade/scale via viscosity-lerped scroll value.
6. **Contrast monitor** — samples background under the nav to toggle `.on-light`.
7. **Mobile burger controller** — open/close dropdown, outside-click-to-close, timing synced to the 480ms close animation.

Shared conventions:
- Indicators are positioned via CSS custom properties (`--left/--right` or `--top/--bottom`) rather than inline `left/right` directly, so CSS transitions/easing curves handle the animation — JS only ever sets target values.
- `instant` flags bypass transitions (`transition:'none'` + forced reflow via `offsetHeight`) for first paint / resize / font-load, so nothing visibly animates into its initial position.
- `ResizeObserver` and `document.fonts.ready` both re-sync indicator positions once real layout metrics are available (important since Space Mono/Big Shoulders may shift widths after loading).

---

## 12. Reuse Notes for Other Pages

- Any new page section should get either `.zone-dark`/`.dark-zone` (or a light zone class) so the contrast monitor can classify it correctly.
- The nav/dropdown link list is data-driven only via matching `data-page` attributes on `.liquid-nav__link` / `.nav-dropdown__link` — add a new anchor + matching `<section id="...">` to extend.
- All glass surfaces follow the same recipe: low-alpha `background-color` (~0.02–0.03 alpha) + `backdrop-filter: blur() saturate(200–240%)` + a stacked `box-shadow` of (inset white specular, inset dark shadow, thin outer boundary ring, outer drop shadow). Reuse this exact shadow stack for any new glass component to stay visually consistent.