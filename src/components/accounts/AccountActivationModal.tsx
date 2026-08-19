import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ShieldCheck,
  KeyRound,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  UserCheck,
  Users,
  GraduationCap,
  LogIn,
  Clock,
  School,
  Phone,
  Mail,
} from 'lucide-react';

interface AccountActivationModalProps {
  token: string;
  onClose?: () => void;
  onActivated?: (user: any) => void;
}

export const AccountActivationModal: React.FC<AccountActivationModalProps> = ({
  token,
  onClose,
  onActivated,
}) => {
  const { validateInvitationToken, activateAccountWithPassword, setCurrentUser, switchRole } = useApp();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [success, setSuccess] = useState(false);
  const [activatedUser, setActivatedUser] = useState<any>(null);

  const tokenValidation = validateInvitationToken(token);

  const isMinLength = password.length >= 8;
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const isMatch = password.length > 0 && password === confirmPassword;
  const isFormValid = isMinLength && hasLetter && hasNumber && isMatch;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) {
      setErrorMsg('Vui lòng kiểm tra lại yêu cầu bảo mật của mật khẩu.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const res = await activateAccountWithPassword(token, password);
      if (!res.success) {
        setErrorMsg(res.error || 'Kích hoạt không thành công.');
        setLoading(false);
        return;
      }

      setSuccess(true);
      setActivatedUser(res.user);

      if (res.user) {
        setCurrentUser(res.user);
        switchRole(res.user.role);
      }

      if (onActivated) {
        onActivated(res.user);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Đã có lỗi xảy ra trong quá trình kích hoạt.');
    } finally {
      setLoading(false);
    }
  };

  // If token was already accepted or user already has active account
  const isAlreadyAccepted =
    tokenValidation.invitation?.status === 'accepted' ||
    tokenValidation.error?.includes('đã được kích hoạt thành công');

  if (!tokenValidation.valid) {
    if (isAlreadyAccepted) {
      const { student, parent, invitation } = tokenValidation;
      const isParent = invitation?.invitation_type === 'parent' || !!parent;
      const name = parent?.fullName || student?.fullName || invitation?.recipient_name || 'Quý khách';

      return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-emerald-100 text-center space-y-5 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
              <UserCheck className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${isParent ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                {isParent ? 'Tài khoản Phụ huynh' : 'Tài khoản Học sinh'}
              </span>
              <h3 className="text-xl font-black text-slate-900">
                Tài khoản đã kích hoạt thành công
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Tài khoản của <strong className="text-slate-900">{name}</strong> đã được thiết lập mật khẩu trước đó. Bạn có thể đăng nhập vào hệ thống ngay.
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 text-xs text-slate-600 text-left space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Tên đăng nhập (SĐT / Email):</span>
                <span className="font-bold text-slate-800">
                  {parent?.phone || parent?.email || student?.phone || student?.schoolCode || invitation?.recipient_phone || invitation?.recipient_email}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Trạng thái:</span>
                <span className="font-bold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Đang hoạt động
                </span>
              </div>
            </div>

            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-sm transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center space-x-2"
              >
                <LogIn className="w-4 h-4" />
                <span>Đăng nhập ngay</span>
              </button>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-rose-100 text-center space-y-5 animate-in zoom-in-95 duration-200">
          <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
            <AlertCircle className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-black text-slate-900">
              Liên kết kích hoạt không hợp lệ
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              {tokenValidation.error || 'Mã kích hoạt không tồn tại hoặc đã hết hạn.'}
            </p>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 text-xs text-slate-500 text-left space-y-1.5">
            <p className="font-semibold text-slate-700">Lưu ý cho Phụ huynh & Học sinh:</p>
            <p>• Mỗi liên kết kích hoạt chỉ có hiệu lực trong vòng <strong>7 ngày</strong> kể từ khi giáo viên phát hành.</p>
            <p>• Nếu lời mời đã hết hạn hoặc bị thu hồi, vui lòng liên hệ Giáo viên để nhận liên kết mới.</p>
          </div>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold text-sm transition-colors shadow-xs"
            >
              Quay lại trang Đăng nhập
            </button>
          )}
        </div>
      </div>
    );
  }

  const { invitation, student, parent, tenant } = tokenValidation;
  const isParent = invitation?.invitation_type === 'parent' || (!invitation?.student_id && !!invitation?.parent_id);
  const recipientName = invitation?.recipient_name || (isParent ? parent?.fullName : student?.fullName) || 'Bạn';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-6 animate-in zoom-in-95 duration-200 relative overflow-hidden">
        {/* Decorative Top Gradient */}
        <div
          className={`absolute top-0 left-0 right-0 h-2.5 ${
            isParent
              ? 'bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-500'
              : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500'
          }`}
        />

        {success ? (
          <div className="text-center py-6 space-y-6">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10 animate-bounce" />
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-black text-slate-900">
                Kích hoạt tài khoản thành công!
              </h3>
              <p className="text-sm text-slate-600">
                Chào mừng <strong className="text-slate-900 font-bold">{recipientName}</strong> ({isParent ? 'Phụ huynh' : 'Học sinh'}) đã gia nhập lớp học của Thầy/Cô {tenant?.teacherName || 'Giáo viên'}.
              </p>
            </div>

            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 text-left space-y-1">
              <p className="font-bold flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>Tài khoản đã sẵn sàng hoạt động</span>
              </p>
              <p>Bạn có thể sử dụng SĐT/Email và mật khẩu vừa tạo để đăng nhập vào hệ thống bất kỳ lúc nào.</p>
            </div>

            <button
              type="button"
              onClick={() => {
                if (onClose) onClose();
              }}
              className={`w-full py-3.5 text-white rounded-2xl font-bold text-sm transition-all shadow-lg flex items-center justify-center space-x-2 ${
                isParent
                  ? 'bg-purple-600 hover:bg-purple-700 shadow-purple-500/25'
                  : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/25'
              }`}
            >
              <span>Vào trang tổng quan {isParent ? 'Phụ huynh' : 'Học tập'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Header info */}
            <div className="flex items-start space-x-4">
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border ${
                  isParent
                    ? 'bg-purple-50 border-purple-100 text-purple-600'
                    : 'bg-blue-50 border-blue-100 text-blue-600'
                }`}
              >
                {isParent ? <Users className="w-7 h-7" /> : <GraduationCap className="w-7 h-7" />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center space-x-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                      isParent ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {isParent ? 'Tài khoản Phụ huynh' : 'Tài khoản Học sinh'}
                  </span>
                  <span className="text-xs text-slate-400 font-medium truncate">
                    {tenant?.name || 'EduTutor'}
                  </span>
                </div>
                <h3 className="text-xl font-black text-slate-900 mt-1 truncate">
                  {recipientName}
                </h3>
                {isParent && student && (
                  <p className="text-xs text-purple-700 font-medium mt-0.5">
                    Phụ huynh học sinh: <strong className="font-bold">{student.fullName}</strong> ({student.schoolCode})
                  </p>
                )}
                {!isParent && student && (
                  <p className="text-xs text-blue-700 font-medium mt-0.5">
                    Mã học sinh: <strong className="font-bold">{student.schoolCode}</strong>
                  </p>
                )}
              </div>
            </div>

            {/* Context Box */}
            <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs text-slate-600 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-medium">Tên đăng nhập dự kiến:</span>
                <span className="font-bold text-slate-900">
                  {invitation?.recipient_phone || invitation?.recipient_email || parent?.phone || student?.phone || student?.schoolCode}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-medium">Giáo viên chủ nhiệm:</span>
                <span className="font-semibold text-slate-800">
                  Thầy/Cô {tenant?.teacherName}
                </span>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                <span className="text-slate-400 font-medium">Hạn kích hoạt:</span>
                <span className="font-bold text-amber-700 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {invitation ? new Date(invitation.expires_at).toLocaleDateString('vi-VN') : '7 ngày'}
                </span>
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Password input */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Tạo mật khẩu mới <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Nhập mật khẩu an toàn..."
                    required
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-purple-500 focus:bg-white pr-11 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Xác nhận lại mật khẩu <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Nhập lại mật khẩu..."
                    required
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-purple-500 focus:bg-white pr-11 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Password security checklist */}
            <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/70 space-y-2">
              <span className="text-[11px] font-bold text-slate-600 block">Tiêu chuẩn bảo mật mật khẩu:</span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className={`flex items-center space-x-1.5 ${isMinLength ? 'text-emerald-700 font-semibold' : 'text-slate-400'}`}>
                  <CheckCircle2 className={`w-3.5 h-3.5 ${isMinLength ? 'text-emerald-600' : 'text-slate-300'}`} />
                  <span>Tối thiểu 8 ký tự</span>
                </div>
                <div className={`flex items-center space-x-1.5 ${hasLetter ? 'text-emerald-700 font-semibold' : 'text-slate-400'}`}>
                  <CheckCircle2 className={`w-3.5 h-3.5 ${hasLetter ? 'text-emerald-600' : 'text-slate-300'}`} />
                  <span>Có ít nhất 1 chữ cái</span>
                </div>
                <div className={`flex items-center space-x-1.5 ${hasNumber ? 'text-emerald-700 font-semibold' : 'text-slate-400'}`}>
                  <CheckCircle2 className={`w-3.5 h-3.5 ${hasNumber ? 'text-emerald-600' : 'text-slate-300'}`} />
                  <span>Có ít nhất 1 chữ số</span>
                </div>
                <div className={`flex items-center space-x-1.5 ${isMatch ? 'text-emerald-700 font-semibold' : 'text-slate-400'}`}>
                  <CheckCircle2 className={`w-3.5 h-3.5 ${isMatch ? 'text-emerald-600' : 'text-slate-300'}`} />
                  <span>Mật khẩu khớp nhau</span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3 pt-2">
              {onClose && (
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-3.5 rounded-2xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-100 transition-colors"
                >
                  Hủy
                </button>
              )}
              <button
                type="submit"
                disabled={!isFormValid || loading}
                className={`flex-1 py-3.5 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-2xl font-bold text-sm transition-all shadow-lg flex items-center justify-center space-x-2 ${
                  isParent
                    ? 'bg-purple-600 hover:bg-purple-700 shadow-purple-500/25'
                    : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/25'
                }`}
              >
                <KeyRound className="w-4 h-4" />
                <span>{loading ? 'Đang kích hoạt...' : 'Kích hoạt & Đăng nhập ngay'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
