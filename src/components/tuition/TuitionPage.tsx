import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { TuitionItem } from '../../types';
import { formatVND } from '../../utils/vietqr';
import {
  CreditCard,
  QrCode,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Download,
  Filter,
  Search,
  CheckCheck,
  RefreshCw,
  Calendar,
} from 'lucide-react';
import { VietQRModal } from './VietQRModal';

export interface TuitionPageProps {
  initialMonth?: number;
  initialYear?: number;
  initialSchool?: string;
  initialClassId?: string;
  initialStatus?: string;
}

export const TuitionPage: React.FC<TuitionPageProps> = ({
  initialMonth,
  initialYear,
  initialSchool,
  initialClassId,
  initialStatus,
}) => {
  const {
    tuitionItems,
    calculateTuitionForMonth,
    updateTuitionStatus,
    paymentAccount,
    schools,
    classes,
  } = useApp();

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  // Pick month from props or existing data, default to current month / year
  const defaultMonth =
    initialMonth ??
    (tuitionItems.some((t) => t.periodMonth === currentMonth && t.periodYear === currentYear)
      ? currentMonth
      : tuitionItems.length > 0
      ? tuitionItems[0].periodMonth
      : currentMonth);
  const defaultYear =
    initialYear ??
    (tuitionItems.some((t) => t.periodMonth === currentMonth && t.periodYear === currentYear)
      ? currentYear
      : tuitionItems.length > 0
      ? tuitionItems[0].periodYear
      : currentYear);

  const [selectedMonth, setSelectedMonth] = useState<number>(defaultMonth);
  const [selectedYear, setSelectedYear] = useState<number>(defaultYear);
  const [selectedSchool, setSelectedSchool] = useState<string>(initialSchool || 'ALL');
  const [selectedClassId, setSelectedClassId] = useState<string>(initialClassId || 'ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>(initialStatus || 'ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [isCalculating, setIsCalculating] = useState(false);

  // Sync state if initial props change
  useEffect(() => {
    if (initialMonth !== undefined) setSelectedMonth(initialMonth);
    if (initialYear !== undefined) setSelectedYear(initialYear);
    if (initialSchool !== undefined) setSelectedSchool(initialSchool);
    if (initialClassId !== undefined) setSelectedClassId(initialClassId);
    if (initialStatus !== undefined) setSelectedStatus(initialStatus);
  }, [initialMonth, initialYear, initialSchool, initialClassId, initialStatus]);

  const [selectedTuitionForQR, setSelectedTuitionForQR] = useState<TuitionItem | null>(null);

  const filteredTuitions = tuitionItems.filter((t) => {
    const matchesMonth = t.periodMonth === selectedMonth && t.periodYear === selectedYear;
    const matchesSchool = selectedSchool === 'ALL' || t.schoolCode === selectedSchool;
    const matchesClass = selectedClassId === 'ALL' || t.classId === selectedClassId;
    const matchesStatus = selectedStatus === 'ALL' || t.status === selectedStatus;
    const matchesSearch =
      t.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.paymentReference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.className.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesMonth && matchesSchool && matchesClass && matchesStatus && matchesSearch;
  });

  const totalExpected = filteredTuitions.reduce((acc, cur) => acc + cur.totalAmount, 0);
  const totalCollected = filteredTuitions
    .filter((t) => t.status === 'paid')
    .reduce((acc, cur) => acc + (cur.paidAmount || cur.totalAmount), 0);
  const totalUnpaid = totalExpected - totalCollected;

  const [toastMessage, setToastMessage] = useState<{ title: string; desc: string } | null>(null);

  const handleCalculateTuition = () => {
    setIsCalculating(true);
    calculateTuitionForMonth?.(
      selectedMonth,
      selectedYear,
      selectedClassId !== 'ALL' ? selectedClassId : undefined
    );
    setTimeout(() => {
      setIsCalculating(false);
      const selectedClass = classes.find((c) => c.id === selectedClassId);
      const classNameStr = selectedClass ? ` cho lớp ${selectedClass.name}` : '';
      setToastMessage({
        title: 'Đã tổng hợp & tính học phí thành công!',
        desc: `Bảng kê Tháng ${selectedMonth}/${selectedYear}${classNameStr} đã được tính tự động từ lịch điểm danh thực tế.`,
      });
    }, 300);
  };

  const handleExportCSV = () => {
    const headers = 'STT,Họ tên,Mã trường,Khóa,Lớp,Số buổi,Đơn giá/buổi,Thành tiền,Mã VietQR,Trạng thái\n';
    const rows = filteredTuitions
      .map(
        (t, idx) =>
          `${idx + 1},"${t.studentName}","${t.schoolCode}","K${String(t.birthYear).slice(-2)}","${t.className}",${t.sessionCount},${t.feePerSession},${t.totalAmount},"${t.paymentReference}","${t.status}"`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Bang_Ke_Hoc_Phi_T${selectedMonth}_${selectedYear}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900">
              Bảng Kê & Tính Học Phí Tháng {selectedMonth}/{selectedYear}
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-xs font-bold">
              {filteredTuitions.length} học sinh
            </span>
            {selectedClassId !== 'ALL' && (
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                {classes.find((c) => c.id === selectedClassId)?.name || 'Lớp đã chọn'}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            BR-009 & BR-010: Tự động tổng hợp số buổi học thực tế (fee_eligible), nhân đơn giá và sinh mã VietQR chuyển khoản chuẩn.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleCalculateTuition}
            disabled={isCalculating}
            className="inline-flex items-center space-x-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isCalculating ? 'animate-spin' : ''}`} />
            <span>
              {isCalculating
                ? 'Đang tính toán...'
                : selectedClassId !== 'ALL'
                ? `Tính lại học phí ${classes.find((c) => c.id === selectedClassId)?.name || 'lớp'} (T${selectedMonth}/${selectedYear})`
                : `Tính lại học phí T${selectedMonth}/${selectedYear}`}
            </span>
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center space-x-1.5 px-4 py-2.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Xuất Excel/CSV</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500">Tổng doanh thu dự kiến (T{selectedMonth})</span>
          <p className="text-2xl font-black text-slate-900 mt-1">{formatVND(totalExpected)}</p>
          <span className="text-[11px] text-slate-400 mt-0.5 block">
            {filteredTuitions.length} khoản học phí cần thu
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500">Đã thu qua ngân hàng / tiền mặt</span>
          <p className="text-2xl font-black text-emerald-600 mt-1">{formatVND(totalCollected)}</p>
          <span className="text-[11px] text-emerald-600 font-semibold mt-0.5 block">
            Đã hoàn tất {filteredTuitions.filter((t) => t.status === 'paid').length} học sinh
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500">Chưa nộp học phí</span>
          <p className="text-2xl font-black text-amber-600 mt-1">{formatVND(totalUnpaid)}</p>
          <span className="text-[11px] text-amber-700 font-semibold mt-0.5 block">
            {filteredTuitions.filter((t) => t.status === 'unpaid' || t.status === 'partial').length} học sinh cần thu
          </span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Kỳ thu selector */}
          <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 shadow-2xs">
            <Calendar className="w-4 h-4 text-blue-600 shrink-0" />
            <span className="text-xs font-bold text-slate-700">Kỳ thu:</span>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="text-xs font-bold bg-transparent border-0 focus:ring-0 outline-hidden cursor-pointer text-blue-700"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => (
                <option key={m} value={m}>
                  Tháng {m} {m === currentMonth && selectedYear === currentYear ? '(Hiện tại)' : ''}
                </option>
              ))}
            </select>
            <span className="text-slate-300">/</span>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="text-xs font-bold bg-transparent border-0 focus:ring-0 outline-hidden cursor-pointer text-slate-700"
            >
              {Array.from(new Set([2025, 2026, 2027, currentYear, currentYear + 1]))
                .sort((a, b) => a - b)
                .map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
            </select>
          </div>

          {/* Lớp học filter */}
          <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 shadow-2xs">
            <span className="text-xs font-bold text-slate-700">Lớp học:</span>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="text-xs font-bold bg-transparent border-0 focus:ring-0 outline-hidden cursor-pointer text-slate-800"
            >
              <option value="ALL">Tất cả lớp học</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
                </option>
              ))}
            </select>
          </div>

          {/* School filter */}
          <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 shadow-2xs">
            <span className="text-xs font-bold text-slate-700">Trường:</span>
            <select
              value={selectedSchool}
              onChange={(e) => setSelectedSchool(e.target.value)}
              className="text-xs font-bold bg-transparent border-0 focus:ring-0 outline-hidden cursor-pointer text-slate-800"
            >
              <option value="ALL">Tất cả trường học</option>
              {schools.map((s) => (
                <option key={s.id} value={s.code}>
                  {s.name} ({s.code})
                </option>
              ))}
            </select>
          </div>

          {/* Status filter */}
          <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 shadow-2xs">
            <span className="text-xs font-bold text-slate-700">Trạng thái:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="text-xs font-bold bg-transparent border-0 focus:ring-0 outline-hidden cursor-pointer text-slate-800"
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="unpaid">Chưa nộp (Unpaid)</option>
              <option value="paid">Đã nộp (Paid)</option>
              <option value="partial">Nộp một phần</option>
            </select>
          </div>

          {/* Reset filter button if any filter is active */}
          {(selectedClassId !== 'ALL' || selectedSchool !== 'ALL' || selectedStatus !== 'ALL' || searchTerm !== '') && (
            <button
              type="button"
              onClick={() => {
                setSelectedClassId('ALL');
                setSelectedSchool('ALL');
                setSelectedStatus('ALL');
                setSearchTerm('');
              }}
              className="text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline px-2 py-1 cursor-pointer"
              title="Đặt lại các bộ lọc"
            >
              ✕ Đặt lại lọc
            </button>
          )}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo tên học sinh, lớp, mã QR..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-hidden bg-slate-50/50"
          />
        </div>
      </div>

      {/* Tuition Table or Empty State */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredTuitions.length === 0 ? (
          <div className="p-12 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
              <CreditCard className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Chưa có dữ liệu bảng kê cho Tháng {selectedMonth}/{selectedYear}
                {selectedClassId !== 'ALL' ? ` (${classes.find((c) => c.id === selectedClassId)?.name})` : ''}
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                Không tìm thấy bảng kê học phí cho kỳ thu này {selectedClassId !== 'ALL' ? 'thuộc lớp đã chọn' : ''}. Bạn có thể nhấn nút dưới đây để hệ thống tự động tổng hợp số buổi học và tạo bảng kê.
              </p>
            </div>
            <button
              type="button"
              onClick={handleCalculateTuition}
              disabled={isCalculating}
              className="inline-flex items-center space-x-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>
                {isCalculating
                  ? 'Đang xử lý...'
                  : selectedClassId !== 'ALL'
                  ? `Tự động tính bảng kê ${classes.find((c) => c.id === selectedClassId)?.name || 'lớp này'} (T${selectedMonth}/${selectedYear})`
                  : `Tự động tính bảng kê Tháng ${selectedMonth}/${selectedYear}`}
              </span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-3 text-center w-12">STT</th>
                <th className="py-3 px-4">Học sinh</th>
                <th className="py-3 px-4">Trường & Khóa</th>
                <th className="py-3 px-4">Lớp học</th>
                <th className="py-3 px-4">Số buổi tính phí</th>
                <th className="py-3 px-4">Đơn giá / buổi</th>
                <th className="py-3 px-4">Thành tiền (VNĐ)</th>
                <th className="py-3 px-4">Mã VietQR Chuyển khoản</th>
                <th className="py-3 px-4">Trạng thái</th>
                <th className="py-3 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredTuitions.map((tui, idx) => (
                <tr key={`${tui.id}-${tui.classId || idx}`} className="hover:bg-blue-50/40 transition-colors">
                  <td className="py-3.5 px-3 text-center font-bold text-slate-400">
                    {idx + 1}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-slate-900 block">{tui.studentName}</span>
                    <span className="text-[11px] text-slate-400">
                      DOB: {tui.dob || `Năm ${tui.birthYear}`}
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="font-bold text-slate-800">{tui.schoolCode}</span>
                    <span className="text-[11px] text-slate-400 block">
                      Khóa K{String(tui.birthYear).slice(-2)}
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="text-slate-800 font-semibold">{tui.className}</span>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-800 font-bold text-xs">
                      {tui.sessionCount} buổi
                    </span>
                  </td>

                  <td className="py-3.5 px-4 font-mono text-slate-600">
                    {formatVND(tui.feePerSession)}
                  </td>

                  <td className="py-3.5 px-4 font-bold text-blue-700 text-sm">
                    {formatVND(tui.totalAmount)}
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="font-mono font-black text-amber-700 bg-amber-50 px-2 py-1 rounded-lg border border-amber-200 text-xs select-all">
                      {tui.paymentReference}
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-bold inline-flex items-center space-x-1 ${
                        tui.status === 'paid'
                          ? 'bg-emerald-100 text-emerald-800'
                          : tui.status === 'unpaid'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {tui.status === 'paid' ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Đã nộp</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>Chưa nộp</span>
                        </>
                      )}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right space-x-1.5">
                    <button
                      type="button"
                      onClick={() => setSelectedTuitionForQR(tui)}
                      className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs transition-colors"
                      title="Mở mã QR nộp học phí"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      <span>VietQR</span>
                    </button>

                    {tui.status !== 'paid' ? (
                      <button
                        type="button"
                        onClick={() => updateTuitionStatus(tui.id, 'paid')}
                        className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs transition-colors"
                        title="Đánh dấu đã nộp học phí"
                      >
                        <CheckCheck className="w-3.5 h-3.5" />
                        <span>Đã nộp</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => updateTuitionStatus(tui.id, 'unpaid')}
                        className="p-1.5 text-slate-400 hover:text-amber-600 rounded-lg"
                        title="Hoàn tác về chưa nộp"
                      >
                        ✕
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )}
      </div>

      {/* QR Modal */}
      {selectedTuitionForQR && (
        <VietQRModal
          tuition={selectedTuitionForQR}
          onClose={() => setSelectedTuitionForQR(null)}
        />
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 max-w-sm w-full bg-slate-900 text-white p-4 rounded-2xl shadow-2xl border border-slate-700 flex items-start space-x-3 animate-in fade-in slide-in-from-bottom-5 duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="flex-1 text-xs">
            <h5 className="font-bold text-white text-sm">{toastMessage.title}</h5>
            <p className="text-slate-300 mt-0.5 leading-relaxed">{toastMessage.desc}</p>
          </div>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white p-1 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
};
