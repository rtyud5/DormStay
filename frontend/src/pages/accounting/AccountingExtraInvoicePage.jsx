import React, { useState } from "react";
import { 
  History, Printer, Plus, Banknote, Landmark, CreditCard,
  CheckCircle2, Ban, Info, ListChecks, ChevronRight,
  Trash2
} from "lucide-react";
import { formatCurrency } from "../../utils/accounting.utils";

export default function AccountingExtraInvoicePage() {
  const [extraItems, setExtraItems] = useState([
    {
      id: 1,
      name: "Vệ sinh phòng theo yêu cầu",
      description: "Dịch vụ làm sạch chuyên sâu định kỳ",
      price: 150000,
      quantity: 2,
    },
    {
      id: 2,
      name: "Gia hạn thẻ cư dân",
      description: "Mất thẻ, cấp lại thẻ từ NFC mới",
      price: 100000,
      quantity: 1,
    },
    {
      id: 3,
      name: "Bồi thường hư hại đồ dùng",
      description: "Làm nứt kính cửa sổ phòng khách (Có biên bản)",
      price: 2450000,
      quantity: 1,
    }
  ]);

  const [paymentMethod, setPaymentMethod] = useState("CASH"); // CASH, TRANSFER, POS

  const handleAddItem = () => {
    setExtraItems([...extraItems, { id: Date.now(), name: "Nội dung phát sinh", description: "Mô tả chi tiết", price: 0, quantity: 1 }]);
  };

  const handleRemoveItem = (id) => {
    setExtraItems(extraItems.filter(item => item.id !== id));
  };

  const handleUpdateItem = (id, field, value) => {
    setExtraItems(extraItems.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const subTotal = extraItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const vatAmount = subTotal * 0.1;
  const grandTotal = subTotal + vatAmount;

  return (
    <div className="p-8 lg:p-10 max-w-[1400px] mx-auto bg-[#f9fafb] min-h-screen">
      
      <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-6 mb-8 mt-4">
        <div>
          <div className="flex items-center gap-3 text-xs font-black text-gray-500 uppercase tracking-widest mb-3">
             <span className="bg-gray-200 px-2.5 py-1 rounded-md text-gray-700">MH-33</span>
             <span>ID: #PC-20231024-08</span>
          </div>
          <h1 className="text-[2.5rem] font-extrabold text-[#0b2447] tracking-tight leading-none mb-3">
            Lập Phiếu Thanh Toán Phát Sinh
          </h1>
          <p className="text-gray-500 font-medium">
            Ghi nhận các khoản thu dịch vụ bổ sung ngoài hợp đồng định kỳ của cư dân.
          </p>
        </div>
        
        <div className="flex gap-3 self-start xl:self-auto mt-4 xl:mt-8">
           <button className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-extrabold hover:bg-gray-50 transition-colors shadow-sm">
              <History className="w-5 h-5 text-gray-500" /> Lịch sử thu
           </button>
           <button className="flex items-center gap-2 px-6 py-3 bg-[#0b2447] text-white rounded-xl font-extrabold shadow-md hover:bg-[#0a1e3b] transition-colors">
              <Printer className="w-5 h-5" /> In phiếu tạm tính
           </button>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row gap-8 items-start">
        
        {/* Left Main Content */}
        <div className="flex-1 space-y-6 w-full">
           
           {/* Info Card */}
           <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 flex flex-wrap items-center gap-12">
              <div className="flex items-center gap-5">
                 <div className="w-16 h-16 rounded-full bg-[#f0f4fa] overflow-hidden border-2 border-white shadow-sm flex-shrink-0">
                    <div className="w-full h-full bg-cover bg-center" style={{backgroundImage: "url('https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&h=100&fit=crop')"}}></div>
                 </div>
                 <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">CƯ DÂN</p>
                    <p className="font-extrabold text-lg text-gray-900 leading-tight">Nguyễn Minh Tuấn</p>
                    <p className="text-sm font-medium text-gray-500">0912-XXX-XXX</p>
                 </div>
              </div>
              <div className="h-12 w-px bg-gray-100 hidden md:block"></div>
              <div>
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">THÔNG TIN PHÒNG</p>
                 <p className="font-extrabold text-[#111827] text-lg leading-tight">B-402 (Luxury Suite)</p>
                 <p className="text-sm font-medium text-gray-500">Hợp đồng: #CTR-9921</p>
              </div>
              <div className="h-12 w-px bg-gray-100 hidden lg:block"></div>
              <div>
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">NGÀY NHẬN PHÒNG</p>
                 <p className="font-extrabold text-[#111827] text-lg mt-1">15/08/2023</p>
              </div>
           </div>

           {/* Extra Charges List */}
           <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-8">
                 <div className="flex items-center gap-3">
                    <ListChecks className="w-6 h-6 text-[#111827]" strokeWidth={2.5} />
                    <h2 className="text-[1.15rem] font-extrabold text-[#111827] uppercase tracking-wide">DANH SÁCH CÁC KHOẢN PHÁT SINH</h2>
                 </div>
                 <button 
                   onClick={handleAddItem}
                   className="text-[#1a56db] bg-[#f0f5ff] hover:bg-blue-100 px-4 py-2 rounded-full font-bold text-sm flex items-center gap-2 transition-colors"
                 >
                    <Plus className="w-4 h-4" /> Thêm khoản thu
                 </button>
              </div>

              <div className="overflow-x-auto">
                 <table className="w-full text-left">
                    <thead>
                       <tr className="border-b border-gray-100">
                          <th className="py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest w-[45%]">TÊN DỊCH VỤ / SỰ VỤ</th>
                          <th className="py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest w-[20%]">ĐƠN GIÁ</th>
                          <th className="py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest w-[15%] text-center">SỐ LƯỢNG</th>
                          <th className="py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">THÀNH TIỀN</th>
                          <th className="py-4 w-10"></th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100/50">
                       {extraItems.map((item) => (
                          <tr key={item.id} className="group">
                             <td className="py-6 pr-4">
                                <input 
                                  className="font-extrabold text-[15px] text-gray-900 leading-tight w-full outline-none bg-transparent"
                                  value={item.name}
                                  onChange={(e) => handleUpdateItem(item.id, 'name', e.target.value)}
                                />
                                <input 
                                  className="text-[13px] font-medium text-gray-500 w-full outline-none bg-transparent mt-1"
                                  value={item.description}
                                  onChange={(e) => handleUpdateItem(item.id, 'description', e.target.value)}
                                />
                             </td>
                             <td className="py-6">
                                <div className="flex items-center">
                                  <input 
                                    className="font-bold text-gray-700 w-full max-w-[100px] outline-none bg-transparent"
                                    type="number"
                                    value={item.price}
                                    onChange={(e) => handleUpdateItem(item.id, 'price', Number(e.target.value))}
                                  />
                                  <span className="text-sm font-bold text-gray-700 ml-1">đ</span>
                                </div>
                             </td>
                             <td className="py-6 text-center">
                                <input 
                                  className="font-black text-gray-900 w-12 text-center outline-none bg-[#f4f7fa] py-1 rounded"
                                  type="number"
                                  value={item.quantity < 10 ? `0${item.quantity}` : item.quantity}
                                  onChange={(e) => handleUpdateItem(item.id, 'quantity', Number(e.target.value))}
                                />
                             </td>
                             <td className="py-6 text-right">
                                <p className="font-black text-[16px] text-gray-900">{formatCurrency(item.price * item.quantity).replace('₫','')} <span className="text-sm font-bold ml-0.5">đ</span></p>
                             </td>
                             <td className="py-6 text-right">
                                <button title="Xoá" onClick={() => handleRemoveItem(item.id)} className="text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 p-2">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                             </td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
                 {extraItems.length === 0 && (
                   <p className="text-center italic text-gray-400 font-medium py-8">Chưa có khoản thu nào.</p>
                 )}
              </div>
           </div>

           {/* Payment Methods */}
           <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                 <Banknote className="w-6 h-6 text-[#111827]" strokeWidth={2.5} />
                 <h2 className="text-[1.15rem] font-extrabold text-[#111827] uppercase tracking-wide">PHƯƠNG THỨC THANH TOÁN</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <button 
                   onClick={() => setPaymentMethod("CASH")}
                   className={`p-6 rounded-2xl flex items-center gap-4 transition-colors font-bold text-[15px] border-2 shadow-sm ${
                     paymentMethod === "CASH" 
                       ? "bg-[#f0f5ff] border-[#1a56db] text-[#1a56db]" 
                       : "bg-white border-gray-100 text-gray-600 hover:border-gray-200"
                   }`}
                 >
                    <Banknote className="w-8 h-8 opacity-80" strokeWidth={1.5} />
                    Tiền mặt
                 </button>
                 <button 
                   onClick={() => setPaymentMethod("TRANSFER")}
                   className={`p-6 rounded-2xl flex items-center gap-4 transition-colors font-bold text-[15px] border-2 shadow-sm ${
                     paymentMethod === "TRANSFER" 
                       ? "bg-[#f0f5ff] border-[#1a56db] text-[#1a56db]" 
                       : "bg-white border-gray-100 text-gray-600 hover:border-gray-200"
                   }`}
                 >
                    <Landmark className="w-8 h-8 opacity-80" strokeWidth={1.5} />
                    Chuyển khoản
                 </button>
                 <button 
                   onClick={() => setPaymentMethod("POS")}
                   className={`p-6 rounded-2xl flex items-center gap-4 transition-colors font-bold text-[15px] border-2 shadow-sm ${
                     paymentMethod === "POS" 
                       ? "bg-[#f0f5ff] border-[#1a56db] text-[#1a56db]" 
                       : "bg-white border-gray-100 text-gray-600 hover:border-gray-200"
                   }`}
                 >
                    <CreditCard className="w-8 h-8 opacity-80" strokeWidth={1.5} />
                    Thẻ POS
                 </button>
              </div>
           </div>
        </div>

        {/* Right Sidebar - Sticky Pane */}
        <div className="w-full xl:w-[380px] shrink-0 sticky top-10 flex flex-col gap-6">
           
           {/* Summary Payment Card */}
           <div className="bg-[#0b2447] rounded-[2rem] p-8 text-white relative shadow-2xl">
              <p className="text-[11px] font-black text-blue-200 uppercase tracking-widest mb-6">TÓM TẮT THANH TOÁN</p>
              
              <div className="space-y-4 mb-6">
                 <div className="flex justify-between items-center text-[14px]">
                    <span className="font-semibold text-blue-100/90 tracking-wide">Tạm tính</span>
                    <span className="font-bold">{formatCurrency(subTotal).replace('₫','')} <span className="text-xs">đ</span></span>
                 </div>
                 <div className="flex justify-between items-center text-[14px]">
                    <span className="font-semibold text-blue-100/90 tracking-wide">Thuế GTGT (10%)</span>
                    <span className="font-bold">{formatCurrency(vatAmount).replace('₫','')} <span className="text-xs">đ</span></span>
                 </div>
              </div>
              <div className="border-t border-white/10 pt-6 mb-6 text-right">
                 <p className="text-[10px] font-black text-blue-300/80 uppercase tracking-widest mb-1.5">TỔNG SỐ TIỀN CẦN THU</p>
                 <div className="flex items-baseline justify-end gap-1.5">
                    <span className="text-[2.2rem] font-black tracking-tighter leading-none">{formatCurrency(grandTotal).replace('₫','')}</span>
                    <span className="text-lg font-bold text-blue-300">đ</span>
                 </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 flex items-center gap-3 mb-8">
                 <span className="w-2.5 h-2.5 rounded-full bg-yellow-400"></span>
                 <span className="font-bold text-sm tracking-wide text-white">Chờ kế toán xác nhận thu</span>
              </div>

              <div className="flex flex-col gap-3">
                 <button className="w-full bg-white text-[#0b2447] py-4 rounded-[1.25rem] font-black text-[15px] hover:bg-gray-100 transition-colors flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-5 h-5" /> Xác nhận thu tiền
                 </button>
                 <button className="w-full bg-transparent border border-white/20 text-white py-4 rounded-[1.25rem] font-black text-[15px] hover:bg-white/10 transition-colors flex items-center justify-center gap-2">
                    <Ban className="w-5 h-5" /> Khách từ chối / Hủy
                 </button>
              </div>

              <p className="text-center text-[10px] italic font-medium text-blue-200 mt-6 leading-relaxed opacity-80">
                 Sau khi xác nhận, hệ thống sẽ cập nhật số dư công nợ và tự động gửi hóa đơn điện tử cho khách hàng.
              </p>
           </div>

           {/* Quy Định */}
           <div className="bg-white border-2 border-gray-100 rounded-[2rem] p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                 <Info className="w-5 h-5 text-[#0b2447]" strokeWidth={2.5} />
                 <h3 className="text-[13px] font-black text-[#0b2447] uppercase tracking-wide">QUY ĐỊNH NGHIỆP VỤ</h3>
              </div>
              <div className="space-y-4">
                 <div className="flex items-start gap-3">
                    <div className="w-4 h-4 rounded-full bg-[#f0f4fa] text-[#1a56db] flex items-center justify-center flex-shrink-0 mt-0.5">
                       <Info className="w-2.5 h-2.5" strokeWidth={3} />
                    </div>
                    <p className="text-[13px] font-medium text-gray-600 leading-relaxed">
                       Khoản <b className="font-extrabold text-gray-800">bồi thường hư hại</b> cần đính kèm ảnh hiện trường và biên bản xác nhận của Kỹ thuật.
                    </p>
                 </div>
                 <div className="flex items-start gap-3">
                    <div className="w-4 h-4 rounded-full bg-[#f0f4fa] text-[#1a56db] flex items-center justify-center flex-shrink-0 mt-0.5">
                       <Info className="w-2.5 h-2.5" strokeWidth={3} />
                    </div>
                    <p className="text-[13px] font-medium text-gray-600 leading-relaxed">
                       Trường hợp cư dân yêu cầu <b className="font-extrabold text-gray-800">hóa đơn đỏ (VAT)</b>, cần cập nhật đầy đủ mã số thuế và thông tin công ty.
                    </p>
                 </div>
              </div>
           </div>

        </div>

      </div>
    </div>
  );
}
