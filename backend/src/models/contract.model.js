const { supabase } = require("../config/supabase");

const TABLE_NAME = "hop_dong";

const toNumber = (value) => {
  const parsed = Number(value || 0);
  return Number.isFinite(parsed) ? parsed : 0;
};

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
