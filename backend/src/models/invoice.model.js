const { supabase } = require("../config/supabase");

const TABLE_NAME = "invoices";

const InvoiceModel = {
  async list() {
    if (!supabase) {
      return [
        { id: "invoice-001", contract_id: "contract-001", amount: 5200000, status: "pending" },
        { id: "invoice-002", contract_id: "contract-001", amount: 3500000, status: "paid" },
      ];
    }

    const { data, error } = await supabase.from(TABLE_NAME).select("*");
    if (error) throw error;
    return data || [];
  },
  async list({ from_date, to_date, phuong_thuc, ma_hop_dong_search, trang_thai, page = 1, limit = 20 }) {
    const offset = (page - 1) * limit;
    const today = new Date().toISOString().split("T")[0];

    let query = supabase
      .from("hoa_don")
      .select(
        `
        ma_hoa_don,
        loai_hoa_don,
        trang_thai,
        tong_so_tien,
        so_tien_da_thanh_toan,
        ngay_lap,
        ngay_den_han,
        ma_hop_dong,
        hop_dong:ma_hop_dong (
          ma_hop_dong,
          ho_so_khach_hang:ma_ho_so_khach_hang (
            ma_ho_so,
            ho_ten,
            email
          )
        ),
        yeu_cau_thue:ma_yeu_cau_thue (
          ma_yeu_cau_thue,
          ho_so_khach_hang:ma_ho_so_khach_hang (
            ma_ho_so,
            ho_ten,
            email
          )
        ),
        thanh_toan (
          ma_thanh_toan,
          phuong_thuc,
          trang_thai,
          so_tien,
          thoi_gian_xac_nhan,
          thoi_gian_thanh_toan
        )
      `,
        { count: "exact" },
      )
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    // Filter ngày lập
    if (from_date) query = query.gte("ngay_lap", from_date);
    if (to_date) query = query.lte("ngay_lap", to_date);

    // Filter trạng thái
    if (trang_thai === "QUA_HAN") {
      query = query.eq("trang_thai", "CHO_THANH_TOAN").lt("ngay_den_han", today);
    } else if (trang_thai === "DA_THANH_TOAN") {
      query = query.eq("trang_thai", "THANH_TOAN_TOAN_BO");
    } else if (trang_thai === "HOAN_LAI") {
      query = query.eq("loai_hoa_don", "HOAN_LAI");
    } else if (trang_thai) {
      query = query.eq("trang_thai", trang_thai);
    }

    const { data, error, count } = await query;
    if (error) throw error;

    // Filter phuong_thuc sau khi lấy (vì cần check thanh_toan[])
    let result = data || [];
    if (phuong_thuc) {
      result = result.filter((inv) => inv.thanh_toan?.some((tt) => tt.phuong_thuc === phuong_thuc));
    }

    // Filter ma_hop_dong search (string match)
    if (ma_hop_dong_search) {
      const keyword = ma_hop_dong_search.toLowerCase();
      result = result.filter((inv) =>
        String(inv.ma_hop_dong || "")
          .toLowerCase()
          .includes(keyword),
      );
    }

    return { data: result, count: phuong_thuc || ma_hop_dong_search ? result.length : count };
  },

  /**
   * Aggregate stats trong khoảng thời gian
   */
  async getStats({ from_date, to_date }) {
    const today = new Date().toISOString().split("T")[0];

    let query = supabase.from("hoa_don").select("tong_so_tien, trang_thai, ngay_den_han, loai_hoa_don");

    if (from_date) query = query.gte("ngay_lap", from_date);
    if (to_date) query = query.lte("ngay_lap", to_date);

    const { data, error } = await query;
    if (error) throw error;

    const stats = { tong: 0, da_tt: 0, dang_cho: 0, qua_han: 0 };

    for (const inv of data || []) {
      const amount = Number(inv.tong_so_tien) || 0;
      stats.tong += amount;

      if (inv.trang_thai === "THANH_TOAN_TOAN_BO") {
        stats.da_tt += amount;
      } else if (inv.trang_thai === "CHO_THANH_TOAN") {
        const isOverdue = inv.ngay_den_han && inv.ngay_den_han < today;
        if (isOverdue) stats.qua_han += amount;
        else stats.dang_cho += amount;
      }
    }

    const total = stats.tong || 1;
    return {
      tong_doanh_thu: stats.tong,
      da_thanh_toan: {
        so_tien: stats.da_tt,
        phan_tram: Math.round((stats.da_tt / total) * 100),
      },
      dang_cho: {
        so_tien: stats.dang_cho,
        phan_tram: Math.round((stats.dang_cho / total) * 100),
      },
      qua_han: {
        so_tien: stats.qua_han,
        phan_tram: Math.round((stats.qua_han / total) * 100),
      },
    };
  },

  /**
   * Lấy chi tiết 1 hoá đơn
   */
  async getById(ma_hoa_don) {
    const { data, error } = await supabase
      .from("hoa_don")
      .select(
        `
        *,
        hop_dong:ma_hop_dong (
          *,
          ho_so_khach_hang:ma_ho_so_khach_hang (*),
          phong:ma_phong (ma_phong, ma_phong_hien_thi, loai_phong),
          giuong:ma_giuong (ma_giuong, ma_giuong_hien_thi, nhan_giuong)
        ),
        yeu_cau_thue:ma_yeu_cau_thue (
          *,
          ho_so_khach_hang:ma_ho_so_khach_hang (*)
        ),
        thanh_toan (*),
        chi_tiet_hoa_don (*)
      `,
      )
      .eq("ma_hoa_don", ma_hoa_don)
      .single();
    if (error) throw error;
    return data;
  },
};

module.exports = InvoiceModel;
