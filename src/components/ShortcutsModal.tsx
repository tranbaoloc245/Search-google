import React from 'react';
import { Keyboard, X } from 'lucide-react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: '/', desc: 'Đưa con trỏ vào ô tìm kiếm nhanh câu hỏi' },
    { key: '↑ / ↓', desc: 'Di chuyển chọn câu hỏi kế tiếp / trước đó trong danh sách' },
    { key: 'Enter', desc: 'Mở trực tiếp câu hỏi đang chọn trên Google Search trong tab mới' },
    { key: 'Space', desc: 'Mở cửa sổ xem nhanh câu trả lời bằng Google Grounding AI' },
    { key: 'N', desc: 'Mở hộp thoại tạo câu hỏi mới' },
    { key: 'B', desc: 'Mở toàn bộ các câu hỏi đã chọn trong tab riêng trên Google' },
    { key: 'Esc', desc: 'Đóng hộp thoại hoặc đóng panel xem trước' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Keyboard className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-100">
                Bảng phím tắt siêu tốc
              </h3>
              <p className="text-xs text-slate-400">
                Tìm kiếm và điều hướng nhanh không cần chạm chuột
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

        <div className="p-4 divide-y divide-slate-800/80">
          {shortcuts.map((s, idx) => (
            <div key={idx} className="py-2.5 flex items-center justify-between gap-4 text-xs">
              <span className="text-slate-300">{s.desc}</span>
              <kbd className="px-2 py-1 bg-slate-800 border border-slate-700 rounded text-slate-200 font-mono font-medium shadow-sm whitespace-nowrap">
                {s.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="p-3 border-t border-slate-800 bg-slate-900/60 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
