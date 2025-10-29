
# Ticketing App — Twig Implementation

This is the **Twig** (PHP + Twig) implementation of the ticketing app assignment.

## What this version includes
- Server-rendered pages with Twig templates.
- Styling with Tailwind CSS (wavy hero, decorative circles, boxes, shadows).
- Authentication simulation via `localStorage` using key: `ticketapp_session`.
- Dashboard, and a Ticket Management screen with full CRUD (stored in `localStorage`).
- Client-side validation and toast notifications.
- Responsive design with max-width 1440px centered.

## Prerequisites
- PHP 8+ installed.
- Composer.
- Node.js + npm.

## Setup steps

1. Install PHP dependencies:
   ```bash
   composer install



Install Tailwind dev tools:
npm install



Build Tailwind CSS (dev watch):
npx tailwindcss -i ./src/input.css -o ./public/style.css --watch



In another terminal, run PHP built-in server from the project root:
php -S localhost:8000



Open the app:
http://localhost:8000


Test accounts
This app stores created users in localStorage. You can create a user via the Sign Up page. Example test user (you can create it manually):


Email: test@example.com


Password: password123


How authentication and protection work


When a user signs up or logs in, the client saves a session object to localStorage under ticketapp_session.


Protected routes (/dashboard, /tickets) are enforced by JavaScript: if ticketapp_session is absent, the user is redirected to /auth/login.


Logout clears ticketapp_session.


Ticket storage
Tickets are stored in localStorage under the key ticketapp_tickets. They persist in the browser.
Validation & error handling


Title and status are required.


Status accepted values: open, in_progress, closed.


Errors display inline (below inputs) and via toasts for general errors.


Unauthorized access redirects to /auth/login with a message.


Accessibility notes


Semantic HTML (headings, labels).


Visible focus states via default browser + Tailwind inputs.


Contrast: primary text on white background with Tailwind defaults.


Known limitations


This is a frontend-only simulation (no real backend) to satisfy the assignment rules for simulated authentication.


Because authentication is simulated with localStorage, the "session" is browser-specific.


If you need a server-side session token system, we can add a simple PHP JSON endpoints mock.


Switching to other implementations
This repo is the Twig implementation. Follow similar patterns when building Vue and React versions:


Keep the same HTML structure, classes, and layout.


Use the same max-width and hero SVG to match design.



---

# 3 — How to run (quick summary)

1. `composer install` (installs Twig)
2. `npm install` (installs Tailwind and PostCSS)
3. Run Tailwind watch:

npx tailwindcss -i ./src/input.css -o ./public/style.css --watch
4. Start PHP server (project root):

php -S localhost:8000
5. Open `http://localhost:8000` in browser.

---

# 4 — What this implementation satisfies from the assignment

- **Landing page**: hero with wavy SVG, decorative circle, boxes and CTA buttons.
- **Authentication screen**: Login and Signup with inline validation, toasts (notifications), signup auto-logs in.
- **Dashboard**: shows Total / Open / Resolved summary cards; contains link to Ticket Management; logout button clears `ticketapp_session`.
- **Ticket Management**: Create / Read / Update / Delete tickets with:
- Title and status mandatory.
- Status accepts only `open`, `in_progress`, `closed`.
- Inline validation and toast feedback.
- Delete uses `confirm()` for confirmation flow.
- **Protection and session token**: `ticketapp_session` stored in `localStorage`, enforced by client-side JS which redirects unauthorized access to `/auth/login` and shows a session-expired message.
- **Design consistency**: All pages use the same `base.html.twig` (max-width 1440px centered), same header/footer, wavy hero design present on landing, card boxes, at least two decorative circles (hero and card), responsive layout.
- **Accessibility**: Uses semantic labels, form elements, and ensures text is readable; focus states rely on browser defaults + Tailwind.








