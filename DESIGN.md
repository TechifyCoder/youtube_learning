# DESIGN.md
# LearnLoop — Design System & Visual Language

**Version:** 1.0  
**Theme:** Dark Glassmorphism  
**Inspiration:** Linear.app, Vercel Dashboard, Raycast

---

## 1. Design Philosophy

LearnLoop uses a **dark glassmorphism** design system. Every surface feels like frosted glass floating above a deep dark background. The UI should feel premium, focused, and calm — not flashy or distracting. The user is here to learn, so the interface should get out of the way.

**Three principles:**
- **Depth** — Layers of glass cards create a sense of 3D space
- **Clarity** — Content is always readable, contrast is always sufficient
- **Motion** — Animations are subtle and purposeful, never decorative

---

## 2. Color System

### Background Colors

```css
/* globals.css */
:root {
  --bg-primary:   #0A0812;   /* Page background — deepest dark purple-black */
  --bg-secondary: #120F1E;   /* Slightly lighter — used inside cards */
  --bg-card:      #1A1628;   /* Card base color */
  --bg-card-hover:#1F1B30;   /* Card on hover */
  --bg-input:     #13101F;   /* Input fields */
}
```

### Accent Colors

```css
:root {
  --accent:         #7C5CFC;   /* Primary purple — buttons, active nav, links */
  --accent-hover:   #6B4EE0;   /* Darker on hover */
  --accent-light:   #A78BFA;   /* Section headings, highlights */
  --accent-lighter: #C4B5FD;   /* Subtle labels, muted headings */
  --accent-glow:    rgba(124, 92, 252, 0.2);  /* Glow effect on focus */
}
```

### Semantic Colors

```css
:root {
  --green:          #22C55E;   /* Watched segments, success, on track */
  --green-bg:       rgba(34, 197, 94, 0.12);
  --green-border:   rgba(34, 197, 94, 0.25);

  --red:            #EF4444;   /* Unwatched segments, error, behind */
  --red-bg:         rgba(239, 68, 68, 0.12);
  --red-border:     rgba(239, 68, 68, 0.25);

  --yellow:         #F59E0B;   /* Warning, partial, upcoming deadline */
  --yellow-bg:      rgba(245, 158, 11, 0.12);
  --yellow-border:  rgba(245, 158, 11, 0.25);

  --blue:           #3B82F6;   /* Info, upcoming schedule days */
  --blue-bg:        rgba(59, 130, 246, 0.12);
  --blue-border:    rgba(59, 130, 246, 0.25);
}
```

### Text Colors

```css
:root {
  --text-primary:   #F1F0FF;   /* Main headings, important content */
  --text-secondary: #A09CB8;   /* Body text, descriptions */
  --text-muted:     #6B6880;   /* Labels, timestamps, meta info */
  --text-disabled:  #3D3A50;   /* Disabled states */
}
```

### Border Colors

```css
:root {
  --border-subtle:  rgba(255, 255, 255, 0.06);  /* Most card borders */
  --border-base:    rgba(255, 255, 255, 0.10);  /* Standard border */
  --border-strong:  rgba(255, 255, 255, 0.18);  /* Focused elements */
  --border-accent:  rgba(124, 92, 252, 0.35);   /* Accent-colored borders */
}
```

---

## 3. Typography

### Font Families

```css
/* Load in app/layout.tsx using next/font/google */

/* Headings — Syne */
/* Bold, geometric, modern — used for all titles */
import { Syne } from 'next/font/google'
const syne = Syne({ subsets: ['latin'], weight: ['400', '600', '700', '800'] })

/* Body — DM Sans */
/* Clean, readable, friendly — used for all body text */
import { DM_Sans } from 'next/font/google'
const dmSans = DM_Sans({ subsets: ['latin'], weight: ['300', '400', '500'] })

/* Code — JetBrains Mono */
/* Monospace — video IDs, timestamps, technical labels */
import { JetBrains_Mono } from 'next/font/google'
const jetbrains = JetBrains_Mono({ subsets: ['latin'], weight: ['400', '500'] })
```

### Type Scale

```
Page Title      Syne 700     28px / line-height 1.2   color: --text-primary
Section Title   Syne 700     22px / line-height 1.25  color: --text-primary
Card Title      Syne 600     16px / line-height 1.35  color: --text-primary
Subheading      Syne 600     14px / line-height 1.4   color: --text-primary

Body Large      DM Sans 400  15px / line-height 1.6   color: --text-secondary
Body            DM Sans 400  14px / line-height 1.6   color: --text-secondary
Body Small      DM Sans 400  13px / line-height 1.55  color: --text-secondary

Label           DM Sans 500  12px / line-height 1.5   color: --text-muted
Caption         DM Sans 400  11px / line-height 1.45  color: --text-muted

Code            JetBrains Mono 400  13px              color: --accent-lighter
Timestamp       JetBrains Mono 400  12px              color: --text-muted
```

### Tailwind Config — Typography Tokens

```typescript
// tailwind.config.ts
theme: {
  extend: {
    fontFamily: {
      heading: ['var(--font-syne)', 'sans-serif'],
      body: ['var(--font-dm-sans)', 'sans-serif'],
      mono: ['var(--font-jetbrains)', 'monospace'],
    },
    fontSize: {
      'display':  ['28px', { lineHeight: '1.2',  fontWeight: '700' }],
      'title':    ['22px', { lineHeight: '1.25', fontWeight: '700' }],
      'heading':  ['16px', { lineHeight: '1.35', fontWeight: '600' }],
      'subhead':  ['14px', { lineHeight: '1.4',  fontWeight: '600' }],
      'body-lg':  ['15px', { lineHeight: '1.6'  }],
      'body':     ['14px', { lineHeight: '1.6'  }],
      'body-sm':  ['13px', { lineHeight: '1.55' }],
      'label':    ['12px', { lineHeight: '1.5',  fontWeight: '500' }],
      'caption':  ['11px', { lineHeight: '1.45' }],
    },
  }
}
```

---

## 4. Glassmorphism System

### Card Variants

Use exactly these classes. Do not create new variants.

```tsx
/* Standard Card — most content cards */
className="bg-white/[0.05] backdrop-blur-md border border-white/[0.08] rounded-2xl"

/* Elevated Card — modals, dropdowns, overlays */
className="bg-white/[0.09] backdrop-blur-xl border border-white/[0.15] rounded-2xl"

/* Subtle Card — list items, secondary cards */
className="bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-xl"

/* Active/Selected Card — when something is selected */
className="bg-purple-500/[0.12] backdrop-blur-md border border-purple-400/[0.25] rounded-2xl"

/* Hover state (add to all interactive cards) */
className="... hover:bg-white/[0.08] hover:border-white/[0.14] transition-colors duration-200"
```

### GlassCard Component

```tsx
// components/common/GlassCard.tsx
import { cn } from '@/lib/utils'

type GlassCardVariant = 'standard' | 'elevated' | 'subtle' | 'active'

interface GlassCardProps {
  children: React.ReactNode
  variant?: GlassCardVariant
  className?: string
  onClick?: () => void
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

const variants = {
  standard: 'bg-white/[0.05] backdrop-blur-md border border-white/[0.08]',
  elevated: 'bg-white/[0.09] backdrop-blur-xl border border-white/[0.15]',
  subtle:   'bg-white/[0.03] backdrop-blur-sm border border-white/[0.06]',
  active:   'bg-purple-500/[0.12] backdrop-blur-md border border-purple-400/[0.25]',
}

const paddings = {
  none: '',
  sm:   'p-3',
  md:   'p-5',
  lg:   'p-7',
}

export function GlassCard({ children, variant = 'standard', className, onClick, padding = 'md' }: GlassCardProps) {
  return (
    <div
      className={cn(
        variants[variant],
        paddings[padding],
        'rounded-2xl',
        onClick && 'cursor-pointer hover:bg-white/[0.08] hover:border-white/[0.14] transition-colors duration-200',
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  )
}
```

### Orb Background Effect

Add this to the root layout background for the ambient glow effect.

```tsx
/* In app/(dashboard)/layout.tsx — behind all content */
<div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
  {/* Top-left purple orb */}
  <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-purple-600/[0.15] blur-[100px]" />
  {/* Bottom-right violet orb */}
  <div className="absolute -bottom-20 -right-20 w-[400px] h-[400px] rounded-full bg-violet-500/[0.12] blur-[80px]" />
  {/* Center blue accent */}
  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full bg-blue-600/[0.06] blur-[60px]" />
</div>
```

---

## 5. Component Patterns

### Buttons

```tsx
/* Primary Button — main CTAs */
className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white font-medium text-sm px-5 py-2.5 rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-purple-500/25 active:scale-[0.98]"

/* Ghost Button — secondary actions */
className="bg-white/[0.05] hover:bg-white/[0.09] border border-white/[0.10] hover:border-white/[0.18] text-[--text-secondary] hover:text-[--text-primary] font-medium text-sm px-5 py-2.5 rounded-xl transition-all duration-200"

/* Danger Button — delete actions */
className="bg-red-500/[0.12] hover:bg-red-500/[0.20] border border-red-500/[0.25] text-red-400 font-medium text-sm px-5 py-2.5 rounded-xl transition-all duration-200"

/* Icon Button — square icon-only buttons */
className="w-9 h-9 flex items-center justify-center bg-white/[0.05] hover:bg-white/[0.09] border border-white/[0.10] rounded-xl transition-colors duration-200 text-[--text-muted] hover:text-[--text-primary]"
```

### Input Fields

```tsx
/* Standard input */
className="w-full bg-white/[0.05] border border-white/[0.10] focus:border-purple-500/60 focus:ring-2 focus:ring-purple-500/20 rounded-xl px-4 py-3 text-sm text-[--text-primary] placeholder-[--text-disabled] outline-none transition-all duration-200"

/* Textarea */
className="w-full bg-white/[0.05] border border-white/[0.10] focus:border-purple-500/60 focus:ring-2 focus:ring-purple-500/20 rounded-xl px-4 py-3 text-sm text-[--text-primary] placeholder-[--text-disabled] outline-none transition-all duration-200 resize-none"
```

### Badges / Status Pills

```tsx
/* On Track — green */
className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-500/[0.12] text-green-400 border border-green-500/[0.25]"

/* Behind — red */
className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/[0.12] text-red-400 border border-red-500/[0.25]"

/* Upcoming — purple */
className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-500/[0.12] text-purple-300 border border-purple-500/[0.25]"

/* Completed — muted green */
className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-500/[0.08] text-green-500/80 border border-green-500/[0.15]"

/* YouTube source */
className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/[0.10] text-red-400 border border-red-500/[0.20]"

/* Custom source */
className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-500/[0.10] text-blue-400 border border-blue-500/[0.20]"
```

### Progress Bar (Red/Green)

```tsx
/* Wrapper */
<div className="relative h-2.5 bg-white/[0.06] rounded-full overflow-hidden border border-white/[0.06]">
  
  {/* Render one div per segment */}
  {segments.map((seg, i) => (
    <div
      key={i}
      className="absolute top-0 h-full bg-gradient-to-r from-green-600 to-green-500 rounded-sm"
      style={{
        left: `${(seg.start / duration) * 100}%`,
        width: `${((seg.end - seg.start) / duration) * 100}%`,
      }}
    />
  ))}

  {/* Hover timestamp tooltip (optional in Phase 3) */}
</div>
```

### Dividers

```tsx
/* Horizontal divider */
<div className="h-px bg-white/[0.06] my-5" />

/* Divider with label */
<div className="flex items-center gap-3 my-5">
  <div className="flex-1 h-px bg-white/[0.06]" />
  <span className="text-xs text-[--text-muted]">or</span>
  <div className="flex-1 h-px bg-white/[0.06]" />
</div>
```

### Loading Skeleton

```tsx
/* Skeleton base — use for all loading states */
className="animate-pulse bg-white/[0.06] rounded-xl"

/* Example skeleton card */
<div className="bg-white/[0.05] border border-white/[0.08] rounded-2xl p-5 space-y-3">
  <div className="animate-pulse bg-white/[0.06] h-4 w-3/4 rounded-lg" />
  <div className="animate-pulse bg-white/[0.06] h-3 w-1/2 rounded-lg" />
  <div className="animate-pulse bg-white/[0.06] h-2.5 w-full rounded-full mt-4" />
</div>
```

---

## 6. Layout System

### Page Layout

```tsx
/* Dashboard layout structure */
<div className="flex h-screen bg-[--bg-primary] overflow-hidden">
  
  {/* Sidebar — desktop only */}
  <aside className="hidden md:flex w-60 flex-col border-r border-white/[0.06] bg-white/[0.02] backdrop-blur-sm shrink-0">
    ...
  </aside>

  {/* Main content area */}
  <main className="flex-1 overflow-y-auto">
    
    {/* Mobile top navbar */}
    <nav className="md:hidden sticky top-0 z-50 border-b border-white/[0.06] bg-[--bg-primary]/80 backdrop-blur-xl px-4 py-3">
      ...
    </nav>

    {/* Page content */}
    <div className="max-w-4xl mx-auto px-4 md:px-6 py-6">
      {children}
    </div>

    {/* Mobile bottom nav */}
    <nav className="md:hidden fixed bottom-0 left-0 right-0 border-t border-white/[0.06] bg-[--bg-primary]/90 backdrop-blur-xl px-4 py-2 flex justify-around">
      ...
    </nav>
  </main>

</div>
```

### Spacing Scale

Use Tailwind's default spacing. Common patterns used in this project:

```
Gap between page sections:  mb-8 (32px)
Gap between cards:          gap-4 (16px)
Card padding (standard):    p-5 (20px)
Card padding (compact):     p-3 (12px)
Card padding (spacious):    p-7 (28px)
Input padding:              px-4 py-3
Button padding (md):        px-5 py-2.5
Sidebar width:              w-60 (240px)
Max content width:          max-w-4xl (896px)
```

### Responsive Breakpoints

```
Mobile:   < 768px    (md breakpoint)
Tablet:   768–1279px
Desktop:  ≥ 1280px   (xl breakpoint)

Key changes at md:
- Sidebar visible, bottom nav hidden
- Grid goes from 1 column to 2 columns
- Player + chat panel side by side (instead of stacked)
- Modal becomes centered (instead of full screen)
```

---

## 7. Animation System

### Framer Motion Presets

Define these in `lib/animations.ts` and import everywhere.

```typescript
// lib/animations.ts

export const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -8 },
  transition: { duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }
}

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit:    { opacity: 0 },
  transition: { duration: 0.2 }
}

export const slideInRight = {
  initial: { opacity: 0, x: 24 },
  animate: { opacity: 1, x: 0 },
  exit:    { opacity: 0, x: 24 },
  transition: { duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }
}

export const scaleIn = {
  initial: { opacity: 0, scale: 0.96 },
  animate: { opacity: 1, scale: 1 },
  exit:    { opacity: 0, scale: 0.96 },
  transition: { duration: 0.2 }
}

export const staggerContainer = {
  animate: {
    transition: { staggerChildren: 0.07 }
  }
}

export const staggerItem = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.22 }
}
```

### When to Use Each

```
fadeUp        → Page-level content appearing on load
fadeIn        → Overlays, toasts, tooltips
slideInRight  → TranscriptChat panel, drawer menus
scaleIn       → Modals, dropdowns, popovers
stagger       → Lists of cards (CourseCards, VideoListItems, ScheduleDayCards)
```

### Hover Animations (Tailwind only — no Framer Motion needed)

```tsx
/* Cards */
className="... hover:-translate-y-0.5 transition-transform duration-200"

/* Buttons */
className="... active:scale-[0.98] transition-transform duration-100"

/* Links / nav items */
className="... hover:text-[--text-primary] transition-colors duration-150"
```

---

## 8. Icons

Use `lucide-react` exclusively. Do not use any other icon library.

```tsx
import { Play, Pause, CheckCircle, Clock, Calendar, Youtube, ChevronRight, X, Plus, ArrowLeft } from 'lucide-react'

/* Standard size: w-4 h-4 (16px) for inline, w-5 h-5 (20px) for standalone */
<Play className="w-4 h-4 text-[--text-muted]" />
<CheckCircle className="w-5 h-5 text-green-400" />
```

### Icon + Label Pattern

```tsx
<div className="flex items-center gap-2 text-sm text-[--text-secondary]">
  <Clock className="w-4 h-4 text-[--text-muted] shrink-0" />
  <span>1h 23min remaining</span>
</div>
```

---

## 9. Sidebar Design

```
Width:          240px (w-60)
Background:     bg-white/[0.02] with border-r border-white/[0.06]

Logo section:   h-14, border-b border-white/[0.06]
  - "LL" square icon (purple gradient background, 28×28)
  - "LearnLoop" text in Syne 700

Nav items:
  Default:    text-[--text-muted] hover:text-[--text-secondary] hover:bg-white/[0.04]
  Active:     text-[--text-primary] bg-purple-500/[0.12] border-l-2 border-purple-500

User section:  mt-auto, border-t border-white/[0.06], p-3
  - Avatar (32×32, rounded-full)
  - Name (text-sm font-medium)
  - Logout icon button
```

---

## 10. Tailwind Config

Full `tailwind.config.ts` for this project:

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        heading: ['var(--font-syne)', 'sans-serif'],
        body:    ['var(--font-dm-sans)', 'sans-serif'],
        mono:    ['var(--font-jetbrains)', 'monospace'],
      },
      colors: {
        accent: {
          DEFAULT: '#7C5CFC',
          hover:   '#6B4EE0',
          light:   '#A78BFA',
          lighter: '#C4B5FD',
        },
        bg: {
          primary:   '#0A0812',
          secondary: '#120F1E',
          card:      '#1A1628',
        },
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      backdropBlur: {
        xs: '2px',
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '24px',
      },
      boxShadow: {
        'accent': '0 0 30px rgba(124, 92, 252, 0.15)',
        'card':   '0 4px 24px rgba(0, 0, 0, 0.3)',
        'glow':   '0 0 20px rgba(124, 92, 252, 0.25)',
      },
    },
  },
  plugins: [],
}

export default config
```
