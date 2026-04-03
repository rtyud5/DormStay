import { useState } from "react";
import Button from "../ui/Button";
import Input from "../ui/Input";

function LoginForm({ onSubmit, loading = false }) {
  const [form, setForm] = useState({
    email: "customer@example.com",
    password: "123456",
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
      <Input label="Email" name="email" type="email" value={form.email} onChange={handleChange} />
      <Input label="Mat khau" name="password" type="password" value={form.password} onChange={handleChange} />
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Dang dang nhap..." : "Dang nhap"}
      </Button>
    </form>
  );
}

export default LoginForm;
