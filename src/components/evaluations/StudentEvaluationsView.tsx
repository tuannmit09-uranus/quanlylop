import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  Filter,
  MessageSquare,
  Sparkles,
  TrendingUp,
  User,
  Search,
  Star,
  Check,
} from 'lucide-react';

export const StudentEvaluationsView: React.FC = () => {
  const {
    students,
    activeStudentId,
    classes,
    lessons,
    evaluations,
    currentTenant,
  } = useApp();

  const currentStudent = students.find((s) => s.id === activeStudentId) || students[0];

  // Strictly filter evaluations for this student only
  const myEvaluations = evaluations.filter((e) => e.studentId === currentStudent.id);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClassFilter, setSelectedClassFilter] = useState('ALL');

  // Enrolled classes of this student
  const studentClasses = classes.filter((c) => currentStudent.enrolledClassIds?.includes(c.id));

  const filteredEvaluations = myEvaluations.filter((ev) => {
    const lesson = lessons.find((l) => l.id === ev.lessonId);
    const cls = classes.find((c) => c.id === ev.classId);

    const matchesClass = selectedClassFilter === 'ALL' || ev.classId === selectedClassFilter;
    const matchesSearch =
      searchTerm === '' ||
      (lesson?.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ev.remarks || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (cls?.name || '').toLowerCase().includes(searchTerm.toLowerCase());

    return matchesClass && matchesSearch;
  });

  // Calculate stats
  const validScores = myEvaluations
    .map((e) => e.classScore ?? e.homeworkScore)
    .filter((s): s is number => typeof s === 'number' && !isNaN(s));

  const avgScore =
    validScores.length > 0
      ? (validScores.reduce((a, b) => a + b, 0) / validScores.length).toFixed(1)
      : '---';

  const presentCount = myEvaluations.filter(
    (e) => e.attendanceStatus === 'present' || !e.attendanceStatus
  ).length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-200 text-xs font-semibold mb-2 border border-purple-400/30">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Sổ Điểm & Lời Phê Của Thầy Giáo</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black">
            Kết quả học tập: {currentStudent.fullName}
          </h2>
          <p className="text-purple-200 text-xs sm:text-sm mt-1">
            Trường: <strong>{currentStudent.schoolName}</strong> ({currentStudent.schoolCode}) • Lớp: <strong>{currentStudent.schoolGrade}</strong> • {currentTenant.teacherName}
          </p>
        </div>

        {/* Quick KPI Stats */}
        <div className="grid grid-cols-3 gap-3 bg-white/10 p-3 rounded-2xl border border-white/20 backdrop-blur-xs text-center">
          <div className="px-2">
            <span className="text-[11px] text-purple-200 block">Điểm TB</span>
            <span className="text-base sm:text-xl font-black text-amber-300">
              {avgScore}/10
            </span>
          </div>
          <div className="px-2 border-x border-white/15">
            <span className="text-[11px] text-purple-200 block">Đánh giá</span>
            <span className="text-base sm:text-xl font-black text-white">
              {myEvaluations.length} buổi
            </span>
          </div>
          <div className="px-2">
            <span className="text-[11px] text-purple-200 block">Chuyên cần</span>
            <span className="text-base sm:text-xl font-black text-emerald-300">
              {presentCount}/{myEvaluations.length || 1}
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center space-x-1">
            <span className="text-xs font-semibold text-slate-500">Lớp học:</span>
            <select
              value={selectedClassFilter}
              onChange={(e) => setSelectedClassFilter(e.target.value)}
              className="text-xs font-bold border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:ring-2 focus:ring-purple-500 outline-hidden"
            >
              <option value="ALL">Tất cả lớp học ({myEvaluations.length})</option>
              {studentClasses.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo tên bài học, nhận xét..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-hidden bg-slate-50/50"
          />
        </div>
      </div>

      {/* Evaluations List */}
      <div className="space-y-4">
        {filteredEvaluations.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-slate-200 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">
              Chưa có lời phê nào được ghi nhận cho bộ lọc này
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Các đánh giá, nhận xét và điểm số của Thầy giáo sau mỗi buổi học sẽ tự động hiển thị tại đây.
            </p>
          </div>
        ) : (
          filteredEvaluations.map((ev) => {
            const lesson = lessons.find((l) => l.id === ev.lessonId);
            const cls = classes.find((c) => c.id === ev.classId);

            return (
              <div
                key={ev.id}
                className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-2xs hover:border-purple-200 transition-all space-y-4"
              >
                {/* Header of Evaluation card */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold shrink-0 mt-0.5">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        {lesson?.title || 'Bài học chuyên đề'}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-500">
                        {cls && (
                          <span className="font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
                            {cls.name}
                          </span>
                        )}
                        <span className="flex items-center space-x-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>Ngày đánh giá: {ev.updated_at || 'Gần đây'}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Scores and Badges */}
                  <div className="flex items-center space-x-2 shrink-0">
                    {ev.classScore !== undefined && ev.classScore !== null && (
                      <div className="text-center px-3 py-1.5 rounded-xl bg-purple-50 border border-purple-200">
                        <span className="text-[10px] uppercase font-bold text-purple-700 block">
                          Điểm trên lớp
                        </span>
                        <span className="text-base font-black text-purple-900">
                          {ev.classScore}/10
                        </span>
                      </div>
                    )}

                    {ev.homeworkScore !== undefined && ev.homeworkScore !== null && (
                      <div className="text-center px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200">
                        <span className="text-[10px] uppercase font-bold text-emerald-700 block">
                          Điểm bài tập
                        </span>
                        <span className="text-base font-black text-emerald-900">
                          {ev.homeworkScore}/10
                        </span>
                      </div>
                    )}

                    <div className="px-2.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 flex items-center space-x-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{ev.attendanceStatus === 'present' || !ev.attendanceStatus ? 'Có mặt' : 'Vắng'}</span>
                    </div>
                  </div>
                </div>

                {/* Lesson summary if exists */}
                {lesson?.content && (
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/70 text-xs text-slate-600">
                    <strong className="text-slate-800 block text-[11px] mb-0.5">
                      Nội dung trọng tâm buổi học:
                    </strong>
                    <p className="line-clamp-2">{lesson.content}</p>
                  </div>
                )}

                {/* Teacher Remarks / Feedback */}
                <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 space-y-1">
                  <div className="flex items-center space-x-1.5 text-amber-900 font-bold text-xs">
                    <MessageSquare className="w-4 h-4 text-amber-700" />
                    <span>Lời phê của Thầy {currentTenant.teacherName}:</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-800 italic pl-5 leading-relaxed">
                    "{ev.remarks || ev.classFeedback || 'Học sinh chú ý lắng nghe, làm bài tập đầy đủ.'}"
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
