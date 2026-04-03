import { useParams } from "react-router-dom";
import Card from "../components/ui/Card";
import PageHeader from "../components/common/PageHeader";
import PaymentForm from "../components/forms/PaymentForm";
import Table from "../components/ui/Table";
import { formatCurrency } from "../lib/format";

function ContractDetailPage() {
  const { id } = useParams();

  const invoices = [
    { id: "invoice-001", amount: 5200000, status: "pending" },
    { id: "invoice-002", amount: 3500000, status: "paid" },
  ];

  const columns = [
    { key: "id", title: "Hoa don" },
    { key: "amount", title: "So tien", render: (row) => formatCurrency(row.amount) },
    { key: "status", title: "Trang thai" },
  ];

  async function handlePayment(payload) {
    console.log("Mock contract payment", payload);
    window.alert("Da mo form thanh toan hop dong. Ban se noi vao backend sau.");
  }

  return (
    <div className="space-y-6">
      <PageHeader title={`Chi tiet hop dong ${id}`} description="Trang hop dong online preview va lich su thanh toan." />

      <Card title="Tong quan hop dong">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl bg-slate-50 p-4">
            <div className="text-xs uppercase tracking-wide text-slate-500">Phong</div>
            <div className="mt-2 font-semibold text-slate-900">Phong 101</div>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <div className="text-xs uppercase tracking-wide text-slate-500">Tien coc</div>
            <div className="mt-2 font-semibold text-slate-900">{formatCurrency(2000000)}</div>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <div className="text-xs uppercase tracking-wide text-slate-500">Tien phong</div>
            <div className="mt-2 font-semibold text-slate-900">{formatCurrency(3500000)}</div>
          </div>
        </div>
      </Card>

      <Card title="Lich su hoa don">
        <Table columns={columns} data={invoices} />
      </Card>

      <Card title="Thanh toan">
        <PaymentForm onSubmit={handlePayment} />
      </Card>
    </div>
  );
}

export default ContractDetailPage;
