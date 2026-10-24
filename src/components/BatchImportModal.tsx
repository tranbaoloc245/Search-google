import React, { useState } from 'react';
import { QueryItem, CategoryOption } from '../types';
import { Upload, X, Sparkles, Check, FileText } from 'lucide-react';

interface BatchImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (newQueries: QueryItem[]) => void;
  categories: CategoryOption[];
}

export const BatchImportModal: React.FC<BatchImportModalProps> = ({
  isOpen,
  onClose,
  onImport,
  categories,
}) => {
  const [textInput, setTextInput] = useState('');
  const [targetCategory, setTargetCategory] = useState('lap-trinh');

  if (!isOpen) return null;

  const validCategories = categories.filter((c) => c.id !== 'all' && c.id !== 'pinned');

  // Preset packs
  const presetPacks = [
    {
      title: 'Dev & DevOps Troubleshooting',
      cat: 'lap-trinh',
      queries: [
        'docker inspect container --format={{.State.Health.Status}}',
        'kubectl get pods --all-namespaces --field-selector status.phase!=Running',
        'site:github.com "cannot read properties of undefined (reading" react',
        'site:stackoverflow.com "fatal: refusing to merge unrelated histories"',
        'nginx reverse proxy websockets configuration example',
      ],
    },
    {
      title: 'SEO & Content Research',
      cat: 'seo-marketing',
      queries: [
        'site:linkedin.com/in/ "marketing director" vietnam',
        'filetype:pdf "nghiên cứu thị trường" thương mại điện tử việt nam 2026',
        'intitle:"index of" "ebook" digital marketing',
        'site:medium.com best practices ui ux design system 2026',
      ],
    },
    {
      title: 'Học tập & Giáo trình PDF',
      cat: 'nghien-cuu',
      queries: [
        'filetype:pdf "giáo trình" "cấu trúc dữ liệu và giải thuật" đại học',
        'filetype:pdf "xác suất thống kê" bài tập có lời giải',
        'site:mit.edu OR site:stanford.edu "machine learning" lecture notes pdf',
      ],
    },
  ];

  const handleApplyPreset = (pack: typeof presetPacks[0]) => {
    setTextInput(pack.queries.join('\n'));
    setTargetCategory(pack.cat);
  };

  const handleImport = () => {
    const lines = textInput
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0 && !l.startsWith('#'));

    if (lines.length === 0) return;

    const newItems: QueryItem[] = lines.map((line, idx) => {
      // If line contains format: Title | Query
      let title = line;
      let query = line;
      if (line.includes('|')) {
        const parts = line.split('|');
        title = parts[0].trim();
        query = parts.slice(1).join('|').trim();
      } else if (line.length > 50) {
        title = line.slice(0, 47) + '...';
      }

      return {
        id: `import-${Date.now()}-${idx}`,
        title,
        query,
        category: targetCategory,
        tags: ['import'],
        usageCount: 0,
        createdAt: Date.now(),
      };
    });

    onImport(newItems);
    setTextInput('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-100">
                Nhập danh sách câu hỏi hàng loạt
              </h3>
              <p className="text-xs text-slate-400">
                Dán danh sách câu hỏi (mỗi dòng một câu) hoặc nạp gói mẫu
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

        {/* Content */}
        <div className="p-4 space-y-4 overflow-y-auto flex-1">
          {/* Preset quick buttons */}
          <div className="space-y-1.5">
            <span className="text-xs font-medium text-slate-300">
              Gói câu hỏi mẫu có sẵn:
            </span>
            <div className="flex flex-wrap gap-2">
              {presetPacks.map((pack) => (
                <button
                  key={pack.title}
                  type="button"
                  onClick={() => handleApplyPreset(pack)}
                  className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 hover:text-blue-300 border border-slate-700 rounded-lg text-slate-300 transition-colors"
                >
                  + {pack.title}
                </button>
              ))}
            </div>
          </div>

          {/* Text Area */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-medium text-slate-300">
                Nội dung câu hỏi (Mỗi dòng một câu)
              </label>
              <span className="text-[11px] font-mono text-slate-400">
                {textInput.split('\n').filter((l) => l.trim()).length} dòng
              </span>
            </div>
            <textarea
              rows={8}
              placeholder={`VD:\nsite:github.com awesome react\nfiletype:pdf giáo trình kinh tế vi mô\nTiêu đề tùy chọn | query tìm kiếm`}
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 font-mono focus:outline-none focus:border-blue-500"
            />
            <p className="text-[11px] text-slate-400">
              Mẹo: Bạn có thể nhập định dạng <code className="text-blue-400">Tiêu đề | Câu truy vấn</code> nếu muốn đặt tên riêng cho câu hỏi.
            </p>
          </div>

          {/* Category Selector */}
          <div className="space-y-1">
            <label className="block text-xs font-medium text-slate-300">
              Thêm vào danh mục:
            </label>
            <select
              value={targetCategory}
              onChange={(e) => setTargetCategory(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500"
            >
              {validCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-end gap-2 bg-slate-900">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
          >
            Hủy
          </button>
          <button
            type="button"
            disabled={!textInput.trim()}
            onClick={handleImport}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 active:scale-[0.98] text-white rounded-lg text-xs font-semibold shadow-md shadow-blue-600/30 transition-all cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Xác nhận nhập danh sách</span>
          </button>
        </div>
      </div>
    </div>
  );
};
