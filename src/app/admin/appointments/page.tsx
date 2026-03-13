"use client";

import React, { useEffect, useState } from "react";
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Check, X, Trash2, Clock, Calendar, Mail, Phone, ExternalLink, MessageCircle, RefreshCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Modal from "@/components/Modal";
import { useLanguage } from "@/context/LanguageContext";

interface Appointment {
  id: string;
  name: string;
  phone: string;
  email: string;
  service: string;
  servicePrice?: number;
  depositAmount?: number;
  date: string;
  time: string;
  message: string;
  status: "pending" | "approved" | "cancelled" | "confirmed";
  paymentStatus?: "pending" | "paid" | "failed" | "refunded";
  paymentId?: string;
  createdAt: unknown;
}

export default function AppointmentsPage() {
  const { t } = useLanguage();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "confirmed" | "cancelled">("all");
  const [modal, setModal] = useState<{ 
    isOpen: boolean; 
    title: string; 
    message: string; 
    type: "success" | "info" | "confirm" | "error";
    onConfirm?: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
  });
  const [refundPrompt, setRefundPrompt] = useState<{
    isOpen: boolean;
    appt: Appointment | null;
    reason: string;
  }>({ isOpen: false, appt: null, reason: "" });

  useEffect(() => {
    if (!db) {
      setTimeout(() => setLoading(false), 0);
      return;
    }

    const q = query(collection(db, "appointments"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Appointment[];
      setAppointments(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: "approved" | "cancelled") => {
    if (!db) return;
    try {
      await updateDoc(doc(db, "appointments", id), { status: newStatus });
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handleDelete = async (id: string) => {
    setModal({
      isOpen: true,
      title: `${t.admin.common.delete} ${t.admin.appointments.title}`,
      message: "Bu randevuyu silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.",
      type: "confirm",
      onConfirm: async () => {
        if (!db) return;
        try {
          await deleteDoc(doc(db, "appointments", id));
        } catch (error) {
          console.error("Error deleting appointment:", error);
        }
      }
    });
  };

  const handleWhatsApp = (appt: Appointment) => {
    let phone = appt.phone.replace(/\D/g, "");
    if (phone.startsWith("0")) phone = "90" + phone.slice(1);
    else if (!phone.startsWith("90")) phone = "90" + phone;

    const text = `Merhaba ${appt.name},\n\n${appt.date} - ${appt.time} tarihindeki ${appt.service.replace("-", " ")} randevunuz başarıyla oluşturulmuştur.\n\nGlowLuxe'ü tercih ettiğiniz için teşekkür ederiz!`;
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  const handleRefundClick = (appt: Appointment) => {
    setRefundPrompt({ isOpen: true, appt, reason: "" });
  };

  const executeRefund = async () => {
    const { appt, reason } = refundPrompt;
    if (!appt) return;

    setRefundPrompt({ ...refundPrompt, isOpen: false });

    try {
      const res = await fetch("/api/payment/refund", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appointmentId: appt.id }),
      });
      const data = await res.json();
      
      if (!res.ok) {
        setModal({
          isOpen: true,
          title: "İade Başarısız / Refund Failed",
          message: data.error || "İade işlemi sırasında bir hata oluştu.",
          type: "error",
        });
      } else {
        // Build WhatsApp Message
        let phone = appt.phone.replace(/\D/g, "");
        if (phone.startsWith("0")) phone = "90" + phone.slice(1);
        else if (!phone.startsWith("90")) phone = "90" + phone;

        const reasonText = reason.trim() ? `\n\nİptal Nedeni: ${reason.trim()}` : "";
        const text = `Merhaba ${appt.name},\n\n${appt.date} - ${appt.time} tarihindeki ${appt.service.replace("-", " ")} randevunuz iptal edilmiş ve ${appt.depositAmount} ₺ tutarındaki ön ödemeniz kartınıza iade edilmiştir.${reasonText}\n\nSağlıklı günler dileriz,\nGlowLuxe`;
        const url = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
        
        // Open WhatsApp immediately
        window.open(url, "_blank");

        setModal({
          isOpen: true,
          title: "İade Başarılı / Refund Successful",
          message: "Ödeme iade edildi, randevu iptal edildi ve WhatsApp mesaj ekranı açıldı.",
          type: "success",
        });
      }
    } catch (error) {
      console.error("Refund error:", error);
    }
  };

  const filteredAppointments = filter === "all" 
    ? appointments 
    : appointments.filter(a => a.status === filter);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
      case "approved":
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-200 uppercase tracking-tighter">{t.admin.appointments.approved}</span>;
      case "cancelled":
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-700 border border-rose-200 uppercase tracking-tighter">{t.admin.appointments.cancelled}</span>;
      default:
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700 border border-amber-200 uppercase tracking-tighter">{t.admin.appointments.pending}</span>;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t.admin.appointments.title}</h1>
          <p className="text-gray-500 mt-1 font-medium">{t.admin.appointments.subtitle}</p>
        </div>
        
        <div className="flex bg-white p-1 rounded-xl shadow-sm border border-gray-200">
          {(["all", "pending", "approved", "cancelled"] as const).map((f) => {
            const labelMap: Record<string, string> = {
              'all': t.admin.appointments.all,
              'pending': t.admin.appointments.pending,
              'approved': t.admin.appointments.approved,
              'cancelled': t.admin.appointments.cancelled,
            };
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all ${
                  filter === f 
                    ? "bg-primary text-secondary shadow-md" 
                    : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
                }`}
              >
                {labelMap[f]}
              </button>
            )
          })}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider">{t.admin.appointments.customer}</th>
                <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider">{t.admin.appointments.service}</th>
                <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider">{t.admin.appointments.schedule}</th>
                <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider">{t.admin.appointments.paymentDetails}</th>
                <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider text-center">{t.admin.common.status}</th>
                <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">{t.admin.common.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredAppointments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center">
                      <Calendar className="w-12 h-12 text-gray-200 mb-4" />
                      <p className="text-gray-400 font-medium">{t.admin.appointments.noAppointments}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredAppointments.map((appt) => (
                  <tr key={appt.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center text-primary font-bold border border-primary/10">
                          {appt.name[0].toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-gray-900 leading-tight">{appt.name}</div>
                          <div className="flex flex-col mt-0.5">
                            <span className="text-xs text-gray-400 flex items-center"><Phone className="w-3 h-3 mr-1" /> {appt.phone}</span>
                            <span className="text-xs text-gray-400 flex items-center"><Mail className="w-3 h-3 mr-1" /> {appt.email}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-accent/10 text-primary uppercase tracking-tighter">
                        {appt.service.replace("-", " ")}
                      </span>
                      {appt.message && (
                        <p className="mt-1 text-[10px] text-gray-400 italic max-w-[150px] truncate" title={appt.message}>
                          "{appt.message}"
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-5">
                      <div className="text-sm font-bold text-gray-900">{appt.date}</div>
                      <div className="flex items-center text-xs text-gray-500 font-medium mt-0.5">
                        <Clock className="w-3 h-3 mr-1 text-accent" />
                        {appt.time}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      {appt.depositAmount ? (
                        <div className="space-y-1">
                          <div className="flex items-center justify-between max-w-[120px]">
                            <span className="text-[10px] text-gray-400 font-bold uppercase">{t.admin.appointments.paid}:</span>
                            <span className="text-sm font-black text-emerald-600">₺{appt.depositAmount}</span>
                          </div>
                          <div className="flex items-center justify-between max-w-[120px]">
                            <span className="text-[10px] text-gray-400 font-bold uppercase">{t.admin.appointments.total}:</span>
                            <span className="text-xs font-bold text-gray-500">₺{appt.servicePrice}</span>
                          </div>
                        </div>
                      ) : (
                        <span className="text-[10px] text-gray-300 font-black uppercase tracking-widest italic">{t.admin.appointments.noDeposit}</span>
                      )}
                    </td>
                    <td className="px-6 py-5 text-center">
                      <div className="flex flex-col items-center gap-1.5">
                        {getStatusBadge(appt.status)}
                        {appt.paymentStatus === 'paid' && (
                          <span className="text-[9px] font-black text-blue-500 uppercase tracking-wider flex items-center">
                            <Check className="w-2.5 h-2.5 mr-0.5 shadow-sm" strokeWidth={4} /> {t.admin.appointments.paymentConfirmed}
                          </span>
                        )}
                        {appt.paymentStatus === 'failed' && (
                          <span className="text-[9px] font-black text-rose-400 uppercase tracking-wider">{t.admin.appointments.paymentFailed}</span>
                        )}
                        {appt.paymentStatus === 'refunded' && (
                          <span className="text-[9px] font-black text-gray-500 uppercase tracking-wider">{t.admin.appointments.refunded}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {appt.status === "pending" && (
                          <>
                            <button
                              onClick={() => handleUpdateStatus(appt.id, "approved")}
                              className="p-2 text-emerald-600 bg-emerald-50 hover:bg-emerald-600 hover:text-white rounded-xl transition-all shadow-sm"
                            >
                              <Check size={16} />
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(appt.id, "cancelled")}
                              className="p-2 text-rose-600 bg-rose-50 hover:bg-rose-600 hover:text-white rounded-xl transition-all shadow-sm"
                              title={t.admin.appointments.cancelBtn}
                            >
                              <X size={16} />
                            </button>
                          </>
                        )}
                        {appt.paymentStatus === "paid" && appt.status !== "cancelled" && (
                          <button
                            onClick={() => handleRefundClick(appt)}
                            className="p-2 text-indigo-600 bg-indigo-50 hover:bg-indigo-600 hover:text-white rounded-xl transition-all shadow-sm"
                            title={t.admin.appointments.refundBtn}
                          >
                            <RefreshCcw size={16} />
                          </button>
                        )}
                        <button
                          onClick={() => handleWhatsApp(appt)}
                          className="p-2 text-green-600 bg-green-50 hover:bg-green-600 hover:text-white rounded-xl transition-all shadow-sm"
                          title={t.admin.appointments.whatsappBtn}
                        >
                          <MessageCircle size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(appt.id)}
                          className="p-2 text-gray-400 bg-gray-50 hover:bg-rose-500 hover:text-white rounded-xl transition-all shadow-sm"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={modal.isOpen}
        onClose={() => setModal({ ...modal, isOpen: false })}
        title={modal.title}
        message={modal.message}
        type={modal.type}
        onConfirm={modal.onConfirm}
        confirmText={t.admin.common.confirm}
        cancelText={t.admin.common.cancel}
      />

      {/* Custom Refund Prompt Modal */}
      <AnimatePresence>
        {refundPrompt.isOpen && refundPrompt.appt && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setRefundPrompt({ ...refundPrompt, isOpen: false })}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden p-8"
            >
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-indigo-50 rounded-2xl text-indigo-500">
                  <RefreshCcw size={40} />
                </div>
              </div>
              
              <h3 className="text-xl font-black text-center text-gray-900 mb-2 uppercase tracking-tight">
                Ücret İadesi (Refund)
              </h3>
              
              <p className="text-gray-500 font-medium text-center text-sm leading-relaxed mb-6">
                <strong>{refundPrompt.appt.name}</strong> adlı müşterinin <strong>{refundPrompt.appt.depositAmount} ₺</strong> tutarındaki ödemesini iade etmek ve randevuyu iptal etmek üzeresiniz.
              </p>

              <div className="mb-8">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                  İptal Nedeni (Müşteriye Gönderilecek)
                </label>
                <textarea
                  value={refundPrompt.reason}
                  onChange={(e) => setRefundPrompt({ ...refundPrompt, reason: e.target.value })}
                  placeholder="Örn: Personel rahatsızlığı nedeniyle..."
                  className="w-full border-2 border-gray-100 rounded-2xl p-4 text-sm focus:border-indigo-500 focus:ring-0 transition-colors resize-none h-24"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setRefundPrompt({ ...refundPrompt, isOpen: false })}
                  className="flex-1 py-4 bg-gray-100 text-gray-400 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-gray-200 transition-all active:scale-95"
                >
                  Vazgeç
                </button>
                <button
                  onClick={executeRefund}
                  className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 transition-all active:scale-95"
                >
                  Onayla ve İade Et
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
