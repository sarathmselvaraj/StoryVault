# StoryVault - Multipurpose Bookshop & Lending Library HTML Template

**StoryVault** is a premium, ThemeForest-ready multipurpose HTML template designed specifically for modern bookstores, membership lending libraries, community reading clubs, book cafes, and independent booksellers.

Built with **Bootstrap 5.3.3**, vanilla ES6+ JavaScript, custom literary typography, and warm glowing visual effects inspired by illuminated library shelves and reading lamps.

---

## 🌟 Key Features

* **20+ Production-Ready HTML Pages**: Includes 2 Distinct Homepages, Catalog, Book Profile, Services, Membership Tiers, Events, Sell/Donate Books, Blog, Contact, Login, Register, Member Portal, Admin Dashboard, 404, and Coming Soon.
* **Dual Homepage Niche Concepts**:
  * **Home 1**: General Bookshop & Lending Library Landing Experience.
  * **Home 2**: Exclusive Membership Lending Library & Reading Club.
* **Interactive LocalStorage Engine**: Demo functionality for Wishlist, Borrow Requests, Active Borrowings, 1-Click Online Book Renewals, and User Preferences without external backend dependencies.
* **Light & Dark Mode**: Persistent theme switching with carefully balanced ivory parchment light mode and deep obsidian warm dark mode.
* **Full RTL Language Support**: Seamless Right-To-Left layout support across all pages, navigation header, catalog grids, and dashboards.
* **Warm Glowing Visual Effects**: Sophisticated reading lamp halos (`box-shadow: 0 12px 40px rgba(201, 144, 78, 0.14)`) applied strategically to CTAs, active cards, and featured titles.
* **Responsive Grid Design**: Optimized for mobile (`320px`+), tablet, laptop, and desktop layouts with dedicated navigation and portal breakpoints.
* **Complete Dashboard Suite**:
  * **Member Dashboard**: Clear overview, currently borrowed books, renewals, request status, borrowing history, membership shortcuts, and a dedicated **Sell a Book** service entry.
  * **Admin Dashboard**: Simplified navigation, quick actions, overview widgets, pending borrow requests, catalog management, member management, orders, and settings.

---

## 📁 Folder Structure

```text
book-library-template/
│
├── index.html              # Home 1 – Bookshop & Library Landing Page
├── home-2.html             # Home 2 – Membership Lending Library
├── about.html              # About Us, History Timeline & Team
├── books.html              # Catalog with Live Search, Filter Sidebar & Grid/List View
├── book-details.html       # Book Profile with Borrow/Buy Action, Metadata & Reviews
├── services.html           # Library & Bookstore Services Overview
├── service-details.html    # Service Breakdown & FAQ Accordion
├── membership.html         # Membership & Pricing Tiers Comparison
├── pricing.html            # Dedicated Pricing Page Alias
├── events.html             # Library Events, Author Talks & Seat Registration
├── sell-donate.html        # Sell or Donate Books Submission Form
├── blog.html               # Filterable Literary Journal Listing
├── blog-details.html       # Article Layout with Author Bio & Sidebar
├── contact.html            # Contact Form, Map Location & Library Hours
├── login.html              # Floating Auth Sign In Card
├── register.html           # Floating Auth Sign Up Card
├── dashboard.html          # Compatibility redirect to protected Admin Dashboard
├── member-dashboard.html   # Member Dashboard (Borrowings & Renewals)
├── 404.html                # Literary-themed 404 Error Page
├── coming-soon.html        # Grand Opening Page with Countdown Timer
│
├── assets/
│   ├── css/
│   │   ├── bootstrap.min.css   # Bootstrap 5.3 Framework CSS
│   │   ├── style.css           # Core Design System, Variables & Glow Effects
│   │   ├── responsive.css      # Custom Responsive Breakpoints
│   │   ├── dark-mode.css       # Dark Mode Theme Overrides
│   │   └── rtl.css             # Right-to-Left Layout Adjustments
│   │
│   ├── js/
│   │   ├── bootstrap.bundle.min.js
│   │   └── main.js             # ES6 Core Interactivity & LocalStorage System
│   │
│   └── images/
│       ├── books/          # Fictional book covers
│       ├── authors/        # Author portraits
│       ├── library/        # Library interior photos
│       ├── events/         # Event photos
│       ├── blog/           # Journal post images
│       └── team/           # Team member photos
│
└── README.md
```

---


## 🔐 Demo Portal Credentials

The quick password-free login buttons were removed. Demo portal access now requires the matching email, password, and role.

- **Member Portal** — `member@storyvault.org` / `Member@123`
- **Admin Dashboard** — `admin@storyvault.org` / `Admin@123`

Member registration also creates a local demo account and opens the Member Portal. Authentication and role protection use browser `localStorage` for front-end template demonstration only. For a real deployment, replace this with secure server-side authentication and authorization.

---

## 💻 Quick Customization Guide

### 1. Color Palette Customization
All primary colors, surface tones, and glow variables are stored in `assets/css/style.css`:

```css
:root {
    --bg-main: #F7F2E9;
    --bg-surface: #FFFDF8;
    --brand-primary: #9C6538;
    --brand-secondary: #D4A66A;
    --glow-primary: 0 10px 30px rgba(156, 101, 56, 0.18);
}
```

### 2. LocalStorage Engine & API Integration
All demo actions (Wishlist, Borrowing, Renewals) are handled cleanly in `assets/js/main.js`. To connect a real backend REST or GraphQL API (Node.js, Laravel, Django, Python):
Replace `localStorage.getItem()` / `localStorage.setItem()` calls inside `main.js` with your asynchronous `fetch()` or `axios` API calls.

---

## 📜 Credits & Licenses

* **Grid & Framework**: [Bootstrap 5.3.3](https://getbootstrap.com/)
* **Typography**: Google Fonts (*Playfair Display*, *Cormorant Garamond*, *Inter*)
* **Icons**: [Font Awesome 6.5](https://fontawesome.com/)
* **Images**: Existing template images plus the library ambience reference image supplied with this project revision. Confirm final commercial licensing for every production asset before resale.

---
© 2026 **StoryVault India** All Rights Reserved. Built for ThemeForest & Commercial Client Deployment.


## Live Data Mode

This HTML template uses browser localStorage plus BroadcastChannel for per-user member data, borrow approvals, catalog changes, and orders. New sign-up accounts begin with empty member data; demo records are isolated to the demo account and explicitly marked in Admin. For real multi-device/multi-user production deployments, connect these UI flows to a secure backend/database.
