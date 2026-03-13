"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { onAuthStateChanged, User, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import Link from "next/link";
import { 
  LayoutDashboard, 
  CalendarCheck, 
  Scissors, 
  Image as ImageIcon, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  LogOut,
  ExternalLink,
  Users
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useLanguage } from "@/context/LanguageContext";

const navItems = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Appointments', href: '/admin/appointments', icon: CalendarCheck },
  { name: 'Customers', href: '/admin/customers', icon: Users },
  { name: 'Services', href: '/admin/services', icon: Scissors },
  { name: 'Gallery', href: '/admin/gallery', icon: ImageIcon },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useLanguage();

  useEffect(() => {
    if (!auth) {
      setTimeout(() => setLoading(false), 0);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);

      if (!currentUser && pathname !== "/admin/login") {
        router.push("/admin/login");
      } else if (currentUser && pathname === "/admin/login") {
        router.push("/admin");
      }
    });

    return () => unsubscribe();
  }, [pathname, router]);

  const handleLogout = async () => {
    if (auth) {
      await signOut(auth);
      router.push("/admin/login");
    }
  };

  const isSuperAdmin = pathname.startsWith("/admin/super");

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If on login page, just render the content without sidebar
  if (pathname === "/admin/login") {
    return <div className="min-h-screen bg-gray-50">{children}</div>;
  }

  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-900">
      {/* Sidebar */}
      {!isSuperAdmin && (
        <motion.aside
          initial={false}
          animate={{ width: isCollapsed ? 80 : 280 }}
          className="fixed left-0 top-0 bottom-0 z-50 bg-primary border-r border-white/10 flex flex-col transition-all duration-300 shadow-2xl overflow-hidden"
        >
          {/* Sidebar Header */}
          <div className="h-20 flex items-center justify-between px-6 border-b border-white/5 bg-black/10">
            <AnimatePresence mode="wait">
              {!isCollapsed && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="flex items-baseline space-x-1"
                >
                  <span className="text-xl font-bold text-accent tracking-tighter uppercase">Glow</span>
                  <span className="text-xs font-medium text-secondary tracking-widest uppercase">Admin</span>
                </motion.div>
              )}
            </AnimatePresence>
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-secondary transition-colors"
            >
              {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </button>
          </div>

          {/* Sidebar Nav */}
          <nav className="flex-1 px-4 py-8 space-y-1.5 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
              const Icon = item.icon;
              const itemNameMap: Record<string, string> = {
                'Dashboard': t.admin.sidebar.dashboard,
                'Appointments': t.admin.sidebar.appointments,
                'Customers': t.admin.sidebar.customers,
                'Services': t.admin.sidebar.services,
                'Gallery': t.admin.sidebar.gallery,
                'Settings': t.admin.sidebar.settings,
              };
              const translatedName = itemNameMap[item.name] || item.name;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-3 px-3 py-3 rounded-xl transition-all duration-200 group relative ${
                    isActive 
                      ? 'bg-secondary text-primary font-semibold' 
                      : 'text-secondary/70 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Icon size={20} className={`shrink-0 ${isActive ? 'text-primary' : 'group-hover:text-white transition-colors'}`} />
                  <AnimatePresence mode="wait">
                    {!isCollapsed && (
                      <motion.span
                        initial={{ opacity: 0, x: -5 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -5 }}
                        className="text-sm whitespace-nowrap"
                      >
                        {translatedName}
                      </motion.span>
                    )}
                  </AnimatePresence>
                  {isActive && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute inset-0 bg-secondary rounded-xl -z-10 shadow-lg"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-white/5 space-y-1">
            <Link
              href="/"
              className={`flex items-center space-x-3 px-3 py-3 rounded-xl text-secondary/50 hover:bg-white/5 hover:text-white transition-all`}
            >
              <ExternalLink size={20} className="shrink-0" />
              {!isCollapsed && <span className="text-sm font-medium">{t.admin.sidebar.viewWebsite}</span>}
            </Link>
            <button
              onClick={handleLogout}
              className={`w-full flex items-center space-x-3 px-3 py-3 rounded-xl text-red-400/70 hover:bg-red-500/10 hover:text-red-400 transition-all`}
            >
              <LogOut size={20} className="shrink-0" />
              {!isCollapsed && <span className="text-sm font-medium">{t.admin.sidebar.logout}</span>}
            </button>
          </div>
        </motion.aside>
      )}

      {/* Main Content Area */}
      <main className={`flex-1 flex flex-col transition-all duration-300 ${isSuperAdmin ? 'pl-0' : isCollapsed ? 'pl-[80px]' : 'pl-[280px]'}`}>
        {!isSuperAdmin && (
          <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-8 sticky top-0 z-40 backdrop-blur-sm bg-white/90">
            <div className="flex items-center space-x-4">
              <h2 className="text-gray-900 font-semibold text-lg">
                {navItems.find(n => n.href === pathname || (n.href !== '/admin' && pathname.startsWith(n.href)))?.name || 'Dashboard'}
              </h2>
             </div>
            <div className="flex items-center space-x-6">
               <LanguageSwitcher />
               <div className="flex items-center space-x-4 border-l border-gray-200 pl-6">
                 <div className="flex flex-col items-end mr-2 text-right hidden sm:flex">
                   <span className="text-sm font-bold text-gray-900">{user.email?.split('@')[0]}</span>
                   <span className="text-[10px] text-gray-400 uppercase font-semibold tracking-tighter">{t.admin.header.administrator}</span>
                 </div>
                 <div className="w-10 h-10 rounded-full bg-accent/20 border-2 border-accent flex items-center justify-center text-primary font-bold shadow-sm">
                   {user.email?.[0].toUpperCase()}
                 </div>
               </div>
            </div>
          </header>
        )}

        <section className={`p-8 w-full ${isSuperAdmin ? 'max-w-none' : 'max-w-[1600px]'} mx-auto`}>
           {children}
        </section>
      </main>
    </div>
  );
}
