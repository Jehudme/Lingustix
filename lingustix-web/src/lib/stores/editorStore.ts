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

  setContent: (content: string) => {
    set({ content, hasUnsavedChanges: true });
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
    if (!composition || isEvaluating) return;

    // Save first if there are unsaved changes
    if (hasUnsavedChanges && !isSaving) {
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
