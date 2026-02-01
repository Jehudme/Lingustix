import { create } from 'zustand';
import type { Correction, CompositionResponse } from '@/types';
import { compositionApi, evaluationApi } from '@/lib/api';

interface EditorState {
  composition: CompositionResponse | null;
  content: string;
  corrections: Correction[];
  isSaving: boolean;
  isEvaluating: boolean;
  isLiveMode: boolean;
  lastSaved: Date | null;
  hasUnsavedChanges: boolean;
  error: string | null;
  focusPosition: { start: number; end: number } | null;
}

interface EditorActions {
  loadComposition: (id: string) => Promise<void>;
  setContent: (content: string) => void;
  saveContent: () => Promise<void>;
  updateTitle: (title: string) => Promise<void>;
  evaluateContent: (signal?: AbortSignal) => Promise<void>;
  setLiveMode: (enabled: boolean) => void;
  clearCorrections: () => void;
  reset: () => void;
  setError: (error: string | null) => void;
  focusAtPosition: (start: number, end: number) => void;
  clearFocusPosition: () => void;
  restoreVersion: (content: string, title: string) => void;
}

type EditorStore = EditorState & EditorActions;

const initialState: EditorState = {
  composition: null,
  content: '',
  corrections: [],
  isSaving: false,
  isEvaluating: false,
  isLiveMode: false,
  lastSaved: null,
  hasUnsavedChanges: false,
  error: null,
  focusPosition: null,
};

export const useEditorStore = create<EditorStore>((set, get) => ({
  ...initialState,

  loadComposition: async (id: string) => {
    try {
      const composition = await compositionApi.getById(id);
      set({
        composition,
        content: composition.content,
        corrections: [],
        hasUnsavedChanges: false,
        error: null,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load composition';
      set({ error: errorMessage });
      throw error;
    }
  },

  setContent: (newContent: string) => {
    const { content: oldContent, corrections } = get();
    
    // Find the change position and delta by comparing old and new content
    const minLen = Math.min(oldContent.length, newContent.length);
    let changeStart = 0;
    
    // Find where the content starts to differ from the beginning
    while (changeStart < minLen && oldContent[changeStart] === newContent[changeStart]) {
      changeStart++;
    }
    
    // Find where it differs from the end (to handle mid-text changes)
    let oldEnd = oldContent.length;
    let newEnd = newContent.length;
    while (oldEnd > changeStart && newEnd > changeStart && oldContent[oldEnd - 1] === newContent[newEnd - 1]) {
      oldEnd--;
      newEnd--;
    }
    
    // Calculate the delta (positive = insertion, negative = deletion)
    const delta = newContent.length - oldContent.length;
    
    // Update corrections: remove those that overlap with the change, adjust offsets for the rest
    const updatedCorrections = corrections
      .filter((correction) => {
        const correctionEnd = correction.startOffset + correction.length;
        // Remove correction if the change overlaps with it
        // Change region in old content: [changeStart, oldEnd)
        const changeOverlapsCorrection = 
          changeStart < correctionEnd && oldEnd > correction.startOffset;
        return !changeOverlapsCorrection;
      })
      .map((correction) => {
        // Adjust offset for corrections that come after the change
        if (correction.startOffset >= oldEnd) {
          return {
            ...correction,
            startOffset: correction.startOffset + delta,
          };
        }
        return correction;
      });
    
    set({ content: newContent, corrections: updatedCorrections, hasUnsavedChanges: true });
  },

  saveContent: async () => {
    const { composition, content, isSaving } = get();
    if (!composition || isSaving) return;

    set({ isSaving: true, error: null });
    try {
      const updated = await compositionApi.updateContent(composition.id, { content });
      set({
        composition: updated,
        isSaving: false,
        lastSaved: new Date(),
        hasUnsavedChanges: false,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save';
      set({ error: errorMessage, isSaving: false });
      throw error;
    }
  },

  updateTitle: async (title: string) => {
    const { composition } = get();
    if (!composition) return;

    try {
      const updated = await compositionApi.updateTitle(composition.id, { title });
      set({ composition: updated, error: null });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update title';
      set({ error: errorMessage });
      throw error;
    }
  },

  evaluateContent: async (signal?: AbortSignal) => {
    const { composition, isEvaluating, hasUnsavedChanges, content, isSaving } = get();
    // Prevent concurrent evaluation or save operations
    if (!composition || isEvaluating || isSaving) return;

    // Save first if there are unsaved changes
    if (hasUnsavedChanges) {
      set({ isSaving: true, error: null });
      try {
        const updated = await compositionApi.updateContent(composition.id, { content });
        set({
          composition: updated,
          isSaving: false,
          lastSaved: new Date(),
          hasUnsavedChanges: false,
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to save';
        set({ error: errorMessage, isSaving: false });
        throw error;
      }
    }

    set({ isEvaluating: true, error: null });
    try {
      const corrections = await evaluationApi.create({ compositionId: composition.id }, signal);
      set({ corrections, isEvaluating: false });
    } catch (error) {
      // Don't set error state if the request was aborted
      if (error instanceof Error && error.name === 'CanceledError') {
        set({ isEvaluating: false });
        return;
      }
      const errorMessage = error instanceof Error ? error.message : 'Failed to evaluate';
      set({ error: errorMessage, isEvaluating: false });
      throw error;
    }
  },

  setLiveMode: (enabled: boolean) => {
    set({ isLiveMode: enabled });
    // Clear corrections when disabling live mode
    if (!enabled) {
      set({ corrections: [] });
    }
  },

  clearCorrections: () => set({ corrections: [] }),

  reset: () => set(initialState),

  setError: (error: string | null) => set({ error }),

  focusAtPosition: (start: number, end: number) => {
    set({ focusPosition: { start, end } });
  },

  clearFocusPosition: () => {
    set({ focusPosition: null });
  },

  restoreVersion: (restoredContent: string, restoredTitle: string) => {
    const { composition } = get();
    if (composition) {
      set({
        content: restoredContent,
        composition: { ...composition, title: restoredTitle, content: restoredContent },
        hasUnsavedChanges: true,
        // Clear existing corrections since they were calculated for the previous content
        // and would have incorrect offsets for the restored content
        corrections: [],
      });
    }
  },
}));

// Utility functions for editor statistics
export const calculateWordCount = (text: string): number => {
  return text.trim().split(/\s+/).filter(Boolean).length;
};

export const calculateCharacterCount = (text: string): number => {
  return text.length;
};

export const calculateReadingTime = (wordCount: number): number => {
  const wordsPerMinute = 200;
  return Math.ceil(wordCount / wordsPerMinute);
};

export const calculateErrorDensity = (corrections: Correction[], wordCount: number): number => {
  if (wordCount === 0) return 0;
  return (corrections.length / wordCount) * 100;
};
