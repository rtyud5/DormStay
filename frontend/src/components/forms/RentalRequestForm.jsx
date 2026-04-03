import { useState } from "react";
import Button from "../ui/Button";
import Input from "../ui/Input";
import Select from "../ui/Select";

function RentalRequestForm({ onSubmit, loading = false }) {
  const [form, setForm] = useState({
    roomId: "room-101",
    stayType: "monthly",
    startDate: "",
    note: "",
  });

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    onSubmit?.(form);
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <Input label="Ma phong" name="roomId" value={form.roomId} onChange={handleChange} />
      <Select
        label="Loai ky han"
        name="stayType"
        value={form.stayType}
        onChange={handleChange}
        options={[
          { value: "monthly", label: "Theo thang" },
          { value: "long_term", label: "Dai han" },
        ]}
      />
      <Input label="Ngay nhan phong du kien" name="startDate" type="date" value={form.startDate} onChange={handleChange} />
      <Input label="Ghi chu" name="note" value={form.note} onChange={handleChange} />
      <Button type="submit" disabled={loading}>
        {loading ? "Dang gui..." : "Gui yeu cau thue"}
      </Button>
    </form>
  );
}

export default RentalRequestForm;
