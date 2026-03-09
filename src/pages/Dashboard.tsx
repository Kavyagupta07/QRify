import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "motion/react";
import { 
  Trash2, 
  Download, 
  ExternalLink, 
  Eye, 
  Calendar, 
  Lock, 
  Zap,
  BarChart3,
  Search,
  Plus
} from "lucide-react";
import QRCode from "qrcode";
import { Link } from "react-router-dom";

interface QR {
  id: number;
  type: string;
  content: string;
  redirectId: string;
  scanCount: number;
  expiryDate: string | null;
  password: string | null;
  oneTimeUse: boolean;
  createdAt: string;
}

export const Dashboard: React.FC = () => {
  const [qrs, setQrs] = useState<QR[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchQrs();
  }, []);

  const fetchQrs = async () => {
    try {
      const res = await axios.get("/api/qrs");
      setQrs(res.data);
    } catch (err) {
      console.error("Failed to fetch QRs", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this QR code?")) return;
    try {
      await axios.delete(`/api/qrs/${id}`);
      setQrs(qrs.filter((qr) => qr.id !== id));
    } catch (err) {
      alert("Failed to delete QR code");
    }
  };

  const downloadQR = async (redirectId: string) => {
    const url = `${window.location.origin}/r/${redirectId}`;
    const dataUrl = await QRCode.toDataURL(url, { width: 1000, margin: 2 });
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `qr-${redirectId}.png`;
    link.click();
  };

  const filteredQrs = qrs.filter(qr => 
    qr.content.toLowerCase().includes(search.toLowerCase()) || 
    qr.type.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">My QR Codes</h1>
          <p className="text-zinc-500">Manage and track your dynamic QR codes</p>
        </div>
        <Link
          to="/create"
          className="bg-zinc-900 text-white px-6 py-3 rounded-2xl font-medium hover:bg-zinc-800 transition-all flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Create New QR
        </Link>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
        <input
          type="text"
          placeholder="Search by content or type..."
          className="w-full pl-12 pr-4 py-3 bg-white border border-zinc-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-zinc-900/5 focus:border-zinc-900 transition-all shadow-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {filteredQrs.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-zinc-200">
          <div className="bg-zinc-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Zap className="w-8 h-8 text-zinc-300" />
          </div>
          <h3 className="text-lg font-semibold text-zinc-900">No QR codes found</h3>
          <p className="text-zinc-500 mb-6">Start by creating your first dynamic QR code.</p>
          <Link
            to="/create"
            className="text-zinc-900 font-semibold hover:underline"
          >
            Create QR Code →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredQrs.map((qr) => (
            <QRCard 
              key={qr.id} 
              qr={qr} 
              onDelete={() => handleDelete(qr.id)} 
              onDownload={() => downloadQR(qr.redirectId)} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

const QRCard: React.FC<{ qr: QR; onDelete: () => void; onDownload: () => void }> = ({ qr, onDelete, onDownload }) => {
  const [qrUrl, setQrUrl] = useState<string | null>(null);

  useEffect(() => {
    const url = `${window.location.origin}/r/${qr.redirectId}`;
    QRCode.toDataURL(url).then(setQrUrl);
  }, [qr.redirectId]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm hover:shadow-md transition-shadow space-y-4"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-zinc-50 rounded-xl border border-zinc-100">
            {qrUrl && <img src={qrUrl} alt="QR" className="w-12 h-12" referrerPolicy="no-referrer" />}
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">{qr.type}</span>
            <h3 className="font-semibold text-zinc-900 truncate max-w-[150px]">{qr.content}</h3>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onDownload}
            className="p-2 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-50 rounded-lg transition-colors"
            title="Download"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 py-4 border-y border-zinc-50">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-medium text-zinc-400">
            <BarChart3 className="w-3 h-3" />
            Total Scans
          </div>
          <p className="text-lg font-bold text-zinc-900">{qr.scanCount}</p>
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-medium text-zinc-400">
            <Calendar className="w-3 h-3" />
            Created
          </div>
          <p className="text-sm font-semibold text-zinc-900">
            {new Date(qr.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {qr.password && (
          <span className="flex items-center gap-1 px-2 py-1 bg-amber-50 text-amber-600 text-[10px] font-bold uppercase rounded-md border border-amber-100">
            <Lock className="w-3 h-3" />
            Protected
          </span>
        )}
        {qr.expiryDate && (
          <span className="flex items-center gap-1 px-2 py-1 bg-red-50 text-red-600 text-[10px] font-bold uppercase rounded-md border border-red-100">
            <Calendar className="w-3 h-3" />
            Expires {new Date(qr.expiryDate).toLocaleDateString()}
          </span>
        )}
        {qr.oneTimeUse && (
          <span className="flex items-center gap-1 px-2 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-bold uppercase rounded-md border border-indigo-100">
            <Zap className="w-3 h-3" />
            One-time
          </span>
        )}
      </div>

      <div className="flex items-center gap-2 pt-2">
        <a
          href={`${window.location.origin}/r/${qr.redirectId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-2 py-2 bg-zinc-50 text-zinc-900 text-sm font-semibold rounded-xl hover:bg-zinc-100 transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
          Test Link
        </a>
      </div>
    </motion.div>
  );
};
