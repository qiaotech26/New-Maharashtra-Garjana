# 📰 न्यू महाराष्ट्र गर्जना | New Maharashtra Garjana News Portal

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Status: Production Ready](https://img.shields.io/badge/Status-Production%20Ready-brightgreen.svg)]()
[![Languages: Marathi & English](https://img.shields.io/badge/Language-Marathi%20%7C%20Multi--Language-orange.svg)]()

> **न्यू महाराष्ट्र गर्जना (New Maharashtra Garjana)** is a premium, modern, ultra-responsive Marathi news publishing platform. It features rich Devanagari typography, dynamic Marathi calligraphy selection, real-time breaking news ticker, text-to-speech audio reader (Marathi voice), media lightboxes, category filters, interactive reader comments, and a full-featured Admin Publishing Portal.

---

## 🌟 Key Features

### 🎨 1. Premium Branding & Marathi Calligraphy Fonts
- **Devanagari Calligraphy Titles**: Customized letterform ligatures using **Tiro Devanagari Marathi**, **Tillana**, **Rozha One**, and **Yatra One**.
- **Interactive Calligraphy Switcher**: Live font selection dropdown in the top bar to switch between 4 Marathi calligraphy styles on the fly.
- **3D Gradient & Unclipped Typography**: Custom CSS gradient rendering with full line height to ensure top matras (*Shirorekha*) are 100% visible.

### 🌐 2. Multi-Language Engine
- Dynamic translation switcher supporting **Marathi, English, Hindi, Gujarati, Tamil, Telugu, Kannada, Bengali, Punjabi, and Malayalam**.
- Instant full-page translation for all news headlines, ticker streams, and reader articles.

### 📢 3. Breaking News Ticker & Live Media
- High-impact animated breaking news banner with pause-on-hover interaction.
- Dedicated **Video Bulletins** and **Photo Gallery Lightbox** modals.
- Integrated **Live Weather** and **Real-Time Date/Time** widgets in IST.

### 🔊 4. Audio Reader & Accessibility
- Integrated **Marathi Text-to-Speech (TTS)** engine for hands-free listening to news articles.
- Text resizing controls (`A+` / `A-`) for enhanced readability.

### 🔐 5. Full Admin Publishing Portal
- Built-in administrative dashboard with secure login modal.
- Article CRUD operations (Create, Edit, Delete news).
- Media image uploader with instant Base64 live preview.
- Breaking News ticker editor.
- Data export/backup feature in JSON format.

---

## 📁 Repository Structure

```text
NEWS FEEDS/
├── index.html       # Primary HTML5 Semantic Structure & Modals
├── style.css        # Core Design Tokens, Responsive Utilities & Animations
├── app.js           # Full Application State, CRUD Logic, Speech & Multi-Lang Engine
├── logo.jpg         # High-Resolution Brand Logo Asset
├── .gitignore       # Git Exclusions
└── README.md        # Project Documentation
```

---

## 🚀 Quick Start (Local Run)

No complex build pipeline required! Simply clone and open `index.html` in your browser or run via a local static server:

```bash
# 1. Clone the repository
git clone https://github.com/qiaotech2-create/New-maharashtra-garjana.git

# 2. Navigate to project directory
cd New-maharashtra-garjana

# 3. Serve using any static HTTP server (or double click index.html)
npx serve ./
```

Open [http://localhost:3000](http://localhost:3000) or [http://localhost:8080](http://localhost:8080) in your browser.

---

## 🔑 Admin Portal Authentication & Security

- **Initial Access & Verification**: Access the Admin Portal via the **ॲडमिन पॅनेल** button in the navigation bar.
- **PIN Management**: Protected by client-side SHA-256 cryptographic hashing and rate-limiting. For initial password setup or emergency PIN resets, use the verified administrator contact (**+91 8530664576**) via the in-app OTP reset module.

---

## 💻 Tech Stack

- **Frontend**: HTML5, Vanilla CSS3 (Custom Properties & Flex/Grid), ES6 JavaScript.
- **Typography**: Google Fonts (Tiro Devanagari Marathi, Tillana, Rozha One, Yatra One, Mukta, Noto Sans Devanagari).
- **Icons & Speech**: Inline SVG Icons, Web Speech Synthesis API.
- **Translation**: Google Translate API Integration.

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.
