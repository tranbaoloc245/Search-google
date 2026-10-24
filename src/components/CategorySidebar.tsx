import React from 'react';
import { CategoryOption } from '../types';
import {
  Folder,
  Star,
  Code2,
  BookOpen,
  TrendingUp,
  Coins,
  Smile,
  Upload,
  Download,
  RotateCcw,
  Sparkles,
  Zap,
} from 'lucide-react';

interface CategorySidebarProps {
  categories: CategoryOption[];
  activeCategory: string;
  onSelectCategory: (id: string) => void;
  categoryCounts: Record<string, number>;
  sortBy: 'frequent' | 'recent' | 'created' | 'alpha';
  onSortChange: (sort: 'frequent' | 'recent' | 'created' | 'alpha') => void;
  onOpenBatchImport: () => void;
  onExport: () => void;
  onResetDefaults: () => void;
  totalLaunches: number;
}

export const CategorySidebar: React.FC<CategorySidebarProps> = ({
  categories,
  activeCategory,
  onSelectCategory,
  categoryCounts,
  sortBy,
  onSortChange,
  onOpenBatchImport,
  onExport,
  onResetDefaults,
  totalLaunches,
}) => {
  const getCategoryIcon = (id: string) => {
    switch (id) {
      case 'pinned':
        return <Star className="w-4 h-4 text-amber-400" />;
      case 'lap-trinh':
        return <Code2 className="w-4 h-4 text-sky-400" />;
      case 'nghien-cuu':
        return <BookOpen className="w-4 h-4 text-emerald-400" />;
      case 'seo-marketing':
        return <TrendingUp className="w-4 h-4 text-purple-400" />;
      case 'tai-chinh':
        return <Coins className="w-4 h-4 text-yellow-400" />;
      case 'doi-song':
        return <Smile className="w-4 h-4 text-rose-400" />;
      default:
        return <Folder className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <aside className="w-64 border-r border-slate-800 bg-slate-900/50 flex flex-col justify-between shrink-0 h-[calc(100vh-53px)] select-none">
      <div className="p-4 space-y-5 overflow-y-auto">
        {/* Metric summary */}
        <div className="px-3 py-2.5 rounded-lg bg-slate-800/60 border border-slate-700/60">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="flex items-center gap-1.5 font-medium">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              Tổng lượt tìm kiếm
            </span>
          </div>
          <div className="text-xl font-bold font-mono tabular-nums text-slate-100">
            {totalLaunches.toLocaleString('vi-VN')}
          </div>
        </div>

        {/* Categories Section */}
        <div>
          <div className="px-2 mb-2 text-[11px] font-semibold text-slate-400 tracking-wider uppercase">
            Danh mục câu hỏi
          </div>
          <div className="space-y-0.5">
            {categories.map((cat) => {
              const isActive = activeCategory === cat.id;
              const count = categoryCounts[cat.id] || 0;
              return (
                <button
                  key={cat.id}
                  onClick={() => onSelectCategory(cat.id)}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-colors text-left ${
                    isActive
                      ? 'bg-blue-600/15 text-blue-300 font-semibold border border-blue-500/30'
                      : 'text-slate-300 hover:bg-slate-800/60 hover:text-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    {getCategoryIcon(cat.id)}
                    <span className="truncate">{cat.name}</span>
                  </div>
                  <span className="font-mono text-[11px] tabular-nums text-slate-400 ml-2">
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Sort Section */}
        <div>
          <div className="px-2 mb-2 text-[11px] font-semibold text-slate-400 tracking-wider uppercase">
            Sắp xếp theo
          </div>
          <div className="grid grid-cols-2 gap-1 p-1 bg-slate-800/70 rounded-lg border border-slate-700/50">
            <button
              onClick={() => onSortChange('frequent')}
              className={`px-2 py-1.5 text-[11px] font-medium rounded transition-colors whitespace-nowrap ${
                sortBy === 'frequent'
                  ? 'bg-slate-700 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Hay dùng nhất
            </button>
            <button
              onClick={() => onSortChange('recent')}
              className={`px-2 py-1.5 text-[11px] font-medium rounded transition-colors whitespace-nowrap ${
                sortBy === 'recent'
                  ? 'bg-slate-700 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Gần đây
            </button>
            <button
              onClick={() => onSortChange('created')}
              className={`px-2 py-1.5 text-[11px] font-medium rounded transition-colors whitespace-nowrap ${
                sortBy === 'created'
                  ? 'bg-slate-700 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Mới thêm
            </button>
            <button
              onClick={() => onSortChange('alpha')}
              className={`px-2 py-1.5 text-[11px] font-medium rounded transition-colors whitespace-nowrap ${
                sortBy === 'alpha'
                  ? 'bg-slate-700 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              A → Z
            </button>
          </div>
        </div>
      </div>

      {/* Bottom utilities */}
      <div className="p-3 border-t border-slate-800 space-y-1">
        <button
          onClick={onOpenBatchImport}
          className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-slate-300 hover:bg-slate-800/80 hover:text-slate-100 rounded-md transition-colors"
        >
          <Upload className="w-3.5 h-3.5 text-slate-400" />
          <span>Nhập nhanh danh sách</span>
        </button>
        <button
          onClick={onExport}
          className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-slate-300 hover:bg-slate-800/80 hover:text-slate-100 rounded-md transition-colors"
        >
          <Download className="w-3.5 h-3.5 text-slate-400" />
          <span>Sao lưu dữ liệu (JSON)</span>
        </button>
        <button
          onClick={onResetDefaults}
          className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-slate-400 hover:bg-slate-800/60 hover:text-slate-200 rounded-md transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
          <span>Khôi phục mẫu mặc định</span>
        </button>
      </div>
    </aside>
  );
};
