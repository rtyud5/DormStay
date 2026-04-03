import { Link } from "react-router-dom";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import PageHeader from "../components/common/PageHeader";
import { formatCurrency } from "../lib/format";

const rooms = [
  { id: "room-101", name: "Phong 101", type: "Studio", price: 3500000 },
  { id: "room-201", name: "Phong 201", type: "Dorm 4", price: 1800000 },
  { id: "room-301", name: "Phong 301", type: "Private", price: 4200000 },
];

function RoomListPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Danh sach phong" description="Danh sach mock data de ban thay bang du lieu API sau." />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {rooms.map((room) => (
          <Card
            key={room.id}
            title={room.name}
            description={`${room.type} - ${formatCurrency(room.price)}/thang`}
            actions={
              <Link to={`/rooms/${room.id}`}>
                <Button variant="secondary">Chi tiet</Button>
              </Link>
            }
          >
            <p className="text-sm text-slate-500">Ban co the them anh, suc chua, tien ich va trang thai trong o day.</p>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default RoomListPage;
