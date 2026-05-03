import React, { useState, useEffect } from 'react';
import { Package, Search, Plus, Edit2, Trash2, Check, X, AlertCircle } from 'lucide-react';
import { formatCurrency, cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface Product {
  MaSP: string;
  TenSP: string;
  GiaBan: number;
  SoLuongTon: number;
}

export default function ProductManagement() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ MaSP: '', TenSP: '', GiaBan: 0, SoLuongTon: 0 });
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const res = await fetch('/api/products');
    const data = await res.json();
    setProducts(data);
  };

  const handleEdit = (product: Product) => {
    setEditingId(product.MaSP);
    setFormData(product);
  };

  const handleSave = async () => {
    if (!formData.TenSP || formData.GiaBan <= 0) {
      setError('Vui lòng nhập đầy đủ thông tin hợp lệ');
      return;
    }

    const url = editingId ? `/api/products/${editingId}` : '/api/products';
    const method = editingId ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        fetchProducts();
        setEditingId(null);
        setIsAdding(false);
        setFormData({ MaSP: '', TenSP: '', GiaBan: 0, SoLuongTon: 0 });
        setError('');
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Lỗi kết nối máy chủ');
    }
  };

  const filteredProducts = products.filter(p => 
    p.TenSP.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.MaSP.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-8 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Kho Hàng</h2>
          <p className="text-gray-500 text-sm">Quản lý danh sách sản phẩm và tồn kho.</p>
        </div>
        
        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Tìm sản phẩm..." 
              className="pl-9 pr-4 py-2 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-100"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-blue-700 transition-all active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" /> Thêm mới
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-500 text-xs font-bold uppercase tracking-widest">
            <tr>
              <th className="px-8 py-4">Mã SP</th>
              <th className="px-8 py-4">Tên Sản Phẩm</th>
              <th className="px-8 py-4">Giá Bán</th>
              <th className="px-8 py-4">Tồn Kho</th>
              <th className="px-8 py-4 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            <AnimatePresence>
              {(isAdding || editingId) && (
                <motion.tr 
                  initial={{ opacity: 0, bg: 'rgba(59, 130, 246, 0.05)' }} 
                  animate={{ opacity: 1, bg: 'rgba(255, 255, 255, 1)' }}
                  className="bg-blue-50/30"
                >
                  <td className="px-8 py-4">
                    <input 
                      disabled={!!editingId}
                      type="text" 
                      className="w-24 px-2 py-1 border border-gray-200 rounded text-sm disabled:opacity-50"
                      value={formData.MaSP}
                      onChange={e => setFormData({...formData, MaSP: e.target.value})}
                      placeholder="Mã..."
                    />
                  </td>
                  <td className="px-8 py-4 text-sm">
                    <input 
                      type="text" 
                      className="w-full px-2 py-1 border border-gray-200 rounded text-sm"
                      value={formData.TenSP}
                      onChange={e => setFormData({...formData, TenSP: e.target.value})}
                      placeholder="Tên sản phẩm..."
                    />
                  </td>
                  <td className="px-8 py-4 text-sm">
                    <input 
                      type="number" 
                      className="w-32 px-2 py-1 border border-gray-200 rounded text-sm"
                      value={formData.GiaBan}
                      onChange={e => setFormData({...formData, GiaBan: Number(e.target.value)})}
                    />
                  </td>
                  <td className="px-8 py-4 text-sm">
                    <input 
                      type="number" 
                      className="w-24 px-2 py-1 border border-gray-200 rounded text-sm"
                      value={formData.SoLuongTon}
                      onChange={e => setFormData({...formData, SoLuongTon: Number(e.target.value)})}
                    />
                  </td>
                  <td className="px-8 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={handleSave} className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 shadow-sm"><Check className="w-4 h-4" /></button>
                      <button onClick={() => { setEditingId(null); setIsAdding(false); setError(''); }} className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"><X className="w-4 h-4" /></button>
                    </div>
                  </td>
                </motion.tr>
              )}
            </AnimatePresence>
            
            {filteredProducts.map((product) => (
              <tr key={product.MaSP} className="hover:bg-gray-50/50 transition-colors group">
                <td className="px-8 py-5 text-sm font-mono text-gray-400">{product.MaSP}</td>
                <td className="px-8 py-5 text-sm font-bold text-gray-900">{product.TenSP}</td>
                <td className="px-8 py-5 text-sm text-blue-600 font-bold">{formatCurrency(product.GiaBan)}</td>
                <td className="px-8 py-5 text-sm">
                  <span className={cn(
                    "px-2 py-1 rounded-full text-xs font-bold",
                    product.SoLuongTon < 10 ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-600"
                  )}>
                    {product.SoLuongTon} sản phẩm
                  </span>
                </td>
                <td className="px-8 py-5 text-right">
                  <button 
                    onClick={() => handleEdit(product)}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-600 text-sm flex items-center gap-2 border-t border-red-100">
          <AlertCircle className="w-4 h-4" /> {error}
        </div>
      )}
    </div>
  );
}
