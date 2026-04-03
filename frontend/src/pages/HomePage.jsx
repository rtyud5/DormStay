import { Link } from "react-router-dom";
import Card from "../components/ui/Card";
import PageHeader from "../components/common/PageHeader";
import Button from "../components/ui/Button";

const features = [
  "Tim phong trong",
  "Gui yeu cau thue",
  "Theo doi hop dong",
  "Kiem tra lich su thanh toan",
];

function HomePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="DormiCare Starter"
        description="Bo khung frontend de ban phat trien demo quan ly thue phong va hop dong."
        actions={
          <div className="flex gap-3">
            <Link to="/rooms">
              <Button>Xem phong</Button>
            </Link>
            <Link to="/rental-requests/new">
              <Button variant="secondary">Gui yeu cau</Button>
            </Link>
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {features.map((item) => (
          <Card key={item} title={item}>
            <p className="text-sm text-slate-500">
              Day la the placeholder de ban thay bang widget, KPI hoac thong tin thuc te sau nay.
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default HomePage;
