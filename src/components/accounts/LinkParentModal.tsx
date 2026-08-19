import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ParentRelationship, Student } from '../../types';
import {
  Users,
  UserPlus,
  Link,
  X,
  Check,
  AlertCircle,
  Star,
  Phone,
  Mail,
  Send,
  User,
} from 'lucide-react';

interface LinkParentModalProps {
  student: Student;
  onClose: () => void;
  onSuccess?: () => void;
}

export const LinkParentModal: React.FC<LinkParentModalProps> = ({
  student,
  onClose,
  onSuccess,
}) => {
  const {
    parents,
    addParent,
    linkParentToStudent,
    issueParentInvitation,
    getStudentParents,
  } = useApp();

  const [mode, setMode] = useState<'new' | 'existing'>('new');
  const [selectedParentId, setSelectedParentId] = useState<string>('');

  // Form states for new parent
  const [fullName, setFullName] = useState(student.parentName || '');
  const [phone, setPhone] = useState(student.parentPhone || '');
  const [email, setEmail] = useState(student.parentEmail || '');
  const [relationship, setRelationship] = useState<ParentRelationship>('father');
  const [isPrimary, setIsPrimary] = useState<boolean>(true);
  const [autoInvite, setAutoInvite] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Get currently linked parent IDs
  const linkedParents = getStudentParents(student.id);
  const linkedParentIds = linkedParents.map((lp) => lp.parent.id);

  // Available existing parents not yet linked to this student
  const availableExistingParents = parents.filter((p) => !linkedParentIds.includes(p.id));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (mode === 'new') {
      if (!fullName.trim() || !phone.trim()) {
        setErrorMsg('Vui lòng nhập đầy đủ Họ tên và Số điện thoại phụ huynh.');
        return;
      }

      // Check if a parent with this phone already exists
      const existingWithPhone = parents.find((p) => p.phone === phone.trim());
      let targetParentId = '';

      if (existingWithPhone) {
        targetParentId = existingWithPhone.id;
      } else {
        const newParent = addParent({
          fullName: fullName.trim(),
          phone: phone.trim(),
          email: email.trim() || undefined,
        });
        targetParentId = newParent.id;
      }

      // Link to student
      linkParentToStudent(targetParentId, student.id, relationship, isPrimary);

      // Auto issue invitation if checked
      if (autoInvite) {
        issueParentInvitation(targetParentId, student.id);
      }

      if (onSuccess) onSuccess();
      onClose();
    } else {
      // Existing mode
      if (!selectedParentId) {
        setErrorMsg('Vui lòng chọn một phụ huynh từ danh sách.');
        return;
      }

      linkParentToStudent(selectedParentId, student.id, relationship, isPrimary);

      if (autoInvite) {
        issueParentInvitation(selectedParentId, student.id);
      }

      if (onSuccess) onSuccess();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-5 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">
                Thêm & Liên kết Phụ huynh
              </h3>
              <p className="text-xs text-slate-500">
                Học sinh: <strong className="text-slate-800">{student.fullName}</strong> ({student.schoolCode})
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

        {/* Mode Selector */}
        <div className="flex p-1 bg-slate-100 rounded-2xl text-xs font-bold">
          <button
            type="button"
            onClick={() => setMode('new')}
            className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center space-x-1.5 ${
              mode === 'new'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Thêm Phụ huynh mới</span>
          </button>
          <button
            type="button"
            onClick={() => setMode('existing')}
            className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center space-x-1.5 ${
              mode === 'existing'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Link className="w-3.5 h-3.5" />
            <span>Chọn Phụ huynh có sẵn ({availableExistingParents.length})</span>
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'new' ? (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Họ và tên Phụ huynh <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Ví dụ: Nguyễn Văn Hùng"
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Số điện thoại <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="0912345678"
                      required
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Email (Không bắt buộc)
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="phuhuynh@gmail.com"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Chọn Phụ huynh có sẵn trong hệ thống <span className="text-rose-500">*</span>
              </label>
              {availableExistingParents.length > 0 ? (
                <select
                  value={selectedParentId}
                  onChange={(e) => setSelectedParentId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">-- Chọn phụ huynh để liên kết --</option>
                  {availableExistingParents.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.fullName} • SĐT: {p.phone} {p.email ? `• ${p.email}` : ''}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-500 text-center">
                  Không còn phụ huynh nào khác chưa được liên kết với học sinh này.
                </div>
              )}
            </div>
          )}

          {/* Relationship & Primary contact */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Mối quan hệ với học sinh
              </label>
              <select
                value={relationship}
                onChange={(e) => setRelationship(e.target.value as ParentRelationship)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
              >
                <option value="father">Bố / Ba</option>
                <option value="mother">Mẹ</option>
                <option value="guardian">Người giám hộ</option>
                <option value="other">Người thân khác</option>
              </select>
            </div>

            <div className="flex items-center pt-6">
              <label className="flex items-center space-x-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isPrimary}
                  onChange={(e) => setIsPrimary(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded-md border-slate-300 focus:ring-indigo-500"
                />
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <span>Liên hệ chính nhận thông báo</span>
                </span>
              </label>
            </div>
          </div>

          {/* Auto issue invitation option */}
          <div className="p-3 bg-indigo-50/60 rounded-2xl border border-indigo-100 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-indigo-900 block">
                Phát hành lời mời kích hoạt ngay
              </span>
              <span className="text-[11px] text-indigo-700">
                Tạo mã Token 7 ngày để gửi link cho phụ huynh
              </span>
            </div>
            <input
              type="checkbox"
              checked={autoInvite}
              onChange={(e) => setAutoInvite(e.target.checked)}
              className="w-4 h-4 text-indigo-600 rounded-md border-slate-300 focus:ring-indigo-500"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-100 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs transition-colors shadow-sm flex items-center space-x-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Xác nhận liên kết</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
