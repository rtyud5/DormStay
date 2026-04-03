import { useState } from "react";
import Button from "../ui/Button";
import Input from "../ui/Input";

function PaymentForm({ onSubmit, loading = false }) {
  const [form, setForm] = useState({
    invoiceId: "invoice-001",
    amount: "",
    note: "Thanh toan chuyen khoan",
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
      <Input label="Ma hoa don" name="invoiceId" value={form.invoiceId} onChange={handleChange} />
      <Input label="So tien" name="amount" type="number" value={form.amount} onChange={handleChange} />
      <Input label="Noi dung" name="note" value={form.note} onChange={handleChange} />
      <Button type="submit" disabled={loading}>
        {loading ? "Dang xu ly..." : "Xac nhan thanh toan"}
      </Button>
    </form>
  );
}

export default PaymentForm;
