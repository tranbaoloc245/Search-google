import React from 'react';
import { Search, Plus, Keyboard, Sparkles } from 'lucide-react';

interface HeaderProps {
  onNewQuery: () => void;
  onOpenShortcuts: () => void;
  onOpenBatchImport: () => void;
  queryCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  onNewQuery,
  onOpenShortcuts,
  onOpenBatchImport,
  queryCount,
}) => {
  return (
    <header className="flex items-center justify-between gap-8 px-6 py-3.5 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-40">
      {/* Zone 1: Single text element wordmark */}
      <div className="flex items-center gap-3 shrink-0">
        <a href="/" className="flex items-center gap-2.5 text-base font-bold tracking-tight text-white hover:text-blue-400 transition-colors whitespace-nowrap">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Search className="w-4 h-4 stroke-[2.5]" />
          </div>
          <span className="font-semibold text-lg text-slate-100">FastSearch</span>
        </a>
        <span className="text-xs text-slate-500 hidden sm:inline">·</span>
        <span className="text-xs font-mono tabular-nums text-slate-400 hidden sm:inline">
          {queryCount} câu hỏi sẵn sàng
        </span>
      </div>

      {/* Zone 2: Clean single-line text navigation links */}
      <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
        <button
          onClick={onOpenBatchImport}
          className="hover:text-slate-200 transition-colors whitespace-nowrap text-xs flex items-center gap-1.5"
        >
          <span>Nhập hàng loạt</span>
        </button>
        <button
          onClick={onOpenShortcuts}
          className="hover:text-slate-200 transition-colors whitespace-nowrap text-xs flex items-center gap-1.5"
        >
          <Keyboard className="w-3.5 h-3.5" />
          <span>Phím tắt</span>
          <kbd className="px-1.5 py-0.5 text-[10px] bg-slate-800 border border-slate-700 rounded text-slate-400">?</kbd>
        </button>
      </nav>

      {/* Zone 3: 1 primary action */}
      <div className="flex items-center gap-2.5 shrink-0">
        <button
          onClick={onNewQuery}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-500 active:scale-[0.98] transition-all shadow-sm shadow-blue-600/30 whitespace-nowrap cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Thêm câu hỏi</span>
          <kbd className="hidden lg:inline ml-1 px-1 py-0.2 text-[9px] bg-blue-700/60 rounded text-blue-100">N</kbd>
        </button>
      </div>
    </header>
  );
};
