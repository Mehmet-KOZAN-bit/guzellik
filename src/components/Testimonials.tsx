"use client";

import React from "react";
import { motion } from "framer-motion";
import { Quote } from "lucide-react";

const reviews = [
  {
    name: "Elif Yıldız",
    service: "Keratin Treatment",
    avatar: "EY",
    stars: 5,
    text: "Absolutely transformed my hair! The team at The Beauty Side made me feel like a VIP from the moment I walked in. The keratin treatment is silky, long-lasting, and exactly what I needed.",
  },
  {
    name: "Sarah M.",
    service: "Nail Art & Manicure",
    avatar: "SM",
    stars: 5,
    text: "I've been coming here for 2 years and it never disappoints. The nail artists are incredibly precise and creative. The salon itself is spotless and so beautifully designed.",
  },
  {
    name: "Dmitri V.",
    service: "Men's Haircut & Beard",
    avatar: "DV",
    stars: 5,
    text: "Finally a place that gets men's grooming right. No rushing, real attention to detail, and the beard trim was perfect. Already booked my next appointment.",
  },
];

export default function Testimonials() {
  return (
    <section className="py-28 bg-[#faf8f5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="text-secondary tracking-[0.25em] font-medium uppercase text-sm block mb-3">
            Client Stories
          </span>
          <h2 className="text-3xl md:text-5xl font-light text-primary mb-4">
            What Our Guests Say
          </h2>
          <div className="w-20 h-px bg-secondary mx-auto" />
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.map((r, i) => (
            <motion.div
              key={r.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: i * 0.12 }}
              className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-shadow duration-300 flex flex-col gap-5"
            >
              {/* Quote icon */}
              <Quote className="w-8 h-8 text-secondary/40" strokeWidth={1.5} />

              {/* Stars */}
              <div className="flex gap-1">
                {Array.from({ length: r.stars }).map((_, j) => (
                  <span key={j} className="text-secondary text-lg">★</span>
                ))}
              </div>

              {/* Review text */}
              <p className="text-primary/70 text-sm leading-relaxed flex-1 italic">
                "{r.text}"
              </p>

              {/* Reviewer */}
              <div className="flex items-center gap-3 pt-2 border-t border-primary/10">
                <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">
                  {r.avatar}
                </div>
                <div>
                  <p className="text-primary font-semibold text-sm">{r.name}</p>
                  <p className="text-primary/50 text-xs">{r.service}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
