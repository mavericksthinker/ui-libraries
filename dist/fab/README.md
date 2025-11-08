# Floating Action Button (FAB)

Apple-inspired expandable floating action button with smooth bounce physics and text expansion animations.

## Features

- 🎨 Apple-style bounce animation (inspired by iPhone 17 Pro)
- ✨ Radiant halo glow effect
- 📱 Fully responsive (desktop, tablet, mobile)
- 🎯 Auto-hide in specific sections
- 🌓 Light and dark themes
- ♿ Accessibility-focused (ARIA labels, keyboard navigation)
- 🎭 Multiple variants (standard, text-only, pill button)
- ⚡ GPU-accelerated 60fps animations
- 🔧 Zero dependencies

---

## Quick Start

### CDN Links

```html
<!-- CSS -->
<link rel="stylesheet" href="https://your-cdn.com/fab/css/fab.css">

<!-- JavaScript -->
<script src="https://your-cdn.com/fab/js/fab.js"></script>
```

### Basic HTML

```html
<div class="fab-container"
     data-hide-on="hero,footer"
     data-position="bottom-center"
     data-theme="dark">
  <div class="fab">
    <div class="fab__halo"></div>
    <div class="fab__content">
      <button class="fab__button" aria-label="Get started">
        <svg class="fab__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M13 2L3 14h8l-1 8 10-12h-8l1-8z"/>
        </svg>
        <span class="fab__text">Get Started</span>
      </button>
    </div>
  </div>
</div>
```

---

## Integration

### Webflow

#### Step 1: Add Custom Code

1. Go to **Project Settings** → **Custom Code**
2. In the **Head Code** section, add:

```html
<link rel="stylesheet" href="https://your-cdn.com/fab/css/fab.css">
```

3. In the **Footer Code** section (or before `</body>`), add:

```html
<script src="https://your-cdn.com/fab/js/fab.js"></script>
```

#### Step 2: Add HTML Embed

1. Drag an **Embed** element to your page (place it at the bottom)
2. Paste the FAB HTML code:

```html
<div class="fab-container"
     data-hide-on="hero,footer"
     data-position="bottom-center"
     data-theme="dark">
  <div class="fab">
    <div class="fab__halo"></div>
    <div class="fab__content">
      <button class="fab__button" aria-label="Get started">
        <svg class="fab__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M13 2L3 14h8l-1 8 10-12h-8l1-8z"/>
        </svg>
        <span class="fab__text">Get Started</span>
      </button>
    </div>
  </div>
</div>
```

#### Step 3: Set Section IDs

1. Select your hero section → Settings → **ID**: `hero`
2. Select your footer section → Settings → **ID**: `footer`
3. The FAB will automatically hide in these sections!

---

### Vanilla JavaScript / HTML

#### 1. Include Files

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My Website</title>

  <!-- FAB CSS -->
  <link rel="stylesheet" href="path/to/fab/css/fab.css">
</head>
<body>

  <!-- Your content -->
  <section id="hero">Hero Section</section>
  <section id="content">Main Content</section>
  <section id="footer">Footer</section>

  <!-- FAB Component -->
  <div class="fab-container"
       data-hide-on="hero,footer"
       data-position="bottom-center"
       data-theme="dark">
    <div class="fab">
      <div class="fab__halo"></div>
      <div class="fab__content">
        <button class="fab__button" aria-label="Get started">
          <svg class="fab__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M13 2L3 14h8l-1 8 10-12h-8l1-8z"/>
          </svg>
          <span class="fab__text">Get Started</span>
        </button>
      </div>
    </div>
  </div>

  <!-- FAB JavaScript -->
  <script src="path/to/fab/js/fab.js"></script>

</body>
</html>
```

---

## Configuration

### Data Attributes

| Attribute | Values | Default | Description |
|-----------|--------|---------|-------------|
| `data-hide-on` | Comma-separated IDs | Required | Sections where FAB should hide |
| `data-position` | `bottom-center`, `bottom-right`, `bottom-left`, `top-center`, `top-right`, `top-left` | `bottom-center` | FAB position |
| `data-theme` | `dark`, `light` | `dark` | Color theme |
| `data-align` | `left`, `right`, `center` | `center` | Icon alignment and expansion direction |
| `data-threshold` | `0.0` to `1.0` | `0.3` | IntersectionObserver threshold |
| `data-halo-color` | RGB values | `59, 130, 246` | Custom halo color (e.g., `255, 0, 0`) |

### Examples

**Light Theme, Right Position:**
```html
<div class="fab-container"
     data-hide-on="hero,footer"
     data-position="bottom-right"
     data-theme="light">
  <!-- ... -->
</div>
```

**Custom Halo Color (Red):**
```html
<div class="fab-container"
     data-hide-on="hero,footer"
     data-halo-color="255, 0, 0">
  <!-- ... -->
</div>
```

---

## Variants

### 1. Standard FAB (Icon + Text)

```html
<div class="fab-container" data-hide-on="hero,footer">
  <div class="fab">
    <div class="fab__halo"></div>
    <div class="fab__content">
      <button class="fab__button" aria-label="Get started">
        <svg class="fab__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M13 2L3 14h8l-1 8 10-12h-8l1-8z"/>
        </svg>
        <span class="fab__text">Get Started</span>
      </button>
    </div>
  </div>
</div>
```

### 2. Text-Only (No Icon)

```html
<div class="fab-container" data-hide-on="hero,footer">
  <div class="fab">
    <div class="fab__halo"></div>
    <div class="fab__content">
      <button class="fab__button" aria-label="Learn more">
        <span class="fab__text">Learn More</span>
      </button>
    </div>
  </div>
</div>
```

### 3. Pill Button (Always Expanded)

```html
<style>
/* Add this to your custom CSS or in a <style> tag */
.fab-container.fab-pill .fab {
  width: auto !important;
  min-width: auto !important;
  animation: none !important;
  transition: opacity 0.3s ease !important;
}

.fab-container.fab-pill[data-state="fully-visible"] .fab {
  opacity: 1;
  transform: translateY(0) scale(1);
}

.fab-container.fab-pill[data-state="hidden"] .fab {
  opacity: 0;
  transform: translateY(0) scale(1);
}

.fab-container.fab-pill .fab__halo {
  display: none;
}

.fab-container.fab-pill .fab__text {
  opacity: 1 !important;
  width: auto !important;
  max-width: none !important;
}

.fab-container.fab-pill .fab__content {
  border-radius: 100px;
  padding: 0 2rem;
  min-height: 52px;
}

.fab-container.fab-pill .fab__button,
.fab-container.fab-pill .fab__link {
  padding: 0 !important;
  gap: 0.75rem !important;
  justify-content: center !important;
}

.fab-pill.pill-purple {
  --fab-bg-color: #2d1b4e;
  --fab-hover-bg: #3d2b5e;
}
</style>

<div class="fab-container fab-pill pill-purple"
     data-hide-on="hero,footer"
     data-position="bottom-center">
  <div class="fab">
    <div class="fab__content">
      <button class="fab__button" aria-label="Take the quiz">
        <span class="fab__text">Take the quiz</span>
      </button>
    </div>
  </div>
</div>
```

### 4. Link Instead of Button

```html
<div class="fab-container" data-hide-on="hero,footer">
  <div class="fab">
    <div class="fab__halo"></div>
    <div class="fab__content">
      <a href="#contact" class="fab__link" aria-label="Contact us">
        <svg class="fab__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
        <span class="fab__text">Contact Us</span>
      </a>
    </div>
  </div>
</div>
```

---

## Custom Styling

### Custom Colors

Use CSS custom properties for easy theming:

```html
<style>
.fab-container.custom-blue {
  --fab-bg-color: #0066cc;
  --fab-hover-bg: #0077ed;
  --fab-halo-color: 0, 102, 204;
  --fab-text-color: #ffffff;
}
</style>

<div class="fab-container custom-blue" data-hide-on="hero,footer">
  <!-- ... -->
</div>
```

### Available CSS Variables

```css
:root {
  --fab-offset: 2rem;                    /* Distance from edge */
  --fab-collapsed-size: 44px;            /* Circle size */
  --fab-bg-color: rgba(0, 0, 0, 0.85);  /* Background color */
  --fab-text-color: #ffffff;             /* Text color */
  --fab-halo-color: 59, 130, 246;       /* Halo RGB */
  --fab-appear-duration: 0.5s;          /* Bounce animation speed */
  --fab-expand-duration: 0.4s;          /* Text expansion speed */
}
```

---

## Icons

You can use any SVG icons. Here are some popular options:

### Using Custom SVG
```html
<svg class="fab__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
  <!-- Your SVG path here -->
</svg>
```

### Popular Icon Libraries

**Heroicons:**
```html
<svg class="fab__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
  <path stroke-linecap="round" stroke-linejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
</svg>
```

**Feather Icons:**
```html
<svg class="fab__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
  <circle cx="11" cy="11" r="8"></circle>
  <path d="m21 21-4.35-4.35"></path>
</svg>
```

---

## JavaScript API

### Auto-initialization

FABs initialize automatically on page load. No JavaScript code needed!

### Manual Control (Advanced)

```javascript
// Get FAB instance
const container = document.querySelector('.fab-container');
const fab = container.__fabInstance;

// Show/Hide manually
fab.show();
fab.hide();

// Update sections dynamically
fab.updateSections('new-section-1,new-section-2');

// Destroy instance
fab.destroy();

// Create new instance
const newFab = new FloatingActionButton(container, {
  threshold: 0.5,
  enableScrollBounce: false,
  textRevealDelay: 200
});
```

### Event Handling

```javascript
// Listen to button clicks
const button = document.querySelector('.fab__button');
button.addEventListener('click', () => {
  console.log('FAB clicked!');
  // Your custom action
});

// Monitor state changes
const container = document.querySelector('.fab-container');
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.attributeName === 'data-state') {
      const state = container.getAttribute('data-state');
      console.log('FAB state:', state); // hidden, icon-visible, fully-visible
    }
  });
});

observer.observe(container, {
  attributes: true,
  attributeFilter: ['data-state']
});
```

---

## Browser Support

- Chrome/Edge (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- iOS Safari (latest 2 versions)
- Android Chrome (latest 2 versions)

### Required Features
- IntersectionObserver API
- CSS Custom Properties
- CSS Animations
- Flexbox

---

## Performance

- GPU-accelerated animations
- Efficient IntersectionObserver
- Minimal repaints/reflows
- ~5KB CSS (minified)
- ~3KB JS (minified)
- Zero dependencies

---

## Accessibility

- ✅ ARIA labels on buttons
- ✅ Keyboard navigation support
- ✅ Focus management
- ✅ Screen reader friendly
- ✅ Reduced motion support
- ✅ High contrast mode support

---

## Troubleshooting

### FAB not appearing?

**Check:**
1. Section IDs match `data-hide-on` values
2. FAB is not inside a hidden parent element
3. CSS and JS files are loaded correctly
4. No JavaScript errors in console

### FAB not hiding in sections?

**Make sure:**
1. Sections have correct IDs (e.g., `id="hero"`)
2. `data-hide-on` attribute has correct comma-separated IDs
3. Sections are visible in viewport (IntersectionObserver requires visibility)

### Animation is janky?

**Try:**
1. Reduce number of FABs on page (max 3-4 recommended)
2. Ensure GPU acceleration is working (check browser DevTools)
3. Disable scroll bounce: add `data-scroll-bounce="false"` (if available)

---

## Examples

### E-commerce Site
```html
<div class="fab-container"
     data-hide-on="hero,footer,checkout"
     data-position="bottom-right"
     data-theme="dark">
  <div class="fab">
    <div class="fab__halo"></div>
    <div class="fab__content">
      <button class="fab__button" aria-label="View cart" onclick="openCart()">
        <svg class="fab__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="9" cy="21" r="1"></circle>
          <circle cx="20" cy="21" r="1"></circle>
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
        </svg>
        <span class="fab__text">Cart (3)</span>
      </button>
    </div>
  </div>
</div>
```

### Landing Page
```html
<div class="fab-container"
     data-hide-on="hero,footer"
     data-position="bottom-center"
     data-theme="dark">
  <div class="fab">
    <div class="fab__halo"></div>
    <div class="fab__content">
      <button class="fab__button" aria-label="Get started" onclick="scrollToSignup()">
        <svg class="fab__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M13 2L3 14h8l-1 8 10-12h-8l1-8z"/>
        </svg>
        <span class="fab__text">Get Started</span>
      </button>
    </div>
  </div>
</div>
```

---

## License

MIT License - Free for commercial and personal use

---

## Support

For issues, questions, or feature requests, please open an issue on GitHub.

---

**Made with ❤️ by the UI Libraries Team**
