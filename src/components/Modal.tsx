"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2, AlertTriangle, Info, HelpCircle } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: "success" | "warning" | "error" | "info" | "confirm";
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  message,
  type = "info",
  onConfirm,
  confirmText = "Tamam",
  cancelText = "İptal",
}: ModalProps) {
  const isConfirm = type === "confirm";

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle2 className="text-emerald-500" size={40} />;
      case "warning":
      case "confirm":
        return <HelpCircle className="text-amber-500" size={40} />;
      case "error":
        return <AlertTriangle className="text-rose-500" size={40} />;
      default:
        return <Info className="text-blue-500" size={40} />;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden"
          >
            <div className="p-8 text-center">
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-gray-50 rounded-2xl">
                  {getIcon()}
                </div>
              </div>
              
              <h3 className="text-xl font-black text-gray-900 mb-2 uppercase tracking-tight">
                {title}
              </h3>
              
              <p className="text-gray-500 font-medium text-sm leading-relaxed mb-8">
                {message}
              </p>

              <div className="flex gap-3">
                {isConfirm && (
                  <button
                    onClick={onClose}
                    className="flex-1 py-4 bg-gray-100 text-gray-400 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-gray-200 transition-all active:scale-95"
                  >
                    {cancelText}
                  </button>
                )}
                <button
                  onClick={() => {
                    if (isConfirm && onConfirm) {
                      onConfirm();
                    }
                    onClose();
                  }}
                  className={`flex-1 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg transition-all active:scale-95 ${
                    type === 'error' ? 'bg-rose-500 text-white shadow-rose-500/20' : 
                    type === 'warning' || type === 'confirm' ? 'bg-amber-500 text-white shadow-amber-500/20' :
                    'bg-primary text-secondary shadow-primary/20'
                  }`}
                >
                  {confirmText}
                </button>
              </div>
            </div>

            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-gray-300 hover:text-gray-900 transition-colors"
            >
              <X size={20} />
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
