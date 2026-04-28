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

  async createPayOSPayment({ amount, description, returnUrl, cancelUrl, expiredAt }) {
    try {
      const paymentData = {
        orderCode : Number(String(Date.now()).slice(-9)),
        amount,
        description: description.substring(0, 25), // PayOS giới hạn 25 ký tự
        returnUrl,
        cancelUrl,
        expiredAt : expiredAt || Math.floor(Date.now() / 1000) + 60 * 60 * 24 // Mặc định hết hạn sau 24 giờ nếu không được cung cấp
      };
      const paymentLinkResponse = await payOS.paymentRequests.create(paymentData);
      console.log("PayOS Payment Link Response:", paymentLinkResponse);
      return paymentLinkResponse;
    } catch (error) {
      throw error;
    }
  },
async cancelPayment(paymentLinkId) {
      try {
        let cancelResponse = null;
        const paymentStatusResponse = await payOS.paymentRequests.get(paymentLinkId);
        if (paymentStatusResponse.status === "CANCELED" || paymentStatusResponse.status === "EXPIRED") 
        return { success: true, message: "Payment already cancelled or expired on PayOS" };                                                                                                     
        //1. Bọc try-catch riêng cho PayOS
        try {
          cancelResponse = await payOS.paymentRequests.cancel(paymentLinkId);
          console.log("PayOS Cancel Payment Response:", cancelResponse);
        } catch (payOsError) {
          // Bắt lỗi nếu link đã bị hủy hoặc hết hạn trên PayOS, nhưng không throw để code chạy tiếp
          console.log("Lưu ý từ PayOS (có thể link đã hủy/hết hạn):", payOsError.message);
        }
        
        // 2. Đảm bảo đoạn xóa DB luôn được thực thi
        const { data, error } = await supabase
          .from("yeu_cau_thue")
          .update({ 
            checkoutUrl: null,
            paymentLinkId: null
          })
          .eq("paymentLinkId", paymentLinkId)
          .select("*")
          .single();
          
        if (error) {
          throw error;
        }

        return { success: true, message: "Payment cancelled successfully", data };
      } catch (error) {
        throw error;
      }
    },

  async confirmPayment(paymentLinkId) {
      try {
        const paymentStatusResponse = await payOS.paymentRequests.get(paymentLinkId);
        console.log("PayOS Payment Status Response:", paymentStatusResponse);
        
        // if (paymentStatusResponse.status !== "PAID" && paymentStatusResponse.status !== "COMPLETED") {
          
        //   return { success: false, message: `Payment status is ${paymentStatusResponse.status}. Only PAID or COMPLETED can be confirmed.` };
        // } 
         const { data: requestData, error: requestError } = await supabase
            .from("yeu_cau_thue")
            .update({
               trang_thai: "DA_DUYET",
               checkoutUrl: null,
               paymentLinkId: null,
               updated_at: new Date()
            }) 
            .eq("paymentLinkId", paymentLinkId)
            .select("*")
            .single();
            
          if (requestError) throw requestError;

          return { 
            success: true, 
            message: "Payment confirmed successfully", 
            data: requestData 
          };
          
      } catch (error) {
        console.error("Lỗi khi confirm payment:", error);
        throw error;
      }
  }
};
module.exports = PaymentModel;
