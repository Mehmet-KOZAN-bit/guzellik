"use client";

import React, { useState, useEffect } from "react";
import { doc, onSnapshot, updateDoc, setDoc, collection, addDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Palette, Save, Layout, Globe, Image as ImageIcon, Loader2, ArrowLeft, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import Modal from "@/components/Modal";
import Link from "next/link";

interface BrandingConfig {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  logoUrl: string;
  siteName: string;
}

interface CustomerNote {
  id?: string;
  customerName: string;
  salePrice: string;
  details: string;
  createdAt: any;
}

export default function SuperAdminBranding() {
  const [branding, setBranding] = useState<BrandingConfig>({
    primaryColor: "#3E2723",
    secondaryColor: "#D4AF37",
    accentColor: "#FFFDD0",
    logoUrl: "",
    siteName: "GlowLuxe",
  });
  
  const [notes, setNotes] = useState<CustomerNote[]>([]);
  const [newNote, setNewNote] = useState<Omit<CustomerNote, 'id' | 'createdAt'>>({
    customerName: "",
    salePrice: "",
    details: ""
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modal, setModal] = useState<{ isOpen: boolean; title: string; message: string; type: "success" | "error" }>({
    isOpen: false,
    title: "",
    message: "",
    type: "success",
  });

  useEffect(() => {
    if (!db) return;

    // Listen for branding settings
    const unsubBranding = onSnapshot(doc(db, "settings", "branding"), (snap) => {
      if (snap.exists()) {
        setBranding(snap.data() as BrandingConfig);
      }
    });

    // Listen for customer notes
    const unsubNotes = onSnapshot(collection(db, "super_notes"), (snap) => {
      const notesList = snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as CustomerNote[];
      setNotes(notesList.sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds));
      setLoading(false);
    });

    return () => {
      unsubBranding();
      unsubNotes();
    };
  }, []);

  const handleSaveBranding = async () => {
    if (!db) return;
    setSaving(true);
    try {
      await setDoc(doc(db, "settings", "branding"), branding);
      setModal({
        isOpen: true,
        title: "Master Branding Güncellendi",
        message: "Tüm platform renkleri ve marka kimliği başarıyla güncellendi.",
        type: "success",
      });
    } catch (error) {
      console.error("Save error:", error);
      setModal({
        isOpen: true,
        title: "Hata",
        message: "Ayarlar kaydedilirken bir sorun oluştu.",
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db || !newNote.customerName) return;
    
    try {
      const notesRef = collection(db, "super_notes");
      await addDoc(notesRef, {
        ...newNote,
        createdAt: serverTimestamp()
      });
      setNewNote({ customerName: "", salePrice: "", details: "" });
    } catch (error) {
      console.error("Error adding note:", error);
    }
  };

  const handleDeleteNote = async (id: string) => {
    if (!db || !window.confirm("Bu notu silmek istediğinize emin misiniz?")) return;
    try {
      await deleteDoc(doc(db, "super_notes", id));
    } catch (error) {
      console.error("Error deleting note:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto space-y-12">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="p-2 bg-white rounded-xl shadow-sm hover:bg-gray-100 transition-colors">
              <ArrowLeft size={20} className="text-gray-500" />
            </Link>
            <div>
              <h1 className="text-4xl font-black text-gray-900 tracking-tight italic uppercase">Super Admin</h1>
              <p className="text-gray-500 font-bold uppercase text-[10px] tracking-widest mt-1">SaaS Owner Control Center</p>
            </div>
          </div>
          <button
            onClick={handleSaveBranding}
            disabled={saving}
            className="flex items-center space-x-2 px-8 py-4 bg-gray-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
          >
            {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            <span>{saving ? "Uygulanıyor..." : "Branding Ayarlarını Kaydet"}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Identity & Color Palette */}
          <div className="lg:col-span-1 space-y-8">
            <section className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 space-y-6">
              <div className="flex items-center space-x-3 text-gray-900">
                <div className="p-2 bg-gray-900 text-white rounded-xl">
                  <Globe size={18} />
                </div>
                <h2 className="font-black uppercase tracking-widest text-xs">Marka Kimliği</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1.5 block">Site İsmi</label>
                  <input 
                    type="text" 
                    value={branding.siteName}
                    onChange={(e) => setBranding({...branding, siteName: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold focus:ring-4 focus:ring-gray-900/5 transition-all outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1.5 block">Logo URL</label>
                  <input 
                    type="text" 
                    value={branding.logoUrl}
                    onChange={(e) => setBranding({...branding, logoUrl: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-xs font-medium focus:ring-4 focus:ring-gray-900/5 transition-all outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-50 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Primary</span>
                  <input type="color" value={branding.primaryColor} onChange={(e) => setBranding({...branding, primaryColor: e.target.value})} className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-none" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Secondary</span>
                  <input type="color" value={branding.secondaryColor} onChange={(e) => setBranding({...branding, secondaryColor: e.target.value})} className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-none" />
                </div>
              </div>
            </section>

            <section className="bg-gray-900 p-8 rounded-[32px] shadow-xl text-center space-y-4">
               <h3 className="text-white/40 text-[9px] font-black uppercase tracking-[0.2em]">Önizleme</h3>
               <div className="flex flex-col items-center gap-4">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center border border-white/10 shadow-lg" style={{ backgroundColor: branding.primaryColor }}>
                    {branding.logoUrl ? <img src={branding.logoUrl} className="w-6 h-6 object-contain" alt="" /> : <div className="w-4 h-4 rounded-full" style={{ backgroundColor: branding.secondaryColor }} />}
                  </div>
                  <h4 className="text-xl font-black text-white italic uppercase tracking-tighter">{branding.siteName}</h4>
               </div>
            </section>
          </div>

          {/* Customer & Sales Notes */}
          <div className="lg:col-span-2 space-y-8">
            <section className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 space-y-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 text-gray-900">
                  <div className="p-3 bg-gray-900 text-white rounded-2xl">
                    <Save size={20} />
                  </div>
                  <h2 className="font-black uppercase tracking-widest text-sm">Müşteri ve Satış Notları</h2>
                </div>
              </div>

              <form onSubmit={handleAddNote} className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-6 rounded-3xl">
                <div className="space-y-4 md:col-span-1">
                  <input 
                    type="text" 
                    placeholder="Müşteri Adı / Website"
                    value={newNote.customerName}
                    onChange={(e) => setNewNote({...newNote, customerName: e.target.value})}
                    className="w-full px-5 py-4 bg-white border border-gray-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-gray-900/5 outline-none"
                    required
                  />
                  <input 
                    type="text" 
                    placeholder="Satış Fiyatı (örn: 5000 TL)"
                    value={newNote.salePrice}
                    onChange={(e) => setNewNote({...newNote, salePrice: e.target.value})}
                    className="w-full px-5 py-4 bg-white border border-gray-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-gray-900/5 outline-none"
                  />
                </div>
                <div className="md:col-span-1">
                  <textarea 
                    placeholder="Detaylar, hatırlatıcılar..."
                    value={newNote.details}
                    onChange={(e) => setNewNote({...newNote, details: e.target.value})}
                    className="w-full h-full min-h-[120px] px-5 py-4 bg-white border border-gray-100 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-gray-900/5 outline-none resize-none"
                  />
                </div>
                <div className="md:col-span-2 text-right">
                  <button type="submit" className="bg-gray-900 text-white px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all">
                    Notu Kaydet
                  </button>
                </div>
              </form>

              <div className="space-y-4">
                <h3 className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Kayıtlı Müşteriler</h3>
                <div className="grid grid-cols-1 gap-4">
                  {notes.length === 0 ? (
                    <p className="text-center py-10 text-gray-400 text-xs font-bold uppercase tracking-widest">Henüz kayıt bulunmuyor</p>
                  ) : (
                    notes.map((note) => (
                      <div key={note.id} className="group relative bg-white border border-gray-100 p-6 rounded-[28px] hover:border-gray-200 transition-all shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <h4 className="font-black text-gray-900 text-base">{note.customerName}</h4>
                          <p className="text-xs text-gray-500 font-medium">{note.details}</p>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-right">
                            <p className="text-lg font-black text-primary italic">{note.salePrice}</p>
                            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Satış Bedeli</p>
                          </div>
                          <button 
                            onClick={() => note.id && handleDeleteNote(note.id)}
                            className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </section>
          </div>
        </div>
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
