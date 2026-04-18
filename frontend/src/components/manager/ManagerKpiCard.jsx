/**
 * ManagerKpiCard — KPI card dùng cho Dashboard Quản lý
 */

import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

export default function ManagerKpiCard({
  title,
  value,
  icon,
  subtext,
  change,
  changePercent,
  changeColor = "text-red-600",
  bgChangeColor = "bg-red-100",
  valueFormat = "number",
  onClick,
  isPrimary = false,
  accentColor = "#0b2447",
}) {
  const isPositive = change > 0;

  const changeIcon = isPositive ? (
    <TrendingUp className="w-3 h-3" strokeWidth={3} />
  ) : change < 0 ? (
    <TrendingDown className="w-3 h-3" strokeWidth={3} />
  ) : null;

  if (isPrimary) {
    return (
      <div
        onClick={onClick}
        style={{ background: `linear-gradient(135deg, ${accentColor} 0%, #1a3a6b 100%)` }}
        className="rounded-[2rem] px-8 py-6 shadow-xl relative overflow-hidden flex flex-col justify-center cursor-pointer transition-transform hover:-translate-y-1"
      >
        <div className="absolute right-4 top-1/2 -translate-y-1/2 w-20 h-20 text-white/5 flex items-center justify-center text-6xl">
          {icon}
        </div>
        <div className="relative z-10">
          <p className="text-[10px] font-black text-blue-200/80 uppercase tracking-widest leading-none mb-2">
            {title}
          </p>
          <p className="text-[2.8rem] font-black text-white leading-none tracking-tight mb-2">
            {value}
          </p>
          <div className="flex items-center gap-2">
            {changePercent !== undefined && (
              <span
                className={`inline-flex items-center gap-1 ${
                  isPositive ? "bg-[#eaffec] text-[#22a654]" : "bg-red-100 text-red-600"
                } text-[10px] font-black px-2 py-0.5 rounded-full`}
              >
                {changeIcon} {Math.abs(changePercent)}%
              </span>
            )}
            <span className="text-[11px] font-medium text-blue-200">{subtext}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-[2rem] px-8 py-6 shadow-sm border border-gray-100 flex flex-col justify-center relative overflow-hidden group transition-all hover:border-gray-300 ${
        onClick ? "cursor-pointer" : ""
      }`}
    >
      <div className="flex justify-between items-center mb-4">
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{title}</p>
        <div className="w-8 h-8 rounded-full bg-[#f4f7fa] text-[#1a56db] flex items-center justify-center group-hover:scale-110 transition-transform">
          {icon}
        </div>
      </div>
      <p className="text-[2rem] font-black text-gray-900 leading-none tracking-tight mb-2">
        {value}
      </p>
      <div className="flex justify-between items-center">
        <span className="text-[11px] font-medium text-gray-500">{subtext}</span>
        {changePercent !== undefined && (
          <span
            className={`inline-flex items-center gap-1 ${bgChangeColor} ${changeColor} text-[10px] font-black px-2 py-0.5 rounded-full`}
          >
            {changeIcon} {Math.abs(changePercent)}%
          </span>
        )}
      </div>
    </div>
  );
}
