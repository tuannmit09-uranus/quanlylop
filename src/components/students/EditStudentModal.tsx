import React, { useState, useEffect } from 'react';
import { Student } from '../../types';
import { useApp } from '../../context/AppContext';
import {
  X,
  User,
  School as SchoolIcon,
  Phone,
  Mail,
  Calendar,
  Layers,
  FileText,
  Check,
  AlertCircle,
  ShieldAlert,
} from 'lucide-react';

interface EditStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
  onSuccess?: (updatedStudent: Student) => void;
}

export const EditStudentModal: React.FC<EditStudentModalProps> = ({
  isOpen,
  onClose,
  student,
  onSuccess,
}) => {
  const { schools, classes, updateStudent } = useApp();

  const [fullName, setFullName] = useState('');
  const [dob, setDob] = useState('');
  const [birthYear, setBirthYear] = useState<number>(2010);
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [schoolId, setSchoolId] = useState('');
  const [schoolGrade, setSchoolGrade] = useState('');
  const [parentName, setParentName] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [enrolledClassIds, setEnrolledClassIds] = useState<string[]>([]);
  const [status, setStatus] = useState<'active' | 'paused' | 'graduated'>('active');
  const [notes, setNotes] = useState('');
  const [joinedDate, setJoinedDate] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sync state whenever student changes
  useEffect(() => {
    if (student) {
      setFullName(student.fullName || '');
      setDob(student.dob || '');
      setBirthYear(student.birthYear || (student.dob ? new Date(student.dob).getFullYear() : 2010));
      setPhone(student.phone || '');
      setEmail(student.email || '');

      // Match school properly: by ID, code, or name
      const matchedSch = schools.find(
        (s) =>
          (student.schoolId && s.id === student.schoolId) ||
          (student.schoolCode && s.code && s.code.toLowerCase() === student.schoolCode.toLowerCase()) ||
          (student.schoolName && s.name && s.name.toLowerCase() === student.schoolName.toLowerCase())
      );

      const hasValidSchool = Boolean(
        student.schoolId ||
        (student.schoolName && student.schoolName.trim() !== '' && student.schoolName !== 'Chưa cập nhật') ||
        (student.schoolCode && student.schoolCode.trim() !== '' && student.schoolCode !== 'NONE')
      );

      const resolvedSchoolId = matchedSch ? matchedSch.id : (hasValidSchool ? (student.schoolId || '') : '');

      setSchoolId(resolvedSchoolId);
      setSchoolGrade(resolvedSchoolId ? (student.schoolGrade || '') : '');
      setParentName(student.parentName || '');
      setParentPhone(student.parentPhone || '');
      setParentEmail(student.parentEmail || '');
      setEnrolledClassIds(student.enrolledClassIds || []);
      setStatus(student.status || 'active');
      setNotes(student.notes || '');
      setJoinedDate(student.joinedDate || new Date().toISOString().split('T')[0]);
      setErrorMessage(null);
    }
  }, [student, schools]);

  if (!isOpen || !student) return null;

  const handleDobChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setDob(val);
    if (val) {
      const year = new Date(val).getFullYear();
      if (!isNaN(year) && year > 1990 && year < 2030) {
        setBirthYear(year);
      }
    }
  };

  const handleToggleClass = (classId: string) => {
    setEnrolledClassIds((prev) =>
      prev.includes(classId) ? prev.filter((id) => id !== classId) : [...prev, classId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setErrorMessage('Vui lòng nhập họ và tên học sinh');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const isNoSchool = !schoolId || schoolId.trim() === '' || schoolId === 'NONE';
    const selectedSch = !isNoSchool ? (schools.find((s) => s.id === schoolId) || null) : null;

    const updatedData: Partial<Student> = {
      fullName: fullName.trim(),
      dob,
      birthYear: Number(birthYear) || 2010,
      phone: phone.trim(),
      email: email.trim() || undefined,
      schoolId: selectedSch ? selectedSch.id : '',
      schoolCode: selectedSch ? selectedSch.code : '',
      schoolName: selectedSch ? selectedSch.name : '',
      schoolGrade: selectedSch ? schoolGrade.trim() : '',
      parentName: parentName.trim(),
      parentPhone: parentPhone.trim(),
      parentEmail: parentEmail.trim() || undefined,
      enrolledClassIds,
      status,
      notes: notes.trim(),
      joinedDate: joinedDate || student.joinedDate,
    };

    try {
      updateStudent(student.id, updatedData);

      if (onSuccess) {
        onSuccess({
          ...student,
          ...updatedData,
        } as Student);
      }

      onClose();
    } catch (err: any) {
      setErrorMessage(err?.message || 'Có lỗi xảy ra khi lưu thông tin học sinh');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-60 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Chỉnh sửa thông tin học sinh
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Mã định danh: <span className="font-mono font-semibold text-slate-700">{student.id}</span>
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

        {/* Error message */}
        {errorMessage && (
          <div className="mx-6 mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form Body */}
        <form id="edit-student-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
          {/* Section 1: Thông tin học sinh */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center space-x-1.5 text-blue-700">
              <User className="w-3.5 h-3.5" />
              <span>1. Thông tin cá nhân học sinh</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="font-bold text-slate-700 block mb-1">
                  Họ và tên học sinh <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ví dụ: Nguyễn Minh Tuấn"
                  className="w-full border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500 outline-hidden font-semibold text-slate-800"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Ngày sinh (YYYY-MM-DD)
                </label>
                <input
                  type="date"
                  value={dob}
                  onChange={handleDobChange}
                  className="w-full border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500 outline-hidden font-medium text-slate-800"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Năm sinh & Khóa (VD: K{String(birthYear).slice(-2)})
                </label>
                <input
                  type="number"
                  value={birthYear}
                  onChange={(e) => setBirthYear(Number(e.target.value))}
                  placeholder="2010"
                  min={1990}
                  max={2030}
                  className="w-full border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500 outline-hidden font-medium text-slate-800"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Số điện thoại học sinh
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0988 112 233"
                  className="w-full border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500 outline-hidden font-medium text-slate-800"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Email học sinh (nếu có)
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tuan.nguyen@gmail.com"
                  className="w-full border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500 outline-hidden font-medium text-slate-800"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Trạng thái theo học
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500 outline-hidden font-semibold bg-white"
                >
                  <option value="active">Đang học tập (Active)</option>
                  <option value="paused">Tạm dừng học (Paused)</option>
                  <option value="graduated">Đã tốt nghiệp / Nghỉ học (Graduated)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Ngày gia nhập lớp
                </label>
                <input
                  type="date"
                  value={joinedDate}
                  onChange={(e) => setJoinedDate(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500 outline-hidden font-medium text-slate-800"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Trường phổ thông */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center space-x-1.5 text-indigo-700">
              <SchoolIcon className="w-3.5 h-3.5" />
              <span>2. Trường học phổ thông & Lớp tại trường</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Trường phổ thông
                </label>
                <select
                  value={schoolId}
                  onChange={(e) => {
                    const newSchId = e.target.value;
                    setSchoolId(newSchId);
                    if (!newSchId) {
                      setSchoolGrade('');
                    }
                  }}
                  className="w-full border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500 outline-hidden bg-white font-medium"
                >
                  <option value="">-- Chưa cập nhật trường --</option>
                  {schools.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Lớp tại trường
                </label>
                <input
                  type="text"
                  value={schoolGrade}
                  onChange={(e) => setSchoolGrade(e.target.value)}
                  placeholder={schoolId ? "Ví dụ: 10A1, 11 Lý..." : "Chưa cập nhật trường"}
                  className="w-full border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500 outline-hidden font-medium text-slate-800"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Phụ huynh */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center space-x-1.5 text-emerald-700">
              <Phone className="w-3.5 h-3.5" />
              <span>3. Thông tin phụ huynh liên hệ</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200/80">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Họ tên phụ huynh
                </label>
                <input
                  type="text"
                  value={parentName}
                  onChange={(e) => setParentName(e.target.value)}
                  placeholder="Nguyễn Văn Hùng (tùy chọn)"
                  className="w-full border border-slate-300 rounded-xl p-2 bg-white focus:ring-2 focus:ring-blue-500 outline-hidden font-medium"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  SĐT Phụ huynh
                </label>
                <input
                  type="tel"
                  value={parentPhone}
                  onChange={(e) => setParentPhone(e.target.value)}
                  placeholder="0988 123 456 (tùy chọn)"
                  className="w-full border border-slate-300 rounded-xl p-2 bg-white focus:ring-2 focus:ring-blue-500 outline-hidden font-medium"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Email Phụ huynh
                </label>
                <input
                  type="email"
                  value={parentEmail}
                  onChange={(e) => setParentEmail(e.target.value)}
                  placeholder="phuhuynh@gmail.com"
                  className="w-full border border-slate-300 rounded-xl p-2 bg-white focus:ring-2 focus:ring-blue-500 outline-hidden font-medium"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Lớp dạy thêm đăng ký */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center space-x-1.5 text-purple-700">
                <Layers className="w-3.5 h-3.5" />
                <span>4. Đăng ký lớp học thêm ({enrolledClassIds.length} lớp đã chọn)</span>
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-36 overflow-y-auto p-2.5 border border-slate-200 rounded-2xl bg-slate-50">
              {classes.map((cls) => {
                const isChecked = enrolledClassIds.includes(cls.id);
                return (
                  <label
                    key={cls.id}
                    className={`flex items-center space-x-2.5 p-2 rounded-xl cursor-pointer transition-colors border ${
                      isChecked
                        ? 'bg-blue-50/80 border-blue-200 text-blue-900 font-semibold'
                        : 'bg-white border-slate-200 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleToggleClass(cls.id)}
                      className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                    />
                    <div className="flex-1 min-w-0">
                      <span className="block truncate text-xs">{cls.name}</span>
                      <span className="text-[10px] text-slate-400 block font-normal">
                        Mã: {cls.code} • {cls.subject}
                      </span>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Section 5: Ghi chú sư phạm */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center space-x-1.5 text-amber-700">
              <FileText className="w-3.5 h-3.5" />
              <span>5. Ghi chú sư phạm của giáo viên</span>
            </h4>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Nhập ghi chú cá nhân, năng lực học, dặn dò hoặc lưu ý đặc biệt cho học sinh này..."
              className="w-full border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-hidden leading-relaxed text-xs"
              rows={3}
            />
          </div>
        </form>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/80 flex items-center justify-end space-x-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-slate-600 hover:text-slate-800 font-semibold text-xs rounded-xl hover:bg-slate-200/50 transition-colors"
          >
            Hủy bỏ
          </button>
          <button
            type="submit"
            form="edit-student-form"
            disabled={isSubmitting}
            className="inline-flex items-center space-x-1.5 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl font-bold text-xs shadow-md shadow-blue-500/20 transition-all cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>{isSubmitting ? 'Đang lưu...' : 'Lưu thông tin học sinh'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
