"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface SiteConfig {
  siteName: string;
  phone: string;
  email: string;
  address: string;
  mapUrl: string;
  instagram: string;
  whatsapp: string;
  aboutEn: string;
  aboutTr: string;
}

interface BrandingConfig {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  logoUrl: string;
  siteName: string;
}

interface ConfigContextType {
  config: SiteConfig | null;
  branding: BrandingConfig | null;
  loading: boolean;
}

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

export function ConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const [branding, setBranding] = useState<BrandingConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!db) {
      setLoading(false);
      return;
    }

    // Site Config
    const unsubConfig = onSnapshot(doc(db, "settings", "config"), (snapshot) => {
      if (snapshot.exists()) {
        setConfig(snapshot.data() as SiteConfig);
      }
    });

    // Master Branding Config
    const unsubBranding = onSnapshot(doc(db, "settings", "branding"), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as BrandingConfig;
        setBranding(data);
        
        // Inject CSS Variables
        if (data.primaryColor) document.documentElement.style.setProperty('--primary', data.primaryColor);
        if (data.secondaryColor) document.documentElement.style.setProperty('--secondary', data.secondaryColor);
        if (data.accentColor) document.documentElement.style.setProperty('--accent', data.accentColor);

        // Update Document Title
        if (data.siteName) {
          document.title = `${data.siteName} | Beauty Center`;
        }
      }
      setLoading(false);
    });

    return () => {
      unsubConfig();
      unsubBranding();
    };
  }, []);

  return (
    <ConfigContext.Provider value={{ config, branding, loading }}>
      {children}
    </ConfigContext.Provider>
  );
}

export function useConfig() {
  const context = useContext(ConfigContext);
  if (context === undefined) {
    throw new Error("useConfig must be used within a ConfigProvider");
  }
  return context;
}
