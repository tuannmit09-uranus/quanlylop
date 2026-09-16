import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { AttendanceStatus } from '../../types';
import { formatDayOfWeek, formatDateVN } from '../../utils/vietqr';
import {
  CheckCircle2,
  XCircle,
  Clock,
  CheckCheck,
  RotateCcw,
  Users,
  Calendar,
  AlertCircle,
  HelpCircle,
  CalendarDays,
} from 'lucide-react';

export const AttendanceManager: React.FC = () => {
  const { classes, students, lessonSessions, attendance, markAttendance, removeAttendance, clearSessionAttendance, markAllPresent } = useApp();

  const now = new Date();
  const currentMonth = now.getMonth() + 1; // 8 for August

  const [selectedClassId, setSelectedClassId] = useState(classes[0]?.id || '');
  const [selectedMonth, setSelectedMonth] = useState<string>(String(currentMonth));

  const activeSessions = lessonSessions.filter((s) => {
    const [sYear, sMonth] = s.date.split('-');
    const matchesClass = s.classId === selectedClassId;
    const matchesMonth = selectedMonth === 'ALL' || Number(sMonth) === Number(selectedMonth);
    return matchesClass && matchesMonth;
  });

  const [selectedSessionId, setSelectedSessionId] = useState(activeSessions[0]?.id || '');

  // Keep selectedSessionId in sync with filtered sessions
  useEffect(() => {
    if (activeSessions.length > 0) {
      if (!activeSessions.some((s) => s.id === selectedSessionId)) {
        setSelectedSessionId(activeSessions[0].id);
      }
    } else {
      setSelectedSessionId('');
    }
  }, [selectedClassId, selectedMonth, lessonSessions]);

  const currentClass = classes.find((c) => c.id === selectedClassId);
  const currentSession = lessonSessions.find((s) => s.id === selectedSessionId);
  const classStudents = students.filter((s) => {
    if (Array.isArray(s.enrolledClassIds) && s.enrolledClassIds.length > 0) {
      return s.enrolledClassIds.includes(selectedClassId);
    }
    return currentClass?.studentIds.includes(s.id);
  });

  // Current session attendance records
  const sessionAttendance = attendance.filter((a) => a.sessionId === selectedSessionId);

  // Compute exact count for each status
  const presentCount = classStudents.filter((s) => {
    const record = sessionAttendance.find((a) => a.studentId === s.id);
    return record?.status === 'present';
  }).length;

  const excusedCount = classStudents.filter((s) => {
    const record = sessionAttendance.find((a) => a.studentId === s.id);
    return record?.status === 'excused';
  }).length;

  const absentCount = classStudents.filter((s) => {
    const record = sessionAttendance.find((a) => a.studentId === s.id);
    return record?.status === 'absent' || record?.status === 'unexcused';
  }).length;

  const unmarkedCount = selectedSessionId
    ? classStudents.filter((s) => {
        const record = sessionAttendance.find((a) => a.studentId === s.id);
        return !record || !record.status;
      }).length
    : 0;

  const handleStatusChange = (studentId: string, targetStatus: AttendanceStatus, note?: string) => {
    if (!selectedSessionId) return;
    const currentRecord = sessionAttendance.find((a) => a.studentId === studentId);

    // If clicking the same status again, toggle back to unmarked
    if (currentRecord?.status === targetStatus && removeAttendance) {
      removeAttendance(selectedSessionId, studentId);
    } else {
      markAttendance?.(selectedSessionId, studentId, targetStatus, note);
    }
  };

  const handleResetSession = () => {
    if (!selectedSessionId) return;
    if (clearSessionAttendance) {
      clearSessionAttendance(selectedSessionId);
    } else if (removeAttendance) {
      classStudents.forEach((student) => removeAttendance(selectedSessionId, student.id));
    }
  };

  const formatSessionTypeName = (type: string) => {
    switch (type) {
      case 'regular':
        return 'Theo lịch';
      case 'make_up':
        return 'Học bù';
      case 'rescheduled':
        return 'Đổi lịch';
      case 'extra':
        return 'Phát sinh';
      default:
        return type;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-1 border border-blue-200">
            <Calendar className="w-3.5 h-3.5" />
            <span>Sổ Điểm Danh Lớp Học</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Điểm Danh Lớp Học</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Ghi nhận học sinh có mặt, nghỉ có phép hoặc vắng mặt để cập nhật hồ sơ và tính toán học phí chính xác theo quy tắc BR-003 & BR-009.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            disabled={!selectedSessionId}
            onClick={() => {
              if (selectedSessionId && selectedClassId) {
                markAllPresent?.(selectedSessionId, selectedClassId);
              }
            }}
            className="inline-flex items-center space-x-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-xs font-bold transition-colors shadow-xs cursor-pointer active:scale-98"
          >
            <CheckCheck className="w-4 h-4" />
            <span>Điểm danh có mặt tất cả</span>
          </button>

          <button
            type="button"
            disabled={!selectedSessionId}
            onClick={handleResetSession}
            className="inline-flex items-center space-x-2 px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            title="Đặt lại tất cả học sinh về trạng thái chưa điểm danh"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Đặt lại (Chưa điểm danh)</span>
          </button>
        </div>
      </div>

      {/* Select Class, Month & Session Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-wrap items-center gap-3 w-full lg:w-auto">
          {/* 1. Chọn lớp */}
          <div className="w-full sm:w-auto">
            <label className="text-[11px] font-bold text-slate-400 block mb-1">Chọn lớp:</label>
            <select
              value={selectedClassId}
              onChange={(e) => {
                setSelectedClassId(e.target.value);
              }}
              className="w-full text-xs font-bold border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-hidden cursor-pointer text-slate-800 min-h-[42px]"
            >
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.studentIds.length} HS)
                </option>
              ))}
            </select>
          </div>

          {/* 2. Chọn tháng */}
          <div className="w-full sm:w-auto">
            <label className="text-[11px] font-bold text-slate-400 block mb-1">Chọn tháng:</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full text-xs font-bold border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-hidden cursor-pointer text-slate-800 min-h-[42px]"
            >
              <option value="ALL">Tất cả tháng</option>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => (
                <option key={m} value={String(m)}>
                  Tháng {m} {m === currentMonth ? '(Hiện tại)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* 3. Chọn ngày/buổi học */}
          <div className="w-full sm:col-span-2 lg:col-span-1 lg:w-auto">
            <label className="text-[11px] font-bold text-slate-400 block mb-1">Chọn ngày/buổi học:</label>
            <select
              value={selectedSessionId}
              onChange={(e) => setSelectedSessionId(e.target.value)}
              disabled={activeSessions.length === 0}
              className="w-full lg:min-w-[280px] text-xs font-bold border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-hidden cursor-pointer text-slate-800 disabled:opacity-60 disabled:cursor-not-allowed min-h-[42px]"
            >
              {activeSessions.length === 0 ? (
                <option value="">(Không có buổi học nào trong tháng này)</option>
              ) : (
                activeSessions.map((s) => {
                  const dayName = formatDayOfWeek(s.dayOfWeek ?? s.date);
                  const formattedDate = formatDateVN(s.date);
                  return (
                    <option key={s.id} value={s.id}>
                      {dayName}, {formattedDate} ({s.startTime} - {s.endTime}) - {formatSessionTypeName(s.sessionType)}
                    </option>
                  );
                })
              )}
            </select>
          </div>
        </div>

        {/* Counter Badges */}
        {selectedSessionId ? (
          <div className="flex items-center flex-wrap gap-2 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
            <span className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border ${
              unmarkedCount > 0
                ? 'bg-slate-100 text-slate-700 border-slate-300 font-semibold'
                : 'bg-slate-50 text-slate-400 border-slate-200'
            }`}>
              Chưa: {unmarkedCount}
            </span>
            <span className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border ${
              presentCount > 0
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-slate-50 text-slate-400 border-slate-200'
            }`}>
              Có mặt: {presentCount}
            </span>
            <span className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border ${
              excusedCount > 0
                ? 'bg-amber-50 text-amber-800 border-amber-200'
                : 'bg-slate-50 text-slate-400 border-slate-200'
            }`}>
              Có phép: {excusedCount}
            </span>
            <span className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border ${
              absentCount > 0
                ? 'bg-red-50 text-red-800 border-red-200'
                : 'bg-slate-50 text-slate-400 border-slate-200'
            }`}>
              Vắng: {absentCount}
            </span>
          </div>
        ) : (
          <span className="text-xs text-slate-400 font-medium italic">
            Tổng số buổi trong tháng: {activeSessions.length} buổi
          </span>
        )}
      </div>

      {/* Unmarked Session Notice */}
      {selectedSessionId && unmarkedCount === classStudents.length && classStudents.length > 0 && currentSession && (
        <div className="bg-blue-50/70 border border-blue-200 text-blue-900 rounded-2xl p-4 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center space-x-2.5">
            <HelpCircle className="w-4 h-4 text-blue-600 shrink-0" />
            <span>
              Buổi học <strong>{formatDayOfWeek(currentSession.dayOfWeek ?? currentSession.date)}, ngày {formatDateVN(currentSession.date)}</strong> ({currentSession.startTime} - {currentSession.endTime}) hiện <strong>chưa ghi nhận điểm danh</strong>. Thầy/Cô hãy tích chọn trạng thái bên dưới hoặc bấm <strong>"Điểm danh có mặt tất cả"</strong> để lưu nhanh.
            </span>
          </div>
        </div>
      )}

      {/* Attendance Student Roster Table or Empty State */}
      {activeSessions.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-500 mx-auto flex items-center justify-center font-bold mb-3">
            <CalendarDays className="w-6 h-6" />
          </div>
          <h4 className="font-bold text-slate-800 text-sm">
            Không có buổi học nào trong Tháng {selectedMonth} cho lớp {currentClass?.name}
          </h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 leading-relaxed">
            Lớp học chưa có buổi học thực tế nào trong tháng này. Bạn có thể chuyển sang tháng khác hoặc vào mục <strong>Lịch Học Cố Định</strong> để tự động sinh các buổi học theo thời khóa biểu.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          {currentSession && (
            <div className="bg-slate-50/90 px-5 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center space-x-2 text-xs">
                <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-xl bg-blue-100/80 text-blue-800 font-bold border border-blue-200">
                  <Calendar className="w-3.5 h-3.5 text-blue-600" />
                  <span>{formatDayOfWeek(currentSession.dayOfWeek ?? currentSession.date)}, {formatDateVN(currentSession.date)}</span>
                </span>
                <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-xl bg-slate-100 text-slate-700 font-semibold border border-slate-200">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{currentSession.startTime} - {currentSession.endTime}</span>
                </span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-200/80 text-slate-700">
                  {formatSessionTypeName(currentSession.sessionType)}
                </span>
              </div>
              <span className="text-xs text-slate-500 font-medium">
                Sĩ số lớp: <strong className="text-slate-800">{classStudents.length} học sinh</strong>
              </span>
            </div>
          )}
          {/* Desktop Table View (>= 768px) */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3 text-center w-12">STT</th>
                  <th className="py-3 px-4">Học sinh</th>
                  <th className="py-3 px-4">Trường / Khóa</th>
                  <th className="py-3 px-4">Phụ huynh</th>
                  <th className="py-3 px-4 text-center">Trạng thái điểm danh</th>
                  <th className="py-3 px-4">Ghi chú của giáo viên</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {classStudents.map((student, idx) => {
                  const record = sessionAttendance.find((a) => a.studentId === student.id);
                  const status = record?.status; // undefined if not marked!

                  return (
                    <tr key={student.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-3 text-center font-bold text-slate-400">
                        {idx + 1}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-900 block">{student.fullName}</span>
                        <span className="text-[11px] text-slate-400">SĐT: {student.phone}</span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="text-slate-800 font-semibold">{student.schoolName}</span>
                        <span className="text-[11px] text-blue-600 block">
                          {student.schoolCode} • K{String(student.birthYear).slice(-2)}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="text-slate-800 font-medium">{student.parentName}</span>
                        <span className="text-[11px] text-slate-400 block">{student.parentPhone}</span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex flex-col items-center justify-center space-y-1.5">
                          <div className="flex items-center justify-center space-x-1.5">
                            <button
                              type="button"
                              onClick={() => handleStatusChange(student.id, 'present')}
                              className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center space-x-1 cursor-pointer ${
                                status === 'present'
                                  ? 'bg-emerald-600 text-white shadow-xs ring-2 ring-emerald-600 ring-offset-1'
                                  : 'bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'
                              }`}
                              title={status === 'present' ? 'Bấm lần nữa để bỏ chọn' : 'Đánh dấu Có mặt'}
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Có mặt</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleStatusChange(student.id, 'excused')}
                              className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center space-x-1 cursor-pointer ${
                                status === 'excused'
                                  ? 'bg-amber-500 text-white shadow-xs ring-2 ring-amber-500 ring-offset-1'
                                  : 'bg-slate-100 text-slate-600 hover:bg-amber-50 hover:text-amber-700'
                              }`}
                              title={status === 'excused' ? 'Bấm lần nữa để bỏ chọn' : 'Đánh dấu Có phép'}
                            >
                              <Clock className="w-3.5 h-3.5" />
                              <span>Có phép</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleStatusChange(student.id, 'absent')}
                              className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center space-x-1 cursor-pointer ${
                                status === 'absent' || status === 'unexcused'
                                  ? 'bg-red-600 text-white shadow-xs ring-2 ring-red-600 ring-offset-1'
                                  : 'bg-slate-100 text-slate-600 hover:bg-red-50 hover:text-red-700'
                              }`}
                              title={status === 'absent' ? 'Bấm lần nữa để bỏ chọn' : 'Đánh dấu Vắng mặt'}
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Vắng</span>
                            </button>
                          </div>

                          {/* Status Label / Reset Trigger */}
                          <div className="text-center">
                            {!status ? (
                              <span className="text-[11px] font-semibold text-slate-400 italic">
                                Chưa điểm danh
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => removeAttendance?.(selectedSessionId, student.id)}
                                className="text-[10px] font-semibold text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                              >
                                ✕ Bỏ chọn (Đặt lại)
                              </button>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <input
                          type="text"
                          key={`${selectedSessionId}-${student.id}`}
                          defaultValue={record?.note || ''}
                          onBlur={(e) => {
                            if (status) {
                              markAttendance?.(selectedSessionId, student.id, status, e.target.value);
                            }
                          }}
                          placeholder="Ghi chú (ví dụ: Đi muộn 10p, hăng hái phát biểu)..."
                          className="w-full text-xs border border-slate-200 rounded-xl px-2.5 py-1.5 focus:ring-2 focus:ring-blue-500 outline-hidden bg-slate-50/50"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View (< 768px) */}
          <div className="block md:hidden divide-y divide-slate-100">
            {classStudents.map((student, idx) => {
              const record = sessionAttendance.find((a) => a.studentId === student.id);
              const status = record?.status;

              return (
                <div key={student.id} className="p-4 space-y-3 bg-white">
                  {/* Student Info Row */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center space-x-3 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0 border border-blue-200">
                        {idx + 1}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-slate-900 truncate">
                          {student.fullName}
                        </h4>
                        <div className="flex items-center space-x-2 text-[11px] text-slate-500">
                          <span>{student.schoolCode || student.schoolName}</span>
                          <span>•</span>
                          <span>PH: {student.parentPhone}</span>
                        </div>
                      </div>
                    </div>

                    {/* Status indicator pill */}
                    <span
                      className={`text-[11px] font-bold px-2.5 py-1 rounded-full shrink-0 ${
                        status === 'present'
                          ? 'bg-emerald-100 text-emerald-800'
                          : status === 'excused'
                          ? 'bg-amber-100 text-amber-800'
                          : status === 'absent' || status === 'unexcused'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {status === 'present'
                        ? 'Có mặt'
                        : status === 'excused'
                        ? 'Có phép'
                        : status === 'absent' || status === 'unexcused'
                        ? 'Vắng'
                        : 'Chưa'}
                    </span>
                  </div>

                  {/* 3 Large Action Buttons for Mobile */}
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => handleStatusChange(student.id, 'present')}
                      className={`min-h-[44px] rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
                        status === 'present'
                          ? 'bg-emerald-600 text-white shadow-xs ring-2 ring-emerald-600 ring-offset-1 font-bold'
                          : 'bg-slate-100 text-slate-700 hover:bg-emerald-50 active:scale-98'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Có mặt</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleStatusChange(student.id, 'excused')}
                      className={`min-h-[44px] rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
                        status === 'excused'
                          ? 'bg-amber-500 text-white shadow-xs ring-2 ring-amber-500 ring-offset-1 font-bold'
                          : 'bg-slate-100 text-slate-700 hover:bg-amber-50 active:scale-98'
                      }`}
                    >
                      <Clock className="w-4 h-4" />
                      <span>Có phép</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleStatusChange(student.id, 'absent')}
                      className={`min-h-[44px] rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
                        status === 'absent' || status === 'unexcused'
                          ? 'bg-red-600 text-white shadow-xs ring-2 ring-red-600 ring-offset-1 font-bold'
                          : 'bg-slate-100 text-slate-700 hover:bg-red-50 active:scale-98'
                      }`}
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Vắng</span>
                    </button>
                  </div>

                  {/* Note input and reset */}
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="text"
                      key={`mobile-${selectedSessionId}-${student.id}`}
                      defaultValue={record?.note || ''}
                      onBlur={(e) => {
                        if (status) {
                          markAttendance?.(selectedSessionId, student.id, status, e.target.value);
                        }
                      }}
                      placeholder="Ghi chú buổi học..."
                      className="flex-1 text-xs border border-slate-200 rounded-xl px-3 py-2 min-h-[40px] focus:ring-2 focus:ring-blue-500 outline-hidden bg-slate-50/60"
                    />
                    {status && (
                      <button
                        type="button"
                        onClick={() => removeAttendance?.(selectedSessionId, student.id)}
                        className="px-2.5 py-2 text-[11px] font-semibold text-slate-500 hover:text-slate-800 bg-slate-100 rounded-xl min-h-[40px] shrink-0"
                      >
                        ✕ Xóa
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
