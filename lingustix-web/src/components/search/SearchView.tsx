'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Search, FileText, Loader2 } from 'lucide-react';
import { searchApi } from '@/lib/api';
import { CardSkeleton } from '@/components/ui';
import type { CompositionIndex } from '@/types';

export function SearchView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<CompositionIndex[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    const q = searchParams.get('q');
    if (q) {
      setQuery(q);
      performSearch(q);
    }
  }, [searchParams]);

  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    setHasSearched(true);
    try {
      const response = await searchApi.searchCompositions(searchQuery);
      setResults(response.content);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/dashboard/search?q=${encodeURIComponent(query)}`);
    }
  };

  const handleResultClick = (result: CompositionIndex) => {
    router.push(`/dashboard/compositions/${result.id}`);
  };

  const highlightMatch = (text: string, searchQuery: string) => {
    if (!searchQuery.trim()) return text;
    
    const regex = new RegExp(`(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
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
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-100 mb-6">Search</h1>

      {/* Search Form */}
      <form onSubmit={handleSearch} className="mb-8">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search your compositions..."
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-900/50 border border-slate-700 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-lg"
          />
          {isLoading && (
            <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-400 animate-spin" />
          )}
        </div>
      </form>

      {/* Results */}
      {isLoading ? (
        <div className="space-y-3">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : results.length > 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-3"
        >
          <p className="text-sm text-slate-500 mb-4">
            Found {results.length} result{results.length !== 1 ? 's' : ''} for &quot;{searchParams.get('q')}&quot;
          </p>
          
          {results.map((result, index) => (
            <motion.button
              key={result.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => handleResultClick(result)}
              className="w-full p-4 rounded-lg border border-slate-800 bg-slate-900/50 hover:bg-slate-800/50 text-left transition-colors"
            >
              <div className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-slate-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-slate-200 mb-1">
                    {highlightMatch(result.title || 'Untitled', searchParams.get('q') || '')}
                  </h3>
                  <p className="text-sm text-slate-500 line-clamp-2">
                    {highlightMatch(result.content || '', searchParams.get('q') || '')}
                  </p>
                </div>
              </div>
            </motion.button>
          ))}
        </motion.div>
      ) : hasSearched ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-slate-500" />
          </div>
          <h2 className="text-lg font-medium text-slate-300 mb-2">No results found</h2>
          <p className="text-slate-500">
            Try different keywords or check your spelling
          </p>
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-slate-500" />
          </div>
          <h2 className="text-lg font-medium text-slate-300 mb-2">Search your compositions</h2>
          <p className="text-slate-500">
            Enter a keyword to find your writing
          </p>
        </div>
      )}
    </div>
  );
}
