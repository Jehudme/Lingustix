'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Plus, Trash2, MoreVertical } from 'lucide-react';
import { compositionApi } from '@/lib/api';
import { Button, CompositionListSkeleton, useToast } from '@/components/ui';
import type { CompositionResponse } from '@/types';

export function CompositionList() {
  const router = useRouter();
  const { showToast } = useToast();
  const [compositions, setCompositions] = useState<CompositionResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const loadCompositions = useCallback(async () => {
    setIsLoading(true);
    try {
      const idsPage = await compositionApi.getIds();

      // Fetch details for each composition
      const details = await Promise.all(
        idsPage.content.map((id) => compositionApi.getById(id))
      );
      setCompositions(details);
    } catch {
      showToast('error', 'Failed to load compositions');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadCompositions();
  }, [loadCompositions]);

  const handleCreate = async () => {
    setIsCreating(true);
    try {
      const newComposition = await compositionApi.create({ title: 'Untitled' });
      showToast('success', 'New composition created');
      router.push(`/dashboard/compositions/${newComposition.id}`);
    } catch {
      showToast('error', 'Failed to create composition');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await compositionApi.delete(id);
      setCompositions((prev) => prev.filter((c) => c.id !== id));
      showToast('success', 'Composition deleted');
    } catch {
      showToast('error', 'Failed to delete composition');
    }
    setActiveMenu(null);
  };

  const handleOpen = (id: string) => {
    router.push(`/dashboard/compositions/${id}`);
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-slate-100">Compositions</h1>
          <Button disabled isLoading>
            <Plus className="w-4 h-4" />
            New
          </Button>
        </div>
        <CompositionListSkeleton count={5} />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-100">Compositions</h1>
        <Button onClick={handleCreate} isLoading={isCreating}>
          <Plus className="w-4 h-4" />
          New
        </Button>
      </div>

      {compositions.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-16 text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center mb-4">
            <FileText className="w-8 h-8 text-slate-500" />
          </div>
          <h2 className="text-lg font-medium text-slate-300 mb-2">No compositions yet</h2>
          <p className="text-slate-500 mb-4">Start writing your first composition</p>
          <Button onClick={handleCreate} isLoading={isCreating}>
            <Plus className="w-4 h-4" />
            Create Composition
          </Button>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid gap-3"
        >
          <AnimatePresence mode="popLayout">
            {compositions.map((composition, index) => (
              <motion.div
                key={composition.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => handleOpen(composition.id)}
                className="relative p-4 rounded-lg border border-slate-800 bg-slate-900/50 hover:bg-slate-800/50 cursor-pointer transition-colors group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-medium text-slate-200 truncate">
                      {composition.title || 'Untitled'}
                    </h3>
                    <p className="text-sm text-slate-500 line-clamp-2 mt-1">
                      {composition.content || 'No content yet...'}
                    </p>
                  </div>
                  
                  <div className="relative ml-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMenu(activeMenu === composition.id ? null : composition.id);
                      }}
                      className="p-1.5 rounded-lg hover:bg-slate-700 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <MoreVertical className="w-4 h-4 text-slate-400" />
                    </button>

                    {activeMenu === composition.id && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="absolute right-0 mt-1 w-36 py-1 bg-slate-800 border border-slate-700 rounded-lg shadow-lg z-10"
                      >
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(composition.id);
                          }}
                          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-400 hover:bg-slate-700 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </motion.div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
