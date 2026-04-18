const { supabase } = require("../config/supabase");
const { payOS } = require("../config/payos");
const TABLE_NAME = "thanh_toan";

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
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async create(payload) {
    if (!supabase) return null;

    const { data, error } = await supabase
      .from(TABLE_NAME)
      .insert(payload)
      .select("*")
      .single();

    if (error) throw error;
    return data;
  },

  async createPayOSPayment({ amount, description, returnUrl, cancelUrl }) {
    try {
      const paymentData = {
        orderCode : Number(String(Date.now()).slice(-9)),
        amount,
        description: description.substring(0, 25), // PayOS giới hạn 25 ký tự
        returnUrl,
        cancelUrl,
        expiredAt: Math.floor(Date.now() / 1000) + 15 * 60,
      };
      const paymentLinkResponse = await payOS.paymentRequests.create(paymentData);
      console.log("PayOS Payment Link Response:", paymentLinkResponse);
      return paymentLinkResponse;
    } catch (error) {
      throw error;
    }
  }
};

module.exports = PaymentModel;
