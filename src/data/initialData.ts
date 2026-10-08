import { Category, Customer, Expense, Invoice, Item, PaymentRecord, PurchaseInvoice, ShopSettings, Supplier } from '../types';

export const initialCategories: Category[] = [
  { id: 'cat-1', nameKu: 'خۆراکە سەرەکییەکان', nameEn: 'Staple Groceries' },
  { id: 'cat-2', nameKu: 'خواردنەوەکان', nameEn: 'Beverages & Drinks' },
  { id: 'cat-3', nameKu: 'شیرەمەنی', nameEn: 'Dairy & Milk' },
  { id: 'cat-4', nameKu: 'شیرینی و چەرەسات', nameEn: 'Sweets & Confectionery' },
  { id: 'cat-5', nameKu: 'پاککەرەوەکان', nameEn: 'Cleaning & Detergents' },
];

// Clean Zero State - No demo items, no demo transactions
export const initialItems: Item[] = [];

export const initialCustomers: Customer[] = [
  {
    id: 'cust-cash',
    name: 'موشتەری گشتی (کاش)',
    phone: '-',
    address: '-',
    debt: 0,
    createdAt: new Date().toISOString().split('T')[0],
  },
];

export const initialSuppliers: Supplier[] = [];

export const initialInvoices: Invoice[] = [];

export const initialPurchases: PurchaseInvoice[] = [];

export const initialExpenses: Expense[] = [];

export const initialPayments: PaymentRecord[] = [];

export const initialShopSettings: ShopSettings = {
  shopName: 'Pedros',
  ownerName: 'پیدرۆس / بەڕێوەبەرایەتی فرۆشگا',
  phone: '0770 000 0000',
  address: 'سلێمانی / هەولێر',
  usdToIqdRate: 1530,
  receiptFooterKu: 'سوپاس بۆ سەردانەکەتان، کاڵای فرۆشراو دەگۆڕدرێتەوە بەپێی مەرج',
  receiptFooterEn: 'Thank you for your visit! Goods can be exchanged within 3 days.',
};
