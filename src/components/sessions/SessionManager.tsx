import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { LessonSession, SessionType, SessionStatus } from '../../types';
import { formatDayOfWeek } from '../../utils/vietqr';
import {
  Clock,
  Calendar,
  AlertTriangle,
  Plus,
  ArrowRightLeft,
  XCircle,
  CheckCircle2,
  Sparkles,
  DollarSign,
  Filter,
  RotateCcw,
} from 'lucide-react';

export interface SessionFilterParams {
  month?: number | string;
  year?: number | string;
  classId?: string;
  sessionType?: string;
}

interface SessionManagerProps {
  initialFilter?: SessionFilterParams | null;
}

export const SessionManager: React.FC<SessionManagerProps> = ({ initialFilter }) => {
  const {
    lessonSessions,
    addLessonSession,
    cancelLessonSession,
    rescheduleLessonSession,
    toggleFeeEligibility,
    classes,
  } = useApp();

  const [selectedClassId, setSelectedClassId] = useState<string>(initialFilter?.classId || 'ALL');
  const [selectedMonth, setSelectedMonth] = useState<string>(
    initialFilter?.month !== undefined ? String(initialFilter.month) : '8'
  );
  const [selectedYear, setSelectedYear] = useState<string>(
    initialFilter?.year !== undefined ? String(initialFilter.year) : '2026'
  );
  const [selectedType, setSelectedType] = useState<string>(initialFilter?.sessionType || 'ALL');

  // Synchronize filter when initialFilter prop changes (e.g. user clicked "Xem Buổi Học Thực Tế" on popup)
  useEffect(() => {
    if (initialFilter) {
      if (initialFilter.month !== undefined) setSelectedMonth(String(initialFilter.month));
      if (initialFilter.year !== undefined) setSelectedYear(String(initialFilter.year));
      if (initialFilter.classId !== undefined) setSelectedClassId(initialFilter.classId);
      if (initialFilter.sessionType !== undefined) setSelectedType(initialFilter.sessionType);
    }
  }, [initialFilter]);

  // Modals
  const [cancelModalSession, setCancelModalSession] = useState<LessonSession | null>(null);
  const [cancelReason, setCancelReason] = useState('Giáo viên đi công tác chấm thi');
  const [createMakeup, setCreateMakeup] = useState(true);
  const [makeupDate, setMakeupDate] = useState('2026-08-15');

  const [rescheduleModalSession, setRescheduleModalSession] = useState<LessonSession | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState('2026-08-28');
  const [rescheduleReason, setRescheduleReason] = useState('Đổi lịch học do trùng lịch kiểm tra ở trường');

  const [showExtraModal, setShowExtraModal] = useState(false);
  const [extraClassId, setExtraClassId] = useState(classes[0]?.id || '');
  const [extraDate, setExtraDate] = useState('2026-08-25');
  const [extraTimeStart, setExtraTimeStart] = useState('14:00');
  const [extraTimeEnd, setExtraTimeEnd] = useState('16:00');
  const [extraReason, setExtraReason] = useState('Buổi tăng cường giải đề chuyên sâu');
  const [extraFeeEligible, setExtraFeeEligible] = useState(true);

  const filteredSessions = lessonSessions.filter((s) => {
    const [sYear, sMonth] = s.date.split('-');
    const matchesMonth = selectedMonth === 'ALL' || Number(sMonth) === Number(selectedMonth);
    const matchesYear = selectedYear === 'ALL' || sYear === String(selectedYear);
    const matchesClass = selectedClassId === 'ALL' || s.classId === selectedClassId;
    const matchesType = selectedType === 'ALL' || s.sessionType === selectedType;
    return matchesMonth && matchesYear && matchesClass && matchesType;
  });

  const isFilterActive =
    selectedMonth !== 'ALL' ||
    selectedYear !== 'ALL' ||
    selectedClassId !== 'ALL' ||
    selectedType !== 'ALL';

  const handleResetFilters = () => {
    setSelectedMonth('ALL');
    setSelectedYear('ALL');
    setSelectedClassId('ALL');
    setSelectedType('ALL');
  };

  const [toastMessage, setToastMessage] = useState<{ title: string; desc: string; type: 'success' | 'info' } | null>(null);

  const showToast = (title: string, desc: string, type: 'success' | 'info' = 'success') => {
    setToastMessage({ title, desc, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleCancelSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancelModalSession) return;
    cancelLessonSession(cancelModalSession.id, cancelReason, createMakeup, makeupDate);
    setCancelModalSession(null);
    showToast(
      'Hủy buổi học thành công',
      `Đã hủy buổi ngày ${cancelModalSession.date} và cập nhật trạng thái không tính phí (BR-003).${createMakeup ? ` Lịch học bù: ${makeupDate}` : ''}`
    );
  };

  const handleRescheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rescheduleModalSession) return;
    rescheduleLessonSession(rescheduleModalSession.id, rescheduleDate, rescheduleReason);
    setRescheduleModalSession(null);
    showToast(
      'Đổi lịch học thành công',
      `Buổi học ${rescheduleModalSession.className} được dời từ ${rescheduleModalSession.date} sang ngày ${rescheduleDate}.`
    );
  };

  const handleExtraSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cls = classes.find((c) => c.id === extraClassId);
    if (!cls) return;

    addLessonSession({
      classId: extraClassId,
      className: cls.name,
      date: extraDate,
      dayOfWeek: new Date(extraDate).getDay() as any,
      startTime: extraTimeStart,
      endTime: extraTimeEnd,
      sessionType: 'extra',
      status: 'scheduled',
      feeEligible: extraFeeEligible,
      extraSessionReason: extraReason,
    });

    setShowExtraModal(false);
    showToast(
      'Thêm buổi học phát sinh thành công',
      `Đã lên lịch buổi phát sinh ngày ${extraDate} (${extraTimeStart}-${extraTimeEnd}) cho lớp ${cls.name}.`
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Quản Lý Buổi Học Thực Tế</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            BR-004 & BR-008: Buổi học thực tế quyết định số buổi tính phí (fee_eligible). Xử lý hủy, đổi lịch, học bù và phát sinh.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowExtraModal(true)}
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm buổi học phát sinh</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {/* Month filter */}
            <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="text-xs font-bold bg-transparent focus:outline-none cursor-pointer text-slate-800"
              >
                <option value="ALL">Tất cả tháng</option>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => (
                  <option key={m} value={String(m)}>
                    Tháng {m} {m === 8 ? '(Tháng 8/2026)' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Year filter */}
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="text-xs font-bold border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-hidden cursor-pointer"
            >
              <option value="ALL">Tất cả năm</option>
              <option value="2026">Năm 2026</option>
              <option value="2027">Năm 2027</option>
            </select>

            {/* Class filter */}
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="text-xs font-bold border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-hidden cursor-pointer"
            >
              <option value="ALL">Tất cả lớp học</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            {/* Session Type filter */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="text-xs font-bold border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-hidden cursor-pointer"
            >
              <option value="ALL">Tất cả loại buổi học</option>
              <option value="regular">Theo lịch cố định</option>
              <option value="make_up">Học bù (Make-up)</option>
              <option value="rescheduled">Đổi lịch (Rescheduled)</option>
              <option value="extra">Buổi phát sinh (Extra)</option>
            </select>

            {/* Clear Filters Button */}
            {isFilterActive && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center space-x-1 px-2.5 py-1.5 text-xs text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                title="Đặt lại toàn bộ bộ lọc"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Xem tất cả</span>
              </button>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {selectedMonth !== 'ALL' && (
              <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 font-bold text-xs border border-blue-200">
                Tháng {selectedMonth}{selectedYear !== 'ALL' ? `/${selectedYear}` : ''}
              </span>
            )}
            <div className="text-xs text-slate-500 font-medium">
              Tổng số: <strong className="text-slate-900">{filteredSessions.length} buổi học</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Sessions List Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Ngày học</th>
                <th className="py-3 px-4">Lớp học</th>
                <th className="py-3 px-4">Thời gian</th>
                <th className="py-3 px-4">Loại buổi</th>
                <th className="py-3 px-4">Trạng thái</th>
                <th className="py-3 px-4">Tính học phí (Fee Eligible)</th>
                <th className="py-3 px-4 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredSessions.map((s) => {
                const dayName = formatDayOfWeek(s.dayOfWeek);
                return (
                  <tr key={s.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-900 block">{s.date}</span>
                      <span className="text-[11px] text-blue-600 font-semibold">{dayName}</span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-800 block">{s.className}</span>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-slate-600">
                      {s.startTime} - {s.endTime}
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          s.sessionType === 'regular'
                            ? 'bg-blue-50 text-blue-700'
                            : s.sessionType === 'make_up'
                            ? 'bg-emerald-100 text-emerald-800'
                            : s.sessionType === 'rescheduled'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {s.sessionType === 'regular'
                          ? 'Theo lịch'
                          : s.sessionType === 'make_up'
                          ? 'Học bù'
                          : s.sessionType === 'rescheduled'
                          ? 'Đổi lịch'
                          : 'Phát sinh'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          s.status === 'completed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : s.status === 'scheduled'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {s.status === 'completed'
                          ? 'Đã diễn ra'
                          : s.status === 'scheduled'
                          ? 'Dự kiến'
                          : 'Đã hủy'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <button
                        type="button"
                        onClick={() => toggleFeeEligibility(s.id)}
                        className={`px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                          s.feeEligible
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                        }`}
                        title="Bấm để bật/tắt tính phí buổi học này"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{s.feeEligible ? 'Có tính phí' : 'Không tính phí'}</span>
                      </button>
                    </td>

                    <td className="py-3.5 px-4 text-right space-x-1">
                      {s.status !== 'cancelled' ? (
                        <>
                          <button
                            type="button"
                            onClick={() => setRescheduleModalSession(s)}
                            className="p-1.5 text-slate-400 hover:text-purple-600 rounded-lg hover:bg-purple-50"
                            title="Đổi lịch buổi học"
                          >
                            <ArrowRightLeft className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setCancelModalSession(s);
                              setMakeupDate(s.date);
                            }}
                            className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                            title="Hủy buổi học"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                          </button>
                        </>
                      ) : (
                        <span className="text-[11px] text-red-600 italic">Đã hủy</span>
                      )}
                    </td>
                  </tr>
                );
              })}

              {filteredSessions.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 px-4 text-center">
                    <div className="max-w-md mx-auto space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-500 mx-auto flex items-center justify-center font-bold">
                        <Calendar className="w-6 h-6" />
                      </div>
                      <h4 className="font-bold text-slate-800 text-sm">
                        Không tìm thấy buổi học nào
                      </h4>
                      <p className="text-slate-500 text-xs leading-relaxed">
                        Chưa có buổi học thực tế nào cho bộ lọc hiện tại{' '}
                        {selectedMonth !== 'ALL' && (
                          <span className="font-semibold text-slate-700">
                            (Tháng {selectedMonth}{selectedYear !== 'ALL' ? `/${selectedYear}` : ''})
                          </span>
                        )}
                        . Bạn có thể sinh buổi học tự động từ lịch cố định hoặc đổi bộ lọc.
                      </p>
                      {isFilterActive && (
                        <button
                          type="button"
                          onClick={handleResetFilters}
                          className="inline-flex items-center space-x-1.5 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Hiển thị tất cả buổi học</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cancel Modal (with Make-up option BR-005, BR-006) */}
      {cancelModalSession && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <h3 className="text-lg font-bold text-slate-900 pb-2 border-b border-slate-100">
              Hủy buổi học ngày {cancelModalSession.date}
            </h3>

            <form onSubmit={handleCancelSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Lý do hủy buổi:</label>
                <input
                  type="text"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl p-2.5 outline-hidden"
                  required
                />
              </div>

              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-2">
                <label className="flex items-center space-x-2 cursor-pointer font-bold text-emerald-900">
                  <input
                    type="checkbox"
                    checked={createMakeup}
                    onChange={(e) => setCreateMakeup(e.target.checked)}
                    className="rounded text-emerald-600"
                  />
                  <span>Tự động tạo buổi học bù thay thế (BR-006)</span>
                </label>

                {createMakeup && (
                  <div className="pt-2">
                    <label className="font-semibold text-emerald-800 block mb-1">
                      Chọn ngày học bù:
                    </label>
                    <input
                      type="date"
                      value={makeupDate}
                      onChange={(e) => setMakeupDate(e.target.value)}
                      className="w-full border border-emerald-300 rounded-xl p-2 bg-white outline-hidden"
                      required
                    />
                    <p className="text-[10px] text-emerald-700 mt-1">
                      * Buổi học bù sẽ được liên kết và tính học phí thay thế cho buổi bị hủy, tránh tính trùng phí.
                    </p>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCancelModalSession(null)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800 font-medium"
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold shadow-md transition-colors"
                >
                  Xác nhận Hủy buổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {rescheduleModalSession && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <h3 className="text-lg font-bold text-slate-900 pb-2 border-b border-slate-100">
              Đổi lịch buổi học ({rescheduleModalSession.date})
            </h3>

            <form onSubmit={handleRescheduleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Ngày học mới:</label>
                <input
                  type="date"
                  value={rescheduleDate}
                  onChange={(e) => setRescheduleDate(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl p-2.5 outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Lý do đổi lịch:</label>
                <input
                  type="text"
                  value={rescheduleReason}
                  onChange={(e) => setRescheduleReason(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl p-2.5 outline-hidden"
                  required
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRescheduleModalSession(null)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800 font-medium"
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold shadow-md transition-colors"
                >
                  Xác nhận Đổi lịch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Extra Session Modal (BR-007) */}
      {showExtraModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <h3 className="text-lg font-bold text-slate-900 pb-2 border-b border-slate-100">
              Thêm buổi học phát sinh (Tăng cường)
            </h3>

            <form onSubmit={handleExtraSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Lớp học:</label>
                <select
                  value={extraClassId}
                  onChange={(e) => setExtraClassId(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl p-2.5 bg-white outline-hidden font-medium"
                >
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Ngày học:</label>
                <input
                  type="date"
                  value={extraDate}
                  onChange={(e) => setExtraDate(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl p-2.5 outline-hidden"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Giờ bắt đầu:</label>
                  <input
                    type="time"
                    value={extraTimeStart}
                    onChange={(e) => setExtraTimeStart(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl p-2.5 outline-hidden"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Giờ kết thúc:</label>
                  <input
                    type="time"
                    value={extraTimeEnd}
                    onChange={(e) => setExtraTimeEnd(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl p-2.5 outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Nội dung / Lý do phát sinh:</label>
                <input
                  type="text"
                  value={extraReason}
                  onChange={(e) => setExtraReason(e.target.value)}
                  placeholder="Luyện đề giải nhanh, thi thử..."
                  className="w-full border border-slate-300 rounded-xl p-2.5 outline-hidden"
                  required
                />
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-2xl">
                <label className="flex items-center space-x-2 cursor-pointer font-bold text-blue-900">
                  <input
                    type="checkbox"
                    checked={extraFeeEligible}
                    onChange={(e) => setExtraFeeEligible(e.target.checked)}
                    className="rounded text-blue-600"
                  />
                  <span>Xác nhận tính học phí cho buổi phát sinh này (BR-007)</span>
                </label>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowExtraModal(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800 font-medium cursor-pointer"
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md transition-colors cursor-pointer"
                >
                  Thêm buổi học
                </button>
              </div>
            </form>
          </div>
        </div>
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
            className="text-slate-400 hover:text-white p-1"
          >
            <XCircle className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
