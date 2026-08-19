/**
 * VietQR and Payment Helper Utilities
 * Implements standard payment reference generation:
 * [Mã trường]_K[2 số cuối năm sinh]_[Tên học sinh]_T[Tháng]_[Năm]
 * Example: PBC_K10_Tuan_T7_2026
 */

/**
 * Remove Vietnamese accents to create standardized ASCII strings
 */
export function removeVietnameseAccents(str: string): string {
  if (!str) return '';
  let result = str;
  result = result.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, 'a');
  result = result.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, 'A');
  result = result.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, 'e');
  result = result.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, 'E');
  result = result.replace(/ì|í|ị|ỉ|ĩ/g, 'i');
  result = result.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, 'I');
  result = result.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, 'o');
  result = result.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, 'O');
  result = result.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, 'u');
  result = result.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, 'U');
  result = result.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, 'y');
  result = result.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, 'Y');
  result = result.replace(/đ/g, 'd');
  result = result.replace(/Đ/g, 'D');
  return result;
}

/**
 * Extracts normalized first name / short call-name for transfer memo
 * e.g. "Nguyễn Minh Tuấn" -> "Tuan", "Trần Bảo Ngọc" -> "Ngoc"
 */
export function extractFirstNameForMemo(fullName: string): string {
  if (!fullName) return 'HocSinh';
  const clean = removeVietnameseAccents(fullName.trim());
  const parts = clean.split(/\s+/);
  const lastName = parts[parts.length - 1] || 'HocSinh';
  // Capitalize first letter, lower remaining
  return lastName.charAt(0).toUpperCase() + lastName.slice(1).toLowerCase();
}

/**
 * Smart Disambiguation Engine for Payment Reference:
 * 1. Default (Unique in school/grade/class): "Tuan" -> PBC_K10_Tuan_T8_2026
 * 2. Duplicate First Name (e.g. "Nguyễn Văn Tuấn" & "Nguyễn Minh Tuấn"):
 *    -> Adds Middle Name: "VanTuan" & "MinhTuan" -> PBC_K10_VanTuan_T8_2026 & PBC_K10_MinhTuan_T8_2026
 * 3. Identical Full Name (e.g. 2 students both named "Nguyễn Văn Tuấn"):
 *    -> Appends index suffix: "VanTuan1" & "VanTuan2" -> PBC_K10_VanTuan1_T8_2026
 */
export function extractUniqueNameForMemo(
  studentFullName: string,
  studentId?: string,
  contextStudents?: Array<{ id: string; fullName: string; schoolCode?: string; birthYear?: number }>
): string {
  if (!studentFullName) return 'HocSinh';

  const clean = removeVietnameseAccents(studentFullName.trim());
  const words = clean.split(/\s+/).filter(Boolean);
  if (words.length === 0) return 'HocSinh';

  const rawFirstName = words[words.length - 1];
  const capitalizedFirstName =
    rawFirstName.charAt(0).toUpperCase() + rawFirstName.slice(1).toLowerCase();

  // If no student list context provided, return the standard short name
  if (!contextStudents || contextStudents.length <= 1) {
    return capitalizedFirstName;
  }

  // Filter students in the same school/grade cohort or general context who share the same first name
  const sameFirstNameStudents = contextStudents.filter((s) => {
    const sClean = removeVietnameseAccents(s.fullName.trim());
    const sWords = sClean.split(/\s+/).filter(Boolean);
    const sFirst = sWords[sWords.length - 1] || '';
    return sFirst.toLowerCase() === rawFirstName.toLowerCase();
  });

  // If this first name is unique across the cohort, keep the short concise form
  if (sameFirstNameStudents.length <= 1) {
    return capitalizedFirstName;
  }

  // DUPLICATE DETECTED: Prepend middle name (Chữ lót)
  // e.g. "Nguyễn Văn Tuấn" -> "VanTuan", "Nguyễn Minh Tuấn" -> "MinhTuan"
  let middleName = '';
  if (words.length >= 2) {
    const rawMiddle = words[words.length - 2];
    middleName = rawMiddle.charAt(0).toUpperCase() + rawMiddle.slice(1).toLowerCase();
  }

  const combinedName = middleName ? `${middleName}${capitalizedFirstName}` : capitalizedFirstName;

  // Check if middle + first name is still shared (e.g. two "Nguyễn Văn Tuấn" in same class/school)
  const sameCombinedStudents = sameFirstNameStudents.filter((s) => {
    const sClean = removeVietnameseAccents(s.fullName.trim());
    const sWords = sClean.split(/\s+/).filter(Boolean);
    const sFirst = sWords[sWords.length - 1] || '';
    const sMiddle = sWords.length >= 2 ? sWords[sWords.length - 2] : '';
    const sCombined =
      (sMiddle ? sMiddle.charAt(0).toUpperCase() + sMiddle.slice(1).toLowerCase() : '') +
      (sFirst.charAt(0).toUpperCase() + sFirst.slice(1).toLowerCase());
    return sCombined.toLowerCase() === combinedName.toLowerCase();
  });

  if (sameCombinedStudents.length > 1 && studentId) {
    // Sort stable by ID and add sequence suffix (1, 2, ...)
    const sortedIds = sameCombinedStudents.map((s) => s.id).sort();
    const idx = sortedIds.indexOf(studentId);
    if (idx >= 0) {
      return `${combinedName}${idx + 1}`;
    }
  }

  return combinedName;
}

/**
 * Generates the standardized Payment Reference Memo
 * Rule BR-010 / SRS: [Mã trường]_K[2 số cuối năm sinh]_[Tên học sinh]_T[Tháng]_[Năm]
 * Auto-disambiguates when duplicate names exist in the student pool
 */
export function generatePaymentReference(
  schoolCode: string,
  birthYear: number,
  studentFullName: string,
  month: number,
  year: number,
  studentId?: string,
  contextStudents?: Array<{ id: string; fullName: string; schoolCode?: string; birthYear?: number }>
): string {
  const cleanSchool = (schoolCode || 'SCH').toUpperCase().replace(/[^A-Z0-9]/g, '');
  const birthSuffix = String(birthYear || 2010).slice(-2);
  const uniqueName = extractUniqueNameForMemo(studentFullName, studentId, contextStudents);
  return `${cleanSchool}_K${birthSuffix}_${uniqueName}_T${month}_${year}`;
}

/**
 * Format Currency (VND)
 */
export function formatVND(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount || 0);
}

/**
 * Format Day of Week in Vietnamese
 */
export function formatDayOfWeek(day: number): string {
  switch (day) {
    case 0:
      return 'Chủ Nhật';
    case 1:
      return 'Thứ 2';
    case 2:
      return 'Thứ 3';
    case 3:
      return 'Thứ 4';
    case 4:
      return 'Thứ 5';
    case 5:
      return 'Thứ 6';
    case 6:
      return 'Thứ 7';
    default:
      return 'Thứ 2';
  }
}

/**
 * Get VietQR Quicklink URL (Official NAPAS Standard)
 */
export function getVietQRUrl(
  bankCode: string,
  accountNumber: string,
  amount: number,
  description: string,
  accountName?: string
): string {
  const bank = bankCode || 'VCB';
  const acc = accountNumber || '0123456789';
  const encodedDesc = encodeURIComponent(description || '');
  const encodedName = accountName ? encodeURIComponent(accountName) : '';
  return `https://img.vietqr.io/image/${bank}-${acc}-compact2.png?amount=${amount}&addInfo=${encodedDesc}&accountName=${encodedName}`;
}

export interface BankInfo {
  code: string;
  name: string;
  shortName: string;
  logo: string;
}

export const VIETNAMESE_BANKS: BankInfo[] = [
  { code: 'VCB', name: 'Ngân hàng TMCP Ngoại thương Việt Nam', shortName: 'Vietcombank', logo: '🏦' },
  { code: 'MB', name: 'Ngân hàng TMCP Quân đội', shortName: 'MBBank', logo: '🎖️' },
  { code: 'TCB', name: 'Ngân hàng TMCP Kỹ thương Việt Nam', shortName: 'Techcombank', logo: '🔴' },
  { code: 'CTG', name: 'Ngân hàng TMCP Công thương Việt Nam', shortName: 'VietinBank', logo: '🏛️' },
  { code: 'BIDV', name: 'Ngân hàng TMCP Đầu tư và Phát triển VN', shortName: 'BIDV', logo: '🔵' },
  { code: 'ACB', name: 'Ngân hàng TMCP Á Châu', shortName: 'ACB', logo: '🔷' },
  { code: 'VPB', name: 'Ngân hàng TMCP Việt Nam Thịnh Vượng', shortName: 'VPBank', logo: '🌿' },
  { code: 'TPB', name: 'Ngân hàng TMCP Tiên Phong', shortName: 'TPBank', logo: '🟣' },
  { code: 'STB', name: 'Ngân hàng TMCP Sài Gòn Thương Tín', shortName: 'Sacombank', logo: '💎' },
  { code: 'HDB', name: 'Ngân hàng TMCP Phát triển TP.HCM', shortName: 'HDBank', logo: '🔶' },
];
