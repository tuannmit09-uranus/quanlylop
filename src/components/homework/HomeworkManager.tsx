import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Homework, HomeworkSubmission } from '../../types';
import {
  BookMarked,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Upload,
  Calendar,
  Clock,
  Eye,
  Camera,
  MessageSquare,
} from 'lucide-react';

export const HomeworkManager: React.FC = () => {
  const {
    classes,
    homeworks,
    submissions,
    students,
    addHomework,
    gradeHomework,
  } = useApp();

  const [selectedClassId, setSelectedClassId] = useState(classes[0]?.id || '');
  const [selectedHwId, setSelectedHwId] = useState(homeworks[0]?.id || '');

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('2026-07-28');
  const [dueTime, setDueTime] = useState('22:00');

  const classHomeworks = homeworks.filter((h) => h.classId === selectedClassId);
  const currentHw = homeworks.find((h) => h.id === selectedHwId) || classHomeworks[0];
  const hwSubmissions = submissions.filter((s) => s.homeworkId === currentHw?.id);

  const handleCreateHomework = (e: React.FormEvent) => {
    e.preventDefault();
    const cls = classes.find((c) => c.id === selectedClassId);
    if (!cls || !title.trim()) return;

    addHomework({
      classId: selectedClassId,
      className: cls.name,
      title,
      description,
      dueDate,
      dueTime,
      status: 'assigned',
    });

    setShowCreateModal(false);
    setTitle('');
    setDescription('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Quản Lý Bài Tập Về Nhà</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Giao bài tập, nhận ảnh bài giải từ học sinh và chấm điểm trực tuyến kèm phản hồi chi tiết.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Giao bài tập mới</span>
        </button>
      </div>

      {/* Select Class & Homework Filter */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <label className="text-[11px] font-bold text-slate-400 block mb-1">Chọn lớp:</label>
            <select
              value={selectedClassId}
              onChange={(e) => {
                const cId = e.target.value;
                setSelectedClassId(cId);
                const h = homeworks.find((hw) => hw.classId === cId);
                if (h) setSelectedHwId(h.id);
              }}
              className="text-xs font-bold border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-hidden"
            >
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-400 block mb-1">Chọn bài tập:</label>
            <select
              value={selectedHwId}
              onChange={(e) => setSelectedHwId(e.target.value)}
              className="text-xs font-bold border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-hidden"
            >
              {classHomeworks.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.title} (Hạn: {h.dueDate})
                </option>
              ))}
            </select>
          </div>
        </div>

        {currentHw && (
          <div className="text-xs text-slate-600 bg-indigo-50/70 p-2.5 rounded-xl border border-indigo-100 max-w-md">
            <span className="font-bold text-indigo-900 block">Đề bài: {currentHw.title}</span>
            <span className="text-[11px] text-indigo-800">{currentHw.description}</span>
          </div>
        )}
      </div>

      {/* Submissions Review Grid */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BookMarked className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-slate-900 text-sm">
              Danh sách bài nộp & Chấm điểm ({hwSubmissions.length} bài đã nộp)
            </h3>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {hwSubmissions.map((sub) => (
            <SubmissionItem
              key={sub.id}
              sub={sub}
              onGrade={(grade, feedback) => gradeHomework(sub.id, grade, feedback)}
            />
          ))}

          {hwSubmissions.length === 0 && (
            <div className="p-8 text-center text-xs text-slate-400">
              Chưa có học sinh nào nộp bài tập này.
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <h3 className="text-lg font-bold text-slate-900 pb-2 border-b border-slate-100">
              Giao bài tập về nhà
            </h3>

            <form onSubmit={handleCreateHomework} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Tiêu đề bài tập:</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Phiếu bài tập số 8: Bất đẳng thức Cauchy-Schwarz"
                  className="w-full border border-slate-300 rounded-xl p-2.5 outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Mô tả bài tập / Đề bài:</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Làm từ câu 1 đến câu 15 trong tài liệu phát tay..."
                  className="w-full border border-slate-300 rounded-xl p-2.5 outline-hidden"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Hạn nộp (Ngày):</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl p-2.5 outline-hidden"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Giờ khóa nộp:</label>
                  <input
                    type="time"
                    value={dueTime}
                    onChange={(e) => setDueTime(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl p-2.5 outline-hidden"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800 font-medium"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md transition-colors"
                >
                  Giao bài tập
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Item Component for Submissions
const SubmissionItem: React.FC<{
  sub: HomeworkSubmission;
  onGrade: (grade: number, feedback: string) => void;
}> = ({ sub, onGrade }) => {
  const [grade, setGrade] = useState<number>(sub.grade ?? 9);
  const [feedback, setFeedback] = useState<string>(sub.teacherFeedback || 'Cách giải sáng tạo và trình bày rất đẹp.');
  const [saved, setSaved] = useState(false);

  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);

  const handleSave = () => {
    onGrade(Number(grade), feedback);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-5 hover:bg-slate-50/60 transition-colors flex flex-col md:flex-row gap-5 items-start justify-between text-xs">
      <div className="space-y-2 flex-1">
        <div className="flex items-center space-x-2">
          <span className="font-bold text-slate-900 text-sm">{sub.studentName}</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
            Nộp lúc: {sub.submittedAt}
          </span>
          {sub.status === 'graded' && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
              Đã chấm: {sub.grade}/10
            </span>
          )}
        </div>

        {sub.studentNotes && (
          <p className="text-slate-600 italic bg-slate-50 p-2.5 rounded-xl border border-slate-100">
            <strong>Học sinh viết:</strong> {sub.studentNotes}
          </p>
        )}

        {sub.submissionPhotos && sub.submissionPhotos.length > 0 && (
          <div className="space-y-1 pt-1">
            <span className="text-[11px] font-semibold text-slate-500 block">
              Ảnh bài giải của học sinh ({sub.submissionPhotos.length} trang - Nhấn vào ảnh để phóng to):
            </span>
            <div className="flex items-center space-x-2">
              {sub.submissionPhotos.map((img, idx) => (
                <div
                  key={idx}
                  onClick={() => setPreviewPhoto(img)}
                  className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-200 block shadow-2xs hover:scale-105 transition-transform cursor-pointer group"
                  title="Xem phóng to ảnh bài giải"
                >
                  <img src={img} alt={`Trang ${idx + 1}`} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                    <Eye className="w-4 h-4" />
                  </div>
                  <span className="absolute bottom-0 right-0 px-1 rounded-tl-md bg-slate-900/80 text-white text-[9px] font-bold">
                    Trang {idx + 1}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Lightbox for Photo */}
      {previewPhoto && (
        <div
          className="fixed inset-0 z-60 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setPreviewPhoto(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] w-full flex flex-col items-center">
            <button
              type="button"
              onClick={() => setPreviewPhoto(null)}
              className="absolute -top-10 right-0 text-white hover:text-slate-300 font-bold text-sm bg-white/10 px-3 py-1 rounded-full"
            >
              ✕ Đóng xem ảnh
            </button>
            <img
              src={previewPhoto}
              alt="Bài nộp phóng to"
              className="max-h-[85vh] max-w-full object-contain rounded-2xl shadow-2xl border border-white/20"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}

      {/* Teacher Grading Box */}
      <div className="w-full md:w-80 bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2">
        <div className="flex items-center justify-between">
          <label className="font-bold text-slate-700">Điểm chấm (0-10):</label>
          <input
            type="number"
            step={0.5}
            min={0}
            max={10}
            value={grade}
            onChange={(e) => setGrade(Number(e.target.value))}
            className="w-20 border border-slate-300 rounded-lg p-1 font-bold text-indigo-700 text-center bg-white"
          />
        </div>

        <div>
          <label className="font-semibold text-slate-600 block mb-0.5">Lời phê & sửa bài:</label>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            rows={2}
            className="w-full border border-slate-300 rounded-xl p-2 bg-white outline-hidden text-[11px]"
          />
        </div>

        <button
          type="button"
          onClick={handleSave}
          className={`w-full py-2 rounded-xl font-bold transition-all flex items-center justify-center space-x-1.5 ${
            saved
              ? 'bg-emerald-600 text-white'
              : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>{saved ? 'Đã cập nhật điểm' : 'Lưu kết quả chấm'}</span>
        </button>
      </div>
    </div>
  );
};
