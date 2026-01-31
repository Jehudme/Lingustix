'use client';

import { useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useEditorStore, calculateWordCount, calculateCharacterCount, calculateReadingTime, calculateErrorDensity } from '@/lib/stores';
import { AlertCircle, FileText, Clock, Hash } from 'lucide-react';
import type { Correction } from '@/types';

// Helper function to calculate the end offset of a correction
const getCorrectionEndOffset = (correction: Correction): number => {
  return correction.startOffset + correction.length;
};

export function StatisticsSidebar() {
  const { content, corrections, isLiveMode, focusAtPosition } = useEditorStore();

  // Handle clicking on a correction card to focus the editor at the issue position
  const handleCorrectionClick = useCallback((correction: Correction) => {
    focusAtPosition(correction.startOffset, getCorrectionEndOffset(correction));
  }, [focusAtPosition]);

  const stats = useMemo(() => {
    const wordCount = calculateWordCount(content);
    const characterCount = calculateCharacterCount(content);
    const readingTime = calculateReadingTime(wordCount);
    const errorDensity = calculateErrorDensity(corrections, wordCount);

    return { wordCount, characterCount, readingTime, errorDensity };
  }, [content, corrections]);

  return (
    <div className="w-80 h-full border-l border-slate-800 bg-slate-900/50 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-800">
        <h2 className="text-sm font-semibold text-slate-300">Statistics</h2>
      </div>

      {/* Stats Grid */}
      <div className="p-4 grid grid-cols-2 gap-3">
        <StatCard
          icon={<FileText className="w-4 h-4" />}
          label="Words"
          value={stats.wordCount.toLocaleString()}
        />
        <StatCard
          icon={<Hash className="w-4 h-4" />}
          label="Characters"
          value={stats.characterCount.toLocaleString()}
        />
        <StatCard
          icon={<Clock className="w-4 h-4" />}
          label="Read Time"
          value={`${stats.readingTime} min`}
        />
        <StatCard
          icon={<AlertCircle className="w-4 h-4" />}
          label="Error Density"
          value={`${stats.errorDensity.toFixed(1)}%`}
          highlight={stats.errorDensity > 5}
        />
      </div>

      {/* Corrections List */}
      <div className="flex-1 overflow-y-auto border-t border-slate-800">
        <div className="px-4 py-3">
          <h3 className="text-sm font-semibold text-slate-300 mb-3">
            Issues ({corrections.length})
          </h3>
          
          {corrections.length === 0 ? (
            <p className="text-sm text-slate-500">
              {content.trim() 
                ? (isLiveMode ? 'No issues found' : 'Enable live mode to analyze') 
                : 'Start writing to analyze'}
            </p>
          ) : (
            <div className="space-y-2">
              {corrections.map((correction, index) => (
                <CorrectionCard 
                  key={index} 
                  correction={correction} 
                  onClick={() => handleCorrectionClick(correction)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  highlight?: boolean;
}

function StatCard({ icon, label, value, highlight = false }: StatCardProps) {
  return (
    <div className={`p-3 rounded-lg border ${highlight ? 'border-amber-500/30 bg-amber-500/10' : 'border-slate-800 bg-slate-800/50'}`}>
      <div className={`flex items-center gap-1.5 mb-1 ${highlight ? 'text-amber-400' : 'text-slate-400'}`}>
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <p className={`text-lg font-semibold ${highlight ? 'text-amber-300' : 'text-slate-200'}`}>
        {value}
      </p>
    </div>
  );
}

interface CorrectionCardProps {
  correction: Correction;
  onClick: () => void;
}

function CorrectionCard({ correction, onClick }: CorrectionCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onClick}
      className="p-3 rounded-lg border border-amber-500/20 bg-amber-500/5 cursor-pointer hover:bg-amber-500/10 transition-colors"
    >
      <div className="flex items-start gap-2 mb-2">
        <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-sm text-slate-300">{correction.explanation}</p>
        </div>
      </div>
      
      <div className="flex items-center gap-2 text-sm">
        <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-400 line-through">
          {correction.original}
        </span>
        <span className="text-slate-500">→</span>
        <span className="px-2 py-0.5 rounded bg-green-500/20 text-green-400">
          {correction.suggested}
        </span>
      </div>
    </motion.div>
  );
}
