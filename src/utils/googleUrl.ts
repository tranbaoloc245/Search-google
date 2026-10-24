import { SearchModifiers } from '../types';

export function extractVariables(query: string): string[] {
  const matches = query.match(/\{([^}]+)\}/g);
  if (!matches) return [];
  return Array.from(new Set(matches.map((m) => m.slice(1, -1).trim())));
}

export function substituteVariables(query: string, values: Record<string, string>): string {
  let result = query;
  for (const [key, val] of Object.entries(values)) {
    const regex = new RegExp(`\\{${key}\\}`, 'g');
    result = result.replace(regex, val || '');
  }
  return result;
}

export function buildGoogleSearchUrl(rawQuery: string, modifiers?: Partial<SearchModifiers>): string {
  let query = rawQuery.trim();

  if (modifiers?.exactMatch) {
    if (!query.startsWith('"') && !query.endsWith('"')) {
      query = `"${query}"`;
    }
  }

  if (modifiers?.site && modifiers.site.trim()) {
    const cleanSite = modifiers.site.trim().replace(/^https?:\/\//, '').replace(/\/$/, '');
    query = `${query} site:${cleanSite}`;
  }

  if (modifiers?.filetype && modifiers.filetype.trim()) {
    const cleanFt = modifiers.filetype.trim().replace(/^\./, '');
    query = `${query} filetype:${cleanFt}`;
  }

  const params = new URLSearchParams();
  params.set('q', query);

  // Time filter & Verbatim options
  const tbsParts: string[] = [];
  if (modifiers?.timeFilter && modifiers.timeFilter !== 'all') {
    const map: Record<string, string> = {
      day: 'qdr:d',
      week: 'qdr:w',
      month: 'qdr:m',
      year: 'qdr:y',
    };
    if (map[modifiers.timeFilter]) {
      tbsParts.push(map[modifiers.timeFilter]);
    }
  }

  if (modifiers?.verbatim) {
    tbsParts.push('li:1');
  }

  if (tbsParts.length > 0) {
    params.set('tbs', tbsParts.join(','));
  }

  // Language parameter
  if (modifiers?.language && modifiers.language !== 'all') {
    params.set('hl', modifiers.language);
  }

  return `https://www.google.com/search?${params.toString()}`;
}

export function openInGoogle(url: string): Window | null {
  return window.open(url, '_blank', 'noopener,noreferrer');
}

export async function openBatchInGoogle(
  urls: string[],
  staggerMs = 180,
  onProgress?: (opened: number, total: number) => void
): Promise<{ success: boolean; blockedCount: number }> {
  let blockedCount = 0;
  for (let i = 0; i < urls.length; i++) {
    const win = window.open(urls[i], '_blank', 'noopener,noreferrer');
    if (!win) {
      blockedCount++;
    }
    onProgress?.(i + 1, urls.length);
    if (i < urls.length - 1 && staggerMs > 0) {
      await new Promise((res) => setTimeout(res, staggerMs));
    }
  }
  return { success: blockedCount === 0, blockedCount };
}
