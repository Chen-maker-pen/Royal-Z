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
  header: InvoiceHeader;
  customer: CustomerInfo;
  items: InvoiceItem[];
  grandTotal: number;
  signatures: {
    preparedBy: string; // base64
    checkedBy: string;  // base64
    approvedBy: string; // base64
    customerBy: string; // base64
  };
}

export interface SpreadsheetRecord {
  spreadsheetId: string;
  spreadsheetUrl: string;
}
