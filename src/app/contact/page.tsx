"use client";

import React from "react";
import { MapPin, Phone, Instagram, MessageCircle, Mail } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useConfig } from "@/context/ConfigContext";
import { motion } from "framer-motion";

export default function ContactPage() {
  const { t } = useLanguage();
  const { config, loading } = useConfig();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Fallback values if config is not yet available
  const displayConfig = config || {
    phone: "+90 392 444 33 11",
    email: "info@thebeautyside.com",
    address: "Profesör Necmettin Erbakan Caddesi, No:41/C, Kızılbaş",
    mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d408.5!2d33.3386417!3d35.199878!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14de1111d1d4e633%3A0xb500de3788f22f93!2sGLOWLUXE%20UNİSEX!5e0!3m2!1sen!2str!4v1710200000000!5m2!1sen!2str",
    instagram: "https://instagram.com/thebeautyside",
    whatsapp: "https://wa.me/903924443311"
  };

  return (
    <div className="min-h-screen bg-accent/5 pt-10 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 text-center mb-16 border-b border-secondary/10 pb-10">
        <h1 className="text-4xl md:text-5xl font-light text-primary tracking-wide">
          {t.nav.contact}
        </h1>
        <p className="mt-4 text-foreground/60 max-w-2xl mx-auto">
          {t.contact.subtitle}
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-16">
        
        {/* Contact Info */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white p-10 shadow-xl border border-secondary/10 rounded-2xl flex flex-col justify-center space-y-10"
        >
          <div>
            <h2 className="text-2xl font-semibold text-primary mb-6">{t.contact.getInTouch}</h2>
            <div className="space-y-6">
              
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 rounded-full bg-primary/5 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <h3 className="text-sm uppercase tracking-widest text-foreground/50 font-medium mb-1">{t.contact.address}</h3>
                  <p className="text-primary font-medium">{displayConfig.address}</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 rounded-full bg-primary/5 flex items-center justify-center flex-shrink-0">
                  <Phone className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <h3 className="text-sm uppercase tracking-widest text-foreground/50 font-medium mb-1">{t.contact.phone}</h3>
                  <a href={`tel:${displayConfig.phone}`} className="text-primary font-medium hover:text-secondary transition-colors font-sans">
                    {displayConfig.phone}
                  </a>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 rounded-full bg-primary/5 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <h3 className="text-sm uppercase tracking-widest text-foreground/50 font-medium mb-1">{t.contact.email}</h3>
                  <a href={`mailto:${displayConfig.email}`} className="text-primary font-medium hover:text-secondary transition-colors">
                    {displayConfig.email}
                  </a>
                </div>
              </div>

            </div>
          </div>

          <div className="pt-6 border-t border-secondary/20">
            <h3 className="text-sm uppercase tracking-widest text-foreground/50 font-medium mb-4">{t.contact.social}</h3>
            <div className="flex flex-wrap gap-4">
              <a 
                href={displayConfig.whatsapp}
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center space-x-2 bg-[#25D366] text-white px-6 py-3 rounded-full hover:bg-[#128C7E] transition-colors shadow-md hover:shadow-lg"
              >
                <MessageCircle className="w-5 h-5" />
                <span className="font-medium text-sm">WhatsApp</span>
              </a>
              <a 
                href={displayConfig.instagram}
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center space-x-2 bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F56040] text-white px-6 py-3 rounded-full hover:opacity-90 transition-opacity shadow-md hover:shadow-lg"
              >
                <Instagram className="w-5 h-5" />
                <span className="font-medium text-sm">Instagram</span>
              </a>
            </div>
          </div>

        </motion.div>

        {/* Map Embed */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="h-[500px] lg:h-auto rounded-2xl overflow-hidden shadow-xl border border-secondary/10"
        >
          <iframe
            src={displayConfig.mapUrl}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen={false}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="The Beauty Side Beauty Center Location"
          />
        </motion.div>

      </div>
    </div>
  );
}
