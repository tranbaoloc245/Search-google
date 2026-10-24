import React from 'react';
import { GroundingResult } from '../types';
import {
  ExternalLink,
  Sparkles,
  X,
  Copy,
  Check,
  Globe,
  Loader2,
  AlertCircle,
} from 'lucide-react';

interface GroundingPreviewPaneProps {
  result: GroundingResult | null;
  onClose: () => void;
  onOpenGoogle: (query: string) => void;
}

export const GroundingPreviewPane: React.FC<GroundingPreviewPaneProps> = ({
  result,
  onClose,
  onOpenGoogle,
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!result) return null;

  const handleCopy = () => {
    if (result?.text) {
      navigator.clipboard.writeText(result.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getDomain = (url: string) => {
    try {
      const u = new URL(url);
      return u.hostname.replace('www.', '');
    } catch {
      return url;
    }
  };

  return (
    <aside className="w-96 border-l border-slate-800 bg-slate-900/95 flex flex-col shrink-0 h-[calc(100vh-53px)] overflow-hidden shadow-2xl">
      {/* Pane Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between gap-3 bg-slate-900">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h3 className="text-xs font-semibold text-slate-100 truncate">
              Google Grounding AI
            </h3>
            <p className="text-[11px] text-slate-400 truncate">
              Xem nhanh kết quả trực tiếp
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors"
          title="Đóng (Esc)"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Pane Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Query banner */}
        <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs">
          <div className="text-[10px] uppercase font-semibold text-slate-400 mb-1">
            Câu hỏi đang tra cứu:
          </div>
          <div className="font-mono text-slate-200 break-words font-medium">
            {result.query}
          </div>
        </div>

        {/* Loading State */}
        {result.isLoading && (
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
            <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
            <p className="text-xs text-slate-300 font-medium">
              Đang tra cứu dữ liệu thời gian thực từ Google...
            </p>
            <p className="text-[11px] text-slate-400 max-w-xs">
              Gemini đang kích hoạt công cụ Google Search để tổng hợp câu trả lời mới nhất.
            </p>
          </div>
        )}

        {/* Error State */}
        {!result.isLoading && result.error && (
          <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="space-y-2">
              <p className="font-medium">{result.error}</p>
              <button
                onClick={() => onOpenGoogle(result.query)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded font-semibold transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Mở tìm kiếm trực tiếp trên Google</span>
              </button>
            </div>
          </div>
        )}

        {/* Success State */}
        {!result.isLoading && !result.error && (
          <div className="space-y-4">
            {/* Answer Box */}
            <div className="p-3.5 rounded-lg bg-slate-800/50 border border-slate-700/60 text-xs leading-relaxed text-slate-200">
              <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-700/50">
                <span className="text-[11px] font-semibold text-slate-400">
                  Tóm tắt nội dung
                </span>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200 transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400">Đã chép</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Sao chép</span>
                    </>
                  )}
                </button>
              </div>
              <div className="whitespace-pre-wrap font-sans text-slate-200 space-y-2">
                {result.text}
              </div>
            </div>

            {/* Citations & Sources */}
            {result.citations && result.citations.length > 0 && (
              <div className="space-y-2">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Nguồn bài viết từ Google ({result.citations.length})
                </div>
                <div className="space-y-1.5">
                  {result.citations.map((cite, i) => (
                    <a
                      key={i}
                      href={cite.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-start gap-2 p-2 rounded-lg bg-slate-950 border border-slate-800/80 hover:border-slate-700 hover:bg-slate-900 transition-colors group text-xs"
                    >
                      <Globe className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-400 shrink-0 mt-0.5" />
                      <div className="min-w-0 flex-1">
                        <div className="text-slate-200 font-medium truncate group-hover:text-blue-300 transition-colors">
                          {cite.title}
                        </div>
                        <div className="text-[11px] font-mono text-slate-400 truncate">
                          {getDomain(cite.url)}
                        </div>
                      </div>
                      <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-slate-300 shrink-0" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Pane Footer Action */}
      <div className="p-3 border-t border-slate-800 bg-slate-900">
        <button
          onClick={() => onOpenGoogle(result.query)}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white rounded-lg text-xs font-semibold shadow-md shadow-blue-600/25 transition-all cursor-pointer"
        >
          <ExternalLink className="w-4 h-4" />
          <span>Mở toàn bộ kết quả trên Google Search</span>
        </button>
      </div>
    </aside>
  );
};
