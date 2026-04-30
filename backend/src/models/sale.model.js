const { supabase } = require("../config/supabase");

const getInitials = (name) => {
  if (!name) return "";
  return name.split(" ").filter(Boolean).slice(0, 2)
    .map((w) => w[0].toUpperCase()).join("");
};

const formatPrice = (price) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price || 0);

const SaleModel = {

  // ============================================================
  // DASHBOARD
  // ============================================================
  async getDashboard() {
    const now = new Date();
    const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    const [
      { count: totalPending },
      { count: totalCustomers },
      { count: activeContracts },
      { count: pendingCheckouts },
      { count: totalRequests },
      { count: approvedThisMonth },
      { count: rejectedThisMonth },
    ] = await Promise.all([
      supabase.from("yeu_cau_thue").select("*", { count: "exact", head: true })
        .in("trang_thai", ["DANG_XU_LY", "MOI_TAO", "CHO_THANH_TOAN"]),
      supabase.from("ho_so").select("*", { count: "exact", head: true })
        .eq("vai_tro", "KHACH_HANG"),
      supabase.from("hop_dong").select("*", { count: "exact", head: true })
        .eq("trang_thai", "HIEU_LUC"),
      supabase.from("yeu_cau_tra_phong").select("*", { count: "exact", head: true })
        .eq("trang_thai", "CHO_XU_LY"),
      supabase.from("yeu_cau_thue").select("*", { count: "exact", head: true }),
      supabase.from("yeu_cau_thue").select("*", { count: "exact", head: true })
        .eq("trang_thai", "DA_XAC_NHAN").gte("created_at", firstOfMonth),
      supabase.from("yeu_cau_thue").select("*", { count: "exact", head: true })
        .eq("trang_thai", "TU_CHOI").gte("created_at", firstOfMonth),
    ]);

    // Status breakdown
    const statuses = ["DANG_XU_LY", "CHO_THANH_TOAN", "DA_XAC_NHAN", "TU_CHOI"];
    const statusBreakdown = {};
    await Promise.all(
      statuses.map(async (s) => {
        const { count } = await supabase.from("yeu_cau_thue")
          .select("*", { count: "exact", head: true }).eq("trang_thai", s);
        statusBreakdown[s] = count || 0;
      })
    );

    // Recent requests (5 latest)
    const { data: recent } = await supabase
      .from("yeu_cau_thue")
      .select(`
        ma_yeu_cau_thue, trang_thai, loai_muc_tieu, created_at,
        ho_so!yeu_cau_thue_ma_ho_so_khach_hang_fkey ( ho_ten ),
        phong ( ma_phong_hien_thi )
      `)
      .order("created_at", { ascending: false })
      .limit(5);

    const recentRequests = (recent || []).map((r) => ({
      id: `#REQ-${String(r.ma_yeu_cau_thue).padStart(4, "0")}`,
      rawId: r.ma_yeu_cau_thue,
      trang_thai: r.trang_thai,
      loai_muc_tieu: r.loai_muc_tieu,
      ho_ten: r.ho_so?.ho_ten || "—",
      roomName: r.phong ? `Phòng ${r.phong.ma_phong_hien_thi}` : "—",
      date: new Date(r.created_at).toLocaleDateString("vi-VN"),
    }));

    return {
      kpi: {
        totalPendingRequests: totalPending || 0,
        totalCustomers: totalCustomers || 0,
        activeContracts: activeContracts || 0,
        pendingCheckouts: pendingCheckouts || 0,
        totalRequests: totalRequests || 0,
        approvedThisMonth: approvedThisMonth || 0,
        rejectedThisMonth: rejectedThisMonth || 0,
        requestsByStatus: statusBreakdown,
      },
      recentRequests,
    };
  },

  // ============================================================
  // RENTAL REQUESTS
  // ============================================================
  async getRentalRequests(filters = {}) {
    let query = supabase
      .from("yeu_cau_thue")
      .select(`
        ma_yeu_cau_thue, trang_thai, loai_muc_tieu,
        ngay_du_kien_vao_o, gia_thue_thang, so_tien_dat_coc, created_at,
        ho_so!yeu_cau_thue_ma_ho_so_khach_hang_fkey ( ma_ho_so, ho_ten, so_dien_thoai, email ),
        phong ( ma_phong_hien_thi ),
        giu_cho_tam ( ma_giuong, trang_thai, giuong ( ma_giuong_hien_thi ) )
      `, { count: "exact" })
      .order("created_at", { ascending: false });

    if (filters.trang_thai && filters.trang_thai !== "all")
      query = query.eq("trang_thai", filters.trang_thai);
    if (filters.loai_muc_tieu && filters.loai_muc_tieu !== "all")
      query = query.eq("loai_muc_tieu", filters.loai_muc_tieu);

    const { data, count, error } = await query;
    if (error) throw error;

    let items = (data || []).map((r) => ({
      id: `#REQ-${String(r.ma_yeu_cau_thue).padStart(4, "0")}`,
      rawId: r.ma_yeu_cau_thue,
      trang_thai: r.trang_thai,
      loai_muc_tieu: r.loai_muc_tieu,
      ngay_du_kien_vao_o: r.ngay_du_kien_vao_o,
      gia_thue_thang: r.gia_thue_thang,
      so_tien_dat_coc: r.so_tien_dat_coc,
      so_tien_dat_coc_fmt: formatPrice(r.so_tien_dat_coc),
      date: new Date(r.created_at).toLocaleDateString("vi-VN"),
      ho_ten: r.ho_so?.ho_ten || "—",
      so_dien_thoai: r.ho_so?.so_dien_thoai || "—",
      email: r.ho_so?.email || "—",
      ma_ho_so_khach_hang: r.ho_so?.ma_ho_so,
      roomName: r.phong ? `Phòng ${r.phong.ma_phong_hien_thi}` : "—",
      giuong: (r.giu_cho_tam || []).map((g) => g.giuong?.ma_giuong_hien_thi || g.ma_giuong),
    }));

    // Search filter (name/phone)
    if (filters.search) {
      const q = filters.search.toLowerCase();
      items = items.filter(
        (i) =>
          i.ho_ten.toLowerCase().includes(q) ||
          i.so_dien_thoai.includes(q) ||
          i.id.toLowerCase().includes(q)
      );
    }

    return { items, total: count || 0 };
  },

  async getRentalRequestDetail(id) {
    const { data, error } = await supabase
      .from("yeu_cau_thue")
      .select(`
        *,
        ho_so!yeu_cau_thue_ma_ho_so_khach_hang_fkey ( * ),
        phong ( *, tang ( ten_tang ) ),
        giu_cho_tam (
          ma_giu_cho_tam, ma_giuong, trang_thai, thoi_gian_het_han,
          giuong ( ma_giuong_hien_thi, gia_thang )
        ),
        nhat_ky_yeu_cau_thue (
          ma_nhat_ky, trang_thai_cu, trang_thai_moi, ghi_chu, created_at,
          ho_so!nhat_ky_yeu_cau_thue_ma_ho_so_nguoi_thuc_hien_fkey ( ho_ten )
        ),
        hoa_don ( ma_hoa_don, trang_thai, tong_so_tien, ngay_den_han )
      `)
      .eq("ma_yeu_cau_thue", id)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    return {
      ...data,
      id: `#REQ-${String(data.ma_yeu_cau_thue).padStart(4, "0")}`,
      rawId: data.ma_yeu_cau_thue,
      ho_ten: data.ho_so?.ho_ten || "—",
      so_dien_thoai: data.ho_so?.so_dien_thoai || "—",
      email: data.ho_so?.email || "—",
      roomName: data.phong ? `Phòng ${data.phong.ma_phong_hien_thi}` : "—",
      so_tien_dat_coc_fmt: formatPrice(data.so_tien_dat_coc),
      gia_thue_thang_fmt: formatPrice(data.gia_thue_thang),
      date: new Date(data.created_at).toLocaleDateString("vi-VN"),
      beds: (data.giu_cho_tam || []).map((g) => ({
        id: g.ma_giuong,
        display: g.giuong?.ma_giuong_hien_thi || g.ma_giuong,
        status: g.trang_thai,
        expiry: g.thoi_gian_het_han,
        price: g.giuong?.gia_thang,
      })),
      logs: (data.nhat_ky_yeu_cau_thue || [])
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .map((l) => ({
          id: l.ma_nhat_ky,
          from: l.trang_thai_cu,
          to: l.trang_thai_moi,
          note: l.ghi_chu,
          by: l.ho_so?.ho_ten || "Hệ thống",
          at: new Date(l.created_at).toLocaleString("vi-VN"),
        })),
    };
  },

async processRentalRequest(id, { action, ghi_chu, ngay_vao_o, ngay_ket_thuc, ma_ho_so_nguoi_thuc_hien }) {
  // Nếu là DUYET → gọi RPC tạo hợp đồng luôn
  if (action === 'DUYET') {
    if (!ngay_vao_o) throw new Error("Thiếu ngày vào ở");
    const { data, error } = await supabase.rpc(
      'approve_rental_request_and_create_contract',
      {
        p_ma_yeu_cau_thue:   parseInt(id),
        p_ma_nhan_vien_sale: ma_ho_so_nguoi_thuc_hien,
        p_ngay_vao_o:        ngay_vao_o,
        p_ngay_ket_thuc:     ngay_ket_thuc || null,
      }
    );
    if (error) throw error;
    return data;
  }

  // Các action khác: TU_CHOI, TAM_DUNG, YEU_CAU_BO_SUNG
  const STATUS_MAP = {
    TU_CHOI:         'TU_CHOI',
    TAM_DUNG:        'TAM_DUNG',
    YEU_CAU_BO_SUNG: 'DANG_XU_LY',
  };
  const trangThaiMoi = STATUS_MAP[action];
  if (!trangThaiMoi) throw new Error("Action không hợp lệ");

  const { data: current } = await supabase
    .from('yeu_cau_thue').select('trang_thai')
    .eq('ma_yeu_cau_thue', id).single();

  const { error } = await supabase.from('yeu_cau_thue')
    .update({ trang_thai: trangThaiMoi }).eq('ma_yeu_cau_thue', id);
  if (error) throw error;

  await supabase.from('nhat_ky_yeu_cau_thue').insert({
    ma_yeu_cau_thue: id,
    trang_thai_cu: current?.trang_thai || null,
    trang_thai_moi: trangThaiMoi,
    ma_ho_so_nguoi_thuc_hien,
    ghi_chu: ghi_chu || null,
  });

  return { success: true, trang_thai: trangThaiMoi };
},

  // ============================================================
  // CUSTOMERS
  // ============================================================
  async getCustomers(filters = {}) {
    let query = supabase
      .from("ho_so")
      .select(`
        ma_ho_so, ho_ten, email, so_dien_thoai, vai_tro, created_at,
        yeu_cau_thue!yeu_cau_thue_ma_ho_so_khach_hang_fkey ( count ),
        hop_dong!hop_dong_ma_ho_so_khach_hang_fkey ( trang_thai )
      `, { count: "exact" })
      .eq("vai_tro", "KHACH_HANG")
      .order("created_at", { ascending: false });

    const { data, count, error } = await query;
    if (error) throw error;

    let items = (data || []).map((c) => ({
      id: c.ma_ho_so,
      ho_ten: c.ho_ten || "—",
      email: c.email || "—",
      so_dien_thoai: c.so_dien_thoai || "—",
      initials: getInitials(c.ho_ten),
      created_at: new Date(c.created_at).toLocaleDateString("vi-VN"),
      so_yeu_cau: c.yeu_cau_thue?.length || 0,
      has_active_contract: (c.hop_dong || []).some((h) => h.trang_thai === "HIEU_LUC"),
    }));

    if (filters.search) {
      const q = filters.search.toLowerCase();
      items = items.filter(
        (i) =>
          i.ho_ten.toLowerCase().includes(q) ||
          i.email.toLowerCase().includes(q) ||
          i.so_dien_thoai.includes(q)
      );
    }

    return { items, total: count || 0 };
  },

  async getCustomerDetail(id) {
    const { data, error } = await supabase
      .from("ho_so")
      .select(`
        *,
        yeu_cau_thue!yeu_cau_thue_ma_ho_so_khach_hang_fkey (
          ma_yeu_cau_thue, trang_thai, loai_muc_tieu, created_at,
          phong ( ma_phong_hien_thi )
        ),
        hop_dong!hop_dong_ma_ho_so_khach_hang_fkey (
          ma_hop_dong, trang_thai, ngay_vao_o, gia_thue_co_ban_thang,
          phong ( ma_phong_hien_thi )
        )
      `)
      .eq("ma_ho_so", id)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  // ============================================================
  // CONTRACTS
  // ============================================================
  async getContracts(filters = {}) {
    let query = supabase
      .from("hop_dong")
      .select(`
        ma_hop_dong, trang_thai, loai_muc_tieu, ngay_vao_o,
        ma_ho_so_khach_hang,
        gia_thue_co_ban_thang, so_tien_dat_coc_bao_dam, created_at,
        ho_so!hop_dong_ma_ho_so_khach_hang_fkey ( ho_ten, so_dien_thoai ),
        phong ( ma_phong_hien_thi ),
        giuong ( ma_giuong_hien_thi ),
        phan_bo_hop_dong ( ngay_ket_thuc, trang_thai )
      `, { count: "exact" })
      .order("created_at", { ascending: false });

    if (filters.trang_thai && filters.trang_thai !== "all")
      query = query.eq("trang_thai", filters.trang_thai);

    const { data, count, error } = await query;
    if (error) throw error;

    let items = (data || []).map((h) => {
      const phanBo = (h.phan_bo_hop_dong || []).find((p) => p.trang_thai === "HIEU_LUC");
      let roomDisplay =
        h.loai_muc_tieu === "PHONG"
          ? `Phòng ${h.phong?.ma_phong_hien_thi || ""}`
          : `Giường ${h.giuong?.ma_giuong_hien_thi || ""} - P.${h.phong?.ma_phong_hien_thi || ""}`;

      return {
        id: h.ma_hop_dong,
        contractId: `HD-${String(h.ma_hop_dong).padStart(4, "0")}`,
        trang_thai: h.trang_thai,
        loai_muc_tieu: h.loai_muc_tieu,
        ho_ten: h.ho_so?.ho_ten || "—",
        so_dien_thoai: h.ho_so?.so_dien_thoai || "—",
        initials: getInitials(h.ho_so?.ho_ten),
        roomDisplay,
        ngay_vao_o: h.ngay_vao_o
          ? new Date(h.ngay_vao_o).toLocaleDateString("vi-VN")
          : "—",
        ngay_ket_thuc: phanBo?.ngay_ket_thuc
          ? new Date(phanBo.ngay_ket_thuc).toLocaleDateString("vi-VN")
          : "—",
        gia_thue: formatPrice(h.gia_thue_co_ban_thang),
        tien_coc: formatPrice(h.so_tien_dat_coc_bao_dam),
      };
    });

    if (filters.search) {
      const q = filters.search.toLowerCase();
      items = items.filter(
        (i) =>
          i.ho_ten.toLowerCase().includes(q) ||
          i.contractId.toLowerCase().includes(q) ||
          i.roomDisplay.toLowerCase().includes(q)
      );
    }

    return { items, total: count || 0 };
  },

  async getContractDetail(id) {
    const { data, error } = await supabase
      .from("hop_dong")
      .select(`
        *,
        ho_so!hop_dong_ma_ho_so_khach_hang_fkey ( * ),
        phong ( *, tang ( ten_tang ) ),
        giuong ( * ),
        phan_bo_hop_dong ( * ),
        khoan_thu_hop_dong ( * ),
        yeu_cau_tra_phong ( ma_yeu_cau_tra_phong, trang_thai, ngay_yeu_cau_tra_phong )
      `)
      .eq("ma_hop_dong", id)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  // ============================================================
  // CHECKOUT REQUESTS
  // ============================================================
  async getCheckoutRequests(filters = {}) {
    let query = supabase
      .from("yeu_cau_tra_phong")
      .select(`
        ma_yeu_cau_tra_phong, trang_thai,
        ngay_yeu_cau_tra_phong, gio_ban_giao, ly_do, created_at,
        hop_dong!inner (
          ma_hop_dong,
          ho_so!hop_dong_ma_ho_so_khach_hang_fkey ( ho_ten, so_dien_thoai ),
          phong ( ma_phong_hien_thi ),
          giuong ( ma_giuong_hien_thi )
        )
      `, { count: "exact" })
      .order("created_at", { ascending: false });

    if (filters.trang_thai && filters.trang_thai !== "all")
      query = query.eq("trang_thai", filters.trang_thai);

    const { data, count, error } = await query;
    if (error) throw error;

    let items = (data || []).map((y) => ({
      id: y.ma_yeu_cau_tra_phong,
      trang_thai: y.trang_thai,
      ngay_yeu_cau: new Date(y.ngay_yeu_cau_tra_phong).toLocaleDateString("vi-VN"),
      gio_ban_giao: y.gio_ban_giao || "—",
      ly_do: y.ly_do || "—",
      contractId: `HD-${String(y.hop_dong?.ma_hop_dong).padStart(4, "0")}`,
      ma_hop_dong: y.hop_dong?.ma_hop_dong,
      ho_ten: y.hop_dong?.ho_so?.ho_ten || "—",
      so_dien_thoai: y.hop_dong?.ho_so?.so_dien_thoai || "—",
      initials: getInitials(y.hop_dong?.ho_so?.ho_ten),
      roomDisplay: y.hop_dong?.phong
        ? `Phòng ${y.hop_dong.phong.ma_phong_hien_thi}`
        : "—",
    }));

    if (filters.search) {
      const q = filters.search.toLowerCase();
      items = items.filter(
        (i) =>
          i.ho_ten.toLowerCase().includes(q) ||
          i.contractId.toLowerCase().includes(q)
      );
    }

    return { items, total: count || 0 };
  },

  async createCheckoutRequest(payload) {
    const { data, error } = await supabase
      .from("yeu_cau_tra_phong")
      .insert({
        ma_hop_dong: payload.ma_hop_dong,
        ma_ho_so_khach_hang: payload.ma_ho_so_khach_hang,
        ngay_yeu_cau_tra_phong: payload.ngay_yeu_cau_tra_phong,
        gio_ban_giao: payload.gio_ban_giao || null,
        ly_do: payload.ly_do || null,
        trang_thai: "CHO_XU_LY",
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateCheckoutRequestTime(id, payload) {
    const { data, error } = await supabase
      .from("yeu_cau_tra_phong")
      .update({
        ngay_yeu_cau_tra_phong: payload.ngay_yeu_cau_tra_phong,
        gio_ban_giao: payload.gio_ban_giao || null,
        ly_do: payload.ly_do || null,
      })
      .eq("ma_yeu_cau_tra_phong", id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
};

module.exports = SaleModel;