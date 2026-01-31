'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, FileText, Loader2, Command } from 'lucide-react';
import { searchApi } from '@/lib/api';
import { useKeyboardShortcut } from '@/lib/hooks';
import type { CompositionIndex } from '@/types';

export function CommandPalette() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<CompositionIndex[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Cmd/Ctrl + K shortcut
  useKeyboardShortcut(
    { key: 'k', modifiers: { meta: true } },
    () => setIsOpen(true)
  );

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(async () => {
      setIsLoading(true);
      try {
        const response = await searchApi.searchCompositions(query);
        setResults(response.content);
        setSelectedIndex(0);
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query]);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    setQuery('');
    setResults([]);
    setSelectedIndex(0);
  }, []);

  const handleSelect = useCallback(
    (result: CompositionIndex) => {
      router.push(`/dashboard/compositions/${result.id}`);
      handleClose();
    },
    [router, handleClose]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prev) => Math.max(prev - 1, 0));
          break;
        case 'Enter':
          e.preventDefault();
          if (results[selectedIndex]) {
            handleSelect(results[selectedIndex]);
          }
          break;
        case 'Escape':
          handleClose();
          break;
      }
    },
    [results, selectedIndex, handleSelect, handleClose]
  );

  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return text;
    
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark key={i} className="bg-indigo-500/30 text-indigo-300 rounded px-0.5">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-600 transition-colors text-sm"
      >
        <Search className="w-4 h-4" />
        <span className="hidden sm:inline">Search...</span>
        <kbd className="hidden sm:flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-700 text-xs text-slate-300">
          <Command className="w-3 h-3" />
          K
        </kbd>
      </button>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleClose}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />

            {/* Palette */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="fixed left-1/2 top-[20%] -translate-x-1/2 w-full max-w-xl z-50"
            >
              <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden">
                {/* Search Input */}
                <div className="flex items-center gap-3 px-4 border-b border-slate-800">
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
                  ) : (
                    <Search className="w-5 h-5 text-slate-400" />
                  )}
                  <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Search compositions..."
                    className="flex-1 py-4 bg-transparent text-slate-100 placeholder:text-slate-500 focus:outline-none text-base"
                  />
                  <button
                    onClick={handleClose}
                    className="p-1 rounded hover:bg-slate-800 transition-colors"
                  >
                    <X className="w-5 h-5 text-slate-400" />
                  </button>
                </div>

                {/* Results */}
                <div className="max-h-80 overflow-y-auto">
                  {results.length > 0 ? (
                    <ul className="py-2">
                      {results.map((result, index) => (
                        <li key={result.id}>
                          <button
                            onClick={() => handleSelect(result)}
                            onMouseEnter={() => setSelectedIndex(index)}
                            className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-colors ${
                              index === selectedIndex
                                ? 'bg-indigo-600/20 border-l-2 border-indigo-500'
                                : 'hover:bg-slate-800/50'
                            }`}
                          >
                            <FileText className="w-5 h-5 text-slate-400 mt-0.5 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-slate-200 truncate">
                                {highlightMatch(result.title || 'Untitled', query)}
                              </p>
                              <p className="text-sm text-slate-500 line-clamp-2 mt-0.5">
                                {highlightMatch(result.content || '', query)}
                              </p>
                            </div>
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : query.trim() && !isLoading ? (
                    <div className="py-8 text-center text-slate-500">
                      No results found for &quot;{query}&quot;
                    </div>
                  ) : !query.trim() ? (
                    <div className="py-8 text-center text-slate-500">
                      Type to search your compositions
                    </div>
                  ) : null}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between px-4 py-2 border-t border-slate-800 text-xs text-slate-500">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <kbd className="px-1.5 py-0.5 rounded bg-slate-800">↑↓</kbd>
                      navigate
                    </span>
                    <span className="flex items-center gap-1">
                      <kbd className="px-1.5 py-0.5 rounded bg-slate-800">↵</kbd>
                      open
                    </span>
                    <span className="flex items-center gap-1">
                      <kbd className="px-1.5 py-0.5 rounded bg-slate-800">esc</kbd>
                      close
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
