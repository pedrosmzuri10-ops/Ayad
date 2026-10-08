import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { WarehouseTab } from './components/WarehouseTab';
import { PosTab } from './components/PosTab';
import { DebtsTab } from './components/DebtsTab';
import { PurchasesTab } from './components/PurchasesTab';
import { ReportsTab } from './components/ReportsTab';
import { BarcodeTab } from './components/BarcodeTab';
import { ReceiptModal } from './components/ReceiptModal';

const AppContent: React.FC = () => {
  const { activeTab, language, viewingInvoice, setViewingInvoice } = useApp();

  return (
    <div
      dir={language === 'ku' ? 'rtl' : 'ltr'}
      className="min-h-screen bg-slate-100/70 text-slate-900 font-sans selection:bg-blue-600 selection:text-white flex flex-col"
    >
      {/* Header */}
      <Header />

      {/* Main View based on selected tab */}
      <main className="flex-1">
        {activeTab === 'warehouse' && <WarehouseTab />}
        {activeTab === 'pos' && <PosTab />}
        {activeTab === 'debts' && <DebtsTab />}
        {activeTab === 'purchases' && <PurchasesTab />}
        {activeTab === 'reports' && <ReportsTab />}
        {activeTab === 'barcode' && <BarcodeTab />}
      </main>

      {/* Persistent Bottom Navigation */}
      <BottomNav />

      {/* Printable Receipt Modal */}
      {viewingInvoice && (
        <ReceiptModal
          invoice={viewingInvoice}
          onClose={() => setViewingInvoice(null)}
        />
      )}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
