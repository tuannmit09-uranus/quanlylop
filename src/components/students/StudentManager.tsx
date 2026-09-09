import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Student } from '../../types';
import {
  Users,
  Plus,
  Search,
  School,
  Phone,
  Calendar,
  Layers,
  ChevronRight,
  Edit2,
  Trash2,
  Filter,
  Download,
  FileSpreadsheet,
  CheckCircle2,
  Upload,
} from 'lucide-react';
import { StudentProfileDrawer } from './StudentProfileDrawer';
import { StudentExcelImportModal } from './StudentExcelImportModal';
import { EditStudentModal } from './EditStudentModal';
import { exportStudentSampleExcel } from '../../utils/studentExcelUtils';

export const StudentManager: React.FC = () => {
  const { students, addStudent, updateStudent, deleteStudent, schools, classes } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSchoolCode, setSelectedSchoolCode] = useState('ALL');
  const [selectedClassId, setSelectedClassId] = useState('ALL');

  const [selectedStudentForDrawer, setSelectedStudentForDrawer] = useState<Student | null>(null);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importSuccessMessage, setImportSuccessMessage] = useState<string | null>(null);
  const [updateSuccessMessage, setUpdateSuccessMessage] = useState<string | null>(null);

  // Form states
  const [fullName, setFullName] = useState('');
  const [dob, setDob] = useState('2010-04-15');
  const [phone, setPhone] = useState('');
  const [schoolId, setSchoolId] = useState(schools[0]?.id || '');
  const [schoolGrade, setSchoolGrade] = useState('10A1');
  const [parentName, setParentName] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [enrolledClasses, setEnrolledClasses] = useState<string[]>([]);
  const [notes, setNotes] = useState('');

  const filteredStudents = students.filter((s) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      s.fullName.toLowerCase().includes(term) ||
      (s.phone && s.phone.includes(term)) ||
      (s.parentName && s.parentName.toLowerCase().includes(term));
    const hasSchool = Boolean(
      (s.schoolCode && s.schoolCode.trim() !== '' && s.schoolCode !== 'NONE') ||
      (s.schoolName && s.schoolName.trim() !== '' && s.schoolName !== 'Chưa cập nhật')
    );
    const matchesSchool =
      selectedSchoolCode === 'ALL' ||
      (selectedSchoolCode === 'NONE' ? !hasSchool : s.schoolCode === selectedSchoolCode);
    const matchesClass = selectedClassId === 'ALL' || s.enrolledClassIds.includes(selectedClassId);
    return matchesSearch && matchesSchool && matchesClass;
  });

  const handleCreateStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) return;

    const isNoSchool = !schoolId || schoolId.trim() === '';
    const selectedSch = !isNoSchool ? schools.find((sch) => sch.id === schoolId) : null;
    const birthYear = dob ? (new Date(dob).getFullYear() || 2010) : 2010;

    addStudent({
      fullName: fullName.trim(),
      dob: dob || '',
      birthYear,
      phone: phone.trim(),
      schoolId: selectedSch ? selectedSch.id : '',
      schoolCode: selectedSch ? selectedSch.code : '',
      schoolName: selectedSch ? selectedSch.name : '',
      schoolGrade: selectedSch ? schoolGrade.trim() : '',
      parentName: parentName.trim(),
      parentPhone: parentPhone.trim(),
      parentEmail: parentEmail.trim(),
      enrolledClassIds: enrolledClasses,
      status: 'active',
      notes,
    });

    setShowCreateModal(false);
    // Reset form
    setFullName('');
    setDob('');
    setPhone('');
    setSchoolGrade('');
    setParentName('');
    setParentPhone('');
    setParentEmail('');
    setNotes('');
  };

  return (
    <div className="space-y-6">
      {/* Header & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Quản Lý Học Sinh & Phụ Huynh</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Quản lý hồ sơ, lớp theo học, phụ huynh liên hệ và tra cứu lịch sử học tập & học phí.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Export sample Excel template */}
          <button
            type="button"
            onClick={() => {
              const activeClass = classes[0]?.name || 'K10 - Vật lý Cô Nga';
              const activeSchool = schools[0]?.name || 'THPT Phan Bội Châu';
              exportStudentSampleExcel(activeClass, activeSchool);
            }}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 hover:border-slate-300 rounded-xl text-xs font-bold transition-colors shadow-2xs cursor-pointer"
            title="Tải file Excel mẫu có 1 dòng dữ liệu mẫu"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>Tải file mẫu Excel</span>
          </button>

          {/* Import Excel */}
          <button
            type="button"
            onClick={() => setShowImportModal(true)}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs cursor-pointer"
            title="Nhập danh sách học sinh từ file Excel (.xlsx, .csv)"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Import Excel</span>
          </button>

          {/* Manual Add Student */}
          <button
            type="button"
            onClick={() => {
              setSchoolId(schools[0]?.id || '');
              setEnrolledClasses(classes[0] ? [classes[0].id] : []);
              setShowCreateModal(true);
            }}
            className="inline-flex items-center space-x-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm học sinh mới</span>
          </button>
        </div>
      </div>

      {/* Success Notification Banner */}
      {importSuccessMessage && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs flex items-center justify-between animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-bold">{importSuccessMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setImportSuccessMessage(null)}
            className="text-emerald-600 hover:text-emerald-800 text-xs font-semibold cursor-pointer"
          >
            Đóng
          </button>
        </div>
      )}

      {updateSuccessMessage && (
        <div className="p-3.5 bg-blue-50 border border-blue-200 text-blue-800 rounded-2xl text-xs flex items-center justify-between animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
            <span className="font-bold">{updateSuccessMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setUpdateSuccessMessage(null)}
            className="text-blue-600 hover:text-blue-800 text-xs font-semibold cursor-pointer"
          >
            Đóng
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo tên học sinh, SĐT, phụ huynh..."
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-hidden bg-slate-50/50"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* School filter */}
          <select
            value={selectedSchoolCode}
            onChange={(e) => setSelectedSchoolCode(e.target.value)}
            className="text-xs border border-slate-200 rounded-xl px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500 outline-hidden font-medium"
          >
            <option value="ALL">Tất cả trường học</option>
            <option value="NONE">Chưa cập nhật trường</option>
            {schools.map((s) => (
              <option key={s.id} value={s.code}>
                {s.name} ({s.code})
              </option>
            ))}
          </select>

          {/* Class filter */}
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="text-xs border border-slate-200 rounded-xl px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500 outline-hidden font-medium"
          >
            <option value="ALL">Tất cả lớp học thêm</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Student List Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Học sinh</th>
                <th className="py-3 px-4">Trường phổ thông</th>
                <th className="py-3 px-4">Lớp dạy thêm</th>
                <th className="py-3 px-4">Phụ huynh & SĐT</th>
                <th className="py-3 px-4">Trạng thái</th>
                <th className="py-3 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredStudents.map((s) => {
                const enrolled = classes.filter((c) => s.enrolledClassIds.includes(c.id));
                return (
                  <tr
                    key={s.id}
                    onClick={() => setSelectedStudentForDrawer(s)}
                    className="hover:bg-blue-50/40 cursor-pointer transition-colors"
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs overflow-hidden">
                          {s.avatar ? (
                            <img src={s.avatar} alt={s.fullName} className="w-full h-full object-cover" />
                          ) : (
                            s.fullName.charAt(0)
                          )}
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 block">{s.fullName}</span>
                          <span className="text-[11px] text-slate-400">
                            DOB: {s.dob} (K{String(s.birthYear).slice(-2)}) • {s.phone}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      {s.schoolName && s.schoolName !== 'Chưa cập nhật' ? (
                        <>
                          <span className="font-semibold text-slate-800 block">{s.schoolName}</span>
                          <span className="text-[11px] text-blue-600 font-mono font-bold">
                            {s.schoolCode ? `Mã: ${s.schoolCode}` : ''} {s.schoolGrade ? `• Lớp ${s.schoolGrade}` : ''}
                          </span>
                        </>
                      ) : (
                        <span className="text-slate-400 italic text-xs">Chưa cập nhật</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1">
                        {enrolled.map((c) => (
                          <span
                            key={c.id}
                            className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-semibold text-[11px] border border-blue-100"
                          >
                            {c.name}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      {s.parentName ? (
                        <>
                          <span className="font-semibold text-slate-900 block">{s.parentName}</span>
                          <span className="text-[11px] text-slate-500 flex items-center space-x-1">
                            <Phone className="w-3 h-3 text-slate-400" />
                            <span>{s.parentPhone || 'Chưa có SĐT'}</span>
                          </span>
                        </>
                      ) : (
                        <span className="text-slate-400 italic text-xs">Chưa cập nhật</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          s.status === 'active'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {s.status === 'active' ? 'Đang học' : 'Nghỉ'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div
                        className="inline-flex items-center justify-end space-x-1.5"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={() => setEditingStudent(s)}
                          className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition-colors shadow-2xs cursor-pointer"
                          title="Chỉnh sửa thông tin học sinh"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>Sửa</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedStudentForDrawer(s)}
                          className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors shadow-2xs cursor-pointer"
                          title="Xem hồ sơ chi tiết"
                        >
                          <span>Hồ sơ</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredStudents.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 px-4 text-center">
                    <div className="max-w-md mx-auto space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center mx-auto">
                        <Users className="w-6 h-6" />
                      </div>
                      <h4 className="text-sm font-bold text-slate-800">
                        {students.length === 0
                          ? 'Chưa có học sinh nào trong cơ sở dữ liệu'
                          : 'Không tìm thấy học sinh nào phù hợp bộ lọc'}
                      </h4>
                      <p className="text-xs text-slate-500">
                        {students.length === 0
                          ? 'Bạn có thể tải file mẫu Excel (.xlsx), sau đó nhấn Import Excel để nạp nhanh toàn bộ danh sách học sinh vào hệ thống.'
                          : 'Vui lòng thay đổi từ khóa tìm kiếm hoặc chọn bộ lọc Trường / Lớp khác.'}
                      </p>
                      {students.length === 0 && (
                        <div className="flex items-center justify-center gap-2 pt-2">
                          <button
                            type="button"
                            onClick={() => {
                              const activeClass = classes[0]?.name || 'K10 - Vật lý Cô Nga';
                              const activeSchool = schools[0]?.name || 'THPT Phan Bội Châu';
                              exportStudentSampleExcel(activeClass, activeSchool);
                            }}
                            className="inline-flex items-center space-x-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                          >
                            <Download className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Tải file mẫu</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowImportModal(true)}
                            className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs cursor-pointer"
                          >
                            <FileSpreadsheet className="w-3.5 h-3.5" />
                            <span>Import từ Excel</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setSchoolId(schools[0]?.id || '');
                              setEnrolledClasses(classes[0] ? [classes[0].id] : []);
                              setShowCreateModal(true);
                            }}
                            className="inline-flex items-center space-x-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Thêm thủ công</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Student Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 max-h-[92vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-slate-900 pb-3 border-b border-slate-100">
              Thêm học sinh mới
            </h3>

            <form onSubmit={handleCreateStudent} className="mt-4 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="font-bold text-slate-700 block mb-1">Họ và tên học sinh:</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Nguyễn Minh Tuấn"
                    className="w-full border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500 outline-hidden"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Ngày sinh (YYYY-MM-DD):</label>
                  <input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500 outline-hidden"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Số điện thoại HS:</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0988 112 233"
                    className="w-full border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500 outline-hidden"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Trường phổ thông:</label>
                  <select
                    value={schoolId}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSchoolId(val);
                      if (!val) {
                        setSchoolGrade('');
                      }
                    }}
                    className="w-full border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500 outline-hidden bg-white"
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
                  <label className="font-bold text-slate-700 block mb-1">Lớp tại trường:</label>
                  <input
                    type="text"
                    value={schoolGrade}
                    onChange={(e) => setSchoolGrade(e.target.value)}
                    placeholder={schoolId ? "10A1" : "Chưa cập nhật trường"}
                    className="w-full border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500 outline-hidden"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                <span className="font-bold text-slate-600 block">Thông tin phụ huynh</span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-semibold text-slate-600 block mb-0.5">Họ tên PH (tùy chọn):</label>
                    <input
                      type="text"
                      value={parentName}
                      onChange={(e) => setParentName(e.target.value)}
                      placeholder="Nguyễn Văn Hùng"
                      className="w-full border border-slate-300 rounded-xl p-2 bg-white outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-600 block mb-0.5">SĐT PH (tùy chọn):</label>
                    <input
                      type="tel"
                      value={parentPhone}
                      onChange={(e) => setParentPhone(e.target.value)}
                      placeholder="0988 123 456"
                      className="w-full border border-slate-300 rounded-xl p-2 bg-white outline-hidden"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Gán vào lớp dạy thêm:</label>
                <div className="space-y-1 max-h-32 overflow-y-auto p-2 border border-slate-200 rounded-xl bg-slate-50">
                  {classes.map((cls) => {
                    const isChecked = enrolledClasses.includes(cls.id);
                    return (
                      <label key={cls.id} className="flex items-center space-x-2 p-1.5 hover:bg-white rounded-lg cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setEnrolledClasses([...enrolledClasses, cls.id]);
                            } else {
                              setEnrolledClasses(enrolledClasses.filter((id) => id !== cls.id));
                            }
                          }}
                          className="rounded text-blue-600"
                        />
                        <span className="font-semibold text-slate-800">{cls.name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Ghi chú của giáo viên (tùy chọn):</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Nhập nhận xét ban đầu, dặn dò hoặc lưu ý cá nhân..."
                  className="w-full border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500 outline-hidden"
                  rows={2}
                />
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
                  Lưu học sinh
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Multi-Tab Student Profile Drawer */}
      {selectedStudentForDrawer && (
        <StudentProfileDrawer
          student={students.find((s) => s.id === selectedStudentForDrawer.id) || selectedStudentForDrawer}
          onClose={() => setSelectedStudentForDrawer(null)}
        />
      )}

      {/* Excel Import Modal */}
      <StudentExcelImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onSuccess={(count) => {
          setImportSuccessMessage(`Đã nhập thành công ${count} học sinh vào hệ thống!`);
          setTimeout(() => setImportSuccessMessage(null), 6000);
        }}
      />

      {/* Edit Student Modal */}
      <EditStudentModal
        isOpen={!!editingStudent}
        onClose={() => setEditingStudent(null)}
        student={editingStudent}
        onSuccess={(updated) => {
          setUpdateSuccessMessage(`Đã cập nhật thông tin học sinh "${updated.fullName}" thành công!`);
          setTimeout(() => setUpdateSuccessMessage(null), 5000);
        }}
      />
    </div>
  );
};
