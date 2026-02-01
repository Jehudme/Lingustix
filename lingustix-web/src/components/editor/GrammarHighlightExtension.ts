'use client';

import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';
import { Node as ProseMirrorNode } from '@tiptap/pm/model';
import type { Correction } from '@/types';

export interface GrammarHighlightOptions {
  corrections: Correction[];
}

export const grammarHighlightPluginKey = new PluginKey('grammarHighlight');

/**
 * Custom Tiptap extension that creates decorations for grammar errors.
 * Uses ProseMirror's decoration system to highlight text without modifying the document.
 */
export const GrammarHighlightExtension = Extension.create<GrammarHighlightOptions>({
  name: 'grammarHighlight',

  addOptions() {
    return {
      corrections: [],
    };
  },

  addProseMirrorPlugins() {
    const { corrections } = this.options;

    return [
      new Plugin({
        key: grammarHighlightPluginKey,
        state: {
          init() {
            return DecorationSet.empty;
          },
          apply(tr, oldDecorations, oldState, newState) {
            // Rebuild decorations on every transaction to ensure they stay in sync
            return createDecorations(newState.doc, corrections);
          },
        },
        props: {
          decorations(state) {
            return this.getState(state);
          },
        },
      }),
    ];
  },
});

/**
 * Creates decoration objects from corrections array.
 * Maps character offsets from the corrections to ProseMirror positions.
 */
function createDecorations(doc: ProseMirrorNode, corrections: Correction[]): DecorationSet {
  if (!corrections || corrections.length === 0) {
    return DecorationSet.empty;
  }

  const decorations: Decoration[] = [];
  
  corrections.forEach((correction) => {
    const from = correction.startOffset;
    const to = correction.startOffset + correction.length;
    
    // Ensure positions are within document bounds
    const docLength = doc.content.size;
    if (from >= 0 && to <= docLength && from < to) {
      // Adjust positions for ProseMirror (add 1 for document node offset)
      const adjustedFrom = from + 1;
      const adjustedTo = to + 1;
      
      // Only create decoration if within bounds
      if (adjustedFrom > 0 && adjustedTo <= doc.content.size + 1) {
        const decoration = Decoration.inline(adjustedFrom, adjustedTo, {
          class: 'grammar-error',
          'data-correction': JSON.stringify({
            original: correction.original,
            suggested: correction.suggested,
            explanation: correction.explanation,
          }),
        });
        decorations.push(decoration);
      }
    }
  });

  return DecorationSet.create(doc, decorations);
}

export default GrammarHighlightExtension;
