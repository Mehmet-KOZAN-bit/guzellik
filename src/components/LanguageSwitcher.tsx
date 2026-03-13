"use client";

import React, { useState } from "react";
import { Globe } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";

interface LanguageSwitcherProps {
  textColor?: string;
  hoverColor?: string;
}

export default function LanguageSwitcher({ 
  textColor = "text-gray-900", 
  hoverColor = "hover:text-secondary" 
}: LanguageSwitcherProps) {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div 
      className="relative group z-50"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button
        className={`flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest transition-colors ${textColor} ${hoverColor}`}
      >
        <Globe size={16} />
        <span className="min-w-[20px]">{language.toUpperCase()}</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 top-full py-2 w-24 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden"
          >
            {(["tr", "en"] as const).map((lang) => (
              <button
                key={lang}
                onClick={() => {
                  setLanguage(lang);
                  setIsOpen(false);
                }}
                className={`w-full px-4 py-2 text-left text-[10px] font-black uppercase tracking-widest transition-colors hover:bg-gray-50 ${
                  language === lang ? "text-secondary" : "text-primary"
                }`}
              >
                {lang.toUpperCase()}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
