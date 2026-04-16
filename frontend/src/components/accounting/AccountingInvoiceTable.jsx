/**
 * Accounting Invoice Table - Bảng phiếu thu tái sử dụng
 */

import React, { useState } from "react";
import { Link } from "react-router-dom";
import { formatCurrency, formatDate, formatNumber } from "../../utils/accounting.utils";
import AccountingStatusBadge from "./AccountingStatusBadge";

export default function AccountingInvoiceTable({
  data = [],
  columns = [], // Array of { key, label, render?, width? }
  statusMap,
  onRowClick,
  onAction,
  actions = [], // Array of { label, icon, onClick, condition? }
  loading = false,
  pagination = { page: 1, limit: 10, total: 0 },
  onPageChange,
  hideSelection = false,
}) {
  const [selectedRows, setSelectedRows] = useState([]);

  const toggleSelectAll = () => {
    if (selectedRows.length === data.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(data.map((_, i) => i));
    }
  };

  const toggleSelectRow = (index) => {
    if (selectedRows.includes(index)) {
      setSelectedRows(selectedRows.filter((i) => i !== index));
    } else {
      setSelectedRows([...selectedRows, index]);
    }
  };

  const renderCell = (item, column) => {
    if (column.render) {
      return column.render(item);
    }

    const value = item[column.key];

    switch (column.type) {
      case "currency":
        return formatCurrency(value);
      case "date":
        return formatDate(value);
      case "number":
        return formatNumber(value);
      case "status":
        return <AccountingStatusBadge status={value} statusMap={statusMap} variant="pill" />;
      default:
        return value || "--";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin">⏳</div>
        <span className="ml-2 text-gray-600">Đang tải...</span>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Table */}
      <div className="overflow-x-auto pb-4">
        <table className="w-full min-w-[800px] border-collapse">
          <thead>
            <tr className="bg-[#f4f7fa]">
              {/* Select All */}
              {!hideSelection && (
                <th className="px-6 py-4 text-left first:rounded-l-[1rem] last:rounded-r-[1rem]">
                  <input
                    type="checkbox"
                    checked={selectedRows.length === data.length && data.length > 0}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 cursor-pointer accent-[#0b2447] rounded"
                  />
                </th>
              )}

              {/* Column Headers */}
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-6 py-4 text-left text-[11px] font-bold text-gray-500 uppercase tracking-[0.1em] first:rounded-l-[1rem] last:rounded-r-[1rem]"
                  style={{ width: col.width }}
                >
                  {col.label}
                </th>
              ))}

              {/* Actions Header */}
              {actions.length > 0 && (
                <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-500 uppercase tracking-[0.1em] last:rounded-r-[1rem]">
                </th>
              )}
            </tr>
          </thead>

          <tbody className="before:content-[''] before:block before:h-4">
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (hideSelection ? 0 : 1) + (actions.length > 0 ? 1 : 0)} className="px-6 py-12 text-center text-gray-500 font-medium">
                  Không có dữ liệu
                </td>
              </tr>
            ) : (
              data.map((item, rowIndex) => (
                <tr
                  key={rowIndex}
                  className={`border-b border-gray-100/60 hover:bg-gray-50/50 transition cursor-pointer group ${rowIndex === 0 ? 'border-t-0' : ''}`}
                  onClick={() => onRowClick?.(item)}
                >
                  {/* Checkbox */}
                  {!hideSelection && (
                    <td className="px-6 py-5" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedRows.includes(rowIndex)}
                        onChange={() => toggleSelectRow(rowIndex)}
                        className="w-4 h-4 cursor-pointer accent-[#0b2447] rounded opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{ opacity: selectedRows.includes(rowIndex) ? 1 : undefined }}
                      />
                    </td>
                  )}

                  {/* Cells */}
                  {columns.map((col) => (
                    <td key={col.key} className="px-6 py-5 text-sm text-gray-900 border-none">
                      {renderCell(item, col)}
                    </td>
                  ))}

                  {/* Actions */}
                  {actions.length > 0 && (
                    <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                      <div className="flex gap-2">
                        {actions.map((action, idx) => {
                          const shouldShow = !action.condition || action.condition(item);

                          if (!shouldShow) return null;

                          return (
                            <button
                              key={idx}
                              onClick={() => action.onClick?.(item)}
                              className={`flex items-center justify-center transition-colors ${
                                action.primary 
                                  ? 'w-[28px] h-[28px] bg-[#0b2447] text-white rounded-full hover:scale-105 shadow-md shadow-[#0b2447]/30' 
                                  : 'p-1.5 text-gray-400 hover:text-gray-800 rounded'
                              }`}
                              title={action.label}
                            >
                              {action.icon}
                            </button>
                          );
                        })}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination - now handled outside if we want, or keep it standard */}
      {pagination.total > pagination.limit && onPageChange && (
        <div className="px-6 py-4 border-t flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Hiển thị {data.length} trong {pagination.total} bản ghi
          </p>
          <div className="flex gap-2">
            {Array.from({ length: Math.ceil(pagination.total / pagination.limit) }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`px-3 py-1 rounded transition ${
                  pagination.page === page ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {page}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
