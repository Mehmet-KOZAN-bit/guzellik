"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function BookingCTA() {
  return (
    <section className="relative py-28 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=2000"
          alt="Book your appointment"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-primary/80" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-3xl mx-auto text-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="space-y-6"
        >
          <span className="text-secondary tracking-[0.3em] uppercase text-sm font-semibold block">
            Ready for a Change?
          </span>
          <h2 className="text-4xl md:text-6xl font-light text-white leading-tight">
            Your Glow Awaits.<br />
            <span className="font-serif italic text-secondary">Book Today.</span>
          </h2>
          <p className="text-white/70 text-lg font-light max-w-xl mx-auto">
            Reserve your spot in minutes. Pay a small deposit online and enjoy a seamless, luxurious experience from start to finish.
          </p>
          <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/book"
              className="px-10 py-4 bg-secondary text-primary font-bold uppercase tracking-widest text-sm hover:bg-white transition-all duration-300 shadow-2xl"
            >
              Book an Appointment
            </Link>
            <Link
              href="/services"
              className="px-10 py-4 border border-white/40 text-white font-semibold uppercase tracking-widest text-sm hover:border-secondary hover:text-secondary transition-all duration-300 backdrop-blur-sm"
            >
              Explore Services
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
