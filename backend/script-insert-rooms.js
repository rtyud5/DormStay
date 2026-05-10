const { supabase } = require("./src/config/supabase");

async function insertTestRooms() {
  const { data: tangs } = await supabase.from('tang').select('ma_tang, ma_toa').limit(1);
  if (!tangs || tangs.length === 0) {
    console.log("No floors found");
    return;
  }
  const tang = tangs[0];

  console.log("Adding to Floor:", tang.ma_tang);

  // 1. Thêm 2 phòng chung, mỗi phòng 4 giường
  for (let i = 1; i <= 2; i++) {
    const ma_phong_hien_thi = `TEST_CHUNG_20${i}`;
    const { data: room, error } = await supabase.from('phong').insert({
      ma_toa: tang.ma_toa,
      ma_tang: tang.ma_tang,
      ma_phong_hien_thi,
      loai_phong: 'PHONG_CHUNG',
      suc_chua: 4,
      gia_thang: 0,
      trang_thai: 'TRONG',
      gioi_tinh: 'Nam/Nữ'
    }).select().single();

    if (error) {
      console.error(`Error inserting ${ma_phong_hien_thi}:`, error);
    } else {
      console.log(`Inserted shared room: ${room.ma_phong_hien_thi}`);
      for (let j = 1; j <= 4; j++) {
        await supabase.from('giuong').insert({
          ma_phong: room.ma_phong,
          ma_giuong_hien_thi: `${j}`,
          nhan_giuong: `Giường ${j}`,
          gia_thang: 1500000,
          trang_thai: 'TRONG'
        });
      }
      console.log(`-> Inserted 4 beds for ${room.ma_phong_hien_thi}`);
    }
  }

  // 2. Thêm 2 phòng nguyên căn
  for (let i = 1; i <= 2; i++) {
    const ma_phong_hien_thi = `TEST_RIENG_30${i}`;
    const { data: room, error } = await supabase.from('phong').insert({
      ma_toa: tang.ma_toa,
      ma_tang: tang.ma_tang,
      ma_phong_hien_thi,
      loai_phong: 'PHONG_RIENG',
      suc_chua: 2,
      gia_thang: 5000000,
      trang_thai: 'TRONG',
      gioi_tinh: 'Nam/Nữ'
    }).select().single();

    if (error) {
      console.error(`Error inserting ${ma_phong_hien_thi}:`, error);
    } else {
      console.log(`Inserted private room: ${room.ma_phong_hien_thi}`);
    }
  }

  console.log("XONG!");
}

insertTestRooms();
