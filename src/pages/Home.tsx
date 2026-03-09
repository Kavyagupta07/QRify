import React from "react";
import { Link } from "react-router-dom";
import { QrCode, Shield, Zap, BarChart3 } from "lucide-react";
import { motion } from "motion/react";

export const Home: React.FC = () => {
  return (
    <div className="flex flex-col items-center text-center py-12 space-y-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-3xl space-y-6"
      >
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-zinc-900">
          The <span className="text-zinc-500 italic">smarter</span> way to share.
        </h1>
        <p className="text-xl text-zinc-600 max-w-2xl mx-auto">
          Create dynamic QR codes with analytics, password protection, and expiry dates. 
          Manage everything from a single, minimal dashboard.
        </p>
        <div className="flex items-center justify-center gap-4 pt-4">
          <Link
            to="/signup"
            className="bg-zinc-900 text-white px-8 py-4 rounded-full text-lg font-medium hover:bg-zinc-800 transition-all hover:scale-105"
          >
            Get Started for Free
          </Link>
          <Link
            to="/login"
            className="text-zinc-600 hover:text-zinc-900 font-medium px-8 py-4"
          >
            Sign In
          </Link>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl">
        {[
          {
            icon: Zap,
            title: "Dynamic Redirects",
            description: "Change the destination URL anytime without re-printing your QR code.",
          },
          {
            icon: BarChart3,
            title: "Real-time Analytics",
            description: "Track scans, locations, and devices to understand your audience better.",
          },
          {
            icon: Shield,
            title: "Secure & Protected",
            description: "Add password protection or set expiry dates for temporary access.",
          },
        ].map((feature, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.1 }}
            className="p-8 bg-white rounded-3xl border border-zinc-100 shadow-sm text-left space-y-4"
          >
            <div className="bg-zinc-50 w-12 h-12 rounded-2xl flex items-center justify-center">
              <feature.icon className="w-6 h-6 text-zinc-900" />
            </div>
            <h3 className="text-xl font-semibold text-zinc-900">{feature.title}</h3>
            <p className="text-zinc-500 leading-relaxed">{feature.description}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
