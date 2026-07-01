# Corstack | Premium Web Agency Platform

> A high-performance, full-stack agency platform engineered for premium design, conversion optimization, and lightning-fast SEO performance.

Corstack is a bespoke digital agency website built to capture leads and process global client payments. It features an elegant UI with glassmorphic accents, cinematic scroll animations, dynamic geolocation logic for localized pricing, and a serverless backend architecture.

## 🛠️ Tech Stack

**Frontend:**
*   **Next.js (App Router)** - React framework for server-side rendering and SEO optimization.
*   **TypeScript** - For strict type-checking and robust code architecture.
*   **Tailwind CSS** - Utility-first CSS for highly responsive, custom styling.
*   **GSAP & React-Lenis** - For premium float-up reveal animations and buttery-smooth momentum scrolling.
*   **React-Hot-Toast** - For modern, custom-styled alert notifications.

**Backend & APIs:**
*   **Next.js Route Handlers** - Serverless backend API infrastructure.
*   **Paystack API** - Secure, localized checkout sessions and payment processing.
*   **Nodemailer** - Automated lead generation and contact form email routing.
*   **ipapi.co** - IP Geolocation API to dynamically detect user country.

## ✨ Key Features

*   **Dynamic Geolocation Pricing:** Automatically detects if a user is visiting from Nigeria (NGN) or internationally (USD) and instantly updates the pricing tables using cached `localStorage`.
*   **Serverless Payment Routing:** Securely connects to the Paystack API to generate localized checkout URLs based on the user's selected tier and currency.
*   **Momentum Scroll & Reveals:** Replaces the standard browser scroll with an "Apple-style" momentum scroll, syncing with GSAP to fade and float elements into view as the user navigates the page.
*   **Zero-Jank Transitions:** Utilizes Next.js `<Link>` components and a global `<SmoothScroll>` wrapper to navigate between pages instantly without layout shifts or white flashes.
*   **Custom Checkout Modal:** Bypasses clunky browser prompts with a sleek, custom-built React modal to capture client emails before redirecting to the payment gateway.

## 📂 Folder Structure

```text
corstack/
├── app/                  # Next.js App Router (Pages, Layout, Globals)
│   ├── api/              # Serverless Backend Routes (Contact & Checkout)
│   ├── services/         # Services Sub-page
│   ├── privacy/          # Privacy Policy Page
│   ├── terms/            # Terms of Service Page
│   └── success/          # Post-Submission / Payment Success Pages
├── components/           # Reusable UI Components
│   ├── Header.tsx        # Sticky Navigation
│   ├── Footer.tsx        # Global Footer
│   ├── ContactForm.tsx   # Client-side Form with Nodemailer integration
│   ├── CheckoutModal.tsx # Custom Paystack Email Capture Modal
│   └── SmoothScroll.tsx  # GSAP + Lenis Animation Wrapper
├── hooks/                # Custom React Hooks
│   └── usePricing.ts     # IP Detection & Currency State Management
└── public/               # Static Assets (Images, Favicon)

🚀 Getting Started (Local Development)
To run this project locally on your machine, follow these steps:
1. Clone the repository
code
Bash
git clone https://github.com/your-username/corstack.git
cd corstack
2. Install dependencies
code
Bash
npm install
3. Set up Environment Variables
Create a .env.local file in the root directory and add the following keys:
code
Env
# Paystack API Key (Get this from your Paystack Dashboard)
PAYSTACK_SECRET_KEY=sk_test_your_paystack_secret_key

# Gmail SMTP Credentials (Use a Google App Password)
EMAIL_USER=your_agency_email@gmail.com
EMAIL_PASS=your_google_app_password
4. Run the development server
code
Bash
npm run dev
Open http://localhost:3000 with your browser to see the result.
🌍 Deployment
This project is fully optimized for Vercel.
When deploying to Vercel, simply import the GitHub repository and ensure you add the PAYSTACK_SECRET_KEY, EMAIL_USER, and EMAIL_PASS variables into the Vercel Environment Variables settings before clicking deploy. Vercel will automatically convert the app/api/ folder into secure Serverless Functions.
Designed & Developed by Somto Ike.