import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { motion } from "motion/react";
import { 
  Type, 
  Mail, 
  Phone, 
  Wifi, 
  UserSquare, 
  Copy, 
  Check,
  AlertCircle,
  Clock,
  Zap
} from "lucide-react";

export const ViewQR: React.FC = () => {
  const { redirectId } = useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchContent();
  }, [redirectId]);

  const fetchContent = async () => {
    try {
      const res = await axios.get(`/api/qrs/view/${redirectId}`);
      setData(res.data);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to load content");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(data.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto mt-20 text-center space-y-6">
        <div className="bg-red-50 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto border border-red-100">
          <AlertCircle className="w-10 h-10 text-red-600" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-zinc-900">Access Denied</h2>
          <p className="text-zinc-500">{error}</p>
        </div>
      </div>
    );
  }

  const getIcon = () => {
    switch (data.type) {
      case "email": return Mail;
      case "phone": return Phone;
      case "wifi": return Wifi;
      case "vcard": return UserSquare;
      default: return Type;
    }
  };

  const Icon = getIcon();

  return (
    <div className="max-w-2xl mx-auto mt-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white p-8 rounded-3xl border border-zinc-200 shadow-xl space-y-8"
      >
        <div className="flex items-center gap-4">
          <div className="bg-zinc-900 p-4 rounded-2xl">
            <Icon className="w-8 h-8 text-white" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">{data.type} Content</span>
            <h2 className="text-2xl font-bold text-zinc-900">QR Code Details</h2>
          </div>
        </div>

        <div className="bg-zinc-50 p-6 rounded-2xl border border-zinc-100 relative group">
          <pre className="text-lg font-medium text-zinc-800 whitespace-pre-wrap break-words font-sans">
            {data.content}
          </pre>
          <button
            onClick={copyToClipboard}
            className="absolute top-4 right-4 p-2 bg-white border border-zinc-200 rounded-xl shadow-sm hover:bg-zinc-50 transition-all"
          >
            {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-zinc-400" />}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {data.expiryDate && (
            <div className="flex items-center gap-3 p-4 bg-red-50/50 rounded-2xl border border-red-100/50">
              <Clock className="w-5 h-5 text-red-600" />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-red-400">Expires On</p>
                <p className="text-sm font-bold text-red-700">{new Date(data.expiryDate).toLocaleString()}</p>
              </div>
            </div>
          )}
          {data.oneTimeUse && (
            <div className="flex items-center gap-3 p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100/50">
              <Zap className="w-5 h-5 text-indigo-600" />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">Usage Limit</p>
                <p className="text-sm font-bold text-indigo-700">One-time use only</p>
              </div>
            </div>
          )}
        </div>

        <div className="text-center pt-4">
          <p className="text-xs text-zinc-400">
            This content was shared via <span className="font-bold text-zinc-900">QRify</span>.
          </p>
        </div>
      </motion.div>
    </div>
  );
};
