import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Users,
  CheckSquare,
  Square,
  Sparkles,
  X,
  Copy,
  Check,
  GraduationCap,
  Layers,
  Send,
  AlertCircle,
  Link,
  ShieldCheck,
} from 'lucide-react';

interface BulkAccountInviteModalProps {
  onClose: () => void;
  onSuccess?: () => void;
}

export const BulkAccountInviteModal: React.FC<BulkAccountInviteModalProps> = ({
  onClose,
  onSuccess,
}) => {
  const { classes, students, bulkIssueStudentInvitations, accountInvitations } = useApp();

  const [selectedClassId, setSelectedClassId] = useState<string>('all');
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [createdInvitations, setCreatedInvitations] = useState<any[] | null>(null);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  // Filter students based on class selection
  const filteredStudents = students.filter((s) => {
    if (selectedClassId === 'all') return true;
    return s.enrolledClassIds.includes(selectedClassId);
  });

  const handleToggleSelectAll = () => {
    if (selectedStudentIds.length === filteredStudents.length) {
      setSelectedStudentIds([]);
    } else {
      setSelectedStudentIds(filteredStudents.map((s) => s.id));
    }
  };

  const handleToggleStudent = (id: string) => {
    if (selectedStudentIds.includes(id)) {
      setSelectedStudentIds((prev) => prev.filter((sId) => sId !== id));
    } else {
      setSelectedStudentIds((prev) => [...prev, id]);
    }
  };

  const handleBulkIssue = async () => {
    if (selectedStudentIds.length === 0) return;
    setLoading(true);
    try {
      const results = bulkIssueStudentInvitations(selectedStudentIds);
      setCreatedInvitations(results);
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = (token: string) => {
    const url = `${window.location.origin}${window.location.pathname}?activate_token=${token}`;
    navigator.clipboard.writeText(url);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2500);
  };

  const handleCopyAllLinks = () => {
    if (!createdInvitations) return;
    const textLines = createdInvitations.map((inv) => {
      const student = students.find((s) => s.id === inv.student_id);
      const url = `${window.location.origin}${window.location.pathname}?activate_token=${inv.token}`;
      return `${student?.fullName || inv.recipient_name} (Mã: ${student?.schoolCode || '---'}): ${url}`;
    });
    navigator.clipboard.writeText(textLines.join('\n'));
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-6 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">
                {createdInvitations ? 'Kết quả phát hành lời mời kích hoạt' : 'Cấp tài khoản hàng loạt cho học sinh'}
              </h3>
              <p className="text-xs text-slate-500">
                {createdInvitations
                  ? `Đã tạo thành công ${createdInvitations.length} liên kết kích hoạt an toàn`
                  : 'Hệ thống tự động sinh mã Token kích hoạt thời hạn 7 ngày'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results View */}
        {createdInvitations ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600">
                Danh sách liên kết kích hoạt vừa tạo ({createdInvitations.length}):
              </span>
              <button
                type="button"
                onClick={handleCopyAllLinks}
                className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-bold transition-colors flex items-center space-x-1.5 border border-blue-200"
              >
                {copiedAll ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedAll ? 'Đã sao chép tất cả!' : 'Sao chép toàn bộ danh sách'}</span>
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto space-y-2 border border-slate-200 rounded-2xl p-3 bg-slate-50/50">
              {createdInvitations.map((inv) => {
                const student = students.find((s) => s.id === inv.student_id);
                const isCopied = copiedToken === inv.token;
                return (
                  <div
                    key={inv.id}
                    className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-900 text-sm">
                          {student?.fullName || inv.recipient_name}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                          {student?.schoolCode}
                        </span>
                      </div>
                      <p className="text-[11px] font-mono text-slate-500 truncate mt-0.5">
                        Token: {inv.token} • Hết hạn: {new Date(inv.expires_at).toLocaleDateString('vi-VN')}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCopyLink(inv.token)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all shrink-0 ${
                        isCopied
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{isCopied ? 'Đã sao chép link' : 'Sao chép link'}</span>
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 space-y-1">
              <p className="font-bold flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <span>Hướng dẫn gửi cho học sinh:</span>
              </p>
              <p>Thầy/Cô gửi liên kết kích hoạt này cho từng học sinh qua Zalo/Tin nhắn. Học sinh chỉ cần mở liên kết và tự đặt mật khẩu riêng của mình.</p>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold text-sm transition-colors"
              >
                Hoàn tất & Đóng
              </button>
            </div>
          </div>
        ) : (
          /* Selection View */
          <div className="space-y-4">
            {/* Filter by class */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center space-x-2">
                <Layers className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-bold text-slate-700">Lọc theo lớp học:</span>
                <select
                  value={selectedClassId}
                  onChange={(e) => {
                    setSelectedClassId(e.target.value);
                    setSelectedStudentIds([]);
                  }}
                  className="px-3 py-1.5 text-xs font-semibold bg-slate-100 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Tất cả lớp học ({students.length} học sinh)</option>
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name} ({cls.studentIds.length} học sinh)
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={handleToggleSelectAll}
                className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center space-x-1.5 self-start sm:self-auto"
              >
                {selectedStudentIds.length === filteredStudents.length ? (
                  <>
                    <CheckSquare className="w-4 h-4" />
                    <span>Bỏ chọn tất cả</span>
                  </>
                ) : (
                  <>
                    <Square className="w-4 h-4" />
                    <span>Chọn tất cả ({filteredStudents.length})</span>
                  </>
                )}
              </button>
            </div>

            {/* Students list */}
            <div className="max-h-72 overflow-y-auto space-y-1.5 border border-slate-200 rounded-2xl p-2 bg-slate-50/40">
              {filteredStudents.map((student) => {
                const isSelected = selectedStudentIds.includes(student.id);
                const hasActiveAccount = student.accountStatus === 'active';
                const hasPendingInvite = student.accountStatus === 'invited';

                return (
                  <div
                    key={student.id}
                    onClick={() => handleToggleStudent(student.id)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-blue-50/70 border-blue-300 shadow-2xs'
                        : 'bg-white border-slate-200/80 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}} // Handled by container click
                        className="w-4 h-4 text-blue-600 rounded-md border-slate-300 focus:ring-blue-500"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-slate-900 text-sm truncate">
                            {student.fullName}
                          </span>
                          <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                            {student.schoolCode}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 truncate">
                          Trường {student.schoolName} • SĐT: {student.phone || 'Chưa có'}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0 text-right">
                      {hasActiveAccount ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                          Đã kích hoạt
                        </span>
                      ) : hasPendingInvite ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sky-100 text-sky-800">
                          Đã có lời mời
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600">
                          Chưa cấp
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}

              {filteredStudents.length === 0 && (
                <div className="py-8 text-center text-xs text-slate-400">
                  Không tìm thấy học sinh nào trong lớp này.
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-500 font-semibold">
                Đã chọn: <strong className="text-blue-600 font-bold">{selectedStudentIds.length}</strong> / {filteredStudents.length} học sinh
              </span>

              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-2xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-100 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleBulkIssue}
                  disabled={selectedStudentIds.length === 0 || loading}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-2xl font-bold text-xs transition-all shadow-md shadow-blue-500/20 flex items-center space-x-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{loading ? 'Đang phát hành...' : `Phát hành (${selectedStudentIds.length}) lời mời`}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
