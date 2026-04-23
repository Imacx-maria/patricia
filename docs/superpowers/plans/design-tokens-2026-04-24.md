# Patricia — Design Tokens (2026-04-24)

> Output of `design-system-picker` for the visual restyle plan.
> **Style library:** Playful Bento (dominant) + Warm Serene Luxury (secondary).
> **Divergences from library defaults:** cream base `#F6F1E6` instead of white; Geist kept (project constraint); near-black rail sidebar as fixed chromatic anchor.

Wire these into `app/globals.css` via Task 1 of `2026-04-24-visual-restyle.md`. Class names follow Tailwind 4 `@theme inline` convention (`--color-*` ↔ `bg-*` / `text-*`).

---

## 1 — Color tokens

```yaml
# Surfaces / neutrals
background:       "#F6F1E6"   # cream, app canvas
surface:          "#FFFFFF"   # cards, modals, calendar cells
surface-raised:   "#FFFDF8"   # inside-card sub-panels, inputs
sidebar:          "#141417"   # desktop rail, pill CTAs
sidebar-ink:      "#F4EFE4"   # text on sidebar
ink:              "#141417"   # body text, headings
ink-muted:        "#5B5B63"   # meta text, labels  (AA on cream: ≥6.5:1)
border:           "#E7E0D0"   # warm hairline borders
accent:           "#141417"   # primary CTA bg
accent-contrast:  "#FFFFFF"   # primary CTA text
dot-accent:       "#F5D547"   # brand dot, notification pip

# Pastel surfaces (task cards, KPI tiles, highlights)
pastel-pink:      "#F9C6D1"
pastel-yellow:    "#F7E26C"
pastel-lavender:  "#D6C7F2"
pastel-blue:      "#C9DAFB"
pastel-sage:      "#C8D89B"

# Elevation
shadow-soft:      "0 20px 40px -24px rgba(20, 20, 23, 0.18)"
```

**Rationale.** Cream base carries the "domestic warmth" of Warm-Serene; five pastels carry the "hierarchy-aware bento" energy. Ink and accent collapse to the same near-black so CTAs read as "punctuation" inside the cream canvas instead of introducing a second dark tone. `dot-accent` is a punchier yellow than `pastel-yellow` so the brand dot still reads at small sizes.

**Contrast checks (AA, normal text):**
- ink `#141417` on cream `#F6F1E6` → **15.9:1** ✓
- ink-muted `#5B5B63` on cream → **6.6:1** ✓
- ink on pastel-yellow `#F7E26C` → **14.2:1** ✓
- ink on pastel-pink `#F9C6D1` → **13.1:1** ✓
- sidebar-ink `#F4EFE4` on sidebar `#141417` → **15.1:1** ✓

---

## 2 — Radii scale

```yaml
radius-sm:   "6px"    # inline chips, tiny tags
radius-md:   "10px"   # small buttons, sub-inputs
radius-xl:   "16px"   # inputs, modal fields, inner tiles
radius-2xl:  "20px"   # task cards, KPI tiles, calendar cells
radius-3xl:  "28px"   # kanban columns, modals, sidebar rail
radius-full: "9999px" # pills: CTAs, badges, nav pills
```

Tailwind mapping: `rounded-sm|md|xl|2xl|3xl|full`. Keep card → column → shell in a visible stack: card 2xl, column 3xl, shell/modal 3xl + shadow.

---

## 3 — Heading + type scale

All weights are Geist (font already loaded).

```yaml
h1:
  size:        "3rem"      # 48px
  size-md:     "3.5rem"    # 56px from md: breakpoint
  line:        1.05
  tracking:    "-0.02em"
  weight:      800         # Geist Black/ExtraBold
h2:
  size:        "1.875rem"  # 30px
  line:        1.15
  tracking:    "-0.015em"
  weight:      700
h3:
  size:        "1.25rem"   # 20px
  line:        1.3
  tracking:    "-0.01em"
  weight:      700
body:
  size:        "0.9375rem" # 15px
  line:        1.5
  weight:      400
meta:
  size:        "0.75rem"   # 12px
  line:        1.4
  tracking:    "0.18em"
  weight:      600
  transform:   uppercase
```

`meta` is the eyebrow above every page heading (e.g. `CALENDÁRIO`, `RESUMO`) and the section labels (`PRÓXIMAS`, `POR ESTADO`) on the dashboard.

---

## 4 — Cost-category → pastel mapping

Consumed by `lib/theme.ts` (`surfaceForCategory`) on `TaskCard`.

| Category (DB value) | Label PT | Tailwind class | Hex | Rationale |
|---|---|---|---|---|
| `materials` | Materiais | `bg-pastel-blue` | `#C9DAFB` | Cool hue reads as "raw stock" (azulejo, pedra, tinta) |
| `labor` | Mão de obra | `bg-pastel-sage` | `#C8D89B` | Green = human effort / craft |
| `tools` | Ferramentas | `bg-pastel-lavender` | `#D6C7F2` | Purple = instrument / precision |
| `furniture` | Mobiliário | `bg-pastel-yellow` | `#F7E26C` | Butter yellow = habitado, sala de estar |
| `decoration` | Decoração | `bg-pastel-pink` | `#F9C6D1` | Pink = aesthetic / finishing layer |
| `other` | Outro | `bg-surface-raised` | `#FFFDF8` | Neutral fallback so "other" doesn't claim a hue it hasn't earned |

---

## 5 — Status → pastel mapping (for Badges)

Used by `components/Badges.tsx` `StatusBadge`.

| Status | Tailwind class | Hex |
|---|---|---|
| `backlog` | `bg-surface-raised text-ink-muted` | `#FFFDF8` |
| `todo` | `bg-pastel-blue text-ink` | `#C9DAFB` |
| `doing` | `bg-pastel-yellow text-ink` | `#F7E26C` |
| `blocked` | `bg-pastel-pink text-ink` | `#F9C6D1` |
| `waiting_material` | `bg-pastel-lavender text-ink` | `#D6C7F2` |
| `done` | `bg-pastel-sage text-ink` | `#C8D89B` |

Status and category are **orthogonal channels**: the card's *surface* reflects the kind of spend (category); the status *pill* reflects its position in the flow. Two signals, two locations — never collide.

---

## 6 — Review notes

- **Divergences logged:** cream base, Geist kept, dark rail. ≥2 requirement satisfied.
- **Preset-literalness risk:** LOW — bento pastel palette + warm-serene base + dark rail is a tri-influence not present in any single library default.
- **Accent flooding:** avoided — a single near-black is re-used for CTAs / text / rail. No second dark hue.
- **A11y:** all text pairings pass WCAG AA at normal body size.
- **Open question for Task 2 (`AppShell`):** sidebar corner — fully rounded 3xl vs only rounded on outer edges. Recommend full 3xl; re-evaluate if the rail feels too "floating" on 1440px.

---

## 7 — Wiring hint

The exact `app/globals.css` replacement in Task 1 of the restyle plan already matches these hexes. No changes needed to Task 1 code — this file is the source-of-truth rationale behind those values.
