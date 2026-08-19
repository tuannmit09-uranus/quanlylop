import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { RecurringSchedule, DayOfWeek, LessonSession } from '../../types';
import { formatDayOfWeek } from '../../utils/vietqr';
import {
  Calendar,
  Plus,
  Edit2,
  Trash2,
  Sparkles,
  Clock,
  Layers,
  ArrowRight,
  CheckCircle2,
  Check,
  X,
  CalendarCheck,
  Info,
  ExternalLink,
  BookOpen,
  CalendarDays,
  ShieldCheck,
} from 'lucide-react';

interface GenerationResultData {
  month: number;
  year: number;
  isAllClasses: boolean;
  targetClassName?: string;
  targetClassSubject?: string;
  newSessionsCount: number;
  createdSessions: LessonSession[];
  totalMonthSessions: number;
  classSummaries: {
    classId: string;
    className: string;
    subjectName: string;
    newCount: number;
    totalMonthCount: number;
    scheduleDays: string;
  }[];
}

export interface ScheduleNavigationParams {
  month?: number | string;
  year?: number | string;
  classId?: string;
  sessionType?: string;
}

interface ScheduleManagerProps {
  onNavigate?: (tab: string, params?: ScheduleNavigationParams) => void;
}

export const ScheduleManager: React.FC<ScheduleManagerProps> = ({ onNavigate }) => {
  const {
    recurringSchedules,
    addRecurringSchedule,
    updateRecurringSchedule,
    deleteRecurringSchedule,
    classes,
    generateSessionsForMonth,
    lessonSessions,
  } = useApp();

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [classId, setClassId] = useState(classes[0]?.id || '');
  const [dayOfWeek, setDayOfWeek] = useState<DayOfWeek>(2);
  const [startTime, setStartTime] = useState('18:00');
  const [endTime, setEndTime] = useState('20:00');

  const [genMonth, setGenMonth] = useState(8);
  const [genYear, setGenYear] = useState(2026);

  // Result Pop-up Modal state
  const [generationResult, setGenerationResult] = useState<GenerationResultData | null>(null);

  const openCreateModal = () => {
    setEditingId(null);
    setClassId(classes[0]?.id || '');
    setDayOfWeek(2);
    setStartTime('18:00');
    setEndTime('20:00');
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cls = classes.find((c) => c.id === classId);
    if (!cls) return;

    if (editingId) {
      updateRecurringSchedule(editingId, {
        classId,
        className: cls.name,
        dayOfWeek,
        startTime,
        endTime,
      });
    } else {
      addRecurringSchedule({
        classId,
        className: cls.name,
        dayOfWeek,
        startTime,
        endTime,
        startDate: '2026-06-01',
        status: 'active',
      });
    }
    setShowModal(false);
  };

  // Helper to format date DD/MM/YYYY
  const formatDateVN = (dateStr: string) => {
    const [y, m, d] = dateStr.split('-');
    return `${d}/${m}/${y}`;
  };

  // Generate sessions for a single class
  const handleGenerate = (targetClassId: string) => {
    const cls = classes.find((c) => c.id === targetClassId);
    if (!cls) return;

    // Generate sessions and receive newly created items
    const newSessions = generateSessionsForMonth(targetClassId, genMonth, genYear);

    // Get all sessions in that month for this class
    const monthStr = String(genMonth).padStart(2, '0');
    const existingAndNewForClass = lessonSessions
      .filter((s) => {
        const [sYear, sMonth] = s.date.split('-');
        return s.classId === targetClassId && sYear === String(genYear) && sMonth === monthStr;
      })
      .concat(newSessions.filter((ns) => !lessonSessions.some((ls) => ls.id === ns.id)));

    // Schedules description
    const classScheds = recurringSchedules.filter(
      (s) => s.classId === targetClassId && s.status === 'active'
    );
    const schedDays =
      classScheds.length > 0
        ? classScheds.map((s) => `${formatDayOfWeek(s.dayOfWeek)} (${s.startTime}-${s.endTime})`).join(', ')
        : 'Chưa có lịch';

    setGenerationResult({
      month: genMonth,
      year: genYear,
      isAllClasses: false,
      targetClassName: cls.name,
      targetClassSubject: cls.subjectName,
      newSessionsCount: newSessions.length,
      createdSessions: newSessions,
      totalMonthSessions: existingAndNewForClass.length,
      classSummaries: [
        {
          classId: cls.id,
          className: cls.name,
          subjectName: cls.subjectName,
          newCount: newSessions.length,
          totalMonthCount: existingAndNewForClass.length,
          scheduleDays: schedDays,
        },
      ],
    });
  };

  // Generate sessions for all classes
  const handleGenerateAll = () => {
    let allNewSessions: LessonSession[] = [];
    const summaries: GenerationResultData['classSummaries'] = [];
    const monthStr = String(genMonth).padStart(2, '0');

    classes.forEach((c) => {
      const created = generateSessionsForMonth(c.id, genMonth, genYear);
      allNewSessions = allNewSessions.concat(created);

      const totalForClass = lessonSessions
        .filter((s) => {
          const [sYear, sMonth] = s.date.split('-');
          return s.classId === c.id && sYear === String(genYear) && sMonth === monthStr;
        })
        .concat(created.filter((ns) => !lessonSessions.some((ls) => ls.id === ns.id))).length;

      const classScheds = recurringSchedules.filter(
        (s) => s.classId === c.id && s.status === 'active'
      );
      const schedDays =
        classScheds.length > 0
          ? classScheds.map((s) => `${formatDayOfWeek(s.dayOfWeek)} (${s.startTime}-${s.endTime})`).join(', ')
          : 'Chưa có lịch';

      summaries.push({
        classId: c.id,
        className: c.name,
        subjectName: c.subjectName,
        newCount: created.length,
        totalMonthCount: totalForClass,
        scheduleDays: schedDays,
      });
    });

    const totalMonthSessionsAll = lessonSessions
      .filter((s) => {
        const [sYear, sMonth] = s.date.split('-');
        return sYear === String(genYear) && sMonth === monthStr;
      })
      .concat(allNewSessions.filter((ns) => !lessonSessions.some((ls) => ls.id === ns.id))).length;

    setGenerationResult({
      month: genMonth,
      year: genYear,
      isAllClasses: true,
      newSessionsCount: allNewSessions.length,
      createdSessions: allNewSessions,
      totalMonthSessions: totalMonthSessionsAll,
      classSummaries: summaries,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-1 border border-blue-200">
            <Calendar className="w-3.5 h-3.5" />
            <span>Lịch Học & Thời Khóa Biểu</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Quản Lý Lịch Học Cố Định</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Quy tắc BR-003: Lịch cố định là cấu hình tuần, dùng để tự động sinh các buổi học thực tế theo tháng và tính học phí chính xác.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm lịch cố định mới</span>
        </button>
      </div>

      {/* Auto-generate Sessions Banner */}
      <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-slate-50 border border-blue-200/90 rounded-3xl p-5 sm:p-6 shadow-2xs flex flex-col lg:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                Tự Động Sinh Buổi Học Thực Tế Cho Tháng
              </h3>
              <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 text-[10px] font-bold">
                Chuẩn BR-003
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
              Hệ thống sẽ quét các thứ trong tuần của lịch cố định để sinh các ngày học dự kiến của tháng đã chọn (chống trùng lặp tự động).
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-end">
          <select
            value={genMonth}
            onChange={(e) => setGenMonth(Number(e.target.value))}
            className="text-xs font-bold border border-blue-300 rounded-xl px-3 py-2 bg-white text-slate-800 focus:ring-2 focus:ring-blue-500 outline-hidden cursor-pointer"
          >
            {[6, 7, 8, 9, 10, 11, 12].map((m) => (
              <option key={m} value={m}>
                Tháng {m}
              </option>
            ))}
          </select>

          <select
            value={genYear}
            onChange={(e) => setGenYear(Number(e.target.value))}
            className="text-xs font-bold border border-blue-300 rounded-xl px-3 py-2 bg-white text-slate-800 focus:ring-2 focus:ring-blue-500 outline-hidden cursor-pointer"
          >
            <option value={2026}>Năm 2026</option>
            <option value={2027}>Năm 2027</option>
          </select>

          <button
            type="button"
            onClick={handleGenerateAll}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-md shadow-blue-600/20 transition-all flex items-center space-x-1.5 cursor-pointer active:scale-98"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Sinh toàn bộ buổi học</span>
          </button>
        </div>
      </div>

      {/* Schedule Cards Grid by Classes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {classes.map((cls) => {
          const classSchedules = recurringSchedules.filter((s) => s.classId === cls.id);
          return (
            <div
              key={cls.id}
              className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs space-y-4 flex flex-col justify-between hover:border-blue-300 transition-colors"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                      {cls.subjectName}
                    </span>
                    <h3 className="font-bold text-slate-900 text-sm mt-1">{cls.name}</h3>
                  </div>
                  <span className="text-xs text-slate-400 font-medium bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-100">
                    {cls.studentIds.length} Học sinh
                  </span>
                </div>

                <div className="space-y-2 pt-1">
                  {classSchedules.map((sched) => (
                    <div
                      key={sched.id}
                      className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center space-x-2.5">
                        <div className="w-7 h-7 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                          <Calendar className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 block">
                            {formatDayOfWeek(sched.dayOfWeek)}
                          </span>
                          <span className="text-slate-500 font-mono text-[11px]">
                            {sched.startTime} - {sched.endTime}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-1">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingId(sched.id);
                            setClassId(sched.classId);
                            setDayOfWeek(sched.dayOfWeek);
                            setStartTime(sched.startTime);
                            setEndTime(sched.endTime);
                            setShowModal(true);
                          }}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-white rounded-lg transition-colors cursor-pointer"
                          title="Sửa lịch"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Bạn có chắc muốn xóa lịch ${formatDayOfWeek(sched.dayOfWeek)} của lớp ${cls.name}?`)) {
                              deleteRecurringSchedule(sched.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-white rounded-lg transition-colors cursor-pointer"
                          title="Xóa lịch"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {classSchedules.length === 0 && (
                    <p className="text-xs text-slate-400 italic py-3 text-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                      Chưa thiết lập lịch học cố định cho lớp này.
                    </p>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400 text-[11px]">
                  {classSchedules.length} buổi / tuần
                </span>

                <button
                  type="button"
                  onClick={() => handleGenerate(cls.id)}
                  className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl font-bold transition-all flex items-center space-x-1.5 border border-blue-200 cursor-pointer active:scale-98"
                >
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  <span>Sinh buổi tháng {genMonth}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* POP-UP MODAL: Generation Result (Pop-up thông báo tự động sinh buổi học) */}
      {generationResult && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold border border-emerald-200">
                  <CalendarCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    Kết Quả Tự Động Sinh Buổi Học Tháng {generationResult.month}/{generationResult.year}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {generationResult.isAllClasses
                      ? 'Đã áp dụng cho toàn bộ các lớp học'
                      : `Áp dụng cho lớp: ${generationResult.targetClassName} (${generationResult.targetClassSubject})`}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setGenerationResult(null)}
                className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Modal Content */}
            <div className="space-y-4 overflow-y-auto pr-1 text-xs flex-1">
              {/* Notification Banner */}
              {generationResult.newSessionsCount > 0 ? (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start space-x-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-bold text-emerald-900 text-xs sm:text-sm">
                      Đã tự động sinh thành công {generationResult.newSessionsCount} buổi học dự kiến Tháng {generationResult.month}/{generationResult.year}!
                    </p>
                    <p className="text-emerald-700 text-xs leading-relaxed">
                      Các buổi học được tạo tự động theo đúng khung giờ và thứ trong tuần của lịch cố định. Trạng thái: <strong>Dự kiến (Scheduled)</strong> và được gắn cờ <strong>Có tính học phí (fee_eligible)</strong> theo quy tắc BR-003.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl flex items-start space-x-3">
                  <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-bold text-blue-900 text-xs sm:text-sm">
                      Các buổi học Tháng {generationResult.month}/{generationResult.year} đã tồn tại đầy đủ!
                    </p>
                    <p className="text-blue-700 text-xs leading-relaxed">
                      Hệ thống đã nhận diện các buổi học của tháng này đã được tạo từ trước. Cơ chế chống trùng lặp tự động giữ nguyên dữ liệu điểm danh và tiến độ hiện tại.
                    </p>
                  </div>
                </div>
              )}

              {/* Quick KPI Stats Grid */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-center">
                  <span className="text-[11px] font-semibold text-slate-500 block">Buổi tạo mới</span>
                  <span className="text-xl font-black text-emerald-600 mt-1 block">
                    +{generationResult.newSessionsCount}
                  </span>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-center">
                  <span className="text-[11px] font-semibold text-slate-500 block">Tổng buổi trong tháng</span>
                  <span className="text-xl font-black text-blue-600 mt-1 block">
                    {generationResult.totalMonthSessions}
                  </span>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-center">
                  <span className="text-[11px] font-semibold text-slate-500 block">Số lớp áp dụng</span>
                  <span className="text-xl font-black text-indigo-600 mt-1 block">
                    {generationResult.classSummaries.length}
                  </span>
                </div>
              </div>

              {/* Class-by-class summary breakdown */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 text-xs flex items-center space-x-1.5">
                  <Layers className="w-4 h-4 text-blue-600" />
                  <span>Chi tiết theo từng lớp học:</span>
                </h4>

                <div className="space-y-2">
                  {generationResult.classSummaries.map((summary) => (
                    <div
                      key={summary.classId}
                      className="p-3 bg-white border border-slate-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                    >
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-slate-900">{summary.className}</span>
                          <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-semibold text-[10px]">
                            {summary.subjectName}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Lịch tuần: {summary.scheduleDays}
                        </p>
                      </div>

                      <div className="flex items-center space-x-3 text-right">
                        <div>
                          <span className="text-[11px] text-slate-400 block">Tạo mới</span>
                          <span className="font-bold text-emerald-600 font-mono text-xs">
                            +{summary.newCount} buổi
                          </span>
                        </div>
                        <div className="pl-3 border-l border-slate-200">
                          <span className="text-[11px] text-slate-400 block">Tổng số buổi</span>
                          <span className="font-bold text-blue-700 font-mono text-xs">
                            {summary.totalMonthCount} buổi
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Preview newly created sessions if any */}
              {generationResult.createdSessions.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <h4 className="font-bold text-slate-900 text-xs flex items-center space-x-1.5">
                    <CalendarDays className="w-4 h-4 text-emerald-600" />
                    <span>Danh sách {generationResult.createdSessions.length} buổi học vừa sinh:</span>
                  </h4>

                  <div className="max-h-48 overflow-y-auto rounded-2xl border border-slate-200 divide-y divide-slate-100">
                    {generationResult.createdSessions.map((session) => (
                      <div
                        key={session.id}
                        className="p-2.5 bg-slate-50/60 hover:bg-slate-50 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center space-x-2.5">
                          <span className="font-bold text-blue-700 w-16">
                            {formatDayOfWeek(session.dayOfWeek)}
                          </span>
                          <span className="font-mono text-slate-700">
                            {formatDateVN(session.date)}
                          </span>
                          <span className="text-slate-400 font-mono text-[11px]">
                            ({session.startTime} - {session.endTime})
                          </span>
                        </div>

                        <div className="flex items-center space-x-2">
                          <span className="text-slate-600 font-medium text-[11px]">
                            {session.className}
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                            Dự kiến
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100 shrink-0">
              <div className="flex items-center space-x-1.5 text-slate-500 text-[11px]">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Số buổi học thực tế sẽ được tự động tính vào bảng học phí tháng.</span>
              </div>

              <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={() => setGenerationResult(null)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Đóng thông báo
                </button>

                {onNavigate && (
                  <button
                    type="button"
                    onClick={() => {
                      const targetClassId = generationResult.isAllClasses
                        ? 'ALL'
                        : (generationResult.classSummaries[0]?.classId || 'ALL');

                      onNavigate('sessions', {
                        month: generationResult.month,
                        year: generationResult.year,
                        classId: targetClassId,
                      });
                      setGenerationResult(null);
                    }}
                    className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-colors flex items-center space-x-1.5 shadow-xs cursor-pointer active:scale-98"
                  >
                    <span>Xem Buổi Học Thực Tế</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Create / Edit Recurring Schedule */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 pb-3 border-b border-slate-100">
              {editingId ? 'Chỉnh sửa lịch cố định' : 'Thêm lịch học cố định'}
            </h3>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Chọn lớp học:</label>
                <select
                  value={classId}
                  onChange={(e) => setClassId(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl p-2.5 bg-white font-medium outline-hidden"
                >
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name} ({cls.subjectName})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Thứ trong tuần:</label>
                <select
                  value={dayOfWeek}
                  onChange={(e) => setDayOfWeek(Number(e.target.value) as DayOfWeek)}
                  className="w-full border border-slate-300 rounded-xl p-2.5 bg-white font-medium outline-hidden"
                >
                  <option value={1}>Thứ 2</option>
                  <option value={2}>Thứ 3</option>
                  <option value={3}>Thứ 4</option>
                  <option value={4}>Thứ 5</option>
                  <option value={5}>Thứ 6</option>
                  <option value={6}>Thứ 7</option>
                  <option value={0}>Chủ Nhật</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Giờ bắt đầu:</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl p-2.5 outline-hidden"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Giờ kết thúc:</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl p-2.5 outline-hidden"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800 font-medium cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md transition-colors cursor-pointer"
                >
                  {editingId ? 'Cập nhật' : 'Lưu lịch cố định'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

