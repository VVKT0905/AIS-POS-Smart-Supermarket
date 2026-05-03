# AIS POS - Hệ thống Quản lý Siêu thị Thông minh

[![React](https://img.shields.io/badge/React-19-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6-purple.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38B2AC.svg)](https://tailwindcss.com/)

Hệ thống Quản lý Bán hàng (POS) hiện đại, hiệu quả và dễ sử dụng, được xây dựng bằng React 19, TypeScript và SQLite.

[English Version](README.md)

## 🚀 Tính năng chính

- **Bán hàng (POS):** Giao diện trực quan để bán hàng nhanh chóng, tìm kiếm sản phẩm và quản lý giỏ hàng.
- **Quản lý Kho:** Theo dõi lượng tồn kho, quản lý danh mục sản phẩm và cập nhật giá.
- **Quản lý Khách hàng:** Lưu trữ thông tin khách hàng và điểm tích lũy.
- **Tổng quan (Dashboard):** Trực quan hóa hiệu suất bán hàng và các chỉ số chính.
- **Báo cáo:** Xuất báo cáo chi tiết về doanh thu và tồn kho.
- **Hỗ trợ Đa ngôn ngữ:** Dễ dàng chuyển đổi giữa tiếng Anh và tiếng Việt.
- **Phân quyền người dùng:** Giao diện riêng biệt cho Quản lý và Thu ngân.

## 🛠️ Công nghệ sử dụng

- **Frontend:** React 19, TypeScript, Tailwind CSS, Lucide React, Framer Motion.
- **Backend:** Node.js, Express.
- **Cơ sở dữ liệu:** SQLite (Better-SQLite3).
- **Đa ngôn ngữ:** i18next, react-i18next.
- **Công cụ build:** Vite.

## 📦 Bắt đầu

### Yêu cầu hệ thống

- [Node.js](https://nodejs.org/) (v18 trở lên)
- npm hoặc yarn

### Cài đặt

1. **Clone repository:**
   ```bash
   git clone <repository-url>
   cd quan-ly-sieu-thi
   ```

2. **Cài đặt thư viện:**
   ```bash
   npm install
   ```

3. **Thiết lập môi trường:**
   Tạo file `.env` ở thư mục gốc.
   ```env
   PORT=3000
   ```

4. **Chạy ứng dụng:**
   ```bash
   npm run dev
   ```
   Ứng dụng sẽ chạy tại `http://localhost:5173`.

## 🔑 Tài khoản mặc định

- **Quản lý:** `NV01` / `123456`
- **Thu ngân:** `NV02` / `123456`
