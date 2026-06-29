# FinTrack Pro – Personal Finance Tracker

FinTrack Pro is a production-quality, client-side personal finance tracker built entirely using HTML5, CSS3, Vanilla ES6 JavaScript, and Chart.js. All user accounts, transaction data, settings, and view preferences persist locally in the browser using the Local Storage API. 

No database. No backend. No external frameworks.

---

## Technical Architecture

The project is structured with a minimalist footprint containing only four core files:

```
FinTrack-Pro/
├── login.html     # Authentication gateway (Login & registration modes)
├── index.html     # Main dashboard interface (Financial overview & configurations)
├── style.css      # Unified stylesheet for visual layout, themes, & animations
└── script.js      # Unified controller orchestrating authentication and dashboard operations
```

Both HTML files leverage the shared stylesheet (`style.css`) and script handler (`script.js`), isolating views dynamically based on active elements.

---

## Core Features

### 1. Client-Side Authentication Guard
* **Automatic Redirection**: Any attempt to load `index.html` without a session redirects instantly to `login.html` before layout elements render. Logged-in users loading `login.html` are routed immediately to the dashboard.
* **Username & Password Login**: Matches credentials against the registered user records stored in local storage.
* **Compact Account Creator**: Registration requires only a unique Username and matching Passwords (minimum 6 characters). Full Name and Email forms are omitted for swift registration, automatically falling back to Username displays.
* **Transition Flow**: After successful registration, the card shifts back to the login state, autofilling the newly created username and focusing the password input.

### 2. Multi-Currency Ledger
* **Instant Conversions**: Supports real-time value conversions across five currencies: USD, EUR, GBP, INR, and JPY.
* **Preserved Base Storage**: Conversion calculations are computed runtime; base transaction values are preserved in local storage in the user's primary currency without data degradation.

### 3. Cash Flow Visualization
* **Dynamic Graphs**: Renders a grouped bar chart comparing daily Income (Green) vs. Expenses (Red) using Chart.js.
* **No Canvas Overlap**: The active chart instance is automatically destroyed and rebuilt during filters or updates, preventing hover flicker or layered rendering.

### 4. Interactive Sidebar Theme Controller
* **Variable-Based Themes**: Supports light and dark modes through CSS variables.
* **Sidebar Toggle**: Mode switching is relocated from settings directly into the sidebar navigation layout. Clicking swaps icons (`sun`/`moon`) and button text dynamically.
* **Session Persistence**: Chosen settings (Theme, currency preferences, profiles) persist across browser reloads.

### 5. Layout & Responsiveness
* **Refactored Codebase**: Uses `document.querySelector` selectors exclusively instead of legacy `document.getElementById`.
* **Clean Document Structure**: All code files (HTML, CSS, JS) are entirely comment-free for optimal delivery.
* **Breakpoint Adaptability**: Visual grids adjust seamlessly from large monitors (4-column card matrices) down to mobile viewport layouts (1-column cards with sliding sidebar overlay menus).

---

## Local Storage Data Schema

The app uses standard keys to write, read, and manage states in the browser's Local Storage:

* `users` - Array of objects storing credentials: `[{ id, fullName, username, email, password }]`
* `currentUser` - Active session metadata: `{ id, fullName, username, email }`
* `isLoggedIn` - Session status flag: `true` / `false`
* `transactions` - Financial transactions list: `[{ id, type, description, category, amount, date }]`
* `theme` - Selected color theme: `"light"` / `"dark"`
* `currency` - Currency view configuration: `"USD"` / `"EUR"` / `"GBP"` / `"INR"` / `"JPY"`
* `profile` - Current user name display configuration

---

## Local Development & Setup

1. Clone or download the repository directory.
2. Open `login.html` in any modern web browser.
3. For the best experience (including hot reloading), serve the directory using a local development server (e.g., Live Server extension in VS Code):
   ```bash
   # Using local npm servers
   npx serve .
   ```
