"use client";

import React, { useState, useEffect, Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { useConfig } from "@/context/ConfigContext";
import { motion, AnimatePresence } from "framer-motion";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot, getDocs, where } from "firebase/firestore";
import { Clock, Calendar, User, MessageCircle, AlertCircle, CheckCircle2, Zap } from "lucide-react";

interface ServiceData {
  id: string;
  name: string;
  price: number;
  duration: number;
}

function BookingForm() {
  const { t, language } = useLanguage();
  const { branding } = useConfig();
  const searchParams = useSearchParams();
  const initialService = searchParams?.get("service") || "";

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    service: initialService,
    serviceName: "",
    serviceDuration: 30,
    servicePrice: 0,
    staffId: "",
    staffName: "",
    date: "",
    time: "",
    message: "",
  });

  const statusParam = searchParams?.get("status");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">(
    statusParam === "success" ? "success" : statusParam === "failed" ? "error" : "idle"
  );
  const [errorMessage, setErrorMessage] = useState("");
  const [allStaff, setAllStaff] = useState<any[]>([]);
  const [filteredStaff, setFilteredStaff] = useState<any[]>([]);
  const [firestoreServices, setFirestoreServices] = useState<any[]>([]);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Load Services
  useEffect(() => {
    if (!db) return;
    const q = query(collection(db, "services"), orderBy("order", "asc"));
    const unsub = onSnapshot(q, (snap) => {
      setFirestoreServices(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, []);

  const servicesMap: ServiceData[] = useMemo(() => {
    return firestoreServices.map(s => ({ 
      id: s.id, 
      name: language === 'tr' ? (s.nameTr || s.name) : (s.nameEn || s.name), 
      price: s.price, 
      duration: s.duration || 30 
    }));
  }, [firestoreServices, language]);

  // Sync service names on language change
  useEffect(() => {
    if (formData.service) {
      const selected = servicesMap.find(s => s.id === formData.service);
      if (selected) setFormData(p => ({ ...p, serviceName: selected.name }));
    }
    if (formData.staffId) {
      const selected = allStaff.find(s => s.id === formData.staffId);
      if (selected) setFormData(p => ({ ...p, staffName: selected.name }));
    }
  }, [language, servicesMap, allStaff]);

  // Load Staff
  useEffect(() => {
    if (!db) return;
    const q = query(collection(db, "staff"), orderBy("order", "asc"));
    const unsub = onSnapshot(q, (snap) => {
      setAllStaff(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, []);

  // Filter Staff
  useEffect(() => {
    if (!formData.service) {
      setFilteredStaff([]);
      return;
    }
    const filtered = allStaff.filter(s => !s.services || s.services.length === 0 || s.services.includes(formData.service));
    setFilteredStaff(filtered);
  }, [formData.service, allStaff]);

  // Fetch Occupied Slots
  useEffect(() => {
    const fetchOccupiedSlots = async () => {
      if (!formData.date || !db) return;
      setLoadingSlots(true);
      try {
        const appointmentsRef = collection(db, "appointments");
        let q = query(
          appointmentsRef, 
          where("date", "==", formData.date),
          where("status", "in", ["pending", "confirmed", "approved"])
        );
        if (formData.staffId) q = query(q, where("staffId", "==", formData.staffId));

        const snap = await getDocs(q);
        const occupied = new Set<string>();
        snap.forEach(doc => {
          const data = doc.data();
          occupied.add(data.time);
          const duration = data.serviceDuration || 30;
          if (duration > 30) {
              const [h, m] = data.time.split(':').map(Number);
              let totalMins = h * 60 + m;
              const slotsToBlock = Math.ceil(duration / 30);
              for (let i = 1; i < slotsToBlock; i++) {
                  totalMins += 30;
                  const nextH = Math.floor(totalMins / 60);
                  const nextM = totalMins % 60;
                  const nextTime = `${nextH.toString().padStart(2, '0')}:${nextM.toString().padStart(2, '0')}`;
                  occupied.add(nextTime);
              }
          }
        });
        setBookedSlots(Array.from(occupied));
      } catch (err) {
        console.error("Error fetching slots:", err);
      } finally {
        setLoadingSlots(false);
      }
    };
    fetchOccupiedSlots();
  }, [formData.date, formData.staffId]);

  const timeSlots = useMemo(() => {
    const slots = [];
    for (let h = 9; h <= 19; h++) {
      for (let m = 0; m < 60; m += 30) {
        slots.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
      }
    }
    return slots;
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === "service") {
       const selected = servicesMap.find(s => s.id === value);
       setFormData(prev => ({ 
           ...prev, 
           service: value, 
           serviceName: selected?.name || "", 
           servicePrice: selected?.price || 0,
           serviceDuration: selected?.duration || 30
       }));
    } else if (name === "staffId") {
       const selected = allStaff.find(s => s.id === value);
       setFormData(prev => ({ ...prev, staffId: value, staffName: selected?.name || "" }));
    } else {
       setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const fillForm = () => {
    setFormData({
      ...formData,
      name: "Mehmet Kozan",
      phone: "5321234567",
      email: "mehmet@test.com",
      message: "Test rezervasyonudur.",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.time) {
        setErrorMessage("Lütfen randevu saati seçiniz.");
        return;
    }
    setStatus("submitting");
    setErrorMessage("");
    try {
      const response = await fetch('/api/payment/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Payment failed');
      if (data.paymentPageUrl) window.location.href = data.paymentPageUrl;
      else throw new Error('No payment URL');
    } catch (error: any) {
      console.error(error);
      setErrorMessage(error.message);
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className="bg-white p-10 rounded-2xl shadow-xl border border- emerald-100 text-center max-w-lg mx-auto">
        <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-8 h-8 text-emerald-500" />
        </div>
        <h2 className="text-2xl font-bold mb-2">{t.booking.success}</h2>
        <p className="text-gray-500 mb-8">{t.booking.successSub}</p>
        <Link href="/" className="px-8 py-3 bg-primary text-secondary rounded-full font-bold uppercase tracking-wider hover:opacity-90 inline-block transition-all">
          {t.booking.backToHome}
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 md:p-10 shadow-2xl rounded-2xl border border-gray-100 relative">
      <button type="button" onClick={fillForm} className="absolute top-6 right-8 flex items-center gap-1.5 text-[9px] font-black uppercase text-gray-300 hover:text-secondary transition-colors group">
         <Zap size={12} className="group-hover:fill-secondary" /> Doldur
      </button>

      <div className="text-center mb-8">
        <h1 className="text-2xl md:text-3xl font-light text-primary">{t.booking.title}</h1>
        <div className="w-10 h-0.5 bg-secondary mx-auto mt-3" />
        <p className="mt-2 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">
           {branding?.siteName || "The Beauty Side"} Premium Experience
        </p>
      </div>

      {status === "error" && (
        <div className="mb-6 p-3 bg-red-50 text-red-600 border border-red-100 rounded-lg flex items-center gap-2 text-xs font-bold">
          <AlertCircle size={18} /> {errorMessage || t.booking.error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-1">
            <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest">{t.booking.name}</label>
            <input required type="text" name="name" placeholder={t.booking.placeholders.name} value={formData.name} onChange={handleChange} className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl focus:border-secondary/30 outline-none transition-all font-bold text-xs" />
          </div>
          <div className="space-y-1">
            <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest">{t.booking.phone}</label>
            <input required type="tel" name="phone" placeholder={t.booking.placeholders.phone} value={formData.phone} onChange={handleChange} className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl focus:border-secondary/30 outline-none transition-all font-bold text-xs" />
          </div>
          <div className="space-y-1">
            <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest">{t.booking.email}</label>
            <input required type="email" name="email" placeholder={t.booking.placeholders.email} value={formData.email} onChange={handleChange} className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl focus:border-secondary/30 outline-none transition-all font-bold text-xs" />
          </div>
          <div className="space-y-1">
            <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest">{t.booking.service}</label>
            <select required name="service" value={formData.service} onChange={handleChange} className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl focus:border-secondary/30 outline-none transition-all font-bold appearance-none cursor-pointer text-xs">
              <option value="" disabled>{t.booking.selectService}</option>
              {servicesMap.map(s => <option key={s.id} value={s.id}>{s.name} (₺{s.price})</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest">{(t.booking as any).staffSelect}</label>
            <select name="staffId" value={formData.staffId} onChange={handleChange} disabled={!formData.service} className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl focus:border-secondary/30 outline-none transition-all font-bold appearance-none cursor-pointer disabled:opacity-50 text-xs">
              <option value="">{(t.booking as any).anyStaff}</option>
              {filteredStaff.map(s => <option key={s.id} value={s.id}>{s.name} ({s.title})</option>)}
            </select>
          </div>
        </div>

        <div className="pt-5 border-t border-gray-50">
          <div className="flex items-center gap-2 mb-4 text-primary">
            <Calendar size={16} />
            <h3 className="text-xs font-black uppercase tracking-widest">Schedule</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest">{t.booking.date}</label>
              <input required type="date" name="date" min={new Date().toISOString().split('T')[0]} value={formData.date} onChange={handleChange} className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl focus:border-secondary/30 outline-none font-bold text-xs" />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest">{t.booking.time}</label>
              {!formData.date ? (
                  <div className="py-2.5 px-3 bg-gray-50 rounded-xl text-[9px] font-black uppercase tracking-widest text-gray-300 italic">Select date</div>
              ) : (
                  <div className="grid grid-cols-3 gap-1.5 max-h-24 overflow-y-auto pr-1 custom-scrollbar">
                      {timeSlots.map(time => {
                          const isOccupied = bookedSlots.includes(time);
                          const isSelected = formData.time === time;
                          return (
                              <button key={time} type="button" disabled={isOccupied} onClick={() => setFormData(p => ({ ...p, time }))}
                                  className={`py-1.5 px-1 rounded-lg text-[10px] font-black transition-all ${
                                      isSelected ? 'bg-secondary text-primary' : isOccupied ? 'bg-gray-50 text-gray-200 cursor-not-allowed text-[8px]' : 'bg-gray-50 text-primary hover:bg-secondary/10'
                                  }`}
                              >
                                  {time}
                              </button>
                          );
                      })}
                  </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-1 pt-4 border-t border-gray-50">
          <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest">{t.booking.message}</label>
          <textarea rows={2} name="message" placeholder={t.booking.placeholders.message} value={formData.message} onChange={handleChange} className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl focus:border-secondary/30 outline-none transition-all font-medium resize-none placeholder:text-gray-300 text-xs" />
        </div>

        {formData.service && formData.servicePrice > 0 && (
          <div className="bg-primary p-5 rounded-2xl text-white">
              <div className="flex justify-between items-center mb-2">
                  <div className="text-xs space-y-0.5">
                      <p className="font-bold opacity-60 text-[8px] uppercase">Service</p>
                      <p className="text-base font-bold italic">{formData.serviceName}</p>
                      <p className="text-secondary font-bold text-[10px]">~{formData.serviceDuration} Dakika</p>
                  </div>
                  <div className="text-right">
                      <p className="text-3xl font-black italic tracking-tighter text-secondary">₺{formData.servicePrice}</p>
                  </div>
              </div>
              <div className="pt-2 border-t border-white/10 flex justify-between items-center">
                  <span className="text-[10px] font-bold text-secondary uppercase tracking-widest">{t.booking.depositAmount}</span>
                  <span className="text-xl font-black italic tracking-tighter">₺{formData.servicePrice / 2}</span>
              </div>
          </div>
        )}

        <button type="submit" disabled={status === "submitting" || !!(formData.date && !formData.time)} className="w-full py-3 bg-primary text-secondary rounded-full font-black uppercase tracking-widest text-xs hover:translate-y-[-1px] hover:shadow-lg transition-all disabled:opacity-50">
          {status === "submitting" ? t.booking.processing : t.booking.submit}
        </button>
      </form>
    </div>
  );
}

export default function BookPage() {
  return (
    <div className="min-h-screen bg-gray-50/30 py-24 flex items-center justify-center">
      <div className="w-full max-w-4xl px-4">
        <Suspense fallback={null}>
          <BookingForm />
        </Suspense>
      </div>
    </div>
  );
}
