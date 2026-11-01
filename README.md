# FareBuddy — Hyperlocal Campus Micro-Economy & Pooling Platform

[![React](https://img.shields.io/badge/React-18-blue.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC.svg)](https://tailwindcss.com/)

**FareBuddy** is a hyper-localized campus micro-economy and collaborative pooling platform tailored specifically for collegiate campuses (configured for **BIT Patna**). It tackles common student pain points: high small-cart delivery surcharges, expensive solo auto/cab rides, and wasteful buy-and-discard cycles for semester gear.

---

## 🚀 Key Features

### 1. Multi-Store Quick-Commerce Cart Pooling (Solved "Same Cart Problem")
- **Independent Store Isolation**: Separate, isolated cart pools for **Blinkit**, **Zepto**, and **Instamart** running concurrently.
- **Cross-Platform Item Mover**: Move items seamlessly across platforms (e.g., migrate an order from Zepto to Blinkit when Blinkit pool is closer to waiving delivery fees).
- **Live Fee-Waiver Progress**: Visual threshold trackers (e.g. ₹199 / ₹249 fee-waiver lines) displaying how much more the hostel wing needs to unlock free delivery.
- **Fair Split Calculation**: Transparent proportional billing that factors in handling fees, packaging, and tips without dispute.

### 2. Corridor Ride Pooling (Campus Auto/Cab Share)
- Dedicated student transit corridors:
  - Campus ⇄ Patna Junction Railway Station
  - Campus ⇄ Danapur Station
  - Campus ⇄ Jay Prakash Narayan International Airport (PAT)
  - Campus ⇄ Bailey Road / Boring Road
- Seat capacity visualizers (live occupied/vacant dots), departure countdowns, luggage capacity flags, and gender-inclusive ride preference tags.

### 3. Gear Bazaar (Anti-Scalp Campus Marketplace)
- Second-hand peer exchange for mattresses, coolers, lab coats, draughting boards, and textbooks.
- Hard **₹400 fair-price cap** on student essentials to keep items affordable and curb campus resale exploitation.
- Direct BIT Patna hostel delivery and room verification.

### 4. Interactive Campus Hub (`/hub` & `/hub-preview`)
- Complete database schema and DDL inspector built with Stitch design system tokens.
- Interactive college roll number regex validator (`^(BTECH|BCA|BBA|MCA)/\d{5}/\d{2}$`).
- Persona switcher (Hostel Host, Day Scholar, Bazaar Seller).
- Real-time seed card visualizer and Supabase integration dashboard.

---

## 🎨 Design System

- **Typography**: Google Fonts [`Plus Jakarta Sans`](https://fonts.google.com/specimen/Plus+Jakarta+Sans) for primary UI + [`JetBrains Mono`](https://fonts.google.com/specimen/JetBrains+Mono) for prices, badges, and timestamps.
- **Color Tokens**:
  - Primary Brand Green: `#0F5132` / `#166534`
  - Accent / Delivery Yellow: `#EAB308`
  - Ride Pool Coral: `#FF6B4A`
  - Surface Neutral: `#F8F9FA` / Border `#E9ECEF`
- **Responsive Navigation**: Full mobile-friendly bottom app bar and responsive desktop headers with official vector SVG brand lockup.

---

## 🛠️ Tech Stack

- **Framework**: [React 18](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Language**: [TypeScript 5](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with `@tailwindcss/animate`
- **Icons**: [Lucide React](https://lucide.dev/)
- **Components**: [Radix UI](https://www.radix-ui.com/) primitives
- **Backend / DB (Optional)**: [Supabase](https://supabase.com/) (`@supabase/supabase-js`)

---

## 🏁 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [npm](https://www.npmjs.com/) or [pnpm](https://pnpm.io/)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/mohit-1025/fare_buddy.git
   cd fare_buddy
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables (Optional)**:
   ```bash
   cp .env.example .env
   ```
   Add your Supabase credentials if enabling cloud database persistence.

4. **Start the development server**:
   ```bash
   npm run dev
   ```

5. **Build for production**:
   ```bash
   npm run build
   ```

---

## 📄 License

This project is licensed under the MIT License.
