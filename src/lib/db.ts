import Database from 'better-sqlite3';
import path from 'path';

const db = new Database('supermarket.db');

// Initialize database with schema
export function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS NHAN_VIEN (
        MaNV TEXT PRIMARY KEY,
        TenNV TEXT NOT NULL,
        MatKhau TEXT NOT NULL,
        Quyen INTEGER DEFAULT 1 -- 1: Nhân viên thu ngân, 2: Quản lý
    );

    CREATE TABLE IF NOT EXISTS KHACH_HANG (
        MaKH INTEGER PRIMARY KEY AUTOINCREMENT,
        TenKH TEXT NOT NULL,
        Sdt TEXT UNIQUE NOT NULL,
        DiemTichLuy INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS SAN_PHAM (
        MaSP TEXT PRIMARY KEY,
        TenSP TEXT NOT NULL,
        GiaBan REAL NOT NULL CHECK (GiaBan > 0),
        SoLuongTon INTEGER NOT NULL DEFAULT 0 CHECK (SoLuongTon >= 0)
    );

    CREATE TABLE IF NOT EXISTS HOA_DON (
        MaHD INTEGER PRIMARY KEY AUTOINCREMENT,
        NgayLap DATETIME DEFAULT CURRENT_TIMESTAMP,
        TongTien REAL DEFAULT 0,
        MaNV TEXT NOT NULL,
        MaKH INTEGER,
        FOREIGN KEY (MaNV) REFERENCES NHAN_VIEN(MaNV),
        FOREIGN KEY (MaKH) REFERENCES KHACH_HANG(MaKH)
    );

    CREATE TABLE IF NOT EXISTS CHI_TIET_HOA_DON (
        MaHD INTEGER,
        MaSP TEXT,
        SoLuong INTEGER NOT NULL CHECK (SoLuong > 0),
        DonGia REAL NOT NULL,
        ThanhTien REAL NOT NULL,
        PRIMARY KEY (MaHD, MaSP),
        FOREIGN KEY (MaHD) REFERENCES HOA_DON(MaHD) ON DELETE CASCADE,
        FOREIGN KEY (MaSP) REFERENCES SAN_PHAM(MaSP)
    );
  `);

  // Seed data if empty
  const employeeCount = db.prepare('SELECT count(*) as count FROM NHAN_VIEN').get() as { count: number };
  if (employeeCount.count === 0) {
    db.prepare("INSERT INTO NHAN_VIEN (MaNV, TenNV, MatKhau, Quyen) VALUES (?, ?, ?, ?)").run('NV01', 'Nguyen Van A', '123456', 2);
    db.prepare("INSERT INTO NHAN_VIEN (MaNV, TenNV, MatKhau, Quyen) VALUES (?, ?, ?, ?)").run('NV02', 'Tran Thi B', '123456', 1);
    
    db.prepare("INSERT INTO KHACH_HANG (TenKH, Sdt, DiemTichLuy) VALUES (?, ?, ?)").run('Le Van C', '0901234567', 150);
    db.prepare("INSERT INTO KHACH_HANG (TenKH, Sdt, DiemTichLuy) VALUES (?, ?, ?)").run('Pham Thi D', '0987654321', 500);

    db.prepare("INSERT INTO SAN_PHAM (MaSP, TenSP, GiaBan, SoLuongTon) VALUES (?, ?, ?, ?)").run('SP001', 'Sua tuoi Vinamilk 1L', 35000, 100);
    db.prepare("INSERT INTO SAN_PHAM (MaSP, TenSP, GiaBan, SoLuongTon) VALUES (?, ?, ?, ?)").run('SP002', 'Mi Hao Hao chua cay', 4500, 500);
    db.prepare("INSERT INTO SAN_PHAM (MaSP, TenSP, GiaBan, SoLuongTon) VALUES (?, ?, ?, ?)").run('SP003', 'Nuoc ngot Coca Cola 1.5L', 22000, 50);
  }

  // SQLite Triggers (Adapting from MySQL)
  // 1. Stock deduction after sale
  db.exec(`
    CREATE TRIGGER IF NOT EXISTS tr_tru_ton_kho_sau_ban
    AFTER INSERT ON CHI_TIET_HOA_DON
    FOR EACH ROW
    BEGIN
        UPDATE SAN_PHAM
        SET SoLuongTon = SoLuongTon - NEW.SoLuong
        WHERE MaSP = NEW.MaSP;
    END;
  `);

  // 2. Loyalty points calculation
  db.exec(`
    CREATE TRIGGER IF NOT EXISTS tr_cong_diem_tich_luy
    AFTER INSERT ON CHI_TIET_HOA_DON
    FOR EACH ROW
    BEGIN
        UPDATE KHACH_HANG
        SET DiemTichLuy = DiemTichLuy + CAST(NEW.ThanhTien / 1000 AS INTEGER)
        WHERE MaKH = (SELECT MaKH FROM HOA_DON WHERE MaHD = NEW.MaHD) AND MaKH IS NOT NULL;
    END;
  `);

  // 3. Update total amount of invoice
  db.exec(`
    CREATE TRIGGER IF NOT EXISTS tr_cap_nhat_tong_tien_them
    AFTER INSERT ON CHI_TIET_HOA_DON
    FOR EACH ROW
    BEGIN
        UPDATE HOA_DON
        SET TongTien = (
            SELECT SUM(ThanhTien) FROM CHI_TIET_HOA_DON WHERE MaHD = NEW.MaHD
        )
        WHERE MaHD = NEW.MaHD;
    END;
  `);

  // 4. Return stock if deleted
  db.exec(`
    CREATE TRIGGER IF NOT EXISTS tr_hoan_lai_ton_kho_khi_xoa
    AFTER DELETE ON CHI_TIET_HOA_DON
    FOR EACH ROW
    BEGIN
        UPDATE SAN_PHAM
        SET SoLuongTon = SoLuongTon + OLD.SoLuong
        WHERE MaSP = OLD.MaSP;
    END;
  `);
}

export default db;
