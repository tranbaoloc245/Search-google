import React, { useState } from 'react';
import { QueryItem, SearchModifiers } from '../types';
import { buildGoogleSearchUrl } from '../utils/googleUrl';
import { QrCode, X, Copy, Check, ExternalLink } from 'lucide-react';

interface QrCodeModalProps {
  item: QueryItem | null;
  modifiers: SearchModifiers;
  isOpen: boolean;
  onClose: () => void;
}

export const QrCodeModal: React.FC<QrCodeModalProps> = ({
  item,
  modifiers,
  isOpen,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !item) return null;

  const url = buildGoogleSearchUrl(item.query, modifiers);
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(
    url
  )}&format=svg`;

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl overflow-hidden text-center p-5 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <QrCode className="w-4 h-4 text-blue-400" />
            <h3 className="text-xs font-semibold text-slate-100">
              Quét mã tìm kiếm trên điện thoại
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* QR Code Canvas */}
        <div className="bg-white p-4 rounded-xl inline-block shadow-inner">
          <img
            src={qrUrl}
            alt="Google Search QR"
            className="w-52 h-52 object-contain"
            loading="lazy"
          />
        </div>

        {/* Details */}
        <div className="text-xs space-y-1">
          <div className="font-semibold text-slate-200 line-clamp-1">{item.title}</div>
          <p className="text-[11px] text-slate-400">
            Dùng camera điện thoại quét để mở ngay kết quả Google
          </p>
        </div>

        {/* Action */}
        <div className="flex items-center justify-center gap-2 pt-1">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Đã chép link</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Sao chép link</span>
              </>
            )}
          </button>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Mở thử tab mới</span>
          </a>
        </div>
      </div>
    </div>
  );
};
