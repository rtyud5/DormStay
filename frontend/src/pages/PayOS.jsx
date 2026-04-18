import React, { useState, useEffect, useRef } from "react";
import { usePayOS } from "@payos/payos-checkout";
import PaymentService from "../services/payment.service";
import Card from "../components/ui/Card";
import PageHeader from "../components/common/PageHeader";
import Button from "../components/ui/Button";

const PayOS = ({ amount, description, onSuccess, onCancel }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [isCreatingLink, setIsCreatingLink] = useState(false);
  const [error, setError] = useState("");
  
  const currentUrl = window.location.href;
  const [payOSConfig, setPayOSConfig] = useState({
    RETURN_URL: currentUrl,
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

  // Khởi tạo hook với config từ state
  const { open, exit } = usePayOS(payOSConfig);
  
  const initialized = useRef(false);

  const handleCreatePayment = async () => {
    if (isCreatingLink) return;
    setIsCreatingLink(true);
    setError("");
    
    try {
      const response = await PaymentService.createPayOSPayment({
        amount,
        description: description ? description.substring(0, 25) : "Thanh toan DormStay",
        returnUrl: currentUrl,
        cancelUrl: currentUrl,
      });

      const url = response.data?.data?.checkoutUrl;

      if (url) {
        // 2. Cập nhật state config để hook usePayOS nhận được URL mới
        setPayOSConfig((prev) => ({
          ...prev,
          CHECKOUT_URL: url
        }));
        setIsOpen(true); 
      } else {
        throw new Error("Không lấy được Checkout URL");
      }
    } catch (err) {
      console.error("PayOS Error:", err);
      setError("Lỗi khởi tạo thanh toán.");
    } finally {
      setIsCreatingLink(false);
    }
  };

  useEffect(() => {
    if (!initialized.current) {
      handleCreatePayment();
      initialized.current = true;
    }
  }, []);

  // 3. Theo dõi khi CHECKOUT_URL trong config có giá trị thì mới gọi open()
  useEffect(() => {
    if (payOSConfig.CHECKOUT_URL && isOpen) {
      open();
    }
  }, [payOSConfig, isOpen]);

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
    <div className="space-y-6">
      <PageHeader title="Thanh toán" description="Vui lòng thực hiện thanh toán qua cổng PayOS" />
      <Card title="Cổng thanh toán trực tuyến">
        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg flex justify-between">
            <span className="font-medium">Tổng tiền:</span>
            <span className="font-bold text-blue-700">
              {new Intl.NumberFormat("vi-VN").format(amount)} VND
            </span>
          </div>

          {isCreatingLink && (
            <div className="text-center py-4 animate-pulse text-gray-500">
              Đang kết nối cổng thanh toán...
            </div>
          )}

          {error && (
            <div className="text-red-500 text-sm text-center">
              {error} <button onClick={handleCreatePayment} className="underline">Thử lại</button>
            </div>
          )}

          {/* Container nhúng thanh toán */}
          <div 
            className={`transition-all duration-300 border rounded-lg overflow-hidden ${
              isOpen ? "opacity-100" : "opacity-0 h-0"
            }`}
            style={{ minHeight: isOpen ? "600px" : "0px" }}
          >
            <div id="embedded-payment-container" style={{ width: "100%", height: "600px" }} />
          </div>

          {isOpen && (
            <Button variant="secondary" className="w-full" onClick={() => { exit(); setIsOpen(false); if(onCancel) onCancel(); }}>
              Hủy bỏ
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};

export default PayOS;