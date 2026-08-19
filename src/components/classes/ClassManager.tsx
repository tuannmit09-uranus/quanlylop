import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ClassRoom } from '../../types';
import { formatVND } from '../../utils/vietqr';
import {
  Layers,
  Plus,
  Edit2,
  Trash2,
  Users,
  CreditCard,
  Building,
  UserPlus,
  X,
  Sparkles,
} from 'lucide-react';

export const ClassManager: React.FC = () => {
  const {
    classes,
    addClass,
    updateClass,
    deleteClass,
    subjects,
    students,
    assignStudentToClass,
    removeStudentFromClass,
  } = useApp();

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedClassForRoster, setSelectedClassForRoster] = useState<ClassRoom | null>(null);

  const [name, setName] = useState('');
  const [subjectId, setSubjectId] = useState(subjects[0]?.id || '');
  const [gradeLevel, setGradeLevel] = useState('Khối lớp 10');
  const [feePerSession, setFeePerSession] = useState(100000);
  const [description, setDescription] = useState('');
  const [room, setRoom] = useState('Phòng 201');

  const openCreateModal = () => {
    setEditingId(null);
    setName('');
    setSubjectId(subjects[0]?.id || '');
    setGradeLevel('Khối lớp 10');
    setFeePerSession(100000);
    setDescription('');
    setRoom('Phòng 201');
    setShowModal(true);
  };

  const openEditModal = (c: ClassRoom) => {
    setEditingId(c.id);
    setName(c.name);
    setSubjectId(c.subjectId);
    setGradeLevel(c.gradeLevel || 'Khối lớp 10');
    setFeePerSession(c.feePerSession);
    setDescription(c.description || '');
    setRoom(c.room || 'Phòng 201');
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const sub = subjects.find((s) => s.id === subjectId);
    const subName = sub ? sub.name : 'Toán Học';

    if (editingId) {
      updateClass(editingId, {
        name,
        subjectId,
        subjectName: subName,
        gradeLevel,
        feePerSession: Number(feePerSession),
        description,
        room,
      });
    } else {
      addClass({
        name,
        subjectId,
        subjectName: subName,
        gradeLevel,
        feePerSession: Number(feePerSession),
        description,
        studentIds: [],
        status: 'active',
        room,
      });
    }
    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Quản Lý Lớp Học Thêm</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Cấu hình đơn giá theo từng buổi học để tự động nhân số buổi tính học phí hàng tháng.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Tạo lớp học mới</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {classes.map((cls) => {
          const classStudents = students.filter((s) => cls.studentIds.includes(s.id));
          return (
            <div
              key={cls.id}
              className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs hover:border-blue-300 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[11px] font-bold text-blue-700 uppercase bg-blue-50 px-2 py-0.5 rounded-md">
                        {cls.subjectName}
                      </span>
                      {cls.gradeLevel && (
                        <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md">
                          {cls.gradeLevel}
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-slate-900 text-base mt-1.5 leading-snug">
                      {cls.name}
                    </h3>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-black text-emerald-800 bg-emerald-50 border border-emerald-200">
                    {formatVND(cls.feePerSession)} / buổi
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  {cls.description || 'Chương trình ôn luyện trọng điểm và giải đề nâng cao.'}
                </p>

                <div className="text-xs text-slate-500 flex items-center justify-between">
                  <span>Phòng học: <strong>{cls.room || 'Phòng 201'}</strong></span>
                  <span>Sĩ số: <strong className="text-blue-700">{cls.studentIds.length} học sinh</strong></span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setSelectedClassForRoster(cls)}
                  className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-bold transition-colors flex items-center space-x-1"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Danh sách HS ({cls.studentIds.length})</span>
                </button>

                <div className="flex items-center space-x-1">
                  <button
                    type="button"
                    onClick={() => openEditModal(cls)}
                    className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-100"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`Bạn có chắc muốn xóa lớp ${cls.name}?`)) {
                        deleteClass(cls.id);
                      }
                    }}
                    className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Class Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 pb-3 border-b border-slate-100">
              {editingId ? 'Chỉnh sửa lớp học' : 'Tạo lớp học mới'}
            </h3>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Tên lớp học:</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Toán 10A1 - Nâng Cao Chuyên"
                  className="w-full border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500 outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Môn học:</label>
                <select
                  value={subjectId}
                  onChange={(e) => setSubjectId(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500 outline-hidden bg-white"
                >
                  {subjects.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.name} ({sub.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Khối lớp:</label>
                <select
                  value={gradeLevel}
                  onChange={(e) => setGradeLevel(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500 outline-hidden bg-white font-medium"
                >
                  <option value="Khối lớp 10">Khối lớp 10</option>
                  <option value="Khối lớp 11">Khối lớp 11</option>
                  <option value="Khối lớp 12">Khối lớp 12</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Đơn giá học phí một buổi (VNĐ):
                </label>
                <input
                  type="number"
                  step={10000}
                  value={feePerSession}
                  onChange={(e) => setFeePerSession(Number(e.target.value))}
                  className="w-full border border-slate-300 rounded-xl p-2.5 font-bold text-blue-700 focus:ring-2 focus:ring-blue-500 outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Phòng học:</label>
                <input
                  type="text"
                  value={room}
                  onChange={(e) => setRoom(e.target.value)}
                  placeholder="Phòng 201 - Tầng 2"
                  className="w-full border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500 outline-hidden"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Mô tả mục tiêu lớp:</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Bồi dưỡng học sinh giỏi tỉnh, chuyên đề giải tích..."
                  className="w-full border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500 outline-hidden"
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800 font-medium"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md transition-colors"
                >
                  {editingId ? 'Cập nhật' : 'Tạo lớp'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Roster / Student Assignment Modal */}
      {selectedClassForRoster && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  Danh sách học sinh: {selectedClassForRoster.name}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Gán hoặc rút học sinh khỏi lớp học
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedClassForRoster(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-2 text-xs">
              {students.map((student) => {
                const isEnrolled = selectedClassForRoster.studentIds.includes(student.id);
                return (
                  <div
                    key={student.id}
                    className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                      isEnrolled
                        ? 'bg-blue-50/70 border-blue-200'
                        : 'bg-slate-50 border-slate-200/60'
                    }`}
                  >
                    <div>
                      <span className="font-bold text-slate-900 block">{student.fullName}</span>
                      <span className="text-[11px] text-slate-500">
                        {student.schoolName} ({student.schoolCode}) • Lớp {student.schoolGrade}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        if (isEnrolled) {
                          removeStudentFromClass(selectedClassForRoster.id, student.id);
                        } else {
                          assignStudentToClass(selectedClassForRoster.id, student.id);
                        }
                      }}
                      className={`px-3 py-1.5 rounded-xl font-bold transition-colors ${
                        isEnrolled
                          ? 'bg-red-50 hover:bg-red-100 text-red-700 border border-red-200'
                          : 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
                      }`}
                    >
                      {isEnrolled ? 'Rút khỏi lớp' : '+ Gán vào lớp'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
