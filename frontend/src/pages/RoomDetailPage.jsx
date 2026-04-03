import { Link, useParams } from "react-router-dom";
import PageHeader from "../components/common/PageHeader";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { formatCurrency } from "../lib/format";

function RoomDetailPage() {
  const { id } = useParams();

  const room = {
    id,
    name: `Phong ${id}`,
    type: "Studio",
    price: 3500000,
    description: "Phong mau de ban thay bang data thuc te tu backend.",
  };

  return (
    <div className="space-y-6">
      <PageHeader title={room.name} description="Chi tiet phong va thong tin tham khao." />
      <Card title="Thong tin phong">
        <div className="space-y-3 text-sm text-slate-600">
          <p><span className="font-medium text-slate-900">Loai:</span> {room.type}</p>
          <p><span className="font-medium text-slate-900">Gia:</span> {formatCurrency(room.price)}/thang</p>
          <p><span className="font-medium text-slate-900">Mo ta:</span> {room.description}</p>
        </div>
        <div className="mt-6">
          <Link to="/rental-requests/new">
            <Button>Gui yeu cau thue</Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}

export default RoomDetailPage;
