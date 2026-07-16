import { InvoiceData } from "../types";

const SPREADSHEET_NAME = "Royal Z Sales Invoices";

export async function findOrCreateSpreadsheet(accessToken: string): Promise<{ id: string; url: string; isNew: boolean }> {
  // 1. Search Google Drive for an existing spreadsheet with this name
  const query = encodeURIComponent(`name = '${SPREADSHEET_NAME}' and mimeType = 'application/vnd.google-apps.spreadsheet' and trashed = false`);
  const listUrl = `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,webViewLink)`;

  const listRes = await fetch(listUrl, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!listRes.ok) {
    const errorMsg = await listRes.text();
    throw new Error(`Drive search failed: ${errorMsg}`);
  }

  const listData = await listRes.json();
  const existingFile = listData.files && listData.files[0];

  if (existingFile) {
    return {
      id: existingFile.id,
      url: existingFile.webViewLink || `https://docs.google.com/spreadsheets/d/${existingFile.id}`,
      isNew: false,
    };
  }

  // 2. Create a new Spreadsheet if not found
  const createUrl = "https://sheets.googleapis.com/v4/spreadsheets";
  const createRes = await fetch(createUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      properties: {
        title: SPREADSHEET_NAME,
      },
    }),
  });

  if (!createRes.ok) {
    const errorMsg = await createRes.text();
    throw new Error(`Spreadsheet creation failed: ${errorMsg}`);
  }

  const createData = await createRes.json();
  const newId = createData.spreadsheetId;
  const newUrl = createData.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${newId}`;

  // 3. Initialize with column headers
  await appendRow(accessToken, newId, "Sheet1!A1", [
    "Timestamp",
    "Date",
    "Voucher No",
    "Invoice No",
    "Sale Type",
    "Salesman",
    "Customer Name",
    "Company Name",
    "NRC No",
    "Phone",
    "Currency",
    "Grand Total",
    "Items Details"
  ]);

  return {
    id: newId,
    url: newUrl,
    isNew: true,
  };
}

export async function appendInvoiceToSheet(accessToken: string, spreadsheetId: string, invoice: InvoiceData): Promise<void> {
  const timestamp = new Date().toISOString();
  
  // Format items list as a readable text block including BU, Part No and Remark
  const itemsText = invoice.items
    .map(item => `[BU: ${item.bu || "-"} | No: ${item.no} | Part No: ${item.partNo || "-"} | ${item.qty}x ${item.description} @ ${item.price} ${invoice.header.currency} = ${item.total} | Remark: ${item.remark || "-"}]`)
    .join(", ");

  const rowData = [
    timestamp,
    invoice.header.date,
    invoice.header.voucherNo,
    invoice.header.invoiceNo,
    invoice.header.saleType || "Cash",
    invoice.header.salesman,
    invoice.customer.customerName,
    invoice.customer.companyName,
    invoice.customer.nrcNo || "-",
    invoice.customer.phone,
    invoice.header.currency,
    invoice.grandTotal,
    itemsText
  ];

  await appendRow(accessToken, spreadsheetId, "Sheet1!A1", rowData);
}

async function appendRow(accessToken: string, spreadsheetId: string, range: string, row: any[]): Promise<void> {
  const appendUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}:append?valueInputOption=USER_ENTERED`;
  const res = await fetch(appendUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      values: [row],
    }),
  });

  if (!res.ok) {
    const errorMsg = await res.text();
    throw new Error(`Failed to append row to spreadsheet: ${errorMsg}`);
  }
}
