"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  Scissors, 
  Palette, 
  Sparkles, 
  Brush, 
  Droplets, 
  Smile, 
  Wind, 
  Layers 
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface Service {
  id: string;
  name: string;
  nameTr: string;
  desc: string;
  descTr: string;
  price: number;
  img: string;
  focalPoint?: { x: number, y: number };
  order: number;
}

const ICON_MAP: Record<string, any> = {
  haircut: Scissors,
  color: Palette,
  treatment: Sparkles,
  beard: Brush,
  skincare: Droplets,
  makeup: Smile,
  keratin: Wind,
  extensions: Layers
};

export default function ServicesPage() {
  const { t, language } = useLanguage();
  const [services, setServices] = React.useState<Service[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!db) {
      setTimeout(() => setLoading(false), 0);
      return;
    }

    const q = query(collection(db, "services"), orderBy("order", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Service[];
      setServices(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-10 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-16 pt-10 border-b border-secondary/10 pb-10">
          <h1 className="text-4xl md:text-5xl font-light text-primary tracking-wide">
            {t.services.title}
          </h1>
          <p className="mt-4 text-foreground/60 max-w-2xl mx-auto">
            {t.hero.subtitle}
          </p>
        </div>

        {/* Services Grid */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
        >
          {services.map((service) => {
            const Icon = ICON_MAP[service.id] || Scissors;
            const name = language === 'tr' ? service.nameTr : service.name;
            const desc = language === 'tr' ? service.descTr : service.desc;

            return (
              <motion.div
                key={service.id}
                variants={item}
                className="group relative bg-white border border-secondary/20 flex flex-col text-center transition-all duration-300 hover:shadow-2xl hover:border-secondary/40 rounded-xl overflow-hidden"
              >
                {/* Service Image */}
                <div className="relative h-48 w-full overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={service.img}
                    alt={language === 'tr' ? service.nameTr : service.name}
                    style={{ 
                      objectPosition: `${service.focalPoint?.x ?? 50}% ${service.focalPoint?.y ?? 50}%` 
                    }}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    onError={(e) => { e.currentTarget.parentElement!.style.display = 'none'; }}
                  />
                  {/* Price badge over image */}
                  <span className="absolute top-3 right-3 text-sm font-semibold text-secondary bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full shadow font-sans">
                    ₺{service.price}
                  </span>
                </div>

                {/* Decorative background element on hover */}
                <div className="absolute inset-0 bg-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0 pointer-events-none" />

                <div className="relative z-10 p-6 flex flex-col items-center flex-grow">
                  <div className="w-12 h-12 rounded-full bg-primary/5 flex items-center justify-center group-hover:bg-secondary/10 transition-colors duration-300 mb-4">
                    <Icon className="w-6 h-6 text-primary group-hover:text-secondary transition-colors" strokeWidth={1.5} />
                  </div>

                  <h3 className="text-lg font-medium text-primary mb-2">
                    {name}
                  </h3>
                  <p className="text-foreground/70 text-sm mb-6 flex-grow">
                    {desc}
                  </p>
                  
                  <Link
                    href={`/book?service=${service.id}`}
                    className="mt-auto w-full py-3 bg-primary text-accent hover:bg-secondary hover:text-primary uppercase tracking-widest text-xs font-semibold transition-colors duration-300"
                  >
                    {t.services.bookNow}
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

      </div>
    </div>
  );
}
