"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Globe } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useConfig } from "@/context/ConfigContext";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const { t, language, setLanguage } = useLanguage();
  const { branding } = useConfig();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (pathname.startsWith("/admin")) return null;

  const navLinks = [
    { name: t.nav.home, href: "/" },
    { name: t.nav.services, href: "/services" },
    { name: t.nav.gallery, href: "/gallery" },
    { name: t.nav.about, href: "/about" },
    { name: t.nav.contact, href: "/contact" },
  ];

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-500 ${
        isScrolled
          ? "bg-white/90 backdrop-blur-md py-4 shadow-sm"
          : "bg-gradient-to-b from-black/40 to-transparent py-6"
      }`}
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo */}
          <Link href="/" className="group flex items-center gap-2">
            <div className={`flex flex-col ${isScrolled ? "text-primary" : "text-white"}`}>
              {branding?.logoUrl ? (
                <img src={branding.logoUrl} alt={branding.siteName} style={{ filter: !isScrolled ? 'brightness(0) invert(1)' : 'none' }} className="h-8 md:h-10 w-auto" />
              ) : (
                <span className="text-2xl font-black italic tracking-tighter uppercase font-serif">
                  {branding?.siteName || "GlowLuxe"}
                </span>
              )}
            </div>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <div className="flex items-center space-x-6">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-[10px] font-black uppercase tracking-widest transition-all hover:text-secondary ${
                    pathname === link.href 
                      ? "text-secondary" 
                      : (isScrolled ? "text-primary" : "text-white")
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>

            <div className="flex items-center space-x-4 pl-6 border-l border-primary/10">
              <button
                onClick={() => setLanguage(language === "tr" ? "en" : "tr")}
                className={`flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest hover:text-secondary transition-colors ${
                  isScrolled ? "text-primary" : "text-white"
                }`}
              >
                <Globe size={14} />
                <span>{language === "tr" ? "EN" : "TR"}</span>
              </button>
              
              <Link
                href="/book"
                className="px-6 py-3 bg-primary text-secondary rounded-full text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20"
              >
                {t.nav.book}
              </Link>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-4">
            <button
              onClick={() => setLanguage(language === "tr" ? "en" : "tr")}
              className="p-2 text-primary"
            >
              <Globe size={20} />
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`p-2 focus:outline-none ${isScrolled ? "text-primary" : "text-white"}`}
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white mt-4 rounded-3xl overflow-hidden shadow-xl border border-gray-100"
            >
              <div className="flex flex-col p-6 space-y-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className={`text-xs font-black uppercase tracking-widest p-4 rounded-2xl hover:bg-gray-50 ${
                      pathname === link.href ? "text-secondary bg-gray-50" : "text-primary"
                    }`}
                  >
                    {link.name}
                  </Link>
                ))}
                <Link
                  href="/book"
                  onClick={() => setIsOpen(false)}
                  className="px-6 py-4 bg-primary text-secondary rounded-2xl text-center text-xs font-black uppercase tracking-widest shadow-lg"
                >
                  {t.nav.book}
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}
