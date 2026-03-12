"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface GalleryImage {
  id: string;
  url: string;
  createdAt: number;
  focalPoint?: { x: number; y: number };
}

const PLACEHOLDERS = [
  "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1487412912498-0447577c7be6?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1519415943484-9fa1873496d4?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1516975080661-422fc9967e53?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1634449571010-02389ed0f9b0?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1576426863848-c21f53c60b19?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1614786269829-d24616faf56d?auto=format&fit=crop&q=80&w=800",
];

export default function GalleryPage() {
  const { t } = useLanguage();
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!db) {
      setLoading(false);
      return;
    }

    const q = query(collection(db, "gallery"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as GalleryImage[];
      setImages(fetched);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching gallery:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const hasImages = images.length > 0;
  const displayImages = hasImages 
    ? images 
    : PLACEHOLDERS.map(url => ({ url, focalPoint: { x: 50, y: 50 } }));

  return (
    <div className="min-h-screen bg-white pt-10 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 text-center mb-16 border-b border-secondary/10 pb-10">
        <h1 className="text-4xl md:text-5xl font-light text-primary tracking-wide">
          {t.nav.gallery}
        </h1>
        <p className="mt-4 text-foreground/60 max-w-2xl mx-auto">
          {t.gallery.subtitle}
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary"></div>
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6"
          >
            {displayImages.map((src, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className="break-inside-avoid relative rounded-xl overflow-hidden group shadow-md"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src.url}
                  alt=""
                  loading="lazy"
                  onError={(e) => {
                    const el = e.currentTarget;
                    el.style.display = 'none';
                    const card = el.parentElement;
                    if (card) card.style.display = 'none';
                  }}
                  style={{ 
                    objectPosition: `${src.focalPoint?.x ?? 50}% ${src.focalPoint?.y ?? 50}%` 
                  }}
                  className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
                />
                

              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
