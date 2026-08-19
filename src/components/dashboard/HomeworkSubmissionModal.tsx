import React, { useState, useRef, useEffect } from 'react';
import { Homework, HomeworkSubmission } from '../../types';
import { uploadFileToFirebaseStorage } from '../../lib/firebase';
import {
  Upload,
  Camera,
  X,
  Plus,
  Trash2,
  Eye,
  CheckCircle2,
  FileText,
  Clock,
  Sparkles,
  AlertCircle,
  Image as ImageIcon,
  ZoomIn,
  RefreshCw,
  CloudUpload,
} from 'lucide-react';

interface HomeworkSubmissionModalProps {
  homework: Homework;
  studentId: string;
  studentName: string;
  existingSubmission?: HomeworkSubmission;
  onClose: () => void;
  onSubmit: (photos: string[], notes: string) => void;
}

const SAMPLE_HOMEWORK_PHOTOS = [
  {
    name: 'Trang 1: Bất đẳng thức & Bổ đề',
    url: 'https://images.unsplash.com/photo-1596495578065-6e0763fa1178?w=800&auto=format&fit=crop&q=80',
  },
  {
    name: 'Trang 2: Hình học không gian & Tọa độ Oxyz',
    url: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&auto=format&fit=crop&q=80',
  },
  {
    name: 'Trang 3: Đạo hàm & Khảo sát hàm số',
    url: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=800&auto=format&fit=crop&q=80',
  },
];

export const HomeworkSubmissionModal: React.FC<HomeworkSubmissionModalProps> = ({
  homework,
  studentId,
  studentName,
  existingSubmission,
  onClose,
  onSubmit,
}) => {
  const [photos, setPhotos] = useState<string[]>(
    existingSubmission?.submissionPhotos || []
  );
  const [notes, setNotes] = useState<string>(
    existingSubmission?.studentNotes || ''
  );
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [previewPhotoUrl, setPreviewPhotoUrl] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'upload' | 'samples'>('upload');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Initialize with sample photo if totally empty for existing submission
  useEffect(() => {
    if (existingSubmission && existingSubmission.submissionPhotos.length > 0) {
      setPhotos(existingSubmission.submissionPhotos);
    }
  }, [existingSubmission]);

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setErrorMsg(null);
    setIsProcessing(true);

    const fileArray = Array.from(files);
    const validImageFiles = fileArray.filter((file) =>
      file.type.startsWith('image/')
    );

    if (validImageFiles.length === 0) {
      setErrorMsg('Vui lòng chỉ chọn các tệp định dạng hình ảnh (PNG, JPG, JPEG, WEBP, HEIC).');
      setIsProcessing(false);
      return;
    }

    // Upload to Firebase Cloud Storage
    Promise.all(validImageFiles.map((file) => uploadFileToFirebaseStorage(file, 'submissions')))
      .then((uploadedUrls) => {
        setPhotos((prev) => [...prev, ...uploadedUrls]);
        setIsProcessing(false);
      })
      .catch((err) => {
        console.error('Error uploading to Cloud Storage:', err);
        setErrorMsg('Có lỗi xảy ra khi tải ảnh lên Cloud Storage. Vui lòng thử lại.');
        setIsProcessing(false);
      });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddSamplePhoto = (url: string) => {
    if (!photos.includes(url)) {
      setPhotos((prev) => [...prev, url]);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (photos.length === 0) {
      setErrorMsg('Vui lòng tải lên ít nhất 1 ảnh chụp bài giải để nộp cho Thầy giáo.');
      return;
    }
    onSubmit(photos, notes);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div
        id="homework-submission-modal"
        className="bg-white rounded-3xl max-w-2xl w-full my-auto shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-indigo-900 via-blue-900 to-slate-900 text-white p-5 sm:p-6 flex items-start justify-between relative">
          <div className="space-y-1">
            <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 text-[11px] font-semibold border border-indigo-400/30">
              <Sparkles className="w-3 h-3" />
              <span>Nộp bài tập • {homework.className}</span>
            </div>
            <h3 className="text-lg sm:text-xl font-black text-white">
              {homework.title}
            </h3>
            <div className="flex flex-wrap items-center gap-3 text-xs text-indigo-200 pt-1">
              <span className="flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5 text-amber-300" />
                <span>
                  Hạn nộp: <strong className="text-white">{homework.dueDate} ({homework.dueTime || '22:00'})</strong>
                </span>
              </span>
              <span>•</span>
              <span>Học sinh: <strong className="text-white">{studentName}</strong></span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Existing Submission Grade & Teacher Feedback Alert (if graded) */}
        {existingSubmission?.status === 'graded' && (
          <div className="bg-emerald-50 border-b border-emerald-200 p-4 px-6 text-xs text-emerald-950 flex items-start space-x-3">
            <div className="w-7 h-7 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shrink-0 mt-0.5">
              {existingSubmission.grade}
            </div>
            <div className="space-y-0.5 flex-1">
              <div className="font-bold flex items-center space-x-2">
                <span>Thầy đã chấm điểm: {existingSubmission.grade}/10</span>
                <span className="text-[11px] text-emerald-700 font-normal">({existingSubmission.submittedAt})</span>
              </div>
              {existingSubmission.teacherFeedback && (
                <p className="italic text-emerald-900 bg-white/80 p-2 rounded-lg border border-emerald-200/60 mt-1">
                  "{existingSubmission.teacherFeedback}"
                </p>
              )}
            </div>
          </div>
        )}

        <form onSubmit={handleFormSubmit} className="p-5 sm:p-6 space-y-5 text-xs">
          {/* Assignment Description Info */}
          {homework.description && (
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-slate-700 space-y-1">
              <span className="font-bold text-slate-900 text-xs flex items-center space-x-1.5">
                <FileText className="w-3.5 h-3.5 text-indigo-600" />
                <span>Nội dung yêu cầu bài tập:</span>
              </span>
              <p className="text-[11px] text-slate-600 leading-relaxed pl-5">
                {homework.description}
              </p>
            </div>
          )}

          {/* Upload Mode Selector */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-800 text-xs flex items-center space-x-1.5">
                <ImageIcon className="w-4 h-4 text-indigo-600" />
                <span>Ảnh chụp bài làm của em ({photos.length} trang đã tải lên):</span>
              </label>

              <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setActiveTab('upload')}
                  className={`px-3 py-1 rounded-lg font-bold text-[11px] transition-all ${
                    activeTab === 'upload'
                      ? 'bg-white text-indigo-700 shadow-xs'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Tải ảnh từ máy
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('samples')}
                  className={`px-3 py-1 rounded-lg font-bold text-[11px] transition-all ${
                    activeTab === 'samples'
                      ? 'bg-white text-indigo-700 shadow-xs'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Ảnh mẫu minh họa
                </button>
              </div>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Tab 1: Upload / Drag & Drop */}
            {activeTab === 'upload' && (
              <div className="space-y-3">
                {/* Drag and Drop Zone */}
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-3xl p-6 text-center cursor-pointer transition-all ${
                    isDragging
                      ? 'border-indigo-600 bg-indigo-50/80 scale-[1.01]'
                      : 'border-slate-300 hover:border-indigo-400 bg-slate-50/70 hover:bg-slate-50'
                  }`}
                >
                  {/* Hidden File Inputs */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*,.heic"
                    className="hidden"
                    onChange={(e) => handleFiles(e.target.files)}
                  />
                  <input
                    ref={cameraInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={(e) => handleFiles(e.target.files)}
                  />

                  <div className="flex flex-col items-center justify-center space-y-2">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center shadow-xs">
                      {isProcessing ? (
                        <RefreshCw className="w-6 h-6 animate-spin" />
                      ) : (
                        <Upload className="w-6 h-6" />
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 text-xs sm:text-sm">
                        Kéo thả ảnh bài làm vào đây, hoặc nhấn để duyệt tệp
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Hỗ trợ định dạng JPG, PNG, WEBP, HEIC • Tải lên nhiều ảnh cùng lúc
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-2 pt-2" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-[11px] flex items-center space-x-1.5 shadow-xs transition-colors"
                      >
                        <ImageIcon className="w-3.5 h-3.5" />
                        <span>Chọn ảnh từ máy</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => cameraInputRef.current?.click()}
                        className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold text-[11px] flex items-center space-x-1.5 shadow-xs transition-colors"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <span>Chụp ảnh ngay</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Sample Images */}
            {activeTab === 'samples' && (
              <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 space-y-2">
                <p className="text-[11px] text-indigo-900 font-semibold">
                  Chọn nhanh ảnh bài làm mẫu để thử nghiệm tính năng nộp bài:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                  {SAMPLE_HOMEWORK_PHOTOS.map((sample, sIdx) => {
                    const isSelected = photos.includes(sample.url);
                    return (
                      <div
                        key={sIdx}
                        onClick={() => handleAddSamplePhoto(sample.url)}
                        className={`p-2 rounded-xl border cursor-pointer transition-all text-left flex sm:flex-col items-center sm:items-start gap-2 ${
                          isSelected
                            ? 'border-indigo-600 bg-indigo-100/70 ring-2 ring-indigo-500'
                            : 'border-slate-200 bg-white hover:border-indigo-300'
                        }`}
                      >
                        <img
                          src={sample.url}
                          alt={sample.name}
                          className="w-14 sm:w-full h-14 sm:h-20 object-cover rounded-lg"
                        />
                        <div className="flex-1 min-w-0">
                          <span className="font-bold text-slate-800 text-[11px] block truncate">
                            {sample.name}
                          </span>
                          <span className="text-[10px] text-indigo-600 font-semibold">
                            {isSelected ? '✓ Đã thêm' : '+ Nhấn để chọn'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Gallery of Uploaded Photos */}
            {photos.length > 0 && (
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700">
                    Danh sách các trang bài làm ({photos.length} trang):
                  </span>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-indigo-600 hover:text-indigo-800 font-bold flex items-center space-x-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Thêm trang khác</span>
                    </button>
                    <span>•</span>
                    <button
                      type="button"
                      onClick={() => setPhotos([])}
                      className="text-rose-600 hover:text-rose-800 font-medium"
                    >
                      Xóa tất cả
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {photos.map((photoUrl, idx) => (
                    <div
                      key={idx}
                      className="group relative rounded-2xl border border-slate-200 overflow-hidden bg-slate-900 aspect-4/3 shadow-xs hover:shadow-md transition-all"
                    >
                      <img
                        src={photoUrl}
                        alt={`Trang ${idx + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90 group-hover:opacity-100"
                      />

                      {/* Page Badge */}
                      <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold border border-white/20">
                        Trang {idx + 1}
                      </div>

                      {/* Action buttons overlay */}
                      <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2 p-2">
                        <button
                          type="button"
                          onClick={() => setPreviewPhotoUrl(photoUrl)}
                          className="p-2 rounded-xl bg-white/90 hover:bg-white text-slate-800 shadow-md transition-colors"
                          title="Xem ảnh phóng to"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemovePhoto(idx)}
                          className="p-2 rounded-xl bg-rose-600/90 hover:bg-rose-600 text-white shadow-md transition-colors"
                          title="Xóa trang này"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Student Notes / Ghi chú */}
          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Ghi chú hoặc lời nhắn gửi Thầy giáo (không bắt buộc):
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Thầy ơi em làm câu 3 theo 2 cách, cách 2 em chưa chắc chắn lắm nhờ thầy xem giúp em với ạ..."
              className="w-full border border-slate-300 rounded-2xl p-3 focus:ring-2 focus:ring-indigo-500 outline-hidden bg-slate-50/50 hover:bg-white transition-colors"
              rows={3}
            />
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-slate-600 hover:text-slate-800 font-semibold rounded-xl hover:bg-slate-100 transition-colors"
            >
              Đóng lại
            </button>

            <button
              type="submit"
              disabled={isProcessing}
              className={`px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-600/30 transition-all flex items-center space-x-2 ${
                isProcessing ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{existingSubmission ? 'Xác nhận Nộp lại bài' : 'Xác nhận Nộp bài ngay'}</span>
            </button>
          </div>
        </form>

        {/* Lightbox / Zoom Image Modal */}
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
                <span>Đóng xem ảnh</span>
              </button>
              <img
                src={previewPhotoUrl}
                alt="Xem chi tiết bài giải"
                className="max-h-[85vh] max-w-full object-contain rounded-2xl shadow-2xl border border-white/20"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
