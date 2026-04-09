/**
 * seed-invoices.js — Tạo hợp đồng và hóa đơn mẫu
 * Chạy: node seed-invoices.js
 */
require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } }
);

async function run() {
  console.log("🌱 Seed hợp đồng và hóa đơn...\n");

  // 1. Lấy thông tin đang có
  const { data: yctList } = await supabase
    .from("yeu_cau_thue")
    .select("ma_yeu_cau_thue, ma_ho_so_khach_hang, ma_phong, ma_giuong, gia_thue_thang, so_tien_dat_coc, trang_thai")
    .limit(5);

  const { data: phongList } = await supabase
    .from("phong")
    .select("ma_phong, gia_thang, loai_phong")
    .limit(10);

  if (!yctList?.length) {
    console.log("❌ Không có yeu_cau_thue nào.");
    return;
  }

  const phongMap = {};
  for (const p of phongList || []) phongMap[p.ma_phong] = p;

  // 2. Tạo hợp đồng từ yeu_cau_thue (nếu chưa có)
  const { data: existingHD } = await supabase.from("hop_dong").select("ma_yeu_cau_thue");
  const existingYCT = new Set((existingHD || []).map((h) => h.ma_yeu_cau_thue));

  const hopDongCreated = [];
  for (const yct of yctList) {
    if (existingYCT.has(yct.ma_yeu_cau_thue)) {
      console.log(`  ⏭ Hợp đồng cho YCT ${yct.ma_yeu_cau_thue} đã tồn tại`);
      continue;
    }
    const phong = phongMap[yct.ma_phong];
    const giaThue = yct.gia_thue_thang || phong?.gia_thang || 3500000;

    const { data: hd, error } = await supabase
      .from("hop_dong")
      .insert({
        ma_yeu_cau_thue: yct.ma_yeu_cau_thue,
        ma_ho_so_khach_hang: yct.ma_ho_so_khach_hang,
        loai_muc_tieu: yct.ma_giuong ? "GIUONG" : "PHONG",
        ma_phong: yct.ma_phong || null,
        ma_giuong: yct.ma_giuong || null,
        ngay_vao_o: "2026-01-15",
        gia_thue_co_ban_thang: giaThue,
        so_tien_dat_coc_bao_dam: yct.so_tien_dat_coc || giaThue * 2,
        trang_thai: "DANG_HIEU_LUC",
      })
      .select("ma_hop_dong, gia_thue_co_ban_thang")
      .single();

    if (error) {
      console.log(`  ❌ Lỗi tạo HD cho YCT ${yct.ma_yeu_cau_thue}: ${error.message}`);
    } else {
      console.log(`  ✅ Tạo hợp đồng ${hd.ma_hop_dong}`);
      hopDongCreated.push(hd);
    }
  }

  // Lấy tất cả hợp đồng hiện có
  const { data: allHD } = await supabase
    .from("hop_dong")
    .select("ma_hop_dong, gia_thue_co_ban_thang")
    .limit(10);

  if (!allHD?.length) {
    console.log("❌ Vẫn không có hợp đồng. Kiểm tra lại.");
    return;
  }

  // 3. Tạo hóa đơn mẫu
  console.log(`\n📄 Tạo hóa đơn cho ${allHD.length} hợp đồng...`);
  const today = new Date();
  const invoices = [];

  for (const hd of allHD) {
    const gia = hd.gia_thue_co_ban_thang || 3500000;

    // Hóa đơn tháng này - chưa thanh toán (hạn còn 8 ngày)
    const han1 = new Date(today); han1.setDate(han1.getDate() + 8);
    invoices.push({
      ma_hop_dong: hd.ma_hop_dong,
      loai_hoa_don: "TIEN_THUE",
      trang_thai: "CHO_THANH_TOAN",
      tong_so_tien: gia,
      so_tien_da_thanh_toan: 0,
      ngay_lap: today.toISOString().split("T")[0],
      ngay_den_han: han1.toISOString().split("T")[0],
    });

    // Hóa đơn quá hạn (5 ngày trước)
    const han2 = new Date(today); han2.setDate(han2.getDate() - 5);
    const lap2 = new Date(today); lap2.setDate(lap2.getDate() - 15);
    invoices.push({
      ma_hop_dong: hd.ma_hop_dong,
      loai_hoa_don: "TIEN_THUE",
      trang_thai: "CHO_THANH_TOAN",
      tong_so_tien: gia,
      so_tien_da_thanh_toan: 0,
      ngay_lap: lap2.toISOString().split("T")[0],
      ngay_den_han: han2.toISOString().split("T")[0],
    });

    // Hóa đơn đã thanh toán tháng trước
    const thangTruoc = new Date(today); thangTruoc.setMonth(thangTruoc.getMonth() - 1);
    invoices.push({
      ma_hop_dong: hd.ma_hop_dong,
      loai_hoa_don: "TIEN_THUE",
      trang_thai: "THANH_TOAN_TOAN_BO",
      tong_so_tien: gia,
      so_tien_da_thanh_toan: gia,
      ngay_lap: thangTruoc.toISOString().split("T")[0],
      ngay_den_han: thangTruoc.toISOString().split("T")[0],
    });

    // Hóa đơn điện nước
    invoices.push({
      ma_hop_dong: hd.ma_hop_dong,
      loai_hoa_don: "DIEN_NUOC",
      trang_thai: "CHO_THANH_TOAN",
      tong_so_tien: Math.round(gia * 0.08),
      so_tien_da_thanh_toan: 0,
      ngay_lap: today.toISOString().split("T")[0],
      ngay_den_han: han1.toISOString().split("T")[0],
    });
  }

  const { error: invErr } = await supabase.from("hoa_don").insert(invoices);
  if (invErr) {
    console.error("❌ Lỗi tạo hoa_don:", invErr.message);
  } else {
    console.log(`✅ Tạo ${invoices.length} hóa đơn`);
  }

  console.log("\n🎉 Hoàn tất! Reload /ke-toan/phieu-thu để xem dữ liệu.");
}

run().catch((e) => { console.error("💥", e.message); process.exit(1); });
