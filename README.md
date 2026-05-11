# Intrinsic Series - AR Product Viewer

Skincare product recognition system using smartphone camera AR.
Point your phone camera at any of the 30 intrinsic series products to instantly view product specifications and texture videos.

**Live Demo**: [acosmeticstory.com/pages/ar](https://acosmeticstory.com/pages/ar)

---

## What It Does

- Recognizes 30 skincare products (no.0 ~ no.29) in real-time through the phone camera
- Displays product properties: hardness, pH, emulsion type, moisture percentage
- Plays texture videos for each product
- Manual selection grid with **Texture / Cores tabs** (texture video thumbnails or 30g carton images)
- Weight-specific carton views in info panel — toggle **Texture / 7g / 15g / 30g** for each product
- Supports 11 languages (auto-detected from browser): KO, EN, JA, ZH-CN, ZH-TW, DE, FR, ES, VI, TH, AR
- Localized product names per language (e.g. 본연, 本然, جوهر, intrínseco)
- Language-aware store links route to the correct locale
- Works entirely in the browser — no app install required

---

## Tech Stack

| Technology | Role |
|-----------|------|
| [MindAR](https://hiukim.github.io/mind-ar-js-doc/) 1.2.5 | Image target recognition (SIFT-based feature matching) |
| [A-Frame](https://aframe.io/) 1.5.0 | WebXR framework |
| [Tesseract.js](https://tesseract.projectnaptha.com/) 5.x | OCR text recognition fallback |

All libraries loaded via CDN. The entire app is a single HTML file + data files.

---

## Architecture

```
Phone Camera
     │
     ▼
┌─────────────┐     ┌──────────────┐
│   MindAR    │────▶│  69 Image    │
│ Image Match │     │  Targets     │
└──────┬──────┘     │  (.mind)     │
       │            └──────────────┘
       │ miss?
       ▼
┌─────────────┐
│ Tesseract.js│──── OCR "no.XX" text recognition
│  3-Pass OCR │
└──────┬──────┘
       │
       ▼
  Product Info + Video
```

### Dual Recognition System

**Primary — MindAR Image Matching**
- 69 compiled image targets (30 base + 39 supplementary)
- SIFT feature point detection and matching
- Recognizes 21 out of 30 products with zero false positives

**Fallback — Tesseract.js OCR**
- Reads "no.XX" text printed on product labels
- Covers the remaining products that MindAR cannot recognize
- 3-pass image processing pipeline for reliability

---

## Challenges & Solutions

### Challenge 1: Product Image Similarity

The 30 products share very similar minimalist designs — geometric patterns on white backgrounds. Traditional image matching struggled with this.

**What failed:**
- Using only the base art images → insufficient feature points, frequent mismatches
- Browser-side compilation of 163 images → browser crash from memory exhaustion
- Compiling 90 design variations → target order was unpredictable

**What worked:**
- Server-side compilation via Node.js with guaranteed target ordering
- 30 base targets (7g weight design) for clean 1:1 mapping
- 39 supplementary targets for problematic products using 15g, 30g, and real photo variants
- Required building a custom Canvas shim (`@napi-rs/canvas`) because MindAR's offline compiler expects the `canvas` npm package which requires native C++ builds

### Challenge 2: Unrecognizable Products

Some product designs are fundamentally hostile to SIFT feature matching:
- **no.1**: Concentric circle pattern — rotational symmetry produces identical descriptors at every angle
- **no.12**: Vertical stripe pattern — 1D ambiguity (aperture problem), features only distinguish along one axis
- **no.21**: Flat orange gradient on white — almost zero extractable feature points

**Solution: OCR Fallback**

Added Tesseract.js to read the "no.XX" text directly from the camera feed. This required significant iteration:

| Attempt | Approach | Result |
|---------|----------|--------|
| 1st | Default Tesseract settings, full frame | No recognition at all |
| 2nd | Binary threshold (128), center crop 70%x50% | Still failed — threshold destroyed text on colored backgrounds |
| 3rd | Removed binarization, 1.5x contrast, PSM 3 | Partial success, some products recognized |
| **Final** | **3-pass pipeline, PSM 11, Otsu threshold, 80%x60% crop** | **All products recognizable** |

**Final OCR Pipeline (3-Pass):**
1. **Normal**: Grayscale + 2.2x contrast enhancement
2. **BW**: Grayscale + Otsu automatic binarization (adaptive threshold)
3. **Invert**: Grayscale inversion (for light text on dark backgrounds)

Each pass stops early if a valid "no.XX" pattern is detected. Two consecutive matching reads are required for confirmation to prevent false positives.

### Challenge 3: Finding MindAR's Camera Feed

MindAR creates its own internal `<video>` element that's not directly accessible. The OCR module needs to capture frames from the actual camera feed, but `document.getElementById('camera-video')` returned an element with no video data on mobile.

**Solution:** Implemented `getOCRVideo()` that searches all `<video>` elements in DOM, filtering out known non-camera elements (product video panel, placeholder), and selects the first one with valid `videoWidth > 0`.

### Challenge 4: Mobile UX for Recognition Failures

Users had no feedback when recognition failed. They would keep pointing the camera at a product indefinitely.

**Solution:**
- 3 screen taps → "Try manual selection?" toast with direct button
- Recognition history panel with product properties on tap
- Touch-to-focus camera control
- OCR status indicator showing scan activity

### Challenge 5: Slow Image Grid Loading

The 30-item manual-selection grid initially served full-resolution Shopify images
(1600×1600 PNGs at ~660KB each, ~20MB total) — unusable on mobile networks.

**Solution: Shopify CDN width transformation**

All grid and panel images now request resized variants via `?width=` query parameter:

| Surface | Width | Per-image size | Reduction |
|---------|-------|----------------|-----------|
| Manual-selection grid | 300px | 660KB → 44KB | ~15× |
| Texture-tab thumbnails | 300px | 65KB → 5KB | ~13× |
| Info-panel size image | 600px | 660KB → 130KB | ~5× |
| History thumbnails | 200px | 660KB → 22KB | ~30× |

Total grid payload dropped from ~20MB to ~1.3MB. Combined with `loading="lazy"`
and `decoding="async"`, the panel opens instantly even on slow networks.

### Challenge 6: Per-Weight Visual Reference

A single product comes in three weights (7g / 15g / 30g) with distinct carton
form factors — but Shopify only exposes the 30g featured image at the product
endpoint. The other two sizes are only rendered on the collection page when the
weight filter is toggled.

**Solution: Pattern-derived size URLs**

Reverse-engineered the Shopify file-naming convention from the rendered HTML of
`/collections/core-capsule?variant={size}`:

```
core_intrinsic_{7|15|30}_2nd_{N}.png
```

All 90 URLs (30 products × 3 sizes) were verified live (HEAD 200) and embedded
directly in `products.json` as `image_7g` / `image_15g` / `image_30g`. The info
panel renders these inline via `<img>` swap with the texture video.

---

## File Structure

```
index.html                    — Full AR viewer (single-file, all JS/CSS inline)
products.json                 — 30 product data (name, specs, video URLs)
targets_all.mind              — MindAR compiled image targets (69 targets, ~29MB)
acosmeticstory color logo.png — Brand logo (loading screen + top bar)
```

---

## Product Data

Each product entry in `products.json` contains:

```json
{
  "no": 0,
  "name": "intrinsic no.0",
  "preview": "core cup image URL (Cores-tab thumbnail)",
  "texture_thumb": "video first-frame thumbnail URL (Texture-tab)",
  "image_7g":  "core_intrinsic_7_2nd_N.png  — 7g carton",
  "image_15g": "core_intrinsic_15_2nd_N.png — 15g carton",
  "image_30g": "core_intrinsic_30_2nd_N.png — 30g carton",
  "hardness": "경도 값",
  "pH": "pH 값",
  "emulsion": "에멀전 타입",
  "moisture_pct": "수분율",
  "video_720p": "texture video URL",
  "video_480p": "texture video URL (mobile)"
}
```

Video URLs are sourced from the Shopify product pages at `acosmeticstory.com`.
Carton images follow the `core_intrinsic_{size}_2nd_{no}.png` naming convention
used by the `/collections/core-capsule` weight filter.

---

## Localization

UI and product names automatically display in the user's browser language.

| Language | Product Name Format | Example |
|----------|-------------------|---------|
| Korean (`ko`) | 본연 {no} | 본연 0 |
| Japanese (`ja`) | 本然 no.{no} | 本然 no.0 |
| Chinese (`zh-cn`, `zh-tw`) | 本然 no.{no} | 本然 no.0 |
| Arabic (`ar`) | جوهر no.{no} | جوهر no.0 |
| French (`fr`) | intrinsic n°{no} | intrinsic n°0 |
| Vietnamese (`vi`) | bản chất no.{no} | bản chất no.0 |
| Thai (`th`) | อินทรินสิค no.{no} | อินทรินสิค no.0 |
| German (`de`) | Intrinsisch Nr.{no} | Intrinsisch Nr.0 |
| Spanish (`es`) | intrínseco no.{no} | intrínseco no.0 |
| English (default) | intrinsic no.{no} | intrinsic no.0 |

Product detail links also route to the matching language storefront on acosmeticstory.com.

Fallback: English

---

## Requirements

- HTTPS (required for camera access)
- Mobile browser with camera support (iOS Safari, Android Chrome)
- No app installation needed

---

## Brand

**intrinsic series** by [A Cosmetic Story](https://acosmeticstory.com)
Skincare core line — 30 products, 3 weights (7g / 15g / 30g)
