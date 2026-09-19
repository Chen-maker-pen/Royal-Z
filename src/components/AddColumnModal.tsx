import React, { useState } from 'react';
import { TableColumn } from '../types';
import { X, Plus, Sparkles } from 'lucide-react';

interface AddColumnModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddColumn: (column: TableColumn, insertIndex?: number) => void;
  existingColumns: TableColumn[];
  insertIndex?: number;
}

const PRESET_COLUMNS = [
  { label: 'Discount (%)', type: 'number' as const, align: 'right' as const, id: 'discount' },
  { label: 'Unit', type: 'text' as const, align: 'center' as const, id: 'unit' },
  { label: 'Serial No', type: 'text' as const, align: 'center' as const, id: 'serialNo' },
  { label: 'Warranty', type: 'text' as const, align: 'center' as const, id: 'warranty' },
  { label: 'HS Code', type: 'text' as const, align: 'center' as const, id: 'hsCode' },
  { label: 'Brand / Model', type: 'text' as const, align: 'left' as const, id: 'brand' },
];

export const AddColumnModal: React.FC<AddColumnModalProps> = ({
  isOpen,
  onClose,
  onAddColumn,
  existingColumns,
  insertIndex,
}) => {
  const [label, setLabel] = useState('');
  const [type, setType] = useState<'text' | 'number'>('text');
  const [align, setAlign] = useState<'left' | 'center' | 'right'>('left');

  if (!isOpen) return null;

  const handleApplyPreset = (preset: typeof PRESET_COLUMNS[0]) => {
    setLabel(preset.label);
    setType(preset.type);
    setAlign(preset.align);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedLabel = label.trim();
    if (!trimmedLabel) return;

    // Check if column already exists
    const exists = existingColumns.some(
      col => col.label.toLowerCase() === trimmedLabel.toLowerCase()
    );
    if (exists) {
      alert(`A column named "${trimmedLabel}" already exists.`);
      return;
    }

    const newColumn: TableColumn = {
      id: `col_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      label: trimmedLabel,
      type,
      align,
      isCustom: true,
      width: align === 'center' ? 'w-24' : align === 'right' ? 'w-28' : 'min-w-[120px]',
    };

    onAddColumn(newColumn, insertIndex);
    setLabel('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-royal-navy text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-royal-gold/20 text-royal-gold rounded-lg">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold">Add New Table Column</h3>
              <p className="text-xs text-slate-300">Customize your spreadsheet invoice table</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          {/* Quick presets */}
          <div>
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-royal-gold-dark" />
              Quick Suggestions
            </label>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_COLUMNS.map((preset) => {
                const isUsed = existingColumns.some(c => c.label.toLowerCase() === preset.label.toLowerCase());
                return (
                  <button
                    key={preset.id}
                    type="button"
                    disabled={isUsed}
                    onClick={() => handleApplyPreset(preset)}
                    className={`text-xs px-2.5 py-1 rounded-md font-medium border transition ${
                      isUsed 
                        ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed line-through' 
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-royal-navy/5 hover:border-royal-navy hover:text-royal-navy'
                    }`}
                  >
                    + {preset.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Column Name */}
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
              Column Title / Header *
            </label>
            <input
              type="text"
              autoFocus
              placeholder="e.g. Unit (Pcs), Discount %, Serial No..."
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-royal-navy/20 focus:border-royal-navy"
              required
            />
          </div>

          {/* Data Type & Alignment */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                Data Format
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as 'text' | 'number')}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-royal-navy/20 focus:border-royal-navy"
              >
                <option value="text">Text (Notes, Codes)</option>
                <option value="number">Number / Percentage</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                Alignment
              </label>
              <select
                value={align}
                onChange={(e) => setAlign(e.target.value as 'left' | 'center' | 'right')}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-royal-navy/20 focus:border-royal-navy"
              >
                <option value="left">Left Aligned</option>
                <option value="center">Center</option>
                <option value="right">Right (Amounts / %)</option>
              </select>
            </div>
          </div>

          {/* Footer buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!label.trim()}
              className="px-5 py-2 text-sm bg-royal-navy text-white font-bold rounded-lg hover:bg-slate-900 transition shadow-sm disabled:opacity-50 flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4 text-royal-gold" />
              Add Column
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
