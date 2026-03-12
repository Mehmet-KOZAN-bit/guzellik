"use client";

import React, { useEffect, useState } from "react";
import { collection, query, orderBy, onSnapshot, doc, deleteDoc, addDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { ref, deleteObject } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { Trash2, Upload, Plus, Image as ImageIcon, X, Loader2, Edit2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Modal from "@/components/Modal";

interface GalleryImage {
  id: string;
  url: string;
  storagePath?: string;
  createdAt: any;
  focalPoint?: { x: number; y: number };
}

export default function GalleryCMS() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [newUrl, setNewUrl] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editUrl, setEditUrl] = useState("");
  const [editFocalPoint, setEditFocalPoint] = useState<{ x: number, y: number }>({ x: 50, y: 50 });
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
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

    const q = query(collection(db, "gallery"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as GalleryImage[];
      setImages(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleImageError = (id: string) => {
    setImageErrors(prev => ({ ...prev, [id]: true }));
  };

  const handleAdd = async () => {
    if (!newUrl || !db) return;
    setUploading(true);
    try {
      await addDoc(collection(db, "gallery"), {
        url: newUrl,
        focalPoint: { x: 50, y: 50 },
        createdAt: serverTimestamp(),
      });
      setNewUrl("");
    } catch (error) {
      console.error("Add error:", error);
    } finally {
      setUploading(false);
    }
  };

  const handleUpdate = async (id: string) => {
    if (!editUrl || !db) return;
    try {
      await updateDoc(doc(db, "gallery", id), { 
        url: editUrl,
        focalPoint: editFocalPoint
      });
      setImageErrors(prev => ({ ...prev, [id]: false }));
      setEditingId(null);
    } catch (error) {
      console.error("Update error:", error);
    }
  };

  const setFocalPointFromClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setEditFocalPoint({ x, y });
  };

  const handleDelete = async (image: GalleryImage) => {
    setModal({
      isOpen: true,
      title: "Fotoğraf Silme",
      message: "Bu fotoğrafı portföyünüzden silmek istediğinizden emin misiniz?",
      type: "confirm",
      onConfirm: async () => {
        if (!db || !storage) return;
        try {
          await deleteDoc(doc(db, "gallery", image.id));
          if (image.storagePath) {
            const storageRef = ref(storage, image.storagePath);
            await deleteObject(storageRef);
          }
        } catch (error) {
          console.error("Delete error:", error);
        }
      }
    });
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
          <h1 className="text-3xl font-bold text-gray-900 leading-tight">Gallery Portfolio</h1>
          <p className="text-gray-500 font-medium mt-1 uppercase text-xs tracking-widest">Manage salon highlight photos via URL & Focal Point</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* URL Add Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sticky top-28">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <Plus className="mr-2 text-primary" size={20} />
              Add via URL
            </h2>
            
            <div className="space-y-4">
              <div className="relative border-2 border-dashed rounded-xl border-gray-200 p-2 min-h-[150px] flex items-center justify-center overflow-hidden group">
                {newUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={newUrl} alt="Preview" className="w-full h-[140px] object-cover rounded-lg shadow-inner" />
                ) : (
                  <div className="text-center p-4">
                    <ImageIcon size={32} className="mx-auto text-gray-200 mb-2" />
                    <p className="text-[10px] text-gray-400 font-bold uppercase">Image Preview</p>
                  </div>
                )}
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-tighter mb-1 block">Image Address (URL)</label>
                <input 
                  type="text" 
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  placeholder="Paste Unsplash or direct link..."
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-primary/20 transition-all font-mono"
                />
              </div>

              <button
                onClick={handleAdd}
                disabled={!newUrl || uploading}
                className="w-full py-4 bg-primary text-secondary rounded-xl font-black uppercase tracking-widest text-xs flex items-center justify-center space-x-2 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
              >
                {uploading ? <Loader2 className="animate-spin" size={18} /> : <Upload size={18} />}
                <span>{uploading ? "Adding..." : "Add to Gallery"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="lg:col-span-3 space-y-6">
          <div className="flex items-center space-x-2">
             <h2 className="text-lg font-bold text-gray-900 italic">Portfolio Stream</h2>
             <span className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-400 text-[10px] font-black">{images.length} Photos</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
            <AnimatePresence>
              {images.map((image) => {
                const isEditing = editingId === image.id;

                return (
                  <motion.div
                    layout
                    key={image.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className={`relative aspect-square rounded-2xl overflow-hidden group shadow-sm bg-gray-100 border transition-all duration-300 ${isEditing ? 'ring-2 ring-primary ring-offset-2' : 'border-gray-100'} ${imageErrors[image.id] ? 'bg-rose-50 border-rose-100' : ''}`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={isEditing ? editUrl : image.url} 
                      alt="" 
                      onError={() => handleImageError(image.id)}
                      style={{ 
                        objectPosition: `${(isEditing ? editFocalPoint : image.focalPoint)?.x ?? 50}% ${(isEditing ? editFocalPoint : image.focalPoint)?.y ?? 50}%` 
                      }}
                      className={`w-full h-full object-cover transition-transform duration-700 ${isEditing ? 'brightness-[0.4]' : 'group-hover:scale-110'} ${imageErrors[image.id] ? 'opacity-20' : ''}`} 
                    />

                    {imageErrors[image.id] && !isEditing && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                        <X className="text-rose-400 mb-1" size={24} strokeWidth={3} />
                        <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest leading-tight">Broken Link</p>
                        <p className="text-[8px] text-rose-400 mt-1 truncate w-full px-2" title={image.url}>{image.url.slice(0, 30)}...</p>
                      </div>
                    )}
                    
                    {!isEditing && (
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2 backdrop-blur-[2px]">
                        <button 
                          onClick={() => {
                            setEditingId(image.id);
                            setEditUrl(image.url);
                            setEditFocalPoint(image.focalPoint || { x: 50, y: 50 });
                          }}
                          className="p-2.5 bg-white text-primary rounded-xl shadow-xl hover:scale-110 transition-all hover:bg-primary hover:text-white"
                          title="Edit URL & Focus"
                        >
                          <Edit2 size={20} />
                        </button>
                        <button 
                          onClick={() => handleDelete(image)}
                          className="p-2.5 bg-red-500 text-white rounded-xl shadow-xl hover:scale-110 transition-all hover:bg-black"
                          title="Delete"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    )}

                    {isEditing && (
                      <div className="absolute inset-0 flex flex-col p-3 space-y-2">
                        <div 
                          className="flex-1 relative cursor-crosshair rounded-lg overflow-hidden border border-white/20 group/picker"
                          onClick={setFocalPointFromClick}
                        >
                           <div className="absolute inset-0 bg-white/5 opacity-0 group-hover/picker:opacity-100 transition-opacity" />
                           <div 
                            className="absolute w-6 h-6 border-2 border-primary rounded-full -ml-3 -mt-3 shadow-lg flex items-center justify-center bg-white/20 backdrop-blur-sm transition-all duration-200 pointer-events-none"
                            style={{ 
                              left: `${editFocalPoint.x}%`, 
                              top: `${editFocalPoint.y}%` 
                            }}
                           >
                             <div className="w-1 h-1 bg-primary rounded-full shadow-[0_0_8px_primary]" />
                           </div>
                           <p className="absolute bottom-2 inset-x-0 text-center text-[8px] font-black text-white/50 uppercase pointer-events-none">Click to target focus</p>
                        </div>

                        <div className="space-y-1.5">
                          <input 
                            type="text" 
                            value={editUrl}
                            onChange={(e) => setEditUrl(e.target.value)}
                            className="w-full px-2 py-1.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-[9px] text-white focus:ring-0 placeholder:text-white/50"
                            placeholder="New URL..."
                          />
                          <div className="flex gap-2">
                            <button 
                              onClick={() => handleUpdate(image.id)}
                              className="flex-1 py-1.5 bg-emerald-500 text-white rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/20"
                            >
                              Save
                            </button>
                            <button 
                              onClick={() => setEditingId(null)}
                              className="flex-1 py-1.5 bg-white/20 text-white rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-white/30 transition-colors"
                            >
                              X
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {images.length === 0 && (
              <div className="col-span-full py-20 bg-gray-50 border-2 border-dashed border-gray-100 rounded-3xl flex flex-col items-center justify-center text-center">
                 <ImageIcon size={48} className="text-gray-200 mb-4" />
                 <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Your portfolio is empty</p>
              </div>
            )}
          </div>
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
