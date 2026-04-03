import { useState } from "react";
import Button from "../ui/Button";
import Input from "../ui/Input";

function RegisterForm({ onSubmit, loading = false }) {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
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
      <Input label="Ho va ten" name="fullName" value={form.fullName} onChange={handleChange} />
      <Input label="Email" name="email" type="email" value={form.email} onChange={handleChange} />
      <Input label="So dien thoai" name="phone" value={form.phone} onChange={handleChange} />
      <Input label="Mat khau" name="password" type="password" value={form.password} onChange={handleChange} />
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Dang tao tai khoan..." : "Dang ky"}
      </Button>
    </form>
  );
}

export default RegisterForm;
