"use client";

import React, { useEffect, useState } from "react";
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Check, X, Trash2, Clock, Calendar, Mail, Phone, ExternalLink, MessageCircle, RefreshCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Modal from "@/components/Modal";

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
      title: "Randevu Silme",
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

  const handleRefund = async (appt: Appointment) => {
    setModal({
      isOpen: true,
      title: "Ücret İadesi (Refund)",
      message: `${appt.name} adlı müşterinin ${appt.depositAmount} ₺ tutarındaki ödemesini iade etmek ve randevuyu iptal etmek istediğinize emin misiniz? (Gün içi işlemlerde kesintisiz iptal olur)`,
      type: "confirm",
      onConfirm: async () => {
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
              title: "İade Başarısız",
              message: data.error || "İade işlemi sırasında bir hata oluştu.",
              type: "error",
            });
          } else {
            setModal({
              isOpen: true,
              title: "İade Başarılı",
              message: "Ödeme başarıyla iade edildi ve randevu iptal edildi.",
              type: "success",
            });
          }
        } catch (error) {
          console.error("Refund error:", error);
        }
      }
    });
  };

  const filteredAppointments = filter === "all" 
    ? appointments 
    : appointments.filter(a => a.status === filter);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
      case "approved":
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-200 uppercase tracking-tighter">Approved</span>;
      case "cancelled":
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-700 border border-rose-200 uppercase tracking-tighter">Cancelled</span>;
      default:
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700 border border-amber-200 uppercase tracking-tighter">Pending</span>;
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
          <h1 className="text-3xl font-bold text-gray-900">Appointments</h1>
          <p className="text-gray-500 mt-1 font-medium">Manage and monitor all salon bookings.</p>
        </div>
        
        <div className="flex bg-white p-1 rounded-xl shadow-sm border border-gray-200">
          {(["all", "pending", "approved", "cancelled"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all ${
                filter === f 
                  ? "bg-primary text-secondary shadow-md" 
                  : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Service</th>
                <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Schedule</th>
                <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Payment Details</th>
                <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider text-center">Status</th>
                <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredAppointments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center">
                      <Calendar className="w-12 h-12 text-gray-200 mb-4" />
                      <p className="text-gray-400 font-medium">No appointments found matching your criteria.</p>
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
                            <span className="text-[10px] text-gray-400 font-bold uppercase">Paid:</span>
                            <span className="text-sm font-black text-emerald-600">₺{appt.depositAmount}</span>
                          </div>
                          <div className="flex items-center justify-between max-w-[120px]">
                            <span className="text-[10px] text-gray-400 font-bold uppercase">Total:</span>
                            <span className="text-xs font-bold text-gray-500">₺{appt.servicePrice}</span>
                          </div>
                        </div>
                      ) : (
                        <span className="text-[10px] text-gray-300 font-black uppercase tracking-widest italic">No Deposit</span>
                      )}
                    </td>
                    <td className="px-6 py-5 text-center">
                      <div className="flex flex-col items-center gap-1.5">
                        {getStatusBadge(appt.status)}
                        {appt.paymentStatus === 'paid' && (
                          <span className="text-[9px] font-black text-blue-500 uppercase tracking-wider flex items-center">
                            <Check className="w-2.5 h-2.5 mr-0.5 shadow-sm" strokeWidth={4} /> Payment Confirmed
                          </span>
                        )}
                        {appt.paymentStatus === 'failed' && (
                          <span className="text-[9px] font-black text-rose-400 uppercase tracking-wider">Payment Failed</span>
                        )}
                        {appt.paymentStatus === 'refunded' && (
                          <span className="text-[9px] font-black text-gray-500 uppercase tracking-wider">Refunded</span>
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
                              title="İptal Et"
                            >
                              <X size={16} />
                            </button>
                          </>
                        )}
                        {appt.paymentStatus === "paid" && appt.status !== "cancelled" && (
                          <button
                            onClick={() => handleRefund(appt)}
                            className="p-2 text-indigo-600 bg-indigo-50 hover:bg-indigo-600 hover:text-white rounded-xl transition-all shadow-sm"
                            title="İade Et (Refund)"
                          >
                            <RefreshCcw size={16} />
                          </button>
                        )}
                        <button
                          onClick={() => handleWhatsApp(appt)}
                          className="p-2 text-green-600 bg-green-50 hover:bg-green-600 hover:text-white rounded-xl transition-all shadow-sm"
                          title="WhatsApp ile Bildir"
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
        confirmText="Sil"
        cancelText="İptal"
      />
    </div>
  );
}
