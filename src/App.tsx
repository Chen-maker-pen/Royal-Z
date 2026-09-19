import React, { useState, useEffect } from "react";
import html2pdf from "html2pdf.js";
import { 
  Plus, 
  Trash2, 
  Download, 
  RefreshCw, 
  Check,
  Copy,
  Send,
  MessageCircle,
  MessageSquare,
  Phone,
  Info,
  Calendar,
  Layers,
  Sparkles,
  Printer,
  Share2,
  History,
  Save,
  PlusCircle,
  FilePlus,
  Columns,
  CheckCircle2
} from "lucide-react";
import { InvoiceItem, TableColumn, SavedInvoice } from "./types";
import { SignaturePad } from "./components/SignaturePad";
import { SpreadsheetTable } from "./components/SpreadsheetTable";
import { AddColumnModal } from "./components/AddColumnModal";
import { InvoiceHistoryModal } from "./components/InvoiceHistoryModal";

const DEFAULT_COLUMNS: TableColumn[] = [
  { id: 'no', label: 'NO', type: 'number', align: 'center', width: 'w-10' },
  { id: 'bu', label: 'BU', type: 'text', align: 'center', width: 'w-16' },
  { id: 'description', label: 'DESCRIPTION', type: 'text', align: 'left', width: 'min-w-[180px]' },
  { id: 'partNo', label: 'PART NO', type: 'text', align: 'center', width: 'w-28' },
  { id: 'qty', label: 'QTY', type: 'number', align: 'center', width: 'w-14' },
  { id: 'price', label: 'PRICE/UNIT', type: 'number', align: 'right', width: 'w-28' },
  { id: 'total', label: 'TOTAL AMT', type: 'number', align: 'right', width: 'w-32' },
  { id: 'remark', label: 'REMARK', type: 'text', align: 'left', width: 'w-28' },
];

const DEFAULT_SAVED_INVOICES: SavedInvoice[] = [
  {
    id: "inv-record-1082",
    savedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    header: {
      voucherNo: "VOU-4029",
      invoiceNo: "RZ-2025-1082",
      date: new Date(Date.now() - 3600000 * 24).toISOString().split("T")[0],
      salesman: "Ko Aung Kyaw",
      currency: "MMK",
      saleType: "Cash"
    },
    customer: {
      customerName: "U Min Min Thant",
      contactPerson: "Daw Hla Hla",
      companyName: "Myanmar Engineering & Construction Co., Ltd",
      nrcNo: "12/LAKANA(N)098234",
      address: "No. 128, Pyay Road, Kamayut Township, Yangon",
      phone: "+95 9 4500 12345"
    },
    items: [
      { id: "item-d1", no: 1, bu: "CE-1", description: "Engine Overhaul & Hydraulic Cylinder Seal Kit", partNo: "HYD-882-99", qty: 2, price: 450000, total: 900000, remark: "Original OEM" },
      { id: "item-d2", no: 2, bu: "CE-2", description: "High-Pressure Oil Filter & Fuel Separator", partNo: "FLT-440-X", qty: 4, price: 85000, total: 340000, remark: "Standard OEM" },
      { id: "item-d3", no: 3, bu: "CE-3", description: "Diagnostic Calibration & Service Labor", partNo: "SRV-CAL-01", qty: 1, price: 250000, total: 250000, remark: "Certified" }
    ],
    columns: DEFAULT_COLUMNS,
    grandTotal: 1490000,
    signatures: {
      preparedBy: "",
      checkedBy: "",
      approvedBy: "",
      customerBy: ""
    }
  },
  {
    id: "inv-record-0955",
    savedAt: new Date(Date.now() - 3600000 * 72).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 72).toISOString(),
    header: {
      voucherNo: "VOU-3810",
      invoiceNo: "RZ-2025-0955",
      date: new Date(Date.now() - 3600000 * 72).toISOString().split("T")[0],
      salesman: "Ma Su Mon",
      currency: "MMK",
      saleType: "Credit"
    },
    customer: {
      customerName: "Daw Khin Mar Lar",
      contactPerson: "U Kyaw Myint",
      companyName: "Golden Logistics & Heavy Transport Co.",
      nrcNo: "12/KAMAYA(N)114422",
      address: "Industrial Zone (1), Hlaing Tharyar, Yangon",
      phone: "+95 9 7900 67890"
    },
    items: [
      { id: "item-d4", no: 1, bu: "FL-1", description: "Heavy Duty Brake Disc & Pad Assembly", partNo: "BRK-990", qty: 4, price: 180000, total: 720000, remark: "Warranty 6 mo" },
      { id: "item-d5", no: 2, bu: "FL-2", description: "Synthetic Transmission Fluid (20L Drum)", partNo: "OIL-SYN-20L", qty: 3, price: 135000, total: 405000, remark: "Grade A" }
    ],
    columns: DEFAULT_COLUMNS,
    grandTotal: 1125000,
    signatures: {
      preparedBy: "",
      checkedBy: "",
      approvedBy: "",
      customerBy: ""
    }
  }
];

export default function App() {
  // 1. Core States
  const [header, setHeader] = useState({
    voucherNo: "",
    invoiceNo: "",
    date: "",
    salesman: "",
    currency: "MMK",
    saleType: "Cash"
  });

  const [customer, setCustomer] = useState({
    customerName: "",
    contactPerson: "",
    companyName: "",
    nrcNo: "",
    address: "",
    phone: ""
  });

  const [items, setItems] = useState<InvoiceItem[]>([
    { id: "item-1", no: 1, bu: "", description: "", partNo: "", qty: 1, price: 0, total: 0, remark: "" }
  ]);

  const [signatures, setSignatures] = useState({
    preparedBy: "",
    checkedBy: "",
    approvedBy: "",
    customerBy: ""
  });

  // Table Columns (Spreadsheet customization)
  const [columns, setColumns] = useState<TableColumn[]>(() => {
    const saved = localStorage.getItem("royal_z_columns");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return DEFAULT_COLUMNS;
  });

  // Invoice History states
  const [savedInvoices, setSavedInvoices] = useState<SavedInvoice[]>(() => {
    const saved = localStorage.getItem("royal_z_invoice_history");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return DEFAULT_SAVED_INVOICES;
  });
  const [currentInvoiceId, setCurrentInvoiceId] = useState<string | null>(null);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isAddColumnModalOpen, setIsAddColumnModalOpen] = useState(false);
  const [addColumnInsertIndex, setAddColumnInsertIndex] = useState<number | undefined>(undefined);
  const [saveNotification, setSaveNotification] = useState<string | null>(null);

  // 2. Integration & UI States
  const [isExporting, setIsExporting] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const [customLogo, setCustomLogo] = useState<string | null>(() => {
    return localStorage.getItem("royal_z_custom_logo");
  });
  
  // Share States
  const [copied, setCopied] = useState(false);
  const [customShareText, setCustomShareText] = useState<string | null>(null);
  const [isSharingPdf, setIsSharingPdf] = useState(false);

  // 2b. Logo Upload handler
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setCustomLogo(base64String);
        localStorage.setItem("royal_z_custom_logo", base64String);
        setLogoError(false);
      };
      reader.readAsDataURL(file);
    }
  };

  // 3. Auto-populate initial numbers & date
  useEffect(() => {
    const today = new Date();
    const formattedDate = today.toISOString().split("T")[0];
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const generatedInvoiceNo = `RZ-${today.getFullYear()}-${randomSuffix}`;
    const generatedVoucherNo = `VOU-${randomSuffix}`;

    setHeader({
      voucherNo: generatedVoucherNo,
      invoiceNo: generatedInvoiceNo,
      date: formattedDate,
      salesman: "",
      currency: "MMK",
      saleType: "Cash"
    });
  }, []);

  // Auto-save active draft to localStorage
  useEffect(() => {
    const draftData = {
      header,
      customer,
      items,
      columns,
      signatures,
      currentInvoiceId
    };
    try {
      localStorage.setItem("royal_z_active_draft", JSON.stringify(draftData));
    } catch (e) {}
  }, [header, customer, items, columns, signatures, currentInvoiceId]);

  // 4. Spreadsheet Calculations
  const computeRowTotal = (qty: number, price: number, customFields?: Record<string, string | number>) => {
    const base = qty * price;
    // Automatic discount formula support if user adds a Discount column!
    const discountCol = columns.find(c => c.isCustom && c.label.toLowerCase().includes("discount"));
    if (discountCol && customFields?.[discountCol.id] !== undefined) {
      const disc = parseFloat(String(customFields[discountCol.id])) || 0;
      return Math.max(0, Math.round(base * (1 - disc / 100)));
    }
    return base;
  };

  const grandTotal = items.reduce((sum, item) => sum + item.total, 0);

  const handleItemChange = (id: string, field: keyof InvoiceItem, value: any) => {
    setItems(prevItems => 
      prevItems.map(item => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value };
          if (field === "qty" || field === "price") {
            const qty = field === "qty" ? Number(value) : item.qty;
            const price = field === "price" ? Number(value) : item.price;
            updatedItem.total = computeRowTotal(qty, price, item.customFields);
          }
          return updatedItem;
        }
        return item;
      })
    );
  };

  const handleCustomFieldChange = (id: string, colId: string, value: any) => {
    setItems(prevItems =>
      prevItems.map(item => {
        if (item.id === id) {
          const updatedCustomFields = { ...(item.customFields || {}), [colId]: value };
          const updatedItem = { ...item, customFields: updatedCustomFields };
          // If editing a discount column, recalculate total
          const col = columns.find(c => c.id === colId);
          if (col && col.label.toLowerCase().includes("discount")) {
            updatedItem.total = computeRowTotal(item.qty, item.price, updatedCustomFields);
          }
          return updatedItem;
        }
        return item;
      })
    );
  };

  // Row spreadsheet operations
  const handleAddRow = () => {
    const nextNo = items.length + 1;
    const nextId = `item-${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    setItems([
      ...items,
      { id: nextId, no: nextNo, bu: "", description: "", partNo: "", qty: 1, price: 0, total: 0, remark: "" }
    ]);
  };

  const handleInsertRow = (index: number) => {
    const nextId = `item-${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    const newRow: InvoiceItem = {
      id: nextId,
      no: index + 2,
      bu: "",
      description: "",
      partNo: "",
      qty: 1,
      price: 0,
      total: 0,
      remark: ""
    };
    const updated = [...items];
    updated.splice(index + 1, 0, newRow);
    // Recalculate sequence numbers
    const sequenced = updated.map((item, idx) => ({ ...item, no: idx + 1 }));
    setItems(sequenced);
  };

  const handleDuplicateRow = (index: number) => {
    const target = items[index];
    const nextId = `item-${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    const duplicatedRow: InvoiceItem = {
      ...target,
      id: nextId,
      no: index + 2,
      customFields: target.customFields ? { ...target.customFields } : undefined
    };
    const updated = [...items];
    updated.splice(index + 1, 0, duplicatedRow);
    const sequenced = updated.map((item, idx) => ({ ...item, no: idx + 1 }));
    setItems(sequenced);
  };

  const handleMoveRow = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === items.length - 1) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const updated = [...items];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);
    const sequenced = updated.map((item, idx) => ({ ...item, no: idx + 1 }));
    setItems(sequenced);
  };

  const handleRemoveRow = (id: string) => {
    if (items.length <= 1) return;
    const filtered = items.filter(item => item.id !== id);
    const sequenced = filtered.map((item, index) => ({
      ...item,
      no: index + 1
    }));
    setItems(sequenced);
  };

  // Column operations
  const handleAddColumn = (newCol: TableColumn, insertIndex?: number) => {
    let updated: TableColumn[];
    if (typeof insertIndex === 'number' && insertIndex >= 0 && insertIndex <= columns.length) {
      updated = [...columns.slice(0, insertIndex), newCol, ...columns.slice(insertIndex)];
    } else {
      updated = [...columns, newCol];
    }
    setColumns(updated);
    localStorage.setItem("royal_z_columns", JSON.stringify(updated));
    setSaveNotification(`Added column "${newCol.label}"`);
    setTimeout(() => setSaveNotification(null), 3000);
  };

  const handleRemoveColumn = (colId: string) => {
    const updated = columns.filter(c => c.id !== colId);
    setColumns(updated);
    localStorage.setItem("royal_z_columns", JSON.stringify(updated));
  };

  const handleRenameColumn = (colId: string, newLabel: string) => {
    const updated = columns.map(c => c.id === colId ? { ...c, label: newLabel } : c);
    setColumns(updated);
    localStorage.setItem("royal_z_columns", JSON.stringify(updated));
  };

  // 5. Invoice History & Persistence Operations
  const handleSaveInvoice = () => {
    const now = new Date().toISOString();
    let targetId = currentInvoiceId;
    let isNew = false;
    
    if (!targetId) {
      targetId = `inv_${Date.now()}`;
      setCurrentInvoiceId(targetId);
      isNew = true;
    }

    const invoiceRecord: SavedInvoice = {
      id: targetId,
      savedAt: isNew ? now : (savedInvoices.find(i => i.id === targetId)?.savedAt || now),
      updatedAt: now,
      header,
      customer,
      items,
      columns,
      grandTotal,
      signatures,
      customShareText
    };

    setSavedInvoices(prev => {
      const existsIndex = prev.findIndex(i => i.id === targetId);
      let updated: SavedInvoice[];
      if (existsIndex >= 0) {
        updated = [...prev];
        updated[existsIndex] = invoiceRecord;
      } else {
        updated = [invoiceRecord, ...prev];
      }
      localStorage.setItem("royal_z_invoice_history", JSON.stringify(updated));
      return updated;
    });

    setSaveNotification(`Invoice ${header.invoiceNo || 'Draft'} saved to history!`);
    setTimeout(() => setSaveNotification(null), 3500);
  };

  const handleLoadInvoice = (inv: SavedInvoice) => {
    setCurrentInvoiceId(inv.id);
    setHeader(inv.header);
    setCustomer(inv.customer);
    setItems(inv.items);
    if (inv.columns && inv.columns.length > 0) {
      setColumns(inv.columns);
      localStorage.setItem("royal_z_columns", JSON.stringify(inv.columns));
    }
    if (inv.signatures) {
      setSignatures(inv.signatures);
    }
    if (inv.customShareText !== undefined) {
      setCustomShareText(inv.customShareText);
    }
    setSaveNotification(`Loaded ${inv.header.invoiceNo || 'invoice'} for re-editing.`);
    setTimeout(() => setSaveNotification(null), 3500);
  };

  const handleDuplicateInvoice = (inv: SavedInvoice) => {
    const today = new Date();
    const formattedDate = today.toISOString().split("T")[0];
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const newInvoiceNo = `RZ-${today.getFullYear()}-${randomSuffix}`;
    const newVoucherNo = `VOU-${randomSuffix}`;

    const duplicatedRecord: SavedInvoice = {
      ...inv,
      id: `inv_${Date.now()}`,
      savedAt: today.toISOString(),
      updatedAt: today.toISOString(),
      header: {
        ...inv.header,
        invoiceNo: newInvoiceNo,
        voucherNo: newVoucherNo,
        date: formattedDate
      },
    };

    setSavedInvoices(prev => {
      const updated = [duplicatedRecord, ...prev];
      localStorage.setItem("royal_z_invoice_history", JSON.stringify(updated));
      return updated;
    });

    setSaveNotification(`Duplicated invoice as ${newInvoiceNo}!`);
    setTimeout(() => setSaveNotification(null), 3500);
  };

  const handleDeleteInvoice = (id: string) => {
    setSavedInvoices(prev => {
      const updated = prev.filter(i => i.id !== id);
      localStorage.setItem("royal_z_invoice_history", JSON.stringify(updated));
      return updated;
    });
    if (currentInvoiceId === id) {
      setCurrentInvoiceId(null);
    }
  };

  const handleNewInvoice = () => {
    const today = new Date();
    const formattedDate = today.toISOString().split("T")[0];
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);

    setCurrentInvoiceId(null);
    setHeader({
      voucherNo: `VOU-${randomSuffix}`,
      invoiceNo: `RZ-${today.getFullYear()}-${randomSuffix}`,
      date: formattedDate,
      salesman: "",
      currency: "MMK",
      saleType: "Cash"
    });

    setCustomer({
      customerName: "",
      contactPerson: "",
      companyName: "",
      nrcNo: "",
      address: "",
      phone: ""
    });

    setItems([
      { id: `item-${Date.now()}`, no: 1, bu: "", description: "", partNo: "", qty: 1, price: 0, total: 0, remark: "" }
    ]);

    setSignatures({
      preparedBy: "",
      checkedBy: "",
      approvedBy: "",
      customerBy: ""
    });

    setCustomShareText(null);
    setSaveNotification("Started new blank invoice.");
    setTimeout(() => setSaveNotification(null), 3000);
  };

  const handleExportHistory = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(savedInvoices, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `Royal_Z_Invoices_Backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportHistory = (imported: SavedInvoice[]) => {
    setSavedInvoices(prev => {
      // Merge unique by ID
      const map = new Map<string, SavedInvoice>();
      prev.forEach(i => map.set(i.id, i));
      imported.forEach(i => map.set(i.id, i));
      const combined = Array.from(map.values());
      localStorage.setItem("royal_z_invoice_history", JSON.stringify(combined));
      return combined;
    });
    setSaveNotification(`Successfully imported ${imported.length} invoices!`);
    setTimeout(() => setSaveNotification(null), 3500);
  };

  // 6. Reset form
  const handleResetForm = () => {
    if (window.confirm("Are you sure you want to clear this invoice form?")) {
      handleNewInvoice();
    }
  };


  // 8. PDF Download Handler using html2pdf.js
  const handleDownloadPDF = async () => {
    setIsExporting(true);

    // Backup original window.getComputedStyle to restore later
    const originalGetComputedStyle = window.getComputedStyle;
    const memoizedColors = new Map<string, string>();

    // Helper to safely convert oklch or oklab to standard rgb/rgba using offscreen canvas context
    const safeColorConverter = (colorStr: string): string => {
      if (!colorStr || typeof colorStr !== 'string') return colorStr;
      if (!colorStr.includes('oklch') && !colorStr.includes('oklab')) return colorStr;
      
      if (memoizedColors.has(colorStr)) {
        return memoizedColors.get(colorStr)!;
      }
      
      try {
        const canvas = document.createElement('canvas');
        canvas.width = 1;
        canvas.height = 1;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = colorStr;
          ctx.fillRect(0, 0, 1, 1);
          const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
          const alpha = a / 255;
          const result = alpha === 1 ? `rgb(${r}, ${g}, ${b})` : `rgba(${r}, ${g}, ${b}, ${alpha})`;
          memoizedColors.set(colorStr, result);
          return result;
        }
      } catch (e) {
        console.warn("Failed to convert color:", colorStr, e);
      }
      return 'rgb(113, 113, 122)'; // safe fallback
    };

    // Override getComputedStyle to intercept oklch or oklab references requested by html2canvas
    window.getComputedStyle = function(el, pseudo) {
      const style = originalGetComputedStyle.call(this, el, pseudo);
      return new Proxy(style, {
        get(target, prop) {
          if (prop === 'getPropertyValue') {
            return function(propertyName: string) {
              const val = target.getPropertyValue(propertyName);
              if (typeof val === 'string' && (val.includes('oklch') || val.includes('oklab'))) {
                return safeColorConverter(val);
              }
              return val;
            };
          }
          const value = Reflect.get(target, prop);
          if (typeof value === 'string' && (value.includes('oklch') || value.includes('oklab'))) {
            return safeColorConverter(value);
          }
          if (typeof value === 'function') {
            return value.bind(target);
          }
          return value;
        }
      });
    };

    // --- SECURE STYLE SANITIZATION (CRITICAL FOR html2canvas STYLESHEET PARSING BUG) ---
    // Save original styles and temporarily replace 'oklch(...)' or 'oklab(...)' with a standard hex fallback in all <style> elements
    const stylesToRestore: { element: HTMLStyleElement; originalText: string }[] = [];
    const styleElements = document.querySelectorAll('style');
    styleElements.forEach((style) => {
      if (style.textContent && (style.textContent.includes('oklch') || style.textContent.includes('oklab'))) {
        stylesToRestore.push({ element: style as HTMLStyleElement, originalText: style.textContent });
        // Replace oklch(...) and oklab(...) matches with standard grey hex #71717a
        style.textContent = style.textContent
          .replace(/oklch\([^)]+\)/g, '#71717a')
          .replace(/oklab\([^)]+\)/g, '#71717a');
      }
    });

    // Save inline styles and replace 'oklch(...)' or 'oklab(...)' within any elements inside the print container
    const inlineStylesToRestore: { element: HTMLElement; originalStyle: string }[] = [];
    const elementsWithInlineStyles = document.querySelectorAll('#printable-invoice-paper *');
    elementsWithInlineStyles.forEach((el) => {
      const htmlEl = el as HTMLElement;
      if (htmlEl.style && htmlEl.style.cssText && (htmlEl.style.cssText.includes('oklch') || htmlEl.style.cssText.includes('oklab'))) {
        inlineStylesToRestore.push({ element: htmlEl, originalStyle: htmlEl.style.cssText });
        htmlEl.style.cssText = htmlEl.style.cssText
          .replace(/oklch\([^)]+\)/g, '#71717a')
          .replace(/oklab\([^)]+\)/g, '#71717a');
      }
    });

    const restoreEverything = () => {
      window.getComputedStyle = originalGetComputedStyle;
      // Restore style tags
      stylesToRestore.forEach(({ element, originalText }) => {
        element.textContent = originalText;
      });
      // Restore inline styles
      inlineStylesToRestore.forEach(({ element, originalStyle }) => {
        element.style.cssText = originalStyle;
      });
      setIsExporting(false);
    };
    
    // Allow React state to update canvases into static images before html2pdf captures DOM
    setTimeout(() => {
      const element = document.getElementById("printable-invoice-paper");
      if (!element) {
        restoreEverything();
        return;
      }

      const opt = {
        margin: 0, // margin is 0 to map 1:1 onto the A4 page without layout wrapping or text cutting-off
        filename: `Invoice_${header.invoiceNo || "Draft"}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { 
          scale: 2, 
          useCORS: true, 
          logging: false,
          scrollY: 0
        },
        jsPDF: { 
          unit: "mm", 
          format: "a4", 
          orientation: "portrait" 
        }
      } as any;

      // Use imported html2pdf module directly
      try {
        html2pdf()
          .from(element)
          .set(opt)
          .save()
          .then(() => {
            restoreEverything();
          })
          .catch((err: any) => {
            console.error("PDF generation error:", err);
            restoreEverything();
          });
      } catch (err: any) {
        console.error("PDF execution error:", err);
        restoreEverything();
        alert("An error occurred during PDF generation. Please use the Print / Save as PDF button as an alternative.");
      }
    }, 250);
  };

  // 8b. PDF Direct Share Handler supporting custom platform fallback
  const handleShareAsPDF = async (platform: 'whatsapp' | 'telegram' | 'viber' | 'messenger' | 'general' = 'general') => {
    if (isSharingPdf) return;
    setIsSharingPdf(true);
    setIsExporting(true);

    const originalGetComputedStyle = window.getComputedStyle;
    const memoizedColors = new Map<string, string>();

    // Helper to safely convert oklch or oklab to standard rgb/rgba using offscreen canvas context
    const safeColorConverter = (colorStr: string): string => {
      if (!colorStr || typeof colorStr !== 'string') return colorStr;
      if (!colorStr.includes('oklch') && !colorStr.includes('oklab')) return colorStr;
      
      if (memoizedColors.has(colorStr)) {
        return memoizedColors.get(colorStr)!;
      }
      
      try {
        const cvs = document.createElement('canvas');
        cvs.width = 1;
        cvs.height = 1;
        const ctx = cvs.getContext('2d');
        if (ctx) {
          ctx.fillStyle = colorStr;
          ctx.fillRect(0, 0, 1, 1);
          const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
          const rgbResult = `rgba(${r}, ${g}, ${b}, ${(a / 255).toFixed(2)})`;
          memoizedColors.set(colorStr, rgbResult);
          return rgbResult;
        }
      } catch (e) {
        console.warn("Failed to convert color:", colorStr, e);
      }
      return 'rgb(113, 113, 122)'; // safe fallback
    };

    // Override getComputedStyle to intercept oklch or oklab references requested by html2canvas
    window.getComputedStyle = function(el, pseudo) {
      const style = originalGetComputedStyle.call(this, el, pseudo);
      return new Proxy(style, {
        get(target, prop) {
          if (prop === 'getPropertyValue') {
            return function(propertyName: string) {
              const val = target.getPropertyValue(propertyName);
              if (typeof val === 'string' && (val.includes('oklch') || val.includes('oklab'))) {
                return safeColorConverter(val);
              }
              return val;
            };
          }
          const value = Reflect.get(target, prop);
          if (typeof value === 'string' && (value.includes('oklch') || value.includes('oklab'))) {
            return safeColorConverter(value);
          }
          if (typeof value === 'function') {
            return value.bind(target);
          }
          return value;
        }
      });
    };

    // --- SECURE STYLE SANITIZATION (CRITICAL FOR html2canvas STYLESHEET PARSING BUG) ---
    const stylesToRestore: { element: HTMLStyleElement; originalText: string }[] = [];
    const styleElements = document.querySelectorAll('style');
    styleElements.forEach((style) => {
      if (style.textContent && (style.textContent.includes('oklch') || style.textContent.includes('oklab'))) {
        stylesToRestore.push({ element: style as HTMLStyleElement, originalText: style.textContent });
        style.textContent = style.textContent
          .replace(/oklch\([^)]+\)/g, '#71717a')
          .replace(/oklab\([^)]+\)/g, '#71717a');
      }
    });

    const inlineStylesToRestore: { element: HTMLElement; originalStyle: string }[] = [];
    const elementsWithInlineStyles = document.querySelectorAll('#printable-invoice-paper *');
    elementsWithInlineStyles.forEach((el) => {
      const htmlEl = el as HTMLElement;
      if (htmlEl.style && htmlEl.style.cssText && (htmlEl.style.cssText.includes('oklch') || htmlEl.style.cssText.includes('oklab'))) {
        inlineStylesToRestore.push({ element: htmlEl, originalStyle: htmlEl.style.cssText });
        htmlEl.style.cssText = htmlEl.style.cssText
          .replace(/oklch\([^)]+\)/g, '#71717a')
          .replace(/oklab\([^)]+\)/g, '#71717a');
      }
    });

    const restoreEverything = () => {
      window.getComputedStyle = originalGetComputedStyle;
      stylesToRestore.forEach(({ element, originalText }) => {
        element.textContent = originalText;
      });
      inlineStylesToRestore.forEach(({ element, originalStyle }) => {
        element.style.cssText = originalStyle;
      });
      setIsExporting(false);
      setIsSharingPdf(false);
    };

    // Allow React state to update canvases into static images before html2pdf captures DOM
    setTimeout(() => {
      const element = document.getElementById("printable-invoice-paper");
      if (!element) {
        restoreEverything();
        return;
      }

      const opt = {
        margin: 0, // margin is 0 to map 1:1 onto the A4 page without layout wrapping or text cutting-off
        filename: `Invoice_${header.invoiceNo || "Draft"}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { 
          scale: 2, 
          useCORS: true, 
          logging: false,
          scrollY: 0
        },
        jsPDF: { 
          unit: "mm", 
          format: "a4", 
          orientation: "portrait" 
        }
      } as any;

      try {
        html2pdf()
          .from(element)
          .set(opt)
          .output('blob')
          .then(async (pdfBlob: Blob) => {
            restoreEverything();
            const fileName = `Invoice_${header.invoiceNo || "Draft"}.pdf`;
            const file = new File([pdfBlob], fileName, { type: "application/pdf" });

            if (navigator.canShare && navigator.canShare({ files: [file] })) {
              try {
                await navigator.share({
                  files: [file],
                  title: `Royal Z Invoice ${header.invoiceNo || ""}`,
                  text: `Please find attached our A4 sales invoice reference: ${header.invoiceNo || "N/A"}`,
                });
                return;
              } catch (shareErr) {
                console.warn("Share API cancelled or failed:", shareErr);
              }
            }

            // Fallback: If sharing isn't supported (e.g. desktop), trigger direct download and notify user with platform integration
            const url = URL.createObjectURL(pdfBlob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            const promoText = `Royal Z Sales Invoice: *Invoice No: ${header.invoiceNo || "N/A"}* with Grand Total: *${grandTotal.toLocaleString()} ${header.currency}*. The A4 PDF invoice has been downloaded to your device. Please attach it to this chat!`;
            const encodedText = encodeURIComponent(promoText);

            if (platform === 'whatsapp') {
              alert(`A4 PDF Invoice generated and downloaded to your device!\n\nWe will now open WhatsApp so you can easily attach and send the downloaded PDF to your client.`);
              window.open(`https://api.whatsapp.com/send?text=${encodedText}`, '_blank');
            } else if (platform === 'telegram') {
              alert(`A4 PDF Invoice generated and downloaded to your device!\n\nWe will now open Telegram so you can easily attach and send the downloaded PDF to your client.`);
              window.open(`https://t.me/share/url?url=${encodeURIComponent(window.location.origin)}&text=${encodedText}`, '_blank');
            } else if (platform === 'viber') {
              alert(`A4 PDF Invoice generated and downloaded to your device!\n\nWe will now open Viber so you can easily attach and send the downloaded PDF to your client.`);
              window.open(`viber://forward?text=${encodedText}`, '_blank');
            } else if (platform === 'messenger') {
              alert(`A4 PDF Invoice generated and downloaded to your device!\n\nWe will now open Messenger so you can easily attach and send the downloaded PDF to your client.`);
              window.open(`https://www.messenger.com/`, '_blank');
            } else {
              alert("The A4 PDF has been successfully generated and downloaded to your device! You can now send it to your client via any application.");
            }
          })
          .catch((err: any) => {
            console.error("PDF generation for share failed:", err);
            restoreEverything();
          });
      } catch (err: any) {
        console.error("PDF execution error during share:", err);
        restoreEverything();
        alert("An error occurred during PDF generation for share.");
      }
    }, 250);
  };

  const getInvoiceSummaryText = () => {
    const itemsList = items
      .filter(item => item.description.trim() !== "")
      .map(item => `- ${item.description} (${item.qty} x ${item.price.toLocaleString()} = ${(item.qty * item.price).toLocaleString()} ${header.currency})`)
      .join("\n");

    return `📄 *ROYAL Z SALES INVOICE*
----------------------------------------
*Invoice No:* ${header.invoiceNo || "N/A"}
*Voucher No:* ${header.voucherNo || "N/A"}
*Date:* ${header.date || "N/A"}
*Salesman:* ${header.salesman || "N/A"}
----------------------------------------
*Customer:* ${customer.customerName || "N/A"}
*Company:* ${customer.companyName || "N/A"}
*Phone:* ${customer.phone || "N/A"}
----------------------------------------
*Services:*
${itemsList || "No items listed"}
----------------------------------------
*Grand Total:* ${grandTotal.toLocaleString()} ${header.currency} (${header.saleType})
----------------------------------------
_Thank you for your valuable business with Royal Z!_`;
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* Top Banner (Header) */}
      <header className="bg-royal-navy text-white py-3.5 px-6 shadow-md border-b-2 border-royal-gold no-print">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-royal-navy border border-royal-gold flex items-center justify-center text-royal-gold font-bold text-lg">
              RZ
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                ROYAL Z <span className="text-xs bg-royal-gold text-royal-navy px-1.5 py-0.5 rounded font-mono font-semibold">Pro</span>
              </h1>
              <p className="text-[10px] text-slate-300 uppercase tracking-widest">Invoicing & Sales Management</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Save to History Button */}
            <button
              onClick={handleSaveInvoice}
              className="bg-royal-gold hover:bg-amber-400 text-royal-navy font-bold text-xs px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 shadow-sm cursor-pointer"
              title="Save current invoice into History"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Invoice</span>
            </button>

            {/* History Modal Trigger with Count Badge */}
            <button
              onClick={() => setIsHistoryModalOpen(true)}
              className="bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs px-3 py-1.5 rounded-lg border border-slate-700 transition flex items-center gap-2 shadow-sm cursor-pointer"
              title="View saved invoices history"
            >
              <History className="w-3.5 h-3.5 text-royal-gold" />
              <span>History</span>
              <span className="bg-royal-gold text-royal-navy text-[10px] px-1.5 py-0.2 rounded-full font-black">
                {savedInvoices.length}
              </span>
            </button>

            {/* New Blank Invoice Button */}
            <button
              onClick={handleNewInvoice}
              className="bg-slate-800/80 hover:bg-slate-700 text-slate-200 hover:text-white font-semibold text-xs px-2.5 py-1.5 rounded-lg border border-slate-700 transition flex items-center gap-1.5 cursor-pointer"
              title="Start a new blank invoice"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">New Invoice</span>
            </button>

            <div className="bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700 text-right hidden lg:block">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold block">Current Session</span>
              <span className="text-xs font-semibold text-royal-gold font-mono">{header.date || new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Notification Toast Banner */}
      {saveNotification && (
        <div className="bg-emerald-600 text-white px-4 py-2 text-center text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-all no-print">
          <CheckCircle2 className="w-4 h-4 text-emerald-100" />
          <span>{saveNotification}</span>
        </div>
      )}

      {/* Main Layout Grid */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: The Printable Paper (Takes 8 cols) */}
        <div className="lg:col-span-8 flex flex-col items-center">
          
          {/* Printable container */}
          <div 
            id="printable-invoice-paper"
            className={`w-full max-w-[210mm] text-slate-800 p-4 md:p-6 flex flex-col justify-between gap-4 transition-all duration-200 ${
              isExporting 
                ? "bg-white border-0 shadow-none rounded-none" 
                : "bg-slate-100 shadow-xl border border-slate-300 rounded-2xl"
            }`}
            style={{ minHeight: isExporting ? "296mm" : "auto" }}
          >
            <div>
              {/* BENTO HEADER / BRANDING SECTION */}
              <header className="bg-royal-navy border-b-4 border-royal-gold p-6 rounded-xl flex flex-col sm:flex-row justify-between items-center text-white shadow-lg gap-4">
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  {customLogo ? (
                    <div className="relative group shrink-0">
                      <img 
                        src={customLogo} 
                        alt="Royal Z Logo" 
                        className="h-16 w-16 object-contain rounded-lg bg-white p-1 border border-royal-gold/50 shadow-md" 
                      />
                      <label className="absolute inset-0 flex items-center justify-center bg-black/60 text-white text-[9px] font-bold rounded-lg opacity-0 group-hover:opacity-100 transition cursor-pointer no-print text-center px-1">
                        Change
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={handleLogoUpload} 
                        />
                      </label>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          if (confirm("Remove custom logo?")) {
                            setCustomLogo(null);
                            localStorage.removeItem("royal_z_custom_logo");
                          }
                        }}
                        className="absolute -top-1.5 -right-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition shadow no-print text-[9px] h-4 w-4 flex items-center justify-center"
                        title="Remove Logo"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div className="relative group shrink-0">
                      {logoError ? (
                        <div className="w-14 h-14 bg-gradient-to-tr from-royal-navy to-slate-800 border-2 border-royal-gold rounded-xl flex flex-col items-center justify-center text-royal-gold font-bold text-2xl shadow-md cursor-pointer hover:border-royal-gold-light transition duration-200">
                          Z
                        </div>
                      ) : (
                        <img 
                          src="logo.png" 
                          alt="Royal Z Logo" 
                          className="h-14 object-contain" 
                          onError={() => setLogoError(true)} 
                        />
                      )}
                      <label className="absolute inset-0 flex items-center justify-center bg-black/60 text-white text-[9px] font-bold rounded-xl opacity-0 group-hover:opacity-100 transition cursor-pointer no-print text-center px-1">
                        Upload Logo
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={handleLogoUpload} 
                        />
                      </label>
                    </div>
                  )}
                  <div>
                    <h1 className="text-2xl font-black tracking-tighter uppercase text-white">Royal Z</h1>
                    <p className="text-[10px] uppercase tracking-widest text-royal-gold font-bold">Premium Service Solutions</p>
                  </div>
                </div>
                
                <div className="text-left sm:text-right w-full sm:w-auto">
                  <h2 className="text-2xl font-light tracking-widest uppercase text-royal-gold">Sales Invoice</h2>
                  <p className="text-xs opacity-70">Reference: {header.invoiceNo || "N/A"}</p>
                </div>
              </header>

              {/* BENTO GRID: METADATA & CUSTOMER ROW */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mt-4">
                
                {/* METADATA BOX (col-span-4) */}
                <div className="col-span-12 md:col-span-4 bg-white p-5 rounded-xl border border-slate-200 border-l-4 border-royal-navy shadow-sm flex flex-col gap-3">
                  <h3 className="text-royal-navy text-xs font-bold uppercase tracking-wider mb-2">Invoice Metadata</h3>
                  <div className="flex flex-col gap-2">
                    
                    <div className="flex justify-between items-center border-b border-slate-100 pb-1.5">
                      <span className="text-xs text-slate-500 font-medium">Voucher No:</span>
                      {isExporting ? (
                        <span className="text-xs font-semibold text-right text-slate-800 w-32">{header.voucherNo || "N/A"}</span>
                      ) : (
                        <input 
                          type="text" 
                          value={header.voucherNo} 
                          onChange={(e) => setHeader({ ...header, voucherNo: e.target.value })}
                          className="text-xs font-semibold text-right bg-transparent border-0 p-0 focus:outline-none focus:ring-0 text-slate-800 w-32 border-b border-transparent focus:border-slate-300" 
                        />
                      )}
                    </div>
                    
                    <div className="flex justify-between items-center border-b border-slate-100 pb-1.5">
                      <span className="text-xs text-slate-500 font-medium">Invoice No:</span>
                      {isExporting ? (
                        <span className="text-xs font-semibold text-right text-slate-800 w-32">{header.invoiceNo || "N/A"}</span>
                      ) : (
                        <input 
                          type="text" 
                          value={header.invoiceNo} 
                          onChange={(e) => setHeader({ ...header, invoiceNo: e.target.value })}
                          className="text-xs font-semibold text-right bg-transparent border-0 p-0 focus:outline-none focus:ring-0 text-slate-800 w-32 border-b border-transparent focus:border-slate-300" 
                        />
                      )}
                    </div>
                    
                    <div className="flex justify-between items-center border-b border-slate-100 pb-1.5">
                      <span className="text-xs text-slate-500 font-medium">Date:</span>
                      {isExporting ? (
                        <span className="text-xs font-semibold text-right text-slate-800 w-32">{header.date || "N/A"}</span>
                      ) : (
                        <input 
                          type="date" 
                          value={header.date} 
                          onChange={(e) => setHeader({ ...header, date: e.target.value })}
                          className="text-xs font-semibold text-right bg-transparent border-0 p-0 focus:outline-none focus:ring-0 text-slate-800 w-32 cursor-pointer" 
                        />
                      )}
                    </div>
                    
                    <div className="flex justify-between items-center border-b border-slate-100 pb-1.5">
                      <span className="text-xs text-slate-500 font-medium">Salesman:</span>
                      {isExporting ? (
                        <span className="text-xs font-semibold text-right text-slate-800 w-32">{header.salesman || "N/A"}</span>
                      ) : (
                        <input 
                          type="text" 
                          placeholder="Enter Name"
                          value={header.salesman} 
                          onChange={(e) => setHeader({ ...header, salesman: e.target.value })}
                          className="text-xs font-semibold text-right bg-transparent border-0 p-0 focus:outline-none focus:ring-0 text-slate-800 w-32 placeholder-slate-400 border-b border-transparent focus:border-slate-300" 
                        />
                      )}
                    </div>
                    
                    <div className="flex justify-between items-center border-b border-slate-100 pb-1.5">
                      <span className="text-xs text-slate-500 font-medium">Currency:</span>
                      {isExporting ? (
                        <span className="text-xs font-bold text-right text-slate-800">{header.currency}</span>
                      ) : (
                        <select 
                          value={header.currency} 
                          onChange={(e) => setHeader({ ...header, currency: e.target.value })}
                          className="text-xs font-bold text-right bg-transparent border-0 p-0 focus:outline-none focus:ring-0 text-slate-800 cursor-pointer"
                        >
                          <option value="MMK">MMK (Kyat)</option>
                          <option value="USD">USD ($)</option>
                          <option value="SGD">SGD (S$)</option>
                          <option value="EUR">EUR (€)</option>
                        </select>
                      )}
                    </div>

                    <div className="flex justify-between items-center border-b border-slate-100 pb-1.5">
                      <span className="text-xs text-slate-500 font-medium">Sale Type:</span>
                      {isExporting ? (
                        <span className="text-xs font-bold text-right text-slate-800">{header.saleType}</span>
                      ) : (
                        <select 
                          value={header.saleType} 
                          onChange={(e) => setHeader({ ...header, saleType: e.target.value })}
                          className="text-xs font-bold text-right bg-transparent border-0 p-0 focus:outline-none focus:ring-0 text-slate-800 cursor-pointer"
                        >
                          <option value="Cash">Cash</option>
                          <option value="Credit">Credit</option>
                        </select>
                      )}
                    </div>

                  </div>
                </div>

                {/* CUSTOMER BOX (col-span-8) */}
                <div className="col-span-12 md:col-span-8 bg-white p-5 rounded-xl border border-slate-200 border-l-4 border-royal-gold shadow-sm flex flex-col gap-3">
                  <h3 className="text-royal-navy text-xs font-bold uppercase tracking-wider mb-2">Customer Details</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                                  <div className="flex flex-col gap-1">
                      <label className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">Customer Name</label>
                      {isExporting ? (
                        <div className="border-b border-slate-200 text-sm py-1 font-semibold text-slate-800 min-h-[29px]">{customer.customerName || "N/A"}</div>
                      ) : (
                        <input 
                          type="text" 
                          placeholder="Enter Client Name"
                          value={customer.customerName} 
                          onChange={(e) => setCustomer({ ...customer, customerName: e.target.value })}
                          className="border-0 border-b border-slate-200 text-sm py-1 focus:outline-none focus:border-royal-navy text-slate-800 bg-transparent placeholder-slate-400" 
                        />
                      )}
                    </div>
                    
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">Contact Person</label>
                      {isExporting ? (
                        <div className="border-b border-slate-200 text-sm py-1 font-semibold text-slate-800 min-h-[29px]">{customer.contactPerson || "N/A"}</div>
                      ) : (
                        <input 
                          type="text" 
                          placeholder="Representative Name"
                          value={customer.contactPerson} 
                          onChange={(e) => setCustomer({ ...customer, contactPerson: e.target.value })}
                          className="border-0 border-b border-slate-200 text-sm py-1 focus:outline-none focus:border-royal-navy text-slate-800 bg-transparent placeholder-slate-400" 
                        />
                      )}
                    </div>
                    
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">Company Name</label>
                      {isExporting ? (
                        <div className="border-b border-slate-200 text-sm py-1 font-semibold text-slate-800 min-h-[29px]">{customer.companyName || "N/A"}</div>
                      ) : (
                        <input 
                          type="text" 
                          placeholder="Business Entity Name"
                          value={customer.companyName} 
                          onChange={(e) => setCustomer({ ...customer, companyName: e.target.value })}
                          className="border-0 border-b border-slate-200 text-sm py-1 focus:outline-none focus:border-royal-navy text-slate-800 bg-transparent placeholder-slate-400" 
                        />
                      )}
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">NRC No</label>
                      {isExporting ? (
                        <div className="border-b border-slate-200 text-sm py-1 font-semibold text-slate-800 min-h-[29px]">{customer.nrcNo || "N/A"}</div>
                      ) : (
                        <input 
                          type="text" 
                          placeholder="e.g. 12/YAKANA(N)123456"
                          value={customer.nrcNo} 
                          onChange={(e) => setCustomer({ ...customer, nrcNo: e.target.value })}
                          className="border-0 border-b border-slate-200 text-sm py-1 focus:outline-none focus:border-royal-navy text-slate-800 bg-transparent placeholder-slate-400" 
                        />
                      )}
                    </div>
                    
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">Phone Number</label>
                      {isExporting ? (
                        <div className="border-b border-slate-200 text-sm py-1 font-semibold text-slate-800 min-h-[29px]">{customer.phone || "N/A"}</div>
                      ) : (
                        <input 
                          type="text" 
                          placeholder="+95 9..."
                          value={customer.phone} 
                          onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                          className="border-0 border-b border-slate-200 text-sm py-1 focus:outline-none focus:border-royal-navy text-slate-800 bg-transparent placeholder-slate-400" 
                        />
                      )}
                    </div>
                    
                    <div className="col-span-1 sm:col-span-2 flex flex-col gap-1">
                      <label className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">Company Address</label>
                      {isExporting ? (
                        <div className="border-b border-slate-200 text-sm py-1 font-semibold text-slate-800 min-h-[29px]">{customer.address || "N/A"}</div>
                      ) : (
                        <input 
                          type="text" 
                          placeholder="No. 45, Sule Pagoda Road, Yangon"
                          value={customer.address} 
                          onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
                          className="border-0 border-b border-slate-200 text-sm py-1 focus:outline-none focus:border-royal-navy text-slate-800 bg-transparent placeholder-slate-400" 
                        />
                      )}
                    </div> </div>

                  </div>

              </div>

              {/* SPREADSHEET / EXCEL-STYLE DYNAMIC TABLE */}
              <SpreadsheetTable
                items={items}
                columns={columns}
                currency={header.currency}
                grandTotal={grandTotal}
                isExporting={isExporting}
                onItemChange={handleItemChange}
                onCustomFieldChange={handleCustomFieldChange}
                onAddRow={handleAddRow}
                onInsertRow={handleInsertRow}
                onDuplicateRow={handleDuplicateRow}
                onMoveRow={handleMoveRow}
                onRemoveRow={handleRemoveRow}
                onOpenAddColumnModal={(insertIdx?: number) => {
                  setAddColumnInsertIndex(insertIdx);
                  setIsAddColumnModalOpen(true);
                }}
                onRemoveColumn={handleRemoveColumn}
                onRenameColumn={handleRenameColumn}
                onOpenHistory={() => setIsHistoryModalOpen(true)}
                historyCount={savedInvoices.length}
              />
            </div>

            {/* BENTO SIGNATURE BOX ROW */}
            <div className="mt-4 pt-4 border-t border-slate-200">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <SignaturePad
                  label="Prepared By"
                  savedData={signatures.preparedBy}
                  onSave={(base64) => setSignatures(prev => ({ ...prev, preparedBy: base64 }))}
                  isExporting={isExporting}
                />
                <SignaturePad
                  label="Checked By"
                  savedData={signatures.checkedBy}
                  onSave={(base64) => setSignatures(prev => ({ ...prev, checkedBy: base64 }))}
                  isExporting={isExporting}
                />
                <SignaturePad
                  label="Approved By"
                  savedData={signatures.approvedBy}
                  onSave={(base64) => setSignatures(prev => ({ ...prev, approvedBy: base64 }))}
                  isExporting={isExporting}
                />
                <SignaturePad
                  label="Customer By"
                  savedData={signatures.customerBy}
                  onSave={(base64) => setSignatures(prev => ({ ...prev, customerBy: base64 }))}
                  isExporting={isExporting}
                  highlighted={true}
                />
              </div>

              {/* Sub-note at very bottom of sheet */}
              <div className="text-[8px] text-slate-400 text-center mt-6 uppercase tracking-widest font-semibold">
                Thank you for your valuable business with Royal Z. This is a computer generated document.
              </div>
            </div>

          </div>
        </div>

        {/* RIGHT COLUMN: Interactive Control & Integration Panel (Takes 4 cols) */}
        <div className="lg:col-span-4 space-y-6 no-print">
          
          {/* Quick Operations panel */}
          <div className="bg-white p-5 rounded-xl shadow-md border border-slate-200">
            <h3 className="text-sm font-bold text-royal-navy uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-royal-gold" />
              Invoice Controls
            </h3>
            
            <div className="space-y-3">
              {/* Save & History Primary Actions */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleSaveInvoice}
                  className="bg-royal-gold hover:bg-amber-400 text-royal-navy font-bold text-xs py-2.5 px-3 rounded-lg transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  title="Save current invoice to history"
                >
                  <Save className="w-3.5 h-3.5" />
                  Save Draft
                </button>

                <button
                  onClick={() => setIsHistoryModalOpen(true)}
                  className="bg-royal-navy hover:bg-slate-900 text-white font-bold text-xs py-2.5 px-3 rounded-lg transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  title="Open invoice history and re-edit"
                >
                  <History className="w-3.5 h-3.5 text-royal-gold" />
                  History ({savedInvoices.length})
                </button>
              </div>

              {/* Add Custom Column Button */}
              <button
                onClick={() => setIsAddColumnModalOpen(true)}
                className="w-full bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 hover:border-slate-300 font-semibold text-xs py-2.5 px-3 rounded-lg transition flex items-center justify-center gap-2 cursor-pointer"
                title="Add a custom column to the table"
              >
                <Columns className="w-3.5 h-3.5 text-royal-navy" />
                Add Custom Column / Field
              </button>

              <div className="h-px bg-slate-100 my-1"></div>

              {/* PDF Download Button */}
              <button
                onClick={handleDownloadPDF}
                disabled={isExporting}
                className="w-full bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs py-3 px-4 rounded-lg transition shadow flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                <Download className="w-4 h-4 text-royal-gold" />
                {isExporting ? "Generating PDF..." : "Download PDF (html2pdf)"}
              </button>

              {/* Native Print / Save as PDF Button */}
              <button
                onClick={() => window.print()}
                className="w-full bg-royal-navy hover:bg-slate-900 text-white font-bold text-xs py-3 px-4 rounded-lg transition shadow flex items-center justify-center gap-2 border border-slate-800 cursor-pointer"
              >
                <Printer className="w-4 h-4 text-royal-gold" />
                Print / Save as PDF (Recommended)
              </button>

              {/* Help tip for browser sandbox downloads */}
              <div className="bg-amber-50 border border-amber-200/60 p-3 rounded-lg text-[11px] text-amber-800 leading-relaxed">
                <span className="font-bold block mb-1">💡 Troubleshooting Downloads:</span>
                Preview frames can sometimes block automatic PDF file downloads. If the download fails, click <b>Print / Save as PDF</b> and select <b>"Save as PDF"</b> as your destination for a perfect crisp document.
              </div>

              <div className="h-px bg-slate-100 my-2"></div>

              {/* Reset / New Invoice Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={handleNewInvoice}
                  className="flex-1 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 hover:border-slate-300 font-medium text-xs py-2 px-3 rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <FilePlus className="w-3.5 h-3.5 text-royal-gold-dark" />
                  New Blank
                </button>
                <button
                  onClick={handleResetForm}
                  className="bg-white hover:bg-slate-50 text-slate-500 hover:text-red-600 border border-slate-200 hover:border-red-200 font-medium text-xs py-2 px-3 rounded-lg transition flex items-center justify-center gap-1 cursor-pointer"
                  title="Reset all fields"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Reset
                </button>
              </div>
            </div>
          </div>

          {/* Logo Management Panel */}
          <div className="bg-white p-5 rounded-xl shadow-md border border-slate-200">
            <h3 className="text-sm font-bold text-royal-navy uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-royal-gold-dark" />
              Company Logo
            </h3>
            <p className="text-xs text-slate-500 mb-3 leading-relaxed">
              Upload your company logo here to display it at the top of your sales invoices!
            </p>
            
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-slate-50 border-2 border-dashed border-slate-300 rounded-lg flex items-center justify-center overflow-hidden relative group shrink-0">
                {customLogo ? (
                  <img src={customLogo} alt="Logo preview" className="w-full h-full object-contain p-1" />
                ) : (
                  <span className="text-[10px] text-slate-400 font-bold uppercase">No Logo</span>
                )}
              </div>
              <div className="flex-1 space-y-2">
                <label className="inline-block bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs px-3 py-2 rounded-lg cursor-pointer transition border border-slate-200 text-center w-full">
                  Upload Logo Image
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handleLogoUpload} 
                  />
                </label>
                {customLogo && (
                  <button
                    onClick={() => {
                      if (confirm("Remove custom logo?")) {
                        setCustomLogo(null);
                        localStorage.removeItem("royal_z_custom_logo");
                      }
                    }}
                    className="text-[10px] text-red-500 hover:underline font-bold block"
                  >
                    Remove Logo
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Invoice Sharing Center */}
          <div className="bg-white p-5 rounded-xl shadow-md border border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-royal-navy uppercase tracking-wider flex items-center gap-1.5">
                <Share2 className="w-4 h-4 text-royal-gold-dark" />
                Invoice Sharing Center
              </h3>
              <span className="text-[9px] bg-royal-gold/10 text-royal-gold-dark px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">Instant</span>
            </div>

            <p className="text-xs text-slate-500 mb-3 leading-relaxed">
              Share a clean textual summary of this invoice directly to your clients via messaging apps or copy the details to your clipboard!
            </p>

            {/* Real A4 PDF Sharing Button */}
            <button
              onClick={handleShareAsPDF}
              disabled={isSharingPdf || isExporting}
              className="w-full bg-royal-navy hover:bg-slate-800 text-white font-bold text-xs py-3 px-4 rounded-lg transition shadow mb-3 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Share2 className="w-4 h-4 text-royal-gold" />
              {isSharingPdf ? "Generating A4 PDF..." : "Share A4 PDF Invoice File"}
            </button>

            <div className="flex items-center my-3">
              <div className="h-px bg-slate-200 flex-1"></div>
              <span className="text-[9px] uppercase font-bold text-slate-400 px-2">Or share text summary</span>
              <div className="h-px bg-slate-200 flex-1"></div>
            </div>

            {/* Editable Text Summary Preview */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Message Preview</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(customShareText !== null ? customShareText : getInvoiceSummaryText());
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="text-[10px] font-bold text-royal-navy hover:underline flex items-center gap-1"
                >
                  {copied ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-600" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      Copy Text
                    </>
                  )}
                </button>
              </div>
              <textarea
                value={customShareText !== null ? customShareText : getInvoiceSummaryText()}
                onChange={(e) => setCustomShareText(e.target.value)}
                rows={5}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-[11px] font-mono text-slate-700 focus:bg-white focus:ring-1 focus:ring-royal-navy/20 focus:border-royal-navy outline-none"
                placeholder="Invoice summary text..."
              />
            </div>

            {/* Sharing Action Grid - PDF share */}
            <div className="grid grid-cols-2 gap-2">
              {/* WhatsApp */}
              <button
                onClick={() => handleShareAsPDF('whatsapp')}
                disabled={isSharingPdf}
                className="flex items-center justify-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs py-2.5 px-3 rounded-lg transition shadow-xs text-center disabled:opacity-50 cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                {isSharingPdf ? "Generating..." : "WhatsApp PDF"}
              </button>

              {/* Viber */}
              <button
                onClick={() => handleShareAsPDF('viber')}
                disabled={isSharingPdf}
                className="flex items-center justify-center gap-1.5 bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs py-2.5 px-3 rounded-lg transition shadow-xs text-center disabled:opacity-50 cursor-pointer"
              >
                <Phone className="w-4 h-4" />
                {isSharingPdf ? "Generating..." : "Viber PDF"}
              </button>

              {/* Telegram */}
              <button
                onClick={() => handleShareAsPDF('telegram')}
                disabled={isSharingPdf}
                className="flex items-center justify-center gap-1.5 bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs py-2.5 px-3 rounded-lg transition shadow-xs text-center disabled:opacity-50 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                {isSharingPdf ? "Generating..." : "Telegram PDF"}
              </button>

              {/* Messenger */}
              <button
                onClick={() => handleShareAsPDF('messenger')}
                disabled={isSharingPdf}
                className="flex items-center justify-center gap-1.5 bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-xs py-2.5 px-3 rounded-lg transition shadow-xs text-center disabled:opacity-50 cursor-pointer"
              >
                <MessageSquare className="w-4 h-4" />
                {isSharingPdf ? "Generating..." : "Messenger PDF"}
              </button>
            </div>
            
            <div className="mt-3 text-[10px] text-slate-400 text-center leading-normal">
              Clicking any option will automatically generate the A4 PDF invoice and open the respective sharing dialog.
            </div>
          </div>

          {/* Quick Guide Panel */}
          <div className="bg-white p-5 rounded-xl shadow-md border border-slate-200">
            <h3 className="text-sm font-bold text-royal-navy uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Info className="w-4 h-4 text-royal-navy" />
              Quick Instructions
            </h3>
            <ul className="text-xs text-slate-500 space-y-2 list-disc pl-4 leading-relaxed">
              <li>Input fields are borderless lines, giving it a physical paper form appearance.</li>
              <li>Row totals and the <b>Grand Total</b> calculate dynamically as you type quantities or prices.</li>
              <li><b>Excel / Google Sheet Features:</b> Press <kbd className="bg-slate-100 px-1 py-0.5 rounded text-[10px] font-mono">Enter</kbd> to move down, <kbd className="bg-slate-100 px-1 py-0.5 rounded text-[10px] font-mono">Tab</kbd> to move right, or use arrow keys. Insert, duplicate, and reorder rows with the row menu.</li>
              <li>Click <b>+ Add Custom Column</b> to insert extra columns (like Discount %, Warranty, Batch No).</li>
              <li>All invoices can be saved into <b>History</b> to reload, duplicate, or re-edit anytime!</li>
              <li>Click <b>Download High-Quality PDF</b> to convert the invoice to a perfectly sized A4 printout.</li>
            </ul>
          </div>

        </div>

      </main>

      {/* Add Custom Column Modal */}
      <AddColumnModal
        isOpen={isAddColumnModalOpen}
        onClose={() => {
          setIsAddColumnModalOpen(false);
          setAddColumnInsertIndex(undefined);
        }}
        onAddColumn={handleAddColumn}
        existingColumns={columns}
        insertIndex={addColumnInsertIndex}
      />

      {/* Invoice History & Re-edit Modal */}
      <InvoiceHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        savedInvoices={savedInvoices}
        invoices={savedInvoices}
        currentInvoiceId={currentInvoiceId}
        onLoadInvoice={handleLoadInvoice}
        onDuplicateInvoice={handleDuplicateInvoice}
        onDeleteInvoice={handleDeleteInvoice}
        onNewInvoice={handleNewInvoice}
        onExportHistory={handleExportHistory}
        onImportHistory={handleImportHistory}
        onSaveCurrentInvoice={handleSaveInvoice}
      />
    </div>
  );
}
