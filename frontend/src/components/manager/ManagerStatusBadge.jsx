/**
 * ManagerStatusBadge — Badge trạng thái dùng chung cho module Manager
 */

import React from "react";

export default function ManagerStatusBadge({ statusMap, statusKey, size = "sm" }) {
  const config = statusMap?.[statusKey];
  if (!config) return <span className="text-gray-400 text-xs">—</span>;

  const sizeClass = size === "xs" ? "text-[10px] px-2 py-0.5" : "text-xs px-2.5 py-1";

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-bold rounded-full ${sizeClass} ${config.color} ${config.textColor}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${config.dot}`} />
      {config.label}
    </span>
  );
}
