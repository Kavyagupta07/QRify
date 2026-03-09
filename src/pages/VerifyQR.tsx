import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "motion/react";
import { Lock, Loader2, ChevronRight, AlertCircle } from "lucide-react";

export const VerifyQR: React.FC = () => {
  const { redirectId } = useParams();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await axios.post(`/api/qrs/verify/${redirectId}`, { password });
      if (res.data.success) {
        if (res.data.type === "url") {
          let url = res.data.content;
          if (!/^https?:\/\//i.test(url)) {
            url = 'http://' + url;
          }
          window.location.href = url;
        } else {
          navigate(`/view-qr/${redirectId}`);
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-8 rounded-3xl border border-zinc-200 shadow-xl space-y-8"
      >
        <div className="text-center space-y-3">
          <div className="bg-amber-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto border border-amber-100">
            <Lock className="w-8 h-8 text-amber-600" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900">Protected Content</h2>
          <p className="text-zinc-500">This QR code is password protected. Please enter the password to continue.</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm font-medium border border-red-100 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-zinc-700">Password</label>
            <input
              type="password"
              required
              autoFocus
              className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-zinc-900/5 focus:border-zinc-900 transition-all"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading || !password}
            className="w-full bg-zinc-900 text-white py-4 rounded-2xl font-bold text-lg hover:bg-zinc-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <>
                Unlock Content
                <ChevronRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
};
