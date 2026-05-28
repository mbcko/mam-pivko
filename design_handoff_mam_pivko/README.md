# Handoff: Mam Pivko redesign

## Overview

Redesign of the **Mam Pivko** pub-crawl planning app — an event list, event detail, event form, and wishlist — built on the Heureka Design System (Core 6.0) with a warmer, slightly playful "pub" personality.

The redesign keeps all existing functionality (Google auth, allowlist-based edit gating, route ordering, Mapy.cz integration, calendar export) and adds:

- A live **countdown card** to the next upcoming event
- A "**streak**" banner highlighting consecutive organizers
- **Drag-to-reorder** for pubs in the event form (HTML5 DnD)
- A **route timeline** with numbered orange stops and a dashed-line connector
- **In-place editing** for wishlist items
- A **wishlist picker modal** inside the event form
- A **compact responsive header** that doesn't dominate on mobile
- User-toggleable preferences (route style, past-event visibility, density) — these are real product preferences, not just demo tweaks

## About the design files

The files in this bundle are **design references created in HTML** with React + Babel + inline JSX. They are prototypes showing intended look and behavior — **not production code to copy directly**.

Your task is to **recreate these designs in the existing Mam Pivko codebase**:

- **Frontend**: React + Vite
- **Backend**: Cloudflare Worker + D1 (unchanged)
- **Auth**: Google login + HttpOnly session cookie (unchanged)
- **Hosting**: `mbcko.github.io/mam-pivko/`

Use the codebase's existing routing solution, state management, and component patterns. Do **not** introduce React Babel script tags, `window.*` global exports, or the in-prototype Tweaks panel into production — those are prototype conveniences.

## Fidelity

**High-fidelity.** Final colors, typography, spacing, border-radii, shadows, and interactions are all locked in. Match them pixel-for-pixel where reasonable.

The only exception: the **map** is rendered as a stylized SVG placeholder in the prototype. In production, keep the existing Mapy.cz iframe/embed in the same slot.

## Design tokens

All tokens come from the Heureka Design System (`ds/colors_and_type.css`) plus a small "pub" overlay in `app.css`. Bring both files into the codebase as global styles.

### Colors

**From Heureka DS (use existing CSS variables):**

| Token | Hex | Used for |
|---|---|---|
| `--color-accent` (`--colorBrandSecondary-300`) | `#ff660a` | Primary CTAs, accent moments, "!" wordmark dot, countdown card amber, route stop pins |
| `--color-primary` (`--colorBrandPrimary-300`) | `#0098cd` | Links, secondary buttons, info chips |
| `--color-primary-hover` | `#0054a3` | Hover state for primary |
| `--color-action` (`--colorRed-300`) | `#dc0032` | Delete actions, map pins |
| `--color-success` (`--colorGreen-500`) | `#00a380` | "Do kalendáře" chip, visit-count chip |
| `--colorGrey-700` | `#1a1a1a` | Primary text |
| `--colorGrey-500` | `#525252` | Secondary text |
| `--colorGrey-400` | `#707070` | Tertiary text / muted |
| `--colorGrey-300` | `#999999` | Placeholder, dividers |
| `--colorGrey-200` | `#d6d6d6` | Borders (strong) |
| `--colorNeutral-border` | `#ebebeb` | Borders (default) |

**Pub overlay (custom, defined in `app.css`):**

| Token | Hex | Used for |
|---|---|---|
| `--pub-canvas` | `#fbf6ea` | Page background |
| `--pub-canvas-soft` | `#fef9ee` | Date-stamp bg |
| `--pub-foam` | `#fff6d6` | Chip bg, countdown bg start |
| `--pub-amber` | `#d68a1e` | Date-stamp month label, chip text |
| `--pub-amber-soft` | `#fff4dc` | Countdown bg end, mapy.cz suggest chip |
| `--pub-ink` | `#1a1a1a` | Text |
| `--pub-mute` | `#707070` | Muted text |
| `--pub-line` | `#ece4d0` | Borders (warm-tinted) |
| `--pub-line-soft` | `#f0e7d2` | Subtler borders |

### Typography

**Family**: `Source Sans Pro` (already in DS — woff2 files in `ds/fonts/`). System font stack as fallback. Weights used: 400, 600, 700, 800.

**Scale** (from `colors_and_type.css`, line-height 1.35 everywhere):

| Class / use | Size | Weight |
|---|---|---|
| Page H1 (event detail title) | 26px | 800 |
| Form H1 ("Nová akce") | 24px | 800 |
| Brand wordmark | 18px | 800 |
| Event row title | 16px | 700 |
| Pub card title | 16px | 700 |
| Countdown title | 18px | 700 |
| Body | 15px | 400 |
| Meta / chip | 13px | 600 |
| Section head (uppercase) | 15px | 800, letter-spacing 0.08em |
| Date-stamp day | 20px | 800 |
| Date-stamp month | 10px | 700, uppercase, letter-spacing 0.04em |
| Countdown clock digits | 18px | 800, tabular-nums |
| Countdown clock unit | 10px | 700, uppercase |

**Mobile (≤520px)**: H1 sizes drop to 21px (detail) / 20px (form).

### Spacing

4px base. From DS: `--space-1` (4px), `--space-2` (8px), `--space-3` (12px), `--space-4` (16px), `--space-5` (24px), `--space-6` (32px).

App-specific:
- Shell horizontal padding: 16px
- Card padding: 14px 16px
- Shell max-width: 760px (default), 1080px (wide variant)
- Appbar inner padding: 10px 16px
- Sticky save bar padding: 12px 16px

### Border radii

- `--radius-sm` (6px) — small buttons, segmented control items, mapy-suggest chip
- `--radius-md` (8px) — buttons, inputs, date stamp, countdown clock units
- `--radius-lg` (12px) — cards, event rows, route stops, map wrapper
- `--radius-xl` (24px) — login card
- `--radius-pill` (999px) — chips, avatars, route stop number badges

### Shadows

- `--shadow-accent-btn`: `0 4px 8px 0 rgba(230, 106, 0, 0.24)` — orange CTAs, route stop number badge
- `--shadow-card`: `0 4px 12px 0 rgba(163, 163, 163, 0.2)` — login card on hover
- `--shadow-popover`: `0 12px 32px 0 rgba(26, 26, 26, 0.16)` — modal

Custom on event-row hover: `0 4px 12px rgba(214, 138, 30, 0.10)` (warm amber tint).

## Components

All components are documented in the source files. Cross-reference:

| Component | File | Notes |
|---|---|---|
| `Appbar` | `shell.jsx` | Sticky compact header, semi-transparent w/ backdrop blur |
| `Avatar` | `shell.jsx` | Initial-based, hash-colored, 6 color pairs |
| `OrganizerChip` | `shell.jsx` | Avatar (18px) + name in a foam chip |
| `BackLink` | `shell.jsx` | "← Zpět" |
| `Icon` | `shell.jsx` | Inline SVGs (24×24 viewBox, currentColor stroke, 2px width, rounded caps) |
| `GoogleIcon` | `shell.jsx` | 4-color Google "G" |
| `MapPlaceholder` | `shell.jsx` | **Replace with real Mapy.cz embed in prod** |
| `Modal` | `shell.jsx` | Scrim + pop-in animation, Escape closes |
| `Countdown` | `list.jsx` | Live-updating, polls every 1s |
| `EventRow` | `list.jsx` | Date stamp + title + meta + route preview pills |
| `StreakBanner` | `list.jsx` | Shows if last organizer repeated ≥2× |
| `PubCard`, `RouteTimeline`, `RouteCards`, `RouteMapFirst` | `detail.jsx` | 3 layout variants |
| `PubFormRow` | `form.jsx` | Drag handle + numbered badge + 5 inputs + actions |
| `WishItemForm` | `wishlist.jsx` | Inline create/edit |
| `WishlistRow` | `wishlist.jsx` | Compact item display |

### Buttons

Five variants — all share the same base (height ~36px, 8px 14px padding, 6px gap, 14px font-weight-600 text, 8px radius):

- **`.btn-primary`** — solid orange (`--color-accent`), white text, accent shadow
- **`.btn-secondary`** — white bg, blue text, light blue border
- **`.btn-ghost`** — white bg, ink text, warm border; hover→foam bg
- **`.btn-danger`** — white bg, red text, red-200 border
- **`.btn-danger-filled`** — solid red bg, white text — used in confirmation modals only

Modifiers: `.btn-sm` (32px h), `.btn-lg` (44px h), `.btn-icon` (36×36 square), `.btn-block` (full width).

Press state: `translateY(1px)`. Disabled state: 0.5 opacity.

### Chips

20px tall, 8px horizontal padding, 12px text, 600 weight, 999px radius. Variants:

- `.chip` (default) — foam bg / amber text
- `.chip-blue` — light blue bg / dark blue text
- `.chip-green` — light green bg / dark green text
- `.chip-grey` — light grey bg / muted text
- `.chip-soft-orange` — light orange bg / dark orange text

### Inputs

- 1.5px solid `--pub-line` border
- 10px 12px padding, 8px radius, 15px font
- Focus: border becomes `--color-accent` (orange) + 3px `rgba(255,102,10,0.15)` glow
- Placeholder: `--colorGrey-300`
- `.input-search` — adds a 16×16 search icon at left, padding-left 36px

## Screens

### 1. Event list (home) — `/`

**Layout** (max-width 760px, centered):

```
┌─────────────────────────────────────────┐
│ [Appbar: brand · wishlist · + nová · …]│  sticky
├─────────────────────────────────────────┤
│ ┌─ Countdown card ─────────────────┐   │  if upcoming event exists
│ │ PŘÍŠTÍ PIVKO                      │   │
│ │ MAM Pivko — MaSaK    [27][05][12][03] │
│ │ čtvrtek 25. června 2026               │
│ │                                   🍻 │
│ └───────────────────────────────────┘   │
│                                         │
│ 🔥 schunka organizoval 2× v řadě…       │  if streak ≥ 2
│                                         │
│ NADCHÁZEJÍCÍ  (2) ─────────────         │
│ [Event row]                             │
│ [Event row]                             │
│ PROBĚHLO  (5) ─────────────             │
│ [Event row]                             │
│ ...                                     │
└─────────────────────────────────────────┘
```

**Countdown card** (`Countdown` in `list.jsx`):
- Background: linear-gradient 135deg `--pub-foam` → `--pub-amber-soft`
- 1px `--pub-line-soft` border, 12px radius, 16px 18px padding
- Decorative 🍻 emoji bottom-right, opacity 0.10, 110px font, rotated −12°, pointer-events none
- Right side: 4-unit clock (dní/hod/min/sek), each unit is a 44px-wide white card with 1px border `rgba(214,138,30,0.18)`, 6px radius
- **Updates every 1000ms** via `setInterval` — clear on unmount
- Target time: event date at 18:00 local
- Hides when countdown goes negative
- Click → navigate to event detail

**Event row** (`EventRow`):
- Grid: `56px 1fr auto` (date stamp / content / chevron), 14px gap
- Date stamp: 56px wide, foam canvas bg, day in 20px-bold + month abbrev (LED/ÚNO/BŘE…)
- Title (16px bold) → meta line (organizer chip · pubs count · optional "dnes" / "za N dní" chip) → route preview pills (first 3 pubs separated by →, plus "+N" if more)
- Upcoming variant: amber border, soft gradient bg `#fffaf0 → #ffffff`
- Past variant: 0.65 opacity; "faded" variant: 0.45 opacity + grayscale 0.4
- Hover: amber-200 border + amber shadow
- Click → detail page

**Section header**:
- "NADCHÁZEJÍCÍ" / "PROBĚHLO" — 15px uppercase 800 weight, muted color, 0.08em letter-spacing
- Count chip (grey)
- Flex-1 divider line (1px `--pub-line`)

**Empty state**: 🍺 icon, "Zatím tu nic není", "Začni první pub crawl tlačítkem nahoře."

### 2. Event detail — `/events/:id`

**Layout** (same 760px shell):

```
← Zpět

ČTVRTEK 25. ČERVNA 2026      [✏️] [🗑️]
MAM Pivko — MaSaK
[👋 Organizátor: MaSaK] [3 hospody] [📅 Do kalendáře]

┌─ Notes (if any) ───┐
│ foam-tinted box    │
│ amber left border  │
└────────────────────┘

TRASA  (3) ─────────────

[Map placeholder (compact, 16:7)]

⬤─ 1. Pub Card
│
⬤─ 2. Pub Card
│
⬤─ 3. Pub Card
```

**Detail head**:
- Flex row, title block grows, actions right-aligned
- Date line: 13px uppercase 700, amber (upcoming) or muted (past)
- H1: 26px bold, −0.01em letter-spacing
- Meta row: chips (organizer, pub count, calendar link)

**Edit/delete icon buttons** — only shown if `auth.loggedIn`. 36×36, white bg, warm border. Delete variant uses red on hover.

**Route timeline** (default style; `RouteTimeline` in `detail.jsx`):
- Each stop is `padding-left: 56px; padding-bottom: 14px` relative container
- Number badge: 40px circle, orange `--color-accent` bg, white text, accent shadow, absolutely positioned top-left
- Dashed connector line: `repeating-linear-gradient(to bottom, --colorBrandSecondary-200 0 6px, transparent 6px 12px)`, 2px wide, positioned at left:19px (centered under the 40px badge), from top:28px to bottom:-4px
- Last stop's connector is hidden
- Pub card inside: white bg, 1px `--pub-line` border, 12px radius, 12px 14px padding

**Pub card content**:
- H4 name (16px bold)
- Address (13px muted)
- Note in italic with quotes if present (13px, `--colorGrey-600`)
- Links row: "Otevřít odkaz" (link icon) and "Mapy.cz" (pin icon) — both blue, 13px 600, gap 12px

**Map placeholder**: replace with the existing Mapy.cz embed showing all pubs as numbered red pins on a static map (current behavior).

**Calendar link** (`calendarLink` in `detail.jsx`):
```
https://calendar.google.com/calendar/render?
  action=TEMPLATE
  &text=<encoded event title>
  &dates=<YYYYMMDD>T180000/<YYYYMMDD>T230000
  &details=<encoded notes + pub list>
```

**Delete flow**: clicking trash opens a confirmation modal. Modal: white card, 20px H2 "Smazat akci?", muted lead text, two buttons (ghost "Zrušit" + danger-filled "Smazat") right-aligned.

### 3. Event form — `/new` and `/events/:id/edit`

**Auth gate**: if not logged in, render the login card instead of the form.

**Layout**:

```
← Zpět

Nová akce                          [🗑️ Smazat]   (edit only)

┌─ Card ─────────────────────────┐
│ Datum *  [📅 25.06.2026     ] │
│ Organizátor * [MaSaK ▾]        │
│ Název (volitelný) [           ]│
│ Poznámky k večeru [textarea   ]│
└────────────────────────────────┘

┌─ Card ─────────────────────────┐
│ Hospody (3)  táhni ⋮⋮ pro …    │
│                                │
│ [Pub row 1]                    │
│ [Pub row 2]                    │
│ [Pub row 3]                    │
│                                │
│ [+ Přidat hospodu] [⭐ Z wishlistu (5)]│
└────────────────────────────────┘

──────────────────────────────────
[Zrušit]  [✓ Uložit změny]      (sticky)
```

**Pub row** (`PubFormRow`):
- Grid: `28px 28px 1fr auto` (drag handle / number badge / fields / actions)
- Drag handle: 6-dot vertical handle (Icon `drag`), `cursor: grab`, muted color, hover→mute
- Number badge: 28px foam circle with amber 800 number
- Fields stack vertically (6px gap): name, address, note, url
- Map row: if `mapyLabel` set → amber suggest chip with × to remove; else → search input with 🔍 icon. Pressing Enter "finds" the location (in prototype this fakes a result; in prod this is the existing Mapy.cz autocomplete)
- Actions column: star toggle (32×32, yellow bg when on) + red × icon button

**Drag-to-reorder** (HTML5 DnD):
- Row is `draggable={true}`
- `onDragStart`: capture index, `dataTransfer.effectAllowed = 'move'`, set `text/plain` (Firefox needs it)
- Wrapping `<div>` around each row handles `onDragOver` (preventDefault), `onDragLeave`, `onDrop`
- Dragging row: `opacity: 0.5` + elevated shadow
- Drag-over target: dashed orange border (`border-color: --color-accent; border-style: dashed`)
- On drop: splice item from source index to target index

> **Mobile / touch**: HTML5 DnD doesn't support touch reliably. For touch devices, either (a) add a small touch-drag polyfill (e.g., `react-dnd` with touch backend, `dnd-kit`, or `react-beautiful-dnd`), or (b) add up/down arrow buttons next to the handle as a fallback. **Recommended**: use `@dnd-kit/core` + `@dnd-kit/sortable` — it supports both pointer and keyboard and is small.

**Wishlist picker modal**: opened by "⭐ Z wishlistu" button. Lists all wishlist items as clickable buttons. Items already in the current route are disabled and show a "už v trase" chip.

**Star toggle on pub row**: clicking the ⭐ either adds the current pub to the wishlist (if its name doesn't match any wishlist item) or removes it (case-insensitive name match).

**Validation**: name is required on every pub. On save:
- `date` must be set
- `organizer` must be set
- every pub must have a non-empty `name`

Show errors inline near the relevant field. Currently errors are displayed under the field as 12px red text.

**Sticky save bar**: position sticky bottom, semi-transparent canvas bg + 8px blur, top border. Negative margin to bleed to viewport edge.

### 4. Wishlist — `/wishlist`

**Layout**:

```
← Zpět

⭐ Wishlist hospod              [+ Přidat hospodu]

[Map placeholder (compact)]

🏆 Nejnavštěvovanější: Vinohradský pivovar · 2× pivko

[Wishlist row]
[Wishlist row]
...
```

**Wishlist row** (`WishlistRow`):
- Grid: `32px 1fr auto`, 10px gap, 12px 14px padding
- Numbered red pin badge (26px, mapy.cz red)
- Name (15px bold) + optional "no map data" amber pin icon
- Address (13px muted, ellipsis if too long)
- Meta line: visit count (`🍻 N návštěv` green chip) **or** "Zatím nenavštíveno" + optional italic note
- Actions: 📍 link to Mapy.cz (if mapy data) + edit + delete (logged-in only)

**Sort**: items with map data first, then alphabetically (Czech locale).

**Inline edit/create** (`WishItemForm`): clicking edit replaces the row with a form card (orange border to highlight). Same fields as the pub row. "Najít" button or Enter in the search input populates `mapyLabel` and `coords`.

**Hot pick banner**: green-tinted, shows the wishlist item with the most `visits` (only if ≥1).

**Grid**: single column on mobile; two columns at ≥600px.

**Density tweak**: compact density hides the meta line and shrinks padding.

### 5. Login / unauthorized — `/new` (and any edit route) when logged-out

Centered card on 70vh canvas:
- 56px lock+mug emoji
- H1 "Pouze pro členy!" (with orange `!`)
- Lead: "Pro vytváření a úpravy akcí se musíš přihlásit."
- Google sign-in button (full width inside the card)

**Unauthorized Google account** (allowlist deny): show a Czech error message — "Tento účet nemá přístup. Pokud myslíš, že je to chyba, ozvi se Honzovi." (or similar). Keep the same login-card visual; swap copy.

## Routing

Hash-based in the prototype, but use proper routes in prod (the existing app already does):

| Path | Screen |
|---|---|
| `/` | Event list |
| `/events/:id` | Event detail |
| `/events/:id/edit` | Event form (edit) |
| `/new` | Event form (create) |
| `/wishlist` | Wishlist |

Logged-out users hitting `/new` or `/events/:id/edit` see the login card; everything else is browsable.

## State / data model

The prototype uses local React state + localStorage. In prod, wire to the existing API.

### Event

```ts
type Event = {
  id: string;          // UUID
  name: string;        // optional; falls back to `MAM Pivko — ${organizer}`
  date: string;        // YYYY-MM-DD
  organizer: string;   // one of ORGANIZERS
  notes: string;
  pubs: Pub[];         // ordered route
}

type Pub = {
  id: string;
  name: string;          // required
  address: string;
  note: string;
  url: string;
  mapyLabel: string;     // human-readable from Mapy.cz
  coords?: { lat: number; lng: number } | null;
}
```

### Wishlist item

```ts
type WishlistItem = {
  id: string;
  name: string;
  address: string;
  note: string;
  url: string;
  mapyLabel: string;
  coords?: { lat: number; lng: number } | null;
  visits: number;        // NEW — derive from event history: count events containing this pub by name match
}
```

**`visits` field**: this is a derived count for the "🏆 nejnavštěvovanější" badge and the green chip. Either compute it on the server when returning the wishlist, or compute it client-side by intersecting wishlist names with the pub names across all events (case-insensitive).

### User preferences

The Tweaks panel surfaces three real product preferences. Persist these per-user (localStorage is fine — they're UI prefs, not data):

```ts
type Preferences = {
  pastVisibility: 'equal' | 'faded' | 'hidden';
  routeStyle: 'timeline' | 'cards' | 'map';
  density: 'comfortable' | 'compact';
}
```

Defaults: `equal`, `timeline`, `comfortable`. The Tweaks panel itself (`tweaks-panel.jsx`) is a prototyping tool — **don't ship it**. Instead, expose the prefs in a small "Nastavení" page or a settings popover.

### Date helpers

`data.jsx` defines:
- `MONTHS_CZ` — `['ledna', 'února', …]` (genitive case)
- `MONTHS_CZ_SHORT` — `['LED', 'ÚNO', …]` (date-stamp glyph)
- `DAYS_CZ` — `['neděle', 'pondělí', …]`
- `fmtCzechDate(s, { weekday: true })` — `"čtvrtek 25. června 2026"`
- `daysUntil(s)` — integer days, 0 = today, negative = past
- `pluralHospod(n)` — Czech grammar: 1 / 2-4 / 5+ → `hospoda` / `hospody` / `hospod`
- `pluralDays(n)` — `den` / `dny` / `dní`

## Interactions & behavior

### Animations

All page transitions use the same `fade-in` animation:
```css
@keyframes in { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
.fade-in { animation: in 0.22s ease-out; }
```

Modal scrim: 0.18s fade. Modal card: 0.22s `cubic-bezier(.2,.9,.3,1.2)` pop-in with scale + Y offset.

Countdown card hover: `translateY(-1px)` over 0.15s.

Buttons press: `translateY(1px)` (instant on `:active`).

No bounces, no springs, no parallax. Heureka guidance: "Short and functional."

### Loading & error states

- **Loading**: replace event/wishlist content with skeleton rows (warm-line bg, matching event-row shape). Don't show spinners on the whole page.
- **Network error**: inline banner at top of the shell — red-100 bg, red-500 text, retry button. Don't take over the page.
- **Empty**: already-designed empty cards (see screens).

### Validation

- Inline. Show errors next to the field as 12px red text.
- On the form: pub name is required. Date and organizer are required.
- Don't block submit silently; if there are errors, scroll to the first one.

### Responsive

The shell is fluid up to 760px (1080px on the wishlist with grid). Breakpoints used:

- **≤520px**: H1 sizes shrink, "Wishlist" label hides in the header (icon-only), "+ Nová akce" label hides, "Přihlásit" label hides
- **≥560px**: organizer name appears next to avatar in header (if used)
- **≥600px**: wishlist grid becomes 2 columns

The compact-density mode tightens padding, hides route previews on event rows, and hides meta lines on wishlist rows.

### Sticky elements

- **Appbar**: `position: sticky; top: 0; z-index: 20`, semi-transparent canvas bg + `backdrop-filter: blur(8px)` (with `-webkit-` prefix)
- **Save bar** (form screen): `position: sticky; bottom: 0; z-index: 5`, same backdrop treatment, top border. Negative left/right margins to bleed.

## Assets

### Fonts

Source Sans Pro woff2 files are bundled in `ds/fonts/`. The DS CSS already loads them via `@font-face` with proper unicode-range coverage for CZ/SK/HU/RO/SI/HR (latin + latin-ext).

If you serve from a CDN, just confirm latin-ext is loaded — the app uses č, š, ž, ř, á, é, í, ó, ú etc. throughout.

### Icons

All icons are **inline SVG** in `shell.jsx` (`Icon` component). They follow Heureka's icon style: 24×24 viewBox, 2px stroke, `currentColor`, rounded caps/joins. Available names:

`plus`, `pencil`, `trash`, `x`, `check`, `arrow-left`, `arrow-right`, `star`, `star-fill`, `pin`, `calendar`, `external`, `link`, `logout`, `menu`, `drag`, `search`, `beer`, `info`

If your codebase already has an icon system (lucide, heroicons, etc.), substitute equivalents — but keep the 2px-stroke outline style. Heureka explicitly avoids filled glyphs (except for active states like `star-fill`).

### Emoji

The brand keeps the 🍺 emoji per stakeholder request. Other emoji used as content (not iconography):
- 🍺 — brand mark
- 🍻 — countdown decoration, visit count chip
- 🔥 — streak banner
- 🏆 — hot pick banner
- 👋 — organizer chip
- 🗺️ — empty route state
- ⭐ — wishlist title
- 📅 — calendar chip
- 📍 — mapy.cz suggest chip
- 🔒 — login card

These are content, not UI — feel free to render with `font-family: "Apple Color Emoji", "Segoe UI Emoji", "Twemoji", sans-serif` if you want consistent cross-platform rendering.

### Map

The prototype renders a stylized SVG placeholder map in `shell.jsx` (`MapPlaceholder`). **Do not ship this.** Use the existing Mapy.cz iframe/static-image with numbered red pins as in the current app. The slot dimensions:
- `aspect-ratio: 16/7` (default / "compact")
- `aspect-ratio: 16/9` ("large", used when route style is "map-first")
- `aspect-ratio: 16/5` (very compact, unused by default but available)

Pin numbering should match the route order; pin color matches `--color-action` (`#dc0032`).

## Files in this bundle

| File | What it is |
|---|---|
| `README.md` | This file |
| `Mam Pivko.html` | HTML shell — loads scripts and styles |
| `app.css` | Custom styles on top of Heureka DS — defines all `--pub-*` tokens, layout, components |
| `app.jsx` | Router + Tweaks wiring + login gate |
| `data.jsx` | Mock data + date helpers + state hook |
| `shell.jsx` | Appbar, Icon, Avatar, Modal, MapPlaceholder, OrganizerChip, BackLink |
| `list.jsx` | Event list + Countdown + StreakBanner + EventRow |
| `detail.jsx` | Event detail + RouteTimeline / RouteCards / RouteMapFirst + calendarLink |
| `form.jsx` | Event create/edit + drag-to-reorder + wishlist picker |
| `wishlist.jsx` | Wishlist + inline create/edit + WishlistRow |
| `tweaks-panel.jsx` | **Prototype-only** — do not ship |
| `ds/colors_and_type.css` | Heureka Core 6.0 design tokens (fonts, colors, type scale, spacing, radii, shadows) |
| `ds/fonts/*.woff2` | Source Sans Pro latin + latin-ext (400, 600, 700, 900, 400-italic) |

## Implementation checklist

A suggested order of attack:

1. **Bring in the DS** — copy `ds/colors_and_type.css` and `ds/fonts/` into the codebase as global styles. The Tailwind config (if used) can pick the tokens from CSS vars.
2. **Pub overlay** — copy the `:root` block at the top of `app.css` into a global stylesheet so `--pub-*` are available everywhere. Optionally re-implement the rest of `app.css` as scoped component styles.
3. **Components** — port `Appbar`, `Avatar`, `OrganizerChip`, `Modal`, `Icon`, `BackLink` first. Use the codebase's existing routing solution (presumably react-router-dom).
4. **Buttons + chips + inputs** — port as primitives (`<Button variant="primary">`, etc.).
5. **Event list** — implement EventRow + the Countdown (with proper cleanup of the 1s interval) + section heads + streak detection.
6. **Detail** — implement the three route layouts. Wire up calendar export. Replace MapPlaceholder with the real Mapy.cz embed.
7. **Form** — implement pub row with `@dnd-kit/sortable` for drag-to-reorder. Wire up the wishlist picker modal and the star toggle. Add validation.
8. **Wishlist** — port WishlistRow + inline WishItemForm. Derive `visits` count from event history.
9. **Preferences** — persist the three prefs to localStorage and expose them in a small settings UI (popover or modal). Don't ship the Tweaks panel.
10. **Polish** — focus states, keyboard navigation (modal Esc-close already implemented, but also tab-trap inside modals), aria-labels on icon-only buttons.

## Open questions / things to confirm with design

- **Touch drag**: confirm `@dnd-kit` as the choice (or alternative). The prototype uses HTML5 DnD which is desktop-only-friendly.
- **`visits` count**: server-side or client-derived? Either is fine; client-derived avoids a backend change.
- **Allowlist denial copy**: prototype shows a placeholder. Final Czech copy?
- **Map "compact" vs "large"**: in the prototype, only "timeline" view shows a small map and "map-first" view shows a large one. Confirm this matches the desired UX (or always show the map and use the toggle only to reorder the list / map relationship).
- **Streak banner**: currently only triggers at ≥2 consecutive. Threshold OK?
- **Past event sort**: prototype is newest-first within "Proběhlo". Confirm.
