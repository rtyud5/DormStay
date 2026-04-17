/**
 * Mock Data cho Module Kế Toán (Accounting)
 * Phục vụ toàn bộ chức năng: Phiếu thu, HĐ, hóa đơn, thanh toán, hoàn cọc
 */

// ==================== CONTRACTS ====================
export const mockContracts = [
  {
    id: "CTR-9021",
    customerId: "cus-001",
    customerName: "Nguyễn Văn Toàn",
    email: "nguyen.toan@example.com",
    phone: "0912-345-678",
    rentalType: "Studio A-102",
    roomNumber: "A-102",
    bedNumber: null,
    startDate: "2023-10-12",
    endDate: "2024-10-12",
    baseRent: 4500000,
    securityDeposit: 9000000, // 2 tháng
    status: "PROCESSING", // PROCESSING, ACTIVE, COMPLETED, TERMINATED
    createdAt: "2023-10-01",
    updatedAt: "2024-04-15",
    staffAssigned: "Trần Thị Thanh Thảo",
  },
  {
    id: "CTR-8842",
    customerId: "cus-002",
    customerName: "Lê Hồng Hạnh",
    email: "le.honghanh@example.com",
    phone: "0987-654-321",
    rentalType: "Shared 4-B1",
    roomNumber: "B-301",
    bedNumber: "B1",
    startDate: "2023-10-15",
    endDate: "2024-04-15",
    baseRent: 1200000,
    securityDeposit: 2400000,
    status: "ACTIVE",
    createdAt: "2023-10-15",
    updatedAt: "2024-04-15",
    staffAssigned: "Trần Thị Thanh Thảo",
  },
  {
    id: "CTR-7721",
    customerId: "cus-003",
    customerName: "Vũ Minh Mạnh",
    email: "vu.minhmanh@example.com",
    phone: "0898-765-432",
    rentalType: "Dorm Room 202",
    roomNumber: "C-202",
    bedNumber: "B",
    startDate: "2023-10-18",
    endDate: "2024-04-18",
    baseRent: 2800000,
    securityDeposit: 5600000,
    status: "PROCESSING",
    createdAt: "2023-10-18",
    updatedAt: "2024-04-15",
    staffAssigned: "Trần Thị Thanh Thảo",
  },
  {
    id: "CTR-6543",
    customerId: "cus-004",
    customerName: "Trần Thị Hương",
    email: "tran.huong@example.com",
    phone: "0776-543-210",
    rentalType: "Luxury Suite B-402",
    roomNumber: "B-402",
    bedNumber: null,
    startDate: "2024-01-15",
    endDate: "2025-01-15",
    baseRent: 5500000,
    securityDeposit: 11000000,
    status: "ACTIVE",
    createdAt: "2024-01-10",
    updatedAt: "2024-04-15",
    staffAssigned: "Trần Thị Thanh Thảo",
  },
];

// ==================== INVOICES (HÓA ĐƠN / PHIẾU THU) ====================
export const mockInvoices = [
  {
    id: "INV-8821",
    contractId: "CTR-9021",
    customerId: "cus-001",
    customerName: "Hoàng Nam",
    invoiceType: "MONTHLY_RENT", // DEPOSIT, MONTHLY_RENT, EXTRA, FINAL
    amount: 4500000,
    dueDate: "2024-12-10",
    issueDate: "2024-11-10",
    status: "COMPLETED", // PENDING, COMPLETED, OVERDUE, CANCELLED
    paymentMethod: "BANK_TRANSFER",
    paymentDate: "2024-12-10",
    notes: "",
    description: "Tiền thuê tháng 12/2024",
  },
  {
    id: "INV-8822",
    contractId: "CTR-8842",
    customerId: "cus-002",
    customerName: "Minh Tuyết",
    invoiceType: "MONTHLY_RENT",
    amount: 3200000,
    dueDate: "2024-05-20",
    issueDate: "2024-05-03",
    status: "OVERDUE", // Quá hạn
    paymentMethod: null,
    paymentDate: null,
    notes: "Khách chưa thanh toán",
    description: "Tiền thuê tháng 5/2024",
  },
  {
    id: "INV-8823",
    contractId: "CTR-7721",
    customerId: "cus-003",
    customerName: "Quốc Dũng",
    invoiceType: "MONTHLY_RENT",
    amount: 5100000,
    dueDate: "2024-10-18",
    issueDate: "2024-10-01",
    status: "COMPLETED",
    paymentMethod: "BANK_TRANSFER",
    paymentDate: "2024-10-15",
    notes: "",
    description: "Tiền thuê tháng 10/2024",
  },
  {
    id: "INV-8824",
    contractId: "CTR-6543",
    customerId: "cus-004",
    customerName: "Lân Phương",
    invoiceType: "DEPOSIT",
    amount: 1200000,
    dueDate: "2024-01-20",
    issueDate: "2024-01-15",
    status: "COMPLETED",
    paymentMethod: "CASH",
    paymentDate: "2024-01-18",
    notes: "Cọc ban đầu",
    description: "Tiền cọc",
  },
];

// ==================== BILLING DETAILS (Chi tiết phiếu/hóa đơn) ====================
export const mockBillingDetails = [
  {
    id: "BD-001",
    invoiceId: "INV-8821",
    description: "Pro-rated Rent (Aug 15 - Aug 31)",
    unitPrice: 145161,
    quantity: 17, // days
    amount: 2467737,
    category: "RENT",
  },
  {
    id: "BD-002",
    invoiceId: "INV-8821",
    description: "Security Deposit",
    unitPrice: 4500000,
    quantity: 1,
    amount: 4500000,
    category: "DEPOSIT",
  },
  {
    id: "BD-003",
    invoiceId: "INV-8821",
    description: "Access Card Fee",
    unitPrice: 200000,
    quantity: 1,
    amount: 200000,
    category: "SERVICE",
  },
  {
    id: "BD-004",
    invoiceId: "INV-8821",
    description: "Onboarding Welcome Kit",
    unitPrice: 150000,
    quantity: 1,
    amount: 150000,
    category: "SERVICE",
  },
];

// ==================== PAYMENTS (THANH TOÁN) ====================
export const mockPayments = [
  {
    id: "PAY-001",
    invoiceId: "INV-8821",
    contractId: "CTR-9021",
    customerId: "cus-001",
    amount: 4500000,
    paymentMethod: "BANK_TRANSFER", // CASH, BANK_TRANSFER, MOMO, ZALOPAY
    transactionId: "TXN-20241210-001",
    status: "CONFIRMED", // PENDING, CONFIRMED, FAILED, CANCELLED
    paymentDate: "2024-12-10",
    confirmedDate: "2024-12-10",
    notes: "Chuyển khoản thành công",
  },
  {
    id: "PAY-002",
    invoiceId: "INV-8823",
    contractId: "CTR-7721",
    customerId: "cus-003",
    amount: 5100000,
    paymentMethod: "BANK_TRANSFER",
    transactionId: "TXN-20241015-002",
    status: "CONFIRMED",
    paymentDate: "2024-10-15",
    confirmedDate: "2024-10-15",
    notes: "",
  },
];

// ==================== EXTRA CHARGES (PHÍ PHÁT SINH) ====================
export const mockExtraCharges = [
  {
    id: "EC-001",
    contractId: "CTR-9021",
    description: "Sửa chữa khóa cửa chính",
    amount: 750000,
    status: "BILLED", // PENDING, BILLED, PAID
    issueDate: "2024-04-10",
    billedDate: "2024-04-15",
    notes: "Do khách làm hỏng",
  },
  {
    id: "EC-002",
    contractId: "CTR-9021",
    description: "Vệ sinh phòng nhân viên phụ trách",
    amount: 500000,
    status: "PENDING",
    issueDate: "2024-04-12",
    billedDate: null,
    notes: "Vi phạm nội quy",
  },
];

// ==================== REFUNDS (HOÀN CỌC) ====================
export const mockRefunds = [
  {
    id: "REF-001",
    contractId: "CTR-8842",
    customerId: "cus-002",
    customerName: "Lê Hồng Hạnh",
    originalDeposit: 2400000,
    deductedAmount: 500000, // Tiền đã khấu từ (hư hỏng, nợ tiền, v.v.)
    refundAmount: 1900000,
    refundRatio: 80, // 80% returned
    reason: "EARLY_TERMINATION_SHORT_STAY", // Ở dưới 6 tháng, trả sớm
    status: "COMPLETED", // PENDING, PROCESSING, COMPLETED, FAILED
    issuedDate: "2024-04-15",
    completedDate: "2024-04-15",
    refundMethod: "BANK_TRANSFER",
    accountNumber: "1234567890123",
    bankName: "Vietcombank",
  },
  {
    id: "REF-002",
    contractId: "CTR-7721",
    customerId: "cus-003",
    customerName: "Vũ Minh Mạnh",
    originalDeposit: 5600000,
    deductedAmount: 1200000,
    refundAmount: 4400000,
    refundRatio: 70, // 70% vì lưu trú 6-12 tháng
    reason: "LONG_STAY_PARTIAL", // 6+ tháng
    status: "PROCESSING",
    issuedDate: "2024-04-10",
    completedDate: null,
    refundMethod: "BANK_TRANSFER",
    accountNumber: "9876543210987",
    bankName: "Techcombank",
  },
];

// ==================== RECONCILIATION (ĐỐI SOÁT) ====================
export const mockReconciliations = [
  {
    id: "REC-001",
    invoiceId: "INV-8821",
    contractId: "CTR-9021",
    totalAmount: 7317737,
    totalReceived: 7317737,
    status: "MATCHED", // MATCHED, MISMATCH, PENDING
    variance: 0,
    reconciliationDate: "2024-12-10",
    notes: "Khớp hoàn toàn",
  },
  {
    id: "REC-002",
    invoiceId: "INV-8822",
    contractId: "CTR-8842",
    totalAmount: 3200000,
    totalReceived: 0,
    status: "MISMATCH",
    variance: -3200000,
    reconciliationDate: "2024-04-15",
    notes: "Chưa thanh toán",
  },
];

// ==================== TRANSACTION LOG (LỊCH SỬ GIAO DỊCH) ====================
export const mockTransactionLog = [
  {
    id: "TXN-20241210-001",
    refNumber: "TX-20240508-001",
    invoiceId: "INV-8821",
    contractId: "CTR-9021",
    amount: 3500000,
    status: "SUCCESS", // SUCCESS, FAILED, PENDING, MISMATCH
    matchStatus: "MATCHED", // MATCHED, UNMATCHED, SCANNING
    variance: 0,
    issueDate: "2024-04-08",
    transactionDate: "2024-04-08",
    systemAmount: "3,500,000đ",
    actualAmount: "3,500,000đ",
    notes: "Chuyển khoản thành công",
  },
  {
    id: "TXN-20240510-002",
    refNumber: "TX-20240508-032",
    invoiceId: "INV-8823",
    contractId: "CTR-7721",
    amount: 1000000,
    status: "FAILED",
    matchStatus: "NOT_FOUND",
    variance: -1000000,
    issueDate: "2024-04-08",
    transactionDate: "2024-04-08",
    systemAmount: "1,000,000đ",
    actualAmount: "0đ",
    systemNotes: "SURPLUS_SYSTEM",
    notes: "Lệnh hủy/không xác nhận",
  },
  {
    id: "TXN-20240512-003",
    refNumber: "VC-DISC70-092",
    invoiceId: null,
    contractId: null,
    amount: -500000,
    status: "PENDING",
    matchStatus: "SCANNING",
    variance: -500000,
    issueDate: "2024-04-08",
    transactionDate: "2024-04-08",
    systemAmount: "0đ",
    actualAmount: "-500,000đ",
    notes: "Voucher giảm 50% - Lệc C",
  },
];

// ==================== FINANCIAL STATEMENT (BÁO CÁO TÀI CHÍNH) ====================
export const mockFinancialStatement = {
  period: "2024-04",
  totalReceived: 1280000000,
  totalFunded: 1025000000, // Số tiền được cấp
  totalCompleted: 1280000000, // Đã thành toán
  stats: {
    totalTransactions: 1402,
    totalMissing: 24,
    totalMatched: 1378,
    totalRevenue: 1000000000,
  },
  statusBreakdown: {
    completed: 1058, // Đã thanh toán (52%)
    partiallyCompleted: 153, // Đóng chỉ (8%)
    refunded: 76, // Quá hạn (8%)
    pending: 115, // Chờ xác nhận (5%)
  },
  paymentMethods: {
    bankTransfer: 452000,
    cash: 120000,
    momo: 230000,
    zalopay: 150000,
  },
};

// ==================== DASHBOARD KPI ====================
export const mockDashboardKPI = {
  totalRevenue: 1280000000, // ₫1,280,000,000
  monthlyChange: 125000000, // +₫125,000,000 vs tháng trước
  monthlyChangePercent: 10.8, // +10.8%

  // Phiếu Thu
  invoiceStats: {
    total: 1402,
    completed: 1058,
    overdue: 156,
    pending: 188,
  },

  // Hoàn Cọc
  refundStats: {
    pending: 45,
    processing: 28,
    completed: 312,
    failed: 8,
  },

  // Giao Dịch
  transactionStats: {
    total: 1500,
    successful: 1402,
    failed: 24,
    scanning: 74,
  },

  // HĐ Đang Chờ
  contractsNeedingBilling: 23,
  contractsActive: 156,
};

// ==================== Deposit Refund Rules (Quy tắc hoàn cọc) ====================
export const REFUND_RULES = {
  NO_CONTRACT: { ratio: 80, description: "Chưa ký HĐ" },
  EARLY_SHORT: { ratio: 50, description: "Trả sớm, ở < 6 tháng" },
  EARLY_LONG: { ratio: 70, description: "Trả sớm, ở 6+ tháng" },
  NORMAL_COMPLETION: { ratio: 100, description: "Hết hạn HĐ bình thường" },
};

export default {
  mockContracts,
  mockInvoices,
  mockBillingDetails,
  mockPayments,
  mockExtraCharges,
  mockRefunds,
  mockReconciliations,
  mockTransactionLog,
  mockFinancialStatement,
  mockDashboardKPI,
  REFUND_RULES,
};
