import React from "react";
import {
  CHECKOUT_STATUS,
  RENTAL_REQUEST_STATUS,
  SALE_CONTRACT_STATUS,
} from "../../constants/sale.constants";

const INTERNAL_MAPS = [RENTAL_REQUEST_STATUS, SALE_CONTRACT_STATUS, CHECKOUT_STATUS];

function resolveMeta({ statusMap, statusKey, status }) {
  const key = String(status ?? statusKey ?? "").toUpperCase();
  const candidateMaps = [statusMap, ...INTERNAL_MAPS].filter(Boolean);

  for (const map of candidateMaps) {
    const value = map?.[key];
    if (!value) continue;
    if (typeof value === "string") {
      return { label: value, className: "bg-slate-100 text-slate-700 ring-slate-200" };
    }
    return {
      label: value.label ?? key,
      className: value.className ?? "bg-slate-100 text-slate-700 ring-slate-200",
    };
  }

  return {
    label: key || "—",
    className: "bg-slate-100 text-slate-700 ring-slate-200",
  };
}

export default function SaleStatusBadge({ statusMap, statusKey, status, size = "md" }) {
  const meta = resolveMeta({ statusMap, statusKey, status });
  const sizeClass = size === "sm" ? "px-2.5 py-1 text-[11px]" : "px-3 py-1.5 text-xs";

  return (
    <span
      className={`inline-flex items-center rounded-full ring-1 ring-inset font-bold tracking-wide ${sizeClass} ${meta.className}`}
    >
      {meta.label}
    </span>
  );
}
