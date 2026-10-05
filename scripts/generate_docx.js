import * as docx from 'docx';
import fs from 'fs';
import path from 'path';

const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  ImageRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  BorderStyle,
  Header,
  Footer,
  PageNumber,
  PageBreak,
  ShadingType
} = docx;

const ASSETS_DIR = path.resolve('public/manual_assets');
const OUTPUT_FILE = path.resolve('public/Huong_Dan_Su_Dung_EduTutor_Pro.docx');
const ROOT_OUTPUT_FILE = path.resolve('Huong_Dan_Su_Dung_EduTutor_Pro.docx');

// Colors
const COLOR_PRIMARY = '1D4ED8'; // Blue 700
const COLOR_SECONDARY = '0F172A'; // Slate 900
const COLOR_ACCENT = '059669'; // Emerald 600
const COLOR_MUTED = '475569'; // Slate 600
const COLOR_LIGHT_BG = 'F8FAFC'; // Slate 50
const COLOR_BORDER = 'CBD5E1'; // Slate 300

// Helper to create styled Heading 1
function createHeading1(title) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 360, after: 180 },
    children: [
      new TextRun({
        text: title,
        bold: true,
        size: 32, // 16pt
        color: COLOR_PRIMARY,
        font: 'Arial'
      })
    ]
  });
}

// Helper to create Heading 2
function createHeading2(title) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 260, after: 120 },
    children: [
      new TextRun({
        text: title,
        bold: true,
        size: 26, // 13pt
        color: COLOR_SECONDARY,
        font: 'Arial'
      })
    ]
  });
}

// Helper to create Heading 3
function createHeading3(title) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 180, after: 80 },
    children: [
      new TextRun({
        text: title,
        bold: true,
        size: 22, // 11pt
        color: COLOR_MUTED,
        font: 'Arial'
      })
    ]
  });
}

// Standard body paragraph
function createP(text, options = {}) {
  const { bold = false, italic = false, color = '1E293B', spaceAfter = 120 } = options;
  return new Paragraph({
    spacing: { after: spaceAfter, line: 300 },
    children: [
      new TextRun({
        text,
        bold,
        italic,
        size: 22, // 11pt
        color,
        font: 'Arial'
      })
    ]
  });
}

// Paragraph with bold prefix
function createBullet(prefix, text) {
  return new Paragraph({
    spacing: { after: 100, line: 280 },
    bullet: { level: 0 },
    children: [
      new TextRun({
        text: prefix + ': ',
        bold: true,
        size: 22,
        color: '0F172A',
        font: 'Arial'
      }),
      new TextRun({
        text,
        size: 22,
        color: '334155',
        font: 'Arial'
      })
    ]
  });
}

// Step item
function createStep(stepNum, title, desc) {
  return new Paragraph({
    spacing: { before: 100, after: 100, line: 280 },
    indent: { left: 360 },
    children: [
      new TextRun({
        text: `Bước ${stepNum}: `,
        bold: true,
        color: COLOR_PRIMARY,
        size: 22,
        font: 'Arial'
      }),
      new TextRun({
        text: title + ' – ',
        bold: true,
        color: '0F172A',
        size: 22,
        font: 'Arial'
      }),
      new TextRun({
        text: desc,
        color: '334155',
        size: 22,
        font: 'Arial'
      })
    ]
  });
}

// Callout box (Tip, Warning, Info)
function createCallout(title, text, type = 'info') {
  let bgColor = 'EFF6FF'; // Blue 50
  let borderColor = '3B82F6';
  let titleColor = '1E40AF';
  let icon = '💡 ';

  if (type === 'warning') {
    bgColor = 'FFFBEB';
    borderColor = 'F59E0B';
    titleColor = 'B45309';
    icon = '⚠️ ';
  } else if (type === 'success') {
    bgColor = 'F0FDF4';
    borderColor = '10B981';
    titleColor = '15803D';
    icon = '🔒 ';
  }

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    margins: { top: 140, bottom: 140, left: 200, right: 200 },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            shading: { fill: bgColor, type: ShadingType.CLEAR },
            borders: {
              left: { style: BorderStyle.SINGLE, size: 24, color: borderColor },
              top: { style: BorderStyle.NONE },
              right: { style: BorderStyle.NONE },
              bottom: { style: BorderStyle.NONE }
            },
            children: [
              new Paragraph({
                spacing: { after: 60 },
                children: [
                  new TextRun({
                    text: icon + title,
                    bold: true,
                    size: 22,
                    color: titleColor,
                    font: 'Arial'
                  })
                ]
              }),
              new Paragraph({
                spacing: { after: 0, line: 260 },
                children: [
                  new TextRun({
                    text,
                    size: 20, // 10pt
                    color: '1E293B',
                    font: 'Arial'
                  })
                ]
              })
            ]
          })
        ]
      })
    ]
  });
}

// Image with border and caption
function createImageWithCaption(filename, caption, figureNumber, width = 500, height = 290) {
  const filePath = path.join(ASSETS_DIR, filename);
  if (!fs.existsSync(filePath)) {
    console.warn(`File not found: ${filePath}`);
    return [new Paragraph({ text: `[Ảnh chưa sẵn sàng: ${filename}]` })];
  }

  const imageData = fs.readFileSync(filePath);

  return [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 180, after: 80 },
      children: [
        new ImageRun({
          data: imageData,
          type: 'png',
          transformation: {
            width,
            height
          }
        })
      ]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 40, after: 200 },
      children: [
        new TextRun({
          text: `Hình ${figureNumber}: `,
          bold: true,
          italic: true,
          size: 19, // 9.5pt
          color: COLOR_PRIMARY,
          font: 'Arial'
        }),
        new TextRun({
          text: caption,
          italic: true,
          size: 19,
          color: COLOR_MUTED,
          font: 'Arial'
        })
      ]
    })
  ];
}

// Table helper
function createTableWidget(headers, rows) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        tableHeader: true,
        children: headers.map(h => new TableCell({
          shading: { fill: '1E293B', type: ShadingType.CLEAR },
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              spacing: { before: 80, after: 80 },
              children: [
                new TextRun({
                  text: h,
                  bold: true,
                  color: 'FFFFFF',
                  size: 20,
                  font: 'Arial'
                })
              ]
            })
          ]
        }))
      }),
      ...rows.map((row, rIdx) => new TableRow({
        children: row.map((cellText, cIdx) => new TableCell({
          shading: { fill: rIdx % 2 === 0 ? 'FFFFFF' : 'F8FAFC', type: ShadingType.CLEAR },
          children: [
            new Paragraph({
              alignment: cIdx === 0 ? AlignmentType.LEFT : AlignmentType.CENTER,
              spacing: { before: 60, after: 60 },
              children: [
                new TextRun({
                  text: cellText,
                  size: 19,
                  color: '334155',
                  font: 'Arial'
                })
              ]
            })
          ]
        }))
      }))
    ]
  });
}

async function buildDocx() {
  console.log('Assembling comprehensive Word document...');

  const doc = new Document({
    creator: 'EduTutor Pro Engineering Team',
    title: 'Sổ tay Hướng dẫn Sử dụng Hệ thống EduTutor Pro',
    description: 'Tài liệu hướng dẫn chi tiết toàn bộ các chức năng kèm hình ảnh minh họa cho EduTutor Pro',
    sections: [
      // ================= SECTION 1: COVER PAGE =================
      {
        properties: {},
        children: [
          new Paragraph({ spacing: { before: 720, after: 200 } }),
          // Logo & Branding
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 360, after: 120 },
            children: [
              new TextRun({
                text: 'EDUTUTOR PRO',
                bold: true,
                size: 48, // 24pt
                color: COLOR_PRIMARY,
                font: 'Arial'
              })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 360 },
            children: [
              new TextRun({
                text: 'HỆ THỐNG QUẢN LÝ DẠY HỌC THÊM & TRUNG TÂM ĐÀO TẠO THÔNG MINH',
                bold: true,
                size: 24, // 12pt
                color: COLOR_MUTED,
                font: 'Arial'
              })
            ]
          }),
          // Decorative bar
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 600 },
            children: [
              new TextRun({
                text: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
                color: COLOR_PRIMARY,
                size: 20
              })
            ]
          }),
          // Main Document Title
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 200, after: 200 },
            children: [
              new TextRun({
                text: 'TÀI LIỆU HƯỚNG DẪN SỬ DỤNG',
                bold: true,
                size: 40, // 20pt
                color: '0F172A',
                font: 'Arial'
              })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 720 },
            children: [
              new TextRun({
                text: 'QUY TRÌNH VẬN HÀNH TOÀN DIỆN CÁC CHỨC NĂNG\n(KÈM ẢNH CHỤP GIAO DIỆN & VÍ DỤ MINH HỌA CHI TIẾT)',
                bold: true,
                italic: true,
                size: 24,
                color: COLOR_PRIMARY,
                font: 'Arial'
              })
            ]
          }),
          // Metadata Box
          new Paragraph({ spacing: { before: 800 } }),
          createTableWidget(
            ['THÔNG TIN TÀI LIỆU', 'CHI TIẾT VẬN HÀNH'],
            [
              ['Sản phẩm ứng dụng', 'EduTutor Pro (Phiên bản Web SPA, PWA Mobile & Desktop)'],
              ['Mã phát hành', 'v2.5.0-PRO (Tháng 10/2026)'],
              ['Đối tượng sử dụng', 'Ban Giám đốc, Giáo viên, Nhân viên Vận hành, Phụ huynh, Học sinh'],
              ['Cơ sở dữ liệu & Xác thực', 'Google Cloud Platform & Firebase Authentication / Cloud Firestore'],
              ['Tiêu chuẩn thanh toán', 'VietQR Napas 247 Dynamic Matching'],
              ['Ngày xuất bản', '05/10/2026']
            ]
          ),
          new Paragraph({ children: [new PageBreak()] })
        ]
      },

      // ================= SECTION 2: MAIN CONTENT =================
      {
        properties: {},
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                spacing: { after: 120 },
                children: [
                  new TextRun({
                    text: 'EduTutor Pro – Sổ tay Hướng dẫn Sử dụng Hệ thống',
                    size: 18,
                    italic: true,
                    color: '94A3B8',
                    font: 'Arial'
                  })
                ]
              })
            ]
          })
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({
                    text: 'Trang ',
                    size: 18,
                    color: '64748B',
                    font: 'Arial'
                  }),
                  PageNumber.CURRENT,
                  new TextRun({
                    text: ' / ',
                    size: 18,
                    color: '64748B',
                    font: 'Arial'
                  }),
                  PageNumber.TOTAL_PAGES
                ]
              })
            ]
          })
        },
        children: [
          // MỤC LỤC TỔNG HỢP
          createHeading1('MỤC LỤC TỔNG QUAN'),
          createP('Tài liệu hướng dẫn sử dụng phần mềm EduTutor Pro bao gồm 12 chương trọng tâm, tương ứng với toàn bộ các phân hệ quản lý và vai trò người dùng trong hệ thống:'),
          createBullet('Chương 1', 'Tổng quan Kiến trúc Hệ thống & Mô hình Đa vai trò (RBAC)'),
          createBullet('Chương 2', 'Đăng nhập, Xác thực Bảo mật, Ghi nhớ Tài khoản & Kích hoạt Tài khoản mới'),
          createBullet('Chương 3', 'Bảng điều khiển Tổng quan (Dashboard Giáo viên, Phụ huynh & Học sinh)'),
          createBullet('Chương 4', 'Quản lý Danh mục: Cơ sở Đào tạo, Môn học & Thiết lập Lớp học'),
          createBullet('Chương 5', 'Quản lý Hồ sơ Học sinh & Nhập dữ liệu Danh sách từ File Excel'),
          createBullet('Chương 6', 'Quản lý Tài khoản Người dùng & Phân quyền Liên kết Phụ huynh – Học sinh'),
          createBullet('Chương 7', 'Quản lý Thời khóa biểu & Lịch dạy Trực quan'),
          createBullet('Chương 8', 'Quản lý Buổi học Thực tế, Học bù & Điểm danh Chuyên cần Thông minh'),
          createBullet('Chương 9', 'Quản lý Giáo án, Bài giảng & Giao Bài tập về nhà Trực tuyến'),
          createBullet('Chương 10', 'Đánh giá Năng lực Học sinh & Gửi Nhận xét Tức thời tới Phụ huynh'),
          createBullet('Chương 11', 'Quản lý Học phí, Thanh toán VietQR Napas 247 & Xuất Phiếu thu PDF'),
          createBullet('Chương 12', 'Đối soát Sao kê Ngân hàng Tự động (Dual-Match) & Cài đặt Hệ thống'),
          new Paragraph({ spacing: { after: 240 } }),

          // ================= CHƯƠNG 1 =================
          createHeading1('CHƯƠNG 1: GIỚI THIỆU TỔNG QUAN VỀ EDUTUTOR PRO'),
          createP('EduTutor Pro là nền tảng quản lý dạy học thêm và trung tâm đào tạo chuyên sâu, giải quyết triệt để các bài toán nan giải trong vận hành giáo dục tư thục:'),
          createBullet('Tự động hóa tính học phí', 'Không còn tình trạng nhầm lẫn sĩ số hay quên buổi học bù, học phí được tính tự động từ dữ liệu điểm danh thực tế.'),
          createBullet('Thanh toán 1 chạm VietQR', 'Phụ huynh quét mã QR ngân hàng có sẵn số tiền và nội dung chuyển khoản chuẩn hóa, tiền về ngay tài khoản trung tâm.'),
          createBullet('Đối soát thông minh Dual-Match', 'Hệ thống tự động so khớp sao kê tài khoản ngân hàng với công nợ học sinh, giải phóng 95% thời gian kế toán thủ công.'),
          createBullet('Kết nối Gia đình & Nhà trường', 'Phụ huynh nắm bắt tiến độ chuyên cần, nhận xét của giáo viên và nộp học phí minh bạch ngay trên điện thoại di động.'),
          createBullet('Sẵn sàng cho Mobile & PWA', 'Cài đặt như ứng dụng native trên iPhone, Android và máy tính bảng mà không cần tải từ App Store hay Play Store.'),
          new Paragraph({ spacing: { after: 200 } }),

          // ================= CHƯƠNG 2 =================
          createHeading1('CHƯƠNG 2: ĐĂNG NHẬP, BẢO MẬT & KÍCH HOẠT TÀI KHOẢN'),
          createP('Hệ thống hỗ trợ cơ chế đăng nhập tối ưu, an toàn và đa nền tảng, tuân thủ tiêu chuẩn bảo mật nghiêm ngặt.'),
          
          createHeading2('2.1. Đăng nhập & Chức năng "Ghi nhớ tài khoản"'),
          createP('Màn hình Đăng nhập cho phép chuyển đổi linh hoạt giữa 4 nhóm vai trò: Giáo viên, Quản trị viên, Phụ huynh và Học sinh.'),
          createStep(1, 'Chọn vai trò đăng nhập', 'Chọn tab vai trò tương ứng (Giáo viên, Admin, Phụ huynh hoặc Học sinh).'),
          createStep(2, 'Nhập thông tin định danh', 'Nhập Số điện thoại hoặc Email đã được cấp phép vào ô đăng nhập.'),
          createStep(3, 'Nhập mật khẩu', 'Nhập mật khẩu tài khoản cá nhân.'),
          createStep(4, 'Tùy chọn "Ghi nhớ tài khoản"', 'Nếu chọn tick "Ghi nhớ tài khoản trên thiết bị này", hệ thống sẽ lưu lại Email/SĐT để tự động điền vào lần sau.'),
          createStep(5, 'Đăng nhập', 'Bấm nút "ĐĂNG NHẬP VÀO HỆ THỐNG". Sau khi thành công, màn hình tự động cuộn lên đầu (Top = 0) và mở Dashboard.'),
          new Paragraph({ spacing: { after: 120 } }),

          ...createImageWithCaption(
            '01_login_authentication.png',
            'Giao diện Đăng nhập EduTutor Pro với tùy chọn Ghi nhớ tài khoản, tab chuyển đổi vai trò và chỉ dẫn bảo mật',
            1
          ),

          createCallout(
            'Quy tắc Bảo mật Tuyệt đối của Tính năng Ghi nhớ Tài khoản',
            'Chức năng "Ghi nhớ tài khoản" TUYỆT ĐỐI KHÔNG lưu mật khẩu, access token hay credential vào bộ nhớ trình duyệt. Lần sau mở lại, ô Mật khẩu luôn luôn để trống và người dùng phải nhập mật khẩu để xác thực. Khi muốn hủy ghi nhớ, chỉ cần click nút "Xóa đã nhớ ✕" ngay bên cạnh checkbox.',
            'success'
          ),
          new Paragraph({ spacing: { after: 180 } }),

          createHeading2('2.2. Kích hoạt Tài khoản Người dùng Mới'),
          createP('Khi trung tâm tạo tài khoản cho học sinh hoặc phụ huynh, hệ thống sẽ cấp một đường link hoặc mã token kích hoạt an toàn:'),
          createStep(1, 'Mở liên kết kích hoạt', 'Nhấp vào link kích hoạt do trung tâm gửi qua Email hoặc tin nhắn.'),
          createStep(2, 'Kiểm tra thông tin', 'Hệ thống hiển thị đúng Email và vai trò được phân quyền.'),
          createStep(3, 'Thiết lập mật khẩu', 'Nhập mật khẩu mới (tối thiểu 6 ký tự) và nhập lại để xác nhận.'),
          createStep(4, 'Xác nhận hoàn tất', 'Bấm nút "HOÀN TẤT KÍCH HOẠT & ĐĂNG NHẬP NGAY" để truy cập hệ thống ngay lập tức.'),
          new Paragraph({ spacing: { after: 120 } }),

          ...createImageWithCaption(
            '02_account_activation.png',
            'Giao diện Kích hoạt tài khoản an toàn qua liên kết định danh Token',
            2
          ),

          // ================= CHƯƠNG 3 =================
          createHeading1('CHƯƠNG 3: BẢNG ĐIỀU KHIỂN TỔNG QUAN (DASHBOARD)'),
          createP('Mỗi nhóm người dùng khi đăng nhập sẽ được điều hướng tới một giao diện Dashboard cá nhân hóa theo đúng thẩm quyền.'),

          createHeading2('3.1. Dashboard Dành cho Giáo viên & Quản trị viên'),
          createP('Giáo viên và Admin nắm bắt toàn bộ tình hình hoạt động của trung tâm chỉ trong 1 màn hình duy nhất:'),
          createBullet('Thống kê nhanh 4 chỉ số', 'Số lớp học đang phụ trách, Tổng sĩ số học sinh, Tổng số buổi dạy trong tháng và Tổng doanh thu học phí đã thu.'),
          createBullet('Danh sách việc cần làm (To-Do List)', 'Cảnh báo các buổi dạy hôm nay chưa điểm danh, các giao dịch ngân hàng mới cần đối soát, các bài tập cần chấm điểm.'),
          createBullet('Tiến độ lớp học trọng điểm', 'Biểu đồ thanh hiển thị tỷ lệ chuyên cần và số buổi học của từng lớp.'),
          new Paragraph({ spacing: { after: 120 } }),

          ...createImageWithCaption(
            '03_teacher_dashboard.png',
            'Bảng điều khiển Trung tâm Giáo viên & Admin với To-Do List và các chỉ số vận hành',
            3
          ),

          createHeading2('3.2. Dashboard Dành cho Phụ huynh'),
          createP('Giúp cha mẹ học sinh đồng hành cùng con mọi lúc, mọi nơi:'),
          createBullet('Chuyển đổi hồ sơ con cái', 'Phụ huynh có nhiều con học tại trung tâm có thể nhấp chọn từng con để theo dõi riêng biệt.'),
          createBullet('Chỉ số học tập trọng yếu', 'Tỷ lệ chuyên cần trong tháng (số buổi đi học đúng giờ), số lượng bài tập về nhà đã hoàn thành và điểm số trung bình.'),
          createBullet('Nhận xét trực tiếp của giáo viên', 'Đọc lời nhận xét chi tiết sau mỗi buổi học của giáo viên về thái độ, mức độ hiểu bài và điểm cần cải thiện.'),
          createBullet('Thanh toán học phí 1 chạm', 'Bấm nút "Đóng học phí VietQR" để mở ngay mã QR chuyển khoản chính xác.'),
          new Paragraph({ spacing: { after: 120 } }),

          ...createImageWithCaption(
            '04_parent_dashboard.png',
            'Giao diện Bảng điều khiển Phụ huynh theo dõi chuyên cần, nhận xét của thầy cô và nộp học phí',
            4
          ),

          createHeading2('3.3. Dashboard Dành cho Học sinh'),
          createP('Tạo môi trường học tập chủ động, kỷ luật và hào hứng cho các em học sinh:'),
          createBullet('Thời khóa biểu cá nhân', 'Lịch học các buổi trong tuần kèm phòng học và thời gian bắt đầu.'),
          createBullet('Danh sách bài tập cần làm', 'Hiện rõ hạn chót nộp bài, đề bài đính kèm và nút "Nộp bài ngay".'),
          createBullet('Xem lại điểm số & lời phê', 'Xem lại bài làm đã được giáo viên chấm điểm và nhận xét chi tiết.'),
          new Paragraph({ spacing: { after: 120 } }),

          ...createImageWithCaption(
            '05_student_dashboard.png',
            'Giao diện Học sinh với danh sách bài tập về nhà cần nộp và thời khóa biểu trong tuần',
            5
          ),

          // ================= CHƯƠNG 4 =================
          createHeading1('CHƯƠNG 4: QUẢN LÝ DANH MỤC CƠ SỞ, MÔN HỌC & LỚP HỌC'),
          createP('Khởi tạo nền tảng đào tạo chuẩn mực cho trung tâm với cấu trúc phân cấp linh hoạt.'),

          createHeading2('4.1. Quản lý Cơ sở & Trường học Liên kết (School Manager)'),
          createP('Hệ thống quản lý danh sách các trường THPT/THCS có học sinh theo học hoặc các chi nhánh/cơ sở đào tạo của trung tâm:'),
          createStep(1, 'Truy cập danh mục', 'Chọn tab "Quản lý Lớp học" hoặc "Trường học" trên thanh menu bên trái.'),
          createStep(2, 'Thêm cơ sở mới', 'Bấm nút "+ Thêm trường mới", nhập Mã trường (ví dụ: PBC), Tên đầy đủ, Địa chỉ và Số điện thoại.'),
          createStep(3, 'Lưu dữ liệu', 'Bấm "Lưu thông tin". Mã trường này sẽ tự động được sử dụng trong cú pháp tạo mã VietQR chuyển khoản.'),
          new Paragraph({ spacing: { after: 120 } }),

          ...createImageWithCaption(
            '06_school_management.png',
            'Giao diện Quản lý Danh mục Trường học & Cơ sở đào tạo',
            6
          ),

          createHeading2('4.2. Quản lý Danh mục Môn học (Subject Manager)'),
          createP('Quản lý các môn học theo phân phối chương trình và khối lớp:'),
          createBullet('Phân loại cấp học', 'Toán 10, Toán 11, Toán 12, Vật lý 11, Tiếng Anh IELTS, v.v.'),
          createBullet('Gán mã môn chuẩn', 'Mã môn định danh giúp gom nhóm giáo án và phân bổ giáo viên chuyên trách.'),
          new Paragraph({ spacing: { after: 120 } }),

          ...createImageWithCaption(
            '07_subject_management.png',
            'Quản lý Danh mục Môn học và Khối lớp đào tạo',
            7
          ),

          createHeading2('4.3. Quản lý Lớp học & Cấu hình Đơn giá Học phí (Class Manager)'),
          createP('Thiết lập cấu hình lớp học là bước cốt lõi để tự động hóa tính tiền học phí sau này:'),
          createStep(1, 'Tạo lớp học mới', 'Bấm nút "+ Tạo lớp học mới", đặt tên lớp (ví dụ: Lớp 10A1 - Toán Chuyên).'),
          createStep(2, 'Phân công giáo viên & Phòng học', 'Chọn giáo viên đứng lớp chính và số phòng học cố định.'),
          createStep(3, 'Cấu hình Đơn giá Học phí', 'Chọn hình thức thu: "Thu theo buổi" (ví dụ: 120.000 đ/buổi) hoặc "Thu trọn gói theo tháng".'),
          createStep(4, 'Giới hạn sĩ số', 'Cài đặt sĩ số tối đa để hệ thống tự động cảnh báo khi lớp đầy.'),
          new Paragraph({ spacing: { after: 120 } }),

          ...createImageWithCaption(
            '08_class_management.png',
            'Quản lý Lớp học với cấu hình đơn giá học phí theo buổi và theo dõi sĩ số',
            8
          ),

          // ================= CHƯƠNG 5 =================
          createHeading1('CHƯƠNG 5: QUẢN LÝ HỌC SINH & NHẬP DỮ LIỆU EXCEL'),
          createP('Hồ sơ học sinh 360 độ lưu trữ đầy đủ thông tin cá nhân, liên lạc phụ huynh, quá trình chuyên cần và lịch sử đóng học phí.'),

          createHeading2('5.1. Quản lý Danh sách & Hồ sơ Học sinh Chi tiết'),
          createP('Bảng học sinh hiển thị trực quan: Avatar đại diện, Tên học sinh, Lớp đang theo học, Tên phụ huynh kèm số điện thoại liên lạc, tỷ lệ chuyên cần và công nợ hiện tại. Nhấp vào "Chi tiết →" để mở Drawer hồ sơ toàn diện.'),

          createHeading2('5.2. Tính năng Nhập Danh sách Học sinh Hàng loạt từ File Excel'),
          createP('Tiết kiệm 90% thời gian nhập liệu ban đầu khi tiếp nhận lớp mới:'),
          createStep(1, 'Chuẩn bị file Excel', 'Sử dụng file Excel có các cột: Họ tên, Ngày sinh, Số điện thoại phụ huynh, Tên phụ huynh, Lớp học, Trường học.'),
          createStep(2, 'Mở modal nhập liệu', 'Bấm nút "📥 Nhập từ Excel" trên thanh công cụ học sinh.'),
          createStep(3, 'Tải lên & Khớp cột', 'Kéo thả file .xlsx hoặc .csv vào hệ thống, xem trước bản ghi được tự động đối chiếu.'),
          createStep(4, 'Xác nhận nhập', 'Bấm "Hoàn tất nhập dữ liệu". Toàn bộ danh sách học sinh được tạo mới trên hệ thống.'),
          new Paragraph({ spacing: { after: 120 } }),

          ...createImageWithCaption(
            '09_student_management.png',
            'Danh sách Học sinh với nút Nhập dữ liệu Excel và hiển thị tình trạng học phí',
            9
          ),

          // ================= CHƯƠNG 6 =================
          createHeading1('CHƯƠNG 6: QUẢN TRỊ TÀI KHOẢN & PHÂN QUYỀN NGƯỜI DÙNG'),
          createP('Đảm bảo tính bảo mật và phân tách ranh giới dữ liệu giữa các bên tham gia hệ sinh thái giáo dục.'),

          createHeading2('6.1. Quản lý Tài khoản Đa vai trò (RBAC)'),
          createP('Hệ thống hỗ trợ 4 cấp độ thẩm quyền:'),
          createBullet('👑 Admin (Quản trị viên)', 'Toàn quyền cấu hình trung tâm, tài khoản ngân hàng, xem doanh thu và phân quyền người dùng.'),
          createBullet('👨‍🏫 Giáo viên', 'Quản lý lớp học được phân công, soạn giáo án, điểm danh, giao bài tập và đánh giá học sinh.'),
          createBullet('👨‍👩‍👧 Phụ huynh', 'Xem dữ liệu chuyên cần, nhận xét buổi học của con cái và quét mã VietQR nộp học phí.'),
          createBullet('🎒 Học sinh', 'Xem thời khóa biểu cá nhân, nộp bài tập về nhà và tra cứu kết quả đánh giá.'),
          new Paragraph({ spacing: { after: 100 } }),

          createHeading2('6.2. Tính năng Liên kết Phụ huynh – Học sinh'),
          createP('Chức năng liên kết cho phép gán tài khoản phụ huynh với một hoặc nhiều học sinh cụ thể:'),
          createStep(1, 'Mở modal liên kết', 'Bấm nút "🔗 Liên kết Phụ huynh" trên giao diện Quản lý Tài khoản.'),
          createStep(2, 'Chọn tài khoản phụ huynh', 'Tìm theo Email hoặc Số điện thoại của phụ huynh.'),
          createStep(3, 'Chọn học sinh tương ứng', 'Tick chọn em học sinh là con của phụ huynh này.'),
          createStep(4, 'Lưu liên kết', 'Sau khi lưu, phụ huynh đăng nhập sẽ tự động thấy hồ sơ của con mình.'),
          new Paragraph({ spacing: { after: 120 } }),

          ...createImageWithCaption(
            '10_account_management.png',
            'Quản trị Tài khoản Người dùng và chức năng Liên kết Phụ huynh - Học sinh',
            10
          ),

          // ================= CHƯƠNG 7 =================
          createHeading1('CHƯƠNG 7: QUẢN LÝ THỜI KHÓA BIỂU & LỊCH DẠY'),
          createP('Giao diện Thời khóa biểu dạng lưới tuần thông minh giúp theo dõi và điều phối lịch học một cách trực quan.'),

          createHeading2('7.1. Cấu hình Lịch học Cố định trong Tuần'),
          createP('Xếp lịch dạy theo từng ngày từ Thứ 2 đến Chủ nhật với 3 ca: Sáng, Chiều, Tối:'),
          createBullet('Hiển thị thẻ trực quan', 'Mỗi ca học hiển thị rõ: Giờ bắt đầu - Giờ kết thúc, Tên lớp, Phòng học và Giáo viên phụ trách.'),
          createBullet('Cơ chế cảnh báo trùng lịch', 'Hệ thống tự động phát hiện và cảnh báo nếu có sự trùng lặp giáo viên hoặc trùng phòng học trong cùng một khung giờ.'),
          new Paragraph({ spacing: { after: 120 } }),

          ...createImageWithCaption(
            '11_schedule_management.png',
            'Lưới Thời khóa biểu Tuần trực quan với cảnh báo phòng học và ca dạy',
            11
          ),

          // ================= CHƯƠNG 8 =================
          createHeading1('CHƯƠNG 8: QUẢN LÝ BUỔI HỌC THỰC TẾ & ĐIỂM DANH CHUYÊN CẦN'),
          createP('Đây là phân hệ cốt lõi quyết định tính chính xác của việc tính học phí cuối tháng.'),

          createHeading2('8.1. Nguyên tắc Vàng: Lịch học Cố định ≠ Buổi học Tính phí'),
          createCallout(
            'Quy tắc Nghiệp vụ Cốt lõi về Buổi học (fee_eligible)',
            'Lịch cố định trên thời khóa biểu chỉ là kế hoạch khung. Một buổi học thực tế sinh ra có thể diễn ra bình thường, hoặc bị HỦY do nghỉ lễ/thời tiết (không tính phí), hoặc được dời lịch, hoặc là BUỔI HỌC BÙ/TĂNG CƯỜNG (có tính phí). Học phí cuối tháng chỉ tính trên các buổi học có cờ "Có tính phí" (fee_eligible = true).',
            'info'
          ),
          new Paragraph({ spacing: { after: 120 } }),

          createHeading2('8.2. Quản lý Buổi học Thực tế (Session Manager)'),
          createP('Giáo viên theo dõi danh sách từng buổi học cụ thể theo ngày, kèm chủ đề bài học và sĩ số thực tế.'),
          new Paragraph({ spacing: { after: 120 } }),

          ...createImageWithCaption(
            '12_session_management.png',
            'Quản lý Buổi học Thực tế theo tháng kèm cờ xác nhận tính phí fee_eligible',
            12
          ),

          createHeading2('8.3. Điểm danh Chuyên cần Thông minh (Attendance Manager)'),
          createP('Quy trình điểm danh chỉ mất 30 giây với giao diện tối ưu cho cả máy tính và điện thoại:'),
          createStep(1, 'Chọn buổi học', 'Nhấp vào nút "Điểm danh" của buổi học đang diễn ra.'),
          createStep(2, 'Chọn trạng thái chuyên cần', 'Mỗi học sinh có 4 nút chọn nhanh: Có mặt (Xanh lá), Đi muộn (Xám), Có phép (Lam) và Vắng không phép (Đỏ).'),
          createStep(3, 'Ghi chú lý do vắng', 'Nhập lý do (ví dụ: Nghỉ ốm sốt, xin học bù vào buổi Chủ nhật).'),
          createStep(4, 'Lưu bảng điểm danh', 'Bấm nút "Lưu bảng điểm danh". Dữ liệu lập tức đồng bộ về hồ sơ học sinh và thông báo tới phụ huynh.'),
          new Paragraph({ spacing: { after: 120 } }),

          ...createImageWithCaption(
            '13_attendance_management.png',
            'Bảng Điểm danh Chuyên cần thông minh với 4 trạng thái và ghi chú lý do',
            13
          ),

          // ================= CHƯƠNG 9 =================
          createHeading1('CHƯƠNG 9: GIÁO ÁN, BÀI TẬP VỀ NHÀ & NỘP BÀI TRỰC TUYẾN'),
          createP('Số hóa giáo án và bài tập giúp học sinh duy trì thói quen tự học và nâng cao kết quả học tập.'),

          createHeading2('9.1. Quản lý Ngân hàng Giáo án (Lesson Manager)'),
          createP('Lưu trữ toàn bộ bài giảng, slide PDF và tài liệu bổ trợ theo từng môn học và bài học. Giáo viên có thể nhấp "Đánh giá HS →" để chuyển nhanh sang khâu chấm điểm sau giờ dạy.'),
          new Paragraph({ spacing: { after: 120 } }),

          ...createImageWithCaption(
            '14_lesson_management.png',
            'Ngân hàng Giáo án & Bài giảng đính kèm tài liệu học tập',
            14
          ),

          createHeading2('9.2. Quản lý Bài tập về nhà & Nộp bài Trực tuyến (Homework Manager)'),
          createP('Quy trình khép kín từ giao bài, nộp bài đến chấm điểm:'),
          createStep(1, 'Giáo viên giao bài tập', 'Đặt tiêu đề, hạn chót nộp bài (giờ, ngày) và đính kèm file đề bài PDF.'),
          createStep(2, 'Học sinh nhận & làm bài', 'Học sinh thấy bài tập trên Dashboard, giải bài ra vở rồi chụp ảnh hoặc đính kèm file nộp qua modal trực tuyến.'),
          createStep(3, 'Giáo viên chấm bài & phản hồi', 'Giáo viên xem bài giải của từng em, chấm điểm trên thang điểm 10 và gửi nhận xét góp ý.'),
          new Paragraph({ spacing: { after: 120 } }),

          ...createImageWithCaption(
            '15_homework_management.png',
            'Quản lý Bài tập về nhà, theo dõi tiến độ nộp bài và chấm điểm học sinh',
            15
          ),

          // ================= CHƯƠNG 10 =================
          createHeading1('CHƯƠNG 10: ĐÁNH GIÁ & NHẬN XÉT HỌC SINH TỪNG BUỔI'),
          createP('Cầu nối thông tin giá trị nhất giữa giáo viên và phụ huynh chính là lời nhận xét kịp thời sau mỗi buổi học.'),

          createHeading2('10.1. Đánh giá Đa tiêu chí theo Từng Buổi học'),
          createP('Giáo viên đánh giá học sinh dựa trên 4 khía cạnh:'),
          createBullet('Mức độ hiểu bài', 'Chấm điểm trực quan từ 1 sao đến 5 sao.'),
          createBullet('Thái độ học tập', 'Phân loại: Rất tích cực, Tập trung, Còn lơ là, Cần nhắc nhở.'),
          createBullet('Nhận xét cụ thể', 'Ghi chú chi tiết về bài học hôm nay (ví dụ: giải toán nhanh, vẽ hình cẩn thận, cần chú ý tính toán).'),
          createBullet('Điểm số buổi học', 'Thang điểm 10 cho bài kiểm tra nhanh đầu giờ hoặc bài tập tại lớp.'),
          new Paragraph({ spacing: { after: 120 } }),

          ...createImageWithCaption(
            '16_evaluation_management.png',
            'Bảng Đánh giá Năng lực Học sinh và Nhận xét gửi tức thời tới Phụ huynh',
            16
          ),

          // ================= CHƯƠNG 11 =================
          createHeading1('CHƯƠNG 11: QUẢN LÝ HỌC PHÍ & THANH TOÁN VIETQR CHUẨN'),
          createP('Tự động hóa hoàn toàn quy trình lập phiếu báo học phí và thu tiền qua ngân hàng.'),

          createHeading2('11.1. Tự động Lập Bảng Học phí Hàng tháng'),
          createP('Vào cuối tháng hoặc đầu tháng mới, giáo viên bấm "⚡ Lập bảng tự động":'),
          createBullet('Công thức tính', 'Học phí = (Số buổi học thực tế được điểm danh × Đơn giá buổi) + Phụ phí - Giảm trừ / Học bổng.'),
          createBullet('Minh bạch tuyệt đối', 'Mọi buổi học được tính tiền đều có thể tra cứu ngược lại bảng điểm danh ngày hôm đó.'),
          createBullet('Xuất phiếu thu PDF', 'Bấm nút "📄 Xuất PDF Phiếu thu" để tạo file biên lai học phí trang trọng gửi phụ huynh.'),
          new Paragraph({ spacing: { after: 120 } }),

          ...createImageWithCaption(
            '17_tuition_management.png',
            'Bảng Quản lý Học phí Hàng tháng và Trạng thái Thanh toán VietQR',
            17
          ),

          createHeading2('11.2. Thanh toán Học phí 1 Chạm qua Mã VietQR Napas 247'),
          createP('EduTutor Pro tự động sinh mã VietQR động chuẩn Napas 247 quốc gia:'),
          createBullet('Tự động điền số tiền', 'Mã QR đã nhúng sẵn số tiền học phí chính xác đến từng đồng, phụ huynh không cần tự nhập.'),
          createBullet('Cú pháp chuyển khoản tự động', 'Mã chuyển khoản được sinh tự động theo quy tắc chuẩn: [Mã trường]_[Khối]_[Tên]_[Tháng]_[Năm] (ví dụ: PBC_K10_NAM_T10_2026).'),
          createBullet('Hỗ trợ mọi ngân hàng', 'Quét được bằng ứng dụng của hơn 40 ngân hàng (Vietcombank, MB, BIDV, Techcombank, VPBank,...) và các ví điện tử (MoMo, VNPAY, ViettelMoney).'),
          new Paragraph({ spacing: { after: 120 } }),

          ...createImageWithCaption(
            '18_vietqr_payment.png',
            'Mã VietQR Động chuẩn Napas 247 kèm số tiền và cú pháp chuyển khoản chính xác',
            18
          ),

          // ================= CHƯƠNG 12 =================
          createHeading1('CHƯƠNG 12: ĐỐI SOÁT NGÂN HÀNG & CẤU HÌNH HỆ THỐNG'),
          createP('Khép lại chu trình tài chính tự động và quản trị cấu hình trung tâm an toàn.'),

          createHeading2('12.1. Thuật toán Đối soát Kép Tự động (Dual-Match Reconciliation)'),
          createP('Quy trình đối soát sao kê tài khoản ngân hàng:'),
          createStep(1, 'Tải file sao kê ngân hàng', 'Xuất file Excel sao kê tài khoản từ Internet Banking của trung tâm, sau đó bấm "📥 Tải file sao kê Excel".'),
          createStep(2, 'Hệ thống tự động chạy Dual-Match', 'Hệ thống kiểm tra 2 điều kiện: (1) Số tiền khớp 100% VÀ (2) Nội dung giao dịch chứa đúng mã học sinh.'),
          createStep(3, 'Kết quả so khớp', 'Các giao dịch đúng cú pháp chuyển sang trạng thái "✓ Khớp hoàn toàn" và tự động đánh dấu học sinh "Đã thanh toán" trong bảng học phí.'),
          createStep(4, 'Xử lý ngoại lệ', 'Nếu phụ huynh quên ghi mã mà ghi bằng chữ tự do, hệ thống gắn cờ "Khớp thủ công ⚠️" để giáo viên nhấp chọn đúng học sinh chỉ với 1 cú click.'),
          new Paragraph({ spacing: { after: 120 } }),

          ...createImageWithCaption(
            '19_bank_reconciliation.png',
            'Giao diện Đối soát Sao kê Ngân hàng Tự động với thuật toán Dual-Match',
            19
          ),

          createHeading2('12.2. Cài đặt Hệ thống, Tài khoản Thụ hưởng & Nhật ký Audit Logs'),
          createP('Trung tâm có thể dễ dàng tùy biến thông tin vận hành:'),
          createBullet('Cơ sở & Thương hiệu', 'Đổi tên trung tâm, hotline liên hệ, địa chỉ cơ sở, logo thương hiệu hiển thị trên phiếu thu PDF.'),
          createBullet('Cấu hình Ngân hàng VietQR', 'Chọn ngân hàng thụ hưởng (MBBank, Vietcombank,...), số tài khoản và tên chủ sở hữu.'),
          createBullet('Nhật ký Audit Logs', 'Ghi vết toàn bộ hành vi: ai đã đăng nhập, ai đã sửa điểm danh, ai đã xác nhận học phí, đảm bảo tính minh bạch dữ liệu.'),
          createBullet('Đồng bộ Cloud Firestore', 'Trạng thái kết nối cơ sở dữ liệu thời gian thực trên nền tảng đám mây an toàn.'),
          new Paragraph({ spacing: { after: 120 } }),

          ...createImageWithCaption(
            '20_system_settings.png',
            'Cài đặt Hệ thống, Tài khoản Thụ hưởng VietQR và Nhật ký Kiểm toán Audit Logs',
            20
          ),

          // KẾT LUẬN & LIÊN HỆ HỖ TRỢ
          createHeading1('KẾT LUẬN & THÔNG TIN HỖ TRỢ KỸ THUẬT'),
          createP('EduTutor Pro cam kết đồng hành cùng các thầy cô và trung tâm đào tạo trên con đường chuyển đổi số giáo dục hiệu quả, hiện đại và bảo mật.'),
          createCallout(
            'Đường dây Hỗ trợ Kỹ thuật & Nghiệp vụ 24/7',
            'Khi cần giải đáp thắc mắc hoặc yêu cầu bổ sung tính năng theo đặc thù trung tâm, vui lòng liên hệ:\n• SĐT / Zalo hỗ trợ: 0986.07.07.68\n• Email hỗ trợ: tuannmit09@gmail.com\n• Cổng thông tin trợ giúp: Mục trợ giúp trên thanh điều hướng ứng dụng EduTutor Pro.',
            'info'
          ),
          new Paragraph({ spacing: { after: 360 } }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: '— HẾT TÀI LIỆU HƯỚNG DẪN SỬ DỤNG —',
                bold: true,
                size: 22,
                color: COLOR_MUTED,
                font: 'Arial'
              })
            ]
          })
        ]
      }
    ]
  });

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(OUTPUT_FILE, buffer);
  fs.writeFileSync(ROOT_OUTPUT_FILE, buffer);
  console.log(`Successfully generated DOCX manual!`);
  console.log(`Path: ${OUTPUT_FILE} (${buffer.length} bytes)`);
  console.log(`Path: ${ROOT_OUTPUT_FILE} (${buffer.length} bytes)`);
}

buildDocx().catch(err => {
  console.error('Error generating docx:', err);
  process.exit(1);
});
