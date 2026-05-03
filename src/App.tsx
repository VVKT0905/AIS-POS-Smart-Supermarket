import React from 'react';
import { useAuth } from './contexts/AuthContext';
import Login from './components/Login';
import POS from './components/POS';
import Dashboard from './components/Dashboard';
import ProductManagement from './components/ProductManagement';
import CustomerManagement from './components/CustomerManagement';
import Reports from './components/Reports';
import LanguageSwitcher from './components/LanguageSwitcher';
import { LogOut, ShoppingCart, LayoutDashboard, Database, Users, BarChart3 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';

function Sidebar({ activeTab, setActiveTab }: { activeTab: string, setActiveTab: (t: string) => void }) {
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  
  const menuItems = [
    { id: 'pos', label: t('sidebar.pos'), icon: ShoppingCart, role: 1 },
    { id: 'dashboard', label: t('sidebar.dashboard'), icon: LayoutDashboard, role: 2 },
    { id: 'products', label: t('sidebar.products'), icon: Database, role: 2 },
    { id: 'customers', label: t('sidebar.customers'), icon: Users, role: 1 },
    { id: 'reports', label: t('sidebar.reports'), icon: BarChart3, role: 2 },
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen sticky top-0 flex flex-col">
      <div className="p-6 border-b border-gray-100 flex items-center justify-between">
        <h1 className="text-xl font-bold text-blue-600 flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <ShoppingCart className="w-5 h-5 text-white" />
          </div>
          AIS POS
        </h1>
        <LanguageSwitcher />
      </div>
      
      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => {
          if (user && user.role < item.role) return null;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === item.id 
                  ? 'bg-blue-50 text-blue-600 shadow-sm shadow-blue-100' 
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-100 mt-auto">
        <div className="flex items-center gap-3 px-4 py-3 mb-4">
          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-sm font-bold text-gray-600 uppercase">
            {user?.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{user?.name}</p>
            <p className="text-xs text-gray-500 truncate">{user?.role === 2 ? t('common.manager') : t('common.cashier')}</p>
          </div>
        </div>
        <button 
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-all"
        >
          <LogOut className="w-5 h-5" />
          {t('common.logout')}
        </button>
      </div>
    </div>
  );
}

export default function App() {
  const { user, isLoading } = useAuth();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = React.useState('pos');

  if (isLoading) return <div className="h-screen w-screen flex items-center justify-center font-medium text-gray-500">{t('common.loading')}</div>;
  if (!user) return <Login />;

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'pos' && <POS />}
              {activeTab === 'dashboard' && <Dashboard />}
              {activeTab === 'products' && <ProductManagement />}
              {activeTab === 'customers' && <CustomerManagement />}
              {activeTab === 'reports' && <Reports />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
