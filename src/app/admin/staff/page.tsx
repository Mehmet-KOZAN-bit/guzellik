"use client";

import React, { useEffect, useState } from "react";
import { collection, query, orderBy, onSnapshot, doc, updateDoc, addDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { User, Edit2, Save, X, Plus, Trash2, Scissors } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import Modal from "@/components/Modal";

interface StaffMember {
  id: string;
  name: string;
  title: string;
  titleRu?: string;
  img: string;
  services: string[]; // IDs of services they can perform
  order: number;
}

export default function StaffCMS() {
  const { t, language } = useLanguage();
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<StaffMember>>({});
  const [isAdding, setIsAdding] = useState(false);
  const [services, setServices] = useState<any[]>([]);
  const [modal, setModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: "success" | "warning" | "error" | "info" | "confirm";
    onConfirm?: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
  });

  // 1. Fetch Staff
  useEffect(() => {
    if (!db) return;
    const q = query(collection(db, "staff"), orderBy("order", "asc"));
    const unsub = onSnapshot(q, (snap) => {
      setStaff(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as StaffMember)));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // 2. Fetch Services for selection
  useEffect(() => {
    if (!db) return;
    const q = query(collection(db, "services"), orderBy("order", "asc"));
    const unsub = onSnapshot(q, (snap) => {
      setServices(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, []);

  const handleEdit = (member: StaffMember) => {
    setEditingId(member.id);
    setEditFormData({ ...member });
  };

  const handleSave = async (id: string) => {
    if (!db) return;
    try {
      await updateDoc(doc(db, "staff", id), editFormData);
      setEditingId(null);
    } catch (err) {
      console.error("Scale error:", err);
    }
  };

  const handleAddNew = async () => {
    if (!db) return;
    try {
      await addDoc(collection(db, "staff"), {
        ...editFormData,
        order: staff.length + 1,
        services: editFormData.services || []
      });
      setIsAdding(false);
      setEditFormData({});
    } catch (err) {
      console.error("Add error:", err);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!db) return;
    setModal({
      isOpen: true,
      title: `${t.admin.common.delete} ${t.admin.staff.title}`,
      message: `'${name}' isimli personeli silmek istediğinizden emin misiniz?`,
      type: "confirm",
      onConfirm: async () => {
        if (!db) return;
        try {
          await deleteDoc(doc(db, "staff", id));
        } catch (err) {
          console.error("Delete error:", err);
        }
      }
    });
  };

  const toggleService = (serviceId: string) => {
    const current = editFormData.services || [];
    const updated = current.includes(serviceId)
      ? current.filter(id => id !== serviceId)
      : [...current, serviceId];
    setEditFormData({ ...editFormData, services: updated });
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 leading-tight">{t.admin.staff.title}</h1>
          <p className="text-gray-500 font-medium mt-1 uppercase text-xs tracking-widest">{t.admin.staff.subtitle}</p>
        </div>
        {!isAdding && (
          <button 
            onClick={() => { setIsAdding(true); setEditFormData({}); }}
            className="flex items-center space-x-2 px-5 py-2.5 bg-primary text-secondary rounded-xl font-bold text-sm shadow-lg hover:shadow-primary/20 transition-all hover:scale-[1.02]"
          >
            <Plus size={18} />
            <span>{t.admin.staff.addBtn}</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <AnimatePresence>
          {isAdding && (
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="bg-white p-8 rounded-3xl border-2 border-primary shadow-2xl space-y-6">
              <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                <h2 className="text-xl font-bold text-primary">{t.admin.staff.addNew}</h2>
                <button onClick={() => setIsAdding(false)} className="text-gray-400 hover:text-red-500"><X size={20} /></button>
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2 block">{t.admin.staff.name}</label>
                  <input type="text" value={editFormData.name || ""} onChange={(e) => setEditFormData({...editFormData, name: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-primary/20 outline-none font-bold" />
                </div>
                <div>
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2 block">{t.admin.staff.titleLabel}</label>
                    <input type="text" value={editFormData.title || ""} onChange={(e) => setEditFormData({...editFormData, title: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-primary/20 outline-none font-bold placeholder:text-gray-300" placeholder="" />
                </div>
                <div>
                   <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2 block">{t.admin.staff.titleLabel} (RU)</label>
                   <input type="text" value={editFormData.titleRu || ""} onChange={(e) => setEditFormData({...editFormData, titleRu: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-primary/20 outline-none font-bold" />
                </div>
                <div className="col-span-2">
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2 block">Photo URL</label>
                  <input type="text" value={editFormData.img || ""} onChange={(e) => setEditFormData({...editFormData, img: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-primary/20 outline-none font-bold" />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-4 block">{t.admin.staff.services}</label>
                <div className="grid grid-cols-2 gap-2">
                  {services.map(s => (
                    <button 
                      key={s.id} 
                      type="button"
                      onClick={() => toggleService(s.id)}
                      className={`px-4 py-3 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${
                        (editFormData.services || []).includes(s.id) 
                        ? 'bg-primary text-secondary border-transparent shadow-lg shadow-primary/20' 
                        : 'bg-gray-50 text-gray-400 border-gray-100 hover:border-primary/30'
                      }`}
                    >
                      {language === 'tr' ? (s.nameTr || s.name) : s.name}
                    </button>
                  ))}
                </div>
              </div>

              <button onClick={handleAddNew} className="w-full py-4 bg-primary text-secondary rounded-2xl font-black uppercase tracking-widest shadow-xl hover:scale-[1.01] active:scale-95 transition-all">
                {t.admin.common.save}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className={`space-y-4 ${isAdding ? 'flex-grow' : 'col-span-full'}`}>
          {staff.map((member) => {
            const isEditing = editingId === member.id;
            return (
              <motion.div layout key={member.id} className={`bg-white rounded-3xl border transition-all duration-300 overflow-hidden ${isEditing ? 'border-primary shadow-2xl ring-4 ring-primary/5' : 'border-gray-100 shadow-sm'}`}>
                <div className="p-6 flex items-center gap-6">
                  <div className="relative w-24 h-24 rounded-2xl overflow-hidden shadow-xl border-2 border-white group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={isEditing ? editFormData.img : member.img} alt={member.name} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                    {isEditing && (
                      <div className="absolute inset-0 bg-primary/80 flex items-center justify-center p-2">
                        <input type="text" value={editFormData.img} onChange={(e) => setEditFormData({...editFormData, img: e.target.value})} className="w-full bg-transparent border-b border-secondary/50 text-[10px] text-white text-center outline-none font-bold" placeholder="URL" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-grow space-y-2">
                    {isEditing ? (
                      <div className="grid grid-cols-2 gap-4">
                        <input type="text" value={editFormData.name} onChange={(e) => setEditFormData({...editFormData, name: e.target.value})} className="w-full px-3 py-2 bg-gray-50 rounded-lg text-sm font-bold border-none ring-1 ring-gray-200 outline-none focus:ring-2 focus:ring-primary/20" />
                        <div className="space-y-2">
                           <input type="text" value={editFormData.title} onChange={(e) => setEditFormData({...editFormData, title: e.target.value})} className="w-full px-3 py-2 bg-gray-50 rounded-lg text-xs font-bold border-none ring-1 ring-gray-200 outline-none focus:ring-2 focus:ring-primary/20" placeholder="EN Title" />
                           <input type="text" value={editFormData.titleRu} onChange={(e) => setEditFormData({...editFormData, titleRu: e.target.value})} className="w-full px-3 py-2 bg-gray-50 rounded-lg text-xs font-bold border-none ring-1 ring-gray-200 outline-none focus:ring-2 focus:ring-primary/20" placeholder="RU Title" />
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-2">
                           <h3 className="text-xl font-black text-gray-900">{member.name}</h3>
                           <div className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded text-[10px] font-black uppercase tracking-widest">Active</div>
                        </div>
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest italic">{member.title} {member.titleRu && `| ${member.titleRu}`}</p>
                      </>
                    )}
                    
                    <div className="flex flex-wrap gap-2 pt-2">
                      {(isEditing ? editFormData.services : member.services)?.map(sid => {
                        const s = services.find(x => x.id === sid);
                        return <span key={sid} className="px-3 py-1 bg-primary/5 text-primary rounded-lg text-[10px] font-black uppercase tracking-tighter border border-primary/5">{s ? (language === 'tr' ? (s.nameTr || s.name) : s.name) : sid}</span>;
                      })}
                      {isEditing && (
                        <div className="w-full pt-4 space-y-2">
                           <label className="text-[10px] font-black uppercase text-gray-300">Update Specializations</label>
                           <div className="flex flex-wrap gap-1">
                                {services.map(s => (
                                    <button key={s.id} onClick={() => toggleService(s.id)} className={`px-2 py-1 rounded text-[10px] font-bold border transition-colors ${(editFormData.services || []).includes(s.id) ? 'bg-primary text-secondary border-transparent' : 'bg-white text-gray-400 border-gray-100'}`}>{s.name}</button>
                                ))}
                           </div>
                        </div>
                      )}
                    </div>
                  </div>

                      <div className="flex flex-col gap-2">
                        {isEditing ? (
                          <>
                            <button onClick={() => handleSave(member.id)} className="p-3 bg-emerald-500 text-white rounded-xl shadow-lg shadow-emerald-500/20 hover:scale-110 active:scale-90 transition-all"><Save size={18} /></button>
                            <button onClick={() => setEditingId(null)} className="p-3 bg-gray-100 text-gray-400 rounded-xl hover:text-gray-600 transition-all"><X size={18} /></button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => handleEdit(member)} className="p-3 bg-primary/5 text-primary rounded-xl hover:bg-primary hover:text-secondary transition-all" title={t.admin.common.save}><Edit2 size={18} /></button>
                            <button onClick={() => handleDelete(member.id, member.name)} className="p-3 bg-red-50 text-red-400 rounded-xl hover:bg-red-500 hover:text-white transition-all" title={t.admin.common.delete}><Trash2 size={18} /></button>
                          </>
                        )}
                      </div>
                </div>
              </motion.div>
            );
          })}
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
    </div>
  );
}
