function Input({ label, className = "", ...props }) {
  return (
    <label className="flex w-full flex-col gap-2 text-sm text-slate-700">
      {label ? <span className="font-medium">{label}</span> : null}
      <input
        className={`rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none ring-0 transition focus:border-slate-400 ${className}`}
        {...props}
      />
    </label>
  );
}

export default Input;
