import React from "react";

const FALLBACK_STATUS = {
  label: "Không rõ",
  color: "bg-slate-100",
  textColor: "text-slate-600",
  dot: "bg-slate-400",
};

const SIZE_CLASS = {
  sm: "px-2.5 py-1 text-[11px]",
  md: "px-3 py-1.5 text-xs",
  lg: "px-3.5 py-2 text-sm",
};

export default function SaleStatusBadge({
  statusMap = {},
  statusKey,
  status,
  size = "md",
  className = "",
}) {
  const currentKey = statusKey ?? status;
  const config = statusMap?.[currentKey] || FALLBACK_STATUS;
  const wrapperClass = SIZE_CLASS[size] || SIZE_CLASS.md;

  return (
    <span
      className={[
        "inline-flex items-center gap-1.5 rounded-full font-bold tracking-tight",
        config.color,
        config.textColor,
        wrapperClass,
        className,
      ].join(" ")}
      title={String(currentKey ?? config.label)}
    >
      <span className={["w-1.5 h-1.5 rounded-full", config.dot].join(" ")} />
      {config.label}
    </span>
  );
}
