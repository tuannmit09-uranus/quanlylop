import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatVND } from '../../utils/vietqr';
import {
  User,
  CreditCard,
  QrCode,
  Award,
  CheckCircle2,
  Calendar,
  BookMarked,
  MessageSquare,
  Sparkles,
  Phone,
} from 'lucide-react';
import { VietQRModal } from '../tuition/VietQRModal';

export const ParentDashboard: React.FC = () => {
  const {
    students,
    activeStudentId,
    setActiveStudentId,
    classes,
    evaluations,
    homeworks,
    submissions,
    tuitionItems,
    currentTenant,
    comments,
    addComment,
  } = useApp();

  const [selectedTuitionForQR, setSelectedTuitionForQR] = useState<any | null>(null);
  const [commentText, setCommentText] = useState('');

  const currentStudent = students.find((s) => s.id === activeStudentId) || students[0];
  const studentClasses = classes.filter((c) => currentStudent.enrolledClassIds.includes(c.id));
  const studentEvals = evaluations.filter((e) => e.studentId === currentStudent.id);
  const studentSubs = submissions.filter((s) => s.studentId === currentStudent.id);
  const studentTuitions = tuitionItems.filter((t) => t.studentId === currentStudent.id);

  const unpaidTuition = studentTuitions.find((t) => t.status === 'unpaid' || t.status === 'partial');

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    addComment('lesson_evaluation', `eval-${currentStudent.id}`, commentText);
    setCommentText('');
    alert('Đã gửi tin nhắn trao đổi tới Thầy giáo thành công!');
  };

  return (
    <div className="space-y-6">
      {/* Parent Header */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-200 text-xs font-semibold mb-2 border border-emerald-400/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Cổng Thông Tin Phụ Huynh Học Sinh</span>
          </div>
          <h2 className="text-2xl font-black">
            Kính chào Phụ huynh em {currentStudent.fullName}!
          </h2>
          <p className="text-emerald-100 text-xs sm:text-sm mt-1">
            Theo dõi kết quả học tập, lời phê của {currentTenant.teacherName} và học phí hàng tháng.
          </p>
        </div>

        {/* Student Locked Info Badge for parent */}
        <div className="bg-emerald-950/60 p-3 rounded-2xl border border-emerald-700/50">
          <span className="text-[11px] text-emerald-300 font-semibold block mb-1">
            Hồ sơ học sinh:
          </span>
          <div className="bg-white text-slate-900 font-bold text-xs rounded-xl px-3 py-2 border border-emerald-300 shadow-sm flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
            <span>{currentStudent.fullName} ({currentStudent.schoolCode} • Lớp {currentStudent.schoolGrade})</span>
          </div>
        </div>
      </div>

      {/* Tuition Alert Banner for Parent */}
      {unpaidTuition && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-200 text-amber-900 flex items-center justify-center font-black text-xl shrink-0">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-amber-950">
                Thông báo Học phí Tháng {unpaidTuition.periodMonth}/{unpaidTuition.periodYear}
              </h3>
              <p className="text-xs text-amber-800 mt-0.5">
                Số buổi: <strong>{unpaidTuition.sessionCount} buổi</strong> • Số tiền:{' '}
                <strong className="text-amber-950 text-sm">
                  {formatVND(unpaidTuition.totalAmount)}
                </strong>
              </p>
              <p className="text-[11px] font-mono font-bold text-amber-900 mt-1">
                Cú pháp chuyển khoản: <code>{unpaidTuition.paymentReference}</code>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setSelectedTuitionForQR(unpaidTuition)}
            className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-xs shadow-md transition-all flex items-center space-x-2 shrink-0"
          >
            <QrCode className="w-4 h-4" />
            <span>Quét mã VietQR Nộp tiền</span>
          </button>
        </div>
      )}

      {/* Two Columns: Recent Teacher Remarks & Homework Grades */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Remarks & In-class Scores */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center space-x-2">
            <Award className="w-5 h-5 text-blue-600" />
            <h3 className="text-base font-bold text-slate-900">
              Lời phê & Nhận xét của {currentTenant.teacherName}
            </h3>
          </div>

          <div className="space-y-3">
            {studentEvals.map((e) => (
              <div
                key={e.id}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-500">{e.updated_at}</span>
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 font-bold">
                      Điểm lớp: {e.classScore || 'N/A'}/10
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold">
                      Điểm BTVN: {e.homeworkScore || 'N/A'}/10
                    </span>
                  </div>
                </div>
                <p className="text-slate-800 italic bg-white p-3 rounded-xl border border-slate-200/60 leading-relaxed">
                  "{e.remarks}"
                </p>
              </div>
            ))}
          </div>

          {/* Interactive Comment Form for Parent */}
          <form onSubmit={handlePostComment} className="pt-2 space-y-2">
            <label className="text-xs font-bold text-slate-700 block">
              Gửi lời nhắn trao đổi với Giáo viên:
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Nhập nội dung gửi thầy Tuấn (ví dụ: Cháu tiến bộ nhiều, cảm ơn thầy)..."
                className="flex-1 text-xs border border-slate-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-emerald-500 outline-hidden"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors"
              >
                Gửi lời nhắn
              </button>
            </div>
          </form>
        </div>

        {/* Homework Submissions & Graded Feedback */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center space-x-2">
            <BookMarked className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">
              Bài tập về nhà & Kết quả chấm
            </h3>
          </div>

          <div className="space-y-3">
            {studentSubs.map((sub) => (
              <div
                key={sub.id}
                className="p-4 rounded-2xl border border-slate-200 bg-white shadow-2xs space-y-3 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-500">
                    Nộp ngày: {sub.submittedAt}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                    Điểm chấm: {sub.grade}/10
                  </span>
                </div>

                {sub.teacherFeedback && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900">
                    <strong>Lời phê của thầy:</strong> {sub.teacherFeedback}
                  </div>
                )}

                {sub.submissionPhotos && sub.submissionPhotos.length > 0 && (
                  <div>
                    <span className="text-[11px] font-semibold text-slate-400 block mb-1">
                      Ảnh bài làm cháu đã nộp:
                    </span>
                    <div className="grid grid-cols-3 gap-2">
                      {sub.submissionPhotos.map((photo, pIdx) => (
                        <a
                          key={pIdx}
                          href={photo}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="aspect-square rounded-xl overflow-hidden border border-slate-200 block"
                        >
                          <img
                            src={photo}
                            alt="Bài làm"
                            className="w-full h-full object-cover"
                          />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {selectedTuitionForQR && (
        <VietQRModal
          tuition={selectedTuitionForQR}
          onClose={() => setSelectedTuitionForQR(null)}
        />
      )}
    </div>
  );
};
