import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import {
  parseBankStatementFile,
  exportSampleVietcombankExcel,
  ParsedTransactionRow,
} from '../../utils/bankStatementParser';
import { formatVND } from '../../utils/vietqr';
import {
  UploadCloud,
  FileSpreadsheet,
  Download,
  AlertTriangle,
  CheckCircle2,
  X,
  ArrowRight,
  Info,
  Layers,
} from 'lucide-react';

interface ExcelImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedMonth: number;
  selectedYear: number;
  onImportSuccess?: (month: number, year: number, count: number) => void;
}

export const ExcelImportModal: React.FC<ExcelImportModalProps> = ({
  isOpen,
  onClose,
  selectedMonth,
  selectedYear,
  onImportSuccess,
}) => {
  const { importBankStatement } = useApp();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [importMonth, setImportMonth] = useState<number>(selectedMonth);
  const [importYear, setImportYear] = useState<number>(selectedYear);
  const [overwrite, setOverwrite] = useState<boolean>(true);

  const [previewRows, setPreviewRows] = useState<ParsedTransactionRow[]>([]);
  const [totalCredit, setTotalCredit] = useState<number>(0);

  if (!isOpen) return null;

  const handleFileChange = async (selectedFile: File) => {
    if (!selectedFile) return;

    // Check extension
    const validExts = ['.xlsx', '.xls', '.csv'];
    const fileName = selectedFile.name.toLowerCase();
    const isValid = validExts.some((ext) => fileName.endsWith(ext));

    if (!isValid) {
      setError('Vui lòng chọn file định dạng Excel (.xlsx, .xls) hoặc .csv');
      return;
    }

    setError(null);
    setFile(selectedFile);
    setIsLoading(true);

    try {
      const result = await parseBankStatementFile(selectedFile, importMonth, importYear);
      if (!result.success || result.transactions.length === 0) {
        setError(result.errorMessage || 'Không tìm thấy dòng giao dịch hợp lệ nào trong file.');
        setPreviewRows([]);
        setTotalCredit(0);
      } else {
        setPreviewRows(result.transactions);
        setTotalCredit(result.totalCreditAmount);
        if (result.detectedMonth) {
          setImportMonth(result.detectedMonth);
        }
        if (result.detectedYear) {
          setImportYear(result.detectedYear);
        }
      }
    } catch (err: any) {
      setError(err?.message || 'Có lỗi xảy ra khi xử lý file Excel.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleConfirmImport = () => {
    if (!file || previewRows.length === 0) return;

    const txns = previewRows.map((r, idx) => ({
      stt: r.stt || idx + 1,
      docNo: r.docNo,
      transactionDate: r.transactionDate,
      amount: r.amount,
      description: r.description,
      reconciliationStatus: 'unmatched' as const,
    }));

    importBankStatement(importMonth, importYear, file.name, txns, overwrite);

    if (onImportSuccess) {
      onImportSuccess(importMonth, importYear, txns.length);
    }

    onClose();
  };

  return (
    <div
      id="excel-import-modal-overlay"
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
    >
      <div
        id="excel-import-modal-container"
        className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 space-y-5 animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Import File Sao Kê Ngân Hàng (Excel / Vietcombank)
              </h3>
              <p className="text-xs text-slate-500">
                Nhập file sao kê tài khoản ngân hàng để lưu dữ liệu và đối soát học phí theo tháng
              </p>
            </div>
          </div>
          <button
            id="close-excel-import-modal-btn"
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Month Selector & Options */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <label htmlFor="import-month-select" className="text-xs font-bold text-slate-700 whitespace-nowrap">
                Lưu vào kỳ sao kê:
              </label>
              <div className="flex items-center space-x-1.5">
                <select
                  id="import-month-select"
                  value={importMonth}
                  onChange={(e) => setImportMonth(Number(e.target.value))}
                  className="bg-white border border-slate-300 text-slate-800 text-xs font-bold rounded-xl px-3 py-1.5 focus:ring-2 focus:ring-blue-500"
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                    <option key={m} value={m}>
                      Tháng {m}
                    </option>
                  ))}
                </select>
                <select
                  id="import-year-select"
                  value={importYear}
                  onChange={(e) => setImportYear(Number(e.target.value))}
                  className="bg-white border border-slate-300 text-slate-800 text-xs font-bold rounded-xl px-3 py-1.5 focus:ring-2 focus:ring-blue-500"
                >
                  {[2025, 2026, 2027].map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              id="download-sample-excel-btn"
              type="button"
              onClick={() => exportSampleVietcombankExcel(importMonth, importYear)}
              className="inline-flex items-center space-x-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100/70 px-3 py-1.5 rounded-xl border border-blue-200/60 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Tải file Excel mẫu chuẩn VCB (.xlsx)</span>
            </button>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 text-xs text-slate-600">
            <label className="flex items-center space-x-2 cursor-pointer select-none">
              <input
                id="overwrite-checkbox"
                type="checkbox"
                checked={overwrite}
                onChange={(e) => setOverwrite(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
              />
              <span className="font-medium text-slate-700">
                Ghi đè dữ liệu sao kê của Tháng {importMonth}/{importYear} nếu đã tồn tại
              </span>
            </label>
            <span className="text-[11px] text-slate-400">
              * Hệ thống nhận diện 4 cột: STT, Ngày, Số tiền, Nội dung
            </span>
          </div>
        </div>

        {/* Drag & Drop Zone */}
        <div
          id="file-drop-zone"
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-blue-500 bg-blue-50/50 scale-[0.99]'
              : file
              ? 'border-emerald-400 bg-emerald-50/30'
              : 'border-slate-300 hover:border-blue-400 bg-slate-50/50 hover:bg-slate-50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx, .xls, .csv"
            onChange={(e) => e.target.files && handleFileChange(e.target.files[0])}
            className="hidden"
          />

          <div className="flex flex-col items-center justify-center space-y-2">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                file
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-blue-100 text-blue-600'
              }`}
            >
              {file ? <CheckCircle2 className="w-6 h-6" /> : <UploadCloud className="w-6 h-6" />}
            </div>

            {file ? (
              <div>
                <p className="text-sm font-bold text-slate-900">{file.name}</p>
                <p className="text-xs text-emerald-600 font-medium mt-0.5">
                  Đã đọc thành công {previewRows.length} dòng giao dịch | Tổng tiền: {formatVND(totalCredit)}
                </p>
                <p className="text-[11px] text-slate-400 mt-1">Nhấp để chọn file khác nếu cần</p>
              </div>
            ) : (
              <div>
                <p className="text-xs font-bold text-slate-800">
                  Kéo thả file sao kê Excel vào đây, hoặc <span className="text-blue-600 underline">bấm để chọn file</span>
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Hỗ trợ các định dạng .xlsx, .xls, .csv (Xuất từ Vietcombank, MBBank, Techcombank,...)
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3.5 rounded-2xl flex items-start space-x-2">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-bold">Lỗi đọc file:</strong>
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Preview of Parsed 4 Columns */}
        {previewRows.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
                <Layers className="w-4 h-4 text-blue-600" />
                <span>Xem trước 4 cột dữ liệu sao kê ({previewRows.length} giao dịch)</span>
              </span>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                Tổng ghi có: +{formatVND(totalCredit)}
              </span>
            </div>

            <div className="border border-slate-200 rounded-2xl overflow-hidden max-h-56 overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 font-bold sticky top-0 border-b border-slate-200">
                  <tr>
                    <th className="py-2 px-3 w-12 text-center">STT</th>
                    <th className="py-2 px-3 w-32">Ngày giao dịch</th>
                    <th className="py-2 px-3 w-32 text-right">Số tiền giao dịch</th>
                    <th className="py-2 px-3">Nội dung giao dịch</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {previewRows.slice(0, 10).map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/70">
                      <td className="py-2 px-3 text-center font-mono font-bold text-slate-500">
                        {row.stt || idx + 1}
                      </td>
                      <td className="py-2 px-3 font-mono text-slate-700">
                        {row.transactionDate}
                        {row.docNo && (
                          <span className="block text-[10px] text-slate-400">{row.docNo}</span>
                        )}
                      </td>
                      <td className="py-2 px-3 text-right font-black text-emerald-700 font-mono">
                        +{formatVND(row.amount)}
                      </td>
                      <td className="py-2 px-3 text-slate-800 text-[11px] font-mono truncate max-w-xs">
                        {row.description}
                      </td>
                    </tr>
                  ))}
                  {previewRows.length > 10 && (
                    <tr className="bg-slate-50/50">
                      <td colSpan={4} className="py-2 px-3 text-center text-xs text-slate-500 italic">
                        ... và còn {previewRows.length - 10} dòng giao dịch khác
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <div className="flex items-center space-x-1.5 text-slate-400 text-xs">
            <Info className="w-3.5 h-3.5" />
            <span>Kỳ sao kê: Tháng {importMonth}/{importYear}</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              id="cancel-import-btn"
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Đóng
            </button>

            <button
              id="confirm-import-btn"
              type="button"
              disabled={isLoading || previewRows.length === 0}
              onClick={handleConfirmImport}
              className="inline-flex items-center space-x-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md transition-all active:scale-98"
            >
              <span>Xác nhận Import ({previewRows.length} GD)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
