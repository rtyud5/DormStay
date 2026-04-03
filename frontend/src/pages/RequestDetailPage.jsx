import { useParams } from "react-router-dom";
import Badge from "../components/ui/Badge";
import Card from "../components/ui/Card";
import PageHeader from "../components/common/PageHeader";
import PaymentForm from "../components/forms/PaymentForm";

function RequestDetailPage() {
  const { id } = useParams();

  async function handlePayment(payload) {
    console.log("Mock payment payload", payload);
    window.alert("Da mo phong form thanh toan dat coc. Ban se noi vao API sau.");
  }

  return (
    <div className="space-y-6">
      <PageHeader title={`Chi tiet yeu cau ${id}`} description="Thong tin yeu cau thue va trang thai dat coc." />
      <Card title="Trang thai hien tai" actions={<Badge tone="warning">Cho dat coc</Badge>}>
        <div className="space-y-2 text-sm text-slate-600">
          <p>Khach da gui yeu cau. Sale co the duyet hoặc tu choi o backoffice.</p>
          <p>Neu duyet buoc dau, khach co the vao man nay de thanh toan dat coc.</p>
        </div>
      </Card>
      <Card title="Thanh toan dat coc">
        <PaymentForm onSubmit={handlePayment} />
      </Card>
    </div>
  );
}

export default RequestDetailPage;
