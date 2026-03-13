"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { motion } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import { useConfig } from "@/context/ConfigContext";
import { ArrowLeft, Clock, Scissors, CreditCard, ChevronRight } from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

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
  longDesc?: string;
  longDescTr?: string;
  longDescRu?: string;
  longDescAr?: string;
  price: number;
  duration: number;
  img: string;
  focalPoint?: { x: number; y: number };
}

export default function ServiceDetail() {
  const { id } = useParams();
  const router = useRouter();
  const { language, t } = useLanguage();
  const { branding } = useConfig();
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchService() {
      if (!id || !db) return;
      try {
        const docRef = doc(db, "services", id as string);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setService({ id: docSnap.id, ...docSnap.data() } as Service);
        }
      } catch (err) {
        console.error("Error fetching service:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchService();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold text-primary mb-4">Service Not Found</h1>
        <Link href="/services" className="text-secondary hover:underline flex items-center gap-2">
          <ArrowLeft size={20} /> Back to Services
        </Link>
      </div>
    );
  }

  const name = language === 'tr' ? service.nameTr : language === 'ru' ? service.nameRu : language === 'ar' ? service.nameAr : service.name;
  const desc = language === 'tr' ? service.descTr : language === 'ru' ? service.descRu : language === 'ar' ? service.descAr : service.desc;
  const longDesc = language === 'tr' ? service.longDescTr : language === 'ru' ? service.longDescRu : language === 'ar' ? service.longDescAr : service.longDesc;

  return (
    <main className="min-h-screen bg-white selection:bg-secondary/30">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative h-[60vh] md:h-[70vh] flex items-end overflow-hidden">
        <div className="absolute inset-0 z-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src={service.img} 
            alt={name}
            style={{ objectPosition: `${service.focalPoint?.x ?? 50}% ${service.focalPoint?.y ?? 50}%` }}
            className="w-full h-full object-cover scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
        </div>

        <div className="container mx-auto px-4 md:px-6 relative z-10 pb-12 md:pb-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl"
          >
            <div className="flex items-center gap-3 text-secondary mb-4">
              <Link href="/services" className="text-xs font-black uppercase tracking-[0.2em] hover:text-white transition-colors">
                {t.nav.services}
              </Link>
              <ChevronRight size={14} className="opacity-50" />
              <span className="text-xs font-black uppercase tracking-[0.2em] text-white/50">{t.admin.servicesPage.editInfo.split(' ')[0]}</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-light text-white tracking-tight leading-tight mb-6">
              {name}
            </h1>
            
            <div className="flex flex-wrap items-center gap-6 text-white/80">
              <div className="flex items-center gap-2">
                <Clock size={18} className="text-secondary" />
                <span className="text-sm font-bold uppercase tracking-widest">{service.duration} {language === 'tr' ? 'Dakika' : language === 'ru' ? 'минут' : language === 'ar' ? 'دقيقة' : 'Minutes'}</span>
              </div>
              <div className="flex items-center gap-2">
                <CreditCard size={18} className="text-secondary" />
                <span className="text-2xl font-black text-white italic tracking-tighter">₺{service.price}</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-20 md:py-32 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
            
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="lg:col-span-8 space-y-12"
            >
              <div className="space-y-6">
                <h2 className="text-secondary tracking-[0.3em] text-xs font-black uppercase">
                  {language === 'tr' ? 'Hizmet Deneyimi' : language === 'ru' ? 'Опыт обслуживания' : language === 'ar' ? 'تجربة الخدمة' : 'Service Experience'}
                </h2>
                <p className="text-3xl md:text-4xl font-light text-primary leading-tight italic">
                  {desc}
                </p>
              </div>

              <div className="prose prose-lg max-w-none text-gray-600 font-medium leading-relaxed space-y-8">
                {longDesc ? (
                  longDesc.split('\n\n').map((paragraph, idx) => (
                    <p key={idx} className="first-letter:text-5xl first-letter:font-serif first-letter:mr-3 first-letter:float-left first-letter:text-secondary">
                      {paragraph}
                    </p>
                  ))
                ) : (
                  <p>Check out our premium {name} treatment, designed to give you the ultimate beauty experience.</p>
                )}
              </div>

              {/* Benefits Grid or similar extra content could go here */}
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="lg:col-span-4 sticky top-32"
            >
              <div className="p-8 bg-primary rounded-3xl text-white shadow-2xl space-y-8">
                <div className="space-y-2">
                   <h3 className="text-2xl font-bold tracking-tight">{language === 'tr' ? 'Parlamaya Hazır Mısın?' : language === 'ru' ? 'Готовы сиять?' : language === 'ar' ? 'جاهز للتألق؟' : 'Ready to Shine?'}</h3>
                   <p className="text-white/60 text-sm font-medium">{language === 'tr' ? 'Bugün uzmanlarımızdan randevu alın ve GlowLuxe dokunuşunu deneyimleyin.' : language === 'ru' ? 'Запишитесь к нашим экспертам сегодня и почувствуйте прикосновение GlowLuxe.' : language === 'ar' ? 'احجز جلستك مع خبرائنا اليوم واختبر لمسة جلو لوكس.' : 'Book your session with our experts today and experience the GlowLuxe touch.'}</p>
                </div>

                <Link 
                  href={`/book?service=${service.id}`}
                  className="block w-full py-5 bg-secondary text-primary text-center font-black uppercase tracking-widest text-sm rounded-2xl hover:bg-white transition-all transform hover:scale-[1.02] shadow-xl"
                >
                  {t.hero.bookBtn}
                </Link>

                <div className="pt-6 border-t border-white/10 space-y-4">
                  <div className="flex items-center gap-4 group">
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-secondary group-hover:bg-secondary group-hover:text-primary transition-all">
                      <Scissors size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-white/40">{language === 'tr' ? 'Uzman Bakımı' : language === 'ru' ? 'Экспертный уход' : language === 'ar' ? 'رعاية الخبراء' : 'Expert Care'}</p>
                      <p className="text-sm font-bold">{language === 'tr' ? 'Profesyonel Uzmanlar' : language === 'ru' ? 'Профессиональные специалисты' : language === 'ar' ? 'متخصصون محترفون' : 'Professional Specialists'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
