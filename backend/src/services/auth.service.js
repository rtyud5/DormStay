// backend/src/services/auth.service.js
const { supabase } = require("../config/supabase");

const AuthService = {
  // ─────────────────────────────────────────────────────
  // ĐĂNG NHẬP
  // ─────────────────────────────────────────────────────
  async login({ email, password }) {
    if (!email || !password) {
      throw new Error("Email và mật khẩu không được để trống.");
    }

    // 1. Xác thực với Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (error) {
      if (error.message.includes("Invalid login credentials")) {
        throw new Error("Email hoặc mật khẩu không đúng.");
      }
      if (error.message.includes("Email not confirmed")) {
        throw new Error("Email chưa được xác nhận. Vui lòng kiểm tra hộp thư của bạn.");
      }
      throw new Error(error.message);
    }

    // 2. Lấy profile từ bảng ho_so
    const { data: profile, error: profileError } = await supabase
      .from("ho_so")
      .select("ma_ho_so, ho_ten, email, vai_tro, so_dien_thoai")
      .eq("ma_nguoi_dung_xac_thuc", data.user.id)
      .single();

    if (profileError || !profile) {
      throw new Error("Không tìm thấy hồ sơ người dùng. Vui lòng liên hệ quản trị viên.");
    }

    return {
      token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      expires_at: data.session.expires_at,
      user: {
        ma_ho_so: profile.ma_ho_so,
        ho_ten: profile.ho_ten,
        email: profile.email,
        vai_tro: profile.vai_tro, // "KHACH_HANG" | "NHAN_VIEN" | "KE_TOAN" | "QUAN_LY"
        so_dien_thoai: profile.so_dien_thoai,
      },
    };
  },

  // ─────────────────────────────────────────────────────
  // ĐĂNG KÝ — Mặc định vai_tro = KHACH_HANG
  // Người dùng KHÔNG được tự chọn vai trò.
  // Quản lý sẽ cấp role qua API /auth/staff hoặc Supabase Dashboard.
  // ─────────────────────────────────────────────────────
  async register({ fullName, email, phone, password, cccd, dob }) {
    if (!fullName || !email || !phone || !password) {
      throw new Error("Vui lòng điền đầy đủ họ tên, email, số điện thoại và mật khẩu.");
    }
    if (password.length < 6) {
      throw new Error("Mật khẩu phải có ít nhất 6 ký tự.");
    }

    // 1. Tạo tài khoản Supabase Auth
    // Supabase trigger "handle_new_auth_user" sẽ tự tạo row trong bảng ho_so
    // với vai_tro = "KHACH_HANG" (mặc định trong trigger)
    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        data: { ho_ten: fullName.trim() }, // metadata gắn vào auth.users
      },
    });

    if (error) {
      if (error.message.includes("already registered") || error.message.includes("User already registered")) {
        throw new Error("Email này đã được đăng ký. Vui lòng dùng email khác hoặc đăng nhập.");
      }
      throw new Error(error.message);
    }

    // 2. Cập nhật thông tin bổ sung vào ho_so
    // (trigger chỉ tạo row với email + ho_ten, cần update thêm các field khác)
    // backend/src/services/auth.service.js
    // Trong hàm register — phần upsert ho_so, sửa tên cột:

    if (data.user) {
      const { error: insertError } = await supabase.from("ho_so").upsert(
        {
          ma_nguoi_dung_xac_thuc: data.user.id,
          email: email.trim().toLowerCase(),
          ho_ten: fullName.trim(),
          so_dien_thoai: phone?.trim() || null,
          so_cccd: cccd?.trim() || null, // ✅ Đúng tên cột
          vai_tro: "KHACH_HANG",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "ma_nguoi_dung_xac_thuc",
        },
      );

      if (insertError) {
        console.error("[register] Lỗi tạo ho_so:", insertError.message);
        throw new Error(`Lỗi lưu hồ sơ: ${insertError.message}`);
      }
    }

    return {
      message: "Đăng ký thành công! Vui lòng kiểm tra email để xác nhận tài khoản.",
      email: data.user?.email,
      need_email_confirmation: !data.session, // true nếu Supabase yêu cầu verify email
    };
  },

  // ─────────────────────────────────────────────────────
  // LẤY THÔNG TIN NGƯỜI DÙNG HIỆN TẠI
  // Controller sẽ truyền ma_ho_so từ req.user (đã verify qua authMiddleware)
  // ─────────────────────────────────────────────────────
  async getMe(ma_ho_so) {
    const { data, error } = await supabase
      .from("ho_so")
      .select("ma_ho_so, ho_ten, email, vai_tro, so_dien_thoai, ngay_sinh, so_cmnd_cccd, created_at")
      .eq("ma_ho_so", ma_ho_so)
      .single();

    if (error || !data) {
      throw new Error("Không tìm thấy hồ sơ người dùng.");
    }

    return data;
  },

  // ─────────────────────────────────────────────────────
  // TẠO TÀI KHOẢN NHÂN VIÊN — Chỉ QUAN_LY được gọi
  // Dùng Supabase Admin API để bypass xác nhận email
  // ─────────────────────────────────────────────────────
  async createStaffAccount({ fullName, email, phone, password, vai_tro }) {
    const STAFF_ROLES = ["NHAN_VIEN", "KE_TOAN", "QUAN_LY"];

    if (!STAFF_ROLES.includes(vai_tro)) {
      throw new Error(`Vai trò không hợp lệ. Chỉ chấp nhận: ${STAFF_ROLES.join(", ")}`);
    }

    // Dùng admin API để tạo user và confirm email ngay lập tức
    const { data, error } = await supabase.auth.admin.createUser({
      email: email.trim().toLowerCase(),
      password,
      email_confirm: true, // Không cần bước xác nhận email
      user_metadata: { ho_ten: fullName.trim() },
    });

    if (error) {
      if (error.message.includes("already registered")) {
        throw new Error("Email này đã được đăng ký.");
      }
      throw new Error(error.message);
    }

    // Cập nhật vai_tro trong ho_so (trigger tạo với KHACH_HANG, cần override)
    const { error: updateError } = await supabase
      .from("ho_so")
      .update({
        vai_tro: vai_tro,
        ho_ten: fullName.trim(),
        so_dien_thoai: phone?.trim() || null,
      })
      .eq("ma_nguoi_dung_xac_thuc", data.user.id);

    if (updateError) {
      // Tài khoản đã tạo nhưng role chưa set — log lỗi để xử lý thủ công
      console.error("[AuthService.createStaffAccount] Update vai_tro thất bại:", updateError.message);
      throw new Error("Tạo tài khoản thành công nhưng không thể gán vai trò. Vui lòng liên hệ kỹ thuật.");
    }

    return {
      message: `Tạo tài khoản ${vai_tro} thành công.`,
      email: data.user.email,
      vai_tro,
    };
  },
};

module.exports = AuthService;
