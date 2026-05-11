import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Card from "../components/ui/Card";
import PageHeader from "../components/common/PageHeader";
import Table from "../components/ui/Table";
import { formatCurrency, formatDate } from "../lib/format";
import ContractService from "../services/contract.service";
import PaymentService from "../services/payment.service";
import PayOS from "./PayOS";

const ENDED_CONTRACT_STATUSES = new Set(["HET_HAN", "DA_KET_THUC", "DA_THANH_LY"]);

const CONTRACT_STATUS_META = {
  HIEU_LUC: {
    label: "Đang hiệu lực",
    className: "bg-emerald-100 text-emerald-700 ring-emerald-200",
  },
  HET_HAN: {
    label: "Đã hết hiệu lực",
    className: "bg-slate-200 text-slate-700 ring-slate-300",
  },
  DA_KET_THUC: {
    label: "Đã hết hiệu lực",
    className: "bg-slate-200 text-slate-700 ring-slate-300",
  },
  CHO_LAP_KHOAN_THU_DAU: {
    label: "Chờ lập khoản thu đầu",
    className: "bg-blue-100 text-blue-700 ring-blue-200",
  },
  CHO_THANH_TOAN_KY_DAU: {
    label: "Chờ thanh toán kỳ đầu",
    className: "bg-amber-100 text-amber-700 ring-amber-200",
  },
  CHO_HIEU_LUC: {
    label: "Chờ hiệu lực",
    className: "bg-indigo-100 text-indigo-700 ring-indigo-200",
  },
};

function StatusBadge({ status, metaMap }) {
  const value = String(status || "").toUpperCase();
  const meta = metaMap[value] || {
    label: value || "Chưa cập nhật",
    className: "bg-slate-100 text-slate-700 ring-slate-200",
  };

  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-black uppercase ring-1 ${meta.className}`}>
      {meta.label}
    </span>
  );
}

function getInvoiceAmountDue(invoice) {
  return Math.max(Number(invoice?.tong_so_tien || 0) - Number(invoice?.so_tien_da_thanh_toan || 0), 0);
}

function isInvoicePaid(invoice) {
  return String(invoice?.trang_thai || "").toUpperCase() === "DA_THANH_TOAN" || getInvoiceAmountDue(invoice) <= 0;
}

function getRoomDisplay(contract) {
  const room = contract?.phong?.ma_phong_hien_thi;
  if (!room) return "N/A";

  const allocationBeds = (contract?.phan_bo_hop_dong || [])
    .map((item) => item.giuong?.ma_giuong_hien_thi || (item.ma_giuong ? `B${item.ma_giuong}` : ""))
    .filter(Boolean);
  const beds = allocationBeds.length ? allocationBeds.join(", ") : contract?.ma_giuong ? `B${contract.ma_giuong}` : "";

  return beds ? `P.${room} - ${beds}` : `P.${room}`;
}

function EmptyInfoCard({ title, description, action }) {
  return (
    <Card title={title}>
      <div className="flex flex-col gap-4">
        <p className="text-sm leading-relaxed text-slate-600">{description}</p>
        {action}
      </div>
    </Card>
  );
}

function ContractDetailPage() {
  const { id } = useParams();
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentTarget, setPaymentTarget] = useState(null);

  const fetchDetail = async () => {
    const res = await ContractService.getDetail(id);
    setContract(res.data.data);
  };

  useEffect(() => {
    async function loadDetail() {
      try {
        setLoading(true);
        await fetchDetail();
      } catch (err) {
        console.error("Lỗi khi lấy chi tiết hợp đồng:", err);
      } finally {
        setLoading(false);
      }
    }

    loadDetail();
  }, [id]);

  const invoices = contract?.invoices || [];
  const contractStatus = String(contract?.trang_thai || "").toUpperCase();
  const isContractEnded = ENDED_CONTRACT_STATUSES.has(contractStatus);

  const pendingInvoice = useMemo(() => invoices.find((invoice) => !isInvoicePaid(invoice)), [invoices]);

  const columns = [
    { key: "ma_hoa_don", title: "Mã hóa đơn" },
    {
      key: "loai_hoa_don",
      title: "Loại",
      render: (row) => row.loai_hoa_don || "--",
    },
    {
      key: "tong_so_tien",
      title: "Số tiền",
      render: (row) => formatCurrency(row.tong_so_tien),
    },
    {
      key: "ngay_den_han",
      title: "Hạn thanh toán",
      render: (row) => formatDate(row.ngay_den_han),
    },
    {
      key: "trang_thai",
      title: "Trạng thái",
      render: (row) =>
        isInvoicePaid(row) ? (
          <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-black uppercase text-emerald-700 ring-1 ring-emerald-200">
            Đã thanh toán
          </span>
        ) : (
          <span className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-black uppercase text-amber-700 ring-1 ring-amber-200">
            Chờ thanh toán
          </span>
        ),
    },
  ];

  const startInvoicePayment = () => {
    if (!pendingInvoice) return;
    setPaymentTarget({
      type: "invoice",
      id: pendingInvoice.ma_hoa_don,
      title: `Hóa đơn #${pendingInvoice.ma_hoa_don}`,
      amount: Number(pendingInvoice.tong_so_tien || 0),
      payosAmount: Number(pendingInvoice.tong_so_tien || 0),
      invoice: pendingInvoice,
    });
  };

  const handlePaymentLinkCreated = (paymentLinkData) => {
    if (!paymentLinkData?.checkoutUrl || !paymentLinkData?.paymentLinkId) return;

    setPaymentTarget((prev) =>
      prev
        ? {
            ...prev,
            checkoutUrl: paymentLinkData.checkoutUrl,
            paymentLinkId: paymentLinkData.paymentLinkId,
          }
        : prev,
    );
  };

  const handlePaymentSuccess = async () => {
    if (!paymentTarget) return;

    try {
      await PaymentService.payInvoice({
        ma_hoa_don: paymentTarget.invoice.ma_hoa_don,
        so_tien: paymentTarget.invoice.tong_so_tien,
        phuong_thuc: "PAYOS",
        trang_thai: "DA_XAC_NHAN",
      });

      setPaymentTarget(null);
      await fetchDetail();
      window.alert("Thanh toán thành công. Trạng thái đã được cập nhật.");
    } catch (err) {
      console.error("Lỗi xác nhận thanh toán:", err);
      window.alert("Thanh toán đã ghi nhận. Vui lòng tải lại trang để kiểm tra trạng thái mới nhất.");
    }
  };

  if (loading) {
    return <div className="p-8 text-center font-bold text-slate-500">Đang tải chi tiết hợp đồng...</div>;
  }

  if (!contract) {
    return <div className="p-8 text-center font-bold text-red-500">Không tìm thấy thông tin hợp đồng.</div>;
  }

  return (
    <div className="space-y-6 pb-12 font-sans">
      <PageHeader
        title={`Chi tiết hợp đồng cư trú #${contract.ma_hop_dong}`}
        description="Xem thông tin phòng, hóa đơn và lịch thanh toán của hợp đồng."
        actions={<StatusBadge status={contract.trang_thai} metaMap={CONTRACT_STATUS_META} />}
      />

      {isContractEnded && (
        <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-100 px-5 py-4 text-sm font-semibold text-slate-700 sm:flex-row sm:items-center sm:justify-between">
          <p>Hợp đồng đã hết hiệu lực sau khi Manager xác nhận thanh lý. Phiếu phát sinh và hoàn cọc nằm ở trang riêng.</p>
          <Link
            to="/liquidations"
            className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2 text-xs font-black uppercase tracking-widest text-white transition hover:bg-slate-800"
          >
            Mở thanh lý hợp đồng
          </Link>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        <Card title="Phòng cư trú">
          <p className="text-xs font-black uppercase tracking-widest text-slate-400">Phòng / giường</p>
          <p className="mt-1 text-xl font-black text-slate-900">{getRoomDisplay(contract)}</p>
        </Card>

        <Card title="Tiền cọc bảo đảm">
          <p className="text-xs font-black uppercase tracking-widest text-slate-400">Đã đóng</p>
          <p className="mt-1 text-xl font-black text-emerald-600">{formatCurrency(contract.so_tien_dat_coc_bao_dam || 0)}</p>
        </Card>

        <Card title="Giá thuê hàng tháng">
          <p className="text-xs font-black uppercase tracking-widest text-slate-400">Cố định</p>
          <p className="mt-1 text-xl font-black text-blue-700">{formatCurrency(contract.gia_thue_co_ban_thang || 0)}</p>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <Card title="Lịch sử hóa đơn">
            <Table columns={columns} data={invoices} />
          </Card>
        </div>

        <div className="space-y-6">
          {!paymentTarget ? (
            <Card
              title="Thanh toán hóa đơn"
              description={pendingInvoice ? `Mã hóa đơn: ${pendingInvoice.ma_hoa_don}` : "Không có hóa đơn đang chờ."}
            >
              {pendingInvoice ? (
                <div className="space-y-4">
                  <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
                    <p className="text-xs font-bold uppercase text-blue-600">Số tiền thanh toán</p>
                    <p className="mt-1 text-2xl font-black text-blue-900">{formatCurrency(pendingInvoice.tong_so_tien)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={startInvoicePayment}
                    className="w-full rounded-xl bg-blue-700 py-3 text-sm font-black text-white transition hover:bg-blue-800"
                  >
                    Thanh toán ngay
                  </button>
                </div>
              ) : (
                <p className="py-6 text-center text-sm font-medium text-slate-400">
                  Tất cả hóa đơn đã được thanh toán.
                </p>
              )}
            </Card>
          ) : (
            <Card title="Mã QR thanh toán" description={paymentTarget.title}>
              <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-4">
                <span className="font-semibold text-slate-900">Chuyển khoản qua PayOS</span>
                <button
                  type="button"
                  onClick={() => setPaymentTarget(null)}
                  className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-red-500"
                  title="Hủy thanh toán"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <PayOS
                key={`${paymentTarget.type}-${paymentTarget.id}`}
                amount={paymentTarget.payosAmount}
                amountLabel="Số tiền thanh toán:"
                description={
                  paymentTarget.type === "invoice"
                    ? `Thanh toán HĐ ${paymentTarget.id}`
                    : `Thanh toán ${paymentTarget.id}`
                }
                existingCheckoutUrl={paymentTarget.checkoutUrl}
                onPaymentLinkCreated={handlePaymentLinkCreated}
                onSuccess={handlePaymentSuccess}
                onCancel={() => setPaymentTarget(null)}
              />
            </Card>
          )}

          {isContractEnded && (
            <EmptyInfoCard
              title="Thanh lý hợp đồng"
              description="Khấu hao, % được hoàn, phiếu phát sinh và phiếu hoàn cọc đã tách sang trang riêng để dễ theo dõi."
              action={
                <Link
                  to="/liquidations"
                  className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-50"
                >
                  Xem thanh lý
                </Link>
              }
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default ContractDetailPage;
