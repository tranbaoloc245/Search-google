import React from 'react';
import { QueryItem, SearchModifiers } from '../types';
import {
  ExternalLink,
  Sparkles,
  Star,
  Copy,
  Edit2,
  Trash2,
  Check,
  QrCode,
  Search,
  CheckSquare,
  Square,
  Zap,
} from 'lucide-react';
import { extractVariables } from '../utils/googleUrl';

interface QueryListProps {
  queries: QueryItem[];
  searchFilter: string;
  onSearchFilterChange: (val: string) => void;
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onLaunchQuery: (item: QueryItem) => void;
  onPreviewQuery: (item: QueryItem) => void;
  onTogglePin: (id: string) => void;
  onEditQuery: (item: QueryItem) => void;
  onDeleteQuery: (id: string) => void;
  onOpenQr: (item: QueryItem) => void;
  onBatchLaunch: () => void;
  onBatchDelete: () => void;
  activeQueryId?: string;
  modifiers: SearchModifiers;
  copiedId: string | null;
  onCopyUrl: (item: QueryItem) => void;
  searchRef: React.RefObject<HTMLInputElement | null>;
  selectedIndex: number;
  onSelectIndex: (index: number) => void;
}

export const QueryList: React.FC<QueryListProps> = ({
  queries,
  searchFilter,
  onSearchFilterChange,
  selectedIds,
  onToggleSelect,
  onSelectAll,
  onDeselectAll,
  onLaunchQuery,
  onPreviewQuery,
  onTogglePin,
  onEditQuery,
  onDeleteQuery,
  onOpenQr,
  onBatchLaunch,
  onBatchDelete,
  activeQueryId,
  modifiers,
  copiedId,
  onCopyUrl,
  searchRef,
  selectedIndex,
  onSelectIndex,
}) => {
  const isAllSelected = queries.length > 0 && selectedIds.length === queries.length;

  const renderQueryString = (queryText: string) => {
    const parts = queryText.split(/(\{+[^}]+\}+)/g);
    return (
      <span className="font-mono text-xs text-slate-300 break-all">
        {parts.map((part, idx) => {
          if (part.startsWith('{') && part.endsWith('}')) {
            return (
              <span
                key={idx}
                className="text-amber-300 bg-amber-500/20 px-1 py-0.5 rounded font-mono font-medium mx-0.5 border border-amber-500/30"
              >
                {part}
              </span>
            );
          }
          return <span key={idx}>{part}</span>;
        })}
      </span>
    );
  };

  const formatLastUsed = (timestamp?: number) => {
    if (!timestamp) return 'Chưa dùng';
    const diff = Date.now() - timestamp;
    const mins = Math.floor(diff / (1000 * 60));
    if (mins < 1) return 'Vừa xong';
    if (mins < 60) return `${mins} phút trước`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} giờ trước`;
    const days = Math.floor(hours / 24);
    return `${days} ngày trước`;
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-slate-950">
      {/* Search and Batch Bar */}
      <div className="p-4 border-b border-slate-800 bg-slate-900/40 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-xl">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            ref={searchRef}
            type="text"
            placeholder="Tìm nhanh câu hỏi (hoặc gõ / để tìm)..."
            value={searchFilter}
            onChange={(e) => onSearchFilterChange(e.target.value)}
            className="w-full pl-9 pr-14 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
          />
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {searchFilter ? (
              <button
                onClick={() => onSearchFilterChange('')}
                className="text-[11px] text-slate-400 hover:text-slate-200"
              >
                Xóa
              </button>
            ) : (
              <kbd className="hidden sm:inline px-1.5 py-0.5 text-[10px] bg-slate-800 border border-slate-700 rounded text-slate-400 font-mono">
                /
              </kbd>
            )}
          </div>
        </div>

        {/* Batch actions or select all */}
        <div className="flex items-center gap-2">
          {selectedIds.length > 0 ? (
            <div className="flex items-center gap-2 bg-blue-950/60 border border-blue-800/80 px-3 py-1.5 rounded-lg text-xs">
              <span className="text-blue-300 font-medium">
                Đã chọn <strong className="font-mono tabular-nums">{selectedIds.length}</strong> câu
              </span>
              <button
                onClick={onBatchLaunch}
                className="flex items-center gap-1.5 px-3 py-1 bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white rounded font-medium shadow-sm transition-all whitespace-nowrap cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Mở {selectedIds.length} tab Google</span>
              </button>
              <button
                onClick={onBatchDelete}
                className="px-2 py-1 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded transition-colors"
                title="Xóa các mục đã chọn"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={onDeselectAll}
                className="text-slate-400 hover:text-slate-200 text-xs px-1"
              >
                Bỏ chọn
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={onSelectAll}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 rounded-lg border border-slate-700/60 transition-colors"
              >
                <CheckSquare className="w-3.5 h-3.5 text-slate-400" />
                <span>Chọn tất cả</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Query List Items */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-800/80">
        {queries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
            <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 mb-3">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-slate-200 mb-1">
              {searchFilter ? 'Không tìm thấy câu hỏi phù hợp' : 'Chưa có câu hỏi nào trong mục này'}
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mb-4">
              {searchFilter
                ? 'Thử thay đổi từ khóa tìm kiếm hoặc đặt lại bộ lọc.'
                : 'Bạn có thể bấm "Thêm câu hỏi" để tạo mới hoặc "Nhập nhanh" để dán danh sách có sẵn.'}
            </p>
          </div>
        ) : (
          queries.map((item, index) => {
            const isSelected = selectedIds.includes(item.id);
            const isKeyboardActive = selectedIndex === index;
            const variables = extractVariables(item.query);
            const hasVariables = variables.length > 0;
            const isPreviewActive = activeQueryId === item.id;

            return (
              <div
                key={item.id}
                onClick={() => onSelectIndex(index)}
                className={`group relative p-4 transition-colors flex items-start gap-3.5 ${
                  isKeyboardActive
                    ? 'bg-blue-950/30 ring-1 ring-inset ring-blue-500/40'
                    : isPreviewActive
                    ? 'bg-slate-900/90 border-l-2 border-l-blue-500'
                    : 'hover:bg-slate-900/50'
                }`}
              >
                {/* Multi-select Checkbox */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleSelect(item.id);
                  }}
                  className="mt-1 text-slate-500 hover:text-slate-200 transition-colors shrink-0"
                >
                  {isSelected ? (
                    <CheckSquare className="w-4 h-4 text-blue-400" />
                  ) : (
                    <Square className="w-4 h-4 text-slate-600 group-hover:text-slate-400" />
                  )}
                </button>

                {/* Star / Pin Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onTogglePin(item.id);
                  }}
                  className="mt-1 text-slate-600 hover:text-amber-400 transition-colors shrink-0"
                  title={item.isPinned ? 'Bỏ ghim' : 'Ghim lên đầu'}
                >
                  <Star
                    className={`w-4 h-4 ${
                      item.isPinned ? 'text-amber-400 fill-amber-400' : 'hover:text-amber-400'
                    }`}
                  />
                </button>

                {/* Main Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2 mb-1.5">
                    <h4 className="text-sm font-semibold text-slate-100 truncate group-hover:text-blue-300 transition-colors">
                      {item.title}
                    </h4>

                    {/* Unboxed metadata per Zero-Pill Discipline */}
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 shrink-0 font-mono">
                      <span>Đã tìm: <strong className="tabular-nums text-slate-400 font-medium">{item.usageCount}</strong></span>
                      <span aria-hidden="true">·</span>
                      <span>{formatLastUsed(item.lastUsedAt)}</span>
                    </div>
                  </div>

                  {/* Query representation */}
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800/80 mb-2 font-mono text-xs text-slate-300">
                    {renderQueryString(item.query)}
                  </div>

                  {/* Tags and Notes */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      {item.notes && (
                        <>
                          <span className="text-slate-400 line-clamp-1">{item.notes}</span>
                          <span aria-hidden="true">·</span>
                        </>
                      )}
                      {item.tags.length > 0 && (
                        <span>
                          {item.tags.map((t) => `#${t}`).join(' ')}
                        </span>
                      )}
                      {hasVariables && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="text-amber-400 font-medium">
                            Có {variables.length} biến cần điền
                          </span>
                        </>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
                      {/* Primary Quick Launch Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onLaunchQuery(item);
                        }}
                        className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white rounded-md text-xs font-semibold shadow-sm shadow-blue-600/30 transition-all whitespace-nowrap cursor-pointer"
                        title="Mở trực tiếp trên Google Search (Enter)"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Mở Google</span>
                      </button>

                      {/* AI Search Grounding Preview Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onPreviewQuery(item);
                        }}
                        className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md text-xs font-medium transition-colors whitespace-nowrap"
                        title="Xem nhanh câu trả lời bằng Google Grounding (Space)"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                        <span className="hidden sm:inline">Xem nhanh</span>
                      </button>

                      {/* Copy search URL */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onCopyUrl(item);
                        }}
                        className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-md transition-colors"
                        title="Sao chép liên kết Google Search"
                      >
                        {copiedId === item.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>

                      {/* QR Code for Mobile */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenQr(item);
                        }}
                        className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-md transition-colors"
                        title="Quét QR mở trên điện thoại"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                      </button>

                      {/* Edit */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditQuery(item);
                        }}
                        className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-md transition-colors"
                        title="Chỉnh sửa câu hỏi"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteQuery(item.id);
                        }}
                        className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-md transition-colors"
                        title="Xóa câu hỏi"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
