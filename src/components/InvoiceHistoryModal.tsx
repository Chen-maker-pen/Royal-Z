import React, { useState, useMemo } from 'react';
import { SavedInvoice } from '../types';
import { 
  X, 
  History, 
  Search, 
  Edit3, 
  Copy, 
  Trash2, 
  Calendar, 
  User, 
  ArrowRight, 
  PlusCircle, 
  Download, 
  Upload, 
  CheckCircle2, 
  FileText
} from 'lucide-react';

interface InvoiceHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoices?: SavedInvoice[];
  savedInvoices?: SavedInvoice[];
  currentInvoiceId?: string;
  onLoadInvoice: (invoice: SavedInvoice) => void;
  onDuplicateInvoice: (invoice: SavedInvoice) => void;
  onDeleteInvoice: (id: string) => void;
  onNewInvoice: () => void;
  onExportHistory: () => void;
  onImportHistory: (importedInvoices: SavedInvoice[]) => void;
  onSaveCurrentInvoice?: () => void;
}

export const InvoiceHistoryModal: React.FC<InvoiceHistoryModalProps> = ({
  isOpen,
  onClose,
  invoices,
  savedInvoices,
  currentInvoiceId,
  onLoadInvoice,
  onDuplicateInvoice,
  onDeleteInvoice,
  onNewInvoice,
  onExportHistory,
  onImportHistory,
  onSaveCurrentInvoice,
}) => {
  const invoiceList = useMemo(() => {
    if (Array.isArray(invoices)) return invoices;
    if (Array.isArray(savedInvoices)) return savedInvoices;
    return [];
  }, [invoices, savedInvoices]);

  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredInvoices = useMemo(() => {
    if (!searchQuery.trim()) return invoiceList;
    const query = searchQuery.toLowerCase();
    return invoiceList.filter(inv => {
      const invNo = (inv.header?.invoiceNo || '').toLowerCase();
      const vouNo = (inv.header?.voucherNo || '').toLowerCase();
      const customer = (inv.customer?.customerName || '').toLowerCase();
      const company = (inv.customer?.companyName || '').toLowerCase();
      const date = (inv.header?.date || '').toLowerCase();
      const salesman = (inv.header?.salesman || '').toLowerCase();
      return invNo.includes(query) || vouNo.includes(query) || customer.includes(query) || company.includes(query) || date.includes(query) || salesman.includes(query);
    });
  }, [invoiceList, searchQuery]);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed)) {
          onImportHistory(parsed);
        } else {
          alert('Invalid backup file format. Expected a list of saved invoices.');
        }
      } catch (err) {
        alert('Failed to parse the backup JSON file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full border border-slate-200 flex flex-col max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-royal-navy text-white px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-royal-gold/20 text-royal-gold rounded-xl">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold flex items-center gap-2">
                Invoice History & Records
                <span className="text-xs bg-royal-gold text-royal-navy px-2 py-0.5 rounded-full font-bold">
                  {invoiceList.length} {invoiceList.length === 1 ? 'invoice' : 'invoices'}
                </span>
              </h3>
              <p className="text-xs text-slate-300">Browse previous invoices, view details, and load them to re-edit</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onNewInvoice();
                onClose();
              }}
              className="bg-royal-gold hover:bg-amber-400 text-royal-navy font-bold text-xs px-3 py-2 rounded-lg transition flex items-center gap-1.5 shadow-sm"
              title="Start a blank new invoice"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden sm:inline">New Invoice</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Toolbar (Search & Backup) */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Invoice No, Customer Name, Company, Date..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-royal-navy/20 focus:border-royal-navy placeholder-slate-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
              >
                Clear
              </button>
            )}
          </div>

          {/* Backup / Export controls */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onExportHistory}
              disabled={invoiceList.length === 0}
              className="text-xs text-slate-600 hover:text-royal-navy font-semibold px-2.5 py-2 border border-slate-300 rounded-lg bg-white hover:bg-slate-50 transition flex items-center gap-1.5 disabled:opacity-40"
              title="Export all invoices as JSON backup"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              Backup
            </button>

            <label 
              className="text-xs text-slate-600 hover:text-royal-navy font-semibold px-2.5 py-2 border border-slate-300 rounded-lg bg-white hover:bg-slate-50 transition flex items-center gap-1.5 cursor-pointer"
              title="Import backup JSON file"
            >
              <Upload className="w-3.5 h-3.5 text-slate-500" />
              Restore
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Invoices List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {invoiceList.length === 0 ? (
            <div className="text-center py-12 px-4">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                <FileText className="w-8 h-8" />
              </div>
              <h4 className="text-base font-bold text-slate-800 mb-1">No Saved Invoices Yet</h4>
              <p className="text-sm text-slate-500 max-w-md mx-auto mb-5">
                Every time you create an invoice, you can save it into your history to preserve it and re-edit it anytime later!
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                {onSaveCurrentInvoice && (
                  <button
                    onClick={() => {
                      onSaveCurrentInvoice();
                    }}
                    className="px-4 py-2 bg-royal-gold hover:bg-amber-400 text-royal-navy text-xs font-bold rounded-lg transition shadow-sm"
                  >
                    Save Current Invoice to History Now
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-lg transition"
                >
                  Return to Editor
                </button>
              </div>
            </div>
          ) : filteredInvoices.length === 0 ? (
            <div className="text-center py-10 text-slate-500 text-sm">
              No invoices match "<span className="font-semibold text-slate-700">{searchQuery}</span>".
            </div>
          ) : (
            filteredInvoices.map((inv) => {
              const isCurrent = inv.id === currentInvoiceId;
              const formattedDate = inv.header.date || 'No Date';
              const lastUpdated = new Date(inv.updatedAt || inv.savedAt).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              });

              return (
                <div 
                  key={inv.id}
                  className={`bg-white rounded-xl border transition-all p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs ${
                    isCurrent 
                      ? 'border-royal-navy ring-2 ring-royal-navy/10 bg-blue-50/20' 
                      : 'border-slate-200 hover:border-slate-300 hover:shadow-md'
                  }`}
                >
                  {/* Left info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2.5 flex-wrap mb-1.5">
                      <span className="font-black text-slate-900 text-base">
                        {inv.header.invoiceNo || 'Untitled Invoice'}
                      </span>
                      {inv.header.voucherNo && (
                        <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono font-medium">
                          {inv.header.voucherNo}
                        </span>
                      )}
                      {isCurrent && (
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Currently Editing
                        </span>
                      )}
                      <span className="text-xs bg-royal-navy/10 text-royal-navy font-bold px-2 py-0.5 rounded">
                        {inv.header.saleType || 'Cash'}
                      </span>
                    </div>

                    {/* Customer & Date */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-xs text-slate-600 mb-2">
                      <div className="flex items-center gap-1.5 truncate">
                        <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="font-medium text-slate-800 truncate">
                          {inv.customer.customerName || 'No Client Name'}
                        </span>
                        {inv.customer.companyName && (
                          <span className="text-slate-400 truncate">({inv.customer.companyName})</span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>Date: {formattedDate}</span>
                        <span className="text-slate-300">•</span>
                        <span className="text-slate-400 text-[11px]">Saved: {lastUpdated}</span>
                      </div>
                    </div>

                    {/* Preview Summary */}
                    <div className="text-xs text-slate-500 line-clamp-1">
                      <span className="font-medium text-slate-700">{inv.items.length} line items:</span>{' '}
                      {inv.items.map(i => i.description).filter(Boolean).slice(0, 3).join(', ') || 'No item descriptions'}
                      {inv.items.length > 3 && '...'}
                    </div>
                  </div>

                  {/* Right side: Amount & Action Buttons */}
                  <div className="flex items-center justify-between md:justify-end gap-3 border-t md:border-t-0 pt-3 md:pt-0 border-slate-100 shrink-0">
                    {/* Amount */}
                    <div className="text-left md:text-right">
                      <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Grand Total</div>
                      <div className="text-lg font-black text-royal-navy">
                        {inv.grandTotal.toLocaleString()} <span className="text-xs font-semibold">{inv.header.currency}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5">
                      {/* Re-edit / Load button */}
                      <button
                        onClick={() => {
                          onLoadInvoice(inv);
                          onClose();
                        }}
                        className="bg-royal-navy hover:bg-slate-900 text-white font-bold text-xs px-3 py-2 rounded-lg transition flex items-center gap-1.5 shadow-xs"
                        title="Load into editor to re-edit"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-royal-gold" />
                        <span>Re-edit</span>
                      </button>

                      {/* Duplicate button */}
                      <button
                        onClick={() => {
                          onDuplicateInvoice(inv);
                          setCopiedId(inv.id);
                          setTimeout(() => setCopiedId(null), 2000);
                        }}
                        className="p-2 text-slate-600 hover:text-royal-navy hover:bg-slate-100 rounded-lg border border-slate-200 transition"
                        title="Duplicate as new invoice"
                      >
                        {copiedId === inv.id ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>

                      {/* Delete button */}
                      <button
                        onClick={() => {
                          if (confirm(`Delete invoice "${inv.header.invoiceNo || 'Untitled'}" from history?`)) {
                            onDeleteInvoice(inv.id);
                          }
                        }}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg border border-slate-200 transition"
                        title="Delete from history"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <span>All records are safely preserved in local browser storage.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 font-semibold text-slate-700 rounded-lg transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
