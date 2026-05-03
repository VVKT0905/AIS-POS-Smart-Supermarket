import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Search, Phone, Star, TrendingUp } from 'lucide-react';
import { formatCurrency, cn } from '../lib/utils';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';

interface Customer {
  MaKH: number;
  TenKH: string;
  Sdt: string;
  DiemTichLuy: number;
  TongTienDaMua: number;
  Hang: string;
}

export default function CustomerManagement() {
  const { t } = useTranslation();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ TenKH: '', Sdt: '' });

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    const res = await fetch('/api/customers');
    const data = await res.json();
    setCustomers(data);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/customers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newCustomer)
    });
    if (res.ok) {
      fetchCustomers();
      setShowModal(false);
      setNewCustomer({ TenKH: '', Sdt: '' });
    }
  };

  const filtered = customers.filter(c => 
    c.TenKH.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.Sdt.includes(searchTerm)
  );

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">{t('customers.title')}</h2>
          <p className="text-gray-500 mt-1">{t('customers.subtitle')}</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all active:scale-[0.98]"
        >
          <UserPlus className="w-5 h-5" /> {t('customers.add_customer')}
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-50">
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder={t('customers.search_placeholder')} 
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-blue-100"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 p-6">
          {filtered.map((customer) => (
            <motion.div
              layout
              key={customer.MaKH}
              className="p-6 rounded-3xl border border-gray-100 hover:border-blue-200 transition-all bg-white hover:shadow-xl hover:shadow-blue-50/50 group"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 font-bold text-xl">
                  {customer.TenKH.charAt(0)}
                </div>
                <span className={cn(
                  "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                  customer.Hang === 'Khách VIP' ? "bg-amber-100 text-amber-700 border border-amber-200" : "bg-gray-100 text-gray-500"
                )}>
                  {customer.Hang === 'Khách VIP' ? t('customers.vip') : t('customers.regular')}
                </span>
              </div>
              
              <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{customer.TenKH}</h3>
              <div className="flex items-center gap-2 text-gray-500 text-sm mt-1">
                <Phone className="w-3.5 h-3.5" />
                {customer.Sdt}
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 rounded-2xl">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{t('customers.loyalty_points')}</p>
                  <div className="flex items-center gap-1.5 text-blue-600">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="font-black text-lg">{customer.DiemTichLuy}</span>
                  </div>
                </div>
                <div className="p-3 bg-gray-50 rounded-2xl">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{t('customers.total_spending')}</p>
                  <div className="flex items-center gap-1.5 text-gray-900">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    <span className="font-bold">{formatCurrency(customer.TongTienDaMua).split(',')[0]}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl"
          >
            <h3 className="text-2xl font-black text-gray-900 mb-6">{t('customers.register_member')}</h3>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">{t('common.fullname')}</label>
                <input 
                  required
                  type="text" 
                  className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-blue-100"
                  value={newCustomer.TenKH}
                  onChange={e => setNewCustomer({...newCustomer, TenKH: e.target.value})}
                  placeholder="Nguyễn Văn A"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">{t('common.phone')}</label>
                <input 
                  required
                  type="tel" 
                  className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-blue-100"
                  value={newCustomer.Sdt}
                  onChange={e => setNewCustomer({...newCustomer, Sdt: e.target.value})}
                  placeholder="09xxx..."
                />
              </div>
              <div className="flex gap-3 mt-8">
                <button 
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-3 bg-gray-100 text-gray-600 rounded-2xl font-bold hover:bg-gray-200"
                >
                  {t('common.cancel')}
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-100"
                >
                  {t('common.register')}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
