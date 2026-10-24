export interface QueryItem {
  id: string;
  title: string;
  query: string;
  category: string;
  tags: string[];
  isPinned?: boolean;
  usageCount: number;
  lastUsedAt?: number;
  createdAt: number;
  notes?: string;
}

export type TimeFilter = 'all' | 'day' | 'week' | 'month' | 'year';

export interface SearchModifiers {
  timeFilter: TimeFilter;
  exactMatch: boolean;
  site?: string;
  filetype?: string;
  language: 'vi' | 'en' | 'all';
  verbatim: boolean; // tbs=li:1 (tìm chính xác nguyên văn)
}

export interface GroundingCitation {
  title: string;
  url: string;
}

export interface GroundingResult {
  query: string;
  text: string;
  citations: GroundingCitation[];
  webSearchQueries?: string[];
  isLoading: boolean;
  error?: string;
  timestamp?: number;
}

export interface CategoryOption {
  id: string;
  name: string;
  iconName?: string;
}
