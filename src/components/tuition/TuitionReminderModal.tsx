import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { TuitionItem, Student, ClassRoom } from '../../types';
import {
  X,
  Bell,
  Send,
  Mail,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  Copy,
  ExternalLink,
  Search,
  Filter,
  Check,
  Calendar,
  CreditCard,
  User,
  Phone,
  Sparkles,
  Layers,
  ArrowRight,
  ChevronRight,
  QrCode,
} from 'lucide-react';
import { VietQRModal } from './VietQRModal';

interface TuitionReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedMonth: number;
  selectedYear: number;
  initialClassId?: string;
  initialStudentId?: string;
}

type ReminderChannel = 'zalo' | 'email' | 'both';
type FilterStatus = 'all' | 'unreminded' | 'reminded';

export const TuitionReminderModal: React.FC<TuitionReminderModalProps> = ({
  isOpen,
  onClose,
  selectedMonth,
  selectedYear,
  initialClassId,
  initialStudentId,
}) => {
  const {
    tuitionItems,
    students,
    classes,
    paymentAccount,
    currentTenant,
    recordTuitionReminder,
  } = useApp();

  const [channel, setChannel] = useState<ReminderChannel>('zalo');
  const [filterClassId, setFilterClassId] = useState<string>(() => {
    return initialClassId && initialClassId !== 'ALL' ? initialClassId : 'ALL';
  });
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTuitionIds, setSelectedTuitionIds] = useState<Set<string>>(new Set());

  // Message template customization
  const [teacherSender, setTeacherSender] = useState<string>(() => {
    return currentTenant?.teacherName ? `Cô/Thầy ${currentTenant.teacherName}` : 'Cô giáo / Thầy giáo';
  });
  const [dueDate, setDueDate] = useState<string>(() => {
    // Default due date: 15th of the selected month or current month
    const mStr = String(selectedMonth).padStart(2, '0');
    return `15/${mStr}/${selectedYear}`;
  });
  const [customNote, setCustomNote] = useState<string>('');

  // Active preview item
  const [previewTuitionId, setPreviewTuitionId] = useState<string | null>(null);

  // VietQR modal for viewing QR
  const [qrModalTuition, setQrModalTuition] = useState<TuitionItem | null>(null);

  // Feedback toast / alert
  const [feedback, setFeedback] = useState<{ type: 'success' | 'info' | 'error'; message: string } | null>(null);

  // Batch queue progress state
  const [isBatchRunning, setIsBatchRunning] = useState<boolean>(false);
  const [batchIndex, setBatchIndex] = useState<number>(0);

  // 1. Gather all unpaid/partial tuition items for selected month & year
  const unpaidTuitions = useMemo(() => {
    return tuitionItems.filter((t) => {
      const matchPeriod = t.periodMonth === selectedMonth && t.periodYear === selectedYear;
      const isUnpaid = t.status !== 'paid';
      const matchTenant = !t.tenant_id || t.tenant_id === currentTenant.id;
      return matchPeriod && isUnpaid && matchTenant;
    });
  }, [tuitionItems, selectedMonth, selectedYear, currentTenant.id]);

  // 2. Filtered list for display & selection
  const filteredTuitions = useMemo(() => {
    return unpaidTuitions.filter((t) => {
      if (filterClassId !== 'ALL' && t.classId !== filterClassId) {
        return false;
      }
      if (filterStatus === 'unreminded' && t.lastReminderSentAt) {
        return false;
      }
      if (filterStatus === 'reminded' && !t.lastReminderSentAt) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const student = students.find((s) => s.id === t.studentId);
        const nameMatch = (t.studentName || '').toLowerCase().includes(q);
        const codeMatch = (t.paymentReference || '').toLowerCase().includes(q);
        const classMatch = (t.className || '').toLowerCase().includes(q);
        const parentMatch = (student?.parentName || '').toLowerCase().includes(q);
        const phoneMatch = (student?.parentPhone || '').includes(q);
        if (!nameMatch && !codeMatch && !classMatch && !parentMatch && !phoneMatch) {
          return false;
        }
      }
      return true;
    });
  }, [unpaidTuitions, filterClassId, filterStatus, searchQuery, students]);

  // Initial selection setup
  React.useEffect(() => {
    if (initialStudentId) {
      const target = unpaidTuitions.find((t) => t.studentId === initialStudentId);
      if (target) {
        setSelectedTuitionIds(new Set([target.id]));
        setPreviewTuitionId(target.id);
        return;
      }
    }
    // Default select all in filtered list
    setSelectedTuitionIds(new Set(filteredTuitions.map((t) => t.id)));
    if (filteredTuitions.length > 0 && !previewTuitionId) {
      setPreviewTuitionId(filteredTuitions[0].id);
    }
  }, [unpaidTuitions, initialStudentId]);

  if (!isOpen) return null;

  // Toggle individual selection
  const handleToggleSelect = (id: string) => {
    setSelectedTuitionIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
    setPreviewTuitionId(id);
  };

  // Toggle all
  const handleToggleSelectAll = () => {
    if (selectedTuitionIds.size === filteredTuitions.length) {
      setSelectedTuitionIds(new Set());
    } else {
      setSelectedTuitionIds(new Set(filteredTuitions.map((t) => t.id)));
    }
  };

  // Helper to get student info
  const getStudentInfo = (tuition: TuitionItem): {
    student: Student | undefined;
    parentName: string;
    parentPhone: string;
    parentEmail: string;
    cleanPhone: string;
  } => {
    const student = students.find((s) => s.id === tuition.studentId);
    const parentName = student?.parentName || 'Quý Phụ Huynh';
    const parentPhone = student?.parentPhone || '';
    const parentEmail = student?.parentEmail || '';
    const cleanPhone = parentPhone.replace(/\D/g, '');
    return { student, parentName, parentPhone, parentEmail, cleanPhone };
  };

  // Build personalized message content
  const buildReminderMessage = (tuition: TuitionItem) => {
    const { parentName } = getStudentInfo(tuition);
    const bankName = paymentAccount?.bankName || 'Vietcombank';
    const accountNumber = paymentAccount?.accountNumber || '1018999988';
    const accountName = paymentAccount?.accountName || (currentTenant?.teacherName || 'GIAO VIEN').toUpperCase();
    const dueAmount = tuition.totalAmount - (tuition.paidAmount || 0);

    const lines = [
      `[THÔNG BÁO NHẮC HỌC PHÍ THÁNG ${selectedMonth}/${selectedYear}]`,
      `Kính gửi: ${parentName} (Phụ huynh học sinh ${tuition.studentName})`,
      `Lớp: ${tuition.className} (${tuition.schoolCode})`,
      ``,
      `${teacherSender} xin gửi thông báo học phí tháng ${selectedMonth}/${selectedYear}:`,
      `• Số buổi học thực tế: ${tuition.sessionCount} buổi`,
      `• Đơn giá: ${tuition.feePerSession.toLocaleString('vi-VN')} đ/buổi`,
      `• Tổng học phí cần đóng: ${dueAmount.toLocaleString('vi-VN')} VNĐ`,
      dueDate ? `• Hạn hoàn thành: ${dueDate}` : '',
      customNote ? `• Lưu ý: ${customNote}` : '',
      ``,
      `THÔNG TIN CHUYỂN KHOẢN:`,
      `• Ngân hàng: ${bankName}`,
      `• Số tài khoản: ${accountNumber}`,
      `• Chủ tài khoản: ${accountName}`,
      `• Nội dung chuyển khoản: ${tuition.paymentReference}`,
      ``,
      `Quý phụ huynh cũng có thể quét mã VietQR trên phiếu báo học phí để thông tin và số tiền được điền tự động chính xác.`,
      `Kính mong Quý phụ huynh hỗ trợ hoàn tất học phí đúng hạn.`,
      `Trân trọng cảm ơn Quý phụ huynh!`,
    ].filter(Boolean);

    return lines.join('\n');
  };

  // Build email subject & body
  const buildEmailContent = (tuition: TuitionItem) => {
    const subject = `[EduTutor] Thông Báo Học Phí Tháng ${selectedMonth}/${selectedYear} - Học sinh ${tuition.studentName}`;
    const body = buildReminderMessage(tuition);
    return { subject, body };
  };

  // 1-Click Send Zalo for single student
  const handleSendSingleZalo = (tuition: TuitionItem) => {
    const { parentPhone, cleanPhone } = getStudentInfo(tuition);
    if (!cleanPhone) {
      setFeedback({
        type: 'error',
        message: `Học sinh "${tuition.studentName}" chưa có số điện thoại phụ huynh để gửi Zalo!`,
      });
      return;
    }

    const message = buildReminderMessage(tuition);
    navigator.clipboard.writeText(message);

    // Record reminder sent
    recordTuitionReminder([tuition.id], 'zalo');

    setFeedback({
      type: 'success',
      message: `Đã sao chép nội dung nhắc phí của "${tuition.studentName}" vào bộ nhớ tạm! Đang mở ứng dụng Zalo...`,
    });

    // Open Zalo chat
    window.open(`https://zalo.me/${cleanPhone}`, '_blank');
  };

  // 1-Click Send Email for single student
  const handleSendSingleEmail = (tuition: TuitionItem) => {
    const { parentEmail } = getStudentInfo(tuition);
    if (!parentEmail) {
      setFeedback({
        type: 'error',
        message: `Học sinh "${tuition.studentName}" chưa có địa chỉ Email phụ huynh!`,
      });
      return;
    }

    const { subject, body } = buildEmailContent(tuition);

    // Record reminder sent
    recordTuitionReminder([tuition.id], 'email');

    setFeedback({
      type: 'success',
      message: `Đang mở ứng dụng gửi Email cho phụ huynh học sinh "${tuition.studentName}"...`,
    });

    window.location.href = `mailto:${parentEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  // Copy message to clipboard
  const handleCopyMessage = (tuition: TuitionItem) => {
    const message = buildReminderMessage(tuition);
    navigator.clipboard.writeText(message);
    setFeedback({
      type: 'info',
      message: `Đã sao chép nội dung tin nhắn nhắc phí của "${tuition.studentName}" vào clipboard!`,
    });
  };

  // Automated Batch Dispatch
  const handleStartBatchSend = () => {
    const targetTuitions = filteredTuitions.filter((t) => selectedTuitionIds.has(t.id));
    if (targetTuitions.length === 0) {
      setFeedback({
        type: 'error',
        message: 'Vui lòng chọn ít nhất một học sinh để gửi thông báo nhắc học phí!',
      });
      return;
    }

    if (channel === 'email') {
      // Gather all valid parent emails
      const emailsWithTuition = targetTuitions
        .map((t) => ({ t, info: getStudentInfo(t) }))
        .filter((item) => Boolean(item.info.parentEmail));

      if (emailsWithTuition.length === 0) {
        setFeedback({
          type: 'error',
          message: 'Không có phụ huynh nào trong danh sách đã chọn có địa chỉ Email!',
        });
        return;
      }

      // If only 1 email, send direct
      if (emailsWithTuition.length === 1) {
        handleSendSingleEmail(emailsWithTuition[0].t);
        return;
      }

      // If multiple, open mail client with BCC list
      const bccList = emailsWithTuition.map((item) => item.info.parentEmail).join(',');
      const subject = `[EduTutor] Thông Báo Nhắc Học Phí Tháng ${selectedMonth}/${selectedYear}`;
      const generalBody = [
        `Kính gửi Quý phụ huynh học sinh,`,
        ``,
        `${teacherSender} xin gửi thông báo nhắc nhở đóng học phí Tháng ${selectedMonth}/${selectedYear} cho các học sinh chưa hoàn tất học phí.`,
        `Kính mong Quý phụ huynh kiểm tra thông tin chi tiết trên phiếu thu học phí và hoàn tất chuyển khoản đúng hạn: ${dueDate}.`,
        ``,
        `THÔNG TIN TÀI KHOẢN NHẬN HỌC PHÍ:`,
        `• Ngân hàng: ${paymentAccount?.bankName || 'Vietcombank'}`,
        `• Số tài khoản: ${paymentAccount?.accountNumber || '1018999988'}`,
        `• Chủ tài khoản: ${paymentAccount?.accountName || (currentTenant?.teacherName || 'GIAO VIEN').toUpperCase()}`,
        ``,
        `Trân trọng cảm ơn Quý phụ huynh!`,
      ].join('\n');

      recordTuitionReminder(
        emailsWithTuition.map((item) => item.t.id),
        'email'
      );

      setFeedback({
        type: 'success',
        message: `Đã chuẩn bị email gửi hàng loạt đến ${emailsWithTuition.length} phụ huynh qua BCC!`,
      });

      window.location.href = `mailto:?bcc=${encodeURIComponent(bccList)}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(generalBody)}`;
      return;
    }

    // For Zalo batch: open guided dispatcher
    setIsBatchRunning(true);
    setBatchIndex(0);
    const firstItem = targetTuitions[0];
    if (firstItem) {
      handleSendSingleZalo(firstItem);
    }
  };

  // Next student in batch runner
  const handleBatchNext = () => {
    const targetTuitions = filteredTuitions.filter((t) => selectedTuitionIds.has(t.id));
    const nextIdx = batchIndex + 1;
    if (nextIdx < targetTuitions.length) {
      setBatchIndex(nextIdx);
      const nextItem = targetTuitions[nextIdx];
      handleSendSingleZalo(nextItem);
    } else {
      setIsBatchRunning(false);
      setFeedback({
        type: 'success',
        message: `Đã hoàn tất quy trình gửi nhắc phí Zalo cho toàn bộ ${targetTuitions.length} phụ huynh!`,
      });
    }
  };

  // Preview tuition object
  const activePreviewTuition =
    filteredTuitions.find((t) => t.id === previewTuitionId) ||
    filteredTuitions[0] ||
    unpaidTuitions[0];

  // Total summary of selected
  const selectedTuitions = filteredTuitions.filter((t) => selectedTuitionIds.has(t.id));
  const selectedTotalAmount = selectedTuitions.reduce(
    (acc, cur) => acc + (cur.totalAmount - (cur.paidAmount || 0)),
    0
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-5xl w-full max-h-[92vh] shadow-2xl border border-slate-100 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Top Header */}
        <div className="px-6 py-4 bg-linear-to-r from-blue-900 via-indigo-900 to-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
              <Bell className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-black tracking-tight text-white">
                  Gửi Thông Báo Nhắc Nhở Đóng Học Phí Tự Động
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/30 text-amber-200 border border-amber-400/30">
                  Tháng {selectedMonth}/{selectedYear}
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Tự động tạo và gửi tin nhắn nhắc phí cá nhân hóa qua Zalo hoặc Email đến phụ huynh có học sinh chưa đóng phí
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Feedback alert */}
        {feedback && (
          <div
            className={`px-6 py-2.5 text-xs font-semibold flex items-center justify-between border-b animate-in fade-in ${
              feedback.type === 'success'
                ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                : feedback.type === 'error'
                ? 'bg-rose-50 text-rose-900 border-rose-200'
                : 'bg-blue-50 text-blue-900 border-blue-200'
            }`}
          >
            <div className="flex items-center space-x-2">
              {feedback.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
              {feedback.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />}
              {feedback.type === 'info' && <Check className="w-4 h-4 text-blue-600 shrink-0" />}
              <span>{feedback.message}</span>
            </div>
            <button
              type="button"
              onClick={() => setFeedback(null)}
              className="text-slate-400 hover:text-slate-700 ml-2"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Batch Sender Wizard Bar (Active when batch is running) */}
        {isBatchRunning && (
          <div className="px-6 py-3 bg-amber-50 border-b border-amber-200 flex items-center justify-between gap-4 text-xs">
            <div className="flex items-center space-x-3">
              <span className="w-6 h-6 rounded-full bg-amber-600 text-white font-bold flex items-center justify-center text-[11px]">
                {batchIndex + 1}
              </span>
              <div>
                <p className="font-bold text-amber-950">
                  Đang gửi nhắc Zalo: {filteredTuitions.filter((t) => selectedTuitionIds.has(t.id))[batchIndex]?.studentName} ({batchIndex + 1}/{selectedTuitions.length})
                </p>
                <p className="text-[11px] text-amber-800">
                  Nội dung đã được tự động copy vào bộ nhớ tạm. Thầy/Cô chỉ cần bấm Dán (Ctrl+V) trong Zalo để gửi!
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={handleBatchNext}
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl transition-all shadow-xs flex items-center space-x-1 cursor-pointer"
              >
                <span>Học sinh tiếp theo</span>
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsBatchRunning(false)}
                className="px-2.5 py-1.5 bg-white text-slate-600 border border-slate-300 font-semibold rounded-xl hover:bg-slate-100 transition-colors"
              >
                Dừng lại
              </button>
            </div>
          </div>
        )}

        {/* Main Body: 2 Columns */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Filters, Student List & Selection (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            {/* KPI Summary Banner */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-rose-50 p-3 rounded-2xl border border-rose-200/80">
                <span className="text-[10px] font-bold text-rose-700 block uppercase tracking-wider">Chưa hoàn thành</span>
                <span className="text-lg font-black text-rose-900">{unpaidTuitions.length} học sinh</span>
              </div>
              <div className="bg-amber-50 p-3 rounded-2xl border border-amber-200/80">
                <span className="text-[10px] font-bold text-amber-700 block uppercase tracking-wider">Đã chọn nhắc phí</span>
                <span className="text-lg font-black text-amber-900">{selectedTuitionIds.size} em</span>
              </div>
              <div className="bg-blue-50 p-3 rounded-2xl border border-blue-200/80">
                <span className="text-[10px] font-bold text-blue-700 block uppercase tracking-wider">Tổng tiền cần thu</span>
                <span className="text-sm sm:text-base font-black text-blue-900 truncate block">
                  {selectedTotalAmount.toLocaleString('vi-VN')} đ
                </span>
              </div>
            </div>

            {/* Filter Controls Bar */}
            <div className="flex flex-wrap items-center gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-200">
              {/* Class Filter */}
              <div className="flex-1 min-w-[140px]">
                <select
                  value={filterClassId}
                  onChange={(e) => setFilterClassId(e.target.value)}
                  className="w-full bg-white border border-slate-300 text-slate-800 text-xs font-semibold rounded-xl px-2.5 py-1.5 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ALL">Tất cả lớp học ({classes.length} lớp)</option>
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div className="w-36">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
                  className="w-full bg-white border border-slate-300 text-slate-800 text-xs font-semibold rounded-xl px-2.5 py-1.5 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Tất cả trạng thái</option>
                  <option value="unreminded">Chưa gửi nhắc</option>
                  <option value="reminded">Đã gửi nhắc</option>
                </select>
              </div>

              {/* Search input */}
              <div className="relative flex-1 min-w-[150px]">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm học sinh, SĐT phụ huynh..."
                  className="w-full bg-white border border-slate-300 pl-8 pr-3 py-1.5 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Student List Table */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
              <div className="px-4 py-2.5 bg-slate-100/80 border-b border-slate-200 flex items-center justify-between text-xs font-bold text-slate-700">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={filteredTuitions.length > 0 && selectedTuitionIds.size === filteredTuitions.length}
                    onChange={handleToggleSelectAll}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <span>
                    Chọn tất cả ({selectedTuitionIds.size}/{filteredTuitions.length})
                  </span>
                </div>
                <span className="text-slate-400 text-[11px] font-normal">Bấm vào dòng để xem trước tin nhắn</span>
              </div>

              <div className="divide-y divide-slate-100 max-h-[380px] overflow-y-auto">
                {filteredTuitions.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-xs">
                    <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500 mb-2 opacity-80" />
                    <p className="font-bold text-slate-700">Không có học sinh chưa nộp học phí phù hợp!</p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Tất cả học sinh trong bộ lọc đã hoàn tất học phí hoặc không tìm thấy kết quả.
                    </p>
                  </div>
                ) : (
                  filteredTuitions.map((t) => {
                    const isSelected = selectedTuitionIds.has(t.id);
                    const isPreview = previewTuitionId === t.id;
                    const { parentName, parentPhone, parentEmail, cleanPhone } = getStudentInfo(t);
                    const dueAmount = t.totalAmount - (t.paidAmount || 0);

                    return (
                      <div
                        key={t.id}
                        onClick={() => setPreviewTuitionId(t.id)}
                        className={`p-3 transition-colors flex items-center justify-between gap-3 cursor-pointer ${
                          isPreview ? 'bg-blue-50/70 border-l-4 border-blue-600' : 'hover:bg-slate-50'
                        }`}
                      >
                        {/* Checkbox + Info */}
                        <div className="flex items-center space-x-3 min-w-0">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              e.stopPropagation();
                              handleToggleSelect(t.id);
                            }}
                            className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="flex items-center space-x-2">
                              <span className="font-bold text-slate-900 text-xs truncate">{t.studentName}</span>
                              <span className="px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 text-[10px] font-bold">
                                {t.schoolCode}
                              </span>
                              <span className="text-[11px] text-slate-500 truncate hidden sm:inline">
                                ({t.className})
                              </span>
                            </div>
                            <div className="flex items-center flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-slate-500 mt-0.5">
                              <span>PH: <strong className="text-slate-700">{parentName}</strong></span>
                              {parentPhone ? (
                                <span className="inline-flex items-center space-x-0.5 text-blue-600 font-medium">
                                  <Phone className="w-3 h-3" />
                                  <span>{parentPhone}</span>
                                </span>
                              ) : (
                                <span className="text-amber-600 text-[10px] font-medium">Chưa có SĐT</span>
                              )}
                              {parentEmail && (
                                <span className="hidden md:inline-flex items-center space-x-0.5 text-slate-600">
                                  <Mail className="w-3 h-3" />
                                  <span className="truncate max-w-[120px]">{parentEmail}</span>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Amount & Actions */}
                        <div className="flex items-center space-x-2 shrink-0">
                          <div className="text-right">
                            <span className="text-xs font-black text-rose-600 block">
                              {dueAmount.toLocaleString('vi-VN')} đ
                            </span>
                            {t.lastReminderSentAt ? (
                              <span className="text-[10px] text-emerald-600 font-bold block" title={t.lastReminderSentAt}>
                                Đã nhắc {t.lastReminderChannel === 'zalo' ? 'Zalo' : t.lastReminderChannel === 'email' ? 'Email' : 'Zalo/Mail'}
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-400 block">Chưa nhắc</span>
                            )}
                          </div>

                          {/* Quick single row actions */}
                          <div className="flex items-center space-x-1" onClick={(e) => e.stopPropagation()}>
                            {cleanPhone && (
                              <button
                                type="button"
                                onClick={() => handleSendSingleZalo(t)}
                                className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white flex items-center justify-center transition-colors"
                                title="Gửi nhắc qua Zalo"
                              >
                                <MessageSquare className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {parentEmail && (
                              <button
                                type="button"
                                onClick={() => handleSendSingleEmail(t)}
                                className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 hover:bg-purple-600 hover:text-white flex items-center justify-center transition-colors"
                                title="Gửi nhắc qua Email"
                              >
                                <Mail className="w-3.5 h-3.5" />
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => setQrModalTuition(t)}
                              className="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 flex items-center justify-center transition-colors"
                              title="Xem mã VietQR"
                            >
                              <QrCode className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Template Config, Preview & Batch Dispatch (5 cols) */}
          <div className="lg:col-span-5 space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              {/* Channel Selector */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <span className="text-xs font-bold text-slate-800 block">Kênh gửi thông báo:</span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setChannel('zalo')}
                    className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
                      channel === 'zalo'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Qua Zalo</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setChannel('email')}
                    className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
                      channel === 'email'
                        ? 'bg-purple-600 text-white shadow-xs'
                        : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Qua Email</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setChannel('both')}
                    className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
                      channel === 'both'
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Cả hai</span>
                  </button>
                </div>
              </div>

              {/* Message Template Config */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <span className="text-xs font-bold text-slate-800 block">Tùy chỉnh thông tin gửi:</span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                      Xưng hô / Tên Giáo Viên:
                    </label>
                    <input
                      type="text"
                      value={teacherSender}
                      onChange={(e) => setTeacherSender(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 font-medium focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                      Hạn đóng học phí:
                    </label>
                    <input
                      type="text"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      placeholder="15/10/2026..."
                      className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 font-medium focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                    Ghi chú thêm (Tùy chọn):
                  </label>
                  <input
                    type="text"
                    value={customNote}
                    onChange={(e) => setCustomNote(e.target.value)}
                    placeholder="VD: Đã trừ 1 buổi nghỉ có phép ngày 05/10..."
                    className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Live Preview Pane */}
              {activePreviewTuition && (
                <div className="bg-slate-900 text-slate-100 p-4 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-800">
                    <div className="flex items-center space-x-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span className="font-bold text-white">Xem trước tin nhắn:</span>
                      <span className="text-slate-400 font-semibold">({activePreviewTuition.studentName})</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopyMessage(activePreviewTuition)}
                      className="inline-flex items-center space-x-1 text-xs text-blue-300 hover:text-white transition-colors cursor-pointer"
                    >
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </button>
                  </div>

                  <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800/80 font-mono text-[11px] leading-relaxed text-slate-300 max-h-[160px] overflow-y-auto whitespace-pre-wrap selection:bg-blue-600">
                    {buildReminderMessage(activePreviewTuition)}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Action: Batch Send / Launch Button */}
            <div className="pt-3 border-t border-slate-200 space-y-2">
              <button
                type="button"
                onClick={handleStartBatchSend}
                disabled={selectedTuitions.length === 0}
                className={`w-full py-3.5 px-4 rounded-2xl font-black text-sm text-white shadow-md flex items-center justify-center space-x-2 transition-all cursor-pointer active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed ${
                  channel === 'email'
                    ? 'bg-purple-600 hover:bg-purple-700 shadow-purple-600/20'
                    : 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/20'
                }`}
              >
                <Send className="w-4 h-4" />
                <span>
                  Gửi Thông Báo Tự Động ({selectedTuitions.length} Phụ Huynh)
                </span>
              </button>

              <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
                <span>Học phí cần thu: <strong>{selectedTotalAmount.toLocaleString('vi-VN')} đ</strong></span>
                <span>Tài khoản: <strong>{paymentAccount?.bankCode || 'VCB'} - {paymentAccount?.accountNumber || '1018999988'}</strong></span>
              </div>
            </div>
          </div>
        </div>

        {/* VietQR Modal popup if clicked from preview */}
        {qrModalTuition && (
          <VietQRModal tuition={qrModalTuition} onClose={() => setQrModalTuition(null)} />
        )}
      </div>
    </div>
  );
};
