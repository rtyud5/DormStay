require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");
const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

async function check() {
  const { data: hd, error: e1 } = await sb.from("hop_dong").select("ma_hop_dong, trang_thai").limit(3);
  console.log("hop_dong:", e1?.message || JSON.stringify(hd));

  const { data: hs, error: e2 } = await sb.from("ho_so").select("ma_ho_so, ho_ten, vai_tro").limit(5);
  console.log("ho_so:", e2?.message || JSON.stringify(hs));

  const { data: ph, error: e3 } = await sb.from("phong").select("ma_phong, ma_phong_hien_thi, loai_phong").limit(5);
  console.log("phong:", e3?.message || JSON.stringify(ph));

  const { data: inv, error: e4 } = await sb.from("hoa_don").select("ma_hoa_don, loai_hoa_don, trang_thai").limit(5);
  console.log("hoa_don:", e4?.message || JSON.stringify(inv));

  const { data: yct, error: e5 } = await sb.from("yeu_cau_thue").select("ma_yeu_cau_thue, trang_thai").limit(3);
  console.log("yeu_cau_thue:", e5?.message || JSON.stringify(yct));
}
check().catch(console.error);
