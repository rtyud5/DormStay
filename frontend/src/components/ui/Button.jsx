import { classNames } from "../../lib/helpers";

function Button({
  type = "button",
  children,
  className = "",
  variant = "primary",
  ...props
}) {
  const variants = {
    primary: "bg-slate-900 text-white hover:bg-slate-800",
    secondary: "bg-white text-slate-900 ring-1 ring-slate-200 hover:bg-slate-50",
    danger: "bg-rose-600 text-white hover:bg-rose-500",
  };

  return (
    <button
      type={type}
      className={classNames(
        "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;
