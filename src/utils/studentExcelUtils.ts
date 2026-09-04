import * as XLSX from 'xlsx';
import { School, ClassRoom, Student } from '../types';

export interface ParsedStudentRow {
  fullName: string;
  dob: string;
  birthYear: number;
  phone: string;
  email: string;
  schoolName: string;
  schoolCode: string;
  schoolId: string;
  schoolGrade: string;
  enrolledClassIds: string[];
  enrolledClassNames: string[];
  parentName: string;
  parentPhone: string;
  parentEmail: string;
  notes: string;
}

/**
 * Normalizes Vietnamese string for header comparison
 */
function normalizeHeader(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

/**
 * Normalizes telephone number from Excel (handles numeric values, missing leading zeros)
 */
export function normalizePhoneNumber(val: any): string {
  if (val === null || val === undefined) return '';
  let str = String(val).trim();
  const digits = str.replace(/\D/g, '');
  if (!digits) return str;
  // If 9 digits (e.g. 988112233), prepend 0 -> 0988112233
  if (digits.length === 9 && !digits.startsWith('0')) {
    return '0' + digits;
  }
  return digits.length >= 8 ? (digits.startsWith('0') ? digits : '0' + digits) : str;
}

/**
 * Normalizes dates from Excel (handles Excel serial dates, DD/MM/YYYY, YYYY-MM-DD)
 */
export function normalizeExcelDate(val: any): { dob: string; birthYear: number } {
  const currentYear = new Date().getFullYear();
  const defaultYear = currentYear - 16; // e.g. 2010

  if (!val) {
    return { dob: `${defaultYear}-01-01`, birthYear: defaultYear };
  }

  // Handle Excel serial date numbers (e.g. 40283)
  if (typeof val === 'number') {
    const date = new Date(Math.round((val - 25569) * 86400 * 1000));
    if (!isNaN(date.getTime())) {
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, '0');
      const dd = String(date.getDate()).padStart(2, '0');
      return { dob: `${yyyy}-${mm}-${dd}`, birthYear: yyyy };
    }
  }

  const str = String(val).trim();
  if (!str) {
    return { dob: `${defaultYear}-01-01`, birthYear: defaultYear };
  }

  // Check 4-digit year only e.g. "2010"
  if (/^\d{4}$/.test(str)) {
    const y = parseInt(str, 10);
    return { dob: `${y}-01-01`, birthYear: y };
  }

  // Check formats with separator
  const parts = str.split(/[/.-]/).map((p) => p.trim());
  if (parts.length === 3) {
    if (parts[0].length === 4) {
      // YYYY-MM-DD
      const y = parseInt(parts[0], 10);
      const m = parts[1].padStart(2, '0');
      const d = parts[2].padStart(2, '0');
      return { dob: `${y}-${m}-${d}`, birthYear: y };
    } else if (parts[2].length === 4) {
      // DD/MM/YYYY
      const y = parseInt(parts[2], 10);
      const m = parts[1].padStart(2, '0');
      const d = parts[0].padStart(2, '0');
      return { dob: `${y}-${m}-${d}`, birthYear: y };
    }
  }

  return { dob: str, birthYear: defaultYear };
}

/**
 * Export sample Excel file with exactly 1 sample row as requested by user.
 * "cho phép Export file excel mẫu có 1 dòng dữ liệu mẫu"
 */
export function exportStudentSampleExcel(sampleClass?: string, sampleSchool?: string) {
  const headers = [
    'Họ và tên học sinh',
    'Ngày sinh (YYYY-MM-DD)',
    'Số điện thoại HS',
    'Email học sinh',
    'Trường phổ thông',
    'Lớp tại trường',
    'Lớp dạy thêm',
    'Họ tên phụ huynh',
    'Số điện thoại phụ huynh',
    'Email phụ huynh',
    'Ghi chú',
  ];

  const sampleRow = [
    'Nguyễn Minh Tuấn',
    '2010-04-15',
    '0988 112 233',
    'minhtuan@gmail.com',
    sampleSchool || 'THPT Phan Bội Châu',
    '10A1',
    sampleClass || 'K10 - Vật lý Cô Nga',
    'Nguyễn Văn Hùng',
    '0912 345 678',
    'hung.nv@gmail.com',
    'Học sinh đăng ký ôn thi chuyên đề nâng cao',
  ];

  const wsData = [headers, sampleRow];
  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Styling / column widths
  ws['!cols'] = [
    { wch: 24 }, // Họ và tên học sinh
    { wch: 22 }, // Ngày sinh
    { wch: 18 }, // SĐT HS
    { wch: 24 }, // Email HS
    { wch: 26 }, // Trường phổ thông
    { wch: 16 }, // Lớp tại trường
    { wch: 24 }, // Lớp dạy thêm
    { wch: 22 }, // Họ tên PH
    { wch: 18 }, // SĐT PH
    { wch: 24 }, // Email PH
    { wch: 30 }, // Ghi chú
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Danh_Sach_Hoc_Sinh');
  XLSX.writeFile(wb, 'Mau_Danh_Sach_Hoc_Sinh.xlsx');
}

export interface ParseOptions {
  defaultClassId?: string;
  defaultSchoolId?: string;
  existingSchools: School[];
  existingClasses: ClassRoom[];
}

/**
 * Parse Excel or CSV file to array of ParsedStudentRow.
 * All fields are OPTIONAL (none are mandatory).
 */
export async function parseStudentExcelFile(
  file: File,
  options: ParseOptions
): Promise<{ success: boolean; rows: ParsedStudentRow[]; error?: string }> {
  try {
    const data = await file.arrayBuffer();
    const wb = XLSX.read(data, { type: 'array' });
    if (!wb.SheetNames || wb.SheetNames.length === 0) {
      return { success: false, rows: [], error: 'File Excel không có trang tính (sheet) nào.' };
    }

    const firstSheet = wb.Sheets[wb.SheetNames[0]];
    const rawData = XLSX.utils.sheet_to_json(firstSheet, { header: 1, defval: '' }) as any[][];

    if (!rawData || rawData.length === 0) {
      return { success: false, rows: [], error: 'File Excel không có dữ liệu.' };
    }

    // Determine header row index
    let headerRowIdx = -1;
    let colMap: Record<string, number> = {};

    for (let r = 0; r < Math.min(rawData.length, 10); r++) {
      const row = rawData[r];
      if (!Array.isArray(row)) continue;

      const normalizedCells = row.map((cell) => normalizeHeader(String(cell || '')));
      
      const foundName = normalizedCells.findIndex((c) =>
        ['hovaten', 'hovatenhocsinh', 'tenhocsinh', 'ten', 'hocsinh', 'fullname', 'name'].some((k) => c.includes(k))
      );

      if (foundName !== -1) {
        headerRowIdx = r;
        // Map all columns
        normalizedCells.forEach((c, idx) => {
          if (!c) return;
          if (['hovaten', 'tenhocsinh', 'fullname', 'ten', 'hocsinh'].some((k) => c.includes(k)) && !colMap.name) {
            colMap.name = idx;
          } else if (['ngaysinh', 'namsinh', 'dob', 'birth'].some((k) => c.includes(k)) && !colMap.dob) {
            colMap.dob = idx;
          } else if (['sdths', 'dienthoaihs', 'sodienthoaihs', 'sdthocsinh', 'phonehs'].some((k) => c.includes(k)) && !colMap.phone) {
            colMap.phone = idx;
          } else if (['emailhs', 'emailhocsinh'].some((k) => c.includes(k)) && !colMap.email) {
            colMap.email = idx;
          } else if (['truong', 'truongphothong', 'truonghoc', 'school'].some((k) => c.includes(k)) && !colMap.school) {
            colMap.school = idx;
          } else if (['loptruong', 'loptruongphothong', 'loptaitruong', 'khoi', 'grade'].some((k) => c.includes(k)) && !colMap.grade) {
            colMap.grade = idx;
          } else if (['lopdaythem', 'lophocthem', 'lopmonhoc', 'lophoc', 'class'].some((k) => c.includes(k)) && !colMap.classRoom) {
            colMap.classRoom = idx;
          } else if (['hotenph', 'tenph', 'phuhuynh', 'tenphuhuynh', 'parentname', 'parent'].some((k) => c.includes(k)) && !colMap.parentName) {
            colMap.parentName = idx;
          } else if (['sdtph', 'dienthoaiph', 'sodienthoaiphuhuynh', 'sdtphuhuynh', 'parentphone'].some((k) => c.includes(k)) && !colMap.parentPhone) {
            colMap.parentPhone = idx;
          } else if (['emailph', 'emailphuhuynh', 'parentemail'].some((k) => c.includes(k)) && !colMap.parentEmail) {
            colMap.parentEmail = idx;
          } else if (['ghichu', 'nhanxet', 'note', 'notes'].some((k) => c.includes(k)) && !colMap.notes) {
            colMap.notes = idx;
          } else if (c.includes('phone') || c.includes('sdt')) {
            if (colMap.phone === undefined) colMap.phone = idx;
            else if (colMap.parentPhone === undefined) colMap.parentPhone = idx;
          } else if (c.includes('email')) {
            if (colMap.email === undefined) colMap.email = idx;
            else if (colMap.parentEmail === undefined) colMap.parentEmail = idx;
          }
        });
        break;
      }
    }

    // Default fallback school
    const defaultSchool =
      options.existingSchools.find((s) => s.id === options.defaultSchoolId) ||
      options.existingSchools[0] || {
        id: 'sch-default',
        code: 'PT',
        name: 'Trường Phổ Thông',
      };

    const startRow = headerRowIdx !== -1 ? headerRowIdx + 1 : 0;
    const parsedRows: ParsedStudentRow[] = [];

    for (let i = startRow; i < rawData.length; i++) {
      const row = rawData[i];
      if (!Array.isArray(row)) continue;

      // Check if row is completely empty
      const hasAnyValue = row.some((cell) => cell !== null && cell !== undefined && String(cell).trim() !== '');
      if (!hasAnyValue) continue;

      let rawName = '';
      if (colMap.name !== undefined) {
        rawName = String(row[colMap.name] || '').trim();
      } else {
        // Fallback: column 0 or 1
        rawName = String(row[0] || row[1] || '').trim();
      }

      // Non-mandatory rule: If name is missing, generate fallback
      const fullName = rawName || `Học sinh ${parsedRows.length + 1}`;

      const rawDob = colMap.dob !== undefined ? row[colMap.dob] : row[1];
      const { dob, birthYear } = normalizeExcelDate(rawDob);

      const rawPhone = colMap.phone !== undefined ? row[colMap.phone] : row[2];
      const phone = normalizePhoneNumber(rawPhone);

      const rawEmail = colMap.email !== undefined ? String(row[colMap.email] || '').trim() : '';

      // School matching
      const rawSchool = colMap.school !== undefined ? String(row[colMap.school] || '').trim() : '';
      let matchedSchool = options.existingSchools.find(
        (s) =>
          (rawSchool && s.name.toLowerCase().includes(rawSchool.toLowerCase())) ||
          (rawSchool && s.code.toLowerCase() === rawSchool.toLowerCase())
      );
      if (!matchedSchool) {
        matchedSchool = defaultSchool as School;
      }

      const rawGrade = colMap.grade !== undefined ? String(row[colMap.grade] || '').trim() : '';
      const schoolGrade = rawGrade || '10A1';

      // Enrolled classes matching
      const rawClass = colMap.classRoom !== undefined ? String(row[colMap.classRoom] || '').trim() : '';
      const enrolledClassIds: string[] = [];
      const enrolledClassNames: string[] = [];

      if (rawClass) {
        // Can split by comma, semicolon or slash
        const classNames = rawClass.split(/[,;/+]/).map((c) => c.trim().toLowerCase()).filter(Boolean);
        options.existingClasses.forEach((cls) => {
          const clsLower = cls.name.toLowerCase();
          if (classNames.some((query) => clsLower.includes(query) || query.includes(clsLower))) {
            if (!enrolledClassIds.includes(cls.id)) {
              enrolledClassIds.push(cls.id);
              enrolledClassNames.push(cls.name);
            }
          }
        });
      }

      // Also apply default selected class if user picked one and not yet in list
      if (options.defaultClassId) {
        const defCls = options.existingClasses.find((c) => c.id === options.defaultClassId);
        if (defCls && !enrolledClassIds.includes(defCls.id)) {
          enrolledClassIds.push(defCls.id);
          enrolledClassNames.push(defCls.name);
        }
      }

      // Parents info (optional)
      const rawParentName = colMap.parentName !== undefined ? String(row[colMap.parentName] || '').trim() : '';
      const parentName = rawParentName || (fullName ? `Phụ huynh em ${fullName}` : 'Phụ huynh');

      const rawParentPhone = colMap.parentPhone !== undefined ? row[colMap.parentPhone] : '';
      const parentPhone = normalizePhoneNumber(rawParentPhone);

      const parentEmail = colMap.parentEmail !== undefined ? String(row[colMap.parentEmail] || '').trim() : '';

      const notes = colMap.notes !== undefined ? String(row[colMap.notes] || '').trim() : '';

      parsedRows.push({
        fullName,
        dob,
        birthYear,
        phone,
        email: rawEmail,
        schoolName: matchedSchool?.name || rawSchool || 'Trường Phổ Thông',
        schoolCode: matchedSchool?.code || 'PT',
        schoolId: matchedSchool?.id || 'sch-default',
        schoolGrade,
        enrolledClassIds,
        enrolledClassNames,
        parentName,
        parentPhone,
        parentEmail,
        notes,
      });
    }

    if (parsedRows.length === 0) {
      return { success: false, rows: [], error: 'Không tìm thấy dòng học sinh hợp lệ nào trong file.' };
    }

    return { success: true, rows: parsedRows };
  } catch (err: any) {
    return { success: false, rows: [], error: `Lỗi khi đọc file Excel: ${err?.message || err}` };
  }
}

/**
 * Parse a raw text list (e.g. pasted names) into ParsedStudentRow array.
 * Useful when teachers copy & paste names directly.
 */
export function parseRawStudentNames(
  rawText: string,
  options: ParseOptions
): ParsedStudentRow[] {
  if (!rawText.trim()) return [];

  const defaultSchool =
    options.existingSchools.find((s) => s.id === options.defaultSchoolId) ||
    options.existingSchools[0] || {
      id: 'sch-default',
      code: 'PT',
      name: 'Trường Phổ Thông',
    };

  const defaultClass = options.existingClasses.find((c) => c.id === options.defaultClassId);

  const lines = rawText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  const currentYear = new Date().getFullYear();
  const defaultYear = currentYear - 16; // 2010

  return lines.map((line, idx) => {
    // Strip leading number bullet if any (e.g. "1. Tiến Dũng" -> "Tiến Dũng")
    const cleanName = line.replace(/^\d+[\s.)-]+\s*/, '').trim() || `Học sinh ${idx + 1}`;

    return {
      fullName: cleanName,
      dob: `${defaultYear}-01-01`,
      birthYear: defaultYear,
      phone: '',
      email: '',
      schoolName: defaultSchool.name,
      schoolCode: defaultSchool.code,
      schoolId: defaultSchool.id,
      schoolGrade: '10',
      enrolledClassIds: defaultClass ? [defaultClass.id] : [],
      enrolledClassNames: defaultClass ? [defaultClass.name] : [],
      parentName: `Phụ huynh em ${cleanName}`,
      parentPhone: '',
      parentEmail: '',
      notes: 'Nhập nhanh từ danh sách',
    };
  });
}
