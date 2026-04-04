import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Badge from "../components/ui/Badge";
import Card from "../components/ui/Card";
import PageHeader from "../components/common/PageHeader";
import PaymentForm from "../components/forms/PaymentForm";
import RentalRequestService from "../services/rentalRequest.service";
import { formatCurrency } from "../lib/format";

function RequestDetailPage() {
  const { id } = useParams();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDetail() {
      try {
        const res = await RentalRequestService.getDetail(id);
        setRequest(res.data.data);
      } catch (err) {
        console.error("Lỗi khi lấy chi tiết yêu cầu:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchDetail();
  }, [id]);

  async function handlePayment(payload) {
    console.log("Deposit payment", payload);
    window.alert("Tính năng thanh toán tiền cọc đang được kết nối. Vui lòng quay lại sau.");
  }

  if (loading) return <div className="p-8 text-center font-bold">Đang tải thông tin yêu cầu...</div>;
  if (!request) return <div className="p-8 text-center font-bold text-red-500">Không tìm thấy yêu cầu thuê này.</div>;

  const getStatusTone = (status) => {
    switch (status) {
      case 'MOI_TAO': return 'info';
      case 'CHO_THANH_TOAN': return 'warning';
      case 'DA_XAC_NHAN': return 'success';
      case 'TU_CHOI': return 'error';
      default: return 'neutral';
    }
  };

  return (
    <div className="space-y-6 pb-12 font-sans">
      <PageHeader 
        title={`Chi tiết yêu cầu thuê #${request.ma_yeu_cau_thue}`} 
        description="Theo dõi tiến độ duyệt hồ sơ và thực hiện thanh toán tiền giữ chỗ." 
      />
      
      <div className="grid gap-6 md:grid-cols-[1fr_350px]">
        <div className="space-y-6">
          <Card 
            title="Trạng thái hồ sơ" 
            actions={<Badge tone={getStatusTone(request.trang_thai)}>{request.trang_thai}</Badge>}
          >
            <div className="space-y-4 text-sm text-slate-600">
              <p className="font-medium">
                Yêu cầu của bạn đang ở trạng thái: <span className="text-[#0F172A] font-bold uppercase">{request.trang_thai}</span>.
              </p>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">THÔNG TIN PHÒNG ĐĂNG KÝ</div>
                <div className="text-lg font-black text-[#0F172A]">
                  {request.loai_muc_tieu === 'PHONG' ? 'NGUYÊN PHÒNG' : 'GIƯỜNG ĐƠN'} - 
                  {request.phong?.ma_phong_hien_thi ? ` P.${request.phong.ma_phong_hien_thi}` : ' Đang cập nhật'}
                </div>
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">TIỀN THUÊ</div>
                    <div className="font-bold text-[#0F172A]">{formatCurrency(request.gia_thue_thang || 0)}/tháng</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">TIỀN CỌC</div>
                    <div className="font-bold text-[#0F172A]">{formatCurrency(request.so_tien_dat_coc || 0)}</div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          {request.trang_thai === 'CHO_THANH_TOAN' || request.trang_thai === 'MOI_TAO' ? (
            <Card title="Thanh toán giữ chỗ" description="Thực hiện đặt cọc để giữ chỗ ngay lập tức.">
              <PaymentForm onSubmit={handlePayment} />
            </Card>
          ) : (
            <Card title="Hướng dẫn tiếp theo">
              <p className="text-sm text-slate-500 leading-relaxed italic">
                Hồ sơ của bạn đã được ghi nhận. Vui lòng chờ nhân viên liên hệ để hoàn tất các thủ tục tiếp theo.
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

export default RequestDetailPage;
