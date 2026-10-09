import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import {
  initialCategories,
  initialCustomers,
  initialExpenses,
  initialInvoices,
  initialItems,
  initialPayments,
  initialPurchases,
  initialShopSettings,
  initialSuppliers,
} from '../data/initialData';
import {
  Category,
  Currency,
  Customer,
  Expense,
  Invoice,
  InvoiceItem,
  Item,
  Language,
  PaymentMethod,
  PaymentRecord,
  PaymentRecordType,
  PurchaseInvoice,
  PurchaseInvoiceItem,
  ShopSettings,
  Supplier,
} from '../types';
import { syncService, AppSyncData, SyncStatus } from '../services/syncService';

export type TabType = 'reports' | 'pos' | 'warehouse' | 'purchases' | 'debts' | 'barcode';

interface AppContextType {
  // Navigation & Preferences
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  currency: Currency;
  setCurrency: (c: Currency) => void;
  language: Language;
  setLanguage: (l: Language) => void;
  settings: ShopSettings;
  updateSettings: (settings: ShopSettings) => void;

  // Data
  items: Item[];
  categories: Category[];
  customers: Customer[];
  suppliers: Supplier[];
  invoices: Invoice[];
  purchases: PurchaseInvoice[];
  expenses: Expense[];
  payments: PaymentRecord[];

  // Cart for POS
  cart: InvoiceItem[];
  addToCart: (item: Item, quantity?: number) => void;
  removeFromCart: (itemId: string) => void;
  updateCartQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;

  // Actions
  addItem: (item: Omit<Item, 'id' | 'code'>) => Item;
  updateItem: (item: Item) => void;
  deleteItem: (id: string) => void;
  removeBarcode: (itemId: string) => void;

  addCategory: (cat: Omit<Category, 'id'>) => Category;
  updateCategory: (cat: Category) => void;
  deleteCategory: (id: string) => void;
  getTodayStats: () => {
    dateStr: string;
    totalSales: number;
    totalProfit: number;
    invoiceCount: number;
    soldItems: {
      itemId: string;
      itemCode: string;
      nameKu: string;
      quantity: number;
      unitKu: string;
      totalRevenue: number;
      totalProfit: number;
    }[];
  };

  addCustomer: (cust: Omit<Customer, 'id' | 'createdAt'>) => Customer;
  updateCustomer: (cust: Customer) => void;
  deleteCustomer: (id: string) => void;
  setCustomerDueDate: (customerId: string, dueDate?: string, debtDate?: string) => void;

  addSupplier: (sup: Omit<Supplier, 'id' | 'createdAt'>) => Supplier;
  updateSupplier: (sup: Supplier) => void;
  deleteSupplier: (id: string) => void;
  setSupplierDueDate: (supplierId: string, dueDate?: string, debtDate?: string) => void;

  completeSale: (data: {
    customerId: string;
    customerName: string;
    items: InvoiceItem[];
    discountPercent: number;
    paymentMethod: PaymentMethod;
    cashPaid?: number;
    debtDate?: string;
    dueDate?: string;
    note?: string;
  }) => Invoice;

  deleteInvoice: (id: string) => void;

  completePurchase: (data: {
    supplierId: string;
    supplierName: string;
    items: PurchaseInvoiceItem[];
    total: number;
    cashPaid: number;
    debtAmount: number;
    debtDate?: string;
    dueDate?: string;
    note?: string;
  }) => PurchaseInvoice;

  addExpense: (expense: Omit<Expense, 'id'>) => Expense;
  deleteExpense: (id: string) => void;

  recordPayment: (data: {
    type: PaymentRecordType;
    partyType: 'customer' | 'supplier';
    partyId: string;
    amount: number;
    note?: string;
  }) => PaymentRecord;
  deletePayment: (id: string) => void;

  // Formatting helpers
  formatMoney: (amountInIqd: number) => string;
  formatNumber: (n: number) => string;
  resetToDefaultData: () => void;
  exportDataJson: () => string;
  importDataJson: (jsonData: string) => boolean;

  // Active Viewing Invoice for Receipt Modal
  viewingInvoice: Invoice | null;
  setViewingInvoice: (invoice: Invoice | null) => void;

  // Real-time Cross-Device Sync (Automatic via Link)
  syncStatus: SyncStatus;
  deviceType: 'computer' | 'mobile';
  lastSyncTime: Date | null;
  forceSync: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = 'pedros_pos_v700_clean_zero_db';

// Automatically clean up old mock cache so app opens with 0 items and 0 transactions
if (typeof window !== 'undefined') {
  try {
    const oldKeys = [
      'pedros_pos_v700_data_items',
      'pedros_pos_v700_data_invoices',
      'pedros_pos_v700_data_customers',
      'pedros_pos_v700_data_suppliers',
      'pedros_pos_v700_data_purchases',
      'pedros_pos_v700_data_expenses',
      'pedros_pos_v700_data_payments',
    ];
    oldKeys.forEach((k) => localStorage.removeItem(k));
  } catch {
    // ignore
  }
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Navigation
  const [activeTab, setActiveTab] = useState<TabType>('warehouse');
  const [currency, setCurrency] = useState<Currency>('IQD');
  const [language, setLanguage] = useState<Language>('ku');
  const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null);

  // Core state with local storage fallback
  const [items, setItems] = useState<Item[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY + '_items');
    return saved ? JSON.parse(saved) : initialItems;
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY + '_categories');
    return saved ? JSON.parse(saved) : initialCategories;
  });

  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY + '_customers');
    return saved ? JSON.parse(saved) : initialCustomers;
  });

  const [suppliers, setSuppliers] = useState<Supplier[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY + '_suppliers');
    return saved ? JSON.parse(saved) : initialSuppliers;
  });

  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY + '_invoices');
    return saved ? JSON.parse(saved) : initialInvoices;
  });

  const [purchases, setPurchases] = useState<PurchaseInvoice[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY + '_purchases');
    return saved ? JSON.parse(saved) : initialPurchases;
  });

  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY + '_expenses');
    return saved ? JSON.parse(saved) : initialExpenses;
  });

  const [payments, setPayments] = useState<PaymentRecord[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY + '_payments');
    return saved ? JSON.parse(saved) : initialPayments;
  });

  const [settings, setSettings] = useState<ShopSettings>(() => {
    const saved = localStorage.getItem(STORAGE_KEY + '_settings');
    return saved ? JSON.parse(saved) : initialShopSettings;
  });

  // POS Cart State
  const [cart, setCart] = useState<InvoiceItem[]>([]);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY + '_items', JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY + '_categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY + '_customers', JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY + '_suppliers', JSON.stringify(suppliers));
  }, [suppliers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY + '_invoices', JSON.stringify(invoices));
  }, [invoices]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY + '_purchases', JSON.stringify(purchases));
  }, [purchases]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY + '_expenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY + '_payments', JSON.stringify(payments));
  }, [payments]);

  // Real-time Cross-Device Sync State
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('connected');
  const [deviceType, setDeviceType] = useState<'computer' | 'mobile'>('computer');
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const isApplyingRemoteUpdate = useRef(false);

  // Initialize syncService on mount
  useEffect(() => {
    setDeviceType(syncService.getDeviceType());
    setSyncStatus(syncService.getStatus());
    setLastSyncTime(syncService.getLastSyncTime());

    const unsubStatus = syncService.onStatusChange((status) => {
      setSyncStatus(status);
      setLastSyncTime(syncService.getLastSyncTime());
    });

    const unsubRemote = syncService.onRemoteUpdate((remoteData) => {
      isApplyingRemoteUpdate.current = true;
      if (remoteData.items) setItems(remoteData.items);
      if (remoteData.categories) setCategories(remoteData.categories);
      if (remoteData.customers) setCustomers(remoteData.customers);
      if (remoteData.suppliers) setSuppliers(remoteData.suppliers);
      if (remoteData.invoices) setInvoices(remoteData.invoices);
      if (remoteData.purchases) setPurchases(remoteData.purchases);
      if (remoteData.expenses) setExpenses(remoteData.expenses);
      if (remoteData.payments) setPayments(remoteData.payments);
      if (remoteData.settings) setSettings(remoteData.settings);

      setLastSyncTime(new Date());

      setTimeout(() => {
        isApplyingRemoteUpdate.current = false;
      }, 300);
    });

    const savedTime = localStorage.getItem(STORAGE_KEY + '_last_updated');
    const initialTimestamp = savedTime ? parseInt(savedTime, 10) : 0;
    syncService.startSync(initialTimestamp);

    return () => {
      unsubStatus();
      unsubRemote();
      syncService.stopSync();
    };
  }, []);

  // Sync to backend whenever any state changes
  useEffect(() => {
    if (isApplyingRemoteUpdate.current) return;
    const now = Date.now();
    localStorage.setItem(STORAGE_KEY + '_last_updated', now.toString());

    const payload: AppSyncData = {
      items,
      categories,
      customers,
      suppliers,
      invoices,
      purchases,
      expenses,
      payments,
      settings,
    };
    syncService.pushState(payload, now);
  }, [items, categories, customers, suppliers, invoices, purchases, expenses, payments, settings]);

  const forceSync = async () => {
    const payload: AppSyncData = {
      items,
      categories,
      customers,
      suppliers,
      invoices,
      purchases,
      expenses,
      payments,
      settings,
    };
    const now = Date.now();
    syncService.pushState(payload, now);
    const remote = await syncService.fetchLatest();
    if (remote) {
      isApplyingRemoteUpdate.current = true;
      if (remote.items) setItems(remote.items);
      if (remote.categories) setCategories(remote.categories);
      if (remote.customers) setCustomers(remote.customers);
      if (remote.suppliers) setSuppliers(remote.suppliers);
      if (remote.invoices) setInvoices(remote.invoices);
      if (remote.purchases) setPurchases(remote.purchases);
      if (remote.expenses) setExpenses(remote.expenses);
      if (remote.payments) setPayments(remote.payments);
      if (remote.settings) setSettings(remote.settings);
      setLastSyncTime(new Date());
      setTimeout(() => {
        isApplyingRemoteUpdate.current = false;
      }, 300);
    }
  };

  // Format number with commas
  const formatNumber = (n: number) => {
    return new Intl.NumberFormat('en-US').format(Math.round(n * 100) / 100);
  };

  // Format money based on active currency
  const formatMoney = (amountInIqd: number) => {
    if (currency === 'USD') {
      const rate = settings.usdToIqdRate || 1530;
      const usdVal = amountInIqd / rate;
      return `$ ${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(usdVal)}`;
    }
    return `${formatNumber(amountInIqd)} د.ع`;
  };

  // Cart operations
  const addToCart = (item: Item, quantity: number = 1) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.itemId === item.id);
      if (existing) {
        return prev.map((i) =>
          i.itemId === item.id
            ? { ...i, quantity: i.quantity + quantity, total: (i.quantity + quantity) * i.sellPrice }
            : i
        );
      }
      return [
        ...prev,
        {
          itemId: item.id,
          itemCode: item.code,
          nameKu: item.nameKu,
          nameEn: item.nameEn,
          quantity,
          buyPrice: item.buyPrice,
          sellPrice: item.sellPrice,
          total: quantity * item.sellPrice,
          unitKu: item.unitKu,
        },
      ];
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => prev.filter((i) => i.itemId !== itemId));
  };

  const updateCartQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    setCart((prev) =>
      prev.map((i) =>
        i.itemId === itemId ? { ...i, quantity, total: quantity * i.sellPrice } : i
      )
    );
  };

  const clearCart = () => setCart([]);

  // Item operations
  const addItem = (itemData: Omit<Item, 'id' | 'code'>): Item => {
    const nextCodeNum = 1000 + items.length + 1;
    const newItem: Item = {
      ...itemData,
      id: `item-${Date.now()}`,
      code: `#${nextCodeNum}`,
    };
    setItems((prev) => [newItem, ...prev]);
    return newItem;
  };

  const updateItem = (item: Item) => {
    setItems((prev) => prev.map((i) => (i.id === item.id ? item : i)));
  };

  const deleteItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const removeBarcode = (itemId: string) => {
    setItems((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, barcode: '' } : i))
    );
  };

  const addCategory = (catData: Omit<Category, 'id'>): Category => {
    const newCat: Category = {
      ...catData,
      id: `cat-${Date.now()}`,
    };
    setCategories((prev) => [...prev, newCat]);
    return newCat;
  };

  const updateCategory = (cat: Category) => {
    setCategories((prev) => prev.map((c) => (c.id === cat.id ? cat : c)));
  };

  const deleteCategory = (id: string) => {
    const remaining = categories.filter((c) => c.id !== id);
    if (remaining.length === 0) return; // Keep at least one category
    const fallbackCatId = remaining[0].id;
    // Reassign items that belonged to this category
    setItems((prev) =>
      prev.map((item) => (item.categoryId === id ? { ...item, categoryId: fallbackCatId } : item))
    );
    setCategories(remaining);
  };

  const getTodayStats = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    // Check if there are invoices for today; if not in current real year, fallback to most recent invoice date
    let targetDate = todayStr;
    const hasTodayInvoices = invoices.some((i) => i.date === todayStr);
    if (!hasTodayInvoices && invoices.length > 0) {
      targetDate = invoices[0].date;
    }

    const todayInvoices = invoices.filter((i) => i.date === targetDate);
    const totalSales = todayInvoices.reduce((sum, i) => sum + i.total, 0);
    const totalProfit = todayInvoices.reduce((sum, i) => sum + i.profit, 0);

    // Aggregate sold items
    const itemMap = new Map<
      string,
      {
        itemId: string;
        itemCode: string;
        nameKu: string;
        quantity: number;
        unitKu: string;
        totalRevenue: number;
        totalProfit: number;
      }
    >();

    for (const inv of todayInvoices) {
      for (const it of inv.items) {
        const existing = itemMap.get(it.itemId);
        const itemProfit = it.total - it.buyPrice * it.quantity;
        if (existing) {
          existing.quantity += it.quantity;
          existing.totalRevenue += it.total;
          existing.totalProfit += itemProfit;
        } else {
          itemMap.set(it.itemId, {
            itemId: it.itemId,
            itemCode: it.itemCode,
            nameKu: it.nameKu,
            quantity: it.quantity,
            unitKu: it.unitKu,
            totalRevenue: it.total,
            totalProfit: itemProfit,
          });
        }
      }
    }

    return {
      dateStr: targetDate,
      totalSales,
      totalProfit,
      invoiceCount: todayInvoices.length,
      soldItems: Array.from(itemMap.values()).sort((a, b) => b.totalRevenue - a.totalRevenue),
    };
  };

  // Customer operations
  const addCustomer = (custData: Omit<Customer, 'id' | 'createdAt'>): Customer => {
    const newCust: Customer = {
      ...custData,
      id: `cust-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setCustomers((prev) => [...prev, newCust]);
    return newCust;
  };

  const updateCustomer = (cust: Customer) => {
    setCustomers((prev) => prev.map((c) => (c.id === cust.id ? cust : c)));
  };

  const deleteCustomer = (id: string) => {
    setCustomers((prev) => prev.filter((c) => c.id !== id));
  };

  const setCustomerDueDate = (customerId: string, dueDate?: string, debtDate?: string) => {
    setCustomers((prev) =>
      prev.map((c) =>
        c.id === customerId
          ? {
              ...c,
              dueDate: dueDate !== undefined ? dueDate : c.dueDate,
              debtDate: debtDate !== undefined ? debtDate : c.debtDate,
            }
          : c
      )
    );
  };

  // Supplier operations
  const addSupplier = (supData: Omit<Supplier, 'id' | 'createdAt'>): Supplier => {
    const newSup: Supplier = {
      ...supData,
      id: `sup-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setSuppliers((prev) => [...prev, newSup]);
    return newSup;
  };

  const updateSupplier = (sup: Supplier) => {
    setSuppliers((prev) => prev.map((s) => (s.id === sup.id ? sup : s)));
  };

  const deleteSupplier = (id: string) => {
    setSuppliers((prev) => prev.filter((s) => s.id !== id));
  };

  const setSupplierDueDate = (supplierId: string, dueDate?: string, debtDate?: string) => {
    setSuppliers((prev) =>
      prev.map((s) =>
        s.id === supplierId
          ? {
              ...s,
              dueDate: dueDate !== undefined ? dueDate : s.dueDate,
              debtDate: debtDate !== undefined ? debtDate : s.debtDate,
            }
          : s
      )
    );
  };

  // Sale completion (POS)
  const completeSale = (data: {
    customerId: string;
    customerName: string;
    items: InvoiceItem[];
    discountPercent: number;
    paymentMethod: PaymentMethod;
    cashPaid?: number;
    debtDate?: string;
    dueDate?: string;
    note?: string;
  }): Invoice => {
    const subtotal = data.items.reduce((sum, item) => sum + item.total, 0);
    const discountAmount = Math.round((subtotal * data.discountPercent) / 100);
    const total = subtotal - discountAmount;

    // Calculate profit = total sale price - total purchase cost of items
    const totalCost = data.items.reduce((sum, item) => sum + item.buyPrice * item.quantity, 0);
    const profit = total - totalCost;

    let cashPaid = 0;
    let debtAmount = 0;

    if (data.paymentMethod === 'cash') {
      cashPaid = total;
      debtAmount = 0;
    } else if (data.paymentMethod === 'debt') {
      cashPaid = 0;
      debtAmount = total;
    } else if (data.paymentMethod === 'half') {
      cashPaid = data.cashPaid !== undefined ? data.cashPaid : Math.round(total / 2);
      debtAmount = Math.max(0, total - cashPaid);
    }

    const nextInvNumber = `INV-${7000 + invoices.length + 1}`;
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const customerObj = customers.find((c) => c.id === data.customerId);

    const newInvoice: Invoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber: nextInvNumber,
      date: dateStr,
      time: timeStr,
      customerId: data.customerId,
      customerName: data.customerName,
      items: data.items,
      subtotal,
      discountPercent: data.discountPercent,
      discountAmount,
      total,
      profit,
      paymentMethod: data.paymentMethod,
      cashPaid,
      debtAmount,
      debtDate: debtAmount > 0 ? (data.debtDate || dateStr) : undefined,
      dueDate: debtAmount > 0 ? data.dueDate : undefined,
      guarantorName: customerObj?.guarantorName,
      guarantorPhone: customerObj?.guarantorPhone,
      note: data.note || '',
    };

    // 1. Decrement item inventory stocks
    setItems((prev) =>
      prev.map((item) => {
        const sold = data.items.find((i) => i.itemId === item.id);
        if (sold) {
          return {
            ...item,
            stockQuantity: Math.max(0, item.stockQuantity - sold.quantity),
          };
        }
        return item;
      })
    );

    // 2. Add debt to customer if debtAmount > 0 and customer is not pure guest
    if (debtAmount > 0 && data.customerId !== 'cust-cash') {
      setCustomers((prev) =>
        prev.map((cust) =>
          cust.id === data.customerId
            ? {
                ...cust,
                debt: cust.debt + debtAmount,
                debtDate: data.debtDate || dateStr,
                dueDate: data.dueDate || cust.dueDate,
              }
            : cust
        )
      );
    }

    // 3. Add to invoices list
    setInvoices((prev) => [newInvoice, ...prev]);

    // Clear cart
    clearCart();

    return newInvoice;
  };

  // Delete invoice with inventory restoration & debt reversion
  const deleteInvoice = (id: string) => {
    const inv = invoices.find((i) => i.id === id);
    if (!inv) return;

    // Restore stock
    setItems((prev) =>
      prev.map((item) => {
        const sold = inv.items.find((i) => i.itemId === item.id);
        if (sold) {
          return {
            ...item,
            stockQuantity: item.stockQuantity + sold.quantity,
          };
        }
        return item;
      })
    );

    // Revert debt if customer owed
    if (inv.debtAmount > 0 && inv.customerId !== 'cust-cash') {
      setCustomers((prev) =>
        prev.map((cust) =>
          cust.id === inv.customerId
            ? { ...cust, debt: Math.max(0, cust.debt - inv.debtAmount) }
            : cust
        )
      );
    }

    setInvoices((prev) => prev.filter((i) => i.id !== id));
  };

  // Complete purchase invoice
  const completePurchase = (data: {
    supplierId: string;
    supplierName: string;
    items: PurchaseInvoiceItem[];
    total: number;
    cashPaid: number;
    debtAmount: number;
    debtDate?: string;
    dueDate?: string;
    note?: string;
  }): PurchaseInvoice => {
    const nextPINV = `PINV-${900 + purchases.length + 1}`;
    const dateStr = new Date().toISOString().split('T')[0];

    const newPurchase: PurchaseInvoice = {
      id: `pinv-${Date.now()}`,
      invoiceNumber: nextPINV,
      date: dateStr,
      supplierId: data.supplierId,
      supplierName: data.supplierName,
      items: data.items,
      total: data.total,
      cashPaid: data.cashPaid,
      debtAmount: data.debtAmount,
      debtDate: data.debtAmount > 0 ? (data.debtDate || dateStr) : undefined,
      dueDate: data.debtAmount > 0 ? data.dueDate : undefined,
      note: data.note,
    };

    // Increment item stock and update purchase price
    setItems((prev) =>
      prev.map((item) => {
        const purchased = data.items.find((pi) => pi.itemId === item.id);
        if (purchased) {
          return {
            ...item,
            stockQuantity: item.stockQuantity + purchased.quantity,
            buyPrice: purchased.unitPrice > 0 ? purchased.unitPrice : item.buyPrice,
          };
        }
        return item;
      })
    );

    // If debt owed to supplier, increment supplier debt
    if (data.debtAmount > 0) {
      setSuppliers((prev) =>
        prev.map((s) =>
          s.id === data.supplierId
            ? {
                ...s,
                debt: s.debt + data.debtAmount,
                debtDate: data.debtDate || dateStr,
                dueDate: data.dueDate || s.dueDate,
              }
            : s
        )
      );
    }

    setPurchases((prev) => [newPurchase, ...prev]);
    return newPurchase;
  };

  // Expense operations
  const addExpense = (expData: Omit<Expense, 'id'>): Expense => {
    const newExp: Expense = {
      ...expData,
      id: `exp-${Date.now()}`,
    };
    setExpenses((prev) => [newExp, ...prev]);
    return newExp;
  };

  const deleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  };

  // Payment operations (Debt collection from customer or repayment to supplier)
  const recordPayment = (data: {
    type: PaymentRecordType;
    partyType: 'customer' | 'supplier';
    partyId: string;
    amount: number;
    note?: string;
  }): PaymentRecord => {
    let partyName = '';
    if (data.partyType === 'customer') {
      const cust = customers.find((c) => c.id === data.partyId);
      partyName = cust ? cust.name : 'موشتەری';
      // Subtract debt from customer
      setCustomers((prev) =>
        prev.map((c) =>
          c.id === data.partyId ? { ...c, debt: Math.max(0, c.debt - data.amount) } : c
        )
      );
    } else {
      const sup = suppliers.find((s) => s.id === data.partyId);
      partyName = sup ? sup.name : 'کۆمپانیا';
      // Subtract debt from supplier
      setSuppliers((prev) =>
        prev.map((s) =>
          s.id === data.partyId ? { ...s, debt: Math.max(0, s.debt - data.amount) } : s
        )
      );
    }

    const newPayment: PaymentRecord = {
      id: `pay-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      type: data.type,
      partyType: data.partyType,
      partyId: data.partyId,
      partyName,
      amount: data.amount,
      note: data.note,
    };

    setPayments((prev) => [newPayment, ...prev]);
    return newPayment;
  };

  const deletePayment = (id: string) => {
    const p = payments.find((rec) => rec.id === id);
    if (!p) return;

    // Reverse effect on debt
    if (p.partyType === 'customer') {
      setCustomers((prev) =>
        prev.map((c) => (c.id === p.partyId ? { ...c, debt: c.debt + p.amount } : c))
      );
    } else {
      setSuppliers((prev) =>
        prev.map((s) => (s.id === p.partyId ? { ...s, debt: s.debt + p.amount } : s))
      );
    }

    setPayments((prev) => prev.filter((rec) => rec.id !== id));
  };

  const updateSettings = (newSettings: ShopSettings) => {
    setSettings(newSettings);
  };

  const resetToDefaultData = () => {
    setItems(initialItems);
    setCategories(initialCategories);
    setCustomers(initialCustomers);
    setSuppliers(initialSuppliers);
    setInvoices(initialInvoices);
    setPurchases(initialPurchases);
    setExpenses(initialExpenses);
    setPayments(initialPayments);
    setSettings(initialShopSettings);
    setCart([]);
  };

  const exportDataJson = () => {
    const backup = {
      items,
      categories,
      customers,
      suppliers,
      invoices,
      purchases,
      expenses,
      payments,
      settings,
      version: 'v700-pro',
      exportedAt: new Date().toISOString(),
    };
    return JSON.stringify(backup, null, 2);
  };

  const importDataJson = (jsonData: string): boolean => {
    try {
      const data = JSON.parse(jsonData);
      if (data.items) setItems(data.items);
      if (data.categories) setCategories(data.categories);
      if (data.customers) setCustomers(data.customers);
      if (data.suppliers) setSuppliers(data.suppliers);
      if (data.invoices) setInvoices(data.invoices);
      if (data.purchases) setPurchases(data.purchases);
      if (data.expenses) setExpenses(data.expenses);
      if (data.payments) setPayments(data.payments);
      if (data.settings) setSettings(data.settings);
      return true;
    } catch {
      return false;
    }
  };

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        currency,
        setCurrency,
        language,
        setLanguage,
        settings,
        updateSettings,
        items,
        categories,
        customers,
        suppliers,
        invoices,
        purchases,
        expenses,
        payments,
        cart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        addItem,
        updateItem,
        deleteItem,
        removeBarcode,
        addCategory,
        updateCategory,
        deleteCategory,
        getTodayStats,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        setCustomerDueDate,
        addSupplier,
        updateSupplier,
        deleteSupplier,
        setSupplierDueDate,
        completeSale,
        deleteInvoice,
        completePurchase,
        addExpense,
        deleteExpense,
        recordPayment,
        deletePayment,
        formatMoney,
        formatNumber,
        resetToDefaultData,
        exportDataJson,
        importDataJson,
        viewingInvoice,
        setViewingInvoice,
        syncStatus,
        deviceType,
        lastSyncTime,
        forceSync,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
