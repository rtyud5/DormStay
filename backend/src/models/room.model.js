const { supabase } = require("../config/supabase");

const TABLE_NAME = "phong";

// Helper to format currency
const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
};

// Data Mapper Adapter
const mapRoomToFrontendFormat = (raw) => {
  const isDorm = raw.loai_phong === 'PHONG_CHUNG';
  const bedList = raw.giuong || [];
  const totalBeds = bedList.length;
  const availableBeds = bedList.filter(bed => bed.trang_thai === 'CON_TRONG').length;
  
  // Status Mapping
  let status = "CÒN TRỐNG";
  let statusColor = "text-emerald-700 bg-emerald-100";
  if (raw.trang_thai === 'SAP_DAY') {
    status = "SẮP ĐẦY";
    statusColor = "text-orange-600 bg-orange-100";
  } else if (raw.trang_thai === 'DA_THUE_HET' || raw.trang_thai === 'DAY') {
    status = "ĐÃ ĐẦY";
    statusColor = "text-red-600 bg-red-100";
  }

  // Cover Image mapping
  let image = "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=600&q=80";
  let gallery = [];
  if (raw.hinh_anh_phong && raw.hinh_anh_phong.length > 0) {
    const cover = raw.hinh_anh_phong.find(img => img.la_anh_bia);
    if (cover) image = cover.duong_dan_cong_khai;
    else image = raw.hinh_anh_phong[0].duong_dan_cong_khai;
    gallery = raw.hinh_anh_phong.map(img => img.duong_dan_cong_khai);
  }

  // Gender mapping from building name
  // let gender = "Nam / Nữ";
  // const buildingName = raw.toa?.ten || "";
  // if (buildingName.includes("Nam")) {
  //   gender = "NAM";
  // } else if (buildingName.includes("Nữ")) {
  //   gender = "NỮ";
  // }

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
    beds: bedList.map(bed => ({
      id: bed.ma_giuong,
      code: bed.ma_giuong_hien_thi,
      label: bed.nhan_giuong,
      price: formatPrice(bed.gia_thang),
      rawPrice: bed.gia_thang,
      status: bed.trang_thai
    })),
    type: raw.loai_phong
  };
};

const RoomModel = {
  async list(filters = {}) {
    if (!supabase) return { data: [], total: 0, page: 1, limit: 10 };
    
    // Phân trang
    const page = parseInt(filters.page) || 1;
    const limit = parseInt(filters.limit) || 10;
    const offset = (page - 1) * limit;
    
    // 1. Khởi tạo query chuẩn (sử dụng join thường để tránh bị lọc mất phòng nếu thiếu thông tin tầng/tòa từ file cũ)
    let selectString = `
        *,
        tang ( ten_tang ),
        toa ( ma_toa, ten ),
        hinh_anh_phong ( duong_dan_cong_khai, la_anh_bia ),
        tai_san_phong ( ten_tai_san ),
        giuong ( ma_giuong, ma_giuong_hien_thi, nhan_giuong, gia_thang, trang_thai )
      `;

    let query = supabase.from(TABLE_NAME).select(selectString, { count: 'exact' });

    // 2. Tìm kiếm (Chỉ nên lọc trên bảng chính phong)
    if (filters.search) {
      query = query.ilike('ma_phong_hien_thi', `%${filters.search}%`);
    }

    // 3. Lọc Tòa nhà
    if (filters.building) {
      query = query.eq('ma_toa', parseInt(filters.building));
    }

    // 4. Lọc Tầng
    if (filters.floor && filters.floor !== 'Tất cả các tầng') {
      query = query.eq('tang.ten_tang', filters.floor);
    }

    // 4. Loại phòng (Hỗ trợ nhiều alias và gộp loại tương đương)
    if (filters.type) {
      if (filters.type === 'PHONG_RIENG') {
        query = query.in('loai_phong', ['PHONG_RIENG', 'PHONG_STUDIO', 'STUDIO']);
      } else if (filters.type === 'PHONG_CHUNG') {
        query = query.in('loai_phong', ['PHONG_CHUNG', 'PHONG_CHUNG\n', 'DORM']);
      } else {
        query = query.eq('loai_phong', filters.type);
      }
    }

    // 5. Khoảng giá (Sử dụng đúng cột gia_thang trong SQL)
    if (filters.minPrice) {
      query = query.gte('gia_thang', parseFloat(filters.minPrice));
    }
    if (filters.maxPrice) {
      query = query.lte('gia_thang', parseFloat(filters.maxPrice));
    }

    // 6. Trạng thái (Hỗ trợ alias cho các trạng thái trong DB)
    let rawStatusFilters = filters.status || filters['status[]'];
    if (rawStatusFilters) {
      if (!Array.isArray(rawStatusFilters)) {
        rawStatusFilters = [rawStatusFilters];
      }
      
      if (rawStatusFilters.length > 0) {
        let statusValues = [];
        rawStatusFilters.forEach(s => {
          if (s === 'CON_TRONG' || s === 'TRONG') {
            statusValues.push('TRONG', 'CON_TRONG');
          } else if (s === 'SAP_DAY') {
            statusValues.push('SAP_DAY');
          } else if (s === 'DA_DAY' || s === 'DA_THUE_HET' || s === 'DAY') {
            statusValues.push('DA_DAY', 'DA_THUE_HET', 'DAY');
          } else {
            statusValues.push(s);
          }
        });
        // Loại bỏ các giá trị trùng lặp
        statusValues = [...new Set(statusValues)];
        query = query.in('trang_thai', statusValues);
      }
    }

    // 7. Giới tính (Lọc chính xác: Nam chỉ Nam, Nữ chỉ Nữ)
    if (filters.gender && filters.gender !== 'Tất cả') {
      query = query.eq('gioi_tinh', filters.gender);
    }

    // 8. Sắp xếp
    if (filters.sort === 'price_desc') {
      query = query.order('gia_thang', { ascending: false });
    } else if (filters.sort === 'newest') {
      query = query.order('created_at', { ascending: false });
    } else {
      query = query.order('gia_thang', { ascending: true });
    }
    
    // Áp dụng range cho phân trang
    query = query.range(offset, offset + limit - 1);
      
    const { data, error, count } = await query;
    if (error) {
        console.error("Supabase Error:", error);
        throw error;
    }
    
    return {
      data: Array.isArray(data) ? data.map(mapRoomToFrontendFormat) : [],
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
    
    const mapped = mapRoomToFrontendFormat(data);
    mapped.address = data.toa?.dia_chi || "";
    mapped.type = data.loai_phong;
    return mapped;
  },

  async getBedsByRoomId(roomId) {
    if (!supabase) return [];
    
    const { data, error } = await supabase
      .from("giuong")
      .select("*")
      .eq("ma_phong", roomId);
      
    if (error) throw error;
    
    return data ? data.map(bed => ({
      id: bed.ma_giuong,
      code: bed.ma_giuong_hien_thi,
      label: bed.nhan_giuong,
      price: formatPrice(bed.gia_thang),
      rawPrice: bed.gia_thang,
      status: bed.trang_thai === 'CON_TRONG' ? 'Còn trống' : 'Đã thuê'
    })) : [];
  },

  async getBuildings() {
    if (!supabase) return [];
    
    const { data, error } = await supabase
      .from('toa')
      .select('ma_toa, ten, dia_chi')
      .order('ten', { ascending: true });
      
    if (error) throw error;
    
    return data ? data.map(b => ({
      id: b.ma_toa,
      name: b.ten,
      address: b.dia_chi || ''
    })) : [];
  },
};

module.exports = RoomModel;
