import React, { useState, useRef } from 'react';
import { TableColumn, InvoiceItem } from '../types';
import { 
  Plus, 
  Trash2, 
  Copy, 
  ChevronUp, 
  ChevronDown, 
  MoreVertical, 
  Edit2, 
  Columns, 
  Sparkles,
  ArrowDown,
  History
} from 'lucide-react';

interface SpreadsheetTableProps {
  items: InvoiceItem[];
  columns: TableColumn[];
  currency: string;
  isExporting: boolean;
  onItemChange: (id: string, field: keyof InvoiceItem, value: any) => void;
  onCustomFieldChange: (id: string, colId: string, value: any) => void;
  onAddRow: () => void;
  onInsertRow: (index: number) => void;
  onDuplicateRow: (index: number) => void;
  onMoveRow: (index: number, direction: 'up' | 'down') => void;
  onRemoveRow: (id: string) => void;
  onOpenAddColumnModal: (insertIndex?: number) => void;
  onRemoveColumn: (colId: string) => void;
  onRenameColumn: (colId: string, newLabel: string) => void;
  grandTotal: number;
  onOpenHistory?: () => void;
  historyCount?: number;
}

export const SpreadsheetTable: React.FC<SpreadsheetTableProps> = ({
  items,
  columns,
  currency,
  isExporting,
  onItemChange,
  onCustomFieldChange,
  onAddRow,
  onInsertRow,
  onDuplicateRow,
  onMoveRow,
  onRemoveRow,
  onOpenAddColumnModal,
  onRemoveColumn,
  onRenameColumn,
  grandTotal,
  onOpenHistory,
  historyCount,
}) => {
  const [activeCell, setActiveCell] = useState<{ row: number; col: string } | null>(null);
  const [editingColumnId, setEditingColumnId] = useState<string | null>(null);
  const [editingColumnLabel, setEditingColumnLabel] = useState('');
  const tableRef = useRef<HTMLTableElement>(null);

  // List of navigable column IDs in sequence
  const navigableCols = [
    'bu',
    'description',
    'partNo',
    ...columns.filter(c => c.isCustom).map(c => c.id),
    'qty',
    'price',
    'remark',
  ];

  // Keyboard navigation handler (Excel / Google Sheets style)
  const handleKeyDown = (
    e: React.KeyboardEvent,
    rowIndex: number,
    colId: string
  ) => {
    // If user is editing a textarea (e.g. description), Enter without Shift navigates down
    if (e.key === 'Enter') {
      if (e.shiftKey) {
        // Allow newline in textarea
        return;
      }
      e.preventDefault();
      if (rowIndex === items.length - 1) {
        // Auto-add new row when pressing Enter on the last row!
        onAddRow();
        setTimeout(() => {
          const nextCell = document.getElementById(`cell-${rowIndex + 1}-${colId}`);
          nextCell?.focus();
        }, 60);
      } else {
        const nextCell = document.getElementById(`cell-${rowIndex + 1}-${colId}`);
        nextCell?.focus();
      }
    } else if (e.key === 'ArrowDown') {
      // Move to cell below if not typing multiline or holding Alt
      const target = e.target as HTMLElement;
      if (target.tagName === 'TEXTAREA' && !e.altKey) {
        // allow normal navigation inside textarea unless at bottom line
      } else {
        e.preventDefault();
        const nextCell = document.getElementById(`cell-${rowIndex + 1}-${colId}`);
        nextCell?.focus();
      }
    } else if (e.key === 'ArrowUp') {
      const target = e.target as HTMLElement;
      if (target.tagName === 'TEXTAREA' && !e.altKey) {
        // allow normal navigation inside textarea
      } else {
        e.preventDefault();
        const prevCell = document.getElementById(`cell-${rowIndex - 1}-${colId}`);
        prevCell?.focus();
      }
    }
  };

  const handleStartRenameColumn = (col: TableColumn) => {
    setEditingColumnId(col.id);
    setEditingColumnLabel(col.label);
  };

  const handleSaveRenameColumn = (colId: string) => {
    if (editingColumnLabel.trim()) {
      onRenameColumn(colId, editingColumnLabel.trim());
    }
    setEditingColumnId(null);
  };

  return (
    <div className="col-span-12 bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden flex flex-col mt-4">
      {/* Top Spreadsheet Info Bar (no-print) */}
      {!isExporting && (
        <div className="bg-slate-50 border-b border-slate-200 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs no-print">
          <div className="flex items-center gap-3">
            <span className="font-bold text-royal-navy flex items-center gap-1.5 uppercase tracking-wider">
              <Columns className="w-3.5 h-3.5 text-royal-gold-dark" />
              Sheet Editor
            </span>
            <span className="text-slate-400">|</span>
            <span className="text-slate-500 font-medium">
              {items.length} {items.length === 1 ? 'row' : 'rows'} • {columns.length} columns
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-[11px] text-slate-400 hidden md:flex items-center gap-2">
              <span>Click <strong className="text-royal-gold-dark font-bold">+</strong> between headers to insert column</span>
              <span>•</span>
              <span>Press <kbd className="px-1 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-mono text-slate-600">Enter</kbd> on bottom row to add row</span>
            </div>

            {onOpenHistory && (
              <button
                type="button"
                onClick={onOpenHistory}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-royal-navy hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition shadow-xs cursor-pointer"
                title="View previous invoices history"
              >
                <History className="w-3.5 h-3.5 text-royal-gold" />
                <span>Invoice History</span>
                {typeof historyCount === 'number' && (
                  <span className="bg-royal-gold text-royal-navy text-[10px] px-1.5 py-0.2 rounded-full font-black">
                    {historyCount}
                  </span>
                )}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main Table Scroll Container */}
      <div className="overflow-x-auto">
        <table ref={tableRef} className="w-full text-left border-collapse min-w-[850px]">
          {/* Table Header */}
          <thead className="bg-royal-navy text-white select-none">
            <tr className="text-[11px] uppercase tracking-wider font-bold divide-x divide-slate-700/50">
              {columns.map((col, colIndex) => {
                const isCustom = col.isCustom || !['no', 'bu', 'description', 'partNo', 'qty', 'price', 'total', 'remark'].includes(col.id);

                let colWidth = col.width;
                if (!colWidth) {
                  if (col.id === 'no') colWidth = 'w-12';
                  else if (col.id === 'bu') colWidth = 'w-16';
                  else if (col.id === 'description') colWidth = 'min-w-[180px]';
                  else if (col.id === 'partNo') colWidth = 'w-28';
                  else if (col.id === 'qty') colWidth = 'w-14';
                  else if (col.id === 'price') colWidth = 'w-28';
                  else if (col.id === 'total') colWidth = 'w-32';
                  else if (col.id === 'remark') colWidth = 'w-28';
                  else colWidth = 'min-w-[110px]';
                }

                const alignClass = col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left';

                return (
                  <th
                    key={col.id}
                    className={`px-3 py-3 ${colWidth} ${alignClass} relative group overflow-visible`}
                  >
                    {isCustom ? (
                      editingColumnId === col.id ? (
                        <input
                          type="text"
                          autoFocus
                          value={editingColumnLabel}
                          onChange={(e) => setEditingColumnLabel(e.target.value)}
                          onBlur={() => handleSaveRenameColumn(col.id)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveRenameColumn(col.id);
                            if (e.key === 'Escape') setEditingColumnId(null);
                          }}
                          className="bg-white text-royal-navy px-1.5 py-0.5 rounded text-xs font-bold w-full focus:outline-none"
                        />
                      ) : (
                        <div className="flex items-center justify-between gap-1">
                          <span
                            className="truncate cursor-pointer hover:underline"
                            title="Double-click to rename column"
                            onDoubleClick={() => handleStartRenameColumn(col)}
                          >
                            {col.label}
                          </span>

                          {!isExporting && (
                            <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity no-print">
                              <button
                                type="button"
                                onClick={() => handleStartRenameColumn(col)}
                                className="p-0.5 text-slate-300 hover:text-white rounded cursor-pointer"
                                title="Rename Column"
                              >
                                <Edit2 className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  if (confirm(`Remove column "${col.label}"?`)) {
                                    onRemoveColumn(col.id);
                                  }
                                }}
                                className="p-0.5 text-slate-300 hover:text-red-400 rounded cursor-pointer"
                                title="Delete Column"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </div>
                      )
                    ) : (
                      <div className={`flex items-center ${col.align === 'center' ? 'justify-center' : col.align === 'right' ? 'justify-end' : 'justify-between'}`}>
                        <span>{col.label}</span>
                      </div>
                    )}

                    {/* + Button to insert column right after this column */}
                    {!isExporting && (
                      <button
                        type="button"
                        id={col.id === 'no' ? 'btn-add-column-between-no-bu' : `btn-add-column-after-${col.id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenAddColumnModal(colIndex + 1);
                        }}
                        title={col.id === 'no' ? 'Add column between NO and BU (+)' : `Insert column after ${col.label}`}
                        aria-label={col.id === 'no' ? 'Add column between NO and BU' : `Insert column after ${col.label}`}
                        className={`absolute -right-2.5 top-1/2 -translate-y-1/2 z-30 w-5 h-5 rounded-full flex items-center justify-center transition-all shadow-md cursor-pointer no-print ${
                          col.id === 'no'
                            ? 'bg-royal-gold hover:bg-amber-400 text-royal-navy ring-2 ring-white opacity-100 scale-105 hover:scale-125'
                            : 'bg-royal-gold/90 hover:bg-amber-400 text-royal-navy opacity-0 group-hover:opacity-100 hover:opacity-100 hover:scale-110'
                        }`}
                      >
                        <Plus className="w-3 h-3 stroke-[3]" />
                      </button>
                    )}
                  </th>
                );
              })}

              {!isExporting && (
                <th className="px-2 py-3 w-14 text-center no-print">
                  <span className="text-[9px] text-slate-400 font-normal">Actions</span>
                </th>
              )}
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-slate-200 text-sm">
            {items.map((item, index) => {
              const isRowActive = activeCell?.row === index;

              return (
                <tr 
                  key={item.id} 
                  className={`divide-x divide-slate-100 group transition-colors ${
                    isRowActive ? 'bg-blue-50/20' : 'hover:bg-slate-50/70'
                  }`}
                >
                  {columns.map((col) => {
                    if (col.id === 'no') {
                      return (
                        <td key={col.id} className="px-2 py-2 text-slate-400 text-center font-medium text-xs select-none bg-slate-50/50">
                          {String(item.no).padStart(2, '0')}
                        </td>
                      );
                    }

                    if (col.id === 'bu') {
                      return (
                        <td key={col.id} className="p-1">
                          {isExporting ? (
                            <div className="w-full text-xs text-center uppercase font-bold text-royal-navy py-1">
                              {item.bu || ""}
                            </div>
                          ) : (
                            <input
                              id={`cell-${index}-bu`}
                              type="text"
                              placeholder="e.g. CE-3"
                              value={item.bu || ""}
                              onChange={(e) => onItemChange(item.id, "bu", e.target.value)}
                              onFocus={() => setActiveCell({ row: index, col: 'bu' })}
                              onKeyDown={(e) => handleKeyDown(e, index, 'bu')}
                              className="w-full bg-transparent focus:bg-white focus:ring-2 focus:ring-blue-500 rounded px-1.5 py-1 text-xs text-center uppercase font-bold text-royal-navy focus:outline-none transition-all placeholder:font-normal placeholder-slate-300"
                            />
                          )}
                        </td>
                      );
                    }

                    if (col.id === 'description') {
                      return (
                        <td key={col.id} className="p-1">
                          {isExporting ? (
                            <div className="w-full text-xs font-semibold text-slate-800 whitespace-pre-wrap py-1 leading-relaxed px-1">
                              {item.description || ""}
                            </div>
                          ) : (
                            <textarea
                              id={`cell-${index}-description`}
                              placeholder="Describe product or service..."
                              rows={2}
                              value={item.description}
                              onChange={(e) => onItemChange(item.id, "description", e.target.value)}
                              onFocus={() => setActiveCell({ row: index, col: 'description' })}
                              onKeyDown={(e) => handleKeyDown(e, index, 'description')}
                              className="w-full bg-transparent focus:bg-white focus:ring-2 focus:ring-blue-500 rounded px-1.5 py-1 text-xs font-semibold resize-none text-slate-800 focus:outline-none transition-all placeholder-slate-400"
                            />
                          )}
                        </td>
                      );
                    }

                    if (col.id === 'partNo') {
                      return (
                        <td key={col.id} className="p-1">
                          {isExporting ? (
                            <div className="w-full text-xs text-center font-medium text-slate-600 py-1">
                              {item.partNo || ""}
                            </div>
                          ) : (
                            <input
                              id={`cell-${index}-partNo`}
                              type="text"
                              placeholder="e.g. ME-210"
                              value={item.partNo || ""}
                              onChange={(e) => onItemChange(item.id, "partNo", e.target.value)}
                              onFocus={() => setActiveCell({ row: index, col: 'partNo' })}
                              onKeyDown={(e) => handleKeyDown(e, index, 'partNo')}
                              className="w-full bg-transparent focus:bg-white focus:ring-2 focus:ring-blue-500 rounded px-1.5 py-1 text-xs text-center font-medium text-slate-600 focus:outline-none transition-all placeholder-slate-300"
                            />
                          )}
                        </td>
                      );
                    }

                    if (col.id === 'qty') {
                      return (
                        <td key={col.id} className="p-1">
                          {isExporting ? (
                            <div className="w-full text-center font-bold text-xs text-slate-800 py-1">
                              {item.qty}
                            </div>
                          ) : (
                            <input
                              id={`cell-${index}-qty`}
                              type="number"
                              min="1"
                              value={item.qty}
                              onChange={(e) => onItemChange(item.id, "qty", e.target.value)}
                              onFocus={() => setActiveCell({ row: index, col: 'qty' })}
                              onKeyDown={(e) => handleKeyDown(e, index, 'qty')}
                              className="w-full text-center bg-transparent focus:bg-white focus:ring-2 focus:ring-blue-500 rounded px-1 py-1 font-bold text-xs text-slate-800 focus:outline-none transition-all"
                            />
                          )}
                        </td>
                      );
                    }

                    if (col.id === 'price') {
                      return (
                        <td key={col.id} className="p-1">
                          {isExporting ? (
                            <div className="w-full text-right font-bold text-xs text-slate-800 py-1 px-1">
                              {item.price === 0 ? "0" : item.price.toLocaleString()}
                            </div>
                          ) : (
                            <input
                              id={`cell-${index}-price`}
                              type="number"
                              min="0"
                              placeholder="0"
                              value={item.price === 0 ? "" : item.price}
                              onChange={(e) => onItemChange(item.id, "price", e.target.value)}
                              onFocus={() => setActiveCell({ row: index, col: 'price' })}
                              onKeyDown={(e) => handleKeyDown(e, index, 'price')}
                              className="w-full text-right bg-transparent focus:bg-white focus:ring-2 focus:ring-blue-500 rounded px-1.5 py-1 font-bold text-xs text-slate-800 focus:outline-none transition-all placeholder-slate-300"
                            />
                          )}
                        </td>
                      );
                    }

                    if (col.id === 'total') {
                      return (
                        <td key={col.id} className="px-3 py-2 text-right font-black text-slate-800 text-xs select-none bg-slate-50/40">
                          {item.total.toLocaleString()}
                        </td>
                      );
                    }

                    if (col.id === 'remark') {
                      return (
                        <td key={col.id} className="p-1">
                          {isExporting ? (
                            <div className="w-full text-xs text-slate-600 py-1 px-1">
                              {item.remark || ""}
                            </div>
                          ) : (
                            <input
                              id={`cell-${index}-remark`}
                              type="text"
                              placeholder="Remark"
                              value={item.remark || ""}
                              onChange={(e) => onItemChange(item.id, "remark", e.target.value)}
                              onFocus={() => setActiveCell({ row: index, col: 'remark' })}
                              onKeyDown={(e) => handleKeyDown(e, index, 'remark')}
                              className="w-full bg-transparent focus:bg-white focus:ring-2 focus:ring-blue-500 rounded px-1.5 py-1 text-xs text-slate-600 focus:outline-none transition-all placeholder-slate-300"
                            />
                          )}
                        </td>
                      );
                    }

                    // Dynamic custom column
                    const cellVal = item.customFields?.[col.id] ?? '';
                    return (
                      <td key={col.id} className="p-1">
                        {isExporting ? (
                          <div className={`w-full text-xs py-1 px-1.5 ${
                            col.align === 'center' ? 'text-center font-medium text-slate-700' :
                            col.align === 'right' ? 'text-right font-bold text-slate-800' :
                            'text-left font-medium text-slate-700'
                          }`}>
                            {cellVal}
                          </div>
                        ) : (
                          <input
                            id={`cell-${index}-${col.id}`}
                            type={col.type === 'number' ? 'number' : 'text'}
                            placeholder={col.label}
                            value={cellVal}
                            onChange={(e) => onCustomFieldChange(item.id, col.id, e.target.value)}
                            onFocus={() => setActiveCell({ row: index, col: col.id })}
                            onKeyDown={(e) => handleKeyDown(e, index, col.id)}
                            className={`w-full bg-transparent focus:bg-white focus:ring-2 focus:ring-blue-500 rounded px-1.5 py-1 text-xs text-slate-800 focus:outline-none transition-all placeholder-slate-300 ${
                              col.align === 'center' ? 'text-center font-medium' :
                              col.align === 'right' ? 'text-right font-bold' :
                              'text-left'
                            }`}
                          />
                        )}
                      </td>
                    );
                  })}

                  {/* Row Actions Bar (no-print) */}
                  {!isExporting && (
                    <td className="px-1 py-1 text-center no-print select-none bg-slate-50/40">
                      <div className="flex items-center justify-center gap-0.5">
                        {/* Move Up */}
                        <button
                          type="button"
                          onClick={() => onMoveRow(index, 'up')}
                          disabled={index === 0}
                          className="p-1 text-slate-400 hover:text-royal-navy hover:bg-slate-200/60 rounded disabled:opacity-20 transition"
                          title="Move Row Up (Alt+Up)"
                        >
                          <ChevronUp className="w-3 h-3" />
                        </button>

                        {/* Move Down */}
                        <button
                          type="button"
                          onClick={() => onMoveRow(index, 'down')}
                          disabled={index === items.length - 1}
                          className="p-1 text-slate-400 hover:text-royal-navy hover:bg-slate-200/60 rounded disabled:opacity-20 transition"
                          title="Move Row Down (Alt+Down)"
                        >
                          <ChevronDown className="w-3 h-3" />
                        </button>

                        {/* Duplicate row */}
                        <button
                          type="button"
                          onClick={() => onDuplicateRow(index)}
                          className="p-1 text-slate-400 hover:text-royal-navy hover:bg-slate-200/60 rounded transition"
                          title="Duplicate Row"
                        >
                          <Copy className="w-3 h-3" />
                        </button>

                        {/* Delete row */}
                        <button
                          type="button"
                          onClick={() => onRemoveRow(item.id)}
                          disabled={items.length <= 1}
                          className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition disabled:opacity-20"
                          title="Delete Row"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer of services bento box */}
      <div className="mt-auto border-t-2 border-slate-100 bg-slate-50 p-4 flex flex-col sm:flex-row justify-between items-center gap-3 rounded-b-xl">
        <div className="flex items-center gap-3 w-full sm:w-auto text-xs text-slate-500">
          <span>{items.length} items listed</span>
        </div>

        <div className="flex flex-col items-end w-full sm:w-auto">
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
            Grand Total ({currency})
          </span>
          <span className="text-2xl font-black text-royal-navy tracking-tight">
            {grandTotal.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
};
