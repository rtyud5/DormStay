import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Building, FileText, Plus, ShieldCheck, User, Wand2, X } from "lucide-react";
import {
  createInitialBillingInvoice,
  getBillingPreview,
  getInitialBillingPendingContracts,
} from "../../services/accounting.service";
import { formatCurrency } from "../../utils/accounting.utils";
import { ACCOUNTING_ROUTES } from "../../constants/accounting.constants";

export default function AccountingBillingPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [contracts, setContracts] = useState([]);
  const [selectedContractId, setSelectedContractId] = useState(String(location.state?.contractId || ""));
  const [preview, setPreview] = useState(null);
  const [extraCharges, setExtraCharges] = useState([]);
  const [dueDate, setDueDate] = useState("");

  const [loadingContracts, setLoadingContracts] = useState(true);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const selectedContract = useMemo(
    () => contracts.find((item) => String(item.id) === String(selectedContractId)) || null,
    [contracts, selectedContractId],
  );

  useEffect(() => {
    const fetchContracts = async () => {
      setLoadingContracts(true);
      setErrorMessage("");

      try {
        const response = await getInitialBillingPendingContracts({ limit: 100 });
        if (!response?.success) {
          throw new Error(response?.message || "Khong the tai danh sach hop dong cho lap hoa don");
        }

        setContracts(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        setErrorMessage(error?.message || "Khong the tai danh sach hop dong");
      } finally {
        setLoadingContracts(false);
      }
    };

    fetchContracts();
  }, []);

  useEffect(() => {
    if (!selectedContractId) {
      setPreview(null);
      return;
    }

    const fetchPreview = async () => {
      setLoadingPreview(true);
      setErrorMessage("");
      setSuccessMessage("");

      try {
        const response = await getBillingPreview(selectedContractId);
        if (!response?.success) {
          throw new Error(response?.message || "Khong the tai thong tin ky dau");
        }

        setPreview(response.data);
      } catch (error) {
        setPreview(null);
        setErrorMessage(error?.message || "Khong the tai thong tin ky dau");
      } finally {
        setLoadingPreview(false);
      }
    };

    fetchPreview();
  }, [selectedContractId]);

  const handleAddExtraCharge = () => {
    setExtraCharges((prev) => [...prev, { id: Date.now(), name: "", amount: 0 }]);
  };

  const handleRemoveExtraCharge = (id) => {
    setExtraCharges((prev) => prev.filter((item) => item.id !== id));
  };

  const handleUpdateExtraCharge = (id, field, value) => {
    setExtraCharges((prev) =>
      prev.map((item) => {
        if (item.id !== id) {
          return item;
        }

        return {
          ...item,
          [field]: field === "amount" ? Number(value || 0) : value,
        };
      }),
    );
  };

  const rentAmount = Number(preview?.summary?.rentAmount || 0);
  const totalExtra = extraCharges.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const grandTotal = rentAmount + totalExtra;

  const handleCreateInvoice = async () => {
    if (!selectedContractId || !preview?.contract) {
      return;
    }

    setSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const payload = {
        dueDate: dueDate || undefined,
        extraCharges: extraCharges
          .filter((item) => item.name && Number(item.amount) > 0)
          .map((item) => ({ name: item.name, amount: Number(item.amount) })),
      };

      const response = await createInitialBillingInvoice(selectedContractId, payload);
      if (!response?.success) {
        throw new Error(response?.message || "Khong the tao hoa don ky dau");
      }

      const createdInvoiceId = response?.data?.invoice?.id;
      setSuccessMessage(
        createdInvoiceId
          ? `Da tao hoa don ky dau thanh cong (#${createdInvoiceId})`
          : "Da tao hoa don ky dau thanh cong",
      );

      setExtraCharges([]);
      setDueDate("");

      const contractResponse = await getInitialBillingPendingContracts({ limit: 100 });
      if (contractResponse?.success) {
        setContracts(Array.isArray(contractResponse.data) ? contractResponse.data : []);
      }
    } catch (error) {
      setErrorMessage(error?.message || "Khong the tao hoa don ky dau");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-8 lg:p-10 max-w-[1400px] mx-auto bg-[#f9fafb] min-h-screen">
      <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-6 mb-8 mt-4">
        <div>
          <div className="flex items-center gap-3 text-xs font-black text-gray-500 uppercase tracking-widest mb-3">
            <span className="bg-gray-200 px-2.5 py-1 rounded-md text-gray-700">Lap hoa don ky dau</span>
            <span className="text-gray-400">•</span>
            <span>CHI THU TIEN THUE THANG DAU + PHU PHI</span>
          </div>
          <h1 className="text-[2.5rem] font-extrabold text-[#0b2447] tracking-tight leading-none mb-4">
            Tao Hoa Don Dau Ky
          </h1>

          <div className="relative inline-flex items-center bg-white border-2 border-gray-100 rounded-full pl-4 pr-2 py-1.5 shadow-sm hover:border-blue-200 transition-colors">
            <FileText className="w-4 h-4 text-blue-600 mr-2" />
            <span className="text-sm font-bold text-gray-600 mr-2">Hop dong:</span>
            <select
              value={selectedContractId}
              onChange={(event) => setSelectedContractId(event.target.value)}
              disabled={loadingContracts}
              className="bg-transparent text-sm font-extrabold outline-none text-[#0b2447] cursor-pointer appearance-none pr-6"
            >
              <option value="">-- Chon hop dong --</option>
              {contracts.map((item) => (
                <option key={item.id} value={item.id}>
                  #{item.id} - {item.customerName}
                </option>
              ))}
            </select>
            <div className="absolute right-3 pointer-events-none text-gray-400 text-xs">▼</div>
          </div>
        </div>

        <button
          onClick={() => navigate(ACCOUNTING_ROUTES.INVOICES)}
          className="px-6 py-3 bg-white border-2 border-gray-200 text-gray-800 rounded-xl font-extrabold hover:bg-gray-50 transition-colors shadow-sm self-start xl:self-auto"
        >
          Ve danh sach phieu thu
        </button>
      </div>

      {errorMessage && (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700">
          {errorMessage}
        </div>
      )}

      {successMessage && (
        <div className="mb-6 rounded-2xl border border-green-200 bg-green-50 px-5 py-4 text-sm font-semibold text-green-700">
          {successMessage}
        </div>
      )}

      <div className="flex flex-col xl:flex-row gap-8 items-start">
        <div className="flex-1 space-y-6 w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-3xl p-7 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <User className="w-5 h-5 text-gray-400" />
                <h2 className="text-[1.1rem] font-extrabold text-[#111827]">Thong tin khach thue</h2>
              </div>
              {selectedContract ? (
                <div className="space-y-3">
                  <p className="font-extrabold text-lg text-gray-900">{selectedContract.customerName}</p>
                  <p className="text-sm text-gray-500">Khach hang: #{selectedContract.customerId || "--"}</p>
                  <p className="text-sm text-gray-500">Dien thoai: {selectedContract.customerPhone || "--"}</p>
                  <p className="text-sm text-gray-500">Ngay vao o: {selectedContract.startDate || "--"}</p>
                </div>
              ) : (
                <div className="h-20 flex items-center justify-center text-gray-400 font-medium italic border-2 border-dashed border-gray-100 rounded-xl">
                  Chon hop dong de xem chi tiet
                </div>
              )}
            </div>

            <div className="bg-white rounded-3xl p-7 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <Building className="w-5 h-5 text-gray-400" />
                <h2 className="text-[1.1rem] font-extrabold text-[#111827]">Thong tin phong/giuong</h2>
              </div>
              {selectedContract ? (
                <div className="space-y-3">
                  <p className="font-extrabold text-lg text-gray-900">
                    Phong {selectedContract.roomNumber || "--"}
                    {selectedContract.bedNumber ? ` - Giuong ${selectedContract.bedNumber}` : ""}
                  </p>
                  <p className="text-sm text-gray-500">Toa: {selectedContract.buildingName || "--"}</p>
                  <p className="text-sm text-gray-500">Tang: {selectedContract.floorName || "--"}</p>
                  <p className="text-sm text-gray-500">
                    Gia thue thang: {formatCurrency(selectedContract.baseRent || 0)}
                  </p>
                </div>
              ) : (
                <div className="h-20 flex items-center justify-center text-gray-400 font-medium italic border-2 border-dashed border-gray-100 rounded-xl">
                  Chua co thong tin
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-3xl p-7 shadow-sm border border-gray-100">
            <h2 className="text-[1.2rem] font-extrabold text-[#111827] mb-6">Chi tiet tien thue ky dau</h2>

            {loadingPreview ? (
              <p className="text-sm text-gray-500">Dang tai preview...</p>
            ) : preview?.rentLineItem ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-[#f9fafb] border-y border-gray-100">
                      <th className="py-4 px-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.15em]">
                        Mo ta
                      </th>
                      <th className="py-4 px-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] text-right">
                        Don gia
                      </th>
                      <th className="py-4 px-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] text-right">
                        So luong
                      </th>
                      <th className="py-4 px-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] text-right">
                        Thanh tien
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="py-4 px-4">
                        <p className="font-bold text-gray-900">{preview.rentLineItem.description}</p>
                      </td>
                      <td className="py-4 px-4 text-right font-semibold text-gray-700">
                        {formatCurrency(preview.rentLineItem.unitPrice)}
                      </td>
                      <td className="py-4 px-4 text-right font-semibold text-gray-700">
                        {preview.rentLineItem.quantity}
                      </td>
                      <td className="py-4 px-4 text-right font-extrabold text-gray-900">
                        {formatCurrency(preview.rentLineItem.amount)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-gray-500">Chon hop dong de xem preview.</p>
            )}
          </div>

          <div className="bg-white rounded-3xl p-7 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-[1.2rem] font-extrabold text-[#111827]">Phu phi</h2>
              <button
                onClick={handleAddExtraCharge}
                className="text-[#1a56db] font-bold text-sm flex items-center gap-1 hover:text-blue-800 transition-colors"
              >
                <Plus className="w-4 h-4" /> Them dong
              </button>
            </div>

            <div className="space-y-4">
              {extraCharges.map((charge) => (
                <div
                  key={charge.id}
                  className="flex items-center gap-4 bg-[#f9fafb] p-3 rounded-2xl border border-gray-100/50"
                >
                  <input
                    type="text"
                    value={charge.name}
                    onChange={(event) => handleUpdateExtraCharge(charge.id, "name", event.target.value)}
                    placeholder="Ten phu phi"
                    className="flex-1 bg-transparent border-none outline-none font-bold text-[14px] text-gray-800 px-3 py-2"
                  />
                  <div className="flex items-center bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-200">
                    <input
                      type="number"
                      value={charge.amount}
                      onChange={(event) => handleUpdateExtraCharge(charge.id, "amount", event.target.value)}
                      className="w-28 bg-transparent border-none outline-none text-right font-extrabold text-[15px] text-gray-900"
                    />
                    <span className="ml-2 text-xs font-bold text-gray-500 uppercase">VND</span>
                  </div>
                  <button
                    onClick={() => handleRemoveExtraCharge(charge.id)}
                    className="w-8 h-8 flex items-center justify-center text-red-400 hover:bg-red-50 hover:text-red-600 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ))}
              {extraCharges.length === 0 && (
                <p className="text-sm text-gray-400 font-medium italic text-center py-4">Khong co phu phi nao.</p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-3xl p-7 shadow-sm border border-gray-100">
            <h2 className="text-[1.1rem] font-extrabold text-[#111827] mb-4">Thong tin bo sung</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Ngay den han</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(event) => setDueDate(event.target.value)}
                  className="w-full bg-[#f9fafb] border border-gray-200 rounded-xl p-3 text-sm font-medium"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="w-full xl:w-[420px] shrink-0 sticky top-24 space-y-6">
          <div className="bg-[#0b2447] rounded-[2rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-blue-900/40">
            <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/10">
              <div>
                <p className="text-[10px] font-black text-blue-300/80 uppercase tracking-widest mb-1.5">Trang thai</p>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#4ade80]" />
                  <span className="font-extrabold text-sm tracking-wide">San sang tao hoa don</span>
                </div>
              </div>
              <ShieldCheck className="w-6 h-6 text-blue-200" />
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex justify-between items-center text-sm">
                <span className="font-semibold text-blue-100 text-opacity-80">Tien thue ky dau</span>
                <span className="font-bold">{formatCurrency(rentAmount)}</span>
              </div>
              <div className="flex justify-between items-center text-sm pb-2">
                <span className="font-semibold text-blue-100 text-opacity-80">Tong phu phi</span>
                <span className="font-bold">{formatCurrency(totalExtra)}</span>
              </div>
            </div>

            <div className="flex items-end justify-between mb-8">
              <span className="text-xl font-extrabold">Tong cong</span>
              <div className="text-right">
                <span className="text-[2rem] font-black tracking-tight leading-none text-[#8ebbf8]">
                  {formatCurrency(grandTotal)}
                </span>
                <span className="text-xs font-bold text-blue-300 ml-1">VND</span>
              </div>
            </div>

            <button
              onClick={handleCreateInvoice}
              disabled={!selectedContractId || !preview || submitting || loadingPreview}
              className="w-full flex items-center justify-center gap-2 bg-[#8ebbfa] hover:bg-[#a1c9fa] text-[#0b2447] py-4 rounded-xl font-black text-lg transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Wand2 className="w-5 h-5" strokeWidth={3} />
              {submitting ? "Dang tao..." : "Tao hoa don ky dau"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
