const { supabase } = require("../config/supabase");
const { payOS } = require("../config/payos");

const TABLE_NAME = "thanh_toan";
const PAID_PAYOS_STATUSES = new Set(["PAID", "COMPLETED"]);

const toNumber = (value) => {
  const parsed = Number(value || 0);
  return Number.isFinite(parsed) ? parsed : 0;
};

const toDateOnly = (value) => {
  const date = value ? new Date(value) : new Date();
  if (Number.isNaN(date.getTime())) return new Date().toISOString().slice(0, 10);
  return date.toISOString().slice(0, 10);
};

async function createSystemLog({ tableName, recordId, action, profileId = null, note }) {
  await supabase.from("nhat_ky_he_thong").insert({
    ten_bang: tableName,
    ma_ban_ghi: recordId,
    hanh_dong: action,
    ma_ho_so_nguoi_thuc_hien: profileId,
    ghi_chu: note || null,
  });
}

async function loadRentalRequestByPaymentLink(paymentLinkId) {
  const { data, error } = await supabase
    .from("yeu_cau_thue")
    .select(`
      *,
      giu_cho_tam (
        ma_giuong,
        ma_phong,
        loai_muc_tieu,
        trang_thai
      )
    `)
    .eq("paymentLinkId", paymentLinkId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

async function createOrGetDepositInvoice(request) {
  const { data: existingInvoice, error: existingError } = await supabase
    .from("hoa_don")
    .select("*")
    .eq("ma_yeu_cau_thue", request.ma_yeu_cau_thue)
    .eq("loai_hoa_don", "DAT_COC")
    .maybeSingle();

  if (existingError) throw existingError;
  if (existingInvoice) return existingInvoice;

  const { data: invoice, error } = await supabase
    .from("hoa_don")
    .insert({
      ma_yeu_cau_thue: request.ma_yeu_cau_thue,
      loai_hoa_don: "DAT_COC",
      trang_thai: "DA_THANH_TOAN",
      tong_so_tien: toNumber(request.so_tien_dat_coc),
      so_tien_da_thanh_toan: toNumber(request.so_tien_dat_coc),
      ma_tham_chieu_qr: request.paymentLinkId,
      ngay_lap: toDateOnly(),
      ngay_den_han: toDateOnly(),
    })
    .select("*")
    .single();

  if (error) throw error;
  return invoice;
}

async function createOrGetDepositPayment(invoice, request, paymentStatusResponse) {
  const transactionCode = String(
    paymentStatusResponse?.transactions?.[0]?.reference ||
      paymentStatusResponse?.reference ||
      request.paymentLinkId,
  );

  const { data: existingPayment, error: existingError } = await supabase
    .from(TABLE_NAME)
    .select("*")
    .eq("ma_giao_dich", transactionCode)
    .maybeSingle();

  if (existingError) throw existingError;
  if (existingPayment) return existingPayment;

  const { data: payment, error } = await supabase
    .from(TABLE_NAME)
    .insert({
      ma_hoa_don: invoice.ma_hoa_don,
      phuong_thuc: "PAYOS",
      trang_thai: "DA_XAC_NHAN",
      so_tien: toNumber(request.so_tien_dat_coc),
      ma_giao_dich: transactionCode,
      ten_nguoi_thanh_toan: paymentStatusResponse?.buyerName || null,
      thoi_gian_thanh_toan: new Date().toISOString(),
      thoi_gian_xac_nhan: new Date().toISOString(),
    })
    .select("*")
    .single();

  if (error) throw error;
  return payment;
}

async function createOrGetPreparedContract(request) {
  const { data: existingContract, error: existingError } = await supabase
    .from("hop_dong")
    .select("*")
    .eq("ma_yeu_cau_thue", request.ma_yeu_cau_thue)
    .maybeSingle();

  if (existingError) throw existingError;
  if (existingContract) return existingContract;

  const { data: contract, error } = await supabase
    .from("hop_dong")
    .insert({
      ma_yeu_cau_thue: request.ma_yeu_cau_thue,
      ma_ho_so_khach_hang: request.ma_ho_so_khach_hang,
      loai_muc_tieu: request.loai_muc_tieu,
      ma_phong: request.ma_phong,
      ma_giuong: request.ma_giuong,
      ngay_vao_o: request.ngay_du_kien_vao_o,
      gia_thue_co_ban_thang: request.gia_thue_thang,
      so_tien_dat_coc_bao_dam: request.so_tien_dat_coc,
      trang_thai: "CHO_LAP_KHOAN_THU_DAU",
    })
    .select("*")
    .single();

  if (error) throw error;

  const holdRows = Array.isArray(request.giu_cho_tam) ? request.giu_cho_tam : [];
  const allocationPayloads = holdRows
    .filter((hold) => hold.ma_giuong || hold.ma_phong)
    .map((hold) => ({
      ma_hop_dong: contract.ma_hop_dong,
      loai_muc_tieu: request.loai_muc_tieu,
      ma_phong: hold.ma_phong || request.ma_phong,
      ma_giuong: hold.ma_giuong || null,
      ngay_bat_dau: request.ngay_du_kien_vao_o,
      trang_thai: "CHO_HIEU_LUC",
    }));

  if (allocationPayloads.length) {
    const { error: allocationError } = await supabase.from("phan_bo_hop_dong").insert(allocationPayloads);
    if (allocationError) throw allocationError;
  }

  await createSystemLog({
    tableName: "hop_dong",
    recordId: contract.ma_hop_dong,
    action: "TAO_SAN_SAU_COC",
    note: "Hop dong duoc tao san sau khi khach hang thanh toan coc PayOS, cho Accounting/Sale lap khoan thu dau.",
  });

  return contract;
}

async function markRequestDepositPaid(request) {
  const { data: updatedRequest, error } = await supabase
    .from("yeu_cau_thue")
    .update({
      trang_thai: "DA_COC",
      checkoutUrl: null,
      paymentLinkId: null,
      updated_at: new Date().toISOString(),
    })
    .eq("ma_yeu_cau_thue", request.ma_yeu_cau_thue)
    .select("*")
    .single();

  if (error) throw error;

  const { error: holdError } = await supabase
    .from("giu_cho_tam")
    .update({
      trang_thai: "DA_XAC_NHAN_COC",
      updated_at: new Date().toISOString(),
    })
    .eq("ma_yeu_cau_thue", request.ma_yeu_cau_thue)
    .eq("trang_thai", "DANG_GIU");

  if (holdError) throw holdError;
  return updatedRequest;
}

const PaymentModel = {
  async listByUserId(userId) {
    if (!supabase) return [];

    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select(`
        *,
        hoa_don!inner (
          ma_hop_dong,
          hop_dong!inner (
            ho_so!inner ( ma_nguoi_dung_xac_thuc )
          )
        )
      `)
      .eq("hoa_don.hop_dong.ho_so.ma_nguoi_dung_xac_thuc", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async create(payload) {
    if (!supabase) return null;

    const invoiceId = payload.ma_hoa_don || payload.invoiceId;
    const amount = toNumber(payload.so_tien || payload.amount);

    const { data: invoice, error: invoiceError } = await supabase
      .from("hoa_don")
      .select("*")
      .eq("ma_hoa_don", invoiceId)
      .maybeSingle();

    if (invoiceError) throw invoiceError;
    if (!invoice) throw new Error("Hoa don khong ton tai");

    const nextPaidAmount = Math.min(toNumber(invoice.so_tien_da_thanh_toan) + amount, toNumber(invoice.tong_so_tien));
    const isFullyPaid = nextPaidAmount >= toNumber(invoice.tong_so_tien);

    const { data, error } = await supabase
      .from(TABLE_NAME)
      .insert({
        ma_hoa_don: invoiceId,
        phuong_thuc: payload.phuong_thuc || payload.method || "PAYOS",
        trang_thai: payload.trang_thai || "DA_XAC_NHAN",
        so_tien: amount,
        ma_giao_dich: payload.ma_giao_dich || payload.transactionCode || null,
        ten_nguoi_thanh_toan: payload.ten_nguoi_thanh_toan || payload.payerName || null,
        thoi_gian_thanh_toan: payload.thoi_gian_thanh_toan || new Date().toISOString(),
        thoi_gian_xac_nhan: payload.thoi_gian_xac_nhan || new Date().toISOString(),
      })
      .select("*")
      .single();

    if (error) throw error;

    const { error: updateInvoiceError } = await supabase
      .from("hoa_don")
      .update({
        so_tien_da_thanh_toan: nextPaidAmount,
        trang_thai: isFullyPaid ? "DA_THANH_TOAN" : "CHO_THANH_TOAN",
        updated_at: new Date().toISOString(),
      })
      .eq("ma_hoa_don", invoiceId);

    if (updateInvoiceError) throw updateInvoiceError;

    // // Debug logging
    // console.log("Payment created:", {
    //   invoiceId,
    //   amount,
    //   nextPaidAmount,
    //   isFullyPaid,
    //   invoiceContractId: invoice.ma_hop_dong,
    //   invoiceType: invoice.loai_hoa_don,
    //   shouldActivate: isFullyPaid && invoice.ma_hop_dong && String(invoice.loai_hoa_don || "").toUpperCase().includes("KY_DAU")
    // });

    if (isFullyPaid && invoice.ma_hop_dong && String(invoice.loai_hoa_don || "").toUpperCase().includes("KY_DAU")) {
      // console.log("Activating contract after initial payment:", invoice.ma_hop_dong);
      await this.activateContractAfterInitialPayment(invoice.ma_hop_dong);
    }

    return data;
  },

  async activateContractAfterInitialPayment(contractId) {
    // console.log("Starting contract activation for:", contractId);

    const { data: contract, error: contractError } = await supabase
      .from("hop_dong")
      .select("ma_hop_dong, loai_muc_tieu, ma_phong, ma_giuong, trang_thai, ma_yeu_cau_thue")
      .eq("ma_hop_dong", contractId)
      .maybeSingle();

    if (contractError) {
      console.error("Error fetching contract:", contractError);
      throw contractError;
    }
    if (!contract) {
      console.log("Contract not found:", contractId);
      return null;
    }

    // console.log("Contract current status:", contract.trang_thai);

    const { error: updateContractError } = await supabase
      .from("hop_dong")
      .update({
        trang_thai: "HIEU_LUC",
        updated_at: new Date().toISOString(),
      })
      .eq("ma_hop_dong", contractId);

    if (updateContractError) {
      console.error("Error updating contract status:", updateContractError);
      throw updateContractError;
    }

    console.log("Contract status updated to HIEU_LUC");

    const { error: allocationError } = await supabase
      .from("phan_bo_hop_dong")
      .update({
        trang_thai: "HIEU_LUC",
        updated_at: new Date().toISOString(),
      })
      .eq("ma_hop_dong", contractId)
      .in("trang_thai", ["CHO_HIEU_LUC", "CHO_LAP_KHOAN_THU_DAU"]);

    if (allocationError) {
      console.error("Error updating allocations:", allocationError);
      throw allocationError;
    }

    // console.log("Allocations updated to HIEU_LUC");

    const { data: allocations, error: allocationsQueryError } = await supabase
      .from("phan_bo_hop_dong")
      .select("ma_giuong, ma_phong")
      .eq("ma_hop_dong", contractId);

    if (allocationsQueryError) throw allocationsQueryError;

    const allocatedBedIds = [...new Set((allocations || []).map((item) => item.ma_giuong).filter(Boolean))];
    const allocatedRoomIds = [...new Set((allocations || []).map((item) => item.ma_phong).filter(Boolean))];

    // Track rooms that had beds updated (for trigger to handle status)
    const roomsWithBedsUpdated = new Set();

    if (allocatedBedIds.length) {
      const { error: bedError } = await supabase
        .from("giuong")
        .update({ trang_thai: "DA_THUE", updated_at: new Date().toISOString() })
        .in("ma_giuong", allocatedBedIds);
      if (bedError) throw bedError;

      // Track which rooms had beds updated
      for (const bedId of allocatedBedIds) {
        const { data: bed } = await supabase
          .from("giuong")
          .select("ma_phong")
          .eq("ma_giuong", bedId)
          .maybeSingle();
        if (bed?.ma_phong) roomsWithBedsUpdated.add(bed.ma_phong);
      }
    } else if (contract.loai_muc_tieu === "GIUONG" && contract.ma_giuong) {
      const { error: bedError } = await supabase
        .from("giuong")
        .update({ trang_thai: "DA_THUE", updated_at: new Date().toISOString() })
        .eq("ma_giuong", contract.ma_giuong);
      if (bedError) throw bedError;

      // Track the room
      const { data: bed } = await supabase
        .from("giuong")
        .select("ma_phong")
        .eq("ma_giuong", contract.ma_giuong)
        .maybeSingle();
      if (bed?.ma_phong) roomsWithBedsUpdated.add(bed.ma_phong);
    }

    // Handle room status updates
    // For whole room rentals (loai_muc_tieu === "PHONG")
    if (contract.loai_muc_tieu === "PHONG" && contract.ma_phong) {
      // Check if room has beds
      const { data: bedCount, error: bedCountError } = await supabase
        .from("giuong")
        .select("ma_giuong", { count: "exact" })
        .eq("ma_phong", contract.ma_phong);

      if (!bedCountError) {
        // If room has no beds, mark as DAY (whole room rental)
        // If room has beds, trigger will handle status update
        if ((bedCount?.length || 0) === 0) {
          const { error: roomError } = await supabase
            .from("phong")
            .update({ trang_thai: "DAY", updated_at: new Date().toISOString() })
            .eq("ma_phong", contract.ma_phong);
          if (roomError) throw roomError;
        }
      }
    }
    // For bed rentals (loai_muc_tieu === "GIUONG"), let the trigger handle status
    // The trigger will mark room as DAY when all beds are rented, or SAP_DAY if partial

    // Update rental request status to DA_DUYET after contract activation
    if (contract.ma_yeu_cau_thue) {
      const { error: rentalRequestError } = await supabase
        .from("yeu_cau_thue")
        .update({
          trang_thai: "DA_DUYET",
          updated_at: new Date().toISOString(),
        })
        .eq("ma_yeu_cau_thue", contract.ma_yeu_cau_thue);

      if (rentalRequestError) {
        console.error("Error updating rental request status:", rentalRequestError);
        throw rentalRequestError;
      }

      console.log("Rental request status updated to DA_DUYET");

      await createSystemLog({
        tableName: "yeu_cau_thue",
        recordId: contract.ma_yeu_cau_thue,
        action: "DUYET_YEU_CAU",
        note: `Yeu cau thue duoc duyet sau khi thanh toan ky dau hop dong HD-${contractId}.`,
      });
    }

    await createSystemLog({
      tableName: "hop_dong",
      recordId: contractId,
      action: "KICH_HOAT_HOP_DONG",
      note: "Hop dong duoc kich hoat sau khi khach hang thanh toan khoan thu ky dau.",
    });

    return contractId;
  },

  async createPayOSPayment({ amount, description, returnUrl, cancelUrl, expiredAt }) {
    const paymentData = {
      orderCode: Number(String(Date.now()).slice(-9)),
      amount: Math.round(toNumber(amount)),
      description: String(description || "Thanh toan DormStay").substring(0, 25),
      returnUrl,
      cancelUrl,
      expiredAt: expiredAt || Math.floor(Date.now() / 1000) + 60 * 60 * 24,
    };

    return payOS.paymentRequests.create(paymentData);
  },

  async cancelPayment(paymentLinkId) {
    let cancelResponse = null;
    const paymentStatusResponse = await payOS.paymentRequests.get(paymentLinkId);
    if (["CANCELED", "EXPIRED"].includes(paymentStatusResponse.status)) {
      return { success: true, message: "Payment already cancelled or expired on PayOS" };
    }

    try {
      cancelResponse = await payOS.paymentRequests.cancel(paymentLinkId);
      console.log("PayOS Cancel Payment Response:", cancelResponse);
    } catch (payOsError) {
      console.log("PayOS cancel note:", payOsError.message);
    }

    const { data, error } = await supabase
      .from("yeu_cau_thue")
      .update({
        checkoutUrl: null,
        paymentLinkId: null,
        updated_at: new Date().toISOString(),
      })
      .eq("paymentLinkId", paymentLinkId)
      .select("*")
      .single();

    if (error) throw error;

    return { success: true, message: "Payment cancelled successfully", data, cancelResponse };
  },

  async confirmPayment(paymentLinkId) {
    const paymentStatusResponse = await payOS.paymentRequests.get(paymentLinkId);
    console.log("PayOS Payment Status Response:", paymentStatusResponse);

    if (!PAID_PAYOS_STATUSES.has(String(paymentStatusResponse.status || "").toUpperCase())) {
      return {
        success: false,
        message: `Payment status is ${paymentStatusResponse.status}. Only PAID or COMPLETED can be confirmed.`,
      };
    }

    const request = await loadRentalRequestByPaymentLink(paymentLinkId);
    if (!request) {
      return {
        success: false,
        message: "No rental request found for this PayOS payment link",
      };
    }

    const invoice = await createOrGetDepositInvoice(request);
    const payment = await createOrGetDepositPayment(invoice, request, paymentStatusResponse);
    const contract = await createOrGetPreparedContract(request);
    const updatedRequest = await markRequestDepositPaid(request);

    await createSystemLog({
      tableName: "yeu_cau_thue",
      recordId: updatedRequest.ma_yeu_cau_thue,
      action: "THANH_TOAN_COC_THANH_CONG",
      profileId: request.ma_ho_so_khach_hang,
      note: `Da ghi nhan coc PayOS va tao hop dong HD-${contract.ma_hop_dong}.`,
    });

    return {
      success: true,
      message: "Deposit payment confirmed and prepared contract created",
      data: {
        rentalRequest: updatedRequest,
        depositInvoice: invoice,
        payment,
        contract,
      },
    };
  },

  async processPaymentForInvoice(payload) {
    return this.create(payload);
  },
};

module.exports = PaymentModel;
