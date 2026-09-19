export interface TableColumn {
  id: string;
  label: string;
  type: 'text' | 'number';
  align: 'left' | 'center' | 'right';
  width?: string;
  isCustom?: boolean;
}

export interface InvoiceItem {
  id: string;
  no: number;
  bu: string;
  description: string;
  partNo: string;
  qty: number;
  price: number;
  total: number;
  remark: string;
  customFields?: Record<string, string | number>;
}

export interface CustomerInfo {
  customerName: string;
  contactPerson: string;
  companyName: string;
  nrcNo: string;
  address: string;
  phone: string;
}

export interface InvoiceHeader {
  voucherNo: string;
  invoiceNo: string;
  date: string;
  salesman: string;
  currency: string;
  saleType: string;
}

export interface InvoiceData {
  id?: string;
  header: InvoiceHeader;
  customer: CustomerInfo;
  items: InvoiceItem[];
  columns?: TableColumn[];
  grandTotal: number;
  signatures: {
    preparedBy: string; // base64
    checkedBy: string;  // base64
    approvedBy: string; // base64
    customerBy: string; // base64
  };
}

export interface SavedInvoice {
  id: string;
  savedAt: string;
  updatedAt: string;
  header: InvoiceHeader;
  customer: CustomerInfo;
  items: InvoiceItem[];
  columns: TableColumn[];
  grandTotal: number;
  signatures: {
    preparedBy: string;
    checkedBy: string;
    approvedBy: string;
    customerBy: string;
  };
  customShareText?: string | null;
}

export interface SpreadsheetRecord {
  spreadsheetId: string;
  spreadsheetUrl: string;
}
