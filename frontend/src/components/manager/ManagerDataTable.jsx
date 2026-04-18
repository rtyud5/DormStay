/**
 * ManagerDataTable — Table component dùng chung cho module Manager
 */

import React from "react";

export default function ManagerDataTable({
  columns = [],
  data = [],
  loading = false,
  onRowClick,
  actions = [],
  emptyMessage = "Không có dữ liệu",
}) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center space-y-4">
          <div className="w-10 h-10 border-4 border-blue-200 border-t-[#0b2447] rounded-full animate-spin mx-auto" />
          <p className="text-[10px] font-black tracking-widest text-[#0b2447] uppercase animate-pulse">
            Đang tải dữ liệu...
          </p>
        </div>
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-400">
        <div className="text-center">
          <div className="w-12 h-12 bg-gray-100 rounded-full mx-auto flex items-center justify-center mb-3">
            <span className="text-2xl">📭</span>
          </div>
          <p className="text-sm font-medium">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-100">
            {columns.map((col) => (
              <th
                key={col.key}
                className="px-4 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest"
                style={{ width: col.width }}
              >
                {col.label}
              </th>
            ))}
            {actions.length > 0 && (
              <th className="px-4 py-3 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">
                Thao tác
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIdx) => (
            <tr
              key={row.id ?? rowIdx}
              onClick={() => onRowClick?.(row)}
              className={`border-b border-gray-50 transition-colors ${
                onRowClick ? "cursor-pointer hover:bg-[#f9fafb]" : ""
              }`}
            >
              {columns.map((col) => (
                <td key={col.key} className="px-4 py-4">
                  {col.render ? (
                    col.render(row)
                  ) : (
                    <span className="text-sm text-gray-700">{row[col.key] ?? "—"}</span>
                  )}
                </td>
              ))}
              {actions.length > 0 && (
                <td className="px-4 py-4">
                  <div className="flex items-center justify-end gap-2">
                    {actions.map((action, i) => (
                      <button
                        key={i}
                        onClick={(e) => {
                          e.stopPropagation();
                          action.onClick?.(row);
                        }}
                        disabled={action.disabled?.(row)}
                        title={action.label}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
                          action.primary
                            ? "bg-[#0b2447] text-white hover:bg-blue-900 disabled:opacity-40 disabled:cursor-not-allowed"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        {action.icon && (
                          <span className="mr-1.5 inline-flex">{action.icon}</span>
                        )}
                        {action.label}
                      </button>
                    ))}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
