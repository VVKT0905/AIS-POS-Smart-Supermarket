import React, { useState, useEffect } from 'react';
import { Search, Plus, Minus, Trash2, User, CreditCard, ChevronRight, Package, Loader2, ShoppingCart } from 'lucide-react';
import { formatCurrency, cn } from '../lib/utils';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';

interface Product {
  MaSP: string;
  TenSP: string;
  GiaBan: number;
  SoLuongTon: number;
}

interface CartItem extends Product {
  quantity: number;
}

interface Customer {
  MaKH: number;
  TenKH: string;
  Sdt: string;
  DiemTichLuy: number;
}

export default function POS() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerPhone, setCustomerPhone] = useState('');
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const res = await fetch('/api/products');
    const data = await res.json();
    setProducts(data);
  };

  const searchCustomer = async () => {
    if (!customerPhone) return;
    const res = await fetch(`/api/customers/search?sdt=${customerPhone}`);
    const data = await res.json();
    if (data) {
      setCustomer(data);
      setMessage({ type: 'success', text: t('pos.customer_found', { name: data.TenKH }) });
    } else {
      setCustomer(null);
      setMessage({ type: 'error', text: t('pos.customer_not_found') });
    }
    setTimeout(() => setMessage(null), 3000);
  };

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.MaSP === product.MaSP);
      if (existing) {
        if (existing.quantity >= product.SoLuongTon) {
          setMessage({ type: 'error', text: t('pos.stock_limit', { name: product.TenSP, count: product.SoLuongTon }) });
          setTimeout(() => setMessage(null), 3000);
          return prev;
        }
        return prev.map(item => item.MaSP === product.MaSP ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (maSP: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.MaSP === maSP) {
        const newQty = item.quantity + delta;
        if (newQty <= 0) return item;
        if (newQty > item.SoLuongTon) {
          setMessage({ type: 'error', text: t('pos.stock_limit', { name: item.TenSP, count: item.SoLuongTon }) });
          setTimeout(() => setMessage(null), 3000);
          return item;
        }
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const removeFromCart = (maSP: string) => {
    setCart(prev => prev.filter(item => item.MaSP !== maSP));
  };

  const total = cart.reduce((sum, item) => sum + (item.GiaBan * item.quantity), 0);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setIsProcessing(true);
    try {
      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          MaNV: user?.id,
          MaKH: customer?.MaKH,
          items: cart.map(item => ({
            MaSP: item.MaSP,
            SoLuong: item.quantity,
            DonGia: item.GiaBan
          }))
        })
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: 'success', text: t('pos.payment_success', { id: data.invoiceId }) });
        setCart([]);
        setCustomer(null);
        setCustomerPhone('');
        fetchProducts();
      } else {
        setMessage({ type: 'error', text: data.message || t('pos.payment_error') });
      }
    } catch (err) {
      setMessage({ type: 'error', text: t('pos.server_error') });
    } finally {
      setIsProcessing(false);
      setTimeout(() => setMessage(null), 5000);
    }
  };

  const filteredProducts = products.filter(p => 
    p.TenSP.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.MaSP.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex gap-8 h-[calc(100vh-120px)]">
      {/* Product Selection List */}
      <div className="flex-1 flex flex-col bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder={t('pos.search_placeholder')} 
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-blue-100 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {filteredProducts.map(product => (
              <motion.button
                layout
                key={product.MaSP}
                onClick={() => addToCart(product)}
                disabled={product.SoLuongTon <= 0}
                className={cn(
                  "p-4 rounded-2xl border transition-all text-left flex flex-col gap-2 group relative overflow-hidden",
                  product.SoLuongTon > 0 
                  ? "border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 active:scale-[0.98]" 
                  : "border-gray-50 bg-gray-50/50 opacity-60 grayscale cursor-not-allowed"
                )}
              >
                <div className="flex justify-between items-start">
                  <div className="p-2 bg-gray-100 rounded-lg text-gray-600 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                    <Package className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                    {product.MaSP}
                  </span>
                </div>
                <div className="mt-2">
                  <h3 className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors line-clamp-1">
                    {product.TenSP}
                  </h3>
                  <p className="text-blue-600 font-bold mt-1">{formatCurrency(product.GiaBan)}</p>
                </div>
                <div className="flex justify-between items-center mt-auto pt-2 border-t border-transparent group-hover:border-blue-100">
                  <span className="text-xs text-gray-500">{t('pos.stock')}: {product.SoLuongTon}</span>
                  {product.SoLuongTon <= 0 && <span className="text-xs font-bold text-red-500 uppercase">{t('pos.out_of_stock')}</span>}
                </div>
              </motion.button>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Cart & Checkout Side */}
      <div className="w-[400px] flex flex-col gap-6">
        {/* Customer Section */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 ">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-blue-500" /> {t('pos.customer')}
          </h2>
          <div className="flex gap-2">
            <input 
              type="text" 
              placeholder={t('pos.customer_search_placeholder')} 
              className="flex-1 px-4 py-2 bg-gray-50 border-none rounded-xl text-sm italic"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && searchCustomer()}
            />
            <button 
              onClick={searchCustomer}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700"
            >
              {t('common.find')}
            </button>
          </div>
          
          <AnimatePresence>
            {customer && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 p-4 bg-blue-50 rounded-2xl border border-blue-100"
              >
                <p className="font-bold text-blue-900">{customer.TenKH}</p>
                <div className="flex justify-between mt-1 text-sm text-blue-700">
                  <span>{t('pos.points')}:</span>
                  <span className="font-bold">{customer.DiemTichLuy}</span>
                </div>
                <button 
                  onClick={() => setCustomer(null)}
                  className="mt-2 text-xs text-blue-400 hover:text-blue-600 underline"
                >
                  {t('pos.remove_customer')}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Cart Item List */}
        <div className="flex-1 bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-gray-50 font-bold text-lg flex justify-between items-center">
            {t('pos.cart')}
            <span className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full text-xs">{cart.length} {t('pos.items')}</span>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-2 opacity-50">
                <ShoppingCart className="w-12 h-12" />
                <p className="text-sm">{t('pos.cart_empty')}</p>
              </div>
            ) : (
              cart.map(item => (
                <div key={item.MaSP} className="flex gap-3 p-3 bg-gray-50 rounded-2xl group transition-all hover:bg-blue-50/50">
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-gray-900 group-hover:text-blue-700">{item.TenSP}</h4>
                    <p className="text-xs text-gray-500 mt-0.5">{formatCurrency(item.GiaBan)}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg p-1">
                      <button onClick={() => updateQuantity(item.MaSP, -1)} className="p-0.5 hover:bg-gray-100 rounded text-gray-500"><Minus className="w-3 h-3" /></button>
                      <span className="w-6 text-center text-sm font-bold">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.MaSP, 1)} className="p-0.5 hover:bg-gray-100 rounded text-gray-500"><Plus className="w-3 h-3" /></button>
                    </div>
                    <button onClick={() => removeFromCart(item.MaSP)} className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-6 bg-gray-50 border-t border-gray-100 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-500 font-medium">{t('pos.total')}</span>
              <span className="text-2xl font-black text-blue-600">{formatCurrency(total)}</span>
            </div>
            
            <button 
              disabled={cart.length === 0 || isProcessing}
              onClick={handleCheckout}
              className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-blue-700 disabled:opacity-50 disabled:grayscale transition-all active:scale-[0.98]"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> 
                  {t('common.processing')}
                </>
              ) : (
                <>
                  {t('pos.checkout')} <ChevronRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Notifier Toast */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={cn(
              "fixed bottom-8 right-8 p-4 rounded-2xl shadow-xl border flex items-center gap-3 min-w-[300px] z-50",
              message.type === 'success' ? "bg-green-50 border-green-200 text-green-800" : "bg-red-50 border-red-200 text-red-800"
            )}
          >
            <div className={cn("p-2 rounded-full", message.type === 'success' ? "bg-green-100" : "bg-red-100")}>
              {message.type === 'success' ? <Package className="w-5 h-5" /> : <Trash2 className="w-5 h-5" />}
            </div>
            <p className="font-medium text-sm">{message.text}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
