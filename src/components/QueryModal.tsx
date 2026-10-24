import React, { useState, useEffect } from 'react';
import { QueryItem, CategoryOption } from '../types';
import { buildGoogleSearchUrl } from '../utils/googleUrl';
import { X, Search, Sparkles, Tag, Folder } from 'lucide-react';

interface QueryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: Partial<QueryItem>) => void;
  initialItem?: QueryItem | null;
  categories: CategoryOption[];
}

export const QueryModal: React.FC<QueryModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialItem,
  categories,
}) => {
  const [title, setTitle] = useState('');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('lap-trinh');
  const [tagsInput, setTagsInput] = useState('');
  const [notes, setNotes] = useState('');
  const [isPinned, setIsPinned] = useState(false);

  useEffect(() => {
    if (initialItem) {
      setTitle(initialItem.title);
      setQuery(initialItem.query);
      setCategory(initialItem.category);
      setTagsInput(initialItem.tags.join(', '));
      setNotes(initialItem.notes || '');
      setIsPinned(Boolean(initialItem.isPinned));
    } else {
      setTitle('');
      setQuery('');
      setCategory(categories.find((c) => c.id !== 'all' && c.id !== 'pinned')?.id || 'lap-trinh');
      setTagsInput('');
      setNotes('');
      setIsPinned(false);
    }
  }, [initialItem, isOpen, categories]);

  if (!isOpen) return null;

  const validCategories = categories.filter((c) => c.id !== 'all' && c.id !== 'pinned');
  const previewUrl = query.trim() ? buildGoogleSearchUrl(query) : '';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !query.trim()) return;

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim().replace(/^#/, ''))
      .filter(Boolean);

    onSave({
      id: initialItem?.id,
      title: title.trim(),
      query: query.trim(),
      category,
      tags,
      notes: notes.trim() || undefined,
      isPinned,
    });
    onClose();
  };

  const insertVariable = (varName: string) => {
    setQuery((prev) => `${prev} {${varName}}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Search className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-100">
                {initialItem ? 'Chỉnh sửa câu hỏi' : 'Thêm câu hỏi tìm kiếm mới'}
              </h3>
              <p className="text-xs text-slate-400">
                Thiết lập câu truy vấn sẵn để kích hoạt trên Google với 1 click
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4 overflow-y-auto flex-1">
          {/* Title */}
          <div className="space-y-1">
            <label className="block text-xs font-medium text-slate-300">
              Tiêu đề gợi nhớ <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="VD: Sửa lỗi StackOverflow, Báo cáo tài chính PDF..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Query */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-medium text-slate-300">
                Nội dung câu hỏi / Google Dork <span className="text-rose-400">*</span>
              </label>
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-slate-400">Gợi ý biến:</span>
                <button
                  type="button"
                  onClick={() => insertVariable('từ_khóa')}
                  className="px-1.5 py-0.5 text-[10px] bg-slate-800 hover:bg-slate-700 text-amber-300 rounded font-mono"
                >
                  +{'{từ_khóa}'}
                </button>
                <button
                  type="button"
                  onClick={() => insertVariable('năm')}
                  className="px-1.5 py-0.5 text-[10px] bg-slate-800 hover:bg-slate-700 text-amber-300 rounded font-mono"
                >
                  +{'{năm}'}
                </button>
              </div>
            </div>
            <textarea
              required
              rows={3}
              placeholder='VD: site:stackoverflow.com "{lỗi}" fix OR solution'
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 font-mono focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
            <p className="text-[11px] text-slate-400">
              Dùng ngoặc nhọn <code className="text-amber-400">{'{tên_biến}'}</code> để tạo câu hỏi động. Khi tìm kiếm, hệ thống sẽ tự động hiện ô nhập nhanh.
            </p>
          </div>

          {/* Category & Pinned */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-300">
                Danh mục
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500"
              >
                {validCategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center pt-5">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                <input
                  type="checkbox"
                  checked={isPinned}
                  onChange={(e) => setIsPinned(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-blue-600 focus:ring-blue-500"
                />
                <span>Ghim lên đầu danh sách</span>
              </label>
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-1">
            <label className="block text-xs font-medium text-slate-300">
              Thẻ từ khóa (Tags)
            </label>
            <input
              type="text"
              placeholder="VD: debug, pdf, tài_chính, bctc (phân cách bằng dấu phẩy)"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Notes */}
          <div className="space-y-1">
            <label className="block text-xs font-medium text-slate-300">
              Ghi chú thêm (Tùy chọn)
            </label>
            <input
              type="text"
              placeholder="Ghi chú về nguồn hoặc cách dùng câu hỏi này..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Live Preview */}
          {previewUrl && (
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1 text-xs">
              <div className="text-[10px] uppercase font-semibold text-slate-400">
                Google Search URL sẽ tạo:
              </div>
              <div className="font-mono text-slate-400 text-[11px] break-all truncate">
                {previewUrl}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white rounded-lg text-xs font-semibold shadow-md shadow-blue-600/30 transition-all cursor-pointer"
            >
              {initialItem ? 'Lưu thay đổi' : 'Tạo câu hỏi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
