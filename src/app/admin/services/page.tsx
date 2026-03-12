"use client";

import React, { useEffect, useState } from "react";
import { collection, query, orderBy, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Scissors, Edit2, Save, X, Plus, Image as ImageIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Service {
  id: string;
  name: string;
  nameTr: string;
  desc: string;
  descTr: string;
  price: number;
  img: string;
  order: number;
  focalPoint?: { x: number; y: number };
}

export default function ServicesCMS() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<Service>>({});

  useEffect(() => {
    if (!db) {
      setTimeout(() => setLoading(false), 0);
      return;
    }

    const q = query(collection(db, "services"), orderBy("order", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Service[];
      setServices(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleEdit = (service: Service) => {
    setEditingId(service.id);
    setEditFormData({
      ...service,
      focalPoint: service.focalPoint || { x: 50, y: 50 }
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditFormData({});
  };

  const handleSave = async (id: string) => {
    if (!db) return;
    try {
      await updateDoc(doc(db, "services", id), editFormData);
      setEditingId(null);
    } catch (error) {
      console.error("Error updating service:", error);
    }
  };

  const setFocalPointFromClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setEditFormData({ ...editFormData, focalPoint: { x, y } });
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
          <h1 className="text-3xl font-bold text-gray-900 leading-tight">Services Management</h1>
          <p className="text-gray-500 font-medium mt-1 uppercase text-xs tracking-widest">Update catalog, prices and images</p>
        </div>
        <button className="flex items-center space-x-2 px-5 py-2.5 bg-primary text-secondary rounded-xl font-bold text-sm shadow-lg hover:shadow-primary/20 transition-all hover:scale-[1.02]">
          <Plus size={18} />
          <span>Add New Service</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {services.map((service) => {
          const isEditing = editingId === service.id;
          const currentFocal = isEditing ? editFormData.focalPoint : service.focalPoint;

          return (
            <motion.div
              layout
              key={service.id}
              className={`bg-white rounded-2xl border transition-all duration-300 overflow-hidden flex flex-col ${
                isEditing ? "ring-2 ring-primary shadow-xl border-transparent" : "border-gray-100 shadow-sm"
              }`}
            >
              <div 
                className={`relative h-56 overflow-hidden group ${isEditing ? 'cursor-crosshair' : ''}`}
                onClick={isEditing ? setFocalPointFromClick : undefined}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={isEditing ? editFormData.img : service.img} 
                  alt={service.name} 
                  style={{ 
                    objectPosition: `${currentFocal?.x ?? 50}% ${currentFocal?.y ?? 50}%` 
                  }}
                  className={`w-full h-full object-cover transition-transform duration-700 ${isEditing ? 'brightness-[0.4] contrast-[0.8]' : 'group-hover:scale-110'}`} 
                />

                {isEditing && (
                  <>
                    <div className="absolute inset-0 bg-white/5 opacity-0 hover:opacity-100 transition-opacity" />
                    <div 
                      className="absolute w-6 h-6 border-2 border-primary rounded-full -ml-3 -mt-3 shadow-lg flex items-center justify-center bg-white/20 backdrop-blur-sm transition-all duration-200 pointer-events-none"
                      style={{ 
                        left: `${editFormData.focalPoint?.x ?? 50}%`, 
                        top: `${editFormData.focalPoint?.y ?? 50}%` 
                      }}
                     >
                       <div className="w-1 h-1 bg-primary rounded-full shadow-[0_0_8px_primary]" />
                    </div>
                    <div className="absolute bottom-2 inset-x-0 text-center">
                      <p className="text-[8px] font-black text-white uppercase tracking-widest pointer-events-none">Click to target focus</p>
                    </div>
                  </>
                )}

                <div className={`absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4 ${isEditing ? 'opacity-0' : ''}`}>
                  <span className="text-white font-black text-xs uppercase tracking-widest bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10">
                     {service.nameTr}
                  </span>
                </div>
                
                {isEditing && (
                  <div className="absolute inset-x-0 top-0 p-3 bg-primary text-secondary flex items-center space-x-2">
                    <ImageIcon size={14} className="text-accent" />
                    <input 
                      type="text" 
                      value={editFormData.img || ""}
                      onChange={(e) => setEditFormData({ ...editFormData, img: e.target.value })}
                      placeholder="Image URL..."
                      className="bg-transparent border-none focus:ring-0 text-[10px] w-full placeholder:text-secondary/50 font-bold"
                    />
                  </div>
                )}
              </div>

              <div className="p-6 flex-grow flex flex-col space-y-4">
                {isEditing ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-black uppercase text-gray-400 tracking-tighter mb-1 block">Turkish Name</label>
                        <input 
                          type="text" 
                          value={editFormData.nameTr || ""}
                          onChange={(e) => setEditFormData({ ...editFormData, nameTr: e.target.value })}
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black uppercase text-gray-400 tracking-tighter mb-1 block">Price (₺)</label>
                        <input 
                          type="number" 
                          value={editFormData.price || 0}
                          onChange={(e) => setEditFormData({ ...editFormData, price: Number(e.target.value) })}
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all font-mono"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase text-gray-400 tracking-tighter mb-1 block">Description (TR)</label>
                      <textarea 
                        rows={2}
                        value={editFormData.descTr || ""}
                        onChange={(e) => setEditFormData({ ...editFormData, descTr: e.target.value })}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                      />
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 leading-tight">{service.nameTr}</h3>
                        <p className="text-[10px] text-gray-400 font-bold uppercase">{service.name}</p>
                      </div>
                      <div className="text-xl font-black text-primary">₺{service.price}</div>
                    </div>
                    <p className="text-xs text-gray-500 font-medium leading-relaxed italic line-clamp-2">
                      {service.descTr}
                    </p>
                  </>
                )}

                <div className="pt-4 mt-auto border-t border-gray-50 flex justify-end gap-2">
                  {isEditing ? (
                    <>
                      <button 
                        onClick={handleCancel}
                        className="px-4 py-2 text-xs font-bold uppercase text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={() => handleSave(service.id)}
                        className="flex items-center space-x-2 px-4 py-2 bg-emerald-500 text-white rounded-xl text-xs font-bold uppercase shadow-lg shadow-emerald-500/20 hover:scale-[1.02] active:scale-95 transition-all"
                      >
                        <Save size={14} />
                        <span>Save</span>
                      </button>
                    </>
                  ) : (
                    <button 
                      onClick={() => handleEdit(service)}
                      className="flex items-center space-x-2 px-4 py-2 bg-primary/5 text-primary hover:bg-primary hover:text-secondary rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300"
                    >
                      <Edit2 size={14} />
                      <span>Edit Info</span>
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
