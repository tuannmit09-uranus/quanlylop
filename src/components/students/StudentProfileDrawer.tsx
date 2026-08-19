import React, { useState } from 'react';
import { Student, ParentRelationship } from '../../types';
import { useApp } from '../../context/AppContext';
import { formatVND } from '../../utils/vietqr';
import {
  X,
  User,
  School,
  Phone,
  Calendar,
  Layers,
  Award,
  CheckCircle2,
  XCircle,
  Clock,
  BookMarked,
  CreditCard,
  QrCode,
  FileText,
  MessageSquare,
  Edit2,
  Check,
  KeyRound,
  Send,
  Copy,
  Lock,
  Unlock,
  UserCheck,
  UserX,
  Link2,
  Plus,
  ShieldCheck,
  Star,
  Users,
} from 'lucide-react';
import { VietQRModal } from '../tuition/VietQRModal';
import { LinkParentModal } from '../accounts/LinkParentModal';

interface StudentProfileDrawerProps {
  student: Student;
  onClose: () => void;
}

export const StudentProfileDrawer: React.FC<StudentProfileDrawerProps> = ({
  student,
  onClose,
}) => {
  const {
    students,
    classes,
    lessonSessions,
    lessons,
    attendance,
    evaluations,
    homeworks,
    submissions,
    tuitionItems,
    updateStudent,
    parents,
    parentStudents,
    accountInvitations,
    getStudentParents,
    issueStudentInvitation,
    issueParentInvitation,
    resendInvitation,
    revokeInvitation,
    unlinkParentFromStudent,
    updateStudentAccountStatus,
    updateParentAccountStatus,
  } = useApp();

  // Always use live student from state if available
  const liveStudent = students.find((s) => s.id === student.id) || student;

  const [activeTab, setActiveTab] = useState<
    'info' | 'accounts' | 'classes' | 'attendance' | 'lessons' | 'homework' | 'tuition'
  >('info');

  const [selectedTuitionForQR, setSelectedTuitionForQR] = useState<any | null>(null);
  const [showLinkParentModal, setShowLinkParentModal] = useState(false);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setActionSuccessMsg(msg);
    setTimeout(() => setActionSuccessMsg(null), 3000);
  };

  const handleCopyLink = (token: string) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://edututor.vn';
    const link = `${origin}/?activate_token=${token}`;
    navigator.clipboard.writeText(link);
    setCopiedToken(token);
    showToast('Đã sao chép đường link kích hoạt 7 ngày vào bộ nhớ tạm!');
    setTimeout(() => setCopiedToken(null), 2500);
  };

  // Teacher notes inline editing state
  const [teacherNotes, setTeacherNotes] = useState(liveStudent.notes || '');
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notesSavedSuccess, setNotesSavedSuccess] = useState(false);

  const handleSaveNotes = () => {
    updateStudent(liveStudent.id, { notes: teacherNotes });
    setIsEditingNotes(false);
    setNotesSavedSuccess(true);
    setTimeout(() => setNotesSavedSuccess(false), 3000);
  };

  // Enrolled classes
  const enrolled = classes.filter((c) => liveStudent.enrolledClassIds?.includes(c.id));

  // Attendance records
  const studentAttendance = attendance.filter((a) => a.studentId === liveStudent.id);
  const presentCount = studentAttendance.filter((a) => a.status === 'present').length;
  const absentCount = studentAttendance.filter((a) => a.status === 'absent' || a.status === 'unexcused').length;
  const excusedCount = studentAttendance.filter((a) => a.status === 'excused').length;

  // Student evaluations
  const studentEvals = evaluations.filter((e) => e.studentId === liveStudent.id);

  // Student submissions
  const studentSubs = submissions.filter((s) => s.studentId === liveStudent.id);

  // Student tuition
  const studentTuitions = tuitionItems.filter((t) => t.studentId === liveStudent.id);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs flex justify-end animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-[870px] h-full shadow-2xl flex flex-col overflow-hidden border-l border-slate-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl overflow-hidden bg-blue-100 border border-blue-200 flex items-center justify-center font-bold text-blue-700 text-lg">
              {liveStudent.avatar ? (
                <img
                  src={liveStudent.avatar}
                  alt={liveStudent.fullName}
                  className="w-full h-full object-cover"
                />
              ) : (
                liveStudent.fullName.charAt(0)
              )}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-bold text-slate-900 leading-tight">
                  {liveStudent.fullName}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-100 text-blue-800">
                  {liveStudent.schoolCode} • K{String(liveStudent.birthYear).slice(-2)}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Trường {liveStudent.schoolName} • Lớp {liveStudent.schoolGrade}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-slate-200 bg-white overflow-x-auto scrollbar-none">
          <div className="flex items-center min-w-max px-3 sm:px-4 gap-0.5 sm:gap-1">
            {[
              { id: 'info', label: 'Hồ sơ', icon: User },
              { id: 'accounts', label: 'Tài khoản & PH', icon: KeyRound },
              { id: 'classes', label: 'Lớp học', icon: Layers, count: enrolled.length },
              { id: 'attendance', label: 'Điểm danh', icon: CheckCircle2, count: studentAttendance.length },
              { id: 'lessons', label: 'Lời phê & Điểm', icon: Award, count: studentEvals.length },
              { id: 'homework', label: 'Bài tập', icon: BookMarked, count: studentSubs.length },
              { id: 'tuition', label: 'Học phí & QR', icon: CreditCard, count: studentTuitions.length },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-1.5 px-2.5 sm:px-3 py-3 text-xs font-semibold border-b-2 whitespace-nowrap shrink-0 transition-colors ${
                    isActive
                      ? 'border-blue-600 text-blue-600 bg-blue-50/40 font-bold'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span className="whitespace-nowrap">{tab.label}</span>
                  {tab.count !== undefined && (
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                        isActive ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* TAB: INFO */}
          {activeTab === 'info' && (
            <div className="space-y-4">
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Thông tin học sinh
                </h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500">Họ và tên:</span>
                    <p className="font-semibold text-slate-800">{student.fullName}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Ngày sinh:</span>
                    <p className="font-semibold text-slate-800">
                      {student.dob} (Khóa K{String(student.birthYear).slice(-2)})
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-500">Số điện thoại HS:</span>
                    <p className="font-semibold text-slate-800">{student.phone}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Trường phổ thông:</span>
                    <p className="font-semibold text-slate-800">
                      {student.schoolName} ({student.schoolCode})
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Thông tin phụ huynh liên hệ
                </h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500">Phụ huynh:</span>
                    <p className="font-semibold text-slate-800">{student.parentName}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">SĐT Phụ huynh:</span>
                    <p className="font-semibold text-slate-800">{student.parentPhone}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-500">Email Phụ huynh:</span>
                    <p className="font-semibold text-slate-800">
                      {student.parentEmail || 'Chưa cập nhật'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Teacher Notes Editable Card */}
              <div className="bg-gradient-to-r from-blue-50/80 to-indigo-50/80 rounded-2xl p-4 border border-blue-200/80 text-xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-blue-900 font-bold">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <span>Ghi chú của giáo viên</span>
                  </div>
                  {!isEditingNotes && (
                    <button
                      type="button"
                      onClick={() => setIsEditingNotes(true)}
                      className="px-2.5 py-1 text-[11px] font-bold text-blue-700 bg-white hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors shadow-2xs flex items-center space-x-1"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>{student.notes ? 'Sửa ghi chú' : '+ Nhập ghi chú mới'}</span>
                    </button>
                  )}
                </div>

                {isEditingNotes ? (
                  <div className="space-y-2 pt-1">
                    <textarea
                      value={teacherNotes}
                      onChange={(e) => setTeacherNotes(e.target.value)}
                      placeholder="Nhập ghi chú đặc biệt về lực học, tính cách, lưu ý sức khỏe hoặc dặn dò cho học sinh này..."
                      className="w-full border border-blue-300 rounded-xl p-3 text-xs bg-white focus:ring-2 focus:ring-blue-500 outline-hidden leading-relaxed shadow-inner"
                      rows={3}
                    />
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        type="button"
                        onClick={() => {
                          setTeacherNotes(student.notes || '');
                          setIsEditingNotes(false);
                        }}
                        className="px-3 py-1.5 text-slate-600 hover:text-slate-800 font-medium text-xs"
                      >
                        Hủy
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveNotes}
                        className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs shadow-xs transition-colors flex items-center space-x-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Lưu ghi chú</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    {student.notes ? (
                      <p className="text-slate-700 leading-relaxed bg-white/80 p-3 rounded-xl border border-blue-100/80 font-medium">
                        {student.notes}
                      </p>
                    ) : (
                      <p className="text-slate-400 italic bg-white/50 p-3 rounded-xl border border-dashed border-blue-200/70 text-center">
                        Chưa có ghi chú nào của giáo viên. Nhấn "+ Nhập ghi chú mới" để lưu nhận xét nội bộ cho học sinh này.
                      </p>
                    )}
                  </div>
                )}

                {notesSavedSuccess && (
                  <div className="text-[11px] text-emerald-700 font-bold flex items-center space-x-1 pt-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Đã lưu ghi chú của giáo viên thành công!</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: ACCOUNTS & PARENTS */}
          {activeTab === 'accounts' && (
            <div className="space-y-5">
              {/* Toast message if any */}
              {actionSuccessMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-bold text-emerald-800 flex items-center space-x-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{actionSuccessMsg}</span>
                </div>
              )}

              {/* 1. Student Account Card */}
              {(() => {
                const studentInv = accountInvitations
                  .filter(
                    (inv) =>
                      (inv.student_id === liveStudent.id || (inv as any).target_id === liveStudent.id) &&
                      (inv.invitation_type === 'student' || (inv as any).target_type === 'student')
                  )
                  .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];

                const sStatus = liveStudent.accountStatus || (liveStudent as any).account_status || 'uninvited';
                const isLocked = sStatus === 'locked';
                const isActive = sStatus === 'active';
                const isInvited = sStatus === 'invited';

                const loginEmail =
                  liveStudent.email ||
                  (liveStudent.parentEmail
                    ? `student.${liveStudent.id}@edututor.vn`
                    : `student.${liveStudent.id}@edututor.vn`);

                return (
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/90 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                          <User className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                            Tài khoản Học sinh
                          </h4>
                          <p className="text-[11px] text-slate-500 font-medium">{liveStudent.fullName}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            isActive
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                              : isInvited
                              ? 'bg-blue-100 text-blue-800 border-blue-200'
                              : isLocked
                              ? 'bg-red-100 text-red-800 border-red-200'
                              : 'bg-slate-100 text-slate-600 border-slate-200'
                          }`}
                        >
                          {isActive
                            ? '● Đã kích hoạt'
                            : isInvited
                            ? '● Đã gửi lời mời'
                            : isLocked
                            ? '● Đã khóa'
                            : 'Chưa cấp tài khoản'}
                        </span>
                      </div>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs space-y-2">
                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <div>
                          <span className="text-slate-400">Email đăng nhập:</span>
                          <p className="font-bold text-slate-800 break-all">
                            {loginEmail}
                          </p>
                        </div>
                        <div>
                          <span className="text-slate-400">Trạng thái đăng nhập:</span>
                          <p className="font-bold text-slate-800">
                            {isActive ? 'Đang hoạt động' : isInvited ? 'Chờ đặt mật khẩu' : 'Chưa kích hoạt'}
                          </p>
                        </div>
                      </div>

                      {studentInv && (studentInv.status === 'sent' || studentInv.status === 'pending') && (
                        <div className="p-2.5 bg-blue-50/70 rounded-xl border border-blue-200/80 space-y-1.5 mt-2">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-blue-900 font-bold">Link kích hoạt (Hết hạn 7 ngày):</span>
                            <span className="text-[10px] text-blue-600">
                              Hạn: {new Date(studentInv.expires_at).toLocaleDateString('vi-VN')}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              readOnly
                              value={`${typeof window !== 'undefined' ? window.location.origin : ''}/?activate_token=${studentInv.token}`}
                              className="flex-1 px-2.5 py-1 text-[11px] bg-white border border-blue-200 rounded-lg text-blue-950 font-mono select-all"
                            />
                            <button
                              type="button"
                              onClick={() => handleCopyLink(studentInv.token)}
                              className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[11px] font-bold flex items-center space-x-1 shrink-0 cursor-pointer shadow-2xs"
                            >
                              {copiedToken === studentInv.token ? (
                                <>
                                  <Check className="w-3.5 h-3.5 text-emerald-300" />
                                  <span>Đã chép</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3.5 h-3.5" />
                                  <span>Copy Link</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Student Account Actions */}
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      {(!sStatus || sStatus === 'uninvited') && (
                        <button
                          type="button"
                          onClick={() => {
                            const inv = issueStudentInvitation(liveStudent.id);
                            showToast('Đã phát hành lời mời kích hoạt tài khoản 7 ngày cho học sinh!');
                            handleCopyLink(inv.token);
                          }}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center space-x-1.5 cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Cấp lời mời kích hoạt (7 ngày)</span>
                        </button>
                      )}

                      {isInvited && (
                        <>
                          {studentInv && (
                            <button
                              type="button"
                              onClick={() => handleCopyLink(studentInv.token)}
                              className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-bold text-xs rounded-xl flex items-center space-x-1.5 cursor-pointer"
                            >
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copy link kích hoạt</span>
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              if (studentInv) {
                                const newInv = resendInvitation(studentInv.id);
                                if (newInv) {
                                  showToast('Đã cấp lại mã mời mới (gia hạn 7 ngày)!');
                                  handleCopyLink(newInv.token);
                                }
                              } else {
                                const inv = issueStudentInvitation(liveStudent.id);
                                showToast('Đã cấp lại mã mời mới (gia hạn 7 ngày)!');
                                handleCopyLink(inv.token);
                              }
                            }}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl flex items-center space-x-1.5 cursor-pointer"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>Gửi lại mã mới</span>
                          </button>
                        </>
                      )}

                      {isActive && (
                        <button
                          type="button"
                          onClick={() => {
                            updateStudentAccountStatus(liveStudent.id, 'locked');
                            showToast('Đã khóa tài khoản học sinh thành công.');
                          }}
                          className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 font-bold text-xs rounded-xl flex items-center space-x-1.5 cursor-pointer"
                        >
                          <Lock className="w-3.5 h-3.5" />
                          <span>Tạm khóa tài khoản</span>
                        </button>
                      )}

                      {isLocked && (
                        <button
                          type="button"
                          onClick={() => {
                            updateStudentAccountStatus(liveStudent.id, 'active');
                            showToast('Đã mở khóa tài khoản học sinh thành công.');
                          }}
                          className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-xs rounded-xl flex items-center space-x-1.5 cursor-pointer"
                        >
                          <Unlock className="w-3.5 h-3.5" />
                          <span>Mở khóa tài khoản</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* 2. Linked Parents Section */}
              {(() => {
                const linkedParents = getStudentParents(liveStudent.id);

                return (
                  <div className="bg-purple-50/50 rounded-2xl p-4 border border-purple-200/90 space-y-3.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold">
                          <Users className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-xs font-black text-purple-950 uppercase tracking-wider">
                            Phụ huynh liên kết ({linkedParents.length})
                          </h4>
                          <p className="text-[11px] text-purple-700">
                            1 Học sinh có thể liên kết nhiều Phụ huynh (Bố, Mẹ, Giám hộ)
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setShowLinkParentModal(true)}
                        className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center space-x-1.5 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Liên kết Phụ huynh</span>
                      </button>
                    </div>

                    <div className="space-y-2.5">
                      {linkedParents.map(({ parent, relationship, is_primary, parentStudentId }) => {
                        const liveParent = parents.find((p) => p.id === parent.id) || parent;
                        const parentInv = accountInvitations
                          .filter(
                            (inv) =>
                              (inv.parent_id === liveParent.id || (inv as any).target_id === liveParent.id) &&
                              (inv.invitation_type === 'parent' || (inv as any).target_type === 'parent')
                          )
                          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];

                        const pStatus = liveParent.accountStatus || (liveParent as any).account_status || 'uninvited';
                        const isPActive = pStatus === 'active';
                        const isPInvited = pStatus === 'invited';
                        const isPLocked = pStatus === 'locked';

                        const relLabel =
                          relationship === 'father' || relationship === 'Bố'
                            ? 'Bố (Cha)'
                            : relationship === 'mother' || relationship === 'Mẹ'
                            ? 'Mẹ'
                            : relationship === 'guardian' || relationship === 'Người giám hộ'
                            ? 'Người giám hộ'
                            : relationship || 'Phụ huynh';

                        return (
                          <div
                            key={liveParent.id}
                            className="bg-white rounded-xl p-3.5 border border-purple-100 shadow-2xs space-y-2.5"
                          >
                            <div className="flex items-start justify-between">
                              <div className="space-y-0.5">
                                <div className="flex items-center space-x-2">
                                  <h5 className="font-bold text-slate-900 text-xs">{liveParent.fullName}</h5>
                                  <span className="px-2 py-0.2 rounded-md bg-purple-100 text-purple-800 text-[10px] font-bold">
                                    {relLabel}
                                  </span>
                                  {is_primary && (
                                    <span className="px-2 py-0.2 rounded-md bg-amber-100 text-amber-800 text-[10px] font-bold flex items-center space-x-0.5">
                                      <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                                      <span>Liên hệ chính</span>
                                    </span>
                                  )}
                                </div>
                                <p className="text-[11px] text-slate-500">
                                  SĐT: <strong>{liveParent.phone}</strong> • Email: {liveParent.email || 'Chưa cập nhật'}
                                </p>
                              </div>

                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                  isPActive
                                    ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                                    : isPInvited
                                    ? 'bg-blue-100 text-blue-800 border-blue-200'
                                    : isPLocked
                                    ? 'bg-red-100 text-red-800 border-red-200'
                                    : 'bg-slate-100 text-slate-600 border-slate-200'
                                }`}
                              >
                                {isPActive ? 'Đã kích hoạt' : isPInvited ? 'Đã gửi lời mời' : isPLocked ? 'Đã khóa' : 'Chưa cấp TK'}
                              </span>
                            </div>

                            {parentInv && (parentInv.status === 'sent' || parentInv.status === 'pending') && (
                              <div className="p-2 bg-purple-50/60 rounded-lg border border-purple-200/70 flex items-center justify-between text-[11px]">
                                <span className="text-purple-900 font-semibold truncate">
                                  Link kích hoạt (7 ngày): ?activate_token={parentInv.token}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleCopyLink(parentInv.token)}
                                  className="px-2 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded font-bold text-[10px] shrink-0 ml-2"
                                >
                                  Chép link
                                </button>
                              </div>
                            )}

                            {/* Parent Actions */}
                            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100 text-[11px]">
                              <div className="flex items-center space-x-1.5">
                                {(!pStatus || pStatus === 'uninvited') && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const inv = issueParentInvitation(liveParent.id);
                                      showToast('Đã phát hành lời mời kích hoạt tài khoản 7 ngày cho Phụ huynh!');
                                      handleCopyLink(inv.token);
                                    }}
                                    className="px-2.5 py-1 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg shadow-2xs"
                                  >
                                    Cấp lời mời (7 ngày)
                                  </button>
                                )}
                                {isPInvited && (
                                  <>
                                    {parentInv && (
                                      <button
                                        type="button"
                                        onClick={() => handleCopyLink(parentInv.token)}
                                        className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 font-bold rounded-lg"
                                      >
                                        Copy Link
                                      </button>
                                    )}
                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (parentInv) {
                                          const newInv = resendInvitation(parentInv.id);
                                          if (newInv) {
                                            showToast('Đã cấp lại mã mời phụ huynh mới (gia hạn 7 ngày)!');
                                            handleCopyLink(newInv.token);
                                          }
                                        } else {
                                          const inv = issueParentInvitation(liveParent.id);
                                          showToast('Đã cấp lại mã mời phụ huynh mới (gia hạn 7 ngày)!');
                                          handleCopyLink(inv.token);
                                        }
                                      }}
                                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg"
                                    >
                                      Gửi lại
                                    </button>
                                  </>
                                )}
                                {isPActive && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      updateParentAccountStatus(liveParent.id, 'locked');
                                      showToast('Đã tạm khóa tài khoản phụ huynh.');
                                    }}
                                    className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 font-semibold rounded-lg"
                                  >
                                    Tạm khóa
                                  </button>
                                )}
                                {isPLocked && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      updateParentAccountStatus(liveParent.id, 'active');
                                      showToast('Đã mở khóa tài khoản phụ huynh.');
                                    }}
                                    className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-semibold rounded-lg"
                                  >
                                    Mở khóa
                                  </button>
                                )}
                              </div>

                              <button
                                type="button"
                                onClick={() => {
                                  if (confirm(`Bạn có chắc chắn muốn hủy liên kết phụ huynh "${liveParent.fullName}" khỏi học sinh này?`)) {
                                    unlinkParentFromStudent(parentStudentId);
                                    showToast('Đã hủy liên kết phụ huynh thành công.');
                                  }
                                }}
                                className="text-red-500 hover:text-red-700 font-medium hover:underline text-[11px]"
                              >
                                Hủy liên kết
                              </button>
                            </div>
                          </div>
                        );
                      })}

                      {linkedParents.length === 0 && (
                        <div className="p-4 bg-white rounded-xl border border-dashed border-purple-200 text-center text-xs text-purple-600">
                          Chưa có phụ huynh nào được liên kết trong hệ thống. Hãy bấm <strong>"Liên kết Phụ huynh"</strong> để gắn kết Bố/Mẹ vào tài khoản học sinh.
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* TAB: CLASSES */}
          {activeTab === 'classes' && (
            <div className="space-y-3">
              {enrolled.map((c) => (
                <div
                  key={c.id}
                  className="p-4 rounded-2xl border border-slate-200 bg-white shadow-2xs hover:border-blue-300 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-900 text-sm">{c.name}</h4>
                    <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                      {formatVND(c.feePerSession)} / buổi
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{c.description}</p>
                  <div className="mt-3 flex items-center justify-between text-xs text-slate-600 pt-2 border-t border-slate-100">
                    <span>Phòng học: {c.room || 'Chưa xếp'}</span>
                    <span>Sĩ số: {c.studentIds.length} học sinh</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB: ATTENDANCE */}
          {activeTab === 'attendance' && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 text-center">
                  <span className="text-[11px] text-emerald-700 font-semibold">Có mặt</span>
                  <p className="text-xl font-bold text-emerald-800">{presentCount}</p>
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 text-center">
                  <span className="text-[11px] text-amber-700 font-semibold">Nghỉ phép</span>
                  <p className="text-xl font-bold text-amber-800">{excusedCount}</p>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-2xl p-3 text-center">
                  <span className="text-[11px] text-red-700 font-semibold">Vắng mặt</span>
                  <p className="text-xl font-bold text-red-800">{absentCount}</p>
                </div>
              </div>

              <div className="space-y-2">
                {studentAttendance.map((a) => (
                  <div
                    key={a.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs"
                  >
                    <div className="flex items-center space-x-2">
                      {a.status === 'present' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : a.status === 'excused' ? (
                        <Clock className="w-4 h-4 text-amber-600" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-600" />
                      )}
                      <div>
                        <span className="font-semibold text-slate-800">
                          Buổi học: {a.sessionId}
                        </span>
                        {a.note && <p className="text-[11px] text-slate-500">{a.note}</p>}
                      </div>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full font-semibold text-[11px] ${
                        a.status === 'present'
                          ? 'bg-emerald-100 text-emerald-800'
                          : a.status === 'excused'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {a.status === 'present'
                        ? 'Có mặt'
                        : a.status === 'excused'
                        ? 'Nghỉ có phép'
                        : 'Vắng không phép'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: LESSONS & EVALUATIONS */}
          {activeTab === 'lessons' && (
            <div className="space-y-3">
              {studentEvals.map((e) => {
                const lesson = lessons.find((l) => l.id === e.lessonId);
                const lessonName = lesson ? lesson.title : (e.lessonId ? `Bài học #${e.lessonId}` : 'Bài học chung');

                return (
                  <div
                    key={e.id}
                    className="p-4 rounded-2xl border border-slate-200 bg-white shadow-2xs space-y-2.5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100">
                      <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-600">
                        <span className="flex items-center space-x-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>Ngày đánh giá: <strong className="text-slate-800">{e.updated_at}</strong></span>
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="inline-flex items-center space-x-1 bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-lg border border-indigo-100/80">
                          <BookMarked className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Tên bài học: <strong className="font-bold text-indigo-900">{lessonName}</strong></span>
                        </span>
                      </div>

                      <div className="flex items-center space-x-2 shrink-0">
                        <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-bold text-xs border border-blue-100">
                          Điểm lớp: {e.classScore !== undefined ? `${e.classScore}/10` : 'N/A'}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-bold text-xs border border-indigo-100">
                          Điểm BTVN: {e.homeworkScore !== undefined ? `${e.homeworkScore}/10` : 'N/A'}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-800 bg-slate-50/80 p-3 rounded-xl border border-slate-200/60 leading-relaxed">
                      "{e.remarks || 'Chưa có nhận xét chi tiết'}"
                    </p>
                  </div>
                );
              })}

              {studentEvals.length === 0 && (
                <div className="py-8 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  Chưa có nhận xét hay điểm số nào cho học sinh này.
                </div>
              )}
            </div>
          )}

          {/* TAB: HOMEWORK */}
          {activeTab === 'homework' && (
            <div className="space-y-3">
              {studentSubs.map((sub) => {
                const hw = homeworks.find((h) => h.id === sub.homeworkId);
                const homeworkTitle = hw ? hw.title : 'Bài tập về nhà';

                return (
                  <div
                    key={sub.id}
                    className="p-4 rounded-2xl border border-slate-200 bg-white shadow-2xs space-y-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100">
                      <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-600">
                        <span className="flex items-center space-x-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>Ngày nộp: <strong className="text-slate-800">{sub.submittedAt}</strong></span>
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="inline-flex items-center space-x-1 bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg border border-blue-100/80">
                          <FileText className="w-3.5 h-3.5 text-blue-600" />
                          <span>Tên bài tập: <strong className="font-bold text-blue-900">{homeworkTitle}</strong></span>
                        </span>
                      </div>

                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 shrink-0">
                        {sub.status === 'graded' ? `Điểm: ${sub.grade}/10` : 'Đã nộp bài'}
                      </span>
                    </div>

                    {sub.studentNotes && (
                      <p className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
                        <strong className="text-slate-900 block mb-0.5">Học sinh viết:</strong> {sub.studentNotes}
                      </p>
                    )}

                    {sub.teacherFeedback && (
                      <p className="text-xs text-emerald-900 bg-emerald-50/80 p-2.5 rounded-xl border border-emerald-200">
                        <strong className="text-emerald-950 block mb-0.5">Thầy nhận xét:</strong> {sub.teacherFeedback}
                      </p>
                    )}

                    {sub.submissionPhotos && sub.submissionPhotos.length > 0 && (
                      <div>
                        <span className="text-[11px] font-semibold text-slate-500 block mb-1">
                          Ảnh bài làm đã nộp ({sub.submissionPhotos.length} trang):
                        </span>
                        <div className="grid grid-cols-3 gap-2">
                          {sub.submissionPhotos.map((photo, pIdx) => (
                            <a
                              key={pIdx}
                              href={photo}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="aspect-4/3 rounded-xl overflow-hidden border border-slate-200 block bg-slate-900 group relative"
                            >
                              <img
                                src={photo}
                                alt={`Bài làm trang ${pIdx + 1}`}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {studentSubs.length === 0 && (
                <div className="py-8 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  Học sinh chưa gửi bài tập nào.
                </div>
              )}
            </div>
          )}

          {/* TAB: TUITION & QR */}
          {activeTab === 'tuition' && (
            <div className="space-y-3">
              {studentTuitions.map((tui, tIdx) => (
                <div
                  key={`${tui.id}-${tui.classId || tIdx}`}
                  className="p-4 rounded-2xl border border-slate-200 bg-white shadow-2xs space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 pb-2.5 border-b border-slate-100">
                    <div className="min-w-0 flex-1 space-y-1">
                      <h4 className="font-bold text-slate-900 text-sm truncate">
                        Tháng {tui.periodMonth}/{tui.periodYear} • {tui.className}
                      </h4>
                      <p className="text-xs text-slate-600 font-mono break-all bg-slate-50 p-2 rounded-xl border border-slate-200/70 inline-block">
                        Mã CK: <strong className="text-blue-900 font-extrabold">{tui.paymentReference}</strong>
                      </p>
                    </div>

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold shrink-0 self-start border ${
                        tui.status === 'paid'
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                          : tui.status === 'unpaid'
                          ? 'bg-amber-100 text-amber-800 border-amber-200'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      {tui.status === 'paid'
                        ? 'Đã nộp'
                        : tui.status === 'unpaid'
                        ? 'Chưa nộp'
                        : tui.status}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="text-slate-600">
                      Số buổi học: <strong className="text-slate-900 font-bold">{tui.sessionCount} buổi</strong> ({formatVND(tui.feePerSession)}/buổi)
                    </span>
                    <span className="text-sm font-black text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100 shrink-0">
                      {formatVND(tui.totalAmount)}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedTuitionForQR(tui)}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs transition-colors flex items-center justify-center space-x-1.5 shadow-xs"
                  >
                    <QrCode className="w-4 h-4" />
                    <span>Mở mã VietQR thanh toán</span>
                  </button>
                </div>
              ))}

              {studentTuitions.length === 0 && (
                <div className="py-8 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  Chưa có phiếu học phí nào cho học sinh này.
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {selectedTuitionForQR && (
        <VietQRModal
          tuition={selectedTuitionForQR}
          onClose={() => setSelectedTuitionForQR(null)}
        />
      )}

      {showLinkParentModal && (
        <LinkParentModal
          student={liveStudent}
          onClose={() => setShowLinkParentModal(false)}
          onSuccess={() => {
            showToast('Đã liên kết phụ huynh thành công!');
          }}
        />
      )}
    </div>
  );
};

