import RentalRequestForm from "../components/forms/RentalRequestForm";
import Card from "../components/ui/Card";
import PageHeader from "../components/common/PageHeader";
import RentalRequestService from "../services/rentalRequest.service";

function RentalRequestPage() {
  async function handleSubmit(payload) {
    try {
      const response = await RentalRequestService.create(payload);
      window.alert(`Tao yeu cau thanh cong: ${response.data.data.requestCode}`);
    } catch (error) {
      console.error(error);
      window.alert("Khong tao duoc yeu cau. Kiem tra backend hoac chinh service sau.");
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Gui yeu cau thue" description="Buoc nay tao request code va ghi nhan thong tin thue phong." />
      <Card title="Thong tin yeu cau">
        <RentalRequestForm onSubmit={handleSubmit} />
      </Card>
    </div>
  );
}

export default RentalRequestPage;
