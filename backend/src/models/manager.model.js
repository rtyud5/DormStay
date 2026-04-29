const { supabase } = require("../config/supabase");
const { AppError } = require("../utils/errors");

const ACTIVE_CONTRACT_STATUSES = ["HIEU_LUC", "DANG_HIEU_LUC"];
const CLOSED_CONTRACT_STATUSES = ["HET_HAN", "DA_KET_THUC"];
const ACTIVE_CHECKOUT_STATUSES = ["CHO_XU_LY", "DANG_KIEM_TRA"];
const COMPLETED_CHECKOUT_STATUSES = ["HOAN_TAT", "DA_THANH_LY"];
const OCCUPIED_BED_STATUSES = ["DA_THUE", "DANG_O", "DANG_SU_DUNG", "DA_THUE_HET"];
const EMPTY_BED_STATUSES = ["TRONG", "CON_TRONG"];

const normalizeContractStatus = (status) => {
  const value = String(status || "").toUpperCase();
  if (CLOSED_CONTRACT_STATUSES.includes(value)) return "HET_HAN";
  return "HIEU_LUC";
};

const normalizeBedStatus = (status) => {
  const value = String(status || "").toUpperCase();
  if (EMPTY_BED_STATUSES.includes(value)) return "TRONG";
  if (OCCUPIED_BED_STATUSES.includes(value)) return "DA_THUE";
  return value || "TRONG";
};

const normalizeRoomStatus = (status, beds = [], capacity = 0) => {
  const bedCount = beds.length;
  if (bedCount > 0) {
    const occupied = beds.filter((bed) => normalizeBedStatus(bed.trang_thai) === "DA_THUE").length;
    if (occupied <= 0) return "TRONG";
    if (occupied >= Math.max(Number(capacity) || bedCount, bedCount)) return "DAY";
    return "SAP_DAY";
  }

  const value = String(status || "").toUpperCase();
  if (["DAY", "DA_THUE_HET", "DANG_O"].includes(value)) return "DAY";
  if (value === "SAP_DAY") return "SAP_DAY";
  return "TRONG";
};

const toNumber = (value) => {
  const parsed = Number(value || 0);
  return Number.isFinite(parsed) ? parsed : 0;
};

const getLatestByContract = async (table, contractIds, select = "*") => {
  if (!contractIds.length) return {};
  const { data, error } = await supabase
    .from(table)
    .select(select)
    .in("ma_hop_dong", contractIds)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data || []).reduce((map, row) => {
    if (!map[row.ma_hop_dong]) map[row.ma_hop_dong] = row;
    return map;
  }, {});
};

const refreshRoomAvailabilityStatus = async (roomId) => {
  if (!roomId) return null;

  const { data: room, error } = await supabase
    .from("phong")
    .select("ma_phong, trang_thai, suc_chua, giuong ( ma_giuong, trang_thai )")
    .eq("ma_phong", roomId)
    .maybeSingle();

  if (error) throw error;
  if (!room) return null;

  const nextStatus = normalizeRoomStatus(room.trang_thai, room.giuong || [], room.suc_chua);
  const { error: updateError } = await supabase
    .from("phong")
    .update({ trang_thai: nextStatus })
    .eq("ma_phong", roomId);

  if (updateError) throw updateError;
  return nextStatus;
};

// Helper
const getInitials = (name) => {
  if (!name) return "";
  return name.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join("");
};

// Resolve room + bed display from hop_dong data
// For GIUONG contracts, ma_phong on hop_dong is NULL, so room comes through giuong->phong
const resolveRoomInfo = (hd) => {
  const loai = hd?.loai_muc_tieu;
  let roomHienThi = '';
  let bedHienThi = '';
  let floor = '';
  let roomObj = null;

  if (loai === 'PHONG') {
    roomObj = hd?.phong;
    roomHienThi = roomObj?.ma_phong_hien_thi || '';
  } else {
    // GIUONG: get room from giuong->phong
    bedHienThi = hd?.giuong?.ma_giuong_hien_thi || hd?.giuong?.nhan_giuong || '';
    roomObj = hd?.phong || hd?.giuong?.phong;
    roomHienThi = roomObj?.ma_phong_hien_thi || '';
  }

  floor = roomObj?.tang?.ten_tang || roomObj?.tang?.so_tang?.toString() || '';

  const roomDisplay = roomHienThi ? `P.${roomHienThi}` : '';
  const bedDisplay = bedHienThi ? `Giường ${bedHienThi}` : '';

  return { roomDisplay, bedDisplay, floor, roomObj };
};

const ManagerModel = {
  // ============================================
  // DASHBOARD
  // ============================================
  async getDashboardKPI() {
    const roomsOverview = await this.getRoomsOverview();
    const { count: totalRooms } = await supabase.from('phong').select('*', { count: 'exact', head: true });

    // Đang ở = Số hợp đồng hiệu lực
    const { count: activeContracts } = await supabase.from('hop_dong').select('*', { count: 'exact', head: true }).eq('trang_thai', 'HIEU_LUC');

    const { count: emptyRooms } = await supabase.from('phong').select('*', { count: 'exact', head: true }).eq('trang_thai', 'TRONG');

    // Bảo trì
    const { count: maintenanceRooms } = await supabase.from('phong').select('*', { count: 'exact', head: true }).eq('trang_thai', 'BAO_TRI');

    // Chờ checkout
    const { count: pendingCheckoutRequests } = await supabase.from('yeu_cau_tra_phong').select('*', { count: 'exact', head: true }).in('trang_thai', ACTIVE_CHECKOUT_STATUSES);

    // Checkout requests this week
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const { count: checkoutRequestsThisWeek } = await supabase
      .from('yeu_cau_tra_phong')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', weekAgo.toISOString());

    // Tổng cư dân (hợp đồng hiệu lực unique khách hàng)
    const { data: residentData } = await supabase
      .from('hop_dong')
      .select('ma_ho_so_khach_hang')
      .in('trang_thai', ACTIVE_CONTRACT_STATUSES);
    const totalResidents = residentData ? new Set(residentData.map(r => r.ma_ho_so_khach_hang)).size : 0;

    // Cư dân mới tháng này
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);
    const { count: newResidentsThisMonth } = await supabase
      .from('hop_dong')
      .select('*', { count: 'exact', head: true })
      .in('trang_thai', ACTIVE_CONTRACT_STATUSES)
      .gte('created_at', monthStart.toISOString());

    // Sắp hết hạn (<= 30 ngày)
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    const { count: contractsExpiringSoon } = await supabase
      .from('phan_bo_hop_dong')
      .select('*', { count: 'exact', head: true })
      .in('trang_thai', ACTIVE_CONTRACT_STATUSES)
      .not('ngay_ket_thuc', 'is', null)
      .lte('ngay_ket_thuc', thirtyDaysFromNow.toISOString());

    return {
      totalRooms: totalRooms || 0,
      occupiedRooms: roomsOverview.stats?.occupied || 0,
      emptyRooms: roomsOverview.stats?.empty || 0,
      maintenanceRooms: 0,
      pendingCheckoutRequests: pendingCheckoutRequests || 0,
      checkoutRequestsThisWeek: checkoutRequestsThisWeek || 0,
      totalResidents,
      newResidentsThisMonth: newResidentsThisMonth || 0,
      contractsExpiringSoon: contractsExpiringSoon || 0
    };
  },

  async getRecentCheckoutRequests() {
    const { data } = await supabase
      .from('yeu_cau_tra_phong')
      .select(`
        ma_yeu_cau_tra_phong,
        ngay_yeu_cau_tra_phong,
        ly_do,
        trang_thai,
        hop_dong (
          ma_hop_dong,
          loai_muc_tieu,
          ho_so:ma_ho_so_khach_hang ( ma_ho_so, ho_ten ),
          phong ( ma_phong_hien_thi, tang(ten_tang, so_tang) ),
          giuong ( ma_giuong_hien_thi, nhan_giuong, phong(ma_phong_hien_thi, tang(ten_tang, so_tang)) )
        )
      `)
      .in('trang_thai', ['CHO_XU_LY', 'DANG_KIEM_TRA'])
      .order('created_at', { ascending: false })
      .limit(5);

    return (data || []).map((req) => {
      const hd = req.hop_dong;
      const hoTen = hd?.ho_so?.ho_ten || 'N/A';
      const { roomDisplay, bedDisplay, floor } = resolveRoomInfo(hd);

      return {
        id: req.ma_yeu_cau_tra_phong,
        contractId: `HD-${hd?.ma_hop_dong || ''}`,
        customerName: hoTen,
        avatarInitials: getInitials(hoTen),
        roomDisplay,
        bedDisplay,
        floor,
        requestDate: req.ngay_yeu_cau_tra_phong,
        reason: req.ly_do || '',
        checkoutStatus: req.trang_thai,
      };
    });
  },

  // ============================================
  // RESIDENTS
  // ============================================
  async getResidents(filters = {}) {
    let query = supabase
      .from("hop_dong")
      .select(`
        ma_hop_dong,
        ngay_vao_o,
        trang_thai,
        gia_thue_co_ban_thang,
        so_tien_dat_coc_bao_dam,
        loai_muc_tieu,
        ho_so:ma_ho_so_khach_hang (
          ma_ho_so, ho_ten, so_dien_thoai, email, so_cccd
        ),
        phong ( ma_phong, ma_phong_hien_thi, loai_phong, tang ( ten_tang, so_tang ) ),
        giuong ( ma_giuong_hien_thi, nhan_giuong, phong(ma_phong_hien_thi, tang(ten_tang, so_tang)) ),
        phan_bo_hop_dong (
          ma_giuong,
          giuong ( ma_giuong_hien_thi ),
          trang_thai,
          ngay_ket_thuc
        )
      `, { count: 'exact' })
      .in("trang_thai", ACTIVE_CONTRACT_STATUSES);

    if (filters.rentalType && filters.rentalType !== "all") {
      query = query.eq('loai_muc_tieu', filters.rentalType);
    }
    if (filters.search) {
      query = query.ilike('ho_so.ho_ten', `%${filters.search}%`);
    }

    const { data, count, error } = await query;
    if (error) console.error("getResidents error", error);

    const formatData = (data || []).map((h) => {
      const { roomDisplay, bedDisplay, floor } = resolveRoomInfo(h);
      const fullDisplay = bedDisplay ? `${bedDisplay} - ${roomDisplay}` : roomDisplay;

      return {
        id: h.ma_hop_dong,
        customerName: h.ho_so?.ho_ten || '',
        avatarInitials: getInitials(h.ho_so?.ho_ten),
        roomDisplay: fullDisplay,
        bedDisplay,
        floor,
        rentalType: h.loai_muc_tieu,
        moveInDate: h.ngay_vao_o,
        phone: h.ho_so?.so_dien_thoai || '',
        baseRent: Number(h.gia_thue_co_ban_thang) || 0,
        deposit: Number(h.so_tien_dat_coc_bao_dam) || 0,
        status: normalizeContractStatus(h.trang_thai)
      };
    });

    // Client-side floor filter (nested filter limitation of supabase)
    let finalData = formatData;
    if (filters.floor && filters.floor !== "all") finalData = finalData.filter(d => d.floor === filters.floor);

    return { items: finalData, total: count || 0 };
  },

  async getResidentDetail(contractId) {
    const { data } = await supabase
      .from("hop_dong")
      .select(`
        *,
        ho_so:ma_ho_so_khach_hang (*),
        phong (
          ma_phong, ma_phong_hien_thi, loai_phong, gia_thang,
          tang ( ten_tang, so_tang ),
          toa ( ten, ma_dinh_danh )
        ),
        giuong ( ma_giuong_hien_thi, nhan_giuong, phong(ma_phong, ma_phong_hien_thi, loai_phong, tang(ten_tang, so_tang), toa(ten, ma_dinh_danh)) ),
        phan_bo_hop_dong (
          ma_giuong,
          ngay_bat_dau, ngay_ket_thuc, trang_thai,
          giuong ( ma_giuong_hien_thi )
        ),
        yeu_cau_thue (
          ma_yeu_cau_thue, trang_thai, created_at,
          nhat_ky_yeu_cau_thue ( trang_thai_moi, ghi_chu, created_at, ho_so:ma_ho_so_nguoi_thuc_hien ( ho_ten ) )
        )
      `)
      .eq("ma_hop_dong", contractId)
      .maybeSingle();

    if (!data) return null;

    const ho = data.ho_so || {};
    const { roomDisplay, bedDisplay, floor, roomObj } = resolveRoomInfo(data);

    // Tính ngày kết thúc dự kiến từ phan_bo
    const allocations = data.phan_bo_hop_dong || [];
    const activeAlloc = allocations.find(a => ACTIVE_CONTRACT_STATUSES.includes(a.trang_thai));
    const contractEndDate = activeAlloc?.ngay_ket_thuc || null;

    // Tính thời hạn thuê (tháng)
    let rentalDuration = null;
    if (data.ngay_vao_o && contractEndDate) {
      const start = new Date(data.ngay_vao_o);
      const end = new Date(contractEndDate);
      rentalDuration = Math.round((end - start) / (1000 * 60 * 60 * 24 * 30));
    }

    // Ghi chú từ sale (lấy từ nhật ký yêu cầu thuê)
    const saleNotes = data.yeu_cau_thue?.nhat_ky_yeu_cau_thue || [];
    const saleNote = saleNotes.find(n => n.ghi_chu)?.ghi_chu || null;
    const saleNotePerson = saleNotes.find(n => n.ghi_chu)?.ho_so?.ho_ten || null;
    const saleNoteDate = saleNotes.find(n => n.ghi_chu)?.created_at || null;

    // Checklist hồ sơ
    const checklist = [
      { label: "Căn cước công dân (Mặt trước)", done: !!ho.cccd_mat_truoc_url },
      { label: "Căn cước công dân (Mặt sau)", done: !!ho.cccd_mat_sau_url },
      { label: "Xác nhận thanh toán cọc", done: data.so_tien_dat_coc_bao_dam > 0 },
      { label: "Thông tin liên hệ khẩn cấp", done: !!ho.lien_he_khan_cap_ho_ten },
      { label: "Hợp đồng thuê", done: normalizeContractStatus(data.trang_thai) === 'HIEU_LUC' },
      { label: "Đăng ký tạm trú", done: false },
    ];

    return {
      id: data.ma_hop_dong,
      contractStatus: normalizeContractStatus(data.trang_thai),
      rentalType: data.loai_muc_tieu,
      // Thông tin khách hàng
      customerName: ho.ho_ten || '',
      avatarInitials: getInitials(ho.ho_ten),
      avatarUrl: ho.avatar_url || null,
      email: ho.email || '',
      phone: ho.so_dien_thoai || '',
      cccd: ho.so_cccd || '',
      cccdIssuedDate: ho.ngay_cap_cccd || null,
      cccdFrontUrl: ho.cccd_mat_truoc_url || null,
      cccdBackUrl: ho.cccd_mat_sau_url || null,
      address: ho.dia_chi_thuong_tru || '',
      bankName: ho.ngan_hang_ten || '',
      bankAccount: ho.ngan_hang_so_tai_khoan || '',
      bankAccountHolder: ho.ngan_hang_chu_tai_khoan || '',
      // Liên hệ khẩn cấp
      emergencyContact: {
        name: ho.lien_he_khan_cap_ho_ten || null,
        phone: ho.lien_he_khan_cap_sdt || null,
        relation: ho.lien_he_khan_cap_moi_quan_he || null,
      },
      // Phòng
      roomDisplay: bedDisplay ? `${bedDisplay} - ${roomDisplay}` : roomDisplay,
      bedDisplay,
      roomNumber: roomObj?.ma_phong_hien_thi || '',
      roomType: roomObj?.loai_phong || '',
      floor: floor,
      building: roomObj?.toa?.ten || '',
      // Hợp đồng
      moveInDate: data.ngay_vao_o,
      contractEndDate,
      rentalDuration,
      baseRent: Number(data.gia_thue_co_ban_thang) || 0,
      deposit: Number(data.so_tien_dat_coc_bao_dam) || 0,
      // Ghi chú
      saleNote,
      saleNotePerson,
      saleNoteDate,
      // Checklist
      checklist,
    };
  },

  // ============================================
  // INSPECTIONS
  // ============================================
  async getInspections(filters = {}) {
    let query = supabase.from("yeu_cau_tra_phong").select(`
      ma_yeu_cau_tra_phong,
      ngay_yeu_cau_tra_phong,
      ly_do,
      trang_thai,
      hop_dong (
        ma_hop_dong,
        loai_muc_tieu,
        ho_so:ma_ho_so_khach_hang ( ho_ten ),
        phong ( ma_phong_hien_thi, tang(ten_tang, so_tang) ),
        giuong ( ma_giuong_hien_thi, nhan_giuong, phong(ma_phong_hien_thi, tang(ten_tang, so_tang)) )
      )
    `, { count: 'exact' });

    if (filters.status && filters.status !== "all") query = query.eq('trang_thai', filters.status);

    const { data, count } = await query;

    let formatData = (data || []).map(y => {
      const hd = y.hop_dong;
      const { roomDisplay, bedDisplay, floor } = resolveRoomInfo(hd);

      return {
        id: y.ma_yeu_cau_tra_phong,
        contractId: `HD-${hd?.ma_hop_dong || ''}`,
        customerName: hd?.ho_so?.ho_ten || '',
        avatarInitials: getInitials(hd?.ho_so?.ho_ten),
        roomDisplay,
        bedDisplay,
        floor,
        requestDate: y.ngay_yeu_cau_tra_phong,
        reason: y.ly_do || '',
        checkoutStatus: y.trang_thai
      };
    });

    if (filters.floor && filters.floor !== "all") formatData = formatData.filter(d => d.floor === filters.floor);
    if (filters.search) {
      formatData = formatData.filter(d =>
        d.customerName?.toLowerCase().includes(filters.search.toLowerCase()) ||
        d.contractId?.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    return { items: formatData, total: count || 0 };
  },

  async getInspectionDetail(id) {
    // First get checkout request with contract info
    const { data } = await supabase
      .from("yeu_cau_tra_phong")
      .select(`
        *,
        hop_dong (
          ma_hop_dong,
          gia_thue_co_ban_thang,
          so_tien_dat_coc_bao_dam,
          ngay_vao_o,
          loai_muc_tieu,
          ho_so:ma_ho_so_khach_hang (ho_ten, so_dien_thoai),
          phong ( ma_phong, ma_phong_hien_thi, tang(ten_tang, so_tang) ),
          giuong ( ma_giuong_hien_thi, nhan_giuong, phong(ma_phong, ma_phong_hien_thi, tang(ten_tang, so_tang)) ),
          phan_bo_hop_dong ( ngay_ket_thuc, trang_thai )
        ),
        bien_ban_kiem_tra (
          ma_bien_ban_kiem_tra, thoi_gian_kiem_tra, tong_uoc_tinh_khau_tru, trang_thai,
          ho_so:ma_ho_so_nguoi_kiem_tra (ho_ten),
          chi_tiet_kiem_tra (*)
        )
      `)
      .eq("ma_yeu_cau_tra_phong", id)
      .maybeSingle();

    if (!data) return null;

    const hd = data.hop_dong;
    const { roomDisplay, bedDisplay, floor, roomObj } = resolveRoomInfo(hd);

    // Get room assets for inspection checklist
    let roomAssets = [];
    const maPhong = roomObj?.ma_phong || hd?.phong?.ma_phong;
    if (maPhong) {
      const { data: assets } = await supabase
        .from('tai_san_phong')
        .select('*')
        .eq('ma_phong', maPhong);
      roomAssets = (assets || []).map(a => ({
        id: a.ma_tai_san,
        assetCode: a.ma_tai_san_hien_thi,
        assetName: a.ten_tai_san,
        category: a.danh_muc,
        defaultCompensation: Number(a.muc_boi_thuong_mac_dinh) || 0
      }));
    }

    // End date from allocation
    const activeAlloc = hd?.phan_bo_hop_dong?.find(a => ACTIVE_CONTRACT_STATUSES.includes(a.trang_thai));
    const contractEndDate = activeAlloc?.ngay_ket_thuc || null;

    let inspectionObj = null;
    if (data.bien_ban_kiem_tra && data.bien_ban_kiem_tra.length > 0) {
      let bb = data.bien_ban_kiem_tra[0];
      inspectionObj = {
        id: bb.ma_bien_ban_kiem_tra,
        idDisplay: `BBKT-${bb.ma_bien_ban_kiem_tra}`,
        inspectedBy: bb.ho_so?.ho_ten || "Quản lý hệ thống",
        inspectedAt: bb.thoi_gian_kiem_tra,
        totalDeduction: Number(bb.tong_uoc_tinh_khau_tru) || 0,
        status: bb.trang_thai,
        items: (bb.chi_tiet_kiem_tra || []).map(cc => ({
          id: cc.ma_chi_tiet_kiem_tra,
          assetName: cc.ten_tai_san,
          condition: cc.tinh_trang,
          compensation: Number(cc.so_tien_boi_thuong) || 0
        }))
      };
    }

    return {
      id: data.ma_yeu_cau_tra_phong,
      contractId: hd?.ma_hop_dong,
      contractIdDisplay: `HD-${hd?.ma_hop_dong || ''}`,
      customerName: hd?.ho_so?.ho_ten || '',
      customerPhone: hd?.ho_so?.so_dien_thoai || '',
      roomDisplay,
      bedDisplay,
      floor,
      moveInDate: hd?.ngay_vao_o,
      contractEndDate,
      checkoutDate: data.ngay_yeu_cau_tra_phong,
      handoverTime: data.gio_ban_giao,
      reason: data.ly_do,
      checkoutStatus: data.trang_thai,
      inspectionStatus: inspectionObj ? "DA_KIEM_TRA" : "CHUA_KIEM_TRA",
      inspection: inspectionObj,
      roomAssets,
      deposit: Number(hd?.so_tien_dat_coc_bao_dam) || 0,
    };
  },

  async createInspection(payload) {
    const { data: yctp } = await supabase.from('yeu_cau_tra_phong').select('*').eq('ma_yeu_cau_tra_phong', payload.checkoutRequestId).single();
    if (!yctp) throw new Error("Yêu cầu trả phòng không tồn tại");

    const totalDeduction = payload.totalDeduction || payload.items.reduce((sum, i) => sum + (Number(i.compensation) || 0), 0);

    // 1. Lưu biên bản
    const { data: bbkt, error: errBbkt } = await supabase.from('bien_ban_kiem_tra').insert({
      ma_yeu_cau_tra_phong: payload.checkoutRequestId,
      ma_hop_dong: yctp.ma_hop_dong,
      ma_ho_so_nguoi_kiem_tra: payload.inspectorProfileId || 1,
      tong_uoc_tinh_khau_tru: totalDeduction,
      trang_thai: 'DA_KIEM_TRA'
    }).select().single();

    if (errBbkt) throw errBbkt;

    // 2. Chi tiết
    const chiTietArr = (payload.items || [])
      .filter(it => it.assetName && it.assetName.trim())
      .map(it => ({
        ma_bien_ban_kiem_tra: bbkt.ma_bien_ban_kiem_tra,
        ten_tai_san: it.assetName,
        tinh_trang: it.condition,
        so_tien_boi_thuong: Number(it.compensation) || 0,
        ...(it.assetId ? { ma_tai_san_phong: it.assetId } : {})
      }));

    if (chiTietArr.length > 0) {
      await supabase.from('chi_tiet_kiem_tra').insert(chiTietArr);
    }

    // 3. Cập nhật yêu cầu trả phòng
    await supabase.from('yeu_cau_tra_phong').update({ trang_thai: 'DA_KIEM_TRA' }).eq('ma_yeu_cau_tra_phong', payload.checkoutRequestId);

    return bbkt;
  },

  // ============================================
  // LIQUIDATIONS
  // ============================================
  async getLiquidations(filters = {}) {
    let query = supabase.from("yeu_cau_tra_phong").select(`
      ma_yeu_cau_tra_phong,
      trang_thai,
      ngay_yeu_cau_tra_phong,
      hop_dong (
        ma_hop_dong,
        so_tien_dat_coc_bao_dam,
        loai_muc_tieu,
        ho_so:ma_ho_so_khach_hang ( ho_ten, so_dien_thoai ),
        phong ( ma_phong_hien_thi, tang(ten_tang, so_tang) ),
        giuong ( ma_giuong_hien_thi, nhan_giuong, phong(ma_phong_hien_thi, tang(ten_tang, so_tang)) ),
        phan_bo_hop_dong ( ngay_ket_thuc, trang_thai )
      ),
      bien_ban_kiem_tra ( tong_uoc_tinh_khau_tru )
    `, { count: 'exact' });

    const { data, count } = await query;
    const contractIds = [...new Set((data || []).map((y) => y.hop_dong?.ma_hop_dong).filter(Boolean))];
    const reconciliationByContract = await getLatestByContract(
      "doi_soat_tai_chinh",
      contractIds,
      "ma_doi_soat, ma_hop_dong, so_tien_dat_coc_ban_dau, so_tien_hoan_lai, so_tien_can_thanh_toan_them, trang_thai, created_at"
    );

    let formatData = (data || []).map(y => {
      const hd = y.hop_dong;
      const { roomDisplay, bedDisplay, floor } = resolveRoomInfo(hd);
      const reconciliation = reconciliationByContract[hd?.ma_hop_dong] || null;

      // End date
      const activeAlloc = hd?.phan_bo_hop_dong?.find(a => ACTIVE_CONTRACT_STATUSES.includes(a.trang_thai));
      const contractEndDate = activeAlloc?.ngay_ket_thuc || y.ngay_yeu_cau_tra_phong;

      // Financial
      const deposit = toNumber(reconciliation?.so_tien_dat_coc_ban_dau || hd?.so_tien_dat_coc_bao_dam);
      const inspectionDeduction = toNumber(y.bien_ban_kiem_tra?.[0]?.tong_uoc_tinh_khau_tru);
      const estimatedRefund = toNumber(reconciliation?.so_tien_hoan_lai || Math.max(0, deposit - inspectionDeduction));

      // Status logic
      const inspectionDone = (y.bien_ban_kiem_tra || []).length > 0 || y.trang_thai === 'DA_KIEM_TRA';
      let liquidationStatus = 'CHO_KIEM_TRA';
      if (COMPLETED_CHECKOUT_STATUSES.includes(y.trang_thai)) liquidationStatus = 'HOAN_TAT';
      else if (!inspectionDone) liquidationStatus = 'CHO_KIEM_TRA';
      else if (!reconciliation) liquidationStatus = 'CHO_DOI_SOAT';
      else if (reconciliation.trang_thai === 'DA_CHOT') liquidationStatus = 'CHO_THANH_LY';
      else liquidationStatus = 'DANG_DOI_SOAT';

      return {
        id: y.ma_yeu_cau_tra_phong,
        contractId: `HD-${hd?.ma_hop_dong || ''}`,
        contractIdRaw: hd?.ma_hop_dong,
        customerName: hd?.ho_so?.ho_ten || '',
        avatarInitials: getInitials(hd?.ho_so?.ho_ten),
        phone: hd?.ho_so?.so_dien_thoai || '',
        roomDisplay,
        bedDisplay,
        floor,
        contractEndDate,
        inspectionStatus: inspectionDone ? 'DA_KIEM_TRA' : 'CHO_KIEM_TRA',
        liquidationStatus,
        reconciliationId: reconciliation?.ma_doi_soat || null,
        reconciliationStatus: reconciliation?.trang_thai || null,
        depositAmount: deposit,
        inspectionDeduction,
        estimatedRefund,
      };
    });

    if (filters.status && filters.status !== "all") formatData = formatData.filter(d => d.liquidationStatus === filters.status);
    if (filters.floor && filters.floor !== "all") formatData = formatData.filter(d => d.floor === filters.floor);
    if (filters.search) {
      formatData = formatData.filter(d =>
        d.customerName?.toLowerCase().includes(filters.search.toLowerCase()) ||
        d.contractId?.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    return { items: formatData, total: count || 0 };
  },

  async getLiquidationDetail(id) {
    const { data } = await supabase
      .from("yeu_cau_tra_phong")
      .select(`
        *,
        hop_dong (
          *,
          ho_so:ma_ho_so_khach_hang (ho_ten, so_dien_thoai, so_cccd, ngan_hang_ten, ngan_hang_so_tai_khoan, ngan_hang_chu_tai_khoan),
          phong ( ma_phong_hien_thi, loai_phong, tang(ten_tang, so_tang), toa(ten) ),
          giuong ( ma_giuong_hien_thi, nhan_giuong, phong(ma_phong_hien_thi, loai_phong, tang(ten_tang, so_tang), toa(ten)) ),
          phan_bo_hop_dong ( ngay_bat_dau, ngay_ket_thuc, trang_thai )
        ),
        bien_ban_kiem_tra (
          tong_uoc_tinh_khau_tru, trang_thai, thoi_gian_kiem_tra,
          chi_tiet_kiem_tra (*)
        )
      `)
      .eq("ma_yeu_cau_tra_phong", id)
      .maybeSingle();

    if (!data) return null;

    const hd = data.hop_dong;
    const ho = hd?.ho_so || {};
    const { roomDisplay, bedDisplay, floor, roomObj } = resolveRoomInfo(hd);
    const reconciliationByContract = await getLatestByContract(
      "doi_soat_tai_chinh",
      hd?.ma_hop_dong ? [hd.ma_hop_dong] : [],
      "ma_doi_soat, ma_hop_dong, so_tien_dat_coc_ban_dau, so_tien_hoan_lai, so_tien_can_thanh_toan_them, trang_thai, created_at"
    );
    const reconciliation = reconciliationByContract[hd?.ma_hop_dong] || null;

    const activeAlloc = hd?.phan_bo_hop_dong?.find(a => ACTIVE_CONTRACT_STATUSES.includes(a.trang_thai));
    const contractStartDate = hd?.ngay_vao_o || activeAlloc?.ngay_bat_dau;
    const contractEndDate = activeAlloc?.ngay_ket_thuc || data.ngay_yeu_cau_tra_phong;

    let totalDeposit = toNumber(reconciliation?.so_tien_dat_coc_ban_dau || hd?.so_tien_dat_coc_bao_dam);
    let inspectionFee = toNumber(data.bien_ban_kiem_tra?.[0]?.tong_uoc_tinh_khau_tru);

    // Check unpaid invoices
    let unpaidAmount = 0;
    if (hd?.ma_hop_dong) {
      const { data: invoices } = await supabase
        .from('hoa_don')
        .select('tong_so_tien, so_tien_da_thanh_toan')
        .eq('ma_hop_dong', hd.ma_hop_dong)
        .eq('trang_thai', 'CHO_THANH_TOAN');
      unpaidAmount = (invoices || []).reduce((s, inv) => s + (Number(inv.tong_so_tien) - Number(inv.so_tien_da_thanh_toan)), 0);
    }

    let finalRefundAmount = reconciliation
      ? toNumber(reconciliation.so_tien_hoan_lai)
      : totalDeposit - inspectionFee - unpaidAmount;
    let additionalPaymentAmount = reconciliation
      ? toNumber(reconciliation.so_tien_can_thanh_toan_them)
      : 0;
    if (!reconciliation && finalRefundAmount < 0) {
      additionalPaymentAmount = Math.abs(finalRefundAmount);
      finalRefundAmount = 0;
    }

    // Inspection details
    const bb = data.bien_ban_kiem_tra?.[0];
    const inspectionItems = bb?.chi_tiet_kiem_tra?.map(cc => ({
      id: cc.ma_chi_tiet_kiem_tra,
      assetName: cc.ten_tai_san,
      condition: cc.tinh_trang,
      compensation: Number(cc.so_tien_boi_thuong) || 0,
    })) || [];

    // Determine liquidation process status
    const auditDone = !!bb;
    const inspectionDone = !!bb || data.trang_thai === 'DA_KIEM_TRA' || COMPLETED_CHECKOUT_STATUSES.includes(data.trang_thai);
    const financialDone = reconciliation?.trang_thai === 'DA_CHOT';
    const liquidationReady = inspectionDone && financialDone && !COMPLETED_CHECKOUT_STATUSES.includes(data.trang_thai);

    return {
      id: data.ma_yeu_cau_tra_phong,
      contractId: hd?.ma_hop_dong,
      contractIdDisplay: `HD-${hd?.ma_hop_dong || ''}`,
      customerName: ho.ho_ten || '',
      customerPhone: ho.so_dien_thoai || '',
      customerCccd: ho.so_cccd || '',
      roomDisplay,
      bedDisplay,
      roomType: roomObj?.loai_phong || '',
      floor,
      building: roomObj?.toa?.ten || '',
      contractStartDate,
      contractEndDate,
      checkoutStatus: data.trang_thai,
      contractStatus: normalizeContractStatus(hd?.trang_thai),
      reconciliationId: reconciliation?.ma_doi_soat || null,
      reconciliationStatus: reconciliation?.trang_thai || null,
      liquidationReady,
      // Financial
      depositAmount: totalDeposit,
      unpaidAmount,
      inspectionDeduction: inspectionFee,
      finalRefundAmount,
      additionalPaymentAmount,
      // Process steps
      auditDone,
      inspectionDone,
      financialDone,
      // Inspection items
      inspectionItems,
      // Bank info for refund
      bankName: ho.ngan_hang_ten || '',
      bankAccount: ho.ngan_hang_so_tai_khoan || '',
      bankAccountHolder: ho.ngan_hang_chu_tai_khoan || '',
    };
  },

  async performLiquidation(id, payload) {
    const { data: yctp, error: requestError } = await supabase
      .from('yeu_cau_tra_phong')
      .select(`
        ma_yeu_cau_tra_phong,
        ma_hop_dong,
        ngay_yeu_cau_tra_phong,
        trang_thai,
        hop_dong (
          ma_hop_dong,
          loai_muc_tieu,
          ma_phong,
          ma_giuong,
          trang_thai,
          giuong ( ma_giuong, ma_phong )
        ),
        bien_ban_kiem_tra ( ma_bien_ban_kiem_tra )
      `)
      .eq('ma_yeu_cau_tra_phong', id)
      .maybeSingle();

    if (requestError) throw requestError;
    if (!yctp) throw new AppError("Yêu cầu thanh lý không tồn tại", 404);
    if (COMPLETED_CHECKOUT_STATUSES.includes(yctp.trang_thai)) {
      throw new AppError("Yêu cầu này đã hoàn tất thanh lý", 409);
    }
    if (!yctp.bien_ban_kiem_tra?.length) {
      throw new AppError("Cần hoàn tất biên bản kiểm tra trước khi thanh lý", 409);
    }

    const reconciliationByContract = await getLatestByContract(
      "doi_soat_tai_chinh",
      [yctp.ma_hop_dong],
      "ma_doi_soat, ma_hop_dong, so_tien_hoan_lai, so_tien_can_thanh_toan_them, trang_thai, created_at"
    );
    const reconciliation = reconciliationByContract[yctp.ma_hop_dong] || null;
    if (!reconciliation) {
      throw new AppError("Chưa có đối soát kế toán cho hợp đồng này", 409);
    }
    if (reconciliation.trang_thai !== "DA_CHOT") {
      throw new AppError("Đối soát kế toán chưa được chốt", 409);
    }

    const contract = yctp.hop_dong;
    const roomId = contract?.ma_phong || contract?.giuong?.ma_phong || null;
    const bedId = contract?.ma_giuong || null;

    const { error: contractError } = await supabase
      .from('hop_dong')
      .update({ trang_thai: 'HET_HAN' })
      .eq('ma_hop_dong', yctp.ma_hop_dong);
    if (contractError) throw contractError;

    await supabase
      .from('phan_bo_hop_dong')
      .update({
        trang_thai: 'HET_HAN',
        ngay_ket_thuc: payload?.ngay_ket_thuc || yctp.ngay_yeu_cau_tra_phong || new Date().toISOString().slice(0, 10),
      })
      .eq('ma_hop_dong', yctp.ma_hop_dong)
      .in('trang_thai', ACTIVE_CONTRACT_STATUSES);

    if (contract?.loai_muc_tieu === 'GIUONG' && bedId) {
      const { error: bedError } = await supabase
        .from('giuong')
        .update({ trang_thai: 'TRONG' })
        .eq('ma_giuong', bedId);
      if (bedError) throw bedError;
      await refreshRoomAvailabilityStatus(roomId);
    } else if (roomId) {
      const { error: bedsError } = await supabase
        .from('giuong')
        .update({ trang_thai: 'TRONG' })
        .eq('ma_phong', roomId);
      if (bedsError) throw bedsError;

      const { error: roomError } = await supabase
        .from('phong')
        .update({ trang_thai: 'TRONG' })
        .eq('ma_phong', roomId);
      if (roomError) throw roomError;
    }

    const { error: checkoutError } = await supabase
      .from('yeu_cau_tra_phong')
      .update({ trang_thai: 'HOAN_TAT' })
      .eq('ma_yeu_cau_tra_phong', id);
    if (checkoutError) throw checkoutError;

    return {
      checkoutRequestId: yctp.ma_yeu_cau_tra_phong,
      contractId: yctp.ma_hop_dong,
      reconciliationId: reconciliation.ma_doi_soat,
      refundAmount: toNumber(reconciliation.so_tien_hoan_lai),
      additionalPaymentAmount: toNumber(reconciliation.so_tien_can_thanh_toan_them),
      roomId,
      bedId,
      contractStatus: 'HET_HAN',
      checkoutStatus: 'HOAN_TAT',
    };
  },

  // ============================================
  // ROOMS OVERVIEW
  // ============================================
  async getRoomsOverview(filters = {}) {
    let query = supabase.from("phong").select(`
      *,
      tang ( ten_tang, so_tang ),
      toa ( ten ),
      giuong (ma_giuong, ma_giuong_hien_thi, trang_thai, nhan_giuong, gia_thang)
    `, { count: 'exact' });

    if (filters.roomType && filters.roomType !== "all") query = query.eq('loai_phong', filters.roomType);

    const { data, count } = await query;
    const roomIds = (data || []).map((p) => p.ma_phong);
    const bedIds = (data || []).flatMap((p) => (p.giuong || []).map((g) => g.ma_giuong));
    let tenantByBed = {};
    let tenantByRoom = {};

    if (roomIds.length || bedIds.length) {
      const { data: contracts, error: contractError } = await supabase
        .from('hop_dong')
        .select(`
          ma_hop_dong,
          loai_muc_tieu,
          ma_phong,
          ma_giuong,
          ho_so:ma_ho_so_khach_hang ( ho_ten )
        `)
        .in('trang_thai', ACTIVE_CONTRACT_STATUSES);

      if (contractError) throw contractError;

      (contracts || []).forEach((contract) => {
        const tenant = contract.ho_so?.ho_ten || null;
        if (contract.ma_giuong && bedIds.includes(contract.ma_giuong)) {
          tenantByBed[contract.ma_giuong] = tenant;
        }
        if (contract.ma_phong && roomIds.includes(contract.ma_phong)) {
          tenantByRoom[contract.ma_phong] = tenant;
        }
      });
    }

    let formatData = (data || []).map(p => {
      const beds = p.giuong || [];
      const mappedBeds = beds.map(g => ({
        id: g.ma_giuong,
        display: g.nhan_giuong || g.ma_giuong_hien_thi || `Giường ${g.ma_giuong}`,
        status: normalizeBedStatus(g.trang_thai),
        tenant: tenantByBed[g.ma_giuong] || null,
        price: toNumber(g.gia_thang)
      }));
      const occupied = mappedBeds.filter(g => g.status === 'DA_THUE').length;
      const reserved = 0;
      const empty = mappedBeds.filter(g => g.status === 'TRONG').length;
      const total = beds.length;
      const capacity = Number(p.suc_chua) || total || 1;
      const hasRoomTenant = !!tenantByRoom[p.ma_phong];
      const occupiedCount = total > 0 ? occupied : (hasRoomTenant ? capacity : 0);
      const status = total > 0 ? normalizeRoomStatus(p.trang_thai, beds, capacity) : (hasRoomTenant ? "DAY" : normalizeRoomStatus(p.trang_thai, beds, capacity));

      return {
        id: p.ma_phong,
        displayId: `P.${p.ma_phong_hien_thi}`,
        floor: p.tang?.ten_tang || '',
        floorValue: p.tang?.so_tang?.toString() || p.tang?.ten_tang || '',
        floorLabel: p.tang?.ten_tang || '',
        roomType: String(p.loai_phong || '').trim(),
        roomTypeLabel: String(p.loai_phong || '').trim(),
        gender: p.gioi_tinh || 'Nam/Nữ',
        status,
        capacity,
        occupiedCount,
        reservedCount: reserved,
        price: Number(p.gia_thang) || 0,
        holdRequests: reserved,
        occupancyRate: Math.round((occupiedCount / Math.max(capacity, 1)) * 100) + '%',
        bedsText: total > 0 ? `${occupiedCount} đã thuê, ${empty} trống` : (hasRoomTenant ? "Đang thuê nguyên phòng" : "Phòng trống"),
        tenant: tenantByRoom[p.ma_phong] || null,
        beds: mappedBeds
      };
    });

    // Client-side filters
    if (filters.status && filters.status !== "all") formatData = formatData.filter(d => d.status === filters.status);
    if (filters.floor && filters.floor !== "all") formatData = formatData.filter(d => d.floorValue === filters.floor || d.floor === filters.floor);
    if (filters.gender && filters.gender !== "all") formatData = formatData.filter(d => d.gender === filters.gender);
    if (filters.search) {
      const q = filters.search.toLowerCase();
      formatData = formatData.filter(d => d.displayId.toLowerCase().includes(q));
    }

    let stats = {
      total: count || 0,
      occupied: formatData.filter(r => r.status === 'SAP_DAY' || r.status === 'DAY' || r.occupiedCount > 0).length,
      reserved: formatData.filter(r => r.reservedCount > 0).length,
      empty: formatData.filter(r => r.status === 'TRONG').length,
      maintenance: 0,
    };

    return { items: formatData, total: count || 0, stats };
  },

  async updateRoomStatus(roomId, statusData) {
    if (!["TRONG", "SAP_DAY", "DAY"].includes(statusData.status)) {
      throw new AppError("Trạng thái phòng không hợp lệ", 400);
    }
    const { error } = await supabase.from('phong').update({ trang_thai: statusData.status }).eq('ma_phong', roomId);
    if (error) throw error;
    return true;
  },

  async updateBedStatus(roomId, bedId, statusData) {
    if (!["TRONG", "DA_THUE"].includes(statusData.status)) {
      throw new AppError("Trạng thái giường không hợp lệ", 400);
    }
    const { error } = await supabase.from('giuong').update({ trang_thai: statusData.status }).eq('ma_giuong', bedId).eq('ma_phong', roomId);
    if (error) throw error;
    const roomStatus = await refreshRoomAvailabilityStatus(roomId);
    return { success: true, roomStatus };
  }
};

module.exports = ManagerModel;
