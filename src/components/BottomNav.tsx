import React from 'react';
import { BarChart3, ShoppingCart, Package, Store, Users, Barcode } from 'lucide-react';
import { TabType, useApp } from '../context/AppContext';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, cart, items, language } = useApp();

  const totalCartItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalBarcodes = items.filter((i) => !!i.barcode && i.barcode.trim() !== '').length;

  const tabs = [
    {
      id: 'debts' as TabType,
      labelKu: 'قەرزەکان',
      labelEn: 'Debts',
      icon: Users,
    },
    {
      id: 'purchases' as TabType,
      labelKu: 'کڕین',
      labelEn: 'Purchases',
      icon: Store,
    },
    {
      id: 'warehouse' as TabType,
      labelKu: 'کۆگا و خەرجی',
      labelEn: 'Warehouse',
      icon: Package,
    },
    {
      id: 'pos' as TabType,
      labelKu: 'فرۆشتن',
      labelEn: 'Sales',
      icon: ShoppingCart,
      badge: totalCartItems > 0 ? totalCartItems : undefined,
    },
    {
      id: 'reports' as TabType,
      labelKu: 'ڕاپۆرت',
      labelEn: 'Reports',
      icon: BarChart3,
    },
    {
      id: 'barcode' as TabType,
      labelKu: 'بارکۆد',
      labelEn: 'Barcode',
      icon: Barcode,
      badge: totalBarcodes > 0 ? totalBarcodes : undefined,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900 border-t border-slate-800 text-white shadow-2xl safe-area-pb">
      <div className="max-w-4xl mx-auto flex items-center justify-between px-1 py-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex flex-col items-center justify-center py-1.5 px-0.5 rounded-xl transition-all relative cursor-pointer ${
                isActive
                  ? 'text-blue-400 bg-slate-800/90 font-bold scale-102'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 mb-0.5 transition-transform ${isActive ? 'scale-110' : ''}`} />
                {tab.badge !== undefined && (
                  <span className={`absolute -top-1.5 -right-2 text-white text-[9px] font-black rounded-full min-w-4 h-4 px-1 flex items-center justify-center shadow-xs ${
                    tab.id === 'barcode' ? 'bg-blue-600' : 'bg-rose-500'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] sm:text-[11px] leading-tight text-center truncate max-w-[60px]">
                {language === 'ku' ? tab.labelKu : tab.labelEn}
              </span>
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-0.5"></span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
