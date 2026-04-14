import React from "react";
import { formatCurrency, formatNumber } from "../../utils/accounting.utils";
import { TrendingUp, TrendingDown, Activity } from "lucide-react";

export default function AccountingKpiCard({
  title,
  value,
  icon,
  subtext,
  change,
  changePercent,
  changeColor = "text-[#e02424]",
  bgChangeColor = "bg-red-100",
  valueFormat = "currency",
  onClick,
  isPrimary = false
}) {
  const formatValue = () => {
    if (valueFormat === "currency") return formatCurrency(value).replace('₫', '');
    if (valueFormat === "number") return formatNumber(value);
    return value;
  };

  const isPositive = change > 0;
  const changeIcon = isPositive ? <TrendingUp className="w-3 h-3" strokeWidth={3} /> : (change < 0 ? <TrendingDown className="w-3 h-3" strokeWidth={3} /> : null);

  if (isPrimary) {
    return (
      <div 
        onClick={onClick}
        className="bg-[#0b2447] rounded-[2rem] px-8 py-6 shadow-xl shadow-[#0b2447]/30 relative overflow-hidden flex flex-col justify-center cursor-pointer transition-transform hover:-translate-y-1"
      >
        <div className="absolute right-4 top-1/2 -translate-y-1/2 w-20 h-20 text-white/5 flex items-center justify-center text-6xl">
           {icon}
        </div>
        <div className="relative z-10">
           <div className="flex justify-between items-start mb-2">
              <p className="text-[10px] font-black text-blue-200/80 uppercase tracking-widest leading-none">{title}</p>
           </div>
           <div className="flex items-end gap-3 mb-2">
              <p className="text-[2.2rem] font-black text-white leading-none tracking-tight">
                 {formatValue()}
                 {valueFormat === "currency" && <span className="text-lg font-bold text-blue-300 ml-1">đ</span>}
              </p>
           </div>
           <div className="flex items-center gap-2">
              {changePercent !== undefined && (
                 <span className={`inline-flex items-center gap-1 ${isPositive ? 'bg-[#eaffec] text-[#22a654]' : 'bg-red-100 text-red-600'} text-[10px] font-black px-2 py-0.5 rounded-full`}>
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
      className={`bg-white rounded-[2rem] px-8 py-6 shadow-sm border border-gray-100 flex flex-col justify-center relative overflow-hidden group transition-all hover:border-gray-300 ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div className="flex justify-between items-center mb-4">
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{title}</p>
        <div className="w-8 h-8 rounded-full bg-[#f4f7fa] text-[#1a56db] flex items-center justify-center group-hover:scale-110 transition-transform">
           {icon}
        </div>
      </div>
      <div className="flex items-end gap-3 mb-2">
        <p className="text-[2rem] font-black text-gray-900 leading-none tracking-tight">
           {formatValue()}
           {valueFormat === "currency" && <span className="text-lg font-bold text-gray-400 ml-1">đ</span>}
        </p>
      </div>
      <div className="flex justify-between items-center">
         <span className="text-[11px] font-medium text-gray-500">{subtext}</span>
         {changePercent !== undefined && (
            <span className={`inline-flex items-center gap-1 ${bgChangeColor} ${changeColor} text-[10px] font-black px-2 py-0.5 rounded-full`}>
               {changeIcon} {Math.abs(changePercent)}%
            </span>
         )}
      </div>
    </div>
  );
}
