import QRCode from 'qrcode';

/**
 * VietQR and Payment Helper Utilities
 * Implements bank-standard payment reference generation:
 * [Mã trường]K[2 số cuối năm sinh][Tên học sinh]T[Tháng][Năm]
 * Example: SCHK09DucAnhT92026 or PBCK10TuanT72026
 * (Strictly NO underscores - ensures 100% exact match with mobile banking apps & bank statements)
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
 * Normalizes bank transaction descriptions and payment references
 * by removing Vietnamese accents, underscores, spaces, dashes, dots,
 * and converting to uppercase for 100% reliable bank reconciliation.
 * e.g. "SCH_K09_DucAnh_T9_2026" -> "SCHK09DUCANHT92026"
 *      "SCHK09DucAnhT92026"    -> "SCHK09DUCANHT92026"
 *      "SCH K09 Duc Anh T9 2026" -> "SCHK09DUCANHT92026"
 */
export function normalizeBankMemo(str: string): string {
  if (!str) return '';
  return removeVietnameseAccents(str)
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '');
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
 * 1. Default (Unique in school/grade/class): "Tuan" -> PBCK10TuanT82026
 * 2. Duplicate First Name (e.g. "Nguyễn Văn Tuấn" & "Nguyễn Minh Tuấn"):
 *    -> Adds Middle Name: "VanTuan" & "MinhTuan" -> PBCK10VanTuanT82026 & PBCK10MinhTuanT82026
 * 3. Identical Full Name (e.g. 2 students both named "Nguyễn Văn Tuấn"):
 *    -> Appends index suffix: "VanTuan1" & "VanTuan2" -> PBCK10VanTuan1T82026
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
 * Standardizes any existing or legacy payment reference by stripping underscores,
 * spaces, and special characters to match the mobile banking standard.
 * e.g. "SCH_K09_DucAnh_T9_2026" -> "SCHK09DucAnhT92026"
 */
export function standardizePaymentReference(ref: string): string {
  if (!ref) return '';
  return ref.replace(/[^a-zA-Z0-9]/g, '');
}

/**
 * Generates the standardized Payment Reference Memo
 * Bank-Standard Format: [Mã trường]K[2 số cuối năm sinh][Tên học sinh]T[Tháng][Năm]
 * Example: SCHK09DucAnhT92026 (Strictly NO underscores, prevents banking apps from stripping characters)
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
  const rawUniqueName = extractUniqueNameForMemo(studentFullName, studentId, contextStudents);
  const uniqueName = rawUniqueName.replace(/[^a-zA-Z0-9]/g, '');
  return `${cleanSchool}K${birthSuffix}${uniqueName}T${month}${year}`;
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
 * Accepts day number (0-6) or ISO date string (YYYY-MM-DD)
 */
export function formatDayOfWeek(day: number | string): string {
  let dayNum: number;
  if (typeof day === 'string') {
    if (day.includes('-')) {
      const parts = day.split('-').map(Number);
      if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
        // new Date(year, monthIndex, day) avoids UTC offset issues
        dayNum = new Date(parts[0], parts[1] - 1, parts[2]).getDay();
      } else {
        const parsed = new Date(day).getDay();
        dayNum = isNaN(parsed) ? 1 : parsed;
      }
    } else {
      dayNum = Number(day);
    }
  } else {
    dayNum = day;
  }

  switch (dayNum) {
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
 * Format date YYYY-MM-DD to DD/MM/YYYY
 */
export function formatDateVN(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
}

export interface BankInfo {
  code: string;
  bin: string;
  name: string;
  shortName: string;
  logo: string;
}

export const VIETNAMESE_BANKS: BankInfo[] = [
  { code: 'VCB', bin: '970436', name: 'Ngân hàng TMCP Ngoại thương Việt Nam', shortName: 'Vietcombank', logo: '🏦' },
  { code: 'MB', bin: '970422', name: 'Ngân hàng TMCP Quân đội', shortName: 'MBBank', logo: '🎖️' },
  { code: 'TCB', bin: '970407', name: 'Ngân hàng TMCP Kỹ thương Việt Nam', shortName: 'Techcombank', logo: '🔴' },
  { code: 'CTG', bin: '970415', name: 'Ngân hàng TMCP Công thương Việt Nam', shortName: 'VietinBank', logo: '🏛️' },
  { code: 'BIDV', bin: '970418', name: 'Ngân hàng TMCP Đầu tư và Phát triển VN', shortName: 'BIDV', logo: '🔵' },
  { code: 'ACB', bin: '970416', name: 'Ngân hàng TMCP Á Châu', shortName: 'ACB', logo: '🔷' },
  { code: 'VPB', bin: '970432', name: 'Ngân hàng TMCP Việt Nam Thịnh Vượng', shortName: 'VPBank', logo: '🌿' },
  { code: 'TPB', bin: '970423', name: 'Ngân hàng TMCP Tiên Phong', shortName: 'TPBank', logo: '🟣' },
  { code: 'STB', bin: '970403', name: 'Ngân hàng TMCP Sài Gòn Thương Tín', shortName: 'Sacombank', logo: '💎' },
  { code: 'HDB', bin: '970437', name: 'Ngân hàng TMCP Phát triển TP.HCM', shortName: 'HDBank', logo: '🔶' },
  { code: 'VBA', bin: '970405', name: 'Ngân hàng Nông nghiệp và PT Nông thôn VN', shortName: 'Agribank', logo: '🌾' },
  { code: 'SHB', bin: '970443', name: 'Ngân hàng TMCP Sài Gòn - Hà Nội', shortName: 'SHB', logo: '🏢' },
  { code: 'VIB', bin: '970441', name: 'Ngân hàng Quốc tế Việt Nam', shortName: 'VIB', logo: '⛵' },
  { code: 'MSB', bin: '970426', name: 'Ngân hàng Hàng Hải Việt Nam', shortName: 'MSB', logo: '⚓' },
  { code: 'OCB', bin: '970448', name: 'Ngân hàng Phương Đông', shortName: 'OCB', logo: '🌻' },
  { code: 'LPB', bin: '970449', name: 'Ngân hàng TMCP Lộc Phát Việt Nam', shortName: 'LPBank', logo: '🍀' },
];

export const BANK_BIN_MAP: Record<string, string> = {
  VCB: '970436',
  VIETCOMBANK: '970436',
  MB: '970422',
  MBBANK: '970422',
  TCB: '970407',
  TECHCOMBANK: '970407',
  CTG: '970415',
  ICB: '970415',
  VIETINBANK: '970415',
  BIDV: '970418',
  VBA: '970405',
  AGRIBANK: '970405',
  ACB: '970416',
  VPB: '970432',
  VPBANK: '970432',
  TPB: '970423',
  TPBANK: '970423',
  STB: '970403',
  SACOMBANK: '970403',
  HDB: '970437',
  HDBANK: '970437',
  VIB: '970441',
  SHB: '970443',
  MSB: '970426',
  OCB: '970448',
  SEAB: '970440',
  SEABANK: '970440',
  LPB: '970449',
  LPBANK: '970449',
  LIENVIETPOSTBANK: '970449',
  EIB: '970431',
  EXIMBANK: '970431',
  BAB: '970409',
  BACABANK: '970409',
  BVB: '970438',
  BAOVIETBANK: '970438',
  PVC: '970412',
  PVCOMBANK: '970412',
  VCCB: '970454',
  BVBANK: '970454',
  BANVIET: '970454',
  NAB: '970428',
  NAMABANK: '970428',
  KLB: '970452',
  KIENLONGBANK: '970452',
  SGB: '970400',
  SAIGONBANK: '970400',
  COOP: '970446',
  COOPBANK: '970446',
  WOORI: '970457',
  WOORIBANK: '970457',
  SHINHAN: '970424',
  SHBVN: '970424',
  PUBLICBANK: '970439',
  HONGLEONG: '970442',
  IVB: '970434',
  INDOVINA: '970434',
  UOB: '970458',
  VRB: '970421',
};

/**
 * Returns the 6-digit NAPAS Acquirer BIN for a given bank code, short name, or BIN string.
 */
export function getBankBin(bankCodeOrName: string): string {
  if (!bankCodeOrName) return '970436';
  const clean = bankCodeOrName.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (/^\d{6}$/.test(clean)) {
    return clean;
  }
  return BANK_BIN_MAP[clean] || '970436';
}

/**
 * Computes standard CRC-16/CCITT-FALSE (Polynomial 0x1021, Init 0xFFFF)
 * Required by EMVCo / NAPAS 247 specification.
 */
export function crc16ccitt(str: string): string {
  let crc = 0xffff;
  for (let i = 0; i < str.length; i++) {
    crc ^= str.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = ((crc << 1) ^ 0x1021) & 0xffff;
      } else {
        crc = (crc << 1) & 0xffff;
      }
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

/**
 * Helper to build an EMVCo Tag-Length-Value (TLV) chunk
 */
function formatTLV(tag: string, value: string): string {
  const len = String(value.length).padStart(2, '0');
  return `${tag}${len}${value}`;
}

/**
 * Generates official EMVCo QR Code standard string for NAPAS 247 (VietQR)
 * Compatible with 100% of Vietnamese Mobile Banking Apps (VCB, MB, TCB, CTG, BIDV, ACB, etc.)
 */
export function generateVietQREMVCo(params: {
  bankCodeOrBin: string;
  accountNumber: string;
  amount?: number;
  memo?: string;
}): string {
  const bin = getBankBin(params.bankCodeOrBin);
  const cleanAccount = (params.accountNumber || '').replace(/[^0-9A-Za-z]/g, '');
  const cleanMemo = removeVietnameseAccents(params.memo || '')
    .replace(/[^A-Za-z0-9]/g, '')
    .slice(0, 25);

  // Tag 38: Merchant Account Information (NAPAS 247)
  // Sub-tag 00: GUID = A000000727
  // Sub-tag 01: Beneficiary (Sub-sub-tag 00: BIN, Sub-sub-tag 01: Account No)
  // Sub-tag 02: Service Code = QRIBFTTA (Quick Transfer to Account)
  const beneficiaryInfo = formatTLV('00', bin) + formatTLV('01', cleanAccount);
  const merchantAccountInfo =
    formatTLV('00', 'A000000727') +
    formatTLV('01', beneficiaryInfo) +
    formatTLV('02', 'QRIBFTTA');

  const hasAmount = params.amount !== undefined && params.amount > 0;
  const pointOfInitiation = hasAmount ? '12' : '11';

  let raw =
    formatTLV('00', '01') + // Format indicator
    formatTLV('01', pointOfInitiation) + // Dynamic (12) or Static (11)
    formatTLV('38', merchantAccountInfo) + // NAPAS Service info
    formatTLV('53', '704'); // VND Currency Code

  if (hasAmount) {
    raw += formatTLV('54', Math.round(params.amount!).toString());
  }

  raw += formatTLV('58', 'VN'); // Country code Vietnam

  if (cleanMemo) {
    const additionalData = formatTLV('08', cleanMemo);
    raw += formatTLV('62', additionalData);
  }

  raw += '6304';
  const checksum = crc16ccitt(raw);
  return raw + checksum;
}

/**
 * Generates a high-resolution, pixel-crisp base64 PNG data URL of the official VietQR.
 * Works 100% offline, zero CORS issues, instant 0ms generation.
 */
export async function generateVietQRDataUrl(params: {
  bankCodeOrBin: string;
  accountNumber: string;
  amount?: number;
  memo?: string;
  width?: number;
}): Promise<string> {
  const emvcoPayload = generateVietQREMVCo(params);
  return await QRCode.toDataURL(emvcoPayload, {
    margin: 2, // 2 modules white margin for reliable camera detection
    width: params.width || 450,
    errorCorrectionLevel: 'M',
    color: {
      dark: '#000000',
      light: '#ffffff',
    },
  });
}

/**
 * Get VietQR Quicklink URL (Official NAPAS Standard image endpoint)
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
