/**
 * Converts a number into formal Vietnamese words for invoices/receipts.
 * Example: 480000 -> "Bốn trăm tám mươi nghìn đồng chẵn."
 */
const DIGITS = ['không', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];

function readThreeDigits(n: number, isHighestGroup: boolean): string {
  const hundreds = Math.floor(n / 100);
  const tens = Math.floor((n % 100) / 10);
  const units = n % 10;

  let result = '';

  if (hundreds > 0 || !isHighestGroup) {
    result += `${DIGITS[hundreds]} trăm `;
  }

  if (tens > 1) {
    result += `${DIGITS[tens]} mươi `;
    if (units === 1) {
      result += 'mốt ';
    } else if (units === 5) {
      result += 'lăm ';
    } else if (units > 0) {
      result += `${DIGITS[units]} `;
    }
  } else if (tens === 1) {
    result += 'mười ';
    if (units === 5) {
      result += 'lăm ';
    } else if (units > 0) {
      result += `${DIGITS[units]} `;
    }
  } else {
    // tens === 0
    if (hundreds > 0 || !isHighestGroup) {
      if (units > 0) {
        result += `linh ${DIGITS[units]} `;
      }
    } else if (units > 0) {
      result += `${DIGITS[units]} `;
    }
  }

  return result.trim();
}

export function numberToVietnameseWords(amount: number): string {
  if (!amount || amount === 0) {
    return 'Không đồng chẵn.';
  }

  let num = Math.round(Math.abs(amount));
  const groups: number[] = [];

  while (num > 0) {
    groups.push(num % 1000);
    num = Math.floor(num / 1000);
  }

  const UNITS = ['', 'nghìn', 'triệu', 'tỷ', 'nghìn tỷ', 'triệu tỷ'];
  const words: string[] = [];

  for (let i = groups.length - 1; i >= 0; i--) {
    const groupVal = groups[i];
    if (groupVal > 0) {
      const isHighest = i === groups.length - 1;
      const groupWords = readThreeDigits(groupVal, isHighest);
      const unit = UNITS[i];
      if (unit) {
        words.push(`${groupWords} ${unit}`);
      } else {
        words.push(groupWords);
      }
    }
  }

  let finalStr = words.join(' ').replace(/\s+/g, ' ').trim();
  if (!finalStr) {
    return 'Không đồng chẵn.';
  }

  // Capitalize first character and append "đồng chẵn."
  finalStr = finalStr.charAt(0).toUpperCase() + finalStr.slice(1) + ' đồng chẵn.';
  return finalStr;
}
