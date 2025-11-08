# FAB Webflow Quick Start

## Problem: FAB Not Showing?

Follow these steps **exactly** to get the FAB working on your Webflow site.

---

## Step 1: Upload Files to Webflow Assets

1. Go to **Webflow Designer** → **Assets Panel** (press `A`)
2. Click **Upload** button
3. Upload these files:
   - `fab.css` (from `dist/fab/css/`)
   - `fab.js` (from `dist/fab/js/`)
4. **Right-click each file** → **Copy URL** → Save these URLs

Example URLs you'll get:
```
https://uploads-ssl.webflow.com/YOUR_SITE_ID/fab.css
https://uploads-ssl.webflow.com/YOUR_SITE_ID/fab.js
```

---

## Step 2: Add Custom Code

### 2a. Add CSS to Head

1. Go to **Project Settings** (gear icon) → **Custom Code**
2. In **Head Code**, paste:

```html
<link rel="stylesheet" href="PASTE_YOUR_FAB_CSS_URL_HERE">
```

### 2b. Add JS to Footer

3. In **Footer Code** (before `</body>` tag), paste:

```html
<script src="PASTE_YOUR_FAB_JS_URL_HERE"></script>
```

4. Click **Save Changes**

---

## Step 3: Add FAB HTML Element

1. Open your page in **Webflow Designer**
2. Drag an **Embed** element to the **bottom of your page** (after all sections)
3. Paste this HTML:

```html
<div class="fab-container"
     data-hide-on="hero,footer"
     data-position="bottom-center"
     data-theme="dark">
  <div class="fab">
    <div class="fab__halo"></div>
    <div class="fab__content">
      <button class="fab__button"
              aria-label="Learn more"
              onclick="alert('FAB clicked!')">
        <span class="fab__text">Learn More</span>
      </button>
    </div>
  </div>
</div>
```

4. Click **Save & Close**

---

## Step 4: Set Section IDs

The FAB hides in sections you specify. You need to give your sections IDs:

### For Hero Section:
1. Select your **top/hero section** (the first big section)
2. In the **Settings Panel** (right side) → **Element Settings**
3. Find **ID** field
4. Type: `hero`

### For Footer Section:
1. Select your **footer section** (the last section)
2. In **Settings Panel** → **Element Settings**
3. Find **ID** field
4. Type: `footer`

---

## Step 5: Publish & Test

1. Click **Publish** in top-right
2. Visit your published page
3. Open **Browser Console** (F12 or Cmd+Option+J)
4. Look for these messages:
   ```
   ✅ FAB element found
   ✅ Hero section found
   ✅ Footer section found
   ```

---

## Troubleshooting

### FAB Still Not Showing?

**Check Console for Errors:**

Press `F12` (or `Cmd+Option+J` on Mac) to open browser console.

**Common Issues:**

1. **404 Error for fab.css or fab.js**
   - Solution: Re-upload files to Webflow Assets and update URLs

2. **"Section with ID 'hero' not found"**
   - Solution: Make sure your hero section has `id="hero"` set

3. **FAB appears but doesn't animate**
   - Solution: Scroll down past hero section - it should bounce in!

4. **FAB is always visible**
   - Solution: Make sure you're scrolling between sections

---

## Quick Test Version

Want to test if FAB works BEFORE setting everything up? Use this:

### Test HTML (Paste in Embed Element)

```html
<!-- This version works without uploaded files - uses external CDN -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/YOUR_GITHUB/ui-libraries@main/dist/fab/css/fab.css">

<div class="fab-container"
     data-hide-on="hero,footer"
     data-position="bottom-center"
     data-theme="dark">
  <div class="fab">
    <div class="fab__halo"></div>
    <div class="fab__content">
      <button class="fab__button" aria-label="Test">
        <span class="fab__text">Test FAB</span>
      </button>
    </div>
  </div>
</div>

<script src="https://cdn.jsdelivr.net/gh/YOUR_GITHUB/ui-libraries@main/dist/fab/js/fab.js"></script>

<script>
// Debug helper
setTimeout(() => {
  const fab = document.querySelector('.fab-container');
  console.log('FAB:', fab ? 'Found ✅' : 'Not found ❌');
  console.log('Hero:', document.getElementById('hero') ? 'Found ✅' : 'Not found ❌');
  console.log('Footer:', document.getElementById('footer') ? 'Found ✅' : 'Not found ❌');
}, 1000);
</script>
```

---

## For Your Specific Page

Based on `https://pocketpills-mkt.webflow.io/lp/rx/shop/ozempic`, here's what you need:

### 1. Find Your Sections

Look for sections on your page and give them IDs:
- **Top banner/hero area** → ID: `hero`
- **Bottom footer area** → ID: `footer`

### 2. Adjust data-hide-on

If you want FAB to hide in different sections:

```html
data-hide-on="hero,footer,SECTION_ID_1,SECTION_ID_2"
```

---

## Expected Behavior

1. **Page loads** → FAB is hidden
2. **Scroll past hero** → FAB bounces in (circle with halo)
3. **After bounce** → Text expands ("Learn More")
4. **Scroll to footer** → FAB fades out
5. **Scroll back up** → FAB bounces in again

---

## Still Not Working?

Share:
1. Screenshot of Webflow Custom Code settings
2. Screenshot of your Embed element HTML
3. Screenshot of browser console (F12)
4. Section IDs you set

I'll help debug!
