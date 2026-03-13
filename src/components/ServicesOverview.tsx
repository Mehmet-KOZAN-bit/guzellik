"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface Service {
  id: string;
  name: string;
  nameTr: string;
  nameRu: string;
  nameAr: string;
  desc: string;
  descTr: string;
  descRu: string;
  descAr: string;
  price: number;
  duration: number;
  img: string;
}

export default function ServicesOverview() {
  const { t, language } = useLanguage();
  const [services, setServices] = useState<Service[]>([]);
  const [current, setCurrent] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!db) {
      setLoading(false);
      return;
    }

    const q = query(collection(db, "services"), orderBy("order", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Service[];
      setServices(data.slice(0, 5)); // Limit to first 5 for overview
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const goTo = useCallback((idx: number) => {
    if (isAnimating || services.length === 0) return;
    setIsAnimating(true);
    setCurrent((idx + services.length) % services.length);
    setTimeout(() => setIsAnimating(false), 600);
  }, [isAnimating, services.length]);

  // Auto-slide every 5s
  useEffect(() => {
    if (services.length === 0) return;
    const timer = setInterval(() => goTo(current + 1), 5000);
    return () => clearInterval(timer);
  }, [current, goTo, services.length]);

  if (loading) {
    return (
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
           <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto"></div>
        </div>
      </section>
    );
  }

  if (services.length === 0) return null;

  const slide = services[current];
  const name = language === 'tr' ? slide.nameTr : language === 'ru' ? slide.nameRu : language === 'ar' ? slide.nameAr : slide.name;
  const desc = language === 'tr' ? slide.descTr : language === 'ru' ? slide.descRu : language === 'ar' ? slide.descAr : slide.desc;

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="text-secondary tracking-[0.2em] font-medium uppercase text-sm mb-2 block">
            {t.services.luxuriousCare}
          </span>
          <h2 className="text-3xl md:text-5xl font-light text-primary">
            {t.services.title}
          </h2>
          <div className="w-24 h-1 bg-secondary mx-auto mt-6" />
        </div>

        {/* Carousel */}
        <div className="relative rounded-3xl overflow-hidden shadow-2xl" style={{ height: "420px" }}>
          {/* Image */}
          <div
            key={current}
            className="absolute inset-0 transition-opacity duration-700"
            style={{ opacity: isAnimating ? 0 : 1 }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={slide.img}
              alt={name}
              className="w-full h-full object-cover"
            />
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
          </div>

          {/* Caption */}
          <div
            className="absolute bottom-0 left-0 right-0 p-10 text-white transition-all duration-500"
            style={{ opacity: isAnimating ? 0 : 1, transform: isAnimating ? 'translateY(12px)' : 'translateY(0)' }}
          >
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="flex-grow">
                <div className="flex flex-wrap items-center gap-3 text-secondary text-sm font-semibold uppercase tracking-widest mb-3">
                  <span>₺{slide.price}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock size={14} strokeWidth={2.5} />
                    {slide.duration || 30} DK
                  </span>
                  <span>•</span>
                  <span>{t.services.bookNow}</span>
                </div>
                <h3 className="text-3xl md:text-4xl font-light mb-3">{name}</h3>
                <p className="text-white/70 text-base max-w-xl line-clamp-2">{desc}</p>
              </div>
              <Link
                href={`/services/${slide.id}`}
                className="shrink-0 px-10 py-4 bg-secondary text-primary font-bold uppercase tracking-widest text-xs rounded-full hover:bg-white transition-all duration-300 shadow-xl shadow-secondary/20 hover:scale-105 active:scale-95 text-center"
              >
                {language === 'tr' ? 'İncele' : 'Details'}
              </Link>
            </div>
          </div>

          {/* Prev / Next buttons */}
          <button
            onClick={() => goTo(current - 1)}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md text-white flex items-center justify-center hover:bg-white/30 transition-all border border-white/10"
            aria-label="Previous"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={() => goTo(current + 1)}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md text-white flex items-center justify-center hover:bg-white/30 transition-all border border-white/10"
            aria-label="Next"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Dots */}
          <div className="absolute top-6 left-1/2 -translate-x-1/2 flex gap-3">
            {services.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${i === current ? 'bg-secondary w-8' : 'bg-white/30 w-4'}`}
              />
            ))}
          </div>
        </div>

        {/* View All link */}
        <div className="mt-14 text-center">
          <Link
            href="/services"
            className="inline-block border-2 border-primary text-primary px-12 py-4 tracking-[0.2em] uppercase text-xs font-bold hover:bg-primary hover:text-white transition-all duration-300 rounded-lg hover:shadow-xl hover:shadow-primary/10"
          >
            {t.hero.servicesBtn}
          </Link>
        </div>
      </div>
    </section>
  );
}
