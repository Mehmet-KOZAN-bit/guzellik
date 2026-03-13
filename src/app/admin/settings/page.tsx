"use client";

import React, { useEffect, useState } from "react";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Settings, Save, Smartphone, Mail, MapPin, Instagram, Globe, Info, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import Modal from "@/components/Modal";
import { useLanguage } from "@/context/LanguageContext";

interface SiteConfig {
  siteName: string;
  phone: string;
  email: string;
  address: string;
  mapUrl: string;
  instagram: string;
  whatsapp: string;
  aboutEn: string;
  aboutTr: string;
}

export default function SettingsCMS() {
  const { t, language } = useLanguage();
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modal, setModal] = useState<{ isOpen: boolean; title: string; message: string; type: "success" | "error" }>({
    isOpen: false,
    title: "",
    message: "",
    type: "success",
  });

  useEffect(() => {
    if (!db) {
      setTimeout(() => setLoading(false), 0);
      return;
    }

    const unsubscribe = onSnapshot(doc(db, "settings", "config"), (doc) => {
      if (doc.exists()) {
        setConfig(doc.data() as SiteConfig);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!config) return;
    setConfig({ ...config, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (!db || !config) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, "settings", "config"), config as any);
      setModal({
        isOpen: true,
        title: t.admin.settingsPage.successTitle,
        message: t.admin.settingsPage.successMsg,
        type: "success",
      });
    } catch (error) {
      console.error("Error saving settings:", error);
      setModal({
        isOpen: true,
        title: t.admin.settingsPage.errorTitle,
        message: t.admin.settingsPage.errorMsg,
        type: "error",
      });
    } finally {
      setSaving(false);
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
    <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 leading-tight">{t.admin.settingsPage.title}</h1>
          <p className="text-gray-500 font-medium mt-1 uppercase text-xs tracking-widest">{t.admin.settingsPage.subtitle}</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center space-x-2 px-6 py-3 bg-primary text-secondary rounded-xl font-bold text-sm shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
        >
          {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
          <span>{saving ? t.admin.settingsPage.savingBtn : t.admin.settingsPage.saveBtn}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Contact Info Section */}
        <section className="space-y-6">
          <div className="flex items-center space-x-2 text-primary">
            <Smartphone size={20} />
            <h2 className="font-bold uppercase tracking-widest text-sm">{t.admin.settingsPage.contactSection}</h2>
          </div>
          
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
            <div>
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-tighter mb-1 block">{t.admin.settingsPage.salonPhone}</label>
              <input 
                name="phone"
                type="text" 
                value={config?.phone || ""}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-tighter mb-1 block">{t.admin.settingsPage.emailAddress}</label>
              <input 
                name="email"
                type="email" 
                value={config?.email || ""}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-tighter mb-1 block">{t.admin.settingsPage.physicalAddress}</label>
              <input 
                name="address"
                type="text" 
                value={config?.address || ""}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all font-sans"
              />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-tighter mb-1 block">{t.admin.settingsPage.mapUrl}</label>
              <input 
                name="mapUrl"
                type="text" 
                value={config?.mapUrl || ""}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-[10px] font-medium text-gray-400 focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
          </div>
        </section>

        {/* Social & About Section */}
        <section className="space-y-6">
          <div className="flex items-center space-x-2 text-primary">
            <Instagram size={20} />
            <h2 className="font-bold uppercase tracking-widest text-sm">{t.admin.settingsPage.socialSection}</h2>
          </div>
          
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
            <div>
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-tighter mb-1 block">{t.admin.settingsPage.instagramUrl}</label>
              <input 
                name="instagram"
                type="text" 
                value={config?.instagram || ""}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-tighter mb-1 block">{t.admin.settingsPage.whatsappUrl}</label>
              <input 
                name="whatsapp"
                type="text" 
                value={config?.whatsapp || ""}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2 text-primary mt-8">
            <Info size={20} />
            <h2 className="font-bold uppercase tracking-widest text-sm">{t.admin.settingsPage.aboutSection}</h2>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
            <div>
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-tighter mb-1 block">{t.admin.settingsPage.aboutTr}</label>
              <textarea 
                name="aboutTr"
                rows={4}
                value={config?.aboutTr || ""}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-primary/20 transition-all resize-none leading-relaxed"
              />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-tighter mb-1 block">{t.admin.settingsPage.aboutEn}</label>
              <textarea 
                name="aboutEn"
                rows={4}
                value={config?.aboutEn || ""}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-primary/20 transition-all resize-none leading-relaxed italic"
              />
            </div>
          </div>
        </section>
      </div>

      <Modal
        isOpen={modal.isOpen}
        onClose={() => setModal({ ...modal, isOpen: false })}
        title={modal.title}
        message={modal.message}
        type={modal.type}
      />
    </div>
  );
}
