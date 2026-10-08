export type Currency = 'IQD' | 'USD';
export type Language = 'ku' | 'en';

export interface Category {
  id: string;
  nameKu: string;
  nameEn: string;
}

export interface Item {
  id: string;
  code: string; // e.g. #1001
  barcode?: string;
  nameKu: string;
  nameEn: string;
  categoryId: string;
  buyPrice: number; // in IQD
  sellPrice: number; // in IQD
  stockQuantity: number;
  unitKu: string; // دانە, باکێت, کارتۆن, کگم
  unitEn: string; // pcs, pack, carton, kg
  minStockAlert: number;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  debt: number; // in IQD
  createdAt: string;
}

export interface Supplier {
  id: string;
  name: string;
  phone: string;
  address: string;
  debt: number; // What we owe them in IQD
  createdAt: string;
}

export type PaymentMethod = 'cash' | 'debt' | 'half';

export interface InvoiceItem {
  itemId: string;
  itemCode: string;
  nameKu: string;
  nameEn: string;
  quantity: number;
  buyPrice: number;
  sellPrice: number;
  total: number;
  unitKu: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string; // e.g. INV-7001
  date: string; // YYYY-MM-DD
  time: string;
  customerId: string;
  customerName: string;
  items: InvoiceItem[];
  subtotal: number;
  discountPercent: number;
  discountAmount: number;
  total: number;
  profit: number;
  paymentMethod: PaymentMethod;
  cashPaid: number;
  debtAmount: number;
  note?: string;
}

export interface PurchaseInvoiceItem {
  itemId: string;
  nameKu: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface PurchaseInvoice {
  id: string;
  invoiceNumber: string; // e.g. PINV-902
  date: string;
  supplierId: string;
  supplierName: string;
  items: PurchaseInvoiceItem[];
  total: number;
  cashPaid: number;
  debtAmount: number;
  note?: string;
}

export type PaymentRecordType = 'received' | 'paid'; // received from customer OR paid to supplier

export interface PaymentRecord {
  id: string;
  date: string;
  type: PaymentRecordType;
  partyType: 'customer' | 'supplier';
  partyId: string;
  partyName: string;
  amount: number;
  note?: string;
}

export interface Expense {
  id: string;
  titleKu: string;
  titleEn: string;
  amount: number;
  categoryKu: string;
  categoryEn: string;
  date: string;
  note?: string;
}

export interface ShopSettings {
  shopName: string;
  ownerName: string;
  phone: string;
  address: string;
  usdToIqdRate: number; // e.g. 1530 for 1 USD (or 153000 for 100 USD)
  receiptFooterKu: string;
  receiptFooterEn: string;
}
