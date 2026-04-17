/**
 * Accounting Status Badge - Badge trạng thái tái sử dụng
 */

import React from "react";

export default function AccountingStatusBadge({
  status,
  statusMap,
  variant = "default", // default, pill, outline
}) {
  const statusConfig = statusMap?.[status];

  if (!statusConfig) return <span className="text-xs text-gray-500">Unknown</span>;

  switch (variant) {
    case "pill":
      return (
        <div
          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusConfig.color} ${statusConfig.textColor}`}
        >
          <span className={`w-2 h-2 rounded-full mr-2 ${statusConfig.badgeColor}`}></span>
          {statusConfig.label}
        </div>
      );

    case "outline":
      return (
        <div
          className={`inline-flex items-center px-3 py-1 rounded border text-xs font-medium border-current ${statusConfig.textColor}`}
        >
          {statusConfig.label}
        </div>
      );

    default:
      return (
        <span
          className={`inline-block px-2 py-1 rounded text-xs font-medium ${statusConfig.color} ${statusConfig.textColor}`}
        >
          {statusConfig.label}
        </span>
      );
  }
}
