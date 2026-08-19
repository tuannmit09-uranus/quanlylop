import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Award,
  Layers,
  FileText,
  User,
  CheckCircle2,
  Save,
  Sparkles,
  BookOpen,
  Calendar,
  Search,
  Check,
  Clock,
  Filter,
} from 'lucide-react';

interface EvaluationManagerProps {
  initialClassId?: string;
  initialLessonId?: string;
}

export const EvaluationManager: React.FC<EvaluationManagerProps> = ({
  initialClassId,
  initialLessonId,
}) => {
  const {
    classes,
    students,
    lessons,
    evaluations,
    updateEvaluation,
    addEvaluation,
    currentTenant,
  } = useApp();

  // 1. Selected Class
  const [selectedClassId, setSelectedClassId] = useState<string>(
    initialClassId || classes[0]?.id || ''
  );

  const currentClass = classes.find((c) => c.id === selectedClassId);

  // Determine the grade level of the selected class
  const classGradeLevel = currentClass?.gradeLevel || (
    currentClass?.name.includes('10') ? 'Khối lớp 10' :
    currentClass?.name.includes('11') ? 'Khối lớp 11' :
    currentClass?.name.includes('12') ? 'Khối lớp 12' : 'Khối lớp 10'
  );

  // 2. Filter lessons available for this class's Grade Level
  // Multiple classes of the same grade can learn the same lesson!
  const gradeLessons = lessons.filter((l) => {
    if (l.gradeLevel) {
      return l.gradeLevel === classGradeLevel;
    }
    // Fallback if lesson has classId matching or name matching
    if (l.classId === selectedClassId) return true;
    if (classGradeLevel === 'Khối lớp 10' && (l.title.includes('10') || l.id.includes('les-1') || l.id.includes('les-2') || l.id.includes('les-3') || l.id.includes('les-4') || l.id.includes('les-5') || l.id.includes('les-6') || l.id.includes('les-7') || l.id.includes('les-8'))) return true;
    if (classGradeLevel === 'Khối lớp 11' && (l.title.includes('11') || l.id.includes('11'))) return true;
    if (classGradeLevel === 'Khối lớp 12' && (l.title.includes('12') || l.id.includes('12'))) return true;
    return false;
  });

  // Selected Lesson
  const [selectedLessonId, setSelectedLessonId] = useState<string>(() => {
    if (initialLessonId && gradeLessons.some((l) => l.id === initialLessonId)) {
      return initialLessonId;
    }
    return gradeLessons[0]?.id || '';
  });

  // When class changes, ensure selected lesson matches the new grade filter
  React.useEffect(() => {
    if (gradeLessons.length > 0) {
      if (!gradeLessons.some((l) => l.id === selectedLessonId)) {
        setSelectedLessonId(gradeLessons[0].id);
      }
    } else {
      setSelectedLessonId('');
    }
  }, [selectedClassId, classGradeLevel]);

  const currentLesson = gradeLessons.find((l) => l.id === selectedLessonId) || gradeLessons[0];

  // Students in selected class
  const classStudents = students.filter((s) => currentClass?.studentIds.includes(s.id));

  // State for form feedback and notifications
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [studentFilter, setStudentFilter] = useState('');

  // Quick feedback phrases
  const quickPhrases = [
    'Nắm chắc lý thuyết và giải bài nhanh, chuẩn xác.',
    'Cần rèn luyện thêm kỹ năng tính toán tránh nhầm lẫn.',
    'Tập trung nghe giảng, tích cực phát biểu xây dựng bài.',
    'Có nhiều ý tưởng giải toán thông minh, sáng tạo.',
    'Cần hoàn thiện bài tập về nhà đầy đủ và chi tiết hơn.',
    'Tiến bộ rõ rệt so với các buổi học trước.',
  ];

  const handleScoreChange = (studentId: string, score: number) => {
    if (!currentLesson) return;
    const existing = evaluations.find(
      (e) => e.studentId === studentId && e.lessonId === currentLesson.id
    );
    if (existing) {
      updateEvaluation(existing.id, { classScore: score });
    } else {
      addEvaluation?.({
        studentId,
        lessonId: currentLesson.id,
        classScore: score,
        classFeedback: 'Tiếp thu bài tốt, chăm chú nghe giảng',
        homeworkScore: 9.0,
        homeworkFeedback: 'Làm bài tập đầy đủ',
        attitude: 'Tập trung và tích cực',
      });
    }
    showSavedNotification(studentId);
  };

  const handleHomeworkScoreChange = (studentId: string, score: number) => {
    if (!currentLesson) return;
    const existing = evaluations.find(
      (e) => e.studentId === studentId && e.lessonId === currentLesson.id
    );
    if (existing) {
      updateEvaluation(existing.id, { homeworkScore: score });
    } else {
      addEvaluation?.({
        studentId,
        lessonId: currentLesson.id,
        classScore: 8.5,
        classFeedback: 'Tiếp thu bài tốt',
        homeworkScore: score,
        homeworkFeedback: 'Đã hoàn thành bài tập về nhà',
        attitude: 'Tập trung và tích cực',
      });
    }
    showSavedNotification(studentId);
  };

  const handleFeedbackChange = (studentId: string, feedback: string) => {
    if (!currentLesson) return;
    const existing = evaluations.find(
      (e) => e.studentId === studentId && e.lessonId === currentLesson.id
    );
    if (existing) {
      updateEvaluation(existing.id, { classFeedback: feedback, remarks: feedback });
    } else {
      addEvaluation?.({
        studentId,
        lessonId: currentLesson.id,
        classScore: 8.5,
        classFeedback: feedback,
        homeworkScore: 9.0,
        homeworkFeedback: 'Làm bài tập đầy đủ',
        attitude: 'Tập trung và tích cực',
      });
    }
  };

  const handleAttitudeChange = (studentId: string, attitude: string) => {
    if (!currentLesson) return;
    const existing = evaluations.find(
      (e) => e.studentId === studentId && e.lessonId === currentLesson.id
    );
    if (existing) {
      updateEvaluation(existing.id, { attitude });
    } else {
      addEvaluation?.({
        studentId,
        lessonId: currentLesson.id,
        classScore: 8.5,
        classFeedback: 'Tiếp thu bài tốt',
        homeworkScore: 9.0,
        attitude,
      });
    }
    showSavedNotification(studentId);
  };

  const applyQuickPhrase = (studentId: string, phrase: string) => {
    const existing = evaluations.find(
      (e) => e.studentId === studentId && e.lessonId === currentLesson?.id
    );
    const currentFb = existing?.classFeedback || '';
    const newFb = currentFb ? `${currentFb} ${phrase}` : phrase;
    handleFeedbackChange(studentId, newFb);
    showSavedNotification(studentId);
  };

  const showSavedNotification = (studentId: string) => {
    setSaveSuccess(studentId);
    setTimeout(() => setSaveSuccess(null), 2000);
  };

  const filteredStudents = classStudents.filter((s) =>
    s.fullName.toLowerCase().includes(studentFilter.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-7 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold mb-2 border border-blue-400/30">
            <Award className="w-3.5 h-3.5" />
            <span>Sổ Đánh Giá & Nhận Xét Định Kỳ</span>
          </div>
          <h2 className="text-2xl font-black tracking-tight">
            Nhận xét & Điểm số học sinh
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm mt-1">
            Ghi nhận điểm trên lớp, điểm bài tập và lời phê của Thầy {currentTenant.teacherName} gửi đến phụ huynh.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/20 text-center">
            <span className="text-[11px] text-blue-200 block font-medium">Sĩ số lớp</span>
            <span className="text-xl font-black text-white">{classStudents.length} HS</span>
          </div>
          <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/20 text-center">
            <span className="text-[11px] text-emerald-300 block font-medium">Bài học khối</span>
            <span className="text-xl font-black text-emerald-300">{gradeLessons.length}</span>
          </div>
        </div>
      </div>

      {/* Class & Lesson Selectors */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* 1. Select Class */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span className="flex items-center space-x-1.5">
                <Layers className="w-4 h-4 text-blue-600" />
                <span>1. Chọn Lớp học:</span>
              </span>
              <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                {classGradeLevel}
              </span>
            </label>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-2xl p-3 text-sm font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-hidden transition-all cursor-pointer"
            >
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.gradeLevel ? `(${c.gradeLevel})` : ''} - {c.subjectName} ({c.studentIds.length} học sinh)
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-500 mt-1.5">
              Phòng: {currentClass?.room || 'Phòng 201'} • Đơn giá: {currentClass?.feePerSession?.toLocaleString('vi-VN')} đ/buổi
            </p>
          </div>

          {/* 2. Select Lesson (Filtered by Grade Level of selected Class) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span className="flex items-center space-x-1.5">
                <FileText className="w-4 h-4 text-indigo-600" />
                <span>2. Chọn Bài học ({classGradeLevel}):</span>
              </span>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                {gradeLessons.length} bài phù hợp
              </span>
            </label>
            {gradeLessons.length === 0 ? (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-800 font-medium">
                Chưa có bài học nào được tạo cho <span className="font-bold">{classGradeLevel}</span>. Vui lòng chuyển sang menu <span className="font-bold underline">Bài học</span> để thêm bài học mới.
              </div>
            ) : (
              <select
                value={selectedLessonId}
                onChange={(e) => setSelectedLessonId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-2xl p-3 text-sm font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-hidden transition-all cursor-pointer"
              >
                {gradeLessons.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.title}
                  </option>
                ))}
              </select>
            )}
            <p className="text-[11px] text-slate-500 mt-1.5">
              💡 Nhiều lớp cùng thuộc <span className="font-semibold text-slate-700">{classGradeLevel}</span> có thể dùng chung bài học này.
            </p>
          </div>
        </div>

        {/* Current Lesson Summary Box */}
        {currentLesson && (
          <div className="bg-gradient-to-br from-slate-50 to-blue-50/50 p-4 rounded-2xl border border-blue-100 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center space-x-2">
                <BookOpen className="w-4 h-4 text-blue-600" />
                <h4 className="text-xs font-bold text-slate-900 uppercase">
                  Nội dung & Tóm tắt giáo án của bài học đang chọn
                </h4>
              </div>
              <span className="text-[11px] font-bold text-blue-700 bg-blue-100/70 px-2.5 py-0.5 rounded-full">
                {currentLesson.gradeLevel || classGradeLevel}
              </span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed font-medium">
              <span className="font-bold text-slate-900">Tóm tắt: </span>
              {currentLesson.content || 'Chưa cập nhật nội dung tóm tắt giáo án.'}
            </p>
            {currentLesson.homeworkSummary && (
              <p className="text-xs text-indigo-900 bg-indigo-50/80 p-2.5 rounded-xl border border-indigo-100 font-medium">
                <span className="font-bold text-indigo-950">Bài tập về nhà: </span>
                {currentLesson.homeworkSummary}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Main Grading and Feedback Table */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <Award className="w-5 h-5 text-blue-600" />
              <span>Bảng chấm điểm & Lời phê của Thầy giáo</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Đang chấm cho lớp <span className="font-bold text-slate-800">{currentClass?.name}</span> • Bài: <span className="font-bold text-blue-700">{currentLesson?.title || 'Chưa chọn bài'}</span>
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm học sinh..."
                value={studentFilter}
                onChange={(e) => setStudentFilter(e.target.value)}
                className="pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-hidden w-44"
              />
            </div>
          </div>
        </div>

        {!currentLesson ? (
          <div className="py-12 text-center text-slate-400">
            <BookOpen className="w-10 h-10 mx-auto mb-2 text-slate-300" />
            <p className="text-sm font-medium">Vui lòng chọn bài học để bắt đầu chấm điểm và nhập nhận xét.</p>
          </div>
        ) : classStudents.length === 0 ? (
          <div className="py-12 text-center text-slate-400">
            <User className="w-10 h-10 mx-auto mb-2 text-slate-300" />
            <p className="text-sm font-medium">Lớp học này hiện chưa có học sinh nào.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredStudents.map((student, index) => {
              const evalItem = evaluations.find(
                (e) => e.studentId === student.id && e.lessonId === currentLesson.id
              );
              const score = evalItem?.classScore ?? 9.0;
              const hwScore = evalItem?.homeworkScore ?? 9.0;
              const feedback = evalItem?.classFeedback || evalItem?.remarks || '';
              const attitude = evalItem?.attitude || 'Tập trung và tích cực phát biểu xây dựng bài';
              const isSaved = saveSuccess === student.id;

              return (
                <div
                  key={student.id}
                  className="bg-slate-50/70 hover:bg-slate-50 rounded-2xl p-5 border border-slate-200 transition-all space-y-4"
                >
                  {/* Top row: Student info & Scores */}
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 font-black text-sm flex items-center justify-center shrink-0">
                        {index + 1}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-slate-900 text-sm">
                            {student.fullName}
                          </span>
                          <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600 font-semibold">
                            {student.schoolCode}
                          </span>
                          <span className="text-[11px] text-slate-400 font-medium">
                            K{String(student.birthYear).slice(-2)}
                          </span>
                        </div>
                        <span className="text-xs text-slate-500">
                          Phụ huynh: {student.parentName} ({student.parentPhone})
                        </span>
                      </div>
                    </div>

                    {/* Scores row */}
                    <div className="flex flex-wrap items-center gap-3">
                      {/* Class Score */}
                      <div className="bg-white px-3 py-2 rounded-xl border border-slate-200 flex items-center space-x-2">
                        <span className="text-xs font-bold text-slate-600">Điểm lớp:</span>
                        <input
                          type="number"
                          min="0"
                          max="10"
                          step="0.1"
                          value={score}
                          onChange={(e) => handleScoreChange(student.id, parseFloat(e.target.value) || 0)}
                          className="w-14 text-center font-black text-blue-700 bg-blue-50 border border-blue-200 rounded-lg py-1 text-sm focus:ring-2 focus:ring-blue-500 outline-hidden"
                        />
                        <span className="text-xs text-slate-400">/ 10</span>
                      </div>

                      {/* Homework Score */}
                      <div className="bg-white px-3 py-2 rounded-xl border border-slate-200 flex items-center space-x-2">
                        <span className="text-xs font-bold text-slate-600">Điểm BTVN:</span>
                        <input
                          type="number"
                          min="0"
                          max="10"
                          step="0.1"
                          value={hwScore}
                          onChange={(e) => handleHomeworkScoreChange(student.id, parseFloat(e.target.value) || 0)}
                          className="w-14 text-center font-black text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg py-1 text-sm focus:ring-2 focus:ring-emerald-500 outline-hidden"
                        />
                        <span className="text-xs text-slate-400">/ 10</span>
                      </div>

                      {/* Saved indicator */}
                      {isSaved && (
                        <span className="inline-flex items-center space-x-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1.5 rounded-xl border border-emerald-200 animate-fade-in">
                          <Check className="w-3.5 h-3.5" />
                          <span>Đã lưu</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Attitude row */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-xs">
                    <span className="font-bold text-slate-700 shrink-0">Thái độ học tập:</span>
                    <select
                      value={attitude}
                      onChange={(e) => handleAttitudeChange(student.id, e.target.value)}
                      className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 font-medium focus:ring-2 focus:ring-blue-500 outline-hidden cursor-pointer"
                    >
                      <option value="Tập trung và tích cực phát biểu xây dựng bài">Tập trung và tích cực phát biểu xây dựng bài</option>
                      <option value="Tiếp thu bài nhanh, chủ động giải bài khó">Tiếp thu bài nhanh, chủ động giải bài khó</option>
                      <option value="Ngoan ngoãn, lắng nghe nhưng còn ít phát biểu">Ngoan ngoãn, lắng nghe nhưng còn ít phát biểu</option>
                      <option value="Đôi lúc còn mất tập trung, cần nhắc nhở nhẹ">Đôi lúc còn mất tập trung, cần nhắc nhở nhẹ</option>
                      <option value="Đi học muộn hoặc chưa chuẩn bị kỹ bài tập">Đi học muộn hoặc chưa chuẩn bị kỹ bài tập</option>
                    </select>
                  </div>

                  {/* Feedback text area */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                      <span>Lời phê chi tiết của Thầy giáo:</span>
                      <span className="text-[11px] text-slate-400 font-normal">
                        (Phụ huynh sẽ đọc được lời phê này trên Cổng tra cứu)
                      </span>
                    </label>
                    <textarea
                      rows={2}
                      value={feedback}
                      onChange={(e) => handleFeedbackChange(student.id, e.target.value)}
                      onBlur={() => showSavedNotification(student.id)}
                      placeholder="Nhập nhận xét cụ thể về sự tiến bộ, điểm mạnh và điểm cần cải thiện của học sinh..."
                      className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs text-slate-800 focus:ring-2 focus:ring-blue-500 outline-hidden font-medium leading-relaxed"
                    />

                    {/* Quick Suggestion Tags */}
                    <div className="flex flex-wrap items-center gap-1.5 mt-2">
                      <span className="text-[11px] font-bold text-slate-400 flex items-center space-x-1">
                        <Sparkles className="w-3 h-3 text-amber-500" />
                        <span>Mẫu câu nhanh:</span>
                      </span>
                      {quickPhrases.map((phrase, pIdx) => (
                        <button
                          key={pIdx}
                          type="button"
                          onClick={() => applyQuickPhrase(student.id, phrase)}
                          className="text-[11px] bg-white hover:bg-blue-50 hover:text-blue-700 text-slate-600 px-2.5 py-1 rounded-lg border border-slate-200 transition-colors font-medium cursor-pointer"
                        >
                          + {phrase}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
