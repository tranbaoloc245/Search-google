import React, { useState, useEffect, useRef } from 'react';
import { QueryItem, SearchModifiers } from '../types';
import { buildGoogleSearchUrl, substituteVariables } from '../utils/googleUrl';
import { ExternalLink, X, Sparkles, Terminal } from 'lucide-react';

interface VariablePromptModalProps {
  item: QueryItem | null;
  variables: string[];
  modifiers: SearchModifiers;
  isOpen: boolean;
  onClose: () => void;
  onConfirmLaunch: (substitutedQuery: string) => void;
}

export const VariablePromptModal: React.FC<VariablePromptModalProps> = ({
  item,
  variables,
  modifiers,
  isOpen,
  onClose,
  onConfirmLaunch,
}) => {
  const [values, setValues] = useState<Record<string, string>>({});
  const firstInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      const initial: Record<string, string> = {};
      variables.forEach((v) => {
        initial[v] = '';
      });
      setValues(initial);
      setTimeout(() => {
        firstInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen, variables]);

  if (!isOpen || !item) return null;

  const currentSubstituted = substituteVariables(item.query, values);
  const previewUrl = buildGoogleSearchUrl(currentSubstituted, modifiers);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirmLaunch(currentSubstituted);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-100">
                Điền thông số tìm kiếm
              </h3>
              <p className="text-xs text-slate-400 line-clamp-1">{item.title}</p>
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
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="space-y-3">
            {variables.map((variable, idx) => (
              <div key={variable} className="space-y-1">
                <label className="block text-xs font-medium text-slate-300">
                  Giá trị cho <code className="font-mono text-amber-400 bg-amber-500/10 px-1 py-0.5 rounded">
                    {`{${variable}}`}
                  </code>:
                </label>
                <input
                  ref={idx === 0 ? firstInputRef : null}
                  type="text"
                  placeholder={`Nhập ${variable.replace(/_/g, ' ')}...`}
                  value={values[variable] || ''}
                  onChange={(e) =>
                    setValues({ ...values, [variable]: e.target.value })
                  }
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-sans"
                />
              </div>
            ))}
          </div>

          {/* Live Preview */}
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1 text-xs">
            <div className="text-[10px] uppercase font-semibold text-slate-400">
              Câu lệnh tìm kiếm hoàn chỉnh:
            </div>
            <div className="font-mono text-blue-300 break-all">
              {currentSubstituted}
            </div>
          </div>

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
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white rounded-lg text-xs font-semibold shadow-md shadow-blue-600/30 transition-all cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Tìm kiếm ngay trên Google (Enter)</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
