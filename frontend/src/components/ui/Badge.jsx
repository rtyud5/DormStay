import { classNames } from "../../lib/helpers";

function Badge({ children, tone = "default" }) {
  const tones = {
    default: "bg-slate-100 text-slate-700",
    success: "bg-emerald-100 text-emerald-700",
    warning: "bg-amber-100 text-amber-700",
    danger: "bg-rose-100 text-rose-700",
  };

  return (
    <span className={classNames("inline-flex rounded-full px-3 py-1 text-xs font-medium", tones[tone])}>
      {children}
    </span>
  );
}

export default Badge;
