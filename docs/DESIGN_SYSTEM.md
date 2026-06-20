# Neptura Design System

**Locked visual direction.** Every design decision in this project must reference this document.

---

## Brand vision

Neptura is named after Neptune and Uranus — planets where diamonds literally fall like rain under 8 million atmospheres of pressure. The brand recreates this cosmic phenomenon in labs on earth.

The design must make customers feel **cosmic awe and desire simultaneously**. Not one or the other — both at once.

**Tagline:** Rarer than you know

---

## The two worlds

Neptura has two distinct visual environments that customers move between:

**The dark world** — hero, navigation, origin story, brand sections, footer. This is where the cosmic experience lives. Deep space, star fields, diamond forming out of darkness. Emotional, cinematic, awe-inspiring.

**The light world** — collection pages, product detail pages, cart, checkout. Once a customer is in buying mode, the environment shifts to something familiar and trustworthy. Cool ice whites and blues — still unmistakably Neptura, but bright and easy to browse.

**The transition** — as customers scroll from the brand story into the collection, the page literally shifts from dark to light. A transition band reads "· · · entering the collection · · ·". Like walking from a cinema into a jewellery room.

---

## Colour palette

### Dark world colours

| Name | Hex | Usage |
| --- | --- | --- |
| Void | `#000008` | Hero background, deepest backgrounds |
| Deep | `#050A1A` | Section backgrounds in dark world |
| Neptune | `#0A1628` | Cards, surfaces in dark world |
| Aurora | `#4A90A4` | Primary accent — section labels, stats, highlights |
| Ice | `#A8C5DA` | Secondary text, nav links, borders |
| Silver | `#C8D8E8` | Body text in dark world |
| Crystal | `#E8F4F8` | Headings in dark world, primary button bg |
| Diamond | `#F0F8FF` | Hero headings, most prominent text |
| Violet | `#6B5B9E` | Rare accent — use sparingly for depth |

### Light world colours

| Name | Variable | Usage |
| --- | --- | --- |
| Light bg | `#F4F8FB` | Page background in light world |
| Light surface | `#EBF3F8` | Product image backgrounds, cards |
| Light border | `rgba(74,144,164,0.12)` | All borders in light world |
| Light text | `#0A1628` | Primary text in light world (same as Neptune) |
| Light muted | `#4A7A8A` | Secondary text, labels, metadata |
| Aurora | `#4A90A4` | Accent colour — same in both worlds |

---

## Typography

### Fonts

- **Display / Headings:** Cormorant Garamond, weight 300 (light)
- **Body / UI:** Inter, weight 300–500

### Type scale

| Role | Font | Size | Weight | Treatment |
| --- | --- | --- | --- | --- |
| Hero title | Cormorant Garamond | clamp(2.8rem, 6vw, 5.2rem) | 300 | Normal + italic for emphasis |
| Section title | Cormorant Garamond | clamp(1.6rem, 3vw, 2.4rem) | 300 |  |
| Product name | Cormorant Garamond | 1.05rem | 300 |  |
| PDP title | Cormorant Garamond | clamp(1.4rem, 2.5vw, 2rem) | 300 |  |
| Price | Cormorant Garamond | 1.6rem | 300 |  |
| Section label | Inter | 0.62–0.68rem | 400 | Uppercase, letter-spacing 0.22–0.28em, aurora colour |
| Body text | Inter | 0.8–0.85rem | 300 | Line-height 1.9 |
| Nav links | Inter | 0.7rem | 400 | Uppercase, letter-spacing 0.14em |
| Buttons | Inter | 0.72rem | 500 | Uppercase, letter-spacing 0.16em |
| Product meta | Inter | 0.68rem | 400 |  |
| Detail labels | Inter | 0.75rem | 400 |  |

### Italic usage

Cormorant Garamond italic is used for poetic emphasis — product subtitles, the second line of hero titles, emotional moments. Use sparingly. It's the brand's signature flourish.

---

## Components

### Navigation

- Background: `rgba(0,0,8,0.8)` with `backdrop-filter: blur(20px)`
- Border bottom: `0.5px solid rgba(168,197,218,0.08)`
- Position: sticky top
- Logo: Cormorant Garamond, 1.4rem, weight 300, letter-spacing 0.25em, uppercase, crystal colour
- Links: Inter 0.7rem, uppercase, letter-spacing 0.14em, ice colour, opacity 0.6 (hover: 1)
- Bag button: ghost style with ice border

### Buttons — dark world

- **Primary:** `background: #E8F4F8` (crystal), `color: #000008` (void). No border-radius.
- **Ghost:** `background: transparent`, `border: 0.5px solid rgba(232,244,248,0.25)`, `color: #E8F4F8`
- Both: padding 0.8rem 2rem, font Inter 0.72rem, weight 500, uppercase, letter-spacing 0.16em

### Buttons — light world

- **Primary:** `background: #0A1628` (light-text/neptune), `color: #F4F8FB`. Full width on PDP.
- **Secondary:** `background: transparent`, `border: 0.5px solid rgba(74,144,164,0.12)`, `color: #0A1628`. Full width on PDP.
- **Text link:** No border, aurora colour, `→` arrow suffix

### Product cards — light world

- No card border-radius — straight edges
- Dividers: `0.5px solid rgba(74,144,164,0.12)` grid lines between cards
- Image background: `#EBF3F8` (light surface)
- Aspect ratio: 3:4
- Hover overlay: `rgba(10,22,40,0.45)` with "Quick view" label in crystal text
- Product name: Cormorant Garamond 1.05rem weight 300, light-text colour
- Meta row: Inter 0.68rem, light-muted colour, price in aurora

### Variant selector

- Buttons with `0.5px solid` border
- Default: light-bg background, light-border border, light-text colour
- Active: aurora border and aurora text colour
- No border-radius

### Product detail page

- Two column: images left (1.1fr), details right (0.9fr)
- Thumbnail strip: vertical, 60px squares, active state has aurora border
- Main image: light-bg background, centered diamond illustration or photo
- Price in Cormorant Garamond 1.6rem
- Detail rows: `0.5px solid` border-bottom, key in light-muted, value in light-text
- Specs shown: Carat, Cut, Colour, Origin, Certified by

### Diamond illustrations

- Used as placeholder / editorial element throughout
- Wireframe style: thin strokes (0.4–0.6px), low opacity fills
- Dark world: ice/silver strokes on dark background
- Light world: aurora/neptune strokes on light background
- Always include: outline polygon, facet lines, center point circle
- Never filled solid — always semi-transparent facets

---

## Animation principles

### Hero diamond

- Keyframe: `scale(0.2) rotate(-20deg)` → `scale(1.04) rotate(1deg)` → `scale(1) rotate(0)`
- Duration: 2.5s, cubic-bezier(0.16, 1, 0.3, 1)
- Pulse rings: 3 concentric circles, staggered 0.7s delay each, scale + opacity pulse at 4s
- Floating particles: carbon atoms drifting away from diamond center

### Star field

- 100 stars, randomised size (0.3–1.7px), position, twinkle speed (2–5s) and delay
- Opacity range per star: 0.1–0.8 (randomised)

### Text reveals

- All hero text: `opacity: 0, translateY(16px)` → `opacity: 1, translateY(0)`
- Staggered: eyebrow 1.8s, title 2s, subtitle 2.2s, CTAs 2.4s
- Duration 1s, ease-out

### Scroll behaviour

- Intersection Observer for section reveals on scroll
- Product cards: staggered fade-up as they enter viewport
- Transition band between dark/light worlds is always visible — no animation needed

### Mobile

- Dark hero plays but animation is shorter (1.5s not 2.5s)
- Star field reduced to 50 stars
- Collection loads immediately below in light world
- No parallax on mobile

---

## Cosmic language — copy guide

The cosmic origin story runs through every touchpoint. Guidelines:

- **Section labels** reference the origin: "The origin", "The science", "The collection", "The stones"
- **Stats** use cosmic scale: "8M atmospheres", "0% mining", "∞ light years"
- **Product descriptions** connect each piece to the cosmic origin — brief, poetic, never overwrought
- **Cart** — subtle: "Your stones" not "Your cart"
- **Checkout** — trust-forward: clean, no cosmic language here
- **Never** explain the science at length on product pages — intrigue, don't lecture
- **Transition band** text: "· · · entering the collection · · ·"

---

## What Cursor must never do

- No warm cream or beige tones anywhere
- No rose gold — replaced by aurora teal as the accent
- No border-radius on buttons or product cards (straight edges only)
- No gradients except the dark-to-light transition band
- No drop shadows
- Never use `toFixed()` for prices — always `Intl.NumberFormat('en-IN')`
- Never add decorative elements not in this spec
- Never use warm white (`#FFFFFF`) — always cool white (`#F4F8FB` or `#F0F8FF`)
- Product images must use `aspect-ratio: 3/4`
- All text animations must respect `prefers-reduced-motion`
