import React, { useState, useEffect, useMemo } from 'react';
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
  FileText,
  Clock,
  Banknote,
  Building2,
  Bell,
  MessageSquare,
  Mail,
  Send,
} from 'lucide-react';
import { VietQRModal } from './VietQRModal';
import { TuitionPdfExportModal } from './TuitionPdfExportModal';
import { TuitionReminderModal } from './TuitionReminderModal';

export interface TuitionPageProps {
  initialMonth?: number;
  initialYear?: number;
  initialSchool?: string;
  initialClassId?: string;
  initialStatus?: string;
  onNavigate?: (tab: string, params?: any) => void;
}

export const TuitionPage: React.FC<TuitionPageProps> = ({
  initialMonth,
  initialYear,
  initialSchool,
  initialClassId,
  initialStatus,
  onNavigate,
}) => {
  const {
    tuitionItems,
    attendance,
    calculateTuitionForMonth,
    updateTuitionStatus,
    paymentAccount,
    schools,
    classes,
    currentTenant,
  } = useApp();

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  // Find most frequent or relevant period for this tenant if not current month
  const mostRelevantPeriod = useMemo(() => {
    const tenantItems = tuitionItems.filter((t) => t.tenant_id === currentTenant?.id);
    if (tenantItems.length === 0) return { month: currentMonth, year: currentYear };
    const periodCounts = new Map<string, { month: number; year: number; count: number }>();
    tenantItems.forEach((t) => {
      const key = `${t.periodMonth}-${t.periodYear}`;
      const existing = periodCounts.get(key) || { month: t.periodMonth, year: t.periodYear, count: 0 };
      existing.count += 1;
      periodCounts.set(key, existing);
    });
    const curKey = `${currentMonth}-${currentYear}`;
    if (periodCounts.has(curKey)) {
      return { month: currentMonth, year: currentYear };
    }
    let best = { month: currentMonth, year: currentYear, count: 0 };
    periodCounts.forEach((val) => {
      if (val.count > best.count) {
        best = val;
      }
    });
    return { month: best.month, year: best.year };
  }, [tuitionItems, currentTenant?.id, currentMonth, currentYear]);

  // Pick month & year with priority: props -> sessionStorage -> most relevant period
  const defaultMonth =
    initialMonth ??
    (() => {
      try {
        const saved = sessionStorage.getItem(`edututor_tuition_month_${currentTenant?.id}`);
        if (saved && !isNaN(Number(saved))) return Number(saved);
      } catch {}
      return mostRelevantPeriod.month;
    })();

  const defaultYear =
    initialYear ??
    (() => {
      try {
        const saved = sessionStorage.getItem(`edututor_tuition_year_${currentTenant?.id}`);
        if (saved && !isNaN(Number(saved))) return Number(saved);
      } catch {}
      return mostRelevantPeriod.year;
    })();

  const defaultSchool =
    initialSchool ??
    (() => {
      try {
        const saved = sessionStorage.getItem(`edututor_tuition_school_${currentTenant?.id}`);
        if (saved) return saved;
      } catch {}
      return 'ALL';
    })();

  const defaultClassId =
    initialClassId ??
    (() => {
      try {
        const saved = sessionStorage.getItem(`edututor_tuition_class_${currentTenant?.id}`);
        if (saved) return saved;
      } catch {}
      return 'ALL';
    })();

  const [selectedMonth, setSelectedMonth] = useState<number>(defaultMonth);
  const [selectedYear, setSelectedYear] = useState<number>(defaultYear);
  const [selectedSchool, setSelectedSchool] = useState<string>(defaultSchool);
  const [selectedClassId, setSelectedClassId] = useState<string>(defaultClassId);
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

  // Persist current selection so navigating away and returning preserves the exact state without jumping
  useEffect(() => {
    try {
      if (currentTenant?.id) {
        sessionStorage.setItem(`edututor_tuition_month_${currentTenant.id}`, String(selectedMonth));
        sessionStorage.setItem(`edututor_tuition_year_${currentTenant.id}`, String(selectedYear));
        sessionStorage.setItem(`edututor_tuition_school_${currentTenant.id}`, selectedSchool);
        sessionStorage.setItem(`edututor_tuition_class_${currentTenant.id}`, selectedClassId);
      }
    } catch {}
  }, [currentTenant?.id, selectedMonth, selectedYear, selectedSchool, selectedClassId]);

  // Auto-reset selectedClassId ONLY when classes have finished loading and the class doesn't belong to current tenant
  useEffect(() => {
    if (classes.length > 0 && selectedClassId !== 'ALL' && !classes.some((c) => c.id === selectedClassId)) {
      setSelectedClassId('ALL');
    }
  }, [classes, selectedClassId]);

  // Restore saved class from sessionStorage once classes finish loading if currently 'ALL' and not set via initialClassId prop
  useEffect(() => {
    if (classes.length > 0 && selectedClassId === 'ALL' && !initialClassId) {
      try {
        const saved = sessionStorage.getItem(`edututor_tuition_class_${currentTenant?.id}`);
        if (saved && saved !== 'ALL' && classes.some((c) => c.id === saved)) {
          setSelectedClassId(saved);
        }
      } catch {}
    }
  }, [classes, currentTenant?.id, initialClassId]);

  // Auto-synchronize tuition with actual attendance records on load and when period or class changes
  useEffect(() => {
    if (calculateTuitionForMonth && classes.length > 0) {
      calculateTuitionForMonth(
        selectedMonth,
        selectedYear,
        selectedClassId !== 'ALL' ? selectedClassId : undefined
      );
    }
  }, [selectedMonth, selectedYear, selectedClassId, currentTenant?.id, classes.length, attendance.length]);

  const [selectedTuitionForQR, setSelectedTuitionForQR] = useState<TuitionItem | null>(null);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState<boolean>(false);
  const [isReminderModalOpen, setIsReminderModalOpen] = useState<boolean>(false);
  const [reminderStudentId, setReminderStudentId] = useState<string | undefined>(undefined);

  const currentTenantClassIds = new Set(classes.map((c) => c.id));

  // 1. Scoped tuitions: Fixed set of tuitions for selected month/year/school/class where sessionCount > 0
  // Card metrics (Doanh thu dự kiến, Đã thu, Chưa nộp) are strictly computed from scopedTuitions
  // so they DO NOT change when the user selects different status filters (Chưa nộp, Đã nộp, Nộp một phần)
  const scopedTuitions = tuitionItems.filter((t) => {
    // 1. Strict Tenant Isolation
    if (!currentTenant?.id || t.tenant_id !== currentTenant.id) return false;

    // 2. Strict Class Isolation
    if (currentTenantClassIds.size > 0 && (!t.classId || !currentTenantClassIds.has(t.classId))) return false;

    // 3. Month & Year
    if (t.periodMonth !== selectedMonth || t.periodYear !== selectedYear) return false;

    // 4. School filter
    if (selectedSchool !== 'ALL' && t.schoolCode !== selectedSchool) return false;

    // 5. Class filter
    if (selectedClassId !== 'ALL' && t.classId !== selectedClassId) return false;

    // 6. Only list students with fee-eligible sessionCount > 0
    if ((t.sessionCount || 0) <= 0) return false;

    return true;
  });

  // Helper to determine payment method:
  // - 'qr' if marked via automated reconciliation (or bankTransactionId)
  // - 'cash' if marked manually
  const getTuitionPaymentMethod = (t: TuitionItem): 'qr' | 'cash' | null => {
    if (t.status !== 'paid' && t.status !== 'partial') return null;
    if (t.paymentMethod === 'qr') return 'qr';
    if (t.paymentMethod === 'cash') return 'cash';
    // Fallback: If bankTransactionId exists, it was reconciled from bank statement
    if (t.bankTransactionId) return 'qr';
    // Default for manual marking
    return 'cash';
  };

  // Fixed Card KPIs based strictly on school/class/month/year scope:
  const totalExpected = scopedTuitions.reduce((acc, cur) => acc + cur.totalAmount, 0);
  const paidTuitions = scopedTuitions.filter((t) => t.status === 'paid');

  // Tách Card Đã thu tiền thành 2:
  // 1. Thu qua ngân hàng (Quét QR sao kê)
  const bankPaidTuitions = scopedTuitions.filter(
    (t) => getTuitionPaymentMethod(t) === 'qr' && (t.status === 'paid' || (t.paidAmount || 0) > 0)
  );
  const bankCollected = bankPaidTuitions.reduce(
    (acc, cur) => acc + (cur.status === 'paid' ? (cur.paidAmount || cur.totalAmount) : (cur.paidAmount || 0)),
    0
  );
  const bankPaidCount = bankPaidTuitions.length;

  // 2. Thu Tiền mặt (Thủ công)
  const cashPaidTuitions = scopedTuitions.filter(
    (t) => getTuitionPaymentMethod(t) === 'cash' && (t.status === 'paid' || (t.paidAmount || 0) > 0)
  );
  const cashCollected = cashPaidTuitions.reduce(
    (acc, cur) => acc + (cur.status === 'paid' ? (cur.paidAmount || cur.totalAmount) : (cur.paidAmount || 0)),
    0
  );
  const cashPaidCount = cashPaidTuitions.length;

  const totalCollected = bankCollected + cashCollected;
  const unpaidTuitions = scopedTuitions.filter((t) => t.status !== 'paid');
  const totalUnpaid = Math.max(0, totalExpected - totalCollected);
  const unpaidCount = new Set(unpaidTuitions.map((t) => t.studentId)).size;
  const scopedStudentsCount = new Set(scopedTuitions.map((t) => t.studentId)).size;

  // 2. Filtered tuitions for the Table / List: applies selectedStatus & searchTerm
  const filteredTuitions = scopedTuitions.filter((t) => {
    // Trạng thái & Hình thức nộp filter
    const method = getTuitionPaymentMethod(t);
    const matchesStatus =
      selectedStatus === 'ALL'
        ? true
        : selectedStatus === 'unpaid'
        ? t.status !== 'paid' && t.status !== 'partial'
        : selectedStatus === 'paid'
        ? t.status === 'paid'
        : selectedStatus === 'paid_qr'
        ? t.status === 'paid' && method === 'qr'
        : selectedStatus === 'paid_cash'
        ? t.status === 'paid' && method === 'cash'
        : selectedStatus === 'partial'
        ? t.status === 'partial'
        : t.status === selectedStatus;

    if (!matchesStatus) return false;

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchesSearch =
        (t.studentName || '').toLowerCase().includes(q) ||
        (t.paymentReference || '').toLowerCase().includes(q) ||
        (t.className || '').toLowerCase().includes(q) ||
        (t.schoolCode || '').toLowerCase().includes(q) ||
        (method === 'qr' && 'quét qr ngân hàng'.includes(q)) ||
        (method === 'cash' && 'tiền mặt thủ công'.includes(q));
      if (!matchesSearch) return false;
    }

    return true;
  });

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
    const headers = 'STT,Họ tên,Mã trường,Khóa,Lớp,Số buổi,Đơn giá/buổi,Thành tiền,Mã VietQR,Trạng thái,Hình thức Nộp\n';
    const rows = filteredTuitions
      .map(
        (t, idx) => {
          const method = getTuitionPaymentMethod(t);
          const methodStr = method === 'qr' ? 'Quét QR' : method === 'cash' ? 'Tiền mặt' : '';
          return `${idx + 1},"${t.studentName}","${t.schoolCode}","K${String(t.birthYear).slice(-2)}","${t.className}",${t.sessionCount},${t.feePerSession},${t.totalAmount},"${t.paymentReference}","${t.status === 'paid' ? 'Đã nộp' : t.status === 'partial' ? 'Nộp một phần' : 'Chưa nộp'}","${methodStr}"`;
        }
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
            onClick={() => setIsPdfModalOpen(true)}
            className="inline-flex items-center space-x-1.5 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer active:scale-98"
            title="Tạo và tải file thông báo học phí theo lớp học dạng PDF"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>
              {selectedClassId !== 'ALL'
                ? `Xuất PDF Thu Tiền (${classes.find((c) => c.id === selectedClassId)?.name || 'Lớp'})`
                : 'Xuất PDF Thu Tiền Theo Lớp'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setReminderStudentId(undefined);
              setIsReminderModalOpen(true);
            }}
            className="inline-flex items-center space-x-1.5 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer active:scale-98"
            title={`Gửi thông báo nhắc nhở đóng học phí qua Zalo / Email cho ${unpaidCount} học sinh chưa nộp`}
          >
            <Bell className="w-3.5 h-3.5" />
            <span>Nhắc Phí Tự Động (Zalo/Email)</span>
            {unpaidCount > 0 && (
              <span className="ml-1 px-1.5 py-0.5 rounded-full bg-white text-amber-800 text-[10px] font-black">
                {unpaidCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center space-x-1.5 px-4 py-2.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Xuất Excel/CSV</span>
          </button>

          {onNavigate && (
            <button
              id="navigate-to-reconciliation-btn"
              type="button"
              onClick={() => onNavigate('reconciliation', { month: selectedMonth, year: selectedYear })}
              className="inline-flex items-center space-x-1.5 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer active:scale-98"
              title={`Chuyển sang trang Đối soát sao kê ngân hàng Tháng ${selectedMonth}/${selectedYear}`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Đối soát sao kê T{selectedMonth}</span>
            </button>
          )}
        </div>
      </div>

      {/* Summary KPI Banner: 4 Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Tổng doanh thu dự kiến */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              {selectedClassId !== 'ALL'
                ? `Doanh thu dự kiến - ${classes.find((c) => c.id === selectedClassId)?.name || 'Lớp'}`
                : `Tổng doanh thu dự kiến (T${selectedMonth})`}
            </span>
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{formatVND(totalExpected)}</p>
          <div className="flex items-center justify-between mt-1 text-[11px] text-slate-500">
            <span>
              {scopedStudentsCount} học sinh có số buổi tính phí &gt; 0
            </span>
            {selectedClassId !== 'ALL' && (
              <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-bold text-[10px]">
                {classes.find((c) => c.id === selectedClassId)?.name}
              </span>
            )}
          </div>
        </div>

        {/* Card 2: Thu qua ngân hàng (Quét QR sao kê) */}
        <div className="bg-white p-5 rounded-2xl border border-indigo-100 bg-gradient-to-br from-white to-indigo-50/30 shadow-2xs hover:border-indigo-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-950">Thu qua ngân hàng</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <QrCode className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-indigo-600 mt-2">{formatVND(bankCollected)}</p>
          <div className="flex items-center justify-between mt-1">
            <span className="text-[11px] text-indigo-700 font-semibold">
              {bankPaidCount} học sinh
            </span>
            <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-[10px] font-bold">
              Quét QR
            </span>
          </div>
        </div>

        {/* Card 3: Thu Tiền mặt (Thủ công) */}
        <div className="bg-white p-5 rounded-2xl border border-emerald-100 bg-gradient-to-br from-white to-emerald-50/30 shadow-2xs hover:border-emerald-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-950">Thu Tiền mặt</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Banknote className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-600 mt-2">{formatVND(cashCollected)}</p>
          <div className="flex items-center justify-between mt-1">
            <span className="text-[11px] text-emerald-700 font-semibold">
              {cashPaidCount} học sinh
            </span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
              Tiền mặt
            </span>
          </div>
        </div>

        {/* Card 4: Chưa nộp học phí */}
        <div className="bg-white p-5 rounded-2xl border border-amber-100 bg-gradient-to-br from-white to-amber-50/30 shadow-2xs hover:border-amber-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-950">Chưa nộp học phí</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-amber-600 mt-2">{formatVND(totalUnpaid)}</p>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-amber-100">
            <span className="text-[11px] text-amber-700 font-semibold">
              {unpaidCount} học sinh cần thu
            </span>
            {unpaidCount > 0 && (
              <button
                type="button"
                onClick={() => {
                  setReminderStudentId(undefined);
                  setIsReminderModalOpen(true);
                }}
                className="inline-flex items-center space-x-1 px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-[11px] font-bold transition-all shadow-xs cursor-pointer active:scale-95"
                title="Gửi thông báo nhắc đóng học phí qua Zalo / Email"
              >
                <Bell className="w-3 h-3" />
                <span>Nhắc Zalo/Mail</span>
              </button>
            )}
          </div>
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

          {/* Status & Payment Method filter */}
          <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 shadow-2xs">
            <span className="text-xs font-bold text-slate-700">Trạng thái:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="text-xs font-bold bg-transparent border-0 focus:ring-0 outline-hidden cursor-pointer text-slate-800"
            >
              <option value="ALL">Tất cả trạng thái & hình thức</option>
              <option value="unpaid">Chưa nộp ({unpaidCount})</option>
              <option value="paid">Đã nộp: Tất cả ({paidTuitions.length})</option>
              <option value="paid_qr">Đã nộp: Quét QR ({bankPaidCount})</option>
              <option value="paid_cash">Đã nộp: Tiền mặt ({cashPaidCount})</option>
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
        {/* Table Top Header Bar with Dynamic Total Count */}
        <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Danh sách học sinh tính phí Tháng {selectedMonth}/{selectedYear}
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-600 text-white text-xs font-black shadow-2xs">
              Tổng số: {filteredTuitions.length} học sinh
            </span>
            {selectedStatus !== 'ALL' && (
              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold">
                Lọc: {selectedStatus === 'unpaid' ? 'Chưa nộp' : selectedStatus === 'paid' ? 'Đã nộp (Tất cả)' : selectedStatus === 'paid_qr' ? 'Đã nộp: Quét QR' : selectedStatus === 'paid_cash' ? 'Đã nộp: Tiền mặt' : 'Nộp một phần'}
              </span>
            )}
            {selectedClassId !== 'ALL' && (
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                {classes.find((c) => c.id === selectedClassId)?.name}
              </span>
            )}
            {selectedSchool !== 'ALL' && (
              <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[11px] font-bold">
                Trường: {selectedSchool}
              </span>
            )}
          </div>

          <div className="text-xs text-slate-500 font-medium">
            {scopedTuitions.length !== filteredTuitions.length ? (
              <span>
                Hiển thị <strong className="text-slate-800">{filteredTuitions.length}</strong> / {scopedTuitions.length} học sinh theo bộ lọc
              </span>
            ) : (
              <span>Toàn bộ {scopedTuitions.length} học sinh tính phí</span>
            )}
          </div>
        </div>

        {filteredTuitions.length === 0 ? (
          scopedTuitions.length === 0 ? (
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
                  Không tìm thấy học sinh nào có số buổi tính phí &gt; 0 trong kỳ thu này {selectedClassId !== 'ALL' ? 'thuộc lớp đã chọn' : ''}. Bạn có thể nhấn nút dưới đây để hệ thống tự động tổng hợp số buổi học và tạo bảng kê.
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
            <div className="p-10 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                <Filter className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-800">
                Không tìm thấy học sinh nào phù hợp bộ lọc
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Không có học sinh nào thỏa mãn trạng thái "{selectedStatus === 'unpaid' ? 'Chưa nộp' : selectedStatus === 'paid' ? 'Đã nộp' : selectedStatus}" hoặc từ khóa tìm kiếm.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSelectedStatus('ALL');
                  setSearchTerm('');
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                ✕ Đặt lại bộ lọc trạng thái (Hiện {scopedTuitions.length} học sinh)
              </button>
            </div>
          )
        ) : (
          <>
            {/* Desktop Table View (>= 768px) */}
            <div className="hidden md:block overflow-x-auto">
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
                <th className="py-3 px-4">Hình thức Nộp</th>
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
                      Năm sinh: {tui.birthYear || '---'}
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
                          : tui.status === 'partial'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {tui.status === 'paid' ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Đã nộp</span>
                        </>
                      ) : tui.status === 'partial' ? (
                        <>
                          <Clock className="w-3.5 h-3.5" />
                          <span>Nộp một phần</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>Chưa nộp</span>
                        </>
                      )}
                    </span>
                  </td>

                  {/* Cột: Hình thức Nộp */}
                  <td className="py-3.5 px-4">
                    {(() => {
                      const method = getTuitionPaymentMethod(tui);
                      if (tui.status === 'paid') {
                        if (method === 'qr') {
                          return (
                            <span className="px-2.5 py-1 rounded-full text-xs font-bold inline-flex items-center space-x-1.5 bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-2xs">
                              <QrCode className="w-3.5 h-3.5 text-indigo-600" />
                              <span>Quét QR</span>
                            </span>
                          );
                        }
                        return (
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold inline-flex items-center space-x-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
                            <Banknote className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Tiền mặt</span>
                          </span>
                        );
                      }
                      return <span className="text-slate-400 text-xs italic">—</span>;
                    })()}
                  </td>

                  <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => setSelectedTuitionForQR(tui)}
                      className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs transition-colors cursor-pointer"
                      title="Mở mã QR nộp học phí"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      <span>VietQR</span>
                    </button>

                    {tui.status !== 'paid' ? (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            setReminderStudentId(tui.studentId);
                            setIsReminderModalOpen(true);
                          }}
                          className={`inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-xl font-bold text-xs transition-colors cursor-pointer ${
                            tui.lastReminderSentAt
                              ? 'bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300'
                              : 'bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200'
                          }`}
                          title={
                            tui.lastReminderSentAt
                              ? `Đã gửi nhắc lúc: ${tui.lastReminderSentAt}. Bấm để mở gửi lại qua Zalo/Email`
                              : 'Gửi thông báo nhắc học phí qua Zalo hoặc Email'
                          }
                        >
                          <Bell className="w-3.5 h-3.5" />
                          <span>{tui.lastReminderSentAt ? 'Đã nhắc' : 'Nhắc phí'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => updateTuitionStatus(tui.id, 'paid', undefined, 'cash')}
                          className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs transition-colors cursor-pointer"
                          title="Đánh dấu đã nộp học phí bằng tiền mặt (thủ công)"
                        >
                          <CheckCheck className="w-3.5 h-3.5" />
                          <span>Thu tiền mặt</span>
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => updateTuitionStatus(tui.id, 'unpaid')}
                        className="inline-flex items-center space-x-1 px-2.5 py-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-colors cursor-pointer"
                        title="Hoàn tác về chưa nộp"
                      >
                        <span>✕ Hoàn tác</span>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View (< 768px) */}
        <div className="block md:hidden divide-y divide-slate-100">
          {filteredTuitions.map((tui, idx) => (
            <div key={`m-${tui.id}-${idx}`} className="p-4 space-y-3 bg-white">
              {/* Header: Student Name, Class & Status */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-slate-400">#{idx + 1}</span>
                    <h4 className="text-sm font-bold text-slate-900">{tui.studentName}</h4>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {tui.className} • {tui.schoolCode} (K{String(tui.birthYear).slice(-2)})
                  </p>
                </div>

                <span
                  className={`px-2.5 py-1 rounded-full text-[11px] font-bold shrink-0 flex items-center space-x-1 ${
                    tui.status === 'paid'
                      ? 'bg-emerald-100 text-emerald-800'
                      : tui.status === 'partial'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {tui.status === 'paid' ? (
                    <>
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Đã nộp</span>
                    </>
                  ) : tui.status === 'partial' ? (
                    <>
                      <Clock className="w-3 h-3" />
                      <span>Nộp 1 phần</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-3 h-3" />
                      <span>Chưa nộp</span>
                    </>
                  )}
                </span>
              </div>

              {/* Fee Breakdown Box */}
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-600">
                  <span>Số buổi học:</span>
                  <span className="font-bold text-slate-800">{tui.sessionCount} buổi × {formatVND(tui.feePerSession)}</span>
                </div>
                <div className="flex items-center justify-between pt-1.5 border-t border-slate-200/60">
                  <span className="font-bold text-slate-700">Tổng tiền:</span>
                  <span className="text-base font-black text-blue-700">{formatVND(tui.totalAmount)}</span>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                  <span className="text-slate-500 text-[11px]">Mã CK:</span>
                  <span className="font-mono font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 text-xs">
                    {tui.paymentReference}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                  <span className="text-slate-500 text-[11px]">Hình thức Nộp:</span>
                  {tui.status === 'paid' ? (
                    getTuitionPaymentMethod(tui) === 'qr' ? (
                      <span className="inline-flex items-center space-x-1 text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">
                        <QrCode className="w-3 h-3 text-indigo-600" />
                        <span>Quét QR</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center space-x-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                        <Banknote className="w-3 h-3 text-emerald-600" />
                        <span>Tiền mặt</span>
                      </span>
                    )
                  ) : (
                    <span className="text-slate-400 text-xs italic">—</span>
                  )}
                </div>
              </div>

              {/* Mobile Action Buttons */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setSelectedTuitionForQR(tui)}
                  className="flex-1 min-h-[44px] rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center space-x-1.5 border border-blue-200 active:scale-98 transition-all cursor-pointer"
                >
                  <QrCode className="w-4 h-4" />
                  <span>VietQR</span>
                </button>

                {tui.status !== 'paid' ? (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setReminderStudentId(tui.studentId);
                        setIsReminderModalOpen(true);
                      }}
                      className="min-h-[44px] px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center justify-center space-x-1 shadow-xs active:scale-98 transition-all cursor-pointer"
                      title="Nhắc phí qua Zalo/Email"
                    >
                      <Bell className="w-3.5 h-3.5" />
                      <span>Nhắc phí</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => updateTuitionStatus(tui.id, 'paid', undefined, 'cash')}
                      className="flex-1 min-h-[44px] rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center space-x-1.5 shadow-xs active:scale-98 transition-all cursor-pointer"
                    >
                      <CheckCheck className="w-4 h-4" />
                      <span>Thu tiền mặt</span>
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => updateTuitionStatus(tui.id, 'unpaid')}
                    className="flex-1 min-h-[44px] rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center justify-center active:scale-98 transition-all cursor-pointer"
                  >
                    <span>Hoàn tác nộp</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
        </>
        )}
      </div>

      {/* QR Modal */}
      {selectedTuitionForQR && (
        <VietQRModal
          tuition={selectedTuitionForQR}
          onClose={() => setSelectedTuitionForQR(null)}
        />
      )}

      {/* PDF Export Modal */}
      <TuitionPdfExportModal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        initialClassId={selectedClassId}
      />

      {/* Tuition Reminder Modal (Zalo / Email) */}
      <TuitionReminderModal
        isOpen={isReminderModalOpen}
        onClose={() => {
          setIsReminderModalOpen(false);
          setReminderStudentId(undefined);
        }}
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        initialClassId={selectedClassId}
        initialStudentId={reminderStudentId}
      />

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
