"use client";

import React, { useEffect, useState } from "react";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  Scissors,
  Image as ImageIcon,
  Settings,
  Users,
  CalendarCheck,
  TrendingUp,
  Clock,
  ArrowUpRight,
  DollarSign,
  ChevronRight
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useConfig } from "@/context/ConfigContext";
import { useLanguage } from "@/context/LanguageContext";

interface Appointment {
  id: string;
  name: string;
  service: string;
  status: string;
  paymentStatus?: string;
  depositAmount?: number;
  date: string;
  time: string;
  createdAt: any;
}

export default function Dashboard() {
  const { branding } = useConfig();
  const { t } = useLanguage();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    earnings: 0,
    recent: [] as Appointment[]
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!db) {
      setTimeout(() => setLoading(false), 0);
      return;
    }

    const q = query(collection(db, "appointments"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Appointment[];
      
      const earnings = data.reduce((acc, curr) => acc + (curr.depositAmount || 0), 0);
      const pending = data.filter(a => a.status === "pending").length;
      const confirmed = data.filter(a => a.status === "approved" || a.status === "confirmed").length;

      setStats({
        total: data.length,
        pending,
        confirmed,
        earnings,
        recent: data.slice(0, 5)
      });
      setAppointments(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const statCards = [
    { name: t.admin.dashboard.totalBookings, value: stats.total, icon: CalendarCheck, color: 'text-blue-600', bg: 'bg-blue-50', change: '+12%', up: true },
    { name: t.admin.dashboard.pendingApproval, value: stats.pending, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', change: t.admin.dashboard.changeActionNeeded, up: false },
    { name: t.admin.dashboard.confirmedSales, value: stats.confirmed, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50', change: '+5%', up: true },
    { name: t.admin.dashboard.totalRevenue, value: `₺${stats.earnings}`, icon: DollarSign, color: 'text-primary', bg: 'bg-accent/10', change: t.admin.dashboard.changeDeposits, up: true },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 leading-tight">{t.admin.dashboard.title}</h1>
          <p className="text-gray-500 font-medium mt-1 uppercase text-xs tracking-widest leading-relaxed">
            {t.admin.dashboard.subtitle} {branding?.siteName || "The Beauty Side"}
          </p>
        </div>
        <div className="hidden sm:flex items-center space-x-2 bg-white border border-gray-200 p-1 rounded-xl shadow-sm">
           <button className="px-4 py-2 text-xs font-bold uppercase text-gray-400 hover:text-gray-600">{t.admin.dashboard.day}</button>
           <button className="px-4 py-2 text-xs font-bold uppercase bg-primary text-secondary rounded-lg shadow-md">{t.admin.dashboard.week}</button>
           <button className="px-4 py-2 text-xs font-bold uppercase text-gray-400 hover:text-gray-600">{t.admin.dashboard.month}</button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, idx) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group cursor-default"
          >
            <div className="flex items-start justify-between">
              <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} transition-colors group-hover:scale-110 duration-300`}>
                <stat.icon size={24} />
              </div>
              <div className={`flex items-center space-x-1 text-xs font-bold ${stat.up ? 'text-emerald-500' : 'text-amber-500'}`}>
                <span>{stat.change}</span>
                {stat.up ? <ArrowUpRight size={14} /> : null}
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest leading-none">{stat.name}</h3>
              <p className="text-3xl font-black text-gray-900 mt-2">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Appointments */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              {t.admin.dashboard.recentTitle}
              <span className="ml-3 px-2 py-0.5 rounded-full bg-primary/5 text-primary text-[10px] uppercase font-black tracking-tighter border border-primary/10">{t.admin.dashboard.latest5}</span>
            </h2>
            <Link href="/admin/appointments" className="text-primary text-sm font-bold hover:underline flex items-center">
              {t.admin.dashboard.viewAll} <ChevronRight size={16} />
            </Link>
          </div>
          
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="divide-y divide-gray-50">
              {stats.recent.map((appt) => (
                <div key={appt.id} className="p-5 flex items-center justify-between hover:bg-gray-50/50 transition-colors group">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-primary font-bold border border-gray-100 group-hover:bg-primary group-hover:text-secondary group-hover:border-primary transition-all duration-300">
                      {appt.name[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 leading-tight">{appt.name}</p>
                      <p className="text-xs text-gray-400 font-medium uppercase tracking-tighter mt-0.5">{appt.service.replace("-", " ")}</p>
                    </div>
                  </div>
                  <div className="text-right flex items-center space-x-6">
                    <div className="hidden sm:block">
                      <p className="text-sm font-bold text-gray-900 leading-tight">{appt.date}</p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter mt-1 flex items-center justify-end">
                        <Clock size={10} className="mr-1 text-accent" /> {appt.time}
                      </p>
                    </div>
                    <div className="w-24 text-center">
                       {appt.status === 'pending' ? (
                         <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-amber-100 text-amber-700 uppercase">{t.admin.dashboard.statusPending}</span>
                       ) : (
                         <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-700 uppercase">{t.admin.dashboard.statusSuccess}</span>
                       )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions / Today's Summary */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900 px-2">{t.admin.dashboard.quickActions}</h2>
          <div className="grid grid-cols-1 gap-4">
            <Link 
              href="/admin/services"
              className="group p-6 rounded-2xl bg-gradient-to-br from-primary to-primary/90 text-secondary shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform relative overflow-hidden"
            >
              <div className="relative z-10 flex flex-col items-center text-center">
                <Scissors className="mb-3 text-accent group-hover:rotate-12 transition-transform" size={32} />
                <h3 className="font-black uppercase tracking-widest text-sm">{t.admin.dashboard.manageServices}</h3>
                <p className="text-[10px] opacity-70 mt-1 uppercase font-bold tracking-tighter">{t.admin.dashboard.updatePricesPhotos}</p>
              </div>
              <div className="absolute top-0 right-0 p-2 opacity-20"><ArrowUpRight size={48} /></div>
            </Link>

            <Link 
              href="/admin/gallery"
              className="group p-6 rounded-2xl bg-white border border-gray-100 shadow-sm hover:border-accent hover:shadow-md transition-all relative overflow-hidden"
            >
              <div className="relative z-10 flex flex-col items-center text-center">
                <ImageIcon className="mb-3 text-primary group-hover:scale-110 transition-transform" size={32} />
                <h3 className="font-black uppercase tracking-widest text-sm text-gray-900">{t.admin.dashboard.manageGallery}</h3>
                <p className="text-[10px] text-gray-400 mt-1 uppercase font-bold tracking-tighter">{t.admin.dashboard.uploadNewPhotos}</p>
              </div>
            </Link>

            <Link 
              href="/admin/settings"
              className="group p-6 rounded-2xl bg-white border border-gray-100 shadow-sm hover:border-accent transition-all"
            >
              <div className="relative z-10 flex flex-col items-center text-center text-gray-400 group-hover:text-primary transition-colors">
                <Settings size={32} className="group-hover:rotate-45 transition-transform duration-500" />
                <h3 className="font-black uppercase tracking-widest text-sm mt-3">{t.admin.dashboard.settings}</h3>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
