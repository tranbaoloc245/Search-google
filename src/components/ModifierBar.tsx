import React, { useState } from 'react';
import { SearchModifiers, TimeFilter } from '../types';
import {
  Clock,
  Quote,
  Globe,
  FileText,
  Languages,
  X,
  Check,
  SlidersHorizontal,
} from 'lucide-react';

interface ModifierBarProps {
  modifiers: SearchModifiers;
  onChangeModifiers: (modifiers: SearchModifiers) => void;
}

export const ModifierBar: React.FC<ModifierBarProps> = ({
  modifiers,
  onChangeModifiers,
}) => {
  const [showCustomSite, setShowCustomSite] = useState(false);
  const [customSiteInput, setCustomSiteInput] = useState('');

  const quickSites = [
    { label: 'Reddit', domain: 'reddit.com' },
    { label: 'GitHub', domain: 'github.com' },
    { label: 'StackOverflow', domain: 'stackoverflow.com' },
    { label: 'Gov (.vn)', domain: 'gov.vn' },
    { label: 'YouTube', domain: 'youtube.com' },
  ];

  const quickFiletypes = ['pdf', 'xlsx', 'docx'];

  const hasActiveModifiers =
    modifiers.timeFilter !== 'all' ||
    modifiers.exactMatch ||
    modifiers.verbatim ||
    Boolean(modifiers.site) ||
    Boolean(modifiers.filetype) ||
    modifiers.language !== 'all';

  const resetModifiers = () => {
    onChangeModifiers({
      timeFilter: 'all',
      exactMatch: false,
      site: undefined,
      filetype: undefined,
      language: 'all',
      verbatim: false,
    });
    setCustomSiteInput('');
    setShowCustomSite(false);
  };

  const handleCustomSiteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customSiteInput.trim()) {
      onChangeModifiers({ ...modifiers, site: customSiteInput.trim() });
      setShowCustomSite(false);
    }
  };

  return (
    <div className="bg-slate-900 border-b border-slate-800 px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-slate-400 font-medium flex items-center gap-1 shrink-0">
          <SlidersHorizontal className="w-3.5 h-3.5 text-blue-400" />
          <span>Bộ lọc Google:</span>
        </span>

        {/* Time filters */}
        <div className="flex items-center bg-slate-800/80 rounded-md p-0.5 border border-slate-700/60">
          {(
            [
              { id: 'all', label: 'Mọi lúc' },
              { id: 'day', label: '24h' },
              { id: 'week', label: '1 tuần' },
              { id: 'month', label: '1 tháng' },
              { id: 'year', label: '1 năm' },
            ] as { id: TimeFilter; label: string }[]
          ).map((t) => (
            <button
              key={t.id}
              onClick={() => onChangeModifiers({ ...modifiers, timeFilter: t.id })}
              className={`px-2 py-1 rounded text-[11px] font-medium transition-colors whitespace-nowrap ${
                modifiers.timeFilter === t.id
                  ? 'bg-blue-600 text-white font-semibold'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Exact Match toggle */}
        <button
          onClick={() => onChangeModifiers({ ...modifiers, exactMatch: !modifiers.exactMatch })}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-md border text-[11px] font-medium transition-colors whitespace-nowrap ${
            modifiers.exactMatch
              ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 font-semibold'
              : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:border-slate-600'
          }`}
          title="Bọc câu hỏi trong ngoặc kép để tìm chính xác cụm từ"
        >
          <Quote className="w-3 h-3" />
          <span>Khớp chính xác ("")</span>
          {modifiers.exactMatch && <Check className="w-3 h-3 text-amber-400" />}
        </button>

        {/* Verbatim toggle */}
        <button
          onClick={() => onChangeModifiers({ ...modifiers, verbatim: !modifiers.verbatim })}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-md border text-[11px] font-medium transition-colors whitespace-nowrap ${
            modifiers.verbatim
              ? 'bg-purple-500/15 border-purple-500/40 text-purple-300 font-semibold'
              : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:border-slate-600'
          }`}
          title="Google Verbatim mode: Tìm nguyên văn từng chữ, không tự ý sửa chính tả hay suy diễn"
        >
          <span>Nguyên văn</span>
          {modifiers.verbatim && <Check className="w-3 h-3 text-purple-400" />}
        </button>

        {/* Quick site chips */}
        <div className="flex items-center gap-1">
          {quickSites.map((s) => {
            const isSelected = modifiers.site === s.domain;
            return (
              <button
                key={s.domain}
                onClick={() =>
                  onChangeModifiers({
                    ...modifiers,
                    site: isSelected ? undefined : s.domain,
                  })
                }
                className={`px-2 py-1 rounded border text-[11px] font-medium transition-colors whitespace-nowrap ${
                  isSelected
                    ? 'bg-sky-500/15 border-sky-500/40 text-sky-300 font-semibold'
                    : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-slate-200'
                }`}
              >
                site:{s.label}
              </button>
            );
          })}

          {showCustomSite ? (
            <form onSubmit={handleCustomSiteSubmit} className="flex items-center gap-1">
              <input
                type="text"
                placeholder="domain.com"
                value={customSiteInput}
                onChange={(e) => setCustomSiteInput(e.target.value)}
                autoFocus
                className="w-28 px-2 py-0.5 text-[11px] bg-slate-800 border border-blue-500 rounded text-slate-100 focus:outline-none"
              />
              <button
                type="submit"
                className="px-1.5 py-0.5 text-[10px] bg-blue-600 text-white rounded font-medium"
              >
                Lưu
              </button>
              <button
                type="button"
                onClick={() => setShowCustomSite(false)}
                className="p-0.5 text-slate-400 hover:text-slate-200"
              >
                <X className="w-3 h-3" />
              </button>
            </form>
          ) : (
            <button
              onClick={() => setShowCustomSite(true)}
              className={`px-2 py-1 rounded border text-[11px] font-medium transition-colors whitespace-nowrap ${
                modifiers.site && !quickSites.some((s) => s.domain === modifiers.site)
                  ? 'bg-sky-500/15 border-sky-500/40 text-sky-300 font-semibold'
                  : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-slate-200'
              }`}
            >
              {modifiers.site && !quickSites.some((s) => s.domain === modifiers.site)
                ? `site:${modifiers.site}`
                : '+ Web khác'}
            </button>
          )}
        </div>

        {/* Filetype chips */}
        <div className="flex items-center gap-1">
          {quickFiletypes.map((ft) => {
            const isSelected = modifiers.filetype === ft;
            return (
              <button
                key={ft}
                onClick={() =>
                  onChangeModifiers({
                    ...modifiers,
                    filetype: isSelected ? undefined : ft,
                  })
                }
                className={`px-2 py-1 rounded border text-[11px] font-medium uppercase font-mono transition-colors whitespace-nowrap ${
                  isSelected
                    ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 font-semibold'
                    : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-slate-200'
                }`}
              >
                .{ft}
              </button>
            );
          })}
        </div>

        {/* Language selector */}
        <div className="flex items-center bg-slate-800/80 rounded-md p-0.5 border border-slate-700/60">
          {(
            [
              { id: 'all', label: 'Mọi thứ tiếng' },
              { id: 'vi', label: 'Tiếng Việt' },
              { id: 'en', label: 'English' },
            ] as const
          ).map((lang) => (
            <button
              key={lang.id}
              onClick={() => onChangeModifiers({ ...modifiers, language: lang.id })}
              className={`px-2 py-1 rounded text-[11px] font-medium transition-colors whitespace-nowrap ${
                modifiers.language === lang.id
                  ? 'bg-slate-700 text-white font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>
      </div>

      {/* Clear active modifiers */}
      {hasActiveModifiers && (
        <button
          onClick={resetModifiers}
          className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded border border-rose-500/20 transition-colors whitespace-nowrap"
        >
          <X className="w-3 h-3" />
          <span>Đặt lại bộ lọc</span>
        </button>
      )}
    </div>
  );
};
