// backend/src/middlewares/auth.middleware.js
const { supabase } = require("../config/supabase");

async function authMiddleware(req, res, next) {
  const authorization = req.headers.authorization || "";
  const token = authorization.replace("Bearer ", "").trim();

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Thiếu token xác thực. Vui lòng đăng nhập.",
    });
  }

  try {
    // Verify token thật với Supabase (thay hardcode demo)
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data?.user) {
      return res.status(401).json({
        success: false,
        message: "Token không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.",
      });
    }

    // Lấy profile từ bảng ho_so
    const { data: profile, error: profileError } = await supabase
      .from("ho_so")
      .select("ma_ho_so, ho_ten, email, vai_tro, so_dien_thoai")
      .eq("ma_nguoi_dung_xac_thuc", data.user.id)
      .single();

    if (profileError || !profile) {
      return res.status(401).json({
        success: false,
        message: "Không tìm thấy hồ sơ người dùng.",
      });
    }

    // Gắn vào req.user để controller dùng
    req.user = {
      ma_ho_so: profile.ma_ho_so,
      ho_ten: profile.ho_ten,
      email: profile.email,
      vai_tro: profile.vai_tro,
      so_dien_thoai: profile.so_dien_thoai,
      supabase_uid: data.user.id,
    };

    return next();
  } catch (err) {
    console.error("[authMiddleware]", err.message);
    return res.status(500).json({ success: false, message: "Lỗi xác thực nội bộ." });
  }
}

module.exports = authMiddleware;
