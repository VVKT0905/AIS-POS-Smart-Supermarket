import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import db, { initDb } from "./src/lib/db.ts";

async function startServer() {
  initDb();
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  
  // Auth
  app.post("/api/login", (req, res) => {
    const { username, password } = req.body;
    const user = db.prepare('SELECT * FROM NHAN_VIEN WHERE MaNV = ? AND MatKhau = ?').get(username, password) as any;
    if (user) {
      res.json({ success: true, user: { id: user.MaNV, name: user.TenNV, role: user.Quyen } });
    } else {
      res.status(401).json({ success: false, message: "Sai tài khoản hoặc mật khẩu" });
    }
  });

  // Products
  app.get("/api/products", (req, res) => {
    const products = db.prepare('SELECT * FROM SAN_PHAM').all();
    res.json(products);
  });

  app.post("/api/products", (req, res) => {
    const { MaSP, TenSP, GiaBan, SoLuongTon } = req.body;
    try {
      db.prepare('INSERT INTO SAN_PHAM (MaSP, TenSP, GiaBan, SoLuongTon) VALUES (?, ?, ?, ?)').run(MaSP, TenSP, GiaBan, SoLuongTon);
      res.json({ success: true });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  });

  app.put("/api/products/:id", (req, res) => {
    const { TenSP, GiaBan, SoLuongTon } = req.body;
    const { id } = req.params;
    try {
      db.prepare('UPDATE SAN_PHAM SET TenSP = ?, GiaBan = ?, SoLuongTon = ? WHERE MaSP = ?').run(TenSP, GiaBan, SoLuongTon, id);
      res.json({ success: true });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  });

  // Customers with Ranking (Mirroring fn_XepHangKhachHang)
  app.get("/api/customers", (req, res) => {
    const customers = db.prepare(`
      SELECT 
        KH.*,
        IFNULL(SUM(HD.TongTien), 0) AS TongTienDaMua,
        CASE 
          WHEN IFNULL(SUM(HD.TongTien), 0) >= 500000 THEN 'Khách VIP'
          ELSE 'Khách Thường'
        END AS Hang
      FROM KHACH_HANG KH
      LEFT JOIN HOA_DON HD ON KH.MaKH = HD.MaKH
      GROUP BY KH.MaKH, KH.TenKH
    `).all();
    res.json(customers);
  });

  app.get("/api/customers/search", (req, res) => {
    const { sdt } = req.query;
    const customer = db.prepare('SELECT * FROM KHACH_HANG WHERE Sdt = ?').get(sdt);
    res.json(customer || null);
  });

  app.post("/api/customers", (req, res) => {
    const { TenKH, Sdt } = req.body;
    try {
      const result = db.prepare('INSERT INTO KHACH_HANG (TenKH, Sdt) VALUES (?, ?)').run(TenKH, Sdt);
      res.json({ success: true, id: result.lastInsertRowid });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  });

  // Invoices (Sales Transaction)
  app.post("/api/invoices", (req, res) => {
    const { MaNV, MaKH, items } = req.body; // items: [{ MaSP, SoLuong, DonGia }]
    
    // Simulate MySQL Stored Procedure 'sp_TaoHoaDon_Transaction'
    const transaction = db.transaction(() => {
      // Create Invoice header
      const result = db.prepare('INSERT INTO HOA_DON (MaNV, MaKH, TongTien) VALUES (?, ?, 0)').run(MaNV, MaKH || null);
      const invoiceId = result.lastInsertRowid;

      let total = 0;
      for (const item of items) {
        // Check stock (Mirroring Trigger tr_kiem_tra_ton_kho_truoc_ban)
        const product = db.prepare('SELECT SoLuongTon FROM SAN_PHAM WHERE MaSP = ?').get(item.MaSP) as any;
        if (!product || product.SoLuongTon < item.SoLuong) {
          throw new Error(`Sản phẩm ${item.MaSP} không đủ tồn kho!`);
        }

        const thanhTien = item.SoLuong * item.DonGia;
        total += thanhTien;
        
        db.prepare('INSERT INTO CHI_TIET_HOA_DON (MaHD, MaSP, SoLuong, DonGia, ThanhTien) VALUES (?, ?, ?, ?, ?)')
          .run(invoiceId, item.MaSP, item.SoLuong, item.DonGia, thanhTien);
      }

      return { invoiceId, total };
    });

    try {
      const info = transaction();
      res.json({ success: true, ...info });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  });

  // Reports
  app.get("/api/reports/revenue", (req, res) => {
    const { from, to } = req.query;
    // Mirroring sp_BaoCaoDoanhThuTheoThoiGian
    const report = db.prepare(`
      SELECT 
        DATE(NgayLap) AS Ngay,
        SUM(TongTien) AS TongDoanhThu
      FROM HOA_DON
      WHERE DATE(NgayLap) BETWEEN ? AND ?
      GROUP BY DATE(NgayLap)
      ORDER BY Ngay ASC
    `).all(from, to);
    res.json(report);
  });

  app.get("/api/reports/details", (req, res) => {
    // Mirroring View_ChiTietHoaDon
    const details = db.prepare(`
      SELECT 
          hd.MaHD,
          hd.NgayLap,
          nv.TenNV,
          kh.TenKH,
          sp.TenSP,
          cthd.SoLuong,
          cthd.DonGia,
          cthd.ThanhTien
      FROM HOA_DON hd
      JOIN CHI_TIET_HOA_DON cthd ON hd.MaHD = cthd.MaHD
      JOIN SAN_PHAM sp ON cthd.MaSP = sp.MaSP
      JOIN NHAN_VIEN nv ON hd.MaNV = nv.MaNV
      LEFT JOIN KHACH_HANG kh ON hd.MaKH = kh.MaKH
      ORDER BY hd.NgayLap DESC
    `).all();
    res.json(details);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
