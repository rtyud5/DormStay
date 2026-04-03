import { Link } from "react-router-dom";
import Card from "../components/ui/Card";
import PageHeader from "../components/common/PageHeader";
import Table from "../components/ui/Table";
import Badge from "../components/ui/Badge";

const contracts = [
  { id: "contract-001", customer: "Nguyen Van A", room: "Phong 101", status: "active" },
  { id: "contract-002", customer: "Tran Thi B", room: "Phong 201", status: "preview" },
];

function ContractListPage() {
  const columns = [
    { key: "id", title: "Ma hop dong" },
    { key: "customer", title: "Khach hang" },
    { key: "room", title: "Phong" },
    {
      key: "status",
      title: "Trang thai",
      render: (row) => <Badge tone={row.status === "active" ? "success" : "warning"}>{row.status}</Badge>,
    },
    {
      key: "action",
      title: "Thao tac",
      render: (row) => (
        <Link to={`/contracts/${row.id}`} className="font-medium text-slate-900 underline-offset-2 hover:underline">
          Xem chi tiet
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Danh sach hop dong" description="Danh sach mau de ban noi vao contract API sau." />
      <Card>
        <Table columns={columns} data={contracts} />
      </Card>
    </div>
  );
}

export default ContractListPage;
