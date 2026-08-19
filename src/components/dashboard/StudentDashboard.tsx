import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  BookMarked,
  Award,
  Upload,
  CheckCircle2,
  Calendar,
  Clock,
  Sparkles,
  FileText,
  Camera,
  Eye,
  AlertCircle,
  MessageSquare,
  ChevronRight,
  Filter,
  Layers,
  X,
} from 'lucide-react';
import { VietQRModal } from '../tuition/VietQRModal';
import { HomeworkSubmissionModal } from './HomeworkSubmissionModal';
import { Homework } from '../../types';

export const StudentDashboard: React.FC = () => {
  const {
    students,
    activeStudentId,
    homeworks,
    submissions,
    submitHomework,
    tuitionItems,
    lessons,
    evaluations,
    currentTenant,
  } = useApp();

  const [selectedTuitionForQR, setSelectedTuitionForQR] = useState<any | null>(null);
  const [selectedHwForSubmit, setSelectedHwForSubmit] = useState<Homework | null>(null);
  const [hwStatusFilter, setHwStatusFilter] = useState<'all' | 'pending' | 'submitted' | 'graded'>('all');
  const [previewPhotoUrl, setPreviewPhotoUrl] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const student = students.find((s) => s.id === activeStudentId) || students[0];
  const mySubmissions = submissions.filter((s) => s.studentId === student.id);
  const myEvaluations = evaluations.filter((e) => e.studentId === student.id);

  // Homework filter logic
  const filteredHomeworks = homeworks.filter((hw) => {
    const sub = mySubmissions.find((s) => s.homeworkId === hw.id);
    if (hwStatusFilter === 'pending') return !sub;
    if (hwStatusFilter === 'submitted') return sub && sub.status === 'submitted';
    if (hwStatusFilter === 'graded') return sub && sub.status === 'graded';
    return true;
  });

  const handleOpenSubmission = (hw: Homework) => {
    setSelectedHwForSubmit(hw);
  };

  const handleConfirmSubmit = (photos: string[], notes: string) => {
    if (!selectedHwForSubmit) return;
    submitHomework(selectedHwForSubmit.id, student.id, photos, notes);
    setSelectedHwForSubmit(null);
    setToastMessage(`Đã nộp bài "${selectedHwForSubmit.title}" (${photos.length} trang ảnh) thành công!`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const completedCount = mySubmissions.length;
  const gradedCount = mySubmissions.filter((s) => s.status === 'graded').length;
  const pendingCount = homeworks.length - completedCount;

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center space-x-2.5 animate-in slide-in-from-top-4 duration-300">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span className="text-xs font-bold">{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="ml-2 hover:opacity-80"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Student Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-blue-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-200 text-xs font-semibold mb-2 border border-indigo-400/30">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Góc Học Tập Cá Nhân • {student.schoolCode} K{String(student.birthYear).slice(-2)}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black">
            Chào {student.fullName}!
          </h2>
          <p className="text-indigo-100 text-xs sm:text-sm mt-1">
            Lớp: <strong>{student.schoolGrade}</strong> • {currentTenant.name}
          </p>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-3 gap-3 bg-white/10 p-3 rounded-2xl border border-white/20 backdrop-blur-xs text-center">
          <div className="px-2">
            <span className="text-[11px] text-indigo-200 block">Cần làm</span>
            <span className="text-base sm:text-lg font-black text-amber-300">
              {pendingCount > 0 ? pendingCount : 0} bài
            </span>
          </div>
          <div className="px-2 border-x border-white/15">
            <span className="text-[11px] text-indigo-200 block">Đã nộp</span>
            <span className="text-base sm:text-lg font-black text-white">
              {completedCount} bài
            </span>
          </div>
          <div className="px-2">
            <span className="text-[11px] text-indigo-200 block">Đã chấm</span>
            <span className="text-base sm:text-lg font-black text-emerald-300">
              {gradedCount} bài
            </span>
          </div>
        </div>
      </div>

      {/* Homework Section */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <BookMarked className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Bài tập về nhà & Nộp ảnh bài giải
              </h3>
              <p className="text-xs text-slate-400">
                Chụp ảnh bài làm hoặc tải ảnh từ điện thoại/máy tính để Thầy giáo chấm và sửa bài
              </p>
            </div>
          </div>

          {/* Status Filter Tabs */}
          <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-2xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => setHwStatusFilter('all')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                hwStatusFilter === 'all'
                  ? 'bg-white text-indigo-700 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tất cả ({homeworks.length})
            </button>
            <button
              type="button"
              onClick={() => setHwStatusFilter('pending')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                hwStatusFilter === 'pending'
                  ? 'bg-white text-amber-700 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Chưa nộp ({pendingCount > 0 ? pendingCount : 0})
            </button>
            <button
              type="button"
              onClick={() => setHwStatusFilter('submitted')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                hwStatusFilter === 'submitted'
                  ? 'bg-white text-blue-700 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Chờ chấm ({mySubmissions.filter((s) => s.status === 'submitted').length})
            </button>
            <button
              type="button"
              onClick={() => setHwStatusFilter('graded')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                hwStatusFilter === 'graded'
                  ? 'bg-white text-emerald-700 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Đã chấm ({gradedCount})
            </button>
          </div>
        </div>

        {/* Homework Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredHomeworks.map((hw) => {
            const mySub = mySubmissions.find((s) => s.homeworkId === hw.id);
            const hasSubmitted = !!mySub;
            const isGraded = mySub?.status === 'graded';

            return (
              <div
                key={hw.id}
                className="p-5 rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-indigo-300 transition-all space-y-3.5 shadow-2xs flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{hw.title}</h4>
                      <p className="text-xs text-indigo-700 font-semibold mt-0.5">
                        Lớp: {hw.className}
                      </p>
                    </div>

                    {isGraded ? (
                      <span className="px-2.5 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 flex items-center space-x-1 border border-emerald-300/60 shrink-0">
                        <Award className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Điểm: {mySub.grade}/10</span>
                      </span>
                    ) : hasSubmitted ? (
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 flex items-center space-x-1 shrink-0">
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                        <span>Đã nộp bài ({mySub.submissionPhotos?.length || 0} ảnh)</span>
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 shrink-0">
                        Chưa nộp bài
                      </span>
                    )}
                  </div>

                  {/* Assignment description */}
                  {hw.description && (
                    <div className="text-xs text-slate-600 leading-relaxed bg-white p-3 rounded-xl border border-slate-200/80">
                      <strong className="text-slate-800 block text-[11px] mb-0.5">Yêu cầu:</strong>
                      {hw.description}
                    </div>
                  )}

                  {/* Submitted Photos Thumbnails Preview (if already submitted) */}
                  {hasSubmitted && mySub.submissionPhotos && mySub.submissionPhotos.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[11px] font-semibold text-slate-500 flex items-center space-x-1">
                        <Camera className="w-3 h-3 text-indigo-600" />
                        <span>Ảnh bài giải đã nộp ({mySub.submissionPhotos.length} trang):</span>
                      </span>
                      <div className="flex items-center gap-2 overflow-x-auto py-1">
                        {mySub.submissionPhotos.map((photo, pIdx) => (
                          <div
                            key={pIdx}
                            onClick={() => setPreviewPhotoUrl(photo)}
                            className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-200 shadow-2xs group cursor-pointer shrink-0"
                            title="Nhấn để xem phóng to"
                          >
                            <img
                              src={photo}
                              alt={`Trang ${pIdx + 1}`}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                            />
                            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                              <Eye className="w-3.5 h-3.5" />
                            </div>
                            <span className="absolute bottom-0 right-0 px-1 rounded-tl-md bg-slate-900/80 text-white text-[9px] font-bold">
                              P{pIdx + 1}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Teacher Feedback Note (if graded) */}
                  {isGraded && mySub.teacherFeedback && (
                    <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-0.5">
                      <span className="font-bold block text-[11px] text-emerald-800">
                        Lời phê của Thầy giáo:
                      </span>
                      <p className="italic">"{mySub.teacherFeedback}"</p>
                    </div>
                  )}
                </div>

                {/* Footer with due date & Submission Action button */}
                <div className="flex items-center justify-between text-xs pt-3 border-t border-slate-200/80">
                  <span className="text-slate-500 flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      Hạn: <strong className="text-slate-800">{hw.dueDate}</strong> ({hw.dueTime || '22:00'})
                    </span>
                  </span>

                  <button
                    type="button"
                    onClick={() => handleOpenSubmission(hw)}
                    className={`px-3.5 py-2 rounded-xl font-bold text-xs transition-all flex items-center space-x-1.5 shadow-xs ${
                      hasSubmitted
                        ? 'bg-slate-800 hover:bg-slate-900 text-white'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                    }`}
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{hasSubmitted ? 'Nộp lại bài' : 'Nộp bài ngay'}</span>
                  </button>
                </div>
              </div>
            );
          })}

          {filteredHomeworks.length === 0 && (
            <div className="col-span-full py-12 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              Không có bài tập nào thuộc bộ lọc này.
            </div>
          )}
        </div>
      </div>

      {/* Homework Submission Modal with Real Photo Upload */}
      {selectedHwForSubmit && (
        <HomeworkSubmissionModal
          homework={selectedHwForSubmit}
          studentId={student.id}
          studentName={student.fullName}
          existingSubmission={mySubmissions.find(
            (s) => s.homeworkId === selectedHwForSubmit.id
          )}
          onClose={() => setSelectedHwForSubmit(null)}
          onSubmit={handleConfirmSubmit}
        />
      )}

      {/* Full Size Image Preview Modal */}
      {previewPhotoUrl && (
        <div
          className="fixed inset-0 z-60 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setPreviewPhotoUrl(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] w-full flex flex-col items-center">
            <button
              type="button"
              onClick={() => setPreviewPhotoUrl(null)}
              className="absolute -top-10 right-0 text-white hover:text-slate-300 font-bold text-sm flex items-center space-x-1 bg-white/10 px-3 py-1 rounded-full"
            >
              <X className="w-4 h-4" />
              <span>Đóng</span>
            </button>
            <img
              src={previewPhotoUrl}
              alt="Chi tiết bài giải"
              className="max-h-[85vh] max-w-full object-contain rounded-2xl shadow-2xl border border-white/20"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}

      {selectedTuitionForQR && (
        <VietQRModal
          tuition={selectedTuitionForQR}
          onClose={() => setSelectedTuitionForQR(null)}
        />
      )}
    </div>
  );
};
