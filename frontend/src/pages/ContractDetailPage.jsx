import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Card from "../components/ui/Card";
import PageHeader from "../components/common/PageHeader";
import PaymentForm from "../components/forms/PaymentForm";
import Table from "../components/ui/Table";
import { formatCurrency } from "../lib/format";
import ContractService from "../services/contract.service";

function ContractDetailPage() {
  const { id } = useParams();
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);

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

  async function handlePayment(payload) {
    console.log("Contract payment", payload);
    window.alert("Tính năng thanh toán đang được kết nối với cổng thanh toán. Vui lòng thử lại sau.");
  }

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
          <Card title="Thanh toán hóa đơn" description="Nhập số tiền hoặc chọn hóa đơn cần thanh toán.">
            <PaymentForm onSubmit={handlePayment} />
          </Card>
        </div>
      </div>
    </div>
  );
}

export default ContractDetailPage;
