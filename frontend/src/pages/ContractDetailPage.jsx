import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Card from "../components/ui/Card";
import PageHeader from "../components/common/PageHeader";
import Table from "../components/ui/Table";
import { formatCurrency } from "../lib/format";
import ContractService from "../services/contract.service";
import PaymentService from "../services/payment.service";
import PayOS from "./PayOS";

function ContractDetailPage() {
  const { id } = useParams();
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPayment, setShowPayment] = useState(false);

  useEffect(() => {
    async function fetchDetail() {
      try {
        const res = await ContractService.getDetail(id);
        setContract(res.data.data);
      } catch (err) {
        console.error("Lỗi khi lấy chi tiết hợp đồng:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchDetail();
  }, [id]);

  const columns = [
    { key: "ma_hoa_don", title: "Mã hóa đơn" },
    { key: "tong_so_tien", title: "Số tiền", render: (row) => formatCurrency(row.tong_so_tien) },
    { key: "trang_thai", title: "Trạng thái", render: (row) => (
      <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
        row.trang_thai === 'DA_THANH_TOAN' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
      }`}>
        {row.trang_thai}
      </span>
    )},
  ];

  // Tìm hóa đơn đang chờ thanh toán
  const pendingInvoice = (contract?.invoices || []).find(inv => inv.trang_thai !== "DA_THANH_TOAN");

  const handlePaymentLinkCreated = async (paymentLinkData) => {
    try {
      // Lưu PayOS info vào database ngay khi payment link được tạo mới
      if (paymentLinkData?.checkoutUrl && paymentLinkData?.paymentLinkId) {
        console.log("Đã tạo payment link thành công");
        setContract(prev => ({
          ...prev,
          checkoutUrl: paymentLinkData.checkoutUrl,
          paymentLinkId: paymentLinkData.paymentLinkId
        }));
      }
    } catch (err) {
      console.error("Lỗi khi lưu PayOS info:", err);
    }
  };

  const handlePaymentSuccess = async () => {
    try {
      // Nếu có hóa đơn đang chờ, record lại thanh toán để backend kích hoạt hợp đồng
      if (pendingInvoice) {
        await PaymentService.payInvoice({
          ma_hoa_don: pendingInvoice.ma_hoa_don,
          so_tien: pendingInvoice.tong_so_tien,
          phuong_thuc: "PAYOS",
          trang_thai: "DA_XAC_NHAN",
        });
      }
      
      // Đóng giao diện QR Code
      setShowPayment(false);
      
      // Refetch lại data - hợp đồng sẽ có trạng thái HIEU_LUC nếu là kỳ đầu
      const res = await ContractService.getDetail(id);
      setContract(res.data.data);
      alert("Thanh toán thành công! Hợp đồng đã được kích hoạt.");
    } catch (err) {
      console.error("Lỗi xác nhận thanh toán:", err);
      alert("Thanh toán đã ghi nhận. Trang sẽ tải lại để cập nhật.");
      window.location.reload();
    }
  };

  const handlePaymentCancel = async () => {
    try {
      // Nếu không có ID thì chỉ cần đóng giao diện là xong, không gọi API
      if (!contract?.paymentLinkId) {
        setShowPayment(false);
        return;
      }

      console.log("Hủy thanh toán với paymentLinkId:", contract.paymentLinkId);
      await PaymentService.cancelPayment(contract.paymentLinkId);
      
      setShowPayment(false);
      
      const res = await ContractService.getDetail(id);
      setContract(res.data.data);
    } catch (err) {
      console.error("Lỗi khi hủy thanh toán:", err);
      const res = await ContractService.getDetail(id);
      if (res?.data?.data) {
        setContract(res.data.data);
      }
    }
  };

  if (loading) return <div className="p-8 text-center font-bold">Đang tải chi tiết hợp đồng...</div>;
  if (!contract) return <div className="p-8 text-center font-bold text-red-500">Không tìm thấy thông tin hợp đồng.</div>;

  return (
    <div className="space-y-6 pb-12 font-sans">
      <PageHeader 
        title={`Chi tiết hợp đồng cư trú #${contract.ma_hop_dong}`} 
        description="Xem lại các điều khoản, thông tin phòng và lịch sử thanh toán hóa đơn của bạn." 
      />

      <div className="grid gap-6 md:grid-cols-3">
        <Card title="Phòng cư trú">
          <div className="flex flex-col">
            <div className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-1">MÃ PHÒNG</div>
            <div className="text-xl font-black text-slate-900 uppercase">
              P.{contract.phong?.ma_phong_hien_thi || 'N/A'}
            </div>
          </div>
        </Card>
        <Card title="Tiền cọc đảm bảo">
          <div className="flex flex-col">
            <div className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-1">ĐÃ ĐÓNG</div>
            <div className="text-xl font-black text-[#22A06B]">
              {formatCurrency(contract.so_tien_dat_coc_bao_dam || 0)}
            </div>
          </div>
        </Card>
        <Card title="Giá thuê hàng tháng">
          <div className="flex flex-col">
            <div className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-1">CỐ ĐỊNH</div>
            <div className="text-xl font-black text-[#0052CC]">
              {formatCurrency(contract.gia_thue_co_ban_thang || 0)}
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_350px]">
        <div className="space-y-6">
          <Card title="Lịch sử hóa đơn">
            <Table columns={columns} data={contract.invoices || []} />
            {(!contract.invoices || contract.invoices.length === 0) && (
              <p className="py-8 text-center text-slate-400 text-sm font-medium">Chưa ghi nhận hóa đơn nào cho hợp đồng này.</p>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          {!showPayment ? (
            <Card title="Thanh toán hóa đơn" description={pendingInvoice ? `Mã hóa đơn: ${pendingInvoice.ma_hoa_don}` : "Không có hóa đơn đang chờ"}>
              {pendingInvoice ? (
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <div className="text-xs font-bold text-blue-600 uppercase mb-1">Số tiền thanh toán</div>
                    <div className="text-2xl font-black text-blue-900">
                      {formatCurrency(pendingInvoice.tong_so_tien)}
                    </div>
                  </div>
                  <button 
                    onClick={() => setShowPayment(true)} 
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 rounded-lg font-bold text-sm transition-all shadow-md"
                  >
                    THANH TOÁN NGAY
                  </button>
                </div>
              ) : (
                <p className="py-6 text-center text-slate-400 text-sm">Tất cả hóa đơn đã được thanh toán</p>
              )}
            </Card>
          ) : (
            <Card title="Mã QR Thanh toán" description="Quét mã QR để hoàn tất thanh toán">
              <div className="flex items-center justify-between mb-4 pb-4 border-b">
                <span className="font-semibold text-slate-900">Chuyển khoản qua PayOS</span>
                <button 
                  onClick={handlePaymentCancel}
                  className="text-slate-400 hover:text-red-500 transition-colors p-1"
                  title="Hủy thanh toán"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              <PayOS 
                amount={pendingInvoice?.tong_so_tien/1000 || 0}
                description={`Thanh toan hoa don ${pendingInvoice?.ma_hoa_don || id}`} 
                existingCheckoutUrl={contract.checkoutUrl} 
                onPaymentLinkCreated={handlePaymentLinkCreated}
                onSuccess={handlePaymentSuccess} 
                onCancel={handlePaymentCancel} 
              />
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

export default ContractDetailPage;
