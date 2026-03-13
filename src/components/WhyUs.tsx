"use client";

import React from "react";
import { motion } from "framer-motion";
import { Sparkles, Award, Clock, ShieldCheck } from "lucide-react";

const features = [
  {
    icon: Sparkles,
    title: "Premium Products",
    desc: "We use only top-tier, skin-safe products from trusted international brands to ensure your safety and satisfaction.",
  },
  {
    icon: Award,
    title: "Expert Stylists",
    desc: "Our certified team brings years of professional experience across hair, skin, and nail care.",
  },
  {
    icon: Clock,
    title: "Flexible Booking",
    desc: "Book online 24/7 and choose a time that works for you. We value your schedule as much as you do.",
  },
  {
    icon: ShieldCheck,
    title: "Hygiene Guaranteed",
    desc: "Every tool and surface is sterilised before each appointment. Your wellbeing is our top priority.",
  },
];

export default function WhyUs() {
  return (
    <section className="py-28 bg-primary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="text-secondary tracking-[0.25em] font-medium uppercase text-sm block mb-3">
            Why Choose Us
          </span>
          <h2 className="text-3xl md:text-5xl font-light text-white mb-4">
            The GlowLuxe Difference
          </h2>
          <div className="w-20 h-px bg-secondary mx-auto" />
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="flex flex-col items-center text-center p-8 border border-white/10 rounded-2xl hover:border-secondary/50 hover:bg-white/5 transition-all duration-300 group"
            >
              <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center mb-5 group-hover:bg-secondary/20 transition-colors duration-300">
                <f.icon className="w-7 h-7 text-secondary" strokeWidth={1.5} />
              </div>
              <h3 className="text-lg font-semibold text-white mb-3">{f.title}</h3>
              <p className="text-white/60 text-sm leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
