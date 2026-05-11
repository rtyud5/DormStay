const { supabase } = require("../config/supabase");

const TABLE_NAME = "hop_dong";
const ENDED_CONTRACT_STATUSES = new Set(["HET_HAN", "DA_KET_THUC", "DA_THANH_LY"]);

const toNumber = (value) => {
  const parsed = Number(value || 0);
  return Number.isFinite(parsed) ? parsed : 0;
};

const calculateStayMonths = (moveInDate, checkoutDate) => {
  if (!moveInDate || !checkoutDate) return 0;
  const start = new Date(moveInDate);
  const end = new Date(checkoutDate);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 0;
  const diffDays = Math.max(Math.ceil((end - start) / (1000 * 60 * 60 * 24)), 0);
  return Math.max(Math.floor(diffDays / 30), 0);
};

const getLatestByDate = (rows = [], field = "created_at") => {
  return (
    rows
      .slice()
      .sort((left, right) => new Date(right[field] || 0) - new Date(left[field] || 0))[0] || null
  );
};

const groupBy = (rows = [], key) =>
  rows.reduce((groups, row) => {
    const groupKey = row[key];
    if (!groups[groupKey]) groups[groupKey] = [];
    groups[groupKey].push(row);
    return groups;
  }, {});

const fetchRows = async (tableName, key, ids, columns = "*") => {
  if (!supabase || !ids.length) return [];

  const { data, error } = await supabase.from(tableName).select(columns).in(key, ids);
  if (error) throw error;
  return data || [];
};

const mapInspectionItem = (row) => ({
  id: row.ma_chi_tiet_kiem_tra,
  assetName: row.ten_tai_san,
  condition: row.tinh_trang,
  compensationAmount: toNumber(row.so_tien_boi_thuong),
  raw: row,
});

const mapReconciliationItem = (row) => ({
  id: row.ma_chi_tiet_doi_soat,
  category: row.danh_muc,
  direction: row.huong_giao_dich,
  sourceType: row.loai_nguon,
  sourceId: row.ma_nguon,
  amount: toNumber(row.so_tien),
  description: row.mo_ta || "",
  raw: row,
});

const getRefundPolicy = (stayMonths) => {
  if (stayMonths < 6) {
    return {
      reason: "EARLY_TERMINATION_SHORT_STAY",
      ratio: 50,
      label: "Đã ký hợp đồng, lưu trú dưới 6 tháng",
    };
  }

  return {
    reason: "EARLY_TERMINATION_LONG_STAY",
    ratio: 70,
    label: "Đã ký hợp đồng, lưu trú từ 6 tháng trở lên",
  };
};

const mapContractBase = (contract) => ({
  id: contract.ma_hop_dong,
  contractId: contract.ma_hop_dong,
  customerId: contract.ma_ho_so_khach_hang,
  customerName: contract.ho_so?.ho_ten || "Khach thue chua cap nhat",
  customerPhone: contract.ho_so?.so_dien_thoai || "",
  status: contract.trang_thai,
  roomDisplay: contract.phong?.ma_phong_hien_thi ? `P.${contract.phong.ma_phong_hien_thi}` : "--",
  bedDisplay:
    contract.phan_bo_hop_dong
      ?.map((item) => item.giuong?.ma_giuong_hien_thi || (item.ma_giuong ? `B${item.ma_giuong}` : ""))
      .filter(Boolean)
      .join(", ") || (contract.ma_giuong ? `B${contract.ma_giuong}` : ""),
  moveInDate: contract.ngay_vao_o,
  baseRent: toNumber(contract.gia_thue_co_ban_thang),
  depositAmount: toNumber(contract.so_tien_dat_coc_bao_dam),
  raw: contract,
});

function groupByContract(rows = []) {
  return rows.reduce((groups, row) => {
    const contractId = row.ma_hop_dong;
    if (!groups[contractId]) groups[contractId] = [];
    groups[contractId].push(row);
    return groups;
  }, {});
}

function mapSettlementVoucher(row) {
  return {
    id: row.ma_phieu_tt_phat_sinh,
    ma_phieu_tt_phat_sinh: row.ma_phieu_tt_phat_sinh,
    reconciliationId: row.ma_doi_soat,
    ma_doi_soat: row.ma_doi_soat,
    contractId: row.ma_hop_dong,
    ma_hop_dong: row.ma_hop_dong,
    amount: toNumber(row.so_tien_thanh_toan),
    so_tien_thanh_toan: toNumber(row.so_tien_thanh_toan),
    status: row.trang_thai,
    trang_thai: row.trang_thai,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    raw: row,
  };
}

function mapRefundVoucher(row) {
  return {
    id: row.ma_phieu_hoan_coc,
    ma_phieu_hoan_coc: row.ma_phieu_hoan_coc,
    reconciliationId: row.ma_doi_soat,
    ma_doi_soat: row.ma_doi_soat,
    contractId: row.ma_hop_dong,
    ma_hop_dong: row.ma_hop_dong,
    beneficiaryName: row.ten_nguoi_nhan,
    ten_nguoi_nhan: row.ten_nguoi_nhan,
    refundAmount: toNumber(row.so_tien_hoan),
    so_tien_hoan: toNumber(row.so_tien_hoan),
    status: row.trang_thai,
    trang_thai: row.trang_thai,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    raw: row,
  };
}

const ContractModel = {
  async listByUserId(userId) {
    if (!supabase) return [];

    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select(`
        *,
        phong ( ma_phong_hien_thi ),
        ho_so!inner ( ma_nguoi_dung_xac_thuc ),
        phan_bo_hop_dong (
          ma_phan_bo,
          loai_muc_tieu,
          ma_giuong,
          giuong ( ma_giuong_hien_thi ),
          trang_thai
        )
      `)
      .eq("ho_so.ma_nguoi_dung_xac_thuc", userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    const contracts = data || [];
    const contractIds = contracts.map((item) => item.ma_hop_dong).filter(Boolean);
    const [settlementGroups, refundGroups] = await Promise.all([
      this.listSettlementVouchersByContractIds(contractIds),
      this.listRefundVouchersByContractIds(contractIds),
    ]);

    return contracts.map((contract) => ({
      ...contract,
      settlementVouchers: settlementGroups[contract.ma_hop_dong] || [],
      refundVouchers: refundGroups[contract.ma_hop_dong] || [],
    }));
  },

  async getById(id) {
    if (!supabase) return null;

    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select(`
        *,
        phong ( ma_phong_hien_thi ),
        ho_so ( ma_nguoi_dung_xac_thuc ),
        phan_bo_hop_dong (
          ma_phan_bo,
          loai_muc_tieu,
          ma_giuong,
          giuong ( ma_giuong_hien_thi ),
          ngay_bat_dau,
          ngay_ket_thuc,
          trang_thai
        )
      `)
      .eq("ma_hop_dong", id)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async listLiquidationsByUserId(userId) {
    if (!supabase) return [];

    const contracts = await this.listByUserId(userId);
    if (!contracts.length) return [];

    const contractIds = contracts.map((item) => item.ma_hop_dong).filter(Boolean);
    const checkoutRequests = await fetchRows(
      "yeu_cau_tra_phong",
      "ma_hop_dong",
      contractIds,
    );
    const checkoutByContract = groupBy(checkoutRequests, "ma_hop_dong");

    const reconciliationRows = await fetchRows("doi_soat_tai_chinh", "ma_hop_dong", contractIds);
    const reconciliationByContract = groupBy(reconciliationRows, "ma_hop_dong");
    const reconciliationIds = reconciliationRows.map((row) => row.ma_doi_soat).filter(Boolean);
    const reconciliationItems = await fetchRows("chi_tiet_doi_soat_tai_chinh", "ma_doi_soat", reconciliationIds);
    const reconciliationItemById = groupBy(reconciliationItems, "ma_doi_soat");
    const inspectionRows = await fetchRows("bien_ban_kiem_tra", "ma_yeu_cau_tra_phong", checkoutRequests.map((row) => row.ma_yeu_cau_tra_phong));
    const inspectionByRequest = groupBy(inspectionRows, "ma_yeu_cau_tra_phong");
    const inspectionIds = inspectionRows.map((row) => row.ma_bien_ban_kiem_tra).filter(Boolean);
    const inspectionItems = await fetchRows("chi_tiet_kiem_tra", "ma_bien_ban_kiem_tra", inspectionIds);
    const inspectionItemByInspection = groupBy(inspectionItems, "ma_bien_ban_kiem_tra");

    return contracts
      .map((contract) => {
        const contractId = contract.ma_hop_dong;
        const requestRows = checkoutByContract[contractId] || [];
        const latestRequest = getLatestByDate(requestRows, "created_at");
        const latestInspection = latestRequest
          ? getLatestByDate(inspectionByRequest[latestRequest.ma_yeu_cau_tra_phong] || [], "thoi_gian_kiem_tra")
          : null;
        const reconciliation = getLatestByDate(reconciliationByContract[contractId] || [], "created_at");
        const lineItems = reconciliation
          ? (reconciliationItemById[reconciliation.ma_doi_soat] || []).map(mapReconciliationItem)
          : [];
        const inspectionItemList = latestInspection
          ? (inspectionItemByInspection[latestInspection.ma_bien_ban_kiem_tra] || []).map(mapInspectionItem)
          : [];
        const checkoutDate =
          latestRequest?.ngay_yeu_cau_tra_phong ||
          latestInspection?.thoi_gian_kiem_tra ||
          reconciliation?.created_at ||
          null;
        const activeAllocation = (contract.phan_bo_hop_dong || []).find((item) =>
          ["HIEU_LUC", "CHO_HIEU_LUC"].includes(String(item.trang_thai || "").toUpperCase()),
        );
        const contractEndDate = activeAllocation?.ngay_ket_thuc || latestRequest?.ngay_yeu_cau_tra_phong || null;
        const stayMonths = calculateStayMonths(contract.ngay_vao_o, checkoutDate);
        const refundPolicy = getRefundPolicy(stayMonths);
        const originalDeposit = toNumber(contract.so_tien_dat_coc_bao_dam);
        const totalCharges = lineItems
          .filter((item) => String(item.direction || "").toUpperCase() === "THU")
          .reduce((sum, item) => sum + toNumber(item.amount), 0);
        const totalAdjustments = lineItems
          .filter((item) => String(item.direction || "").toUpperCase() === "CHI")
          .reduce((sum, item) => sum + toNumber(item.amount), 0);
        const baseRefund = Math.round((originalDeposit * refundPolicy.ratio) / 100);
        const derivedRefundAmount = Math.max(baseRefund - totalCharges + totalAdjustments, 0);
        const refundAmount = toNumber(reconciliation?.so_tien_hoan_lai) || derivedRefundAmount;
        const additionalPaymentAmount =
          toNumber(reconciliation?.so_tien_can_thanh_toan_them) || Math.max(totalCharges - baseRefund - totalAdjustments, 0);
        const settlementVoucher = getLatestByDate(contract.settlementVouchers || [], "createdAt");
        const refundVoucher = getLatestByDate(contract.refundVouchers || [], "createdAt");
        const liquidationStatus = ENDED_CONTRACT_STATUSES.has(String(contract.trang_thai || "").toUpperCase())
          ? "DA_THANH_LY"
          : reconciliation
            ? String(reconciliation.trang_thai || "").toUpperCase()
            : latestRequest
              ? "DANG_XU_LY"
              : "CHUA_BAT_DAU";

        if (
          !latestRequest &&
          !reconciliation &&
          !settlementVoucher &&
          !refundVoucher &&
          !ENDED_CONTRACT_STATUSES.has(String(contract.trang_thai || "").toUpperCase())
        ) {
          return null;
        }

        return {
          ...mapContractBase(contract),
          liquidationStatus,
          checkoutRequestId: latestRequest?.ma_yeu_cau_tra_phong || null,
          checkoutDate,
          contractEndDate,
          stayMonths,
          refundPolicy,
          originalDeposit,
          totalCharges,
          totalAdjustments,
          baseRefund,
          refundAmount,
          additionalPaymentAmount,
          inspectionStatus: latestInspection?.trang_thai || latestRequest?.trang_thai || null,
          inspectionItems: inspectionItemList,
          lineItems,
          reconciliation: reconciliation
            ? {
                id: reconciliation.ma_doi_soat,
                status: reconciliation.trang_thai,
                createdAt: reconciliation.created_at,
                originalDeposit: toNumber(reconciliation.so_tien_dat_coc_ban_dau),
                refundAmount,
                additionalPaymentAmount,
              }
            : null,
          settlementVoucher,
          refundVoucher,
          latestRequest,
          latestInspection,
        };
      })
      .filter(Boolean);
  },

  async listSettlementVouchersByContractIds(contractIds = []) {
    if (!supabase || !contractIds.length) return {};

    const { data, error } = await supabase
      .from("phieu_thanh_toan_phat_sinh")
      .select("*")
      .in("ma_hop_dong", contractIds)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return groupByContract((data || []).map(mapSettlementVoucher));
  },

  async listRefundVouchersByContractIds(contractIds = []) {
    if (!supabase || !contractIds.length) return {};

    const { data, error } = await supabase
      .from("phieu_hoan_coc")
      .select("*")
      .in("ma_hop_dong", contractIds)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return groupByContract((data || []).map(mapRefundVoucher));
  },

  async listSettlementVouchersByContractId(contractId) {
    const groups = await this.listSettlementVouchersByContractIds([contractId].filter(Boolean));
    return groups[contractId] || [];
  },

  async listRefundVouchersByContractId(contractId) {
    const groups = await this.listRefundVouchersByContractIds([contractId].filter(Boolean));
    return groups[contractId] || [];
  },
};

module.exports = ContractModel;
