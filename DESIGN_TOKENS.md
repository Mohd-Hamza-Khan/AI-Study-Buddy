# 🎨 DESIGN TOKEN STRUCTURE FOR AI STUDY BUDDY

## Production-Ready Design System

A comprehensive token system for consistent theming, spacing, and styling across all modules.

---

## 📐 SPACING TOKENS (4px Base Scale)

```css
:root {
  /* Base scale — 4px increments */
  --space-0: 0px;
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-7: 28px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;
  --space-16: 64px;
  --space-20: 80px;
  --space-24: 96px;
}
```

### Usage Guidelines

| Token | Use Case | Example |
|-------|----------|---------|
| `--space-1` (4px) | Icon margins, tight spacing | `margin-left: var(--space-1)` |
| `--space-2` (8px) | Button gaps, small margins | `gap: var(--space-2)` |
| `--space-3` (12px) | Card item spacing, padding | `padding: var(--space-3)` |
| `--space-4` (16px) | Section padding, default gap | `padding: var(--space-4)` |
| `--space-5` (20px) | Comfortable spacing | `margin-bottom: var(--space-5)` |
| `--space-6` (24px) | Section gaps (main rhythm) | `gap: var(--space-6)` |
| `--space-8` (32px) | Large section spacing | `margin-top: var(--space-8)` |
| `--space-12` (48px) | Hero sections, major dividers | `padding: var(--space-12)` |

---

## 🎨 COLOR TOKENS

### Foundation Colors
```css
:root {
  /* Background layers */
  --bg-base: #0F172A;        /* App background */
  --bg-surface: #1E293B;     /* Cards, panels */
  --bg-elevated: #334155;    /* Hover states, inputs */
  --bg-overlay: rgba(15, 23, 42, 0.95); /* Modals, overlays */

  /* Text hierarchy */
  --text-primary: #F1F5F9;   /* Main text */
  --text-secondary: #CBD5E1; /* Subheadings */
  --text-tertiary: #94A3B8;  /* Muted text */
  --text-disabled: #64748B;  /* Disabled state */

  /* Border & dividers */
  --border-subtle: #1E293B;  /* Very subtle borders */
  --border-default: #334155; /* Standard borders */
  --border-strong: #475569;  /* Emphasized borders */
  --border-hover: #64748B;   /* Interactive borders */
}
```

### Brand Colors
```css
:root {
  /* Primary (Indigo) */
  --primary-50: #EEF2FF;
  --primary-100: #E0E7FF;
  --primary-200: #C7D2FE;
  --primary-300: #A5B4FC;
  --primary-400: #818CF8;
  --primary-500: #6366F1;    /* Main brand */
  --primary-600: #4F46E5;    /* Hover */
  --primary-700: #4338CA;    /* Active */
  --primary-800: #3730A3;
  --primary-900: #312E81;

  /* Semantic colors */
  --success: #22C55E;        /* Green */
  --success-bg: rgba(34, 197, 94, 0.1);
  --success-border: rgba(34, 197, 94, 0.3);

  --error: #EF4444;          /* Red */
  --error-bg: rgba(239, 68, 68, 0.1);
  --error-border: rgba(239, 68, 68, 0.3);

  --warning: #F59E0B;        /* Amber */
  --warning-bg: rgba(245, 158, 11, 0.1);
  --warning-border: rgba(245, 158, 11, 0.3);

  --info: #3B82F6;           /* Blue */
  --info-bg: rgba(59, 130, 246, 0.1);
  --info-border: rgba(59, 130, 246, 0.3);
}
```

### Module-Specific Colors
```css
:root {
  /* Voice Q&A */
  --voice-accent: #8B5CF6;   /* Purple */
  --voice-active: #A855F7;

  /* Visual Learning */
  --visual-accent: #06B6D4;  /* Cyan */
  --visual-active: #0891B2;

  /* Notes */
  --notes-accent: #10B981;   /* Emerald */
  --notes-active: #059669;

  /* Quiz */
  --quiz-accent: #F97316;    /* Orange */
  --quiz-active: #EA580C;
}
```

---

## 📏 SIZE TOKENS

### Typography Scale
```css
:root {
  /* Font sizes (based on 16px root) */
  --text-xs: 11px;      /* 0.6875rem */
  --text-sm: 12px;      /* 0.75rem */
  --text-base: 14px;    /* 0.875rem */
  --text-lg: 16px;      /* 1rem */
  --text-xl: 18px;      /* 1.125rem */
  --text-2xl: 20px;     /* 1.25rem */
  --text-3xl: 24px;     /* 1.5rem */
  --text-4xl: 32px;     /* 2rem */

  /* Line heights */
  --leading-none: 1;
  --leading-tight: 1.2;
  --leading-snug: 1.4;
  --leading-normal: 1.5;
  --leading-relaxed: 1.6;
  --leading-loose: 1.8;

  /* Font weights */
  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;
}
```

### Border Radius
```css
:root {
  --radius-none: 0px;
  --radius-sm: 6px;      /* Subtle rounding */
  --radius-base: 8px;    /* Standard */
  --radius-md: 12px;     /* Cards, containers */
  --radius-lg: 16px;     /* Large cards */
  --radius-xl: 20px;     /* Hero sections */
  --radius-2xl: 24px;
  --radius-full: 9999px; /* Pills, badges */
}
```

### Shadows
```css
:root {
  /* Elevation system */
  --shadow-xs: 0 1px 2px 0 rgba(0, 0, 0, 0.2);
  --shadow-sm: 0 1px 3px 0 rgba(0, 0, 0, 0.3),
               0 1px 2px -1px rgba(0, 0, 0, 0.3);
  --shadow-base: 0 4px 6px -1px rgba(0, 0, 0, 0.4),
                 0 2px 4px -2px rgba(0, 0, 0, 0.4);
  --shadow-md: 0 10px 15px -3px rgba(0, 0, 0, 0.4),
               0 4px 6px -4px rgba(0, 0, 0, 0.4);
  --shadow-lg: 0 20px 25px -5px rgba(0, 0, 0, 0.4),
               0 8px 10px -6px rgba(0, 0, 0, 0.4);
  --shadow-xl: 0 25px 50px -12px rgba(0, 0, 0, 0.5);

  /* Colored shadows */
  --shadow-primary: 0 4px 12px rgba(99, 102, 241, 0.3);
  --shadow-success: 0 4px 12px rgba(34, 197, 94, 0.3);
  --shadow-error: 0 4px 12px rgba(239, 68, 68, 0.3);
}
```

---

## ⏱️ ANIMATION TOKENS

### Duration
```css
:root {
  --duration-instant: 0ms;
  --duration-fast: 150ms;
  --duration-base: 200ms;
  --duration-slow: 300ms;
  --duration-slower: 500ms;
  --duration-slowest: 800ms;
}
```

### Easing
```css
:root {
  --ease-linear: linear;
  --ease-in: cubic-bezier(0.4, 0, 1, 1);
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
  --ease-smooth: cubic-bezier(0.45, 0.05, 0.55, 0.95);
}
```

### Transitions (Precomposed)
```css
:root {
  --transition-fast: all var(--duration-fast) var(--ease-out);
  --transition-base: all var(--duration-base) var(--ease-out);
  --transition-slow: all var(--duration-slow) var(--ease-out);
  --transition-colors: color var(--duration-base) var(--ease-out),
                       background-color var(--duration-base) var(--ease-out),
                       border-color var(--duration-base) var(--ease-out);
  --transition-transform: transform var(--duration-base) var(--ease-out);
  --transition-opacity: opacity var(--duration-base) var(--ease-out);
}
```

---

## 📦 CONTAINER TOKENS

### Max Widths
```css
:root {
  --container-xs: 320px;   /* Minimal mobile */
  --container-sm: 480px;   /* Small mobile */
  --container-md: 600px;   /* Large mobile / current app max */
  --container-lg: 800px;   /* Tablet */
  --container-xl: 1024px;  /* Desktop */
  --container-2xl: 1280px; /* Large desktop */
  --container-full: 100%;
}
```

### Breakpoints
```css
:root {
  --breakpoint-xs: 320px;
  --breakpoint-sm: 480px;
  --breakpoint-md: 768px;
  --breakpoint-lg: 1024px;
  --breakpoint-xl: 1280px;
  --breakpoint-2xl: 1536px;
}
```

---

## 🎯 COMPONENT TOKENS

### Buttons
```css
:root {
  /* Sizes */
  --btn-height-sm: 32px;
  --btn-height-base: 40px;
  --btn-height-lg: 48px;
  --btn-height-xl: 56px;

  --btn-padding-sm: var(--space-2) var(--space-3);
  --btn-padding-base: var(--space-3) var(--space-4);
  --btn-padding-lg: var(--space-4) var(--space-6);

  /* States */
  --btn-disabled-opacity: 0.5;
  --btn-active-scale: 0.97;
}
```

### Inputs
```css
:root {
  --input-height-sm: 32px;
  --input-height-base: 40px;
  --input-height-lg: 48px;

  --input-padding-x: var(--space-3);
  --input-padding-y: var(--space-2);

  --input-border-width: 1px;
  --input-border-radius: var(--radius-base);

  --input-focus-ring: 0 0 0 3px rgba(99, 102, 241, 0.1);
}
```

### Cards
```css
:root {
  --card-padding-sm: var(--space-3);
  --card-padding-base: var(--space-4);
  --card-padding-lg: var(--space-6);

  --card-border-width: 1px;
  --card-border-radius: var(--radius-md);

  --card-shadow: var(--shadow-sm);
  --card-shadow-hover: var(--shadow-md);
}
```

---

## 🌐 Z-INDEX SYSTEM

```css
:root {
  --z-base: 0;           /* Normal content */
  --z-dropdown: 1000;    /* Dropdowns */
  --z-sticky: 1100;      /* Sticky elements */
  --z-fixed: 1200;       /* Fixed elements */
  --z-modal-backdrop: 1300; /* Modal backgrounds */
  --z-modal: 1400;       /* Modals */
  --z-popover: 1500;     /* Popovers, tooltips */
  --z-toast: 1600;       /* Toast notifications */
}
```

---

## 📊 PRACTICAL USAGE EXAMPLES

### 1. Consistent Button Component
```css
.btn {
  /* Base */
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  
  /* Size */
  height: var(--btn-height-base);
  padding: var(--btn-padding-base);
  
  /* Typography */
  font-size: var(--text-base);
  font-weight: var(--font-medium);
  line-height: var(--leading-none);
  
  /* Appearance */
  border: 1px solid transparent;
  border-radius: var(--radius-base);
  background: var(--bg-elevated);
  color: var(--text-primary);
  
  /* Interaction */
  cursor: pointer;
  transition: var(--transition-colors), var(--transition-transform);
}

.btn:hover {
  background: var(--border-hover);
  transform: translateY(-1px);
}

.btn:active {
  transform: scale(var(--btn-active-scale));
}

.btn:disabled {
  opacity: var(--btn-disabled-opacity);
  cursor: not-allowed;
}

.btn-primary {
  background: var(--primary-500);
  color: white;
}

.btn-primary:hover {
  background: var(--primary-600);
  box-shadow: var(--shadow-primary);
}

.btn-lg {
  height: var(--btn-height-lg);
  padding: var(--btn-padding-lg);
  font-size: var(--text-lg);
}
```

### 2. Card with Hover Effect
```css
.card {
  padding: var(--card-padding-base);
  background: var(--bg-surface);
  border: var(--card-border-width) solid var(--border-default);
  border-radius: var(--card-border-radius);
  box-shadow: var(--card-shadow);
  transition: var(--transition-base);
}

.card:hover {
  border-color: var(--primary-500);
  box-shadow: var(--card-shadow-hover);
  transform: translateY(-2px);
}
```

### 3. Input Field
```css
.input {
  width: 100%;
  height: var(--input-height-base);
  padding: var(--input-padding-y) var(--input-padding-x);
  
  font-size: var(--text-base);
  line-height: var(--leading-normal);
  color: var(--text-primary);
  
  background: var(--bg-elevated);
  border: var(--input-border-width) solid var(--border-default);
  border-radius: var(--input-border-radius);
  
  outline: none;
  transition: var(--transition-colors);
}

.input:focus {
  border-color: var(--primary-500);
  box-shadow: var(--input-focus-ring);
  background: rgba(99, 102, 241, 0.05);
}

.input::placeholder {
  color: var(--text-tertiary);
  opacity: 0.6;
}
```

### 4. Section Spacing
```css
.section {
  display: flex;
  flex-direction: column;
  gap: var(--space-6); /* Main rhythm */
}

.section-header {
  display: flex;
  flex-direction: column;
  gap: var(--space-2); /* Tight grouping */
}

.section-content {
  display: grid;
  gap: var(--space-4); /* Content spacing */
}
```

---

## 🔄 MIGRATION GUIDE

### Replace Old Variables
```css
/* OLD (inconsistent) */
--bg: #0F172A;
--bg-card: #1E293B;
border-radius: 12px;
padding: 16px;

/* NEW (token-based) */
--bg-base: #0F172A;
--bg-surface: #1E293B;
border-radius: var(--radius-md);
padding: var(--space-4);
```

### Update Component Styles
```diff
.vision-panel {
-  padding: 16px;
-  gap: 12px;
+  padding: var(--space-4);
+  gap: var(--space-6);
}

.vision-camera {
-  border-radius: 12px;
-  background: #1E293B;
+  border-radius: var(--radius-md);
+  background: var(--bg-surface);
}
```

---

## 🎓 BEST PRACTICES

### 1. Use Semantic Tokens
```css
/* ❌ Avoid raw values */
.button { 
  background: #6366F1; 
  padding: 12px 16px;
}

/* ✅ Use semantic tokens */
.button {
  background: var(--primary-500);
  padding: var(--space-3) var(--space-4);
}
```

### 2. Compose Transitions
```css
/* ❌ Avoid inline timing */
.card {
  transition: all 0.2s ease;
}

/* ✅ Use composed tokens */
.card {
  transition: var(--transition-base);
}
```

### 3. Maintain Vertical Rhythm
```css
/* ✅ Consistent spacing hierarchy */
.panel {
  gap: var(--space-6);  /* Section-level */
}

.section {
  gap: var(--space-4);  /* Content-level */
}

.item {
  gap: var(--space-2);  /* Element-level */
}
```

### 4. Use Modular Scale for Typography
```css
.heading-xl { font-size: var(--text-3xl); }
.heading-lg { font-size: var(--text-2xl); }
.heading { font-size: var(--text-xl); }
.body { font-size: var(--text-base); }
.caption { font-size: var(--text-sm); }
.label { font-size: var(--text-xs); }
```

---

## 🚀 IMPLEMENTATION PLAN

### Phase 1: Core Tokens (Week 1)
- [ ] Add spacing scale to `:root`
- [ ] Update color tokens with semantic names
- [ ] Add typography scale
- [ ] Define animation tokens

### Phase 2: Component Tokens (Week 2)
- [ ] Button size/state tokens
- [ ] Input field tokens
- [ ] Card tokens
- [ ] Badge/label tokens

### Phase 3: Migration (Week 3)
- [ ] Update Visual tab (already done)
- [ ] Migrate Voice tab
- [ ] Migrate Notes tab
- [ ] Migrate Quiz tab

### Phase 4: Documentation (Week 4)
- [ ] Create token reference guide
- [ ] Add Storybook/Figma integration
- [ ] Document usage examples
- [ ] Set up linting rules

---

## ✅ BENEFITS

1. **Consistency**: Predictable spacing and colors across all modules
2. **Maintainability**: Single source of truth for design decisions
3. **Scalability**: Easy to add themes (light mode, high contrast)
4. **Performance**: CSS custom properties are extremely fast
5. **Developer Experience**: Autocomplete support in modern editors
6. **Accessibility**: Semantic color names improve clarity
7. **Responsiveness**: Token-based breakpoints and containers

---

## 🔮 FUTURE ENHANCEMENTS

### Light Theme Support
```css
@media (prefers-color-scheme: light) {
  :root {
    --bg-base: #F8FAFC;
    --bg-surface: #FFFFFF;
    --bg-elevated: #F1F5F9;
    --text-primary: #0F172A;
    --text-secondary: #334155;
    --text-tertiary: #64748B;
    /* ... */
  }
}
```

### Programmatic Theme Switching
```typescript
const setTheme = (theme: 'dark' | 'light') => {
  document.documentElement.setAttribute('data-theme', theme);
};
```

```css
[data-theme='light'] {
  --bg-base: #F8FAFC;
  /* ... */
}

[data-theme='dark'] {
  --bg-base: #0F172A;
  /* ... */
}
```

---

This design token structure ensures your AI Study Buddy app remains consistent, scalable, and maintainable as it grows.
