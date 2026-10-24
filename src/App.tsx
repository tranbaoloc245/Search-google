import React, { useState, useEffect, useRef, useMemo } from 'react';
import { QueryItem, SearchModifiers, GroundingResult, CategoryOption } from './types';
import { INITIAL_QUERIES, DEFAULT_CATEGORIES } from './data/defaultQueries';
import {
  buildGoogleSearchUrl,
  openInGoogle,
  openBatchInGoogle,
  extractVariables,
} from './utils/googleUrl';
import { Header } from './components/Header';
import { CategorySidebar } from './components/CategorySidebar';
import { ModifierBar } from './components/ModifierBar';
import { QueryList } from './components/QueryList';
import { GroundingPreviewPane } from './components/GroundingPreviewPane';
import { QueryModal } from './components/QueryModal';
import { VariablePromptModal } from './components/VariablePromptModal';
import { BatchImportModal } from './components/BatchImportModal';
import { ShortcutsModal } from './components/ShortcutsModal';
import { QrCodeModal } from './components/QrCodeModal';

const STORAGE_KEY = 'fastsearch_queries_v2';
const LAUNCHES_KEY = 'fastsearch_total_launches_v2';

export default function App() {
  // Queries State with LocalStorage
  const [queries, setQueries] = useState<QueryItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Failed to load queries from storage', e);
    }
    return INITIAL_QUERIES;
  });

  const [totalLaunches, setTotalLaunches] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(LAUNCHES_KEY);
      if (saved) return parseInt(saved, 10) || 0;
    } catch {}
    return INITIAL_QUERIES.reduce((acc, q) => acc + q.usageCount, 0);
  });

  // Filters and Categories
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [sortBy, setSortBy] = useState<'frequent' | 'recent' | 'created' | 'alpha'>('frequent');

  // Search Modifiers
  const [modifiers, setModifiers] = useState<SearchModifiers>({
    timeFilter: 'all',
    exactMatch: false,
    site: undefined,
    filetype: undefined,
    language: 'all',
    verbatim: false,
  });

  // Multi-select & Keyboard Cursor
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  // Modals & Panels
  const [previewResult, setPreviewResult] = useState<GroundingResult | null>(null);
  const [activeQueryId, setActiveQueryId] = useState<string | undefined>(undefined);
  const [variablePromptItem, setVariablePromptItem] = useState<QueryItem | null>(null);
  const [isQueryModalOpen, setIsQueryModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<QueryItem | null>(null);
  const [isBatchImportOpen, setIsBatchImportOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [qrItem, setQrItem] = useState<QueryItem | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Sync to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(queries));
    } catch (e) {
      console.error('Failed to save queries', e);
    }
  }, [queries]);

  useEffect(() => {
    try {
      localStorage.setItem(LAUNCHES_KEY, totalLaunches.toString());
    } catch {}
  }, [totalLaunches]);

  // Filter and Sort Queries
  const filteredQueries = useMemo(() => {
    let result = [...queries];

    // Category filter
    if (activeCategory === 'pinned') {
      result = result.filter((q) => q.isPinned);
    } else if (activeCategory !== 'all') {
      result = result.filter((q) => q.category === activeCategory);
    }

    // Text search filter
    if (searchFilter.trim()) {
      const lower = searchFilter.toLowerCase();
      result = result.filter(
        (q) =>
          q.title.toLowerCase().includes(lower) ||
          q.query.toLowerCase().includes(lower) ||
          q.tags.some((t) => t.toLowerCase().includes(lower)) ||
          (q.notes && q.notes.toLowerCase().includes(lower))
      );
    }

    // Sort order
    result.sort((a, b) => {
      // Pinned items bubble up unless sorting by alpha
      if (sortBy !== 'alpha') {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
      }

      if (sortBy === 'frequent') {
        return b.usageCount - a.usageCount;
      }
      if (sortBy === 'recent') {
        return (b.lastUsedAt || 0) - (a.lastUsedAt || 0);
      }
      if (sortBy === 'created') {
        return b.createdAt - a.createdAt;
      }
      if (sortBy === 'alpha') {
        return a.title.localeCompare(b.title, 'vi');
      }
      return 0;
    });

    return result;
  }, [queries, activeCategory, searchFilter, sortBy]);

  // Clamp selectedIndex within range
  useEffect(() => {
    if (selectedIndex >= filteredQueries.length) {
      setSelectedIndex(Math.max(0, filteredQueries.length - 1));
    }
  }, [filteredQueries.length, selectedIndex]);

  // Compute category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: queries.length,
      pinned: queries.filter((q) => q.isPinned).length,
    };
    queries.forEach((q) => {
      counts[q.category] = (counts[q.category] || 0) + 1;
    });
    return counts;
  }, [queries]);

  // Launch a Query in Google
  const handleLaunchQuery = (item: QueryItem, overrideQuery?: string) => {
    const queryText = overrideQuery || item.query;
    const variables = extractVariables(queryText);

    // If query has unfilled variables and no override was provided, prompt user
    if (!overrideQuery && variables.length > 0) {
      setVariablePromptItem(item);
      return;
    }

    const url = buildGoogleSearchUrl(queryText, modifiers);
    openInGoogle(url);

    // Record stats
    setQueries((prev) =>
      prev.map((q) =>
        q.id === item.id
          ? { ...q, usageCount: q.usageCount + 1, lastUsedAt: Date.now() }
          : q
      )
    );
    setTotalLaunches((prev) => prev + 1);
  };

  // Live Grounding Preview
  const handlePreviewQuery = async (item: QueryItem, overrideQuery?: string) => {
    const queryText = overrideQuery || item.query;
    const variables = extractVariables(queryText);

    if (!overrideQuery && variables.length > 0) {
      setVariablePromptItem(item);
      return;
    }

    setActiveQueryId(item.id);
    setPreviewResult({
      query: queryText,
      text: '',
      citations: [],
      isLoading: true,
    });

    try {
      const res = await fetch('/api/search-grounding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: queryText }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${res.status}`);
      }

      const data = await res.json();
      setPreviewResult({
        query: queryText,
        text: data.text,
        citations: data.citations || [],
        webSearchQueries: data.webSearchQueries || [],
        isLoading: false,
        timestamp: Date.now(),
      });
    } catch (err: any) {
      setPreviewResult({
        query: queryText,
        text: '',
        citations: [],
        isLoading: false,
        error: err.message || 'Không thể lấy kết quả xem trước.',
      });
    }
  };

  // Batch Launch
  const handleBatchLaunch = async () => {
    if (selectedIds.length === 0) return;
    const selectedItems = queries.filter((q) => selectedIds.includes(q.id));
    const urls = selectedItems.map((item) =>
      buildGoogleSearchUrl(item.query, modifiers)
    );

    const result = await openBatchInGoogle(urls, 200);

    // Update usage counts
    setQueries((prev) =>
      prev.map((q) =>
        selectedIds.includes(q.id)
          ? { ...q, usageCount: q.usageCount + 1, lastUsedAt: Date.now() }
          : q
      )
    );
    setTotalLaunches((prev) => prev + selectedItems.length);

    if (result.blockedCount > 0) {
      alert(
        `Trình duyệt đã chặn ${result.blockedCount} tab mở tự động. Vui lòng bật "Luôn cho phép cửa sổ bật lên (Allow pop-ups)" trên trình duyệt để mở hàng loạt mượt mà!`
      );
    }
  };

  // Batch Delete
  const handleBatchDelete = () => {
    if (selectedIds.length === 0) return;
    if (window.confirm(`Bạn có chắc chắn muốn xóa ${selectedIds.length} câu hỏi đã chọn?`)) {
      setQueries((prev) => prev.filter((q) => !selectedIds.includes(q.id)));
      setSelectedIds([]);
    }
  };

  // Pin Toggle
  const handleTogglePin = (id: string) => {
    setQueries((prev) =>
      prev.map((q) => (q.id === id ? { ...q, isPinned: !q.isPinned } : q))
    );
  };

  // Copy Search URL
  const handleCopyUrl = (item: QueryItem) => {
    const url = buildGoogleSearchUrl(item.query, modifiers);
    navigator.clipboard.writeText(url);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  // Multi-select handlers
  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    setSelectedIds(filteredQueries.map((q) => q.id));
  };

  const handleDeselectAll = () => {
    setSelectedIds([]);
  };

  // CRUD
  const handleSaveQuery = (data: Partial<QueryItem>) => {
    if (data.id) {
      setQueries((prev) =>
        prev.map((q) => (q.id === data.id ? ({ ...q, ...data } as QueryItem) : q))
      );
    } else {
      const newItem: QueryItem = {
        id: `query-${Date.now()}`,
        title: data.title || 'Câu hỏi mới',
        query: data.query || '',
        category: data.category || 'lap-trinh',
        tags: data.tags || [],
        usageCount: 0,
        createdAt: Date.now(),
        notes: data.notes,
        isPinned: Boolean(data.isPinned),
      };
      setQueries((prev) => [newItem, ...prev]);
    }
  };

  const handleDeleteQuery = (id: string) => {
    setQueries((prev) => prev.filter((q) => q.id !== id));
    setSelectedIds((prev) => prev.filter((i) => i !== id));
    if (activeQueryId === id) {
      setActiveQueryId(undefined);
      setPreviewResult(null);
    }
  };

  // Export & Reset
  const handleExport = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(queries, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `fastsearch-backup-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleResetDefaults = () => {
    if (window.confirm('Khôi phục danh sách câu hỏi mẫu gốc? Dữ liệu hiện tại sẽ được thay thế.')) {
      setQueries(INITIAL_QUERIES);
      setSelectedIds([]);
    }
  };

  const handleImportQueries = (newItems: QueryItem[]) => {
    setQueries((prev) => [...newItems, ...prev]);
  };

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if user is typing in an input or textarea
      const target = e.target as HTMLElement;
      const isInput =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable;

      if (e.key === 'Escape') {
        if (variablePromptItem) setVariablePromptItem(null);
        else if (isQueryModalOpen) setIsQueryModalOpen(false);
        else if (isBatchImportOpen) setIsBatchImportOpen(false);
        else if (isShortcutsOpen) setIsShortcutsOpen(false);
        else if (qrItem) setQrItem(null);
        else if (previewResult) {
          setPreviewResult(null);
          setActiveQueryId(undefined);
        }
        return;
      }

      if (isInput) return;

      if (e.key === '/') {
        e.preventDefault();
        searchInputRef.current?.focus();
        return;
      }

      if (e.key === '?') {
        e.preventDefault();
        setIsShortcutsOpen(true);
        return;
      }

      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        setEditingItem(null);
        setIsQueryModalOpen(true);
        return;
      }

      if (e.key === 'b' || e.key === 'B') {
        if (selectedIds.length > 0) {
          e.preventDefault();
          handleBatchLaunch();
        }
        return;
      }

      if (filteredQueries.length === 0) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, filteredQueries.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const currentItem = filteredQueries[selectedIndex];
        if (currentItem) {
          handleLaunchQuery(currentItem);
        }
      } else if (e.key === ' ') {
        e.preventDefault();
        const currentItem = filteredQueries[selectedIndex];
        if (currentItem) {
          handlePreviewQuery(currentItem);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    filteredQueries,
    selectedIndex,
    selectedIds,
    variablePromptItem,
    isQueryModalOpen,
    isBatchImportOpen,
    isShortcutsOpen,
    qrItem,
    previewResult,
  ]);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 font-sans">
      {/* Strict 3-zone Header */}
      <Header
        onNewQuery={() => {
          setEditingItem(null);
          setIsQueryModalOpen(true);
        }}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
        onOpenBatchImport={() => setIsBatchImportOpen(true)}
        queryCount={queries.length}
      />

      {/* Main Workspace Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Category & Tools Sidebar */}
        <CategorySidebar
          categories={DEFAULT_CATEGORIES}
          activeCategory={activeCategory}
          onSelectCategory={(id) => {
            setActiveCategory(id);
            setSelectedIndex(0);
          }}
          categoryCounts={categoryCounts}
          sortBy={sortBy}
          onSortChange={setSortBy}
          onOpenBatchImport={() => setIsBatchImportOpen(true)}
          onExport={handleExport}
          onResetDefaults={handleResetDefaults}
          totalLaunches={totalLaunches}
        />

        {/* Central Work Area */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Google Search Modifiers Bar */}
          <ModifierBar modifiers={modifiers} onChangeModifiers={setModifiers} />

          {/* Core Queries List */}
          <QueryList
            queries={filteredQueries}
            searchFilter={searchFilter}
            onSearchFilterChange={setSearchFilter}
            selectedIds={selectedIds}
            onToggleSelect={handleToggleSelect}
            onSelectAll={handleSelectAll}
            onDeselectAll={handleDeselectAll}
            onLaunchQuery={(item) => handleLaunchQuery(item)}
            onPreviewQuery={(item) => handlePreviewQuery(item)}
            onTogglePin={handleTogglePin}
            onEditQuery={(item) => {
              setEditingItem(item);
              setIsQueryModalOpen(true);
            }}
            onDeleteQuery={handleDeleteQuery}
            onOpenQr={(item) => setQrItem(item)}
            onBatchLaunch={handleBatchLaunch}
            onBatchDelete={handleBatchDelete}
            activeQueryId={activeQueryId}
            modifiers={modifiers}
            copiedId={copiedId}
            onCopyUrl={handleCopyUrl}
            searchRef={searchInputRef}
            selectedIndex={selectedIndex}
            onSelectIndex={setSelectedIndex}
          />
        </main>

        {/* Live Grounding Preview Side Pane */}
        {previewResult && (
          <GroundingPreviewPane
            result={previewResult}
            onClose={() => {
              setPreviewResult(null);
              setActiveQueryId(undefined);
            }}
            onOpenGoogle={(q) => {
              const url = buildGoogleSearchUrl(q, modifiers);
              openInGoogle(url);
            }}
          />
        )}
      </div>

      {/* Modals */}
      <QueryModal
        isOpen={isQueryModalOpen}
        onClose={() => setIsQueryModalOpen(false)}
        onSave={handleSaveQuery}
        initialItem={editingItem}
        categories={DEFAULT_CATEGORIES}
      />

      <VariablePromptModal
        item={variablePromptItem}
        variables={variablePromptItem ? extractVariables(variablePromptItem.query) : []}
        modifiers={modifiers}
        isOpen={Boolean(variablePromptItem)}
        onClose={() => setVariablePromptItem(null)}
        onConfirmLaunch={(substituted) => {
          if (variablePromptItem) {
            handleLaunchQuery(variablePromptItem, substituted);
            setVariablePromptItem(null);
          }
        }}
      />

      <BatchImportModal
        isOpen={isBatchImportOpen}
        onClose={() => setIsBatchImportOpen(false)}
        onImport={handleImportQueries}
        categories={DEFAULT_CATEGORIES}
      />

      <ShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />

      <QrCodeModal
        item={qrItem}
        modifiers={modifiers}
        isOpen={Boolean(qrItem)}
        onClose={() => setQrItem(null)}
      />
    </div>
  );
}
