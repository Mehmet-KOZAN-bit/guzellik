"use client";

import React from "react";
import { motion } from "framer-motion";

const stats = [
  { value: "2,500+", label: "Happy Clients" },
  { value: "8+", label: "Years of Excellence" },
  { value: "15+", label: "Expert Specialists" },
  { value: "4.9 ★", label: "Average Rating" },
];

export default function Stats() {
  return (
    <section className="bg-secondary py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, scale: 0.85 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="space-y-1"
            >
              <p className="text-4xl md:text-5xl font-bold text-primary tracking-tight">
                {s.value}
              </p>
              <p className="text-primary/70 text-sm font-medium uppercase tracking-widest">
                {s.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
