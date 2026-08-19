import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatDayOfWeek } from '../../utils/vietqr';
import {
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Sparkles,
  BookOpen,
  CalendarDays,
  Users,
  Search,
  Check,
  Building2,
  School,
} from 'lucide-react';

export const ParentAttendanceView: React.FC = () => {
  const {
    students,
    activeStudentId,
    classes,
    lessonSessions,
    attendance,
    currentTenant,
  } = useApp();

  const currentStudent = students.find((s) => s.id === activeStudentId) || students[0];
  const enrolledClassIds = currentStudent.enrolledClassIds || [];
  const studentClasses = classes.filter((c) => enrolledClassIds.includes(c.id));

  const [selectedMonth, setSelectedMonth] = useState<string>('8');
  const [selectedYear, setSelectedYear] = useState<string>('2026');
  const [selectedClassId, setSelectedClassId] = useState<string>('ALL');

  // Filter sessions belonging to classes the student is enrolled in
  const studentSessions = lessonSessions.filter((s) => {
    const isEnrolled = enrolledClassIds.includes(s.classId);
    if (!isEnrolled) return false;

    const [sYear, sMonth] = s.date.split('-');
    const matchesMonth = selectedMonth === 'ALL' || Number(sMonth) === Number(selectedMonth);
    const matchesYear = selectedYear === 'ALL' || sYear === String(selectedYear);
    const matchesClass = selectedClassId === 'ALL' || s.classId === selectedClassId;

    return matchesMonth && matchesYear && matchesClass;
  });

  // Sort sessions chronologically
  const sortedSessions = [...studentSessions].sort((a, b) => a.date.localeCompare(b.date));

  // Compute attendance stats for this student
  let totalValidSessions = 0;
  let presentCount = 0;
  let excusedCount = 0;
  let absentCount = 0;

  sortedSessions.forEach((s) => {
    if (s.status === 'cancelled') return;
    const record = attendance.find((a) => a.sessionId === s.id && a.studentId === currentStudent.id);
    if (s.status === 'completed' || record) {
      totalValidSessions++;
      if (record?.status === 'present') presentCount++;
      else if (record?.status === 'excused') excusedCount++;
      else if (record?.status === 'absent' || record?.status === 'unexcused') absentCount++;
    }
  });

  const attendanceRate =
    totalValidSessions > 0 ? Math.round((presentCount / totalValidSessions) * 100) : 100;

  const formatSessionType = (type: string) => {
    switch (type) {
      case 'regular':
        return { label: 'Chính khóa', color: 'bg-blue-50 text-blue-700 border-blue-200' };
      case 'makeup':
        return { label: 'Học bù', color: 'bg-purple-50 text-purple-700 border-purple-200' };
      case 'extra':
        return { label: 'Tăng cường', color: 'bg-amber-50 text-amber-700 border-amber-200' };
      default:
        return { label: 'Buổi học', color: 'bg-slate-50 text-slate-700 border-slate-200' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-900 via-emerald-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-200 text-xs font-semibold mb-2 border border-emerald-400/30">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Sổ Theo Dõi Lịch Học & Điểm Danh Chuyên Cần</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black">
            Lịch học em: {currentStudent.fullName}
          </h2>
          <p className="text-emerald-100 text-xs sm:text-sm mt-1">
            Trường: <strong>{currentStudent.schoolName}</strong> ({currentStudent.schoolCode}) • Khối lớp: <strong>{currentStudent.schoolGrade}</strong> • {currentTenant.teacherName}
          </p>
        </div>

        {/* Chuyên cần KPI Stats */}
        <div className="grid grid-cols-4 gap-2 bg-white/10 p-3 rounded-2xl border border-white/20 backdrop-blur-xs text-center">
          <div className="px-2">
            <span className="text-[10px] sm:text-[11px] text-emerald-200 block">Số buổi học</span>
            <span className="text-sm sm:text-lg font-black text-white">
              {totalValidSessions}
            </span>
          </div>
          <div className="px-2 border-l border-white/15">
            <span className="text-[10px] sm:text-[11px] text-emerald-200 block">Có mặt</span>
            <span className="text-sm sm:text-lg font-black text-emerald-300">
              {presentCount}
            </span>
          </div>
          <div className="px-2 border-l border-white/15">
            <span className="text-[10px] sm:text-[11px] text-emerald-200 block">Nghỉ phép</span>
            <span className="text-sm sm:text-lg font-black text-amber-300">
              {excusedCount}
            </span>
          </div>
          <div className="px-2 border-l border-white/15">
            <span className="text-[10px] sm:text-[11px] text-emerald-200 block">Chuyên cần</span>
            <span className="text-sm sm:text-lg font-black text-teal-200">
              {attendanceRate}%
            </span>
          </div>
        </div>
      </div>

      {/* Weekly Schedule Overview Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center space-x-2">
          <CalendarDays className="w-5 h-5 text-emerald-600" />
          <h3 className="text-base font-bold text-slate-900">
            Lịch học cố định hàng tuần các lớp cháu đang theo học
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {studentClasses.map((cls) => (
            <div
              key={cls.id}
              className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2 hover:border-emerald-200 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-sm">{cls.name}</span>
                <span className="text-[11px] px-2 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800">
                  Lớp {cls.grade}
                </span>
              </div>
              <div className="text-xs text-slate-600 space-y-1">
                <div className="flex items-center space-x-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Thời gian: <strong>{cls.schedule}</strong></span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  <span>Phòng học: {cls.room || 'Phòng học chính'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filter and Period Selection */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-slate-700">Tháng:</span>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="text-xs font-bold border border-slate-200 rounded-xl px-3 py-1.5 bg-slate-50 focus:ring-2 focus:ring-emerald-500 outline-hidden"
            >
              <option value="ALL">Tất cả tháng</option>
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <option key={m} value={String(m)}>
                  Tháng {m}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-slate-700">Năm:</span>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="text-xs font-bold border border-slate-200 rounded-xl px-3 py-1.5 bg-slate-50 focus:ring-2 focus:ring-emerald-500 outline-hidden"
            >
              {[2025, 2026, 2027].map((y) => (
                <option key={y} value={String(y)}>
                  Năm {y}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-slate-700">Lớp:</span>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="text-xs font-bold border border-slate-200 rounded-xl px-3 py-1.5 bg-slate-50 focus:ring-2 focus:ring-emerald-500 outline-hidden"
            >
              <option value="ALL">Tất cả lớp học ({studentClasses.length})</option>
              {studentClasses.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <span className="text-xs text-slate-500 font-medium">
          Hiển thị <strong>{sortedSessions.length}</strong> buổi học thực tế
        </span>
      </div>

      {/* Session & Attendance List (Read-Only) */}
      <div className="space-y-3">
        {sortedSessions.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-slate-200 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">
              Không có buổi học nào trong kỳ đã chọn
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Lịch học và nhật ký điểm danh sẽ được cập nhật tự động theo thời khóa biểu thực tế.
            </p>
          </div>
        ) : (
          sortedSessions.map((session) => {
            const cls = classes.find((c) => c.id === session.classId);
            const record = attendance.find(
              (a) => a.sessionId === session.id && a.studentId === currentStudent.id
            );
            const typeInfo = formatSessionType(session.sessionType);
            const isCancelled = session.status === 'cancelled';
            const isRescheduled = session.status === 'rescheduled';

            return (
              <div
                key={session.id}
                className={`bg-white rounded-2xl p-5 border shadow-2xs transition-all ${
                  isCancelled
                    ? 'border-rose-200 bg-rose-50/20'
                    : 'border-slate-200 hover:border-emerald-200'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  {/* Left: Date, Time, Class */}
                  <div className="flex items-start space-x-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-700 flex flex-col items-center justify-center font-bold shrink-0 border border-slate-200">
                      <span className="text-[10px] text-slate-500 uppercase">
                        {formatDayOfWeek(session.date).slice(0, 3)}
                      </span>
                      <span className="text-base font-black text-slate-900 leading-none">
                        {session.date.split('-')[2]}
                      </span>
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-900">
                          {cls?.name || 'Lớp học'}
                        </h4>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${typeInfo.color}`}
                        >
                          {typeInfo.label}
                        </span>
                        {isCancelled && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-rose-100 text-rose-800">
                            Buổi học đã hủy
                          </span>
                        )}
                        {isRescheduled && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-purple-100 text-purple-800">
                            Đã đổi lịch
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                        <span className="flex items-center space-x-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{formatDayOfWeek(session.date)}, {session.date}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{session.timeStart} - {session.timeEnd}</span>
                        </span>
                        {session.room && (
                          <span>Phòng: {session.room}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Child Attendance Status (Read-Only Badge) */}
                  <div className="flex items-center space-x-2 shrink-0">
                    {isCancelled ? (
                      <div className="px-3 py-1.5 rounded-xl bg-rose-100 text-rose-800 text-xs font-bold flex items-center space-x-1.5">
                        <XCircle className="w-4 h-4" />
                        <span>Nghỉ theo thông báo ({session.cancelReason || 'Lớp nghỉ'})</span>
                      </div>
                    ) : record?.status === 'present' ? (
                      <div className="px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center space-x-1.5 border border-emerald-200">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Cháu có mặt đầy đủ</span>
                      </div>
                    ) : record?.status === 'excused' ? (
                      <div className="px-3 py-1.5 rounded-xl bg-amber-100 text-amber-800 text-xs font-bold flex items-center space-x-1.5 border border-amber-200">
                        <AlertCircle className="w-4 h-4 text-amber-600" />
                        <span>Nghỉ có phép {record.note ? `(${record.note})` : ''}</span>
                      </div>
                    ) : record?.status === 'absent' || record?.status === 'unexcused' ? (
                      <div className="px-3 py-1.5 rounded-xl bg-rose-100 text-rose-800 text-xs font-bold flex items-center space-x-1.5 border border-rose-200">
                        <XCircle className="w-4 h-4 text-rose-600" />
                        <span>Vắng mặt {record?.note ? `(${record.note})` : ''}</span>
                      </div>
                    ) : session.status === 'completed' ? (
                      <div className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-600 text-xs font-semibold">
                        Chưa ghi nhận điểm danh
                      </div>
                    ) : (
                      <div className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 text-xs font-semibold flex items-center space-x-1 border border-blue-200">
                        <Clock className="w-3.5 h-3.5 text-blue-600" />
                        <span>Buổi học sắp tới</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Additional Note or Lesson Content if available */}
                {(session.topic || session.cancelReason) && (
                  <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-600">
                    {session.topic && (
                      <div className="flex items-center space-x-1">
                        <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                        <span>Trọng tâm buổi học: <strong className="text-slate-800">{session.topic}</strong></span>
                      </div>
                    )}
                    {session.cancelReason && (
                      <div className="text-rose-600 font-medium">
                        Lý do hủy/nghỉ: {session.cancelReason}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
