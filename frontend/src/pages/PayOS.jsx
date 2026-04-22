import React, { useState, useEffect, useRef } from "react";
import { usePayOS } from "@payos/payos-checkout"; 
import PaymentService from "../services/payment.service"; 
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";

// Component con xử lý Iframe
const PayOSQRDisplay = ({ url, onSuccess, onCancel }) => {
  const { open, exit } = usePayOS({
    RETURN_URL: window.location.href,
    ELEMENT_ID: "embedded-payment-container",
    CHECKOUT_URL: url,
    embedded: true,
    onSuccess,
    onCancel,
  });

  useEffect(() => {
    // Chờ DOM chuẩn bị xong container rồi bơm Iframe vào
    const timer = setTimeout(() => {
      open();
    }, 100);

    return () => {
      clearTimeout(timer);
      exit();
    };
  }, [open, exit, url]);

  return (
    <div 
      id="embedded-payment-container" 
      style={{ width: "100%", height: "450px", backgroundColor: "#fff" }}
    ></div>
  );
};

const PayOS = ({ amount, description, onSuccess, onCancel, onPaymentLinkCreated, existingCheckoutUrl }) => {
  const [activeUrl, setActiveUrl] = useState(existingCheckoutUrl || null);
  const [isCreatingLink, setIsCreatingLink] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const initialized = useRef(false);

  const handleCreatePayment = async () => {
    if (isCreatingLink || activeUrl) return;
    setIsCreatingLink(true);
    setError("");

    try {
      const expiredAt = Math.floor(Date.now() / 1000) + 60 * 60 * 24; 
      const response = await PaymentService.createPayOSPayment({
        amount,
        description: description ? description.substring(0, 25) : "Thanh toan DormStay",
        returnUrl: window.location.href,
        cancelUrl: window.location.href,
        expiredAt
      });

      const url = response.data?.data?.checkoutUrl;
      const paymentLinkId = response.data?.data?.paymentLinkId;

      if (url && paymentLinkId) {
        if (onPaymentLinkCreated) {
          onPaymentLinkCreated({ checkoutUrl: url, paymentLinkId: paymentLinkId });
        }
        setActiveUrl(url);
      } else {
        throw new Error("Không lấy được Checkout URL từ server.");
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
      if (!existingCheckoutUrl) {
        handleCreatePayment();
      }
      initialized.current = true;
    }
  }, [existingCheckoutUrl]);

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
    <div className="space-y-4">
      <div className="bg-slate-50 p-4 rounded-2xl flex justify-between items-center border border-slate-100">
        <span className="text-slate-500 font-medium">Tổng tiền cọc:</span>
        <span className="font-bold text-lg text-[#0052CC]">
          {new Intl.NumberFormat("vi-VN").format(amount)} VND
        </span>
      </div>

      {isCreatingLink && !activeUrl && (
        <div className="flex flex-col items-center py-10 space-y-3">
          <div className="w-8 h-8 border-4 border-[#0052CC] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 animate-pulse text-sm">Đang tạo link thanh toán mới...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 p-4 rounded-xl text-red-600 text-sm text-center border border-red-100">
          {error} <button onClick={handleCreatePayment} className="font-bold underline ml-1">Thử lại</button>
        </div>
      )}

      {activeUrl && (
        <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm bg-white">
          <PayOSQRDisplay 
            url={activeUrl}
            onSuccess={(e) => {
              setMessage("Thanh toán thành công!");
              if (onSuccess) onSuccess(e);
            }}
            onCancel={onCancel}
          />
        </div>
      )}
    </div>
  );
};

export default PayOS;