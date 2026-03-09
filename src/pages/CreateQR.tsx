import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "motion/react";
import { 
  Link as LinkIcon, 
  Type, 
  Mail, 
  Phone, 
  Wifi, 
  UserSquare, 
  Calendar, 
  Lock, 
  Zap,
  Loader2,
  ChevronRight,
  QrCode
} from "lucide-react";
import QRCode from "qrcode";

const QR_TYPES = [
  { id: "url", label: "Website URL", icon: LinkIcon, placeholder: "https://example.com" },
  { id: "text", label: "Plain Text", icon: Type, placeholder: "Enter your message here..." },
  { id: "email", label: "Email", icon: Mail, placeholder: "email@example.com" },
  { id: "phone", label: "Phone", icon: Phone, placeholder: "+1 234 567 890" },
  { id: "wifi", label: "WiFi", icon: Wifi, placeholder: "SSID:Password:Encryption" },
  { id: "vcard", label: "Contact (vCard)", icon: UserSquare, placeholder: "Name:Phone:Email" },
];

export const CreateQR: React.FC = () => {
  const [type, setType] = useState("url");
  const [content, setContent] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [password, setPassword] = useState("");
  const [oneTimeUse, setOneTimeUse] = useState(false);
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post("/api/qrs", {
        type,
        content,
        expiryDate: expiryDate || null,
        password: password || null,
        oneTimeUse,
      });
      navigate("/dashboard");
    } catch (err) {
      alert("Failed to create QR code");
    } finally {
      setLoading(false);
    }
  };

  const handleTypeChange = (newType: string) => {
    setType(newType);
    setContent("");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Create QR Code</h1>
        <p className="text-zinc-500">Configure your dynamic QR code settings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Type Selection */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {QR_TYPES.map((t) => (
              <button
                key={t.id}
                onClick={() => handleTypeChange(t.id)}
                className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all ${
                  type === t.id
                    ? "bg-zinc-900 border-zinc-900 text-white shadow-lg shadow-zinc-900/10"
                    : "bg-white border-zinc-200 text-zinc-600 hover:border-zinc-300"
                }`}
              >
                <t.icon className={`w-6 h-6 ${type === t.id ? "text-white" : "text-zinc-400"}`} />
                <span className="text-xs font-bold uppercase tracking-wider">{t.label}</span>
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl border border-zinc-200 shadow-sm space-y-8">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-zinc-700">
                  {QR_TYPES.find((t) => t.id === type)?.label} Content
                </label>
                <textarea
                  required
                  rows={3}
                  className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-zinc-900/5 focus:border-zinc-900 transition-all resize-none"
                  placeholder={QR_TYPES.find((t) => t.id === type)?.placeholder}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-zinc-700 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-zinc-400" />
                    Expiry Date (Optional)
                  </label>
                  <input
                    type="datetime-local"
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-zinc-900/5 focus:border-zinc-900 transition-all"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-zinc-700 flex items-center gap-2">
                    <Lock className="w-4 h-4 text-zinc-400" />
                    Password Protection (Optional)
                  </label>
                  <input
                    type="password"
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-zinc-900/5 focus:border-zinc-900 transition-all"
                    placeholder="Set a password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <label className="flex items-center gap-3 p-4 bg-zinc-50 rounded-2xl border border-zinc-200 cursor-pointer hover:bg-zinc-100 transition-colors">
                <div className="relative flex items-center">
                  <input
                    type="checkbox"
                    className="peer sr-only"
                    checked={oneTimeUse}
                    onChange={(e) => setOneTimeUse(e.target.checked)}
                  />
                  <div className="h-6 w-11 rounded-full bg-zinc-200 transition-colors peer-checked:bg-zinc-900"></div>
                  <div className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition-transform peer-checked:translate-x-5"></div>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-zinc-400" />
                  <span className="text-sm font-semibold text-zinc-700">One-time use only</span>
                </div>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading || !content}
              className="w-full bg-zinc-900 text-white py-4 rounded-2xl font-bold text-lg hover:bg-zinc-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-zinc-900/10"
            >
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  Generate QR Code
                  <ChevronRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-8 rounded-3xl border border-zinc-200 shadow-sm sticky top-24 text-center space-y-6">
            <h3 className="text-lg font-bold text-zinc-900">Live Preview</h3>
            <div className="aspect-square bg-zinc-50 rounded-2xl border border-zinc-100 flex items-center justify-center p-8">
              {content ? (
                <QRPreview content={content} type={type} />
              ) : (
                <div className="text-zinc-300 flex flex-col items-center gap-2">
                  <QrCode className="w-16 h-16 opacity-20" />
                  <span className="text-sm font-medium">Enter content to preview</span>
                </div>
              )}
            </div>
            <div className="text-xs text-zinc-400 leading-relaxed">
              This is a preview of the content. The final QR will point to a dynamic redirect link.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const QRPreview: React.FC<{ content: string; type: string }> = ({ content, type }) => {
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  useEffect(() => {
    QRCode.toDataURL(content, { width: 400, margin: 2 }).then(setDataUrl);
  }, [content, type]);

  if (!dataUrl) return null;

  return <img src={dataUrl} alt="Preview" className="w-full h-full rounded-lg" referrerPolicy="no-referrer" />;
};
