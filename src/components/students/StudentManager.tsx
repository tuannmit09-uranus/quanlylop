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
} from 'lucide-react';
import { StudentProfileDrawer } from './StudentProfileDrawer';

export const StudentManager: React.FC = () => {
  const { students, addStudent, updateStudent, deleteStudent, schools, classes } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSchoolCode, setSelectedSchoolCode] = useState('ALL');
  const [selectedClassId, setSelectedClassId] = useState('ALL');

  const [selectedStudentForDrawer, setSelectedStudentForDrawer] = useState<Student | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

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
    const matchesSearch =
      s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.phone.includes(searchTerm) ||
      s.parentName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSchool = selectedSchoolCode === 'ALL' || s.schoolCode === selectedSchoolCode;
    const matchesClass = selectedClassId === 'ALL' || s.enrolledClassIds.includes(selectedClassId);
    return matchesSearch && matchesSchool && matchesClass;
  });

  const handleCreateStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) return;

    const selectedSch = schools.find((sch) => sch.id === schoolId) || schools[0];
    const birthYear = new Date(dob).getFullYear() || 2010;

    addStudent({
      fullName,
      dob,
      birthYear,
      phone: phone || '0988 000 111',
      schoolId: selectedSch.id,
      schoolCode: selectedSch.code,
      schoolName: selectedSch.name,
      schoolGrade,
      parentName,
      parentPhone,
      parentEmail,
      enrolledClassIds: enrolledClasses,
      status: 'active',
      notes,
    });

    setShowCreateModal(false);
    // Reset form
    setFullName('');
    setPhone('');
    setParentName('');
    setParentPhone('');
    setParentEmail('');
  };

  return (
    <div className="space-y-6">
      {/* Header & Action Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Quản Lý Học Sinh & Phụ Huynh</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Quản lý hồ sơ, lớp theo học, phụ huynh liên hệ và tra cứu lịch sử học tập & học phí.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setSchoolId(schools[0]?.id || '');
            setEnrolledClasses(classes[0] ? [classes[0].id] : []);
            setShowCreateModal(true);
          }}
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm học sinh mới</span>
        </button>
      </div>

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
                <th className="py-3 px-4 text-right">Chi tiết hồ sơ</th>
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
                      <span className="font-semibold text-slate-800 block">{s.schoolName}</span>
                      <span className="text-[11px] text-blue-600 font-mono font-bold">
                        Mã: {s.schoolCode} • Lớp {s.schoolGrade}
                      </span>
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
                      <span className="font-semibold text-slate-900 block">{s.parentName}</span>
                      <span className="text-[11px] text-slate-500 flex items-center space-x-1">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{s.parentPhone}</span>
                      </span>
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
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedStudentForDrawer(s);
                        }}
                        className="inline-flex items-center space-x-1 text-xs font-bold text-blue-600 hover:text-blue-700 p-1.5 rounded-lg hover:bg-blue-50"
                      >
                        <span>Hồ sơ</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
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
                    required
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
                    onChange={(e) => setSchoolId(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500 outline-hidden bg-white"
                  >
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
                    placeholder="10A1"
                    className="w-full border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500 outline-hidden"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                <span className="font-bold text-slate-600 block">Thông tin phụ huynh</span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-semibold text-slate-600 block mb-0.5">Họ tên PH:</label>
                    <input
                      type="text"
                      value={parentName}
                      onChange={(e) => setParentName(e.target.value)}
                      placeholder="Nguyễn Văn Hùng"
                      className="w-full border border-slate-300 rounded-xl p-2 bg-white outline-hidden"
                      required
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-600 block mb-0.5">SĐT PH:</label>
                    <input
                      type="tel"
                      value={parentPhone}
                      onChange={(e) => setParentPhone(e.target.value)}
                      placeholder="0988 123 456"
                      className="w-full border border-slate-300 rounded-xl p-2 bg-white outline-hidden"
                      required
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
    </div>
  );
};
