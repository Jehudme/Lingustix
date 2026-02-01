'use client';

import { useRef, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { useEditorStore, useSettingsStore, calculateWordCount, calculateCharacterCount, calculateReadingTime, calculateErrorDensity } from '@/lib/stores';
import { useDebounce } from '@/lib/hooks';
import { useToast } from '@/components/ui';
import { GrammarHighlightExtension } from './GrammarHighlightExtension';

// Constants for debounce timings
const AUTO_SAVE_DELAY = 2000; // 2 seconds for auto-save
const EVALUATION_DELAY = 1500; // 1.5 seconds for live evaluation

interface ZenEditorProps {
  compositionId: string;
}

export function ZenEditor({ compositionId }: ZenEditorProps) {
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

  // Configure Tiptap editor with extensions
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Disable formatting marks for a clean writing experience
        bold: false,
        italic: false,
        strike: false,
        code: false,
        codeBlock: false,
        blockquote: false,
        bulletList: false,
        orderedList: false,
        listItem: false,
        heading: false,
        horizontalRule: false,
      }),
      Placeholder.configure({
        placeholder: 'Start writing...',
        emptyNodeClass: 'is-editor-empty',
      }),
      GrammarHighlightExtension.configure({
        corrections: corrections,
      }),
    ],
    content: content,
    editorProps: {
      attributes: {
        class: 'zen-editor-content',
        spellcheck: 'false',
        autocomplete: 'off',
        autocorrect: 'off',
        autocapitalize: 'off',
        'data-gramm': 'false',
        'data-gramm_editor': 'false',
        'data-enable-grammarly': 'false',
      },
    },
    onUpdate: ({ editor }) => {
      // Get plain text content from the editor
      const newContent = editor.getText();
      setContent(newContent);
    },
  });

  // Update editor content when external content changes (e.g., on load)
  useEffect(() => {
    if (editor && content !== editor.getText()) {
      // Preserve cursor position when setting content
      const { from, to } = editor.state.selection;
      editor.commands.setContent(content, { emitUpdate: false });
      // Try to restore selection if within bounds
      const docLength = editor.state.doc.content.size;
      if (from <= docLength && to <= docLength) {
        editor.commands.setTextSelection({ from, to });
      }
    }
  }, [editor, content]);

  // Update grammar highlighting when corrections change
  useEffect(() => {
    if (editor) {
      // Reconfigure the extension with new corrections
      editor.extensionManager.extensions
        .filter((ext) => ext.name === 'grammarHighlight')
        .forEach((ext) => {
          ext.options.corrections = corrections;
        });
      // Force a state update to recalculate decorations
      editor.view.dispatch(editor.state.tr);
    }
  }, [editor, corrections]);

  // Load composition on mount
  useEffect(() => {
    loadComposition(compositionId).catch(() => {
      showToast('error', 'Failed to load composition');
    });
  }, [compositionId, loadComposition, showToast]);

  // Handle focusPosition changes - focus and scroll editor to the issue position
  useEffect(() => {
    if (focusPosition && editor) {
      editor.commands.focus();
      // Adjust for ProseMirror's 1-based position offset
      const from = focusPosition.start + 1;
      const to = focusPosition.end + 1;
      const docSize = editor.state.doc.content.size;
      
      if (from > 0 && to <= docSize + 1) {
        editor.commands.setTextSelection({ from, to });
        // Scroll to the selection
        const editorElement = editor.view.dom;
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          const rect = range.getBoundingClientRect();
          const editorRect = editorElement.getBoundingClientRect();
          const scrollTop = rect.top - editorRect.top + editorElement.scrollTop - editorElement.clientHeight / 2;
          editorElement.scrollTo({ top: Math.max(0, scrollTop), behavior: 'smooth' });
        }
      }
      
      clearFocusPosition();
    }
  }, [focusPosition, editor, clearFocusPosition]);

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

  return (
    <div className="flex flex-col h-full">
      {/* Tiptap Editor Container */}
      <div className="flex-1 relative overflow-hidden">
        <EditorContent
          editor={editor}
          className="
            absolute inset-0 w-full h-full overflow-auto p-6
            bg-transparent text-slate-100 font-mono text-lg leading-relaxed
          "
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
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-3 sm:px-6 py-2 sm:py-3 border-t border-slate-800 bg-slate-900/50 text-xs text-slate-500 gap-1 sm:gap-0">
      <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
        <span>{wordCount} words</span>
        <span className="hidden sm:inline">{characterCount} characters</span>
        <span>{readingTime} min read</span>
        {/* Only show error count when live mode is enabled */}
        {isLiveMode && errorCount > 0 && (
          <span className="text-amber-500">
            {errorCount} issue{errorCount !== 1 ? 's' : ''}
          </span>
        )}
      </div>
      
      <div className="flex items-center gap-2 sm:gap-4">
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
