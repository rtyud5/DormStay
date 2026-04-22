import React, { useState, useEffect, useRef } from "react";
// Nhớ thêm cấu hình optimizeDeps trong vite.config.js như đã hướng dẫn nếu Vite báo lỗi import
import { usePayOS } from "@payos/payos-checkout"; 
import PaymentService from "../services/payment.service"; // Gọi đúng service backend của bạn
import Card from "../components/ui/Card";
import PageHeader from "../components/common/PageHeader";
import Button from "../components/ui/Button";

const PayOS = ({ amount, description, onSuccess, onCancel }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [isCreatingLink, setIsCreatingLink] = useState(false);
  const [error, setError] = useState("");

  // Cấu hình ban đầu cho PayOS
  const [payOSConfig, setPayOSConfig] = useState({
    RETURN_URL: window.location.href, 
    ELEMENT_ID: "embedded-payment-container", 
    CHECKOUT_URL: null, 
    embedded: true, 
    onSuccess: (event) => {
      setIsOpen(false);
      setMessage("Thanh toán thành công!");
      if (onSuccess) onSuccess(event);
    },
    onCancel: (event) => {
      setIsOpen(false);
      if (onCancel) onCancel(event);
    },
  });

  const { open, exit } = usePayOS(payOSConfig);
  const initialized = useRef(false);

  const handleCreatePayment = async () => {
    if (isCreatingLink) return;
    setIsCreatingLink(true);
    setError("");
    
    // Đóng luồng cũ trước khi tạo mới (Học từ code mẫu PayOS)
    exit();

    try {
      // Hết hạn sau 24 giờ (theo yêu cầu nghiệp vụ của bạn)
      const expiredAt = Math.floor(Date.now() / 1000) + 60 * 60 * 24; // 24 giờ sau (tùy chỉnh theo nhu cầu)

      // GỌI ĐÚNG API BACKEND CỦA BẠN THÔNG QUA PAYMENT SERVICE
      const response = await PaymentService.createPayOSPayment({
        amount,
        description: description ? description.substring(0, 25) : "Thanh toan DormStay",
        returnUrl: window.location.href,
        cancelUrl: window.location.href,
        expiredAt
      });

      // Lấy URL trả về từ backend của bạn
      const url = response.data?.data?.checkoutUrl;

      if (url) {
        // Cập nhật URL mới vào config
        setPayOSConfig((oldConfig) => ({
          ...oldConfig,
          CHECKOUT_URL: url,
        }));
        setIsOpen(true);
      } else {
        throw new Error("Không lấy được Checkout URL từ server DormStay");
      }
    } catch (err) {
      console.error("PayOS Error:", err);
      setError("Lỗi khởi tạo thanh toán từ Server.");
    } finally {
      setIsCreatingLink(false);
    }
  };

  // Tự động gọi API tạo link ngay khi vào trang
  useEffect(() => {
    if (!initialized.current) {
      handleCreatePayment();
      initialized.current = true;
    }
  }, []);

  // Tự động mở iframe khi CHECKOUT_URL đã sẵn sàng (Học từ code mẫu PayOS)
  useEffect(() => {
    if (payOSConfig.CHECKOUT_URL != null) {
      open();
    }
  }, [payOSConfig]);

  // Giao diện khi thanh toán xong
  if (message) {
    return (
      <Card>
        <div className="text-center py-8">
          <p className="text-green-600 font-bold mb-4">{message}</p>
          <Button onClick={() => (window.location.href = "/")}>Về trang chủ</Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6 sticky top-24">
      <PageHeader title="Thanh toán" description="Vui lòng thực hiện thanh toán qua cổng PayOS" />
      <Card title="Cổng thanh toán trực tuyến">
        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg flex justify-between items-center">
            <span className="font-medium text-slate-600">Tổng tiền cọc:</span>
            <span className="font-black text-[18px] text-blue-700">
              {new Intl.NumberFormat("vi-VN").format(amount)} VND
            </span>
          </div>

          {isCreatingLink && (
            <div className="text-center py-6 font-medium animate-pulse text-slate-500">
              Đang khởi tạo mã QR thanh toán...
            </div>
          )}

          {error && (
            <div className="text-red-500 text-sm text-center py-4 bg-red-50 rounded-lg border border-red-100">
              {error} 
              <button onClick={handleCreatePayment} className="underline text-blue-600 ml-2 font-medium">Thử lại</button>
            </div>
          )}

          {/* QUAN TRỌNG: Div chứa iframe KHÔNG BAO GIỜ bị xóa khỏi DOM */}
          <div 
            id="embedded-payment-container" 
            style={{ 
              height: isOpen ? "400px" : "0px", // Ẩn hiện mượt mà bằng CSS height
              overflow: "hidden",
              transition: "height 0.3s ease-in-out",
              width: "100%"
            }}
          ></div>

          {isOpen && (
            <Button 
              variant="secondary" 
              className="w-full mt-4" 
              onClick={() => { 
                setIsOpen(false);
                exit(); // Hủy nhúng PayOS
                if(onCancel) onCancel(); // Gọi hàm Hủy để trả form về trạng thái ban đầu
              }}
            >
              Hủy bỏ thanh toán
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};

export default PayOS;