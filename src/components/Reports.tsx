import React, { useState, useEffect } from 'react';
import { Search, Filter, Download, ExternalLink, Calendar, ShoppingCart } from 'lucide-react';
import { formatCurrency, formatDate } from '../lib/utils';
import { motion } from 'motion/react';

interface ReportDetail {
  MaHD: number;
  NgayLap: string;
  TenNV: string;
  TenKH: string | null;
  TenSP: string;
  SoLuong: number;
  DonGia: number;
  ThanhTien: number;
}

export default function Reports() {
  const [details, setDetails] = useState<ReportDetail[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchDetails();
  }, []);

  const fetchDetails = async () => {
    const res = await fetch('/api/reports/details');
    const data = await res.json();
    setDetails(data);
  };

  const filtered = details.filter(d => 
    d.TenNV.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (d.TenKH && d.TenKH.toLowerCase().includes(searchTerm.toLowerCase())) ||
    d.TenSP.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-8 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Chi Tiết Bán Hàng</h2>
          <p className="text-gray-500 text-sm">Xem chi tiết từng mặt hàng đã bán trong các hóa đơn.</p>
        </div>
        
        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Tìm theo NV, khách, SP..." 
              className="pl-9 pr-4 py-2 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-100"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="flex items-center gap-2 bg-gray-100 text-gray-600 px-4 py-2 rounded-xl text-sm font-bold hover:bg-gray-200 transition-all">
            <Download className="w-4 h-4" /> Xuất Excel
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-500 text-xs font-bold uppercase tracking-widest">
            <tr>
              <th className="px-8 py-4">Hóa Đơn</th>
              <th className="px-8 py-4">Thời Gian</th>
              <th className="px-8 py-4">Nhân Viên</th>
              <th className="px-8 py-4">Khách Hàng</th>
              <th className="px-8 py-4">Sản Phẩm</th>
              <th className="px-8 py-4">SL</th>
              <th className="px-8 py-4 text-right">Thành Tiền</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map((row, idx) => (
              <tr key={`${row.MaHD}-${idx}`} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-8 py-4">
                  <span className="text-sm font-bold text-blue-600">#{row.MaHD}</span>
                </td>
                <td className="px-8 py-4 text-sm text-gray-500 flex items-center gap-2">
                  <Calendar className="w-3 h-3" />
                  {formatDate(row.NgayLap)}
                </td>
                <td className="px-8 py-4 text-sm font-medium text-gray-700">{row.TenNV}</td>
                <td className="px-8 py-4 text-sm text-gray-500">
                  {row.TenKH || <span className="text-gray-300 italic">Khách vãng lai</span>}
                </td>
                <td className="px-8 py-4 text-sm font-semibold text-gray-900">{row.TenSP}</td>
                <td className="px-8 py-4 text-sm text-gray-500">{row.SoLuong}</td>
                <td className="px-8 py-4 text-sm text-right font-black text-gray-900">
                  {formatCurrency(row.ThanhTien)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {filtered.length === 0 && (
        <div className="p-20 text-center text-gray-400">
          <ShoppingCart className="w-12 h-12 mx-auto opacity-20 mb-4" />
          <p>Không có dữ liệu bán hàng được tìm thấy.</p>
        </div>
      )}
    </div>
  );
}
