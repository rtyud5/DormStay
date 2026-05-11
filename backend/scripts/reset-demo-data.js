const { supabase } = require("../src/config/supabase");
const env = require("../src/config/env");

const KEEP_ROLES = new Set(["QUAN_LY", "KE_TOAN", "SALE"]);
const MUST_CONFIRM = process.argv.includes("--yes");

const TABLES_TO_COUNT = [
  "ho_so",
  "profiles",
  "toa",
  "tang",
  "phong",
  "giuong",
  "hinh_anh_phong",
  "tai_san_phong",
  "yeu_cau_thue",
  "nhat_ky_yeu_cau_thue",
  "giu_cho_tam",
  "hop_dong",
  "hoa_don",
  "thanh_toan",
  "bien_lai",
  "phan_bo_hop_dong",
  "khoan_thu_hop_dong",
  "chi_tiet_hoa_don",
  "yeu_cau_tra_phong",
  "bien_ban_kiem_tra",
  "chi_tiet_kiem_tra",
  "doi_soat_tai_chinh",
  "chi_tiet_doi_soat_tai_chinh",
  "phieu_thanh_toan_phat_sinh",
  "phieu_hoan_coc",
  "nhat_ky_he_thong",
];

const DELETE_ORDER = [
  ["chi_tiet_doi_soat_tai_chinh", "ma_chi_tiet_doi_soat"],
  ["phieu_thanh_toan_phat_sinh", "ma_phieu_tt_phat_sinh"],
  ["phieu_hoan_coc", "ma_phieu_hoan_coc"],
  ["doi_soat_tai_chinh", "ma_doi_soat"],
  ["chi_tiet_kiem_tra", "ma_chi_tiet_kiem_tra"],
  ["bien_ban_kiem_tra", "ma_bien_ban_kiem_tra"],
  ["yeu_cau_tra_phong", "ma_yeu_cau_tra_phong"],
  ["bien_lai", "ma_bien_lai"],
  ["thanh_toan", "ma_thanh_toan"],
  ["chi_tiet_hoa_don", "ma_chi_tiet_hoa_don"],
  ["khoan_thu_hop_dong", "ma_khoan_thu"],
  ["hoa_don", "ma_hoa_don"],
  ["phan_bo_hop_dong", "ma_phan_bo"],
  ["hop_dong", "ma_hop_dong"],
  ["nhat_ky_yeu_cau_thue", "ma_nhat_ky"],
  ["giu_cho_tam", "ma_giu_cho_tam"],
  ["yeu_cau_thue", "ma_yeu_cau_thue"],
  ["nhat_ky_he_thong", "ma_nhat_ky_he_thong"],
  ["tai_san_phong", "ma_tai_san"],
  ["hinh_anh_phong", "ma_hinh_anh"],
  ["giuong", "ma_giuong"],
  ["phong", "ma_phong"],
  ["tang", "ma_tang"],
  ["toa", "ma_toa"],
];

const FLOOR_LABEL = "T\u1ea7ng";
const GENDER_FEMALE = "N\u1eef";
const GENDER_MIXED = "Nam/N\u1eef";

const COVER_IMAGES = {
  PHONG_CHUNG:
    "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=900&q=80",
  PHONG_RIENG:
    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=900&q=80",
};

const EXTRA_IMAGE =
  "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=900&q=80";

function normalizeRole(role) {
  return String(role || "").trim().toUpperCase();
}

function chunk(values, size = 500) {
  const result = [];
  for (let index = 0; index < values.length; index += size) {
    result.push(values.slice(index, index + size));
  }
  return result;
}

async function requireOk(result, context) {
  if (result.error) {
    throw new Error(`${context}: ${result.error.message}`);
  }
  return result.data;
}

async function countRows(tableName) {
  const { count, error } = await supabase
    .from(tableName)
    .select("*", { count: "exact", head: true });

  if (error) return { error: error.message };
  return count || 0;
}

async function getCounts() {
  const entries = [];
  for (const tableName of TABLES_TO_COUNT) {
    entries.push([tableName, await countRows(tableName)]);
  }
  return Object.fromEntries(entries);
}

async function getHoSoRows() {
  const { data, error } = await supabase
    .from("ho_so")
    .select("ma_ho_so, ma_nguoi_dung_xac_thuc, vai_tro, email, ho_ten, so_dien_thoai, avatar_url");

  if (error) throw error;
  return data || [];
}

function summarizeRoles(rows) {
  return rows.reduce((summary, row) => {
    const role = normalizeRole(row.vai_tro) || "UNKNOWN";
    summary[role] = (summary[role] || 0) + 1;
    return summary;
  }, {});
}

function isKeptStaffHoSo(row) {
  return Boolean(row?.ma_nguoi_dung_xac_thuc) && KEEP_ROLES.has(normalizeRole(row?.vai_tro));
}

async function deleteRowsByIds(tableName, primaryKey, ids) {
  const cleanIds = ids.filter((value) => value !== null && value !== undefined);
  if (!cleanIds.length) return 0;

  let deleted = 0;
  for (const idChunk of chunk(cleanIds)) {
    const { error } = await supabase.from(tableName).delete().in(primaryKey, idChunk);
    if (error) throw new Error(`delete ${tableName}: ${error.message}`);
    deleted += idChunk.length;
  }
  return deleted;
}

async function deleteAllRows(tableName, primaryKey) {
  const { data, error } = await supabase.from(tableName).select(primaryKey);
  if (error) throw new Error(`select ${tableName}: ${error.message}`);

  return deleteRowsByIds(
    tableName,
    primaryKey,
    (data || []).map((row) => row[primaryKey]),
  );
}

async function listAuthUsers() {
  const users = [];
  let page = 1;

  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) throw error;

    const pageUsers = data?.users || [];
    users.push(...pageUsers);
    if (pageUsers.length < 1000) break;
    page += 1;
  }

  return users;
}

async function deleteNonKeptAuthUsers(hoSoRows) {
  const profileByAuthId = new Map(
    hoSoRows
      .filter((row) => row.ma_nguoi_dung_xac_thuc)
      .map((row) => [row.ma_nguoi_dung_xac_thuc, row]),
  );
  const users = await listAuthUsers();
  let deleted = 0;

  for (const user of users) {
    const profile = profileByAuthId.get(user.id);
    const shouldKeep = profile && KEEP_ROLES.has(normalizeRole(profile.vai_tro));
    if (shouldKeep) continue;

    const { error } = await supabase.auth.admin.deleteUser(user.id);
    if (error) throw new Error(`delete auth user ${user.email || user.id}: ${error.message}`);
    deleted += 1;
  }

  return deleted;
}

async function deleteLegacyProfilesExcept(authIdsToKeep) {
  const { data, error } = await supabase.from("profiles").select("id");
  if (error) throw new Error(`select profiles: ${error.message}`);

  const idsToDelete = (data || [])
    .map((row) => row.id)
    .filter((id) => !authIdsToKeep.has(id));

  return deleteRowsByIds("profiles", "id", idsToDelete);
}

async function syncLegacyProfilesForKeptStaff(hoSoRows) {
  const profileRows = hoSoRows
    .filter(isKeptStaffHoSo)
    .map((row) => ({
      id: row.ma_nguoi_dung_xac_thuc,
      full_name: row.ho_ten || null,
      phone: row.so_dien_thoai || null,
      avatar_url: row.avatar_url || null,
      role: normalizeRole(row.vai_tro),
    }));

  if (!profileRows.length) return 0;

  const { error } = await supabase
    .from("profiles")
    .upsert(profileRows, { onConflict: "id" });

  if (error) throw new Error(`upsert profiles: ${error.message}`);
  return profileRows.length;
}

async function resetBusinessData() {
  const deleted = {};
  for (const [tableName, primaryKey] of DELETE_ORDER) {
    deleted[tableName] = await deleteAllRows(tableName, primaryKey);
  }
  return deleted;
}

function buildSeedBuildings() {
  return ["A", "B", "C", "D"].map((code, index) => ({
    ma_dinh_danh: `DS-${code}`,
    ten: `Toa ${code} - DormStay`,
    dia_chi: `${100 + index} DormStay Street`,
    quan_huyen: `Quan ${index + 1}`,
    thanh_pho: "TP HCM",
  }));
}

function roomSpec(letter, floorNumber, roomNumber) {
  if (roomNumber === 1) {
    return {
      roomCode: `${letter}${floorNumber}01`,
      type: "PHONG_CHUNG",
      bedCount: 3,
      price: 1800000 + floorNumber * 100000,
    };
  }

  if (roomNumber === 2) {
    return {
      roomCode: `${letter}${floorNumber}02`,
      type: "PHONG_CHUNG",
      bedCount: 2,
      price: 2200000 + floorNumber * 100000,
    };
  }

  return {
    roomCode: `${letter}${floorNumber}03`,
    type: "PHONG_RIENG",
    bedCount: 1,
    price: 4500000 + floorNumber * 250000,
  };
}

function genderFor(buildingIndex, floorNumber, roomNumber) {
  const value = (buildingIndex + floorNumber + roomNumber) % 3;
  if (value === 0) return "Nam";
  if (value === 1) return GENDER_FEMALE;
  return GENDER_MIXED;
}

async function seedDemoSpace() {
  const buildings = await requireOk(
    await supabase.from("toa").insert(buildSeedBuildings()).select("*"),
    "insert toa",
  );

  const buildingByCode = new Map(buildings.map((building) => [building.ma_dinh_danh, building]));
  const floorRows = [];

  for (const [index, letter] of ["A", "B", "C", "D"].entries()) {
    const building = buildingByCode.get(`DS-${letter}`);
    for (let floorNumber = 1; floorNumber <= 3; floorNumber += 1) {
      floorRows.push({
        ma_toa: building.ma_toa,
        so_tang: floorNumber,
        ten_tang: `${FLOOR_LABEL} ${floorNumber}`,
        _buildingIndex: index,
        _letter: letter,
      });
    }
  }

  const insertedFloors = await requireOk(
    await supabase
      .from("tang")
      .insert(floorRows.map(({ _buildingIndex, _letter, ...row }) => row))
      .select("*"),
    "insert tang",
  );

  const floorByBuildingAndNumber = new Map(
    insertedFloors.map((floor) => [`${floor.ma_toa}:${floor.so_tang}`, floor]),
  );
  const roomRows = [];
  const roomMetaByCode = new Map();

  for (const [buildingIndex, letter] of ["A", "B", "C", "D"].entries()) {
    const building = buildingByCode.get(`DS-${letter}`);
    for (let floorNumber = 1; floorNumber <= 3; floorNumber += 1) {
      const floor = floorByBuildingAndNumber.get(`${building.ma_toa}:${floorNumber}`);
      for (let roomNumber = 1; roomNumber <= 3; roomNumber += 1) {
        const spec = roomSpec(letter, floorNumber, roomNumber);
        roomRows.push({
          ma_toa: building.ma_toa,
          ma_tang: floor.ma_tang,
          ma_phong_hien_thi: spec.roomCode,
          loai_phong: spec.type,
          suc_chua: spec.bedCount,
          gia_thang: spec.price,
          trang_thai: "TRONG",
          gioi_tinh: genderFor(buildingIndex, floorNumber, roomNumber),
        });
        roomMetaByCode.set(`${building.ma_toa}:${spec.roomCode}`, spec);
      }
    }
  }

  const rooms = await requireOk(
    await supabase.from("phong").insert(roomRows).select("*"),
    "insert phong",
  );

  const bedRows = [];
  const imageRows = [];
  const assetRows = [];

  for (const room of rooms) {
    const spec = roomMetaByCode.get(`${room.ma_toa}:${room.ma_phong_hien_thi}`);
    for (let bedNumber = 1; bedNumber <= spec.bedCount; bedNumber += 1) {
      bedRows.push({
        ma_phong: room.ma_phong,
        ma_giuong_hien_thi: `G${bedNumber}`,
        nhan_giuong: `Giuong ${bedNumber}`,
        gia_thang: spec.type === "PHONG_CHUNG" ? spec.price : spec.price,
        trang_thai: "TRONG",
      });
    }

    imageRows.push(
      {
        ma_phong: room.ma_phong,
        duong_dan_cong_khai: COVER_IMAGES[spec.type] || COVER_IMAGES.PHONG_RIENG,
        la_anh_bia: true,
        thu_tu_hien_thi: 1,
      },
      {
        ma_phong: room.ma_phong,
        duong_dan_cong_khai: EXTRA_IMAGE,
        la_anh_bia: false,
        thu_tu_hien_thi: 2,
      },
    );

    assetRows.push(
      {
        ma_phong: room.ma_phong,
        ma_tai_san_hien_thi: "WIFI",
        ten_tai_san: "Wifi",
        danh_muc: "TIEN_ICH",
        muc_boi_thuong_mac_dinh: 0,
      },
      {
        ma_phong: room.ma_phong,
        ma_tai_san_hien_thi: "AC",
        ten_tai_san: "Dieu hoa",
        danh_muc: "THIET_BI",
        muc_boi_thuong_mac_dinh: 2500000,
      },
    );
  }

  await requireOk(await supabase.from("giuong").insert(bedRows).select("ma_giuong"), "insert giuong");
  await requireOk(
    await supabase.from("hinh_anh_phong").insert(imageRows).select("ma_hinh_anh"),
    "insert hinh_anh_phong",
  );
  await requireOk(
    await supabase.from("tai_san_phong").insert(assetRows).select("ma_tai_san"),
    "insert tai_san_phong",
  );

  return {
    toa: buildings.length,
    tang: insertedFloors.length,
    phong: rooms.length,
    giuong: bedRows.length,
    hinh_anh_phong: imageRows.length,
    tai_san_phong: assetRows.length,
  };
}

async function assertFinalState() {
  const [counts, hoSoRows, authUsers] = await Promise.all([
    getCounts(),
    getHoSoRows(),
    listAuthUsers(),
  ]);
  const invalidProfiles = hoSoRows.filter((row) => !KEEP_ROLES.has(normalizeRole(row.vai_tro)));
  const invalidAuthBackedProfiles = hoSoRows.filter((row) => !isKeptStaffHoSo(row));
  const profileByAuthId = new Map(
    hoSoRows
      .filter((row) => row.ma_nguoi_dung_xac_thuc)
      .map((row) => [row.ma_nguoi_dung_xac_thuc, row]),
  );
  const invalidAuthUsers = authUsers.filter((user) => {
    const profile = profileByAuthId.get(user.id);
    return !profile || !KEEP_ROLES.has(normalizeRole(profile.vai_tro));
  });

  const expectedCounts = { toa: 4, tang: 12, phong: 36, giuong: 72 };
  for (const [tableName, expectedCount] of Object.entries(expectedCounts)) {
    if (counts[tableName] !== expectedCount) {
      throw new Error(`Expected ${tableName}=${expectedCount}, got ${counts[tableName]}`);
    }
  }

  if (counts.profiles !== authUsers.length) {
    throw new Error(`Expected profiles=${authUsers.length}, got ${counts.profiles}`);
  }

  for (const tableName of [
    "yeu_cau_thue",
    "giu_cho_tam",
    "hop_dong",
    "hoa_don",
    "thanh_toan",
    "yeu_cau_tra_phong",
    "doi_soat_tai_chinh",
    "phieu_hoan_coc",
    "phieu_thanh_toan_phat_sinh",
  ]) {
    if (counts[tableName] !== 0) {
      throw new Error(`Expected ${tableName}=0 after clean reset, got ${counts[tableName]}`);
    }
  }

  if (invalidProfiles.length) {
    throw new Error(`Non-kept ho_so remain: ${invalidProfiles.map((row) => row.email).join(", ")}`);
  }

  if (invalidAuthBackedProfiles.some((row) => !row.ma_nguoi_dung_xac_thuc)) {
    throw new Error(
      `Role-only ho_so remain: ${invalidAuthBackedProfiles
        .filter((row) => !row.ma_nguoi_dung_xac_thuc)
        .map((row) => row.email)
        .join(", ")}`,
    );
  }

  if (invalidAuthUsers.length) {
    throw new Error(`Non-kept auth users remain: ${invalidAuthUsers.map((user) => user.email).join(", ")}`);
  }

  return {
    counts,
    roleCounts: summarizeRoles(hoSoRows),
    authUserCount: authUsers.length,
  };
}

async function main() {
  if (!supabase || !env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Missing Supabase service role configuration.");
  }

  console.log("DormStay demo reset");
  console.log("Keep roles:", Array.from(KEEP_ROLES).join(", "));
  console.log("Before:", JSON.stringify(await getCounts(), null, 2));
  console.log("Roles before:", JSON.stringify(summarizeRoles(await getHoSoRows()), null, 2));

  if (!MUST_CONFIRM) {
    console.log("Guard active: rerun with --yes to reset and seed demo data.");
    console.log("Command: npm run db:reset-demo -- --yes");
    return;
  }

  const initialProfiles = await getHoSoRows();
  const keptAuthIds = new Set(
    initialProfiles
      .filter((row) => KEEP_ROLES.has(normalizeRole(row.vai_tro)) && row.ma_nguoi_dung_xac_thuc)
      .map((row) => row.ma_nguoi_dung_xac_thuc),
  );

  console.log("Deleting business data...");
  console.log("Deleted:", JSON.stringify(await resetBusinessData(), null, 2));

  console.log("Deleting non-kept auth users...");
  console.log("Deleted auth users:", await deleteNonKeptAuthUsers(initialProfiles));

  console.log("Deleting legacy profiles outside kept auth users...");
  console.log("Deleted legacy profiles:", await deleteLegacyProfilesExcept(keptAuthIds));

  const currentProfiles = await getHoSoRows();
  const nonKeptProfileIds = currentProfiles
    .filter((row) => !isKeptStaffHoSo(row))
    .map((row) => row.ma_ho_so);
  console.log("Deleted non-kept ho_so:", await deleteRowsByIds("ho_so", "ma_ho_so", nonKeptProfileIds));

  const keptStaffProfiles = await getHoSoRows();
  console.log("Syncing legacy profiles for kept staff...");
  console.log("Upserted profiles:", await syncLegacyProfilesForKeptStaff(keptStaffProfiles));

  console.log("Seeding rooms...");
  console.log("Seeded:", JSON.stringify(await seedDemoSpace(), null, 2));

  const finalState = await assertFinalState();
  console.log("After:", JSON.stringify(finalState.counts, null, 2));
  console.log("Roles after:", JSON.stringify(finalState.roleCounts, null, 2));
  console.log("Auth users after:", finalState.authUserCount);
  console.log("Done.");
}

main().catch((error) => {
  console.error("Reset failed:", error.message);
  process.exitCode = 1;
});
