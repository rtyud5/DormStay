const { supabase } = require("../config/supabase");

const TABLE_NAME = "phong";

// Helper to format currency
const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
};

const ROOM_STATUS_FILTER_ALIASES = {
  TRONG: ["TRONG", "CON_TRONG"],
  SAP_DAY: ["SAP_DAY"],
  DAY: ["DAY", "DANG_O", "DANG_SU_DUNG", "DA_THUE_HET"],
  BAO_TRI: ["BAO_TRI"],
};

const expandRoomStatusFilters = (statuses = []) => {
  const expanded = statuses.flatMap((status) => {
    const value = String(status || "").toUpperCase();
    return ROOM_STATUS_FILTER_ALIASES[value] || [value];
  });
  return [...new Set(expanded)];
};

/**
 * Fetch active holds for a set of room IDs.
 * Returns a map: { [ma_giuong]: holdRow }
 */
async function getActiveHoldsForRoom(roomId) {
  if (!supabase) return {};

  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("giu_cho_tam")
    .select("ma_giuong, ma_phong, loai_muc_tieu, trang_thai, thoi_gian_het_han")
    .eq("ma_phong", roomId)
    .in("trang_thai", ["DANG_GIU", "DA_XAC_NHAN_COC"])
    .or(`thoi_gian_het_han.is.null,thoi_gian_het_han.gt.${now}`);

  if (error) {
    console.error("Error fetching active holds:", error);
    return {};
  }

  const holdMap = {};
  for (const hold of (data || [])) {
    if (hold.ma_giuong) {
      holdMap[hold.ma_giuong] = hold;
    }
  }
  return holdMap;
}

/**
 * Normalize bed status considering holds.
 * Returns one of: TRONG | DANG_GIU | DA_THUE
 */
function normalizeBedStatus(rawStatus, holdInfo) {
  // Normalize the various DB status strings first
  const s = String(rawStatus || "").toUpperCase();
  if (["DA_THUE", "DANG_O", "DANG_SU_DUNG", "DA_THUE_HET"].includes(s)) {
    return "DA_THUE";
  }
  if (s === "DANG_GIU" || holdInfo) {
    return "DANG_GIU";
  }
  if (["TRONG", "CON_TRONG"].includes(s)) {
    return "TRONG";
  }

  // Default: if unknown, treat as available
  return "TRONG";
}

// Data Mapper Adapter
const mapRoomToFrontendFormat = (raw, holdMap = {}) => {
  const isDorm = raw.loai_phong === 'PHONG_CHUNG';
  const bedList = raw.giuong || [];
  const totalBeds = bedList.length;
  const rawStatus = String(raw.trang_thai || "").toUpperCase();

  // Map beds with hold-aware status
  const mappedBeds = bedList.map(bed => {
    const hold = holdMap[bed.ma_giuong] || null;
    const status = normalizeBedStatus(bed.trang_thai, hold);
    return {
      id: bed.ma_giuong,
      code: bed.ma_giuong_hien_thi,
      label: bed.nhan_giuong,
      price: formatPrice(raw.gia_thang),
      rawPrice: raw.gia_thang,
      status,
    };
  });

  const availableBeds = mappedBeds.filter(b => b.status === 'TRONG').length;
  
  // Status Mapping: derive room level status from bed availability when possible
  let status = "CÒN TRỐNG";
  let statusColor = "text-emerald-700 bg-emerald-100";
  if (rawStatus === "BAO_TRI") {
    status = "Báº£o trĂ¬";
    statusColor = "text-red-700 bg-red-100";
  } else if (availableBeds === 0 && totalBeds > 0) {
    status = "ĐÃ ĐẦY";
    statusColor = "text-red-600 bg-red-100";
  } else if (rawStatus === 'SAP_DAY' || (availableBeds > 0 && availableBeds <= 1 && totalBeds > 1)) {
    status = "SẮP ĐẦY";
    statusColor = "text-orange-600 bg-orange-100";
  } else if (["DAY", "DANG_O", "DA_THUE_HET"].includes(rawStatus)) {
    status = "ĐÃ ĐẦY";
    statusColor = "text-red-600 bg-red-100";
  }

  const canBook = rawStatus !== "BAO_TRI" && !(availableBeds === 0 && totalBeds > 0) && !["DAY", "DANG_O", "DA_THUE_HET"].includes(rawStatus);

  // Cover Image mapping
  let image = "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=600&q=80";
  let gallery = [];
  if (raw.hinh_anh_phong && raw.hinh_anh_phong.length > 0) {
    const cover = raw.hinh_anh_phong.find(img => img.la_anh_bia);
    if (cover) image = cover.duong_dan_cong_khai;
    else image = raw.hinh_anh_phong[0].duong_dan_cong_khai;
    gallery = raw.hinh_anh_phong.map(img => img.duong_dan_cong_khai);
  }

  return {
    id: raw.ma_phong,
    name: `Phòng ${raw.ma_phong_hien_thi}`,
    price: formatPrice(raw.gia_thang),
    rawPrice: raw.gia_thang,
    unit: isDorm ? "/tháng/người" : "/tháng/phòng",
    status,
    statusColor,
    gender : raw.gioi_tinh,
    capacity: isDorm ? `${availableBeds} / ${totalBeds} giường trống` : `${raw.suc_chua || 0} người`,
    floor: raw.tang?.ten_tang || "Tầng 1",
    amenities: raw.tai_san_phong?.map(t => t.ten_tai_san) || ["Điều hòa", "Wifi"],
    image,
    gallery,
    building: raw.toa?.ten || "DormStay",
    bedCount: totalBeds,
    availableBeds,
    beds: mappedBeds,
    canBook,
    type: raw.loai_phong
  };
};

const RoomModel = {
  async list(filters = {}) {
    if (!supabase) return { data: [], total: 0, page: 1, limit: 10 };
    
    // Normalise incoming filter types
    if (filters.status && !Array.isArray(filters.status)) {
      if (typeof filters.status === 'string') {
        filters.status = filters.status.split(',').map(s => s.trim()).filter(Boolean);
      } else if (typeof filters.status === 'object') {
        filters.status = Object.values(filters.status).flat().map(s => (typeof s === 'string' ? s.trim() : s)).filter(Boolean);
      } else {
        filters.status = [filters.status];
      }
    }
    
    // Pagination
    const page = parseInt(filters.page) || 1;
    const limit = parseInt(filters.limit) || 10;
    const offset = (page - 1) * limit;
    
    let selectString = `
        *,
        tang!inner ( ten_tang ),
        toa ( ten ),
        hinh_anh_phong ( duong_dan_cong_khai, la_anh_bia ),
        tai_san_phong ( ten_tai_san ),
        giuong ( ma_giuong, ma_giuong_hien_thi, nhan_giuong, gia_thang, trang_thai )
      `;

    let query = supabase.from(TABLE_NAME).select(selectString, { count: 'exact' });

    if (filters.search) {
      const cleanSearch = filters.search
        .toLowerCase()
        .replace(/phòng|phong/g, '') 
        .trim();                  
      if (cleanSearch) {
            query = query.ilike('ma_phong_hien_thi', `%${cleanSearch}%`);
      }
    }

    if (filters.floor && filters.floor !== 'Tất cả các tầng') {
      query = query.eq('tang.ten_tang', filters.floor);
    }

    if (filters.type) {
      query = query.eq('loai_phong', filters.type);
    }

    if (filters.minPrice) {
      query = query.gte('gia_thang', parseFloat(filters.minPrice));
    }
    if (filters.maxPrice) {
      query = query.lte('gia_thang', parseFloat(filters.maxPrice));
    }

    if (filters.status && Array.isArray(filters.status) && filters.status.length > 0) {
      const dbStatus = expandRoomStatusFilters(filters.status);
      query = query.in('trang_thai', dbStatus);
    }

    if (filters.gender && filters.gender !== 'Tất cả') {
      const genderOptions = [filters.gender, 'Nam/Nữ'];
      query = query.in('gioi_tinh', genderOptions);
    }

    if (filters.sort === 'price_desc') {
      query = query.order('gia_thang', { ascending: false });
    } else if (filters.sort === 'newest') {
      query = query.order('created_at', { ascending: false });
    } else {
      query = query.order('gia_thang', { ascending: true });
    }
    
    query = query.range(offset, offset + limit - 1);
      
    const { data, error, count } = await query;
    if (error) {
        console.error("Supabase Error:", error);
        throw error;
    }

    // For list view, we fetch holds per room to show accurate availability
    // Batch fetch all active holds for the rooms in this page
    const roomIds = (data || []).map(r => r.ma_phong);
    let allHoldsMap = {};
    if (roomIds.length > 0) {
      const now = new Date().toISOString();
      const { data: holdsData } = await supabase
        .from("giu_cho_tam")
        .select("ma_giuong, ma_phong, trang_thai, thoi_gian_het_han")
        .in("ma_phong", roomIds)
        .in("trang_thai", ["DANG_GIU", "DA_XAC_NHAN_COC"])
        .or(`thoi_gian_het_han.is.null,thoi_gian_het_han.gt.${now}`);
      
      for (const hold of (holdsData || [])) {
        if (hold.ma_giuong) {
          allHoldsMap[hold.ma_giuong] = hold;
        }
      }
    }
    
    return {
      data: Array.isArray(data) ? data.map(r => mapRoomToFrontendFormat(r, allHoldsMap)) : [],
      total: count || 0,
      page,
      limit
    };
  },

  async getById(id) {
    if (!supabase) return null;

    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select(`
        *,
        tang ( ten_tang ),
        toa ( ten, dia_chi ),
        hinh_anh_phong ( duong_dan_cong_khai, la_anh_bia ),
        tai_san_phong ( ten_tai_san ),
        giuong ( ma_giuong, ma_giuong_hien_thi, nhan_giuong, gia_thang, trang_thai )
      `)
      .eq("ma_phong", id)
      .maybeSingle();
      
    if (error) throw error;
    if (!data) return null;
    
    // Fetch active holds for this room
    const holdMap = await getActiveHoldsForRoom(id);
    
    const mapped = mapRoomToFrontendFormat(data, holdMap);
    mapped.address = data.toa?.dia_chi || "";
    mapped.type = data.loai_phong;
    return mapped;
  },

  async getBedsByRoomId(roomId) {
    if (!supabase) return [];
    
    const { data, error } = await supabase
      .from("giuong")
      .select(`
        *,
        phong ( gia_thang )
      `)
      .eq("ma_phong", roomId);
      
    if (error) throw error;

    // Fetch active holds for this room
    const holdMap = await getActiveHoldsForRoom(roomId);
    
    return data ? data.map(bed => {
      const hold = holdMap[bed.ma_giuong] || null;
      const status = normalizeBedStatus(bed.trang_thai, hold);
      return {
        id: bed.ma_giuong,
        code: bed.ma_giuong_hien_thi,
        label: bed.nhan_giuong,
        price: formatPrice(bed.phong?.gia_thang || bed.gia_thang),
        rawPrice: bed.phong?.gia_thang || bed.gia_thang,
        status,
      };
    }) : [];
  },

  async getBuildings() {
    if (!supabase) return [];
    
    const { data, error } = await supabase
      .from("toa")
      .select("*")
      .order("ten", { ascending: true });
      
    if (error) throw error;
    
    return data || [];
  },
};

module.exports = RoomModel;
