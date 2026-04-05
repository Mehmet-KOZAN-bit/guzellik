"use client";

import React from "react";
import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";
import { useConfig } from "@/context/ConfigContext";
import { motion } from "framer-motion";

export default function AboutPage() {
  const { t, language } = useLanguage();
  const { config, loading } = useConfig();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const aboutText = language === 'tr' ? config?.aboutTr : language === 'ru' ? config?.aboutRu : language === 'ar' ? config?.aboutAr : config?.aboutEn;

  return (
    <div className="min-h-screen bg-white">
      {/* ... Hero ... */}
      <div className="relative h-[40vh] md:h-[50vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=2000"
            alt="About The Beauty Side"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-primary/70 mix-blend-multiply" />
        </div>
        <div className="relative z-10 text-center text-white px-4">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-light tracking-wide mb-4"
          >
            {t.nav.about}
          </motion.h1>
          <div className="w-24 h-1 bg-secondary mx-auto mt-4" />
        </div>
      </div>

      {/* Content Section */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <span className="text-secondary tracking-[0.2em] font-medium uppercase text-sm block">
              {t.about.experience}
            </span>
            <h2 className="text-3xl md:text-5xl font-light text-primary leading-tight">
              {t.about.redefiningTitle} <br />
              <span className="italic font-serif text-secondary">{t.about.redefiningSubtitle}</span>
            </h2>
            <p className="text-foreground/80 leading-relaxed text-lg pt-4">
              {aboutText || t.about.description1}
            </p>
          </motion.div>

          {/* Image Grid */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="grid grid-cols-2 gap-4"
          >
            <div className="space-y-4">
              <div className="relative h-64 md:h-80 w-full rounded-tr-[4rem] rounded-bl-[4rem] overflow-hidden shadow-xl">
                <Image
                  src="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=800"
                  alt="Stylist working"
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-700"
                />
              </div>
            </div>
            <div className="space-y-4 mt-8">
              <div className="relative h-64 md:h-80 w-full rounded-tl-[4rem] rounded-br-[4rem] overflow-hidden shadow-xl">
                <Image
                  src="https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&q=80&w=800"
                  alt="Spa treatment"
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-700"
                />
              </div>
            </div>
          </motion.div>

        </div>
      </section>
    </div>
  );
}
