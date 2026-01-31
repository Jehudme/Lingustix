'use client';

import { useRef, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useEditorStore, useSettingsStore, calculateWordCount, calculateCharacterCount, calculateReadingTime, calculateErrorDensity } from '@/lib/stores';
import { useDebounce } from '@/lib/hooks';
import { useToast } from '@/components/ui';
import type { Correction } from '@/types';

interface ZenEditorProps {
  compositionId: string;
}

interface HighlightRange {
  start: number;
  end: number;
  type: 'grammar' | 'style' | 'spelling';
  correction: Correction;
}

export function ZenEditor({ compositionId }: ZenEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const { showToast } = useToast();
  const { autoSaveInterval } = useSettingsStore();
  
  const {
    content,
    corrections,
    isSaving,
    hasUnsavedChanges,
    lastSaved,
    setContent,
    saveContent,
    loadComposition,
  } = useEditorStore();

  // Load composition on mount
  useEffect(() => {
    loadComposition(compositionId).catch(() => {
      showToast('error', 'Failed to load composition');
    });
  }, [compositionId, loadComposition, showToast]);

  // Debounced save function
  const debouncedSave = useDebounce(() => {
    if (hasUnsavedChanges) {
      saveContent().catch(() => {
        showToast('error', 'Failed to save');
      });
    }
  }, autoSaveInterval);

  // Auto-save when content changes
  useEffect(() => {
    if (hasUnsavedChanges) {
      debouncedSave();
    }
  }, [content, hasUnsavedChanges, debouncedSave]);

  // Calculate statistics
  const stats = useMemo(() => {
    const wordCount = calculateWordCount(content);
    const characterCount = calculateCharacterCount(content);
    const readingTime = calculateReadingTime(wordCount);
    const errorDensity = calculateErrorDensity(corrections, wordCount);

    return { wordCount, characterCount, readingTime, errorDensity };
  }, [content, corrections]);

  // Convert corrections to highlight ranges
  const highlightRanges: HighlightRange[] = useMemo(() => {
    return corrections.map((correction) => ({
      start: correction.startOffset,
      end: correction.startOffset + correction.length,
      type: 'grammar' as const, // Default to grammar; could be extended
      correction,
    }));
  }, [corrections]);

  // Handle content change
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setContent(e.target.value);
    },
    [setContent]
  );

  // Sync scroll between textarea and overlay
  const handleScroll = useCallback(() => {
    if (textareaRef.current && overlayRef.current) {
      overlayRef.current.scrollTop = textareaRef.current.scrollTop;
      overlayRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  }, []);

  // Render text with highlights
  const renderHighlightedContent = useCallback(() => {
    if (highlightRanges.length === 0) {
      return <span className="invisible whitespace-pre-wrap">{content || ' '}</span>;
    }

    const elements: React.ReactNode[] = [];
    let lastIndex = 0;

    // Sort ranges by start position
    const sortedRanges = [...highlightRanges].sort((a, b) => a.start - b.start);

    sortedRanges.forEach((range, index) => {
      // Add text before the highlight
      if (range.start > lastIndex) {
        elements.push(
          <span key={`text-${index}`} className="invisible">
            {content.slice(lastIndex, range.start)}
          </span>
        );
      }

      // Add highlighted text
      const highlightClass =
        range.type === 'grammar'
          ? 'bg-amber-500/20 border-b-2 border-amber-500/50'
          : range.type === 'style'
          ? 'bg-blue-500/20 border-b-2 border-blue-500/50'
          : 'bg-red-500/20 border-b-2 border-red-500/50';

      elements.push(
        <span
          key={`highlight-${index}`}
          className={`relative rounded-sm ${highlightClass}`}
          title={range.correction.explanation}
        >
          <span className="invisible">{content.slice(range.start, range.end)}</span>
        </span>
      );

      lastIndex = range.end;
    });

    // Add remaining text
    if (lastIndex < content.length) {
      elements.push(
        <span key="text-end" className="invisible">
          {content.slice(lastIndex)}
        </span>
      );
    }

    return elements;
  }, [content, highlightRanges]);

  return (
    <div className="flex flex-col h-full">
      {/* Editor Container */}
      <div className="flex-1 relative overflow-hidden">
        {/* Highlight Overlay */}
        <div
          ref={overlayRef}
          className="absolute inset-0 pointer-events-none overflow-hidden p-6 whitespace-pre-wrap break-words font-mono text-lg leading-relaxed"
          aria-hidden="true"
        >
          {renderHighlightedContent()}
        </div>

        {/* Textarea - with native spellcheck suppressed */}
        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleChange}
          onScroll={handleScroll}
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          data-gramm="false"
          data-gramm_editor="false"
          data-enable-grammarly="false"
          className="
            absolute inset-0 w-full h-full resize-none p-6 
            bg-transparent text-slate-100 font-mono text-lg leading-relaxed
            focus:outline-none focus:ring-0 border-none
            placeholder:text-slate-600
            caret-indigo-500
          "
          placeholder="Start writing..."
          style={{
            // Prevent native squiggles
            WebkitTextFillColor: 'inherit',
            textDecoration: 'none',
          }}
        />
      </div>

      {/* Status Bar */}
      <StatusBar
        wordCount={stats.wordCount}
        characterCount={stats.characterCount}
        readingTime={stats.readingTime}
        errorCount={corrections.length}
        isSaving={isSaving}
        lastSaved={lastSaved}
      />
    </div>
  );
}

interface StatusBarProps {
  wordCount: number;
  characterCount: number;
  readingTime: number;
  errorCount: number;
  isSaving: boolean;
  lastSaved: Date | null;
}

function StatusBar({
  wordCount,
  characterCount,
  readingTime,
  errorCount,
  isSaving,
  lastSaved,
}: StatusBarProps) {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex items-center justify-between px-6 py-3 border-t border-slate-800 bg-slate-900/50 text-xs text-slate-500">
      <div className="flex items-center gap-4">
        <span>{wordCount} words</span>
        <span>{characterCount} characters</span>
        <span>{readingTime} min read</span>
        {errorCount > 0 && (
          <span className="text-amber-500">
            {errorCount} issue{errorCount !== 1 ? 's' : ''}
          </span>
        )}
      </div>
      
      <div className="flex items-center gap-2">
        {isSaving ? (
          <motion.span
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-indigo-400"
          >
            Saving...
          </motion.span>
        ) : lastSaved ? (
          <span className="text-green-500">Saved at {formatTime(lastSaved)}</span>
        ) : (
          <span>Not saved</span>
        )}
      </div>
    </div>
  );
}
