import * as XLSX from 'xlsx';
import { BankTransaction } from '../types';

export interface ParsedTransactionRow {
  stt: number;
  transactionDate: string; // Formatted date string (e.g. 04/08/2026 or 04/08/2026 20:45)
  docNo?: string;
  amount: number; // Credit amount (Số tiền ghi có)
  description: string; // Nội dung chi tiết
  balance?: number; // Số dư nếu có
  detectedMonth?: number;
  detectedYear?: number;
  rawDate?: string;
}

export interface ParseResult {
  success: boolean;
  transactions: ParsedTransactionRow[];
  detectedMonth: number;
  detectedYear: number;
  totalCreditAmount: number;
  fileName: string;
  errorMessage?: string;
}

/**
 * Clean and parse Vietnamese numeric string (e.g. "600,000" or "600.000" or 600000)
 */
export function parseVNDAmount(val: any): number {
  if (val === null || val === undefined || val === '') return 0;
  if (typeof val === 'number') return isNaN(val) ? 0 : Math.abs(val);

  const str = String(val).trim();
  // Remove currency characters, spaces, and thousand separators
  // Note: if there is both . and , like 600,000.00 or 600.000,00
  let cleaned = str.replace(/[^\d.,-]/g, '');
  if (!cleaned) return 0;

  // Handle standard VN format e.g. "600,000" or "600.000"
  if (cleaned.includes(',') && !cleaned.includes('.')) {
    cleaned = cleaned.replace(/,/g, '');
  } else if (cleaned.includes('.') && !cleaned.includes(',')) {
    // If it has dots like 600.000 or 1.200.000
    const parts = cleaned.split('.');
    if (parts.length > 2 || (parts.length === 2 && parts[1].length === 3)) {
      cleaned = cleaned.replace(/\./g, '');
    }
  } else if (cleaned.includes(',') && cleaned.includes('.')) {
    // e.g. 600,000.00
    cleaned = cleaned.replace(/,/g, '');
  }

  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : Math.abs(num);
}

/**
 * Parse date string or Excel serial date
 */
export function parseVietcombankDate(val: any): {
  dateStr: string;
  docNo?: string;
  month?: number;
  year?: number;
} {
  if (val === null || val === undefined || val === '') {
    const now = new Date();
    return {
      dateStr: `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`,
      month: now.getMonth() + 1,
      year: now.getFullYear(),
    };
  }

  // Handle Excel Serial Date number (e.g. 46239)
  if (typeof val === 'number') {
    const jsDate = new Date((val - (25567 + 2)) * 86400 * 1000);
    if (!isNaN(jsDate.getTime())) {
      const d = String(jsDate.getDate()).padStart(2, '0');
      const m = String(jsDate.getMonth() + 1).padStart(2, '0');
      const y = jsDate.getFullYear();
      return {
        dateStr: `${d}/${m}/${y}`,
        month: jsDate.getMonth() + 1,
        year: y,
      };
    }
  }

  const str = String(val).trim();

  // Multi-line cell handling: "04/08/2026\n5389 - 82579" or "04/08/2026 5389 - 82579"
  const lines = str.split(/[\r\n]+/);
  const mainDateLine = lines[0].trim();
  const docNo = lines.length > 1 ? lines.slice(1).join(' ').trim() : undefined;

  // Extract DD/MM/YYYY or YYYY-MM-DD or DD-MM-YYYY
  const matchDMY = mainDateLine.match(/(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{4})/);
  if (matchDMY) {
    const day = Number(matchDMY[1]);
    const month = Number(matchDMY[2]);
    const year = Number(matchDMY[3]);
    const formattedDate = `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;
    return {
      dateStr: formattedDate,
      docNo,
      month,
      year,
    };
  }

  const matchYMD = mainDateLine.match(/(\d{4})[/\-.](\d{1,2})[/\-.](\d{1,2})/);
  if (matchYMD) {
    const year = Number(matchYMD[1]);
    const month = Number(matchYMD[2]);
    const day = Number(matchYMD[3]);
    const formattedDate = `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;
    return {
      dateStr: formattedDate,
      docNo,
      month,
      year,
    };
  }

  return {
    dateStr: mainDateLine || str,
    docNo,
  };
}

/**
 * Parse Vietcombank Excel / CSV file
 */
export async function parseBankStatementFile(
  file: File,
  targetMonth?: number,
  targetYear?: number
): Promise<ParseResult> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array', cellDates: true });

    if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
      return {
        success: false,
        transactions: [],
        detectedMonth: targetMonth || new Date().getMonth() + 1,
        detectedYear: targetYear || new Date().getFullYear(),
        totalCreditAmount: 0,
        fileName: file.name,
        errorMessage: 'File Excel không có dữ liệu trang tính (Sheet).',
      };
    }

    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];

    // Convert sheet to 2D array of rows
    const rawRows: any[][] = XLSX.utils.sheet_to_json(worksheet, {
      header: 1,
      defval: '',
      blankrows: false,
    });

    if (rawRows.length === 0) {
      return {
        success: false,
        transactions: [],
        detectedMonth: targetMonth || new Date().getMonth() + 1,
        detectedYear: targetYear || new Date().getFullYear(),
        totalCreditAmount: 0,
        fileName: file.name,
        errorMessage: 'Trang tính không có dòng dữ liệu nào.',
      };
    }

    // Identify header row and column mapping
    let headerRowIdx = -1;
    let colStt = 0;
    let colDate = 1;
    let colDebit = 2;
    let colCredit = 3;
    let colBalance = 4;
    let colDescription = 5;

    for (let r = 0; r < Math.min(rawRows.length, 15); r++) {
      const row = rawRows[r].map((c) => String(c).toLowerCase().trim());
      const hasStt = row.some((c) => c.includes('stt') || c.includes('no.'));
      const hasDate = row.some((c) => c.includes('ngày') || c.includes('date') || c.includes('tnx'));
      const hasCredit = row.some((c) => c.includes('ghi có') || c.includes('credit') || c.includes('số tiền'));
      const hasDesc = row.some((c) => c.includes('nội dung') || c.includes('transactions') || c.includes('chi tiết') || c.includes('detail'));

      if ((hasStt && hasDate) || (hasDate && (hasCredit || hasDesc)) || (hasCredit && hasDesc)) {
        headerRowIdx = r;
        // Map column indices
        row.forEach((cell, idx) => {
          if (cell.includes('stt') || cell.includes('no.')) colStt = idx;
          else if (cell.includes('ngày') || cell.includes('date') || cell.includes('tnx') || cell.includes('thời gian')) colDate = idx;
          else if (cell.includes('ghi nợ') || cell.includes('debit')) colDebit = idx;
          else if (cell.includes('ghi có') || cell.includes('credit') || cell.includes('số tiền nhận') || (cell.includes('số tiền') && !cell.includes('nợ'))) colCredit = idx;
          else if (cell.includes('số dư') || cell.includes('balance')) colBalance = idx;
          else if (cell.includes('nội dung') || cell.includes('transactions') || cell.includes('detail') || cell.includes('memo') || cell.includes('diễn giải')) colDescription = idx;
        });
        break;
      }
    }

    const dataStartRow = headerRowIdx >= 0 ? headerRowIdx + 1 : 0;
    const transactions: ParsedTransactionRow[] = [];
    const monthCounts: Record<string, number> = {};

    let currentStt = 1;

    for (let r = dataStartRow; r < rawRows.length; r++) {
      const row = rawRows[r];
      if (!row || row.length === 0) continue;

      const rawStt = row[colStt];
      const rawDate = row[colDate];
      const rawCredit = row[colCredit];
      const rawDesc = row[colDescription] !== undefined ? row[colDescription] : (row[row.length - 1] || '');
      const rawBalance = row[colBalance];

      // Parse amount
      const amount = parseVNDAmount(rawCredit);

      // Parse description
      const description = String(rawDesc || '').trim();

      // If both amount and description are empty, skip row
      if (amount === 0 && !description) continue;

      // Parse date
      const dateInfo = parseVietcombankDate(rawDate);

      if (dateInfo.month && dateInfo.year) {
        const key = `${dateInfo.month}-${dateInfo.year}`;
        monthCounts[key] = (monthCounts[key] || 0) + 1;
      }

      const stt = typeof rawStt === 'number' && rawStt > 0
        ? rawStt
        : (!isNaN(Number(rawStt)) && Number(rawStt) > 0 ? Number(rawStt) : currentStt);

      transactions.push({
        stt,
        transactionDate: dateInfo.dateStr,
        docNo: dateInfo.docNo,
        amount,
        description,
        balance: parseVNDAmount(rawBalance),
        detectedMonth: dateInfo.month,
        detectedYear: dateInfo.year,
        rawDate: String(rawDate || ''),
      });

      currentStt++;
    }

    // Determine primary month & year from transactions or target
    let primaryMonth = targetMonth || new Date().getMonth() + 1;
    let primaryYear = targetYear || new Date().getFullYear();

    // Find the most frequent month-year in the file
    let maxCount = 0;
    Object.entries(monthCounts).forEach(([key, count]) => {
      if (count > maxCount) {
        maxCount = count;
        const [m, y] = key.split('-').map(Number);
        primaryMonth = m;
        primaryYear = y;
      }
    });

    const totalCreditAmount = transactions.reduce((sum, t) => sum + t.amount, 0);

    return {
      success: transactions.length > 0,
      transactions,
      detectedMonth: primaryMonth,
      detectedYear: primaryYear,
      totalCreditAmount,
      fileName: file.name,
      errorMessage: transactions.length === 0 ? 'Không tìm thấy dòng giao dịch hợp lệ nào trong file.' : undefined,
    };
  } catch (err: any) {
    return {
      success: false,
      transactions: [],
      detectedMonth: targetMonth || new Date().getMonth() + 1,
      detectedYear: targetYear || new Date().getFullYear(),
      totalCreditAmount: 0,
      fileName: file.name,
      errorMessage: `Lỗi khi đọc file Excel: ${err?.message || 'Định dạng file không hỗ trợ'}`,
    };
  }
}

/**
 * Generate and download a sample Vietcombank Statement Excel file (.xlsx)
 * Matching the exact structure of Vietcombank shown in user's image!
 */
export function exportSampleVietcombankExcel(month: number = 8, year: number = 2026) {
  const monthPadded = String(month).padStart(2, '0');

  // Exact 6 columns matching the Vietcombank format in the photo:
  // STT / No. | Ngày/ TNX Date / Số CT/ Doc No | Số tiền ghi nợ/ Debit | Số tiền ghi có/ Credit | Số dư/ Balance | Nội dung chi tiết/ Transactions in detail
  const headers = [
    'STT\nNo.',
    'Ngày/\nTNX Date / Số CT/\nDoc No',
    'Số tiền ghi nợ/\nDebit',
    'Số tiền ghi có/\nCredit',
    'Số dư/\nBalance',
    'Nội dung chi tiết/\nTransactions in detail',
  ];

  const rows = [
    [
      1,
      `04/${monthPadded}/${year}\n5389 - 82579`,
      '',
      600000,
      2396830,
      `Vietcombank:1027058089:Le Thi Hong Hanh chuyen khoan#SP#020097040508042045012026XWPC078779.5389.82579.204501`,
    ],
    [
      2,
      `04/${monthPadded}/${year}\n5423 - 56792`,
      '',
      480000,
      2876830,
      `6216VNIB02TFF7A9.Vinh Ha Noi chuyen khoan nhanh qua Zalo.20260804.204748.088704060061156.TRAN DUC VINH.970441`,
    ],
    [
      3,
      `04/${monthPadded}/${year}\n5189 - 13698`,
      '',
      400000,
      3276830,
      `NGUYEN THI HOAN chuyen tien#SP#020097042208042050202026CO4G401868.5189.13698.205020`,
    ],
    [
      4,
      `04/${monthPadded}/${year}\n5423 - 84904`,
      '',
      480000,
      3756830,
      `6216IBT1kCTXBFP.com tran anh tuan lop 11a6 dong hoc t7 a FT26216065500316.20260804.205613.19035384403017.VND-TGTT-NGUYEN`,
    ],
    [
      5,
      `06/${monthPadded}/${year}\n5512 - 99120`,
      '',
      800000,
      4556830,
      `MBVCB.7492831.PBC_K10_Tuan_T${month}_${year} NGUYEN VAN HUNG NOP TIEN HOC PHI THANG ${month}`,
    ],
    [
      6,
      `07/${monthPadded}/${year}\n5588 - 33112`,
      '',
      800000,
      5356830,
      `IBFT.LE THI LAN CHUYEN KHOAN PBC_K10_Long_T${month}_${year} HOC PHI TOAN`,
    ],
    [
      7,
      `08/${monthPadded}/${year}\n5610 - 44190`,
      '',
      960000,
      6316830,
      `NAPAS 1029384 PBC_K09_Minh_T${month}_${year} VU TRONG PHUNG NOP HOC PHI LOP 11A`,
    ],
  ];

  const wsData = [headers, ...rows];
  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Set column widths
  ws['!cols'] = [
    { wch: 8 },  // STT
    { wch: 22 }, // Ngày / Số CT
    { wch: 18 }, // Ghi nợ
    { wch: 18 }, // Ghi có
    { wch: 18 }, // Số dư
    { wch: 65 }, // Nội dung chi tiết
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, `SaoKe_VCB_T${month}_${year}`);

  XLSX.writeFile(wb, `Sao_Ke_Vietcombank_Thang_${monthPadded}_${year}.xlsx`);
}
