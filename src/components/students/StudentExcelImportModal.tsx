import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import {
  FileSpreadsheet,
  Upload,
  Download,
  X,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Users,
  Layers,
  Building,
  ClipboardList,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import {
  exportStudentSampleExcel,
  parseStudentExcelFile,
  parseRawStudentNames,
  ParsedStudentRow,
} from '../../utils/studentExcelUtils';

interface StudentExcelImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (count: number) => void;
}

export const StudentExcelImportModal: React.FC<StudentExcelImportModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { schools, classes, addBatchStudents, currentTenant } = useApp();

  const [activeTab, setActiveTab] = useState<'excel' | 'quick_paste'>('excel');
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Global defaults for this import
  const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.id || '');
  const [selectedSchoolId, setSelectedSchoolId] = useState<string>(schools[0]?.id || '');

  // Quick text paste state
  const [pasteText, setPasteText] = useState<string>('');

  // Parsed rows ready for preview & confirmation
  const [previewRows, setPreviewRows] = useState<ParsedStudentRow[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Handler for Excel file processing
  const handleProcessFile = async (uploadedFile: File) => {
    const validExts = ['.xlsx', '.xls', '.csv'];
    const lowerName = uploadedFile.name.toLowerCase();
    const isValid = validExts.some((ext) => lowerName.endsWith(ext));

    if (!isValid) {
      setError('Vui lòng chọn file định dạng Excel (.xlsx, .xls) hoặc .csv');
      return;
    }

    setError(null);
    setFile(uploadedFile);
    setIsLoading(true);

    try {
      const result = await parseStudentExcelFile(uploadedFile, {
        defaultClassId: selectedClassId || undefined,
        defaultSchoolId: selectedSchoolId || undefined,
        existingSchools: schools,
        existingClasses: classes,
      });

      if (!result.success || result.rows.length === 0) {
        setError(result.error || 'Không tìm thấy dữ liệu học sinh trong file.');
        setPreviewRows([]);
      } else {
        setPreviewRows(result.rows);
      }
    } catch (err: any) {
      setError(err?.message || 'Có lỗi xảy ra khi đọc file Excel.');
      setPreviewRows([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleProcessFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleProcessFile(e.dataTransfer.files[0]);
    }
  };

  // Handler for Quick Text Paste
  const handleParsePastedText = () => {
    if (!pasteText.trim()) {
      setError('Vui lòng dán danh sách tên học sinh (mỗi học sinh 1 dòng).');
      return;
    }
    setError(null);
    const rows = parseRawStudentNames(pasteText, {
      defaultClassId: selectedClassId || undefined,
      defaultSchoolId: selectedSchoolId || undefined,
      existingSchools: schools,
      existingClasses: classes,
    });

    if (rows.length === 0) {
      setError('Không trích xuất được học sinh nào từ danh sách.');
    } else {
      setPreviewRows(rows);
    }
  };

  // Remove a row from preview
  const handleRemoveRow = (idx: number) => {
    setPreviewRows((prev) => prev.filter((_, i) => i !== idx));
  };

  // Download sample file
  const handleDownloadSample = () => {
    const activeClass = classes.find((c) => c.id === selectedClassId)?.name || 'K10 - Vật lý Cô Nga';
    const activeSchool = schools.find((s) => s.id === selectedSchoolId)?.name || 'THPT Phan Bội Châu';
    exportStudentSampleExcel(activeClass, activeSchool);
  };

  // Confirm import
  const handleConfirmImport = async () => {
    if (previewRows.length === 0) return;
    setIsSaving(true);
    try {
      const studentsToInsert = previewRows.map((r) => {
        // Enforce default class if selected and not yet in enrolledClassIds
        let classIds = [...r.enrolledClassIds];
        if (selectedClassId && !classIds.includes(selectedClassId)) {
          classIds.push(selectedClassId);
        }

        return {
          fullName: r.fullName,
          dob: r.dob,
          birthYear: r.birthYear,
          phone: r.phone || '',
          email: r.email || '',
          schoolId: r.schoolId || schools[0]?.id || 'sch-default',
          schoolCode: r.schoolCode || schools[0]?.code || 'PT',
          schoolName: r.schoolName || schools[0]?.name || 'Trường Phổ Thông',
          schoolGrade: r.schoolGrade || '10A1',
          parentName: r.parentName || `Phụ huynh em ${r.fullName}`,
          parentPhone: r.parentPhone || '',
          parentEmail: r.parentEmail || '',
          enrolledClassIds: classIds,
          status: 'active' as const,
          notes: r.notes || '',
        };
      });

      await addBatchStudents(studentsToInsert);

      if (onSuccess) {
        onSuccess(studentsToInsert.length);
      }
      onClose();
    } catch (err: any) {
      setError('Lỗi khi lưu danh sách học sinh: ' + (err?.message || err));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      id="student-excel-import-modal-overlay"
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
    >
      <div
        id="student-excel-import-modal"
        className="bg-white rounded-3xl max-w-4xl w-full p-6 shadow-2xl border border-slate-100 space-y-5 animate-in fade-in zoom-in-95 duration-150 max-h-[92vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Nhập Danh Sách Học Sinh Từ Excel
              </h3>
              <p className="text-xs text-slate-500">
                Tải lên file danh sách hoặc dán nhanh. Các trường dữ liệu là{' '}
                <strong className="text-emerald-700 font-semibold">không yêu cầu bắt buộc</strong>.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Configuration Row: Select Class & School to Assign */}
        <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/80 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs shrink-0">
          <div>
            <label className="font-bold text-slate-700 flex items-center space-x-1 mb-1">
              <Layers className="w-3.5 h-3.5 text-blue-600" />
              <span>Gán vào Lớp dạy thêm (tùy chọn):</span>
            </label>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="w-full border border-slate-300 rounded-xl p-2 bg-white text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500 outline-hidden"
            >
              <option value="">-- Không gán mặc định (lấy theo file Excel) --</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
                </option>
              ))}
            </select>
            <span className="text-[11px] text-slate-400 mt-0.5 block">
              Tất cả học sinh được import sẽ được tự động gán vào lớp này (nếu chọn).
            </span>
          </div>

          <div>
            <label className="font-bold text-slate-700 flex items-center space-x-1 mb-1">
              <Building className="w-3.5 h-3.5 text-indigo-600" />
              <span>Trường phổ thông mặc định (nếu trong file để trống):</span>
            </label>
            <select
              value={selectedSchoolId}
              onChange={(e) => setSelectedSchoolId(e.target.value)}
              className="w-full border border-slate-300 rounded-xl p-2 bg-white text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500 outline-hidden"
            >
              {schools.map((sch) => (
                <option key={sch.id} value={sch.id}>
                  {sch.name} ({sch.code})
                </option>
              ))}
            </select>
            <span className="text-[11px] text-slate-400 mt-0.5 block">
              Áp dụng cho các dòng không điền cột Trường học.
            </span>
          </div>
        </div>

        {/* Tabs: Upload Excel File vs Quick Paste */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-2 shrink-0">
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={() => setActiveTab('excel')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center space-x-1.5 cursor-pointer ${
                activeTab === 'excel'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Tải file Excel (.xlsx, .csv)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('quick_paste')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center space-x-1.5 cursor-pointer ${
                activeTab === 'quick_paste'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <ClipboardList className="w-3.5 h-3.5" />
              <span>Dán danh sách tên nhanh</span>
            </button>
          </div>

          {/* Download Sample File Button */}
          <button
            type="button"
            onClick={handleDownloadSample}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            title="Tải file Excel mẫu chuẩn có 1 dòng dữ liệu mẫu"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span>Tải file Excel mẫu (.xlsx)</span>
          </button>
        </div>

        {/* Content Area: File upload or Text Paste */}
        <div className="overflow-y-auto space-y-4 flex-1 pr-1">
          {activeTab === 'excel' && (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-3xl p-6 text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-blue-500 bg-blue-50/50 scale-[1.01]'
                  : 'border-slate-200 hover:border-blue-400 bg-slate-50/40 hover:bg-blue-50/20'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-3">
                <Upload className="w-6 h-6" />
              </div>
              <p className="text-xs font-bold text-slate-800">
                {file ? file.name : 'Kéo thả file Excel vào đây hoặc click để chọn file'}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                Hỗ trợ định dạng .xlsx, .xls, .csv • Tự động nhận diện cột linh hoạt
              </p>
              {file && (
                <div className="inline-flex items-center space-x-1 mt-2 px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-lg text-[11px] font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Đã nạp file: {file.name}</span>
                </div>
              )}
            </div>
          )}

          {activeTab === 'quick_paste' && (
            <div className="space-y-2 text-xs">
              <label className="font-bold text-slate-700 block">
                Dán danh sách tên học sinh (mỗi học sinh 1 dòng):
              </label>
              <textarea
                value={pasteText}
                onChange={(e) => setPasteText(e.target.value)}
                placeholder={`Tiến Dũng\nThanh Sơn\nNam\nPhan Anh\nAnh Ngọc\nAnh Vỹ\nKhánh\nGia Hưng\nHà Anh\nGia Linh\nLâm\nPhước Nguyên\nTuấn Hưng\nTrong Nhân\nGia Bảo\nNam Khánh`}
                rows={6}
                className="w-full border border-slate-300 rounded-2xl p-3 focus:ring-2 focus:ring-blue-500 outline-hidden font-mono text-xs"
              />
              <div className="flex justify-between items-center">
                <span className="text-[11px] text-slate-400">
                  Có thể dán trực tiếp danh sách copy từ Word, Zalo, Excel...
                </span>
                <button
                  type="button"
                  onClick={handleParsePastedText}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center space-x-1.5 cursor-pointer shadow-xs"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Trích xuất danh sách</span>
                </button>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          {/* Preview Section */}
          {previewRows.length > 0 && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-slate-900 text-xs">Xem trước danh sách học sinh:</span>
                  <span className="px-2.5 py-0.5 bg-blue-100 text-blue-700 font-bold rounded-full text-xs">
                    {previewRows.length} học sinh
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setPreviewRows([])}
                  className="text-[11px] text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                >
                  Xóa xem trước
                </button>
              </div>

              <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs max-h-60 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200 sticky top-0">
                    <tr>
                      <th className="py-2.5 px-3">STT</th>
                      <th className="py-2.5 px-3">Họ và tên</th>
                      <th className="py-2.5 px-3">SĐT HS</th>
                      <th className="py-2.5 px-3">Trường / Lớp trường</th>
                      <th className="py-2.5 px-3">Lớp dạy thêm gán vào</th>
                      <th className="py-2.5 px-3">Phụ huynh & SĐT</th>
                      <th className="py-2.5 px-3 text-center">Xóa</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                    {previewRows.map((r, idx) => {
                      const displayClasses = [
                        ...r.enrolledClassNames,
                        ...(selectedClassId && !r.enrolledClassIds.includes(selectedClassId)
                          ? [classes.find((c) => c.id === selectedClassId)?.name || '']
                          : []),
                      ].filter(Boolean);

                      return (
                        <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-2 px-3 text-slate-400 font-mono text-[11px]">{idx + 1}</td>
                          <td className="py-2 px-3">
                            <span className="font-bold text-slate-900 block">{r.fullName}</span>
                            <span className="text-[10px] text-slate-400 font-mono">DOB: {r.dob}</span>
                          </td>
                          <td className="py-2 px-3 text-slate-600 font-mono text-[11px]">
                            {r.phone || <span className="text-slate-300 italic">Trống</span>}
                          </td>
                          <td className="py-2 px-3">
                            <span className="text-slate-800 block font-semibold">{r.schoolName}</span>
                            <span className="text-[10px] text-blue-600 font-mono">
                              Mã: {r.schoolCode} • Lớp {r.schoolGrade}
                            </span>
                          </td>
                          <td className="py-2 px-3">
                            <div className="flex flex-wrap gap-1">
                              {displayClasses.length > 0 ? (
                                displayClasses.map((cName, cIdx) => (
                                  <span
                                    key={cIdx}
                                    className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[10px] font-bold border border-blue-100"
                                  >
                                    {cName}
                                  </span>
                                ))
                              ) : (
                                <span className="text-slate-400 italic text-[11px]">Chưa gán lớp</span>
                              )}
                            </div>
                          </td>
                          <td className="py-2 px-3">
                            <span className="text-slate-800 block font-semibold">{r.parentName}</span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {r.parentPhone || <span className="italic text-slate-300">Không có SĐT</span>}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveRow(idx)}
                              className="p-1 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                              title="Xóa học sinh này khỏi danh sách import"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
          >
            Hủy bỏ
          </button>

          <button
            type="button"
            disabled={previewRows.length === 0 || isSaving}
            onClick={handleConfirmImport}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-colors flex items-center space-x-2 cursor-pointer shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <span>Đang lưu dữ liệu...</span>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  {previewRows.length > 0
                    ? `Xác nhận Nhập ${previewRows.length} Học Sinh`
                    : 'Nhập học sinh vào phần mềm'}
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
