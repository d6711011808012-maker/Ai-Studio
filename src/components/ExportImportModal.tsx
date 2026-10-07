import React, { useRef, useState } from 'react';
import { Transaction } from '../types';
import { 
  exportTransactionsCSV, 
  exportBackupJSON, 
  restoreSampleData, 
  clearAllData 
} from '../services/storage';
import { 
  X, 
  FileSpreadsheet, 
  Download, 
  Upload, 
  RotateCcw, 
  Trash2, 
  Check, 
  AlertCircle 
} from 'lucide-react';

interface ExportImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
  budgets: Record<string, number>;
  onDataImported: (newTx: Transaction[], newBudgets?: Record<string, number>) => void;
}

export const ExportImportModal: React.FC<ExportImportModalProps> = ({
  isOpen,
  onClose,
  transactions,
  budgets,
  onDataImported,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  if (!isOpen) return null;

  const handleExportCSV = () => {
    exportTransactionsCSV(transactions);
    setStatusMessage({ text: 'ส่งออกไฟล์ CSV สำเร็จ (รองรับภาษาไทยใน Excel)', type: 'success' });
  };

  const handleExportJSON = () => {
    exportBackupJSON(transactions, budgets);
    setStatusMessage({ text: 'ดาวน์โหลดไฟล์สำรองข้อมูล JSON สำเร็จ', type: 'success' });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);

        let importedTransactions: Transaction[] = [];
        let importedBudgets: Record<string, number> = {};

        if (Array.isArray(parsed)) {
          importedTransactions = parsed;
        } else if (parsed && Array.isArray(parsed.transactions)) {
          importedTransactions = parsed.transactions;
          if (parsed.budgets) importedBudgets = parsed.budgets;
        } else {
          throw new Error('รูปแบบไฟล์ JSON ไม่ถูกต้อง');
        }

        onDataImported(importedTransactions, importedBudgets);
        setStatusMessage({ 
          text: `นำเข้าข้อมูลสำเร็จ (${importedTransactions.length} รายการ)`, 
          type: 'success' 
        });
      } catch (err) {
        setStatusMessage({ 
          text: 'ไม่สามารถอ่านไฟล์ได้ กรุณาตรวจสอบว่าเป็นไฟล์ Backup JSON ที่ถูกต้อง', 
          type: 'error' 
        });
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRestoreSample = () => {
    if (confirm('คุณต้องการรีเซ็ตข้อมูลกลับเป็นข้อมูลตัวอย่างเริ่มต้นหรือไม่?')) {
      const restored = restoreSampleData();
      onDataImported(restored);
      setStatusMessage({ text: 'รีเซ็ตข้อมูลตัวอย่างเรียบร้อยแล้ว', type: 'success' });
    }
  };

  const handleClearAll = () => {
    if (confirm('คำเตือน: คุณแน่ใจหรือไม่ว่าต้องการล้างข้อมูลทั้งหมดในเครื่อง? (การกระทำนี้ไม่สามารถย้อนกลับได้)')) {
      clearAllData();
      onDataImported([], {});
      setStatusMessage({ text: 'ล้างข้อมูลทั้งหมดเรียบร้อยแล้ว', type: 'success' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div 
        className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden border border-slate-100 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-900">
            สำรองและส่งออกข้อมูล
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-xs">
          
          {statusMessage && (
            <div
              className={`p-3 rounded-lg flex items-center gap-2 ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <Check className="w-4 h-4 shrink-0 text-emerald-600" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* Export CSV */}
          <div className="p-3.5 border border-slate-200 rounded-xl bg-slate-50/50 flex items-center justify-between">
            <div>
              <p className="font-semibold text-slate-900 flex items-center gap-1.5">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                ส่งออกเป็นไฟล์ CSV
              </p>
              <p className="text-slate-500 text-[11px] mt-0.5">
                เปิดได้ใน Microsoft Excel, Google Sheets ภาษาไทยไม่เพี้ยน
              </p>
            </div>
            <button
              onClick={handleExportCSV}
              className="px-3 py-1.5 font-semibold text-slate-800 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer shrink-0 ml-3"
            >
              ส่งออก CSV
            </button>
          </div>

          {/* Export JSON */}
          <div className="p-3.5 border border-slate-200 rounded-xl bg-slate-50/50 flex items-center justify-between">
            <div>
              <p className="font-semibold text-slate-900 flex items-center gap-1.5">
                <Download className="w-4 h-4 text-indigo-600" />
                สำรองข้อมูลครบถ้วน (JSON)
              </p>
              <p className="text-slate-500 text-[11px] mt-0.5">
                บันทึกรายการทั้งหมดพร้อมงบประมาณเพื่อนำกลับมาใช้ใหม่
              </p>
            </div>
            <button
              onClick={handleExportJSON}
              className="px-3 py-1.5 font-semibold text-slate-800 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer shrink-0 ml-3"
            >
              ดาวน์โหลด
            </button>
          </div>

          {/* Import JSON */}
          <div className="p-3.5 border border-slate-200 rounded-xl bg-slate-50/50 flex items-center justify-between">
            <div>
              <p className="font-semibold text-slate-900 flex items-center gap-1.5">
                <Upload className="w-4 h-4 text-blue-600" />
                กู้คืนข้อมูลจากไฟล์ (JSON)
              </p>
              <p className="text-slate-500 text-[11px] mt-0.5">
                นำไฟล์สำรองที่เคยดาวน์โหลดไว้กลับเข้ามาในแอป
              </p>
            </div>
            <label className="px-3 py-1.5 font-semibold text-slate-800 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer shrink-0 ml-3">
              เลือกไฟล์
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>

          {/* Danger Zone: Reset / Clear */}
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <div className="flex items-center justify-between">
              <button
                onClick={handleRestoreSample}
                className="flex items-center gap-1.5 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer py-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>คืนค่าข้อมูลตัวอย่างตั้งต้น</span>
              </button>

              <button
                onClick={handleClearAll}
                className="flex items-center gap-1.5 text-rose-600 hover:text-rose-800 transition-colors cursor-pointer py-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>ล้างข้อมูลทั้งหมด</span>
              </button>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 cursor-pointer"
          >
            ปิดหน้าต่าง
          </button>
        </div>

      </div>
    </div>
  );
};
