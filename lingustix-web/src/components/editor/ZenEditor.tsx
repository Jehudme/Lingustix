'use client';

import { useRef, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useEditorStore, useSettingsStore, calculateWordCount, calculateCharacterCount, calculateReadingTime, calculateErrorDensity } from '@/lib/stores';
import { useDebounce } from '@/lib/hooks';
import { useToast } from '@/components/ui';
import type { Correction } from '@/types';

// Constants for debounce timings
const AUTO_SAVE_DELAY = 2000; // 2 seconds for auto-save
const EVALUATION_DELAY = 1500; // 1.5 seconds for live evaluation

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
  const abortControllerRef = useRef<AbortController | null>(null);
  const { showToast } = useToast();
  const { autoSaveInterval } = useSettingsStore();
  
  const {
    content,
    corrections,
    isSaving,
    isEvaluating,
    isLiveMode,
    hasUnsavedChanges,
    lastSaved,
    focusPosition,
    setContent,
    saveContent,
    loadComposition,
    evaluateContent,
    clearFocusPosition,
  } = useEditorStore();

  // Load composition on mount
  useEffect(() => {
    loadComposition(compositionId).catch(() => {
      showToast('error', 'Failed to load composition');
    });
  }, [compositionId, loadComposition, showToast]);

  // Handle focusPosition changes - focus and scroll textarea to the issue position
  useEffect(() => {
    if (focusPosition && textareaRef.current) {
      const textarea = textareaRef.current;
      textarea.focus();
      textarea.setSelectionRange(focusPosition.start, focusPosition.end);
      
      // Use a hidden mirror element to calculate accurate scroll position
      // This handles text wrapping correctly
      const mirror = document.createElement('div');
      const computedStyle = getComputedStyle(textarea);
      
      // Copy all relevant styles to the mirror
      mirror.style.cssText = `
        position: absolute;
        visibility: hidden;
        white-space: pre-wrap;
        word-wrap: break-word;
        overflow-wrap: break-word;
        width: ${textarea.clientWidth}px;
        font-family: ${computedStyle.fontFamily};
        font-size: ${computedStyle.fontSize};
        line-height: ${computedStyle.lineHeight};
        padding: ${computedStyle.padding};
        border: ${computedStyle.border};
        box-sizing: ${computedStyle.boxSizing};
      `;
      
      // Insert text up to the focus position
      const textBefore = content.slice(0, focusPosition.start);
      mirror.textContent = textBefore;
      
      // Add a marker element at the cursor position
      const marker = document.createElement('span');
      marker.textContent = '|';
      mirror.appendChild(marker);
      
      document.body.appendChild(mirror);
      
      // Calculate scroll position to center the marker with 100px vertical offset
      const markerTop = marker.offsetTop;
      const viewportPadding = 100; // Extra padding to ensure visibility
      const targetScrollTop = Math.max(0, markerTop - (textarea.clientHeight / 2) + viewportPadding);
      
      // Smooth scroll to the calculated position
      textarea.scrollTo({
        top: targetScrollTop,
        behavior: 'smooth'
      });
      
      document.body.removeChild(mirror);
      
      // Clear the focus position after handling
      clearFocusPosition();
    }
  }, [focusPosition, content, clearFocusPosition]);

  // Use the smaller of autoSaveInterval or AUTO_SAVE_DELAY (2 seconds)
  const effectiveAutoSaveInterval = Math.min(autoSaveInterval, AUTO_SAVE_DELAY);

  // Debounced save function (independent of evaluation)
  const debouncedSave = useDebounce(() => {
    if (hasUnsavedChanges) {
      saveContent().catch(() => {
        showToast('error', 'Failed to save');
      });
    }
  }, effectiveAutoSaveInterval);

  // Debounced evaluation function (1.5 seconds after typing stops)
  const debouncedEvaluate = useDebounce(() => {
    if (isLiveMode && content.trim().length > 0) {
      // Abort any pending evaluation request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      // Create new abort controller for this evaluation
      abortControllerRef.current = new AbortController();
      
      evaluateContent(abortControllerRef.current.signal).catch((error) => {
        // Only show error if it's not an abort error
        if (error?.name !== 'CanceledError') {
          showToast('error', 'Failed to analyze content');
        }
      });
    }
  }, EVALUATION_DELAY);

  // Auto-save when content changes
  useEffect(() => {
    if (hasUnsavedChanges) {
      debouncedSave();
    }
  }, [content, hasUnsavedChanges, debouncedSave]);

  // Track previous content to detect actual changes
  const prevContentRef = useRef<string>(content);

  // Auto-evaluate when content changes and live mode is active
  // Also trigger when live mode is first enabled with existing content
  useEffect(() => {
    const contentChanged = prevContentRef.current !== content;
    prevContentRef.current = content;
    
    if (isLiveMode && content.trim().length > 0) {
      // Abort any pending evaluation when user starts typing
      if (contentChanged && abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      debouncedEvaluate();
    }
  }, [content, isLiveMode, debouncedEvaluate]);

  // Cleanup abort controller on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

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
        {/* Highlight Overlay - uses overflow-auto for scroll sync but hides scrollbar */}
        <div
          ref={overlayRef}
          className="absolute inset-0 pointer-events-none overflow-auto p-6 whitespace-pre-wrap break-words font-mono text-lg leading-relaxed scrollbar-hide"
          aria-hidden="true"
          style={{
            // Hide scrollbar but allow scrolling for proper sync with textarea
            scrollbarWidth: 'none', // Firefox
            msOverflowStyle: 'none', // IE/Edge
          }}
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
        isEvaluating={isEvaluating}
        isLiveMode={isLiveMode}
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
  isEvaluating: boolean;
  isLiveMode: boolean;
  lastSaved: Date | null;
}

function StatusBar({
  wordCount,
  characterCount,
  readingTime,
  errorCount,
  isSaving,
  isEvaluating,
  isLiveMode,
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
        {/* Only show error count when live mode is enabled */}
        {isLiveMode && errorCount > 0 && (
          <span className="text-amber-500">
            {errorCount} issue{errorCount !== 1 ? 's' : ''}
          </span>
        )}
      </div>
      
      <div className="flex items-center gap-4">
        {/* Analyzing indicator */}
        {isEvaluating && (
          <motion.span
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-indigo-400"
          >
            Analyzing...
          </motion.span>
        )}
        
        {/* Saving/Saved status */}
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
