"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Instagram, MapPin, Phone, MessageCircle } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useConfig } from "@/context/ConfigContext";

export default function Footer() {
  const { t } = useLanguage();
  const { config, branding } = useConfig();
  const pathname = usePathname();

  if (pathname.startsWith("/admin")) return null;

  const phone = config?.phone || "+90 392 444 33 11";
  const address = config?.address || "Profesör Necmettin Erbakan Caddesi, No:41/C, Kızılbaş";
  const instagram = config?.instagram || "https://instagram.com/thebeautyside";
  const whatsapp = config?.whatsapp || "https://wa.me/903924443311";

  return (
    <footer className="bg-primary text-secondary pt-16 pb-8 border-t border-secondary/20 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          
          {/* Brand */}
          <div className="space-y-4 text-center md:text-left">
            <h2 className="text-2xl font-bold text-accent tracking-widest uppercase font-serif">
               {branding?.siteName || "The Beauty Side"}
            </h2>
            <p className="text-sm font-medium tracking-[0.2em] uppercase text-secondary/80">Beauty Center</p>
            <p className="mt-4 text-sm text-accent/70 max-w-xs mx-auto md:mx-0 font-serif italic">
              {t.hero.subtitle}
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4 text-center md:text-left">
            <h3 className="text-lg font-semibold text-accent uppercase tracking-wider mb-6">{t.footer.explore}</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/services" className="text-sm hover:text-white transition-colors">
                  {t.nav.services}
                </Link>
              </li>
              <li>
                <Link href="/gallery" className="text-sm hover:text-white transition-colors">
                  {t.nav.gallery}
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-sm hover:text-white transition-colors">
                  {t.nav.about}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4 text-center md:text-left">
            <h3 className="text-lg font-semibold text-accent uppercase tracking-wider mb-6 font-serif">{t.nav.contact}</h3>
            <div className="space-y-3 flex flex-col items-center md:items-start text-sm text-accent/80 font-sans">
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                <span>{address}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-secondary flex-shrink-0" />
                <a href={`tel:${phone}`} className="hover:text-white transition-colors font-sans">
                  {phone}
                </a>
              </div>
            </div>

            {/* Socials */}
            <div className="flex space-x-4 pt-4 justify-center md:justify-start">
              <a href={instagram} target="_blank" rel="noopener noreferrer" className="p-2 bg-secondary/10 rounded-full hover:bg-secondary/20 transition-colors text-secondary hover:text-accent">
                <Instagram className="w-5 h-5" />
              </a>
              <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="p-2 bg-secondary/10 rounded-full hover:bg-secondary/20 transition-colors text-secondary hover:text-accent">
                <MessageCircle className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>


        <div className="mt-16 pt-8 border-t border-secondary/10 text-center text-sm text-accent/60 flex flex-col items-center">
          <p>&copy; {new Date().getFullYear()} {branding?.siteName || "The Beauty Side"} Beauty Center. {t.footer.rights}</p>
        </div>
      </div>
    </footer>
  );
}
