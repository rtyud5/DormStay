const { supabase } = require("../config/supabase");

const TABLE_NAME = "phong";

// Helper to format currency
const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
};

// Data Mapper Adapter
const mapRoomToFrontendFormat = (raw) => {
  const isDorm = raw.loai_phong === 'PHONG_CHUNG';
  
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

  return {
    id: raw.ma_phong,
    name: `Phòng ${raw.ma_phong_hien_thi}`,
    price: formatPrice(raw.gia_thang),
    rawPrice: raw.gia_thang,
    unit: isDorm ? "/tháng/người" : "/tháng/phòng",
    status,
    statusColor,
    gender: "NAM / NỮ", // Defaulting for now
    capacity: isDorm ? `Còn trống chỗ` : "Phòng riêng",
    floor: raw.tang?.ten_tang || "Tầng 1",
    amenities: raw.tai_san_phong?.map(t => t.ten_tai_san) || ["Điều hòa", "Wifi"],
    image,
    gallery,
    building: raw.toa?.ten || "DormStay"
  };
};

const RoomModel = {
  async list() {
    if (!supabase) return [];
    
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select(`
        *,
        tang ( ten_tang ),
        toa ( ten ),
        hinh_anh_phong ( duong_dan_cong_khai, la_anh_bia ),
        tai_san_phong ( ten_tai_san )
      `);
      
    if (error) throw error;
    
    return data ? data.map(mapRoomToFrontendFormat) : [];
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
        tai_san_phong ( ten_tai_san )
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
};

module.exports = RoomModel;
