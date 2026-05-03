# AIS POS - Smart Supermarket Management System

[![React](https://img.shields.io/badge/React-19-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6-purple.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38B2AC.svg)](https://tailwindcss.com/)

A modern, efficient, and user-friendly Point of Sale (POS) and Supermarket Management System built with React 19, TypeScript, and SQLite.

[Tiếng Việt](README.vi.md)

## 🚀 Features

- **Point of Sale (POS):** Intuitive interface for quick sales, product searching, and cart management.
- **Inventory Management:** Track stock levels, manage product categories, and price updates.
- **Customer Management:** Maintain customer records and loyalty points.
- **Real-time Dashboard:** Visualize sales performance and key metrics.
- **Reporting:** Generate detailed sales and inventory reports.
- **Multi-language Support:** Easily toggle between English and Vietnamese.
- **Role-based Access:** Different interfaces for Managers and Cashiers.

## 🛠️ Tech Stack

- **Frontend:** React 19, TypeScript, Tailwind CSS, Lucide React, Framer Motion.
- **Backend:** Node.js, Express.
- **Database:** SQLite (Better-SQLite3).
- **Internationalization:** i18next, react-i18next.
- **Build Tool:** Vite.

## 📦 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- npm or yarn

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd quan-ly-sieu-thi
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Setup:**
   Create a `.env` file in the root directory (refer to `.env.example` if available).
   ```env
   PORT=3000
   ```

4. **Run the application:**
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:5173`.

## 🔑 Default Credentials

- **Manager:** `NV01` / `123456`
- **Cashier:** `NV02` / `123456`
