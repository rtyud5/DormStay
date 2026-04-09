/**
 * seed.js — Tạo dữ liệu mẫu cho DormStay
 * 
 * Chạy: node seed.js
 * 
 * Script này sẽ:
 * 1. Tạo tài khoản KE_TOAN (và QUAN_LY, NHAN_VIEN) trong Supabase Auth
 * 2. Tạo hồ sơ ho_so tương ứng
 * 3. Tạo dữ liệu mẫu: tòa nhà, tầng, phòng, giường
 * 4. Tạo dữ liệu mẫu: yêu cầu thuê, hợp đồng, hóa đơn
 */

require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } }
);

// ─────────────────────────────────────────────────────────────
// HELPER
// ─────────────────────────────────────────────────────────────
async function createUser(email, password, hoTen, vaiTro) {
  console.log(`\n📧 Tạo tài khoản: ${email} (${vaiTro})`);

  // Xóa user cũ (nếu có) để tránh lỗi "already registered"
  const { data: existingUsers } = await supabase.auth.admin.listUsers();
  const existing = existingUsers?.users?.find((u) => u.email === email);
  if (existing) {
    console.log(`  ↳ Tài khoản đã tồn tại, bỏ qua tạo auth user.`);
    // Upsert ho_so
    await upsertProfile(existing.id, email, hoTen, vaiTro);
    return existing.id;
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { ho_ten: hoTen },
  });

  if (error) {
    console.error(`  ❌ Lỗi tạo auth user: ${error.message}`);
    return null;
  }

  console.log(`  ✅ Tạo auth user thành công: ${data.user.id}`);
  await upsertProfile(data.user.id, email, hoTen, vaiTro);
  return data.user.id;
}

async function upsertProfile(authId, email, hoTen, vaiTro) {
  const { error } = await supabase.from("ho_so").upsert(
    {
      ma_nguoi_dung_xac_thuc: authId,
      email,
      ho_ten: hoTen,
      vai_tro: vaiTro,
      so_dien_thoai: vaiTro === "KE_TOAN" ? "0901234567" : "0987654321",
    },
    { onConflict: "ma_nguoi_dung_xac_thuc" }
  );
  if (error) {
    console.error(`  ❌ Lỗi upsert ho_so: ${error.message}`);
  } else {
    console.log(`  ✅ Ho sơ ho_so sẵn sàng cho ${email}`);
  }
}

// ─────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────
async function seed() {
  console.log("🌱 Bắt đầu Seed DormStay...\n");

  // ── 1. Tài khoản hệ thống ──────────────────────────────────
  console.log("=== BƯỚC 1: Tạo tài khoản hệ thống ===");
  await createUser("ketoan@dormstay.vn", "ketoan123", "Nguyễn Kế Toán", "KE_TOAN");
  await createUser("quanly@dormstay.vn", "quanly123", "Trần Quản Lý", "QUAN_LY");
  await createUser("nhanvien@dormstay.vn", "nhanvien123", "Lê Nhân Viên", "NHAN_VIEN");
  await createUser("khach@dormstay.vn", "khach123", "Phạm Văn Khách", "KHACH_HANG");

  // ── 2. Tòa nhà ────────────────────────────────────────────
  console.log("\n=== BƯỚC 2: Tạo tòa nhà ===");
  const { data: toaData, error: toaErr } = await supabase
    .from("toa")
    .upsert(
      [
        { ma_dinh_danh: "TOA-A", ten: "Tòa A", dia_chi: "123 Nguyễn Văn A", quan_huyen: "Quận 10", thanh_pho: "TP.HCM" },
        { ma_dinh_danh: "TOA-B", ten: "Tòa B", dia_chi: "456 Trần Văn B", quan_huyen: "Quận 3", thanh_pho: "TP.HCM" },
      ],
      { onConflict: "ma_dinh_danh", ignoreDuplicates: false }
    )
    .select("ma_toa, ten");

  if (toaErr) {
    console.error("❌ Lỗi tạo toa:", toaErr.message);
    return;
  }
  console.log("✅ Tòa nhà:", toaData.map((t) => t.ten).join(", "));
  const toaA = toaData.find((t) => t.ten === "Tòa A");
  const toaB = toaData.find((t) => t.ten === "Tòa B");

  // ── 3. Tầng ────────────────────────────────────────────────
  console.log("\n=== BƯỚC 3: Tạo tầng ===");
  const tangList = [];
  for (const toa of [toaA, toaB]) {
    for (let i = 1; i <= 3; i++) {
      tangList.push({ ma_toa: toa.ma_toa, so_tang: i, ten_tang: `Tầng ${i}` });
    }
  }
  const { data: tangData, error: tangErr } = await supabase
    .from("tang")
    .upsert(tangList, { onConflict: "ma_toa,so_tang", ignoreDuplicates: true })
    .select("ma_tang, ma_toa, so_tang");

  if (tangErr) {
    console.error("❌ Lỗi tạo tang:", tangErr.message);
    return;
  }
  console.log(`✅ Tạo ${tangData.length} tầng`);

  // ── 4. Phòng ───────────────────────────────────────────────
  console.log("\n=== BƯỚC 4: Tạo phòng ===");
  const phongList = [];
  for (const tang of tangData) {
    const isToaA = tang.ma_toa === toaA.ma_toa;
    // Mỗi tầng 4 phòng
    for (let j = 1; j <= 4; j++) {
      const prefix = isToaA ? "A" : "B";
      const loai = j <= 2 ? "PHONG_CHUNG" : "PHONG_RIENG";
      phongList.push({
        ma_toa: tang.ma_toa,
        ma_tang: tang.ma_tang,
        ma_phong_hien_thi: `${prefix}${tang.so_tang}0${j}`,
        loai_phong: loai,
        suc_chua: loai === "PHONG_CHUNG" ? 4 : 2,
        gia_thang: loai === "PHONG_CHUNG" ? 1200000 : 3500000,
        trang_thai: j === 4 ? "DA_THUE_HET" : j === 3 ? "CON_TRONG" : "SAP_DAY",
      });
    }
  }

  // Kiểm tra phòng đã tồn tại chưa, chỉ insert phòng mới
  const { data: existingPhong } = await supabase.from("phong").select("ma_phong_hien_thi");
  const existingCodes = new Set((existingPhong || []).map((p) => p.ma_phong_hien_thi));
  const newPhong = phongList.filter((p) => !existingCodes.has(p.ma_phong_hien_thi));

  let phongData = existingPhong || [];
  if (newPhong.length > 0) {
    const { data: inserted, error: phongErr } = await supabase
      .from("phong")
      .insert(newPhong)
      .select("ma_phong, ma_phong_hien_thi, loai_phong, gia_thang");
    if (phongErr) {
      console.error("❌ Lỗi tạo phong:", phongErr.message);
      return;
    }
    phongData = [...phongData, ...inserted];
    console.log(`✅ Tạo ${inserted.length} phòng mới`);
  } else {
    // Lấy lại đầy đủ data phòng
    const { data: allPhong } = await supabase.from("phong").select("ma_phong, ma_phong_hien_thi, loai_phong, gia_thang");
    phongData = allPhong || [];
    console.log(`✅ ${phongData.length} phòng đã tồn tại, bỏ qua`);
  }

  // ── 5. Giường (cho phòng chung) ────────────────────────────
  console.log("\n=== BƯỚC 5: Tạo giường ===");
  const phongChung = phongData.filter((p) => p.loai_phong === "PHONG_CHUNG");
  const nhans = ["A", "B", "C", "D"];

  const { data: existingGiuong } = await supabase.from("giuong").select("ma_giuong_hien_thi");
  const existingGCodes = new Set((existingGiuong || []).map((g) => g.ma_giuong_hien_thi));

  const giuongList = [];
  for (const phong of phongChung) {
    for (let k = 0; k < 4; k++) {
      const code = `${phong.ma_phong_hien_thi}-${nhans[k]}`;
      if (!existingGCodes.has(code)) {
        giuongList.push({
          ma_phong: phong.ma_phong,
          ma_giuong_hien_thi: code,
          nhan_giuong: `Giường ${nhans[k]}`,
          gia_thang: phong.gia_thang,
          trang_thai: k < 2 ? "DA_THUE" : "CON_TRONG",
        });
      }
    }
  }

  if (giuongList.length > 0) {
    const { error: giuongErr } = await supabase.from("giuong").insert(giuongList);
    if (giuongErr) {
      console.error("❌ Lỗi tạo giuong:", giuongErr.message);
    } else {
      console.log(`✅ Tạo ${giuongList.length} giường mới`);
    }
  } else {
    console.log("✅ Giường đã tồn tại, bỏ qua");
  }

  // ── 6. Hợp đồng mẫu & Hóa đơn ─────────────────────────────
  console.log("\n=== BƯỚC 6: Tạo hợp đồng và hóa đơn mẫu ===");

  // Lấy hồ sơ khách hàng
  const { data: khachHS } = await supabase
    .from("ho_so")
    .select("ma_ho_so")
    .eq("email", "khach@dormstay.vn")
    .single();

  if (!khachHS) {
    console.log("⚠️ Không tìm thấy ho_so khách — bỏ qua tạo hợp đồng");
  } else {
    // Lấy một phòng riêng còn trống
    const phongRieng = phongData.find((p) => p.loai_phong === "PHONG_RIENG" && p.ma_phong_hien_thi.includes("03"));

    if (phongRieng) {
      // Tạo yêu cầu thuê (nếu chưa có)
      const { data: yctData } = await supabase
        .from("yeu_cau_thue")
        .upsert({
          ma_ho_so_khach_hang: khachHS.ma_ho_so,
          loai_muc_tieu: "PHONG",
          ma_phong: phongRieng.ma_phong,
          ngay_du_kien_vao_o: "2026-01-01",
          gia_thue_thang: phongRieng.gia_thang,
          so_tien_dat_coc: phongRieng.gia_thang * 2,
          trang_thai: "DA_XAC_NHAN",
        })
        .select("ma_yeu_cau_thue")
        .single();

      if (yctData) {
        // Tạo hợp đồng
        const { data: hdData } = await supabase
          .from("hop_dong")
          .upsert({
            ma_yeu_cau_thue: yctData.ma_yeu_cau_thue,
            ma_ho_so_khach_hang: khachHS.ma_ho_so,
            ma_phong: phongRieng.ma_phong,
            ngay_vao_o: "2026-01-01",
            gia_thue_co_ban_thang: phongRieng.gia_thang,
            so_tien_dat_coc_bao_dam: phongRieng.gia_thang * 2,
            trang_thai: "DANG_HIEU_LUC",
          })
          .select("ma_hop_dong")
          .single();

        if (hdData) {
          console.log(`✅ Tạo hợp đồng: ${hdData.ma_hop_dong}`);

          // Tạo hóa đơn tiền thuê tháng 4
          const today = new Date().toISOString().split("T")[0];
          const deadline = new Date();
          deadline.setDate(deadline.getDate() + 5);

          await supabase.from("hoa_don").insert([
            {
              ma_hop_dong: hdData.ma_hop_dong,
              loai_hoa_don: "TIEN_THUE",
              trang_thai: "CHO_THANH_TOAN",
              tong_so_tien: phongRieng.gia_thang,
              so_tien_da_thanh_toan: 0,
              ngay_lap: today,
              ngay_den_han: deadline.toISOString().split("T")[0],
            },
            {
              ma_hop_dong: hdData.ma_hop_dong,
              loai_hoa_don: "TIEN_THUE",
              trang_thai: "THANH_TOAN_TOAN_BO",
              tong_so_tien: phongRieng.gia_thang,
              so_tien_da_thanh_toan: phongRieng.gia_thang,
              ngay_lap: "2026-03-01",
              ngay_den_han: "2026-03-10",
            },
            {
              ma_hop_dong: hdData.ma_hop_dong,
              loai_hoa_don: "TIEN_THUE",
              trang_thai: "CHO_THANH_TOAN",
              tong_so_tien: 150000,
              so_tien_da_thanh_toan: 0,
              ngay_lap: "2026-03-01",
              ngay_den_han: "2026-02-01", // Quá hạn
            },
          ]);
          console.log("✅ Tạo 3 hóa đơn mẫu");
        }
      }
    }
  }

  console.log("\n✅ Seed hoàn tất!\n");
  console.log("📋 Tài khoản được tạo:");
  console.log("  KE_TOAN  : ketoan@dormstay.vn   / ketoan123");
  console.log("  QUAN_LY  : quanly@dormstay.vn   / quanly123");
  console.log("  NHAN_VIEN: nhanvien@dormstay.vn  / nhanvien123");
  console.log("  KHACH    : khach@dormstay.vn     / khach123");
  console.log("\nSau khi đăng nhập bằng KE_TOAN sẽ tự redirect đến /ke-toan/phieu-thu\n");
}

seed().catch((err) => {
  console.error("💥 Lỗi seed:", err.message);
  process.exit(1);
});
