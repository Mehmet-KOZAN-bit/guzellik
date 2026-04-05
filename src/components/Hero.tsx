"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import { useConfig } from "@/context/ConfigContext";

export default function Hero() {
  const { t } = useLanguage();
  const { branding } = useConfig();

  return (
    <section className="relative h-[90vh] w-full flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=2000"
          alt={`${branding?.siteName || "The Beauty Side"} Beauty Salon`}
          fill
          className="object-cover object-center scale-105"
          priority
        />
        {/* Dark elegant overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/80 via-primary/50 to-primary/95" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="space-y-6 max-w-3xl mx-auto"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            <span className="text-secondary tracking-[0.3em] text-sm md:text-base font-semibold uppercase mb-4 block">
              {t.hero.welcome}
            </span>
            <h1 className="text-5xl md:text-7xl font-light tracking-wide leading-tight text-accent">
               {branding?.siteName || "The Beauty Side"} <br />
              <span className="font-serif italic text-4xl md:text-6xl text-white">{t.hero.centerTitle}</span>
            </h1>
          </motion.div>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="text-lg md:text-xl text-accent/80 font-light max-w-2xl mx-auto"
          >
            {t.hero.subtitle}
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="pt-8 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link 
              href="/book" 
              className="w-full sm:w-auto px-8 py-4 bg-secondary text-primary font-semibold uppercase tracking-wider text-sm rounded-none hover:bg-white hover:text-primary transition-all duration-300 shadow-xl"
            >
              {t.hero.bookBtn}
            </Link>
            <Link 
              href="/services" 
              className="w-full sm:w-auto px-8 py-4 border border-secondary text-secondary font-semibold uppercase tracking-wider text-sm rounded-none hover:bg-secondary/10 transition-all duration-300 backdrop-blur-sm"
            >
              {t.hero.servicesBtn}
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
