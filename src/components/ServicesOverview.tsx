"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

const SLIDES = [
  {
    id: "haircut",
    img: "https://images.unsplash.com/photo-1560869713-7d0a29430803?auto=format&fit=crop&q=80&w=1200",
    price: "₺500",
  },
  {
    id: "color",
    img: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=1200",
    price: "₺1500",
  },
  {
    id: "skincare",
    img: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&q=80&w=1200",
    price: "₺1200",
  },
  {
    id: "beard",
    img: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=1200",
    price: "₺300",
  },
  {
    id: "keratin",
    img: "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=80&w=1200",
    price: "₺2500",
  },
];

export default function ServicesOverview() {
  const { t } = useLanguage();
  const [current, setCurrent] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const goTo = useCallback((idx: number) => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrent((idx + SLIDES.length) % SLIDES.length);
    setTimeout(() => setIsAnimating(false), 600);
  }, [isAnimating]);

  // Auto-slide every 4s
  useEffect(() => {
    const timer = setInterval(() => goTo(current + 1), 4000);
    return () => clearInterval(timer);
  }, [current, goTo]);

  const slide = SLIDES[current];
  const data = (t.services.list as Record<string, { name: string; desc: string }>)[slide.id];

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
        <div className="relative rounded-3xl overflow-hidden shadow-2xl" style={{ height: "380px" }}>
          {/* Image */}
          <div
            key={current}
            className="absolute inset-0 transition-opacity duration-700"
            style={{ opacity: isAnimating ? 0 : 1 }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={slide.img}
              alt={data?.name || ""}
              className="w-full h-full object-cover"
            />
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
          </div>

          {/* Caption */}
          <div
            className="absolute bottom-0 left-0 right-0 p-10 text-white transition-all duration-500"
            style={{ opacity: isAnimating ? 0 : 1, transform: isAnimating ? 'translateY(12px)' : 'translateY(0)' }}
          >
            <div className="flex items-end justify-between">
              <div>
                <span className="text-secondary text-sm font-semibold uppercase tracking-widest mb-2 block">
                  {slide.price} · {t.services.bookNow}
                </span>
                <h3 className="text-3xl md:text-4xl font-light mb-2">{data?.name}</h3>
                <p className="text-white/70 text-base max-w-lg">{data?.desc}</p>
              </div>
              <Link
                href={`/book?service=${slide.id}`}
                className="shrink-0 ml-8 px-8 py-3 bg-secondary text-primary font-semibold uppercase tracking-widest text-xs rounded-full hover:bg-white transition-colors duration-300"
              >
                {t.services.bookNow}
              </Link>
            </div>
          </div>

          {/* Prev / Next buttons */}
          <button
            onClick={() => goTo(current - 1)}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/20 backdrop-blur-sm text-white flex items-center justify-center hover:bg-white/40 transition"
            aria-label="Previous"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => goTo(current + 1)}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/20 backdrop-blur-sm text-white flex items-center justify-center hover:bg-white/40 transition"
            aria-label="Next"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Dots */}
          <div className="absolute top-5 left-1/2 -translate-x-1/2 flex gap-2">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${i === current ? 'bg-secondary w-6' : 'bg-white/50'}`}
              />
            ))}
          </div>
        </div>

        {/* View All link */}
        <div className="mt-12 text-center">
          <Link
            href="/services"
            className="inline-block border border-primary text-primary px-8 py-3 tracking-widest uppercase text-sm font-medium hover:bg-primary hover:text-white transition-colors duration-300"
          >
            {t.hero.servicesBtn}
          </Link>
        </div>
      </div>
    </section>
  );
}
