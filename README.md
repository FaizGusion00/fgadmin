<p align="center">
  <img src="public/logo.png" alt="FGAdmin Logo" width="180" />
</p>

<h1 align="center">FGAdmin</h1>

<p align="center">
  <b>Beautiful, Enterprise-Grade Admin Dashboard for Malaysian Businesses</b>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/version-1.0.0-blue" alt="Version 1.0.0" />
  <img src="https://img.shields.io/badge/license-MIT-green" alt="License: MIT" />
  <img src="https://img.shields.io/badge/React-18.x-61DAFB" alt="React 18" />
  <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6" alt="TypeScript 5" />
  <img src="https://img.shields.io/badge/TailwindCSS-3.x-06B6D4" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E" alt="Supabase" />
</p>

<p align="center">
  <a href="#overview"><strong>Overview</strong></a> •
  <a href="#features"><strong>Features</strong></a> •
  <a href="#getting-started"><strong>Getting Started</strong></a> •
  <a href="#usage"><strong>Usage</strong></a> •
  <a href="#architecture"><strong>Architecture</strong></a> •
  <a href="#customization"><strong>Customization</strong></a> •
  <a href="#support"><strong>Support</strong></a>
</p>

<hr style="margin-bottom: 2rem;" />

## Overview

FGAdmin is a modern, feature-rich administration dashboard tailored for Malaysian businesses. Built with React, TypeScript, Tailwind CSS, and Supabase, it empowers you to manage sales, projects, tasks, analytics, and more—all in one elegant and responsive interface. MYR (Malaysian Ringgit) is the default currency, with full support for customization, dark/light themes, and role-based access.

<p align="center">
  <img src="public/dashboard-preview.png" alt="Dashboard Preview" width="80%" style="border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);" />
</p>

---

## Features

- **📊 Dashboard Analytics:** Real-time business metrics & KPIs
- **💼 Sales Management:** Track revenue, clients, and transactions (MYR default)
- **📁 Project Tracking:** Monitor project status, deadlines, and resources
- **✅ Task Management:** Organize and prioritize todos with deadlines and priorities
- **👥 Client Management:** Manage client information and relationships
- **🔔 Notifications:** Stay updated with in-app notifications
- **🗓️ Calendar Integration:** Manage events and schedules
- **📝 Notes:** Securely store and organize business notes
- **⚡ Fast & Responsive:** Optimized for all devices, with beautiful UI
- **🌙 Dark/Light Mode:** Seamless theme switching
- **🔒 Secure Auth:** Role-based access, powered by Supabase
- **🌐 Localization:** Malaysian business context, easily extendable
- **🛠️ Customizable:** Widgets, themes, and preferences per user

---

## Getting Started

### Prerequisites
- **Node.js** v16+
- **npm** v8+ or **yarn** v1.22+
- **Git**

### Installation
```bash
# Clone the repository
git clone https://github.com/FGCompany/fgadmin.git
cd fgadmin

# Install dependencies
npm install

# Copy environment variables template
cp .env.example .env.local
# Edit .env.local with your configuration

# Start the development server
npm run dev
```

---

## Usage

### Development
```bash
npm run dev       # Start dev server with hot reload
npm run lint      # Lint code
npm test          # Run tests (if available)
```

### Production
```bash
npm run build     # Build for production
npm run preview   # Preview production build locally
```

- Development: http://localhost:5173
- Production preview: http://localhost:4173

---

## Architecture

### Tech Stack
- **Frontend:** React 18, TypeScript
- **UI:** shadcn/ui, Tailwind CSS
- **State:** React Context API
- **API & Auth:** Supabase (PostgreSQL)
- **Build Tool:** Vite

### Directory Structure
```
fgadmin/
├── public/         # Static assets (logo, images)
├── src/
│   ├── components/ # Reusable UI components
│   ├── contexts/   # React context providers
│   ├── hooks/      # Custom React hooks
│   ├── integrations/ # Third-party integrations (Supabase, etc.)
│   ├── lib/        # Utilities
│   ├── pages/      # App pages (Dashboard, Projects, Todo, etc.)
│   └── styles/     # Global styles
├── .env.example    # Env variables template
├── package.json    # Dependencies & scripts
```

---

## Configuration

Copy `.env.example` to `.env.local` and set:
- `VITE_SUPABASE_URL` — Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` — Your Supabase anon key
- `VITE_DEFAULT_CURRENCY` — Default currency (MYR recommended)

---

## Customization

- **Theme:** Switch light/dark mode in Settings
- **Currency:** Change default in Settings
- **Dashboard Widgets:** Personalize visible metrics per user
- **User Preferences:** All settings are saved per user via Supabase

---

## Support

For technical support, feature requests, or feedback:
- **Email:** support@fgcompany.com.my
- **Website:** [fgcompany.com.my/support](https://fgcompany.com.my/support)

---

<p align="center">
  <b>Developed by Faiz Nasir</b><br />
  <b>Owned by FGCompany Official</b><br />
  Copyright &copy; 2025 FGCompany. All rights reserved.
</p>
