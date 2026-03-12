"use client";

import React, { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";
import { SERVICE_PRICES } from "@/lib/constants";

function BookingForm() {
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const initialService = searchParams?.get("service") || "";

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    service: initialService,
    date: "",
    time: "",
    message: "",
  });

  const statusParam = searchParams?.get("status");
  
  // Set initial status based on URL parameters (from iyzico callback)
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">(
    statusParam === "success" ? "success" : statusParam === "failed" ? "error" : "idle"
  );

  const servicesMap = Object.entries(t.services.list).map(([id, data]) => ({
    id,
    name: (data as {name: string}).name,
  }));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting");

    try {
      const response = await fetch('/api/payment/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to initialize payment');
      }

      // Redirect to Iyzico Checkout Page
      if (data.paymentPageUrl) {
        window.location.href = data.paymentPageUrl;
      } else {
        throw new Error('No payment URL returned');
      }

    } catch (error) {
      console.error("Booking err:", error);
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-green-50 text-green-800 p-8 rounded-2xl border border-green-200 text-center"
      >
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-medium mb-2">{t.booking.success}</h2>
        <p className="text-green-700">{t.booking.successSub}</p>
        <Link 
          href="/"
          className="mt-6 px-10 py-3 bg-green-600 text-white rounded-full hover:bg-green-700 transition-all inline-block font-semibold tracking-wide shadow-lg shadow-green-200"
        >
          {t.booking.backToHome}
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white p-8 md:p-12 shadow-2xl rounded-2xl border border-secondary/10"
    >
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-light text-primary">{t.booking.title}</h1>
        <div className="w-16 h-1 bg-secondary mx-auto mt-4" />
      </div>

      {status === "error" && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm md:text-base">
          {statusParam === 'failed' ? t.booking.placeholderStatus : t.booking.error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground/80 uppercase tracking-wide">{t.booking.name}</label>
            <input 
              required
              type="text"
              name="name"
              placeholder={t.booking.placeholders.name}
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-accent/5 border border-secondary/20 rounded-lg focus:ring-2 focus:ring-secondary/50 focus:border-secondary outline-none transition placeholder:text-foreground/30 font-medium"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground/80 uppercase tracking-wide">{t.booking.phone}</label>
            <input 
              required
              type="tel"
              name="phone"
              placeholder={t.booking.placeholders.phone}
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-accent/5 border border-secondary/20 rounded-lg focus:ring-2 focus:ring-secondary/50 focus:border-secondary outline-none transition placeholder:text-foreground/30 font-medium"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground/80 uppercase tracking-wide">{t.booking.email}</label>
            <input 
              required
              type="email"
              name="email"
              placeholder={t.booking.placeholders.email}
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-accent/5 border border-secondary/20 rounded-lg focus:ring-2 focus:ring-secondary/50 focus:border-secondary outline-none transition placeholder:text-foreground/30 font-medium"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground/80 uppercase tracking-wide">{t.booking.service}</label>
            <select 
              required
              name="service"
              value={formData.service}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-accent/5 border border-secondary/20 rounded-lg focus:ring-2 focus:ring-secondary/50 focus:border-secondary outline-none transition appearance-none font-medium"
            >
              <option value="" disabled>{t.booking.selectService}</option>
              {servicesMap.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground/80 uppercase tracking-wide">{t.booking.date}</label>
            <input 
              required
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-accent/5 border border-secondary/20 rounded-lg focus:ring-2 focus:ring-secondary/50 focus:border-secondary outline-none transition"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground/80 uppercase tracking-wide">{t.booking.time}</label>
            <input 
              required
              type="time"
              name="time"
              value={formData.time}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-accent/5 border border-secondary/20 rounded-lg focus:ring-2 focus:ring-secondary/50 focus:border-secondary outline-none transition"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground/80 uppercase tracking-wide">{t.booking.message}</label>
          <textarea 
            rows={4}
            name="message"
            placeholder={t.booking.placeholders.message}
            value={formData.message}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-accent/5 border border-secondary/20 rounded-lg focus:ring-2 focus:ring-secondary/50 focus:border-secondary outline-none transition resize-none placeholder:text-foreground/30 font-medium"
          />
        </div>

        <AnimatePresence>
          {formData.service && SERVICE_PRICES[formData.service] && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-secondary/5 border border-secondary/20 rounded-xl p-4 mt-2 mb-4">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-primary/70 text-sm font-medium">{t.booking.servicePrice}</span>
                  <span className="text-lg font-bold text-primary">₺{SERVICE_PRICES[formData.service]}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-secondary/10 mb-3">
                  <span className="text-[10px] text-foreground/50 uppercase tracking-widest italic">*{t.booking.vatIncluded}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-secondary text-sm font-semibold">{t.booking.depositAmount}</span>
                  <span className="text-xl font-bold text-secondary">₺{SERVICE_PRICES[formData.service] / 2}</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <button 
          type="submit"
          disabled={status === "submitting"}
          className="w-full py-4 bg-primary text-secondary hover:bg-secondary hover:text-primary tracking-widest uppercase font-semibold text-sm transition-colors duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {status === "submitting" ? t.booking.processing : t.booking.submit}
        </button>
      </form>
    </motion.div>
  );
}

export default function BookPage() {
  return (
    <div className="min-h-screen bg-accent/10 py-20 flex items-center justify-center">
      <div className="w-full max-w-4xl px-4 sm:px-6">
        <Suspense fallback={<div className="text-center p-10"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div></div>}>
          <BookingForm />
        </Suspense>
      </div>
    </div>
  );
}
