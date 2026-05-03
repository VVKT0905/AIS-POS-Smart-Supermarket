import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DollarSign, Package, Users, ShoppingCart, ArrowUpRight, TrendingUp } from 'lucide-react';
import { formatCurrency } from '../lib/utils';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';

export default function Dashboard() {
  const { t } = useTranslation();
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalProducts: 0,
    totalCustomers: 0,
    totalSales: 0
  });
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    fetchStats();
    fetchChartData();
  }, []);

  const fetchStats = async () => {
    try {
      const [prodRes, custRes, detailRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/customers'),
        fetch('/api/reports/details')
      ]);
      const products = await prodRes.json();
      const customers = await custRes.json();
      const details = await detailRes.json();
      
      const revenue = details.reduce((sum: number, d: any) => sum + d.ThanhTien, 0);
      const uniqueInvoices = new Set(details.map((d: any) => d.MaHD)).size;

      setStats({
        totalRevenue: revenue,
        totalProducts: products.length,
        totalCustomers: customers.length,
        totalSales: uniqueInvoices
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchChartData = async () => {
    try {
      const end = new Date().toISOString().split('T')[0];
      const start = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const res = await fetch(`/api/reports/revenue?from=${start}&to=${end}`);
      const data = await res.json();
      setChartData(data);
    } catch (error) {
      console.error('Error fetching chart data:', error);
    }
  };

  const statCards = [
    { label: t('dashboard.revenue'), value: formatCurrency(stats.totalRevenue), icon: DollarSign, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: t('dashboard.products'), value: stats.totalProducts, icon: Package, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: t('dashboard.customers'), value: stats.totalCustomers, icon: Users, color: 'text-green-600', bg: 'bg-green-50' },
    { label: t('dashboard.orders'), value: stats.totalSales, icon: ShoppingCart, color: 'text-orange-600', bg: 'bg-orange-50' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">{t('dashboard.title')}</h1>
          <p className="text-gray-500 mt-1">{t('dashboard.welcome')}</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100 flex items-center gap-2 text-sm font-medium text-gray-600">
          <TrendingUp className="w-4 h-4 text-green-500" />
          +12% {t('dashboard.vs_yesterday')}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, idx) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            key={card.label}
            className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4 transition-all hover:shadow-md"
          >
            <div className={`p-4 rounded-2xl ${card.bg} ${card.color}`}>
              <card.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{card.label}</p>
              <p className="text-2xl font-bold text-gray-900 mt-0.5">{card.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart */}
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-bold text-gray-900">{t('dashboard.revenue_chart')}</h2>
            <select className="bg-gray-50 border-none rounded-xl text-sm px-4 py-2 focus:ring-2 focus:ring-blue-100">
              <option>{t('dashboard.this_week')}</option>
              <option>{t('dashboard.this_month')}</option>
            </select>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis 
                  dataKey="Ngay" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#9ca3af' }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#9ca3af' }}
                  tickFormatter={(val) => `${val/1000}k`}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  formatter={(value: number) => [formatCurrency(value), t('dashboard.revenue')]}
                />
                <Area 
                  type="monotone" 
                  dataKey="TongDoanhThu" 
                  stroke="#2563eb" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Actions / Recent */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-6">{t('dashboard.recent_activity')}</h2>
          <div className="space-y-6">
            {[1, 2, 3, 4].map((_, i) => (
              <div key={i} className="flex gap-4 items-start">
                <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center">
                  <ArrowUpRight className="w-5 h-5 text-gray-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{t('dashboard.sold_item', { name: 'Sữa tươi Vinamilk' })}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{t('dashboard.minutes_ago', { count: 2 + i * 5 })} • {t('dashboard.store_number')}</p>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-8 py-3 bg-gray-50 text-gray-600 rounded-2xl text-sm font-bold hover:bg-gray-100 transition-colors">
            {t('dashboard.view_all_logs')}
          </button>
        </div>
      </div>
    </div>
  );
}
