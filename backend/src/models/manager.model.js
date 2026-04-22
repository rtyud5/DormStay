const { supabase } = require("../config/supabase");
const Shared = require("./accounting/shared");

// Helper (có thể tách ra utils)
const getInitials = (name) => {
  if (!name) return "";
  return name.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join("");
};

const ManagerModel = {
  // ============================================
  // DASHBOARD
  // ============================================
  async getDashboardKPI() {
    // 1. Lọc phòng đang ở (status = DANG_O) 
    // Do cấu trúc raw data hiện tại chỉ có các phòng trạng thái "SẮP ĐẦY", "ĐÃ ĐẦY", "TRỐNG"
    // nhưng ta cứ đếm tổng số phòng/giường.
    const { count: totalRooms } = await supabase.from('phong').select('*', { count: 'exact', head: true });
    
    // Đang ở = Số hợp đồng hiệu lực
    const { count: activeContracts } = await supabase.from('hop_dong').select('*', { count: 'exact', head: true }).eq('trang_thai', 'HIEU_LUC');

    const { count: emptyRooms } = await supabase.from('phong').select('*', { count: 'exact', head: true }).eq('trang_thai', 'TRONG');

    // Chờ checkout
    const { count: checkoutRequests } = await supabase.from('yeu_cau_tra_phong').select('*', { count: 'exact', head: true }).eq('trang_thai', 'CHO_XU_LY');

    // Sắp hết hạn (<= 30 ngày) -> Hợp đồng cần phân bổ? Hoặc kết thúc trong ngày_ket_thuc.
    // Lấy phan_bo_hop_dong
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    const { count: expiringContracts } = await supabase
      .from('phan_bo_hop_dong')
      .select('*', { count: 'exact', head: true })
      .eq('trang_thai', 'HIEU_LUC')
      .lte('ngay_ket_thuc', thirtyDaysFromNow.toISOString());

    return {
      totalRooms: totalRooms || 0,
      occupiedRooms: activeContracts || 0, // Tạm dùng số hợp đồng thay cho bed occupied (có thể update sau nếu cần chính xác bed)
      emptyRooms: emptyRooms || 0,
      checkoutRequests: checkoutRequests || 0,
      expiringContracts: expiringContracts || 0
    };
  },

  async getRecentCheckoutRequests() {
    const { data } = await supabase
      .from('yeu_cau_tra_phong')
      .select(`
        ma_yeu_cau_tra_phong,
        ngay_yeu_cau_tra_phong,
        trang_thai,
        hop_dong (
          ma_hop_dong,
          ho_so ( ho_ten ),
          phong ( ma_phong_hien_thi )
        )
      `)
      .in('trang_thai', ['CHO_XU_LY', 'DANG_KIEM_TRA'])
      .order('created_at', { ascending: false })
      .limit(5);

    return (data || []).map((req) => ({
      id: req.ma_yeu_cau_tra_phong,
      customerName: req.hop_dong?.ho_so?.ho_ten || 'N/A',
      roomDisplay: `Phòng ${req.hop_dong?.phong?.ma_phong_hien_thi || ''}`,
      requestDate: req.ngay_yeu_cau_tra_phong,
      checkoutStatus: req.trang_thai,
    }));
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
        loai_muc_tieu,
        ho_so!inner (
          ma_ho_so, ho_ten, so_dien_thoai
        ),
        phong ( ma_phong_hien_thi, tang ( ten_tang ) ),
        giuong ( ma_giuong_hien_thi ),
        phan_bo_hop_dong (
          ma_giuong,
          giuong ( ma_giuong_hien_thi ),
          trang_thai
        )
      `, { count: 'exact' })
      .eq("trang_thai", "HIEU_LUC");

    if (filters.floor && filters.floor !== "all") {
      query = query.eq('phong.tang.ten_tang', filters.floor);
    }
    if (filters.rentalType && filters.rentalType !== "all") {
      query = query.eq('loai_muc_tieu', filters.rentalType === "PHONG" ? "PHONG" : "GIUONG");
    }
    if (filters.search) {
      query = query.ilike('ho_so.ho_ten', `%${filters.search}%`);
    }

    const { data, count, error } = await query;
    if (error) console.error("getResidents error", error);

    const formatData = (data || []).map((h) => {
      let roomDisplay = "";
      // Multi-bed: check phan_bo_hop_dong first, fallback to legacy giuong
      const allocations = h.phan_bo_hop_dong || [];
      if (h.loai_muc_tieu === 'PHONG') {
        roomDisplay = `Phòng ${h.phong?.ma_phong_hien_thi || ''}`;
      } else if (allocations.length > 1) {
        // Multi-bed display
        const bedCodes = allocations.map(a => a.giuong?.ma_giuong_hien_thi || `B${a.ma_giuong}`).join(', ');
        roomDisplay = `${bedCodes} - P.${h.phong?.ma_phong_hien_thi || ''}`;
      } else {
        roomDisplay = `Giường ${h.giuong?.ma_giuong_hien_thi || ''} - P.${h.phong?.ma_phong_hien_thi || ''}`;
      }

      return {
        id: h.ma_hop_dong,
        customerName: h.ho_so?.ho_ten || '',
        avatarInitials: getInitials(h.ho_so?.ho_ten),
        roomDisplay,
        floor: h.phong?.tang?.ten_tang || '',
        rentalType: h.loai_muc_tieu,
        moveInDate: h.ngay_vao_o,
        phone: h.ho_so?.so_dien_thoai || '',
        status: h.trang_thai
      };
    });

    // Lọc thủ công nếu có điều kiện lồng nhau không hoạt động với nested supabase filter
    let finalData = formatData;
    if (filters.floor && filters.floor !== "all") finalData = finalData.filter(d => d.floor === filters.floor);

    return { items: finalData, total: count || 0 };
  },

  async getResidentDetail(contractId) {
    const { data } = await supabase
      .from("hop_dong")
      .select(`
        *,
        ho_so (*),
        phong (ma_phong_hien_thi, loai_phong, tong_giuong:giuong(count)),
        giuong (ma_giuong_hien_thi)
      `)
      .eq("ma_hop_dong", contractId)
      .maybeSingle();

    if (!data) return null;

    return {
      id: data.ma_hop_dong,
      customerName: data.ho_so?.ho_ten,
      phone: data.ho_so?.so_dien_thoai,
      cccd: data.ho_so?.so_cccd,
      baseRent: data.gia_thue_co_ban_thang,
      deposit: data.so_tien_dat_coc_bao_dam,
      moveInDate: data.ngay_vao_o,
      emergencyContact: {
        name: data.ho_so?.lien_he_khan_cap_ho_ten,
        phone: data.ho_so?.lien_he_khan_cap_sdt,
        relation: data.ho_so?.lien_he_khan_cap_moi_quan_he
      }
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
      hop_dong!inner (
        ma_hop_dong,
        ho_so ( ho_ten ),
        phong ( ma_phong_hien_thi, tang(ten_tang) ),
        giuong ( ma_giuong_hien_thi )
      )
    `, { count: 'exact' });

    if (filters.status && filters.status !== "all") query = query.eq('trang_thai', filters.status);

    const { data, count } = await query;
    let formatData = (data || []).map(y => {
      let roomDisplay = y.hop_dong?.phong ? `Phòng ${y.hop_dong.phong.ma_phong_hien_thi}` : '';
      if(y.hop_dong?.giuong) roomDisplay = `Giường ${y.hop_dong.giuong.ma_giuong_hien_thi} - ${roomDisplay}`;

      return {
        id: y.ma_yeu_cau_tra_phong,
        contractId: `HD-${y.hop_dong?.ma_hop_dong}`,
        customerName: y.hop_dong?.ho_so?.ho_ten,
        roomDisplay,
        floor: y.hop_dong?.phong?.tang?.ten_tang,
        requestDate: y.ngay_yeu_cau_tra_phong,
        reason: y.ly_do,
        checkoutStatus: y.trang_thai
      };
    });

    if (filters.floor && filters.floor !== "all") formatData = formatData.filter(d => d.floor === filters.floor);
    if (filters.search) {
        formatData = formatData.filter(d => d.customerName?.toLowerCase().includes(filters.search.toLowerCase()) || d.contractId?.toLowerCase().includes(filters.search.toLowerCase()));
    }

    return { items: formatData, total: count || 0 };
  },

  async getInspectionDetail(id) {
    const { data } = await supabase
      .from("yeu_cau_tra_phong")
      .select(`
        *,
        hop_dong ( 
            ma_hop_dong, 
            gia_thue_co_ban_thang,
            so_tien_dat_coc_bao_dam,
            ho_so (ho_ten) 
        ),
        bien_ban_kiem_tra (
            ma_bien_ban_kiem_tra, thoi_gian_kiem_tra, tong_uoc_tinh_khau_tru, trang_thai, ho_so (ho_ten),
            chi_tiet_kiem_tra (*)
        )
      `)
      .eq("ma_yeu_cau_tra_phong", id)
      .maybeSingle();

    if (!data) return null;

    let inspectionObj = null;
    if (data.bien_ban_kiem_tra && data.bien_ban_kiem_tra.length > 0) {
        let bb = data.bien_ban_kiem_tra[0];
        inspectionObj = {
            id: `BBKT-${bb.ma_bien_ban_kiem_tra}`,
            inspectedBy: bb.ho_so?.ho_ten || "Quản lý hệ thống",
            inspectedAt: bb.thoi_gian_kiem_tra,
            totalDeduction: bb.tong_uoc_tinh_khau_tru,
            items: (bb.chi_tiet_kiem_tra || []).map(cc => ({
                id: cc.ma_chi_tiet_kiem_tra,
                assetName: cc.ten_tai_san,
                condition: cc.tinh_trang,
                compensation: cc.so_tien_boi_thuong
            }))
        }
    }

    return {
        id: data.ma_yeu_cau_tra_phong,
        contractId: data.ma_hop_dong,
        customerName: data.hop_dong?.ho_so?.ho_ten,
        checkoutStatus: data.trang_thai,
        inspectionStatus: inspectionObj ? "DA_KIEM_TRA" : "CHUA_KIEM_TRA",
        inspection: inspectionObj
    };
  },

  async createInspection(payload) {
    // payload: { checkoutRequestId, items: [{assetName, condition, compensation}], totalDeduction }
    const { data: yctp } = await supabase.from('yeu_cau_tra_phong').select('*').eq('ma_yeu_cau_tra_phong', payload.checkoutRequestId).single();
    if (!yctp) throw new Error("Yêu cầu trả phòng không tồn tại");

    // 1. Lưu biên bản
    const { data: bbkt, error: errBbkt } = await supabase.from('bien_ban_kiem_tra').insert({
        ma_yeu_cau_tra_phong: payload.checkoutRequestId,
        ma_hop_dong: yctp.ma_hop_dong,
        ma_ho_so_nguoi_kiem_tra: 1, // Fix temporary
        tong_uoc_tinh_khau_tru: payload.totalDeduction || payload.items.reduce((sum, i) => sum + i.compensation, 0),
        trang_thai: 'DA_KIEM_TRA'
    }).select().single();

    if (errBbkt) throw errBbkt;

    // 2. Chi tiết
    const chiTietArr = payload.items.map(it => ({
        ma_bien_ban_kiem_tra: bbkt.ma_bien_ban_kiem_tra,
        ten_tai_san: it.assetName,
        tinh_trang: it.condition,
        so_tien_boi_thuong: it.compensation
    }));

    if (chiTietArr.length > 0) {
        await supabase.from('chi_tiet_kiem_tra').insert(chiTietArr);
    }

    // 3. Cập nhật yêu cầu
    await supabase.from('yeu_cau_tra_phong').update({trang_thai: 'DA_KIEM_TRA'}).eq('ma_yeu_cau_tra_phong', payload.checkoutRequestId);

    return bbkt;
  },

  // ============================================
  // LIQUIDATIONS
  // ============================================
  async getLiquidations(filters = {}) {
    // Lấy HD có YCTP
    let query = supabase.from("yeu_cau_tra_phong").select(`
        ma_yeu_cau_tra_phong,
        trang_thai,
        hop_dong!inner (
          ma_hop_dong, 
          so_tien_dat_coc_bao_dam,
          ho_so ( ho_ten ),
          phong ( ma_phong_hien_thi, tang(ten_tang) ),
          giuong ( ma_giuong_hien_thi ),
          doi_soat_tai_chinh ( trang_thai, * )
        )
      `, { count: 'exact' }).neq('trang_thai', 'CHO_XU_LY'); // Có thể lấy DA_KIEM_TRA hoặc HOAN_TAT

      const { data, count } = await query;
      let formatData = (data || []).map(y => {
        let roomDisplay = y.hop_dong?.phong ? `Phòng ${y.hop_dong.phong.ma_phong_hien_thi}` : '';
        if(y.hop_dong?.giuong) roomDisplay = `Giường ${y.hop_dong.giuong.ma_giuong_hien_thi} - ${roomDisplay}`;
  
        let ds = y.hop_dong?.doi_soat_tai_chinh?.[0]; // Giả sử 1 HD 1 đối soát
        
        // Mocked logic for inspection status based on checkoutStatus
        let dStatus = ds ? ds.trang_thai : "CHO_CHOT";
        if (y.trang_thai === 'DA_KIEM_TRA') dStatus = 'DANG_DOI_SOAT';
  
        return {
          id: ds ? ds.ma_doi_soat : y.ma_yeu_cau_tra_phong,
          contractId: `HD-${y.hop_dong?.ma_hop_dong}`,
          customerName: y.hop_dong?.ho_so?.ho_ten,
          roomDisplay,
          floor: y.hop_dong?.phong?.tang?.ten_tang,
          liquidationStatus: dStatus,
          inspectionStatus: y.trang_thai, // e.g. DA_KIEM_TRA
        };
      });

      if (filters.status && filters.status !== "all") formatData = formatData.filter(d => d.liquidationStatus === filters.status);
      if (filters.floor && filters.floor !== "all") formatData = formatData.filter(d => d.floor === filters.floor);
      if (filters.search) {
          formatData = formatData.filter(d => d.customerName?.toLowerCase().includes(filters.search.toLowerCase()) || d.contractId?.toLowerCase().includes(filters.search.toLowerCase()));
      }
  
      return { items: formatData, total: count || 0 };
  },

  async getLiquidationDetail(id) {
    // Fallback: the ID passed might be YCTP id if doi_soat isn't created yet
    // we query by yctp or you can refine your IDs.
    const { data } = await supabase
      .from("yeu_cau_tra_phong")
      .select(`
        *,
        hop_dong (
            *,
            ho_so (ho_ten, so_dien_thoai),
            doi_soat_tai_chinh (*, chi_tiet_doi_soat_tai_chinh (*))
        ),
        bien_ban_kiem_tra (
            tong_uoc_tinh_khau_tru, chi_tiet_kiem_tra (*)
        )
      `)
      .eq("ma_yeu_cau_tra_phong", id)
      .maybeSingle();

    if (!data) return null;

    let totalDeposit = data.hop_dong?.so_tien_dat_coc_bao_dam || 0;
    let inspectionFee = data.bien_ban_kiem_tra?.[0]?.tong_uoc_tinh_khau_tru || 0;
    let unpaidInvoices = 0; // Tính thêm nếu cần (từ hoa_don)

    let finalRefundAmount = totalDeposit - inspectionFee - unpaidInvoices;
    if (finalRefundAmount < 0) finalRefundAmount = 0;

    let additionalPaymentAmount = (totalDeposit - inspectionFee - unpaidInvoices < 0) ? Math.abs(totalDeposit - inspectionFee - unpaidInvoices) : 0;

    return {
        id: data.ma_yeu_cau_tra_phong,
        contractId: data.ma_hop_dong,
        customerName: data.hop_dong?.ho_so?.ho_ten,
        liquidationStatus: data.hop_dong?.doi_soat_tai_chinh?.[0]?.trang_thai || "DANG_DOI_SOAT",
        deductionFee: inspectionFee,
        unpaidFee: unpaidInvoices,
        depositAmount: totalDeposit,
        finalRefundAmount,
        additionalPaymentAmount,
        inspectionItems: data.bien_ban_kiem_tra?.[0]?.chi_tiet_kiem_tra || []
    };
  },

  async performLiquidation(id, payload) {
    // id là ma_yeu_cau_tra_phong
    const { data: yctp } = await supabase.from('yeu_cau_tra_phong').select('ma_hop_dong').eq('ma_yeu_cau_tra_phong', id).single();
    if (!yctp) throw new Error("Yêu cầu không tồn tại");

    let finalRefund = payload.finalRefundAmount;
    let finalAdditional = payload.additionalPaymentAmount;

    const { data: dstc, error } = await supabase.from('doi_soat_tai_chinh').insert({
        ma_hop_dong: yctp.ma_hop_dong,
        so_tien_dat_coc_ban_dau: payload.depositAmount || 0,
        so_tien_hoan_lai: finalRefund,
        so_tien_can_thanh_toan_them: finalAdditional,
        trang_thai: 'DA_CHOT'
    }).select().single();

    if (error) throw error;

    // Chuyển hợp đồng sang Đã Kết Thúc
    await supabase.from('hop_dong').update({trang_thai: 'DA_KET_THUC'}).eq('ma_hop_dong', yctp.ma_hop_dong);

    return dstc;
  },

  // ============================================
  // ROOMS OVERVIEW
  // ============================================
  async getRoomsOverview(filters = {}) {
    let query = supabase.from("phong").select(`
        *,
        tang ( ten_tang ),
        giuong (ma_giuong_hien_thi, trang_thai)
    `, { count: 'exact' });

    if (filters.floor && filters.floor !== "all") query = query.eq('tang.ten_tang', filters.floor);
    if (filters.status && filters.status !== "all") {
        // Map FE status to DB status if needed
        query = query.eq('trang_thai', filters.status === "TRONG" ? "TRONG" : filters.status); 
    }
    if (filters.roomType && filters.roomType !== "all") query = query.eq('loai_phong', filters.roomType);

    const { data, count } = await query;
    let formatData = (data || []).map(p => {
        let occupied = p.giuong?.filter(g => g.trang_thai === 'DA_THUE_HET' || g.trang_thai === 'DA_THUE').length || 0;
        let empty = p.giuong?.filter(g => g.trang_thai === 'CON_TRONG').length || 0;
        let total = p.giuong?.length || 0;

        return {
            id: p.ma_phong,
            displayId: `P.${p.ma_phong_hien_thi}`,
            floor: p.tang?.ten_tang,
            roomType: p.loai_phong,
            gender: p.gioi_tinh || 'Nam/Nữ',
            status: p.trang_thai === 'TRONG' ? 'TRONG' : p.trang_thai,
            occupancyRate: Math.round((occupied / (total || 1)) * 100) + '%',
            bedsText: `${occupied} đã thuê, ${empty} trống`,
            beds: (p.giuong || []).map(g => ({
                id: g.ma_giuong_hien_thi,
                status: g.trang_thai === 'CON_TRONG' ? 'Available' : 'Occupied',
            }))
        };
    });

    if (filters.floor && filters.floor !== "all") formatData = formatData.filter(d => d.floor === filters.floor);

    let stats = {
        total: count,
        occupied: formatData.filter(r => r.status === 'SAP_DAY' || r.status === 'DAY').length,
        reserved: 0, // TODO: Query giu_cho_tam active holds to count reserved beds/rooms
        empty: formatData.filter(r => r.status === 'TRONG').length,
        maintenance: formatData.filter(r => r.status === 'BAO_TRI').length,
    };

    return { items: formatData, total: count || 0, stats };
  },

  async updateRoomStatus(roomId, statusData) {
    const { error } = await supabase.from('phong').update({trang_thai: statusData.status}).eq('ma_phong', roomId);
    if (error) throw error;
    return true;
  },

  async updateBedStatus(roomId, bedId, statusData) {
    const { error } = await supabase.from('giuong').update({trang_thai: statusData.status}).eq('ma_giuong', bedId).eq('ma_phong', roomId);
    if (error) throw error;
    return true;
  }
};

module.exports = ManagerModel;
