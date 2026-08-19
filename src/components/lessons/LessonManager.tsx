import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Lesson } from '../../types';
import {
  FileText,
  Plus,
  Search,
  Filter,
  Layers,
  BookOpen,
  Edit2,
  Trash2,
  X,
  CheckCircle2,
  Calendar,
  Sparkles,
  Award,
  ChevronRight,
} from 'lucide-react';

interface LessonManagerProps {
  onNavigateToEvaluations?: (lessonId: string, classId?: string) => void;
}

export const LessonManager: React.FC<LessonManagerProps> = ({
  onNavigateToEvaluations,
}) => {
  const {
    lessons,
    addLesson,
    updateLesson,
    deleteLesson,
    classes,
    currentTenant,
  } = useApp();

  // Filters state
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Modal State for Add/Edit Lesson
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [gradeLevel, setGradeLevel] = useState('Khối lớp 10');
  const [content, setContent] = useState('');
  const [homeworkSummary, setHomeworkSummary] = useState('');

  // Open modal for Create
  const handleOpenCreate = () => {
    setEditingLessonId(null);
    setTitle('');
    setGradeLevel(selectedGrade !== 'all' ? selectedGrade : 'Khối lớp 10');
    setContent('');
    setHomeworkSummary('');
    setIsModalOpen(true);
  };

  // Open modal for Edit
  const handleOpenEdit = (lesson: Lesson) => {
    setEditingLessonId(lesson.id);
    setTitle(lesson.title);
    setGradeLevel(lesson.gradeLevel || 'Khối lớp 10');
    setContent(lesson.content || '');
    setHomeworkSummary(lesson.homeworkSummary || '');
    setIsModalOpen(true);
  };

  // Handle Save (Create or Update)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (editingLessonId) {
      updateLesson(editingLessonId, {
        title: title.trim(),
        gradeLevel,
        content: content.trim(),
        homeworkSummary: homeworkSummary.trim(),
      });
    } else {
      addLesson({
        title: title.trim(),
        gradeLevel,
        content: content.trim(),
        homeworkSummary: homeworkSummary.trim(),
        date: new Date().toISOString().split('T')[0],
      });
    }
    setIsModalOpen(false);
  };

  // Handle Delete
  const handleDelete = (lessonId: string, lessonTitle: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa bài học "${lessonTitle}"?`)) {
      if (deleteLesson) {
        deleteLesson(lessonId);
      } else {
        updateLesson(lessonId, { status: 'deleted' });
      }
    }
  };

  // Filter lessons
  const filteredLessons = lessons.filter((lesson) => {
    const matchesGrade =
      selectedGrade === 'all' ||
      lesson.gradeLevel === selectedGrade ||
      (!lesson.gradeLevel && selectedGrade === 'Khối lớp 10');

    const matchesSearch =
      lesson.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lesson.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lesson.homeworkSummary?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesGrade && matchesSearch;
  });

  // Calculate statistics per grade
  const grade10Count = lessons.filter((l) => l.gradeLevel === 'Khối lớp 10' || !l.gradeLevel).length;
  const grade11Count = lessons.filter((l) => l.gradeLevel === 'Khối lớp 11').length;
  const grade12Count = lessons.filter((l) => l.gradeLevel === 'Khối lớp 12').length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-7 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold mb-2 border border-blue-400/30">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Ngân Hàng Bài Học & Giáo Án • {currentTenant.schoolSubject}</span>
          </div>
          <h2 className="text-2xl font-black tracking-tight">
            Quản lý Bài học theo Khối
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm mt-1">
            Thiết kế bài học chuẩn hóa theo từng khối lớp (Khối 10, 11, 12), tóm tắt giáo án và bài tập về nhà.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="inline-flex items-center justify-center space-x-2 px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-600/30 transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm bài học mới</span>
        </button>
      </div>

      {/* Grade Level Filter Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          type="button"
          onClick={() => setSelectedGrade('all')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            selectedGrade === 'all'
              ? 'bg-blue-600 text-white border-blue-600 shadow-md'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <span className="text-xs font-semibold block opacity-80">Tất cả bài học</span>
          <span className="text-2xl font-black">{lessons.length}</span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedGrade('Khối lớp 10')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            selectedGrade === 'Khối lớp 10'
              ? 'bg-blue-600 text-white border-blue-600 shadow-md'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <span className="text-xs font-semibold block opacity-80">Khối lớp 10</span>
          <span className="text-2xl font-black">{grade10Count}</span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedGrade('Khối lớp 11')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            selectedGrade === 'Khối lớp 11'
              ? 'bg-blue-600 text-white border-blue-600 shadow-md'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <span className="text-xs font-semibold block opacity-80">Khối lớp 11</span>
          <span className="text-2xl font-black">{grade11Count}</span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedGrade('Khối lớp 12')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            selectedGrade === 'Khối lớp 12'
              ? 'bg-blue-600 text-white border-blue-600 shadow-md'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <span className="text-xs font-semibold block opacity-80">Khối lớp 12</span>
          <span className="text-2xl font-black">{grade12Count}</span>
        </button>
      </div>

      {/* Search & Actions Bar */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm kiếm bài học, nội dung giáo án, bài tập..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-blue-500 outline-hidden"
          />
        </div>

        <div className="flex items-center space-x-2 text-xs font-semibold text-slate-500">
          <span>Đang hiển thị {filteredLessons.length} bài học</span>
          {selectedGrade !== 'all' && (
            <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md font-bold">
              {selectedGrade}
            </span>
          )}
        </div>
      </div>

      {/* Lesson List Cards */}
      {filteredLessons.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-xs space-y-3">
          <BookOpen className="w-12 h-12 mx-auto text-slate-300" />
          <h3 className="text-base font-bold text-slate-800">Không tìm thấy bài học nào</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Chưa có bài học nào phù hợp với bộ lọc hoặc từ khóa tìm kiếm. Nhấn nút "Thêm bài học mới" để tạo bài học đầu tiên.
          </p>
          <button
            type="button"
            onClick={handleOpenCreate}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer inline-flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm bài học ngay</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredLessons.map((lesson, idx) => {
            const grade = lesson.gradeLevel || 'Khối lớp 10';
            // Find classes that belong to this grade level
            const matchingClasses = classes.filter((c) => {
              if (c.gradeLevel) return c.gradeLevel === grade;
              if (grade === 'Khối lớp 10' && c.name.includes('10')) return true;
              if (grade === 'Khối lớp 11' && c.name.includes('11')) return true;
              if (grade === 'Khối lớp 12' && c.name.includes('12')) return true;
              return false;
            });

            return (
              <div
                key={lesson.id}
                className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3">
                  {/* Top tags */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center space-x-2 flex-wrap">
                      <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-full">
                        {grade}
                      </span>
                      <span className="text-[11px] text-slate-400 font-medium">
                        {matchingClasses.length} lớp học chung
                      </span>
                    </div>

                    <div className="flex items-center space-x-1 opacity-90 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(lesson)}
                        title="Chỉnh sửa bài học"
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(lesson.id, lesson.title)}
                        title="Xóa bài học"
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-base font-bold text-slate-900 leading-snug group-hover:text-blue-600 transition-colors">
                    {lesson.title}
                  </h3>

                  {/* Lesson Plan Content */}
                  <div className="bg-slate-50 rounded-2xl p-3.5 text-xs text-slate-700 space-y-1.5 border border-slate-100">
                    <span className="font-bold text-slate-900 text-[11px] uppercase tracking-wider block">
                      📖 Tóm tắt giáo án:
                    </span>
                    <p className="line-clamp-3 leading-relaxed font-medium">
                      {lesson.content || 'Chưa có nội dung tóm tắt giáo án.'}
                    </p>
                  </div>

                  {/* Homework Summary */}
                  {lesson.homeworkSummary && (
                    <div className="bg-emerald-50/70 rounded-2xl p-3.5 text-xs text-emerald-900 space-y-1 border border-emerald-100">
                      <span className="font-bold text-emerald-950 text-[11px] uppercase tracking-wider block">
                        📝 Bài tập về nhà:
                      </span>
                      <p className="line-clamp-2 leading-relaxed font-medium">
                        {lesson.homeworkSummary}
                      </p>
                    </div>
                  )}
                </div>

                {/* Footer info & Classes using this lesson */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center space-x-1.5">
                    <Layers className="w-3.5 h-3.5 text-slate-400" />
                    <span>Lớp áp dụng:</span>
                    <span className="font-semibold text-slate-700">
                      {matchingClasses.map((c) => c.name).join(', ') || 'Chưa gán lớp'}
                    </span>
                  </div>

                  <span className="text-[11px]">
                    {lesson.created_at || '2026-07-02'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Thêm / Chỉnh sửa Bài học mới */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-xl overflow-hidden animate-scale-up">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-900 to-indigo-900 p-5 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-500/30 flex items-center justify-center border border-blue-400/30">
                  <BookOpen className="w-4 h-4 text-blue-200" />
                </div>
                <div>
                  <h3 className="font-bold text-base">
                    {editingLessonId ? 'Chỉnh sửa bài học' : 'Thêm bài học mới'}
                  </h3>
                  <p className="text-xs text-slate-300">
                    Tạo giáo án và bài tập theo khối lớp chuẩn hóa
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* 1. Tên bài học */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Tên bài học <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Bài 1: Phương pháp giải phương trình chứa căn nâng cao"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-hidden transition-all"
                />
              </div>

              {/* 2. Khối lớp học */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Khối lớp học <span className="text-red-500">*</span>
                </label>
                <select
                  value={gradeLevel}
                  onChange={(e) => setGradeLevel(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-hidden transition-all cursor-pointer"
                >
                  <option value="Khối lớp 10">Khối lớp 10</option>
                  <option value="Khối lớp 11">Khối lớp 11</option>
                  <option value="Khối lớp 12">Khối lớp 12</option>
                </select>
                <p className="text-[11px] text-slate-400 mt-1">
                  Mọi lớp học thuộc {gradeLevel} đều có thể chọn chung bài học này khi chấm điểm và nhận xét.
                </p>
              </div>

              {/* 3. Tóm tắt giáo án */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Tóm tắt giáo án & Lý thuyết trọng tâm
                </label>
                <textarea
                  rows={3}
                  placeholder="Tóm tắt nội dung lý thuyết, các công thức chính, phương pháp giải và dạng bài tập cốt lõi..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-hidden transition-all leading-relaxed"
                />
              </div>

              {/* 4. Bài tập */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Bài tập về nhà & Đề rèn luyện
                </label>
                <textarea
                  rows={2}
                  placeholder="Ví dụ: Làm từ bài 1 đến bài 6 phiếu bài tập chuyên đề, làm 20 câu trắc nghiệm..."
                  value={homeworkSummary}
                  onChange={(e) => setHomeworkSummary(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-hidden transition-all leading-relaxed"
                />
              </div>

              {/* Form Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/30 transition-all cursor-pointer"
                >
                  {editingLessonId ? 'Lưu thay đổi' : 'Tạo bài học'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
