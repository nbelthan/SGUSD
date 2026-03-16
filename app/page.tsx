"use client";

import { motion } from "framer-motion";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="glass-card p-12 text-center relative overflow-hidden"
      >
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <h1 className="text-5xl font-bold tracking-tight text-white mb-3">
          SageBridge
        </h1>
        <p className="text-lg text-slate-400">
          SGUSD Programmable Stablecoin Demo
        </p>
      </motion.div>
    </main>
  );
}
