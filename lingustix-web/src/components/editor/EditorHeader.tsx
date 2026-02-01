'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronLeft, Download, Save, FileText, Type, Zap } from 'lucide-react';
import { useEditorStore } from '@/lib/stores';
import { Breadcrumbs, type BreadcrumbItem } from '@/components/layout';
import { Button, Switch, useToast } from '@/components/ui';

export function EditorHeader() {
  const router = useRouter();
  const { showToast } = useToast();
  const { 
    composition, 
    content, 
    updateTitle, 
    saveContent, 
    isSaving, 
    hasUnsavedChanges,
    isLiveMode,
    setLiveMode,
  } = useEditorStore();
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const titleInputRef = useRef<HTMLInputElement>(null);
  
  // Use composition title directly as the input value when editing
  const [localTitleInput, setLocalTitleInput] = useState<string | null>(null);
  const titleInput = localTitleInput ?? composition?.title ?? '';

  const handleStartEditing = () => {
    setLocalTitleInput(composition?.title ?? '');
    setIsEditingTitle(true);
    // Focus after state update
    setTimeout(() => {
      titleInputRef.current?.focus();
      titleInputRef.current?.select();
    }, 0);
  };

  const handleTitleSave = async () => {
    if (titleInput.trim() && titleInput !== composition?.title) {
      try {
        await updateTitle(titleInput.trim());
        showToast('success', 'Title updated');
      } catch {
        showToast('error', 'Failed to update title');
        setLocalTitleInput(composition?.title || '');
      }
    }
    setIsEditingTitle(false);
    setLocalTitleInput(null);
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTitleSave();
    } else if (e.key === 'Escape') {
      setLocalTitleInput(null);
      setIsEditingTitle(false);
    }
  };

  const handleManualSave = async () => {
    try {
      await saveContent();
      showToast('success', 'Saved successfully');
    } catch {
      showToast('error', 'Failed to save');
    }
  };

  const handleExport = (format: 'markdown' | 'text') => {
    const filename = `${composition?.title || 'composition'}.${format === 'markdown' ? 'md' : 'txt'}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
    showToast('success', `Exported as ${format}`);
  };

  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Compositions', href: '/dashboard' },
    { label: composition?.title || 'Loading...' },
  ];

  return (
    <div className="flex items-center justify-between px-3 sm:px-6 py-3 sm:py-4 border-b border-slate-800 bg-slate-950">
      <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
        <button
          onClick={() => router.push('/dashboard')}
          className="p-1.5 sm:p-2 rounded-lg hover:bg-slate-800 transition-colors flex-shrink-0"
        >
          <ChevronLeft className="w-5 h-5 text-slate-400" />
        </button>

        <div className="flex flex-col gap-1 min-w-0">
          <div className="hidden sm:block">
            <Breadcrumbs items={breadcrumbs} />
          </div>
          
          {isEditingTitle ? (
            <input
              ref={titleInputRef}
              type="text"
              value={titleInput}
              onChange={(e) => setLocalTitleInput(e.target.value)}
              onBlur={handleTitleSave}
              onKeyDown={handleTitleKeyDown}
              className="text-base sm:text-xl font-bold bg-transparent border-b-2 border-indigo-500 text-slate-100 focus:outline-none px-0 py-1 w-full"
              maxLength={255}
            />
          ) : (
            <button
              onClick={handleStartEditing}
              className="text-base sm:text-xl font-bold text-slate-100 hover:text-indigo-400 transition-colors text-left truncate"
            >
              {composition?.title || 'Untitled'}
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
        {/* Live Correction Toggle */}
        <div className="flex items-center gap-1 sm:gap-2">
          <Zap className={`w-4 h-4 ${isLiveMode ? 'text-indigo-400' : 'text-slate-500'}`} />
          <span className={`hidden sm:inline text-sm ${isLiveMode ? 'text-slate-200' : 'text-slate-500'}`}>
            Live Correction
          </span>
          <Switch
            checked={isLiveMode}
            onChange={setLiveMode}
            label="Toggle Live Correction Mode"
          />
        </div>

        <div className="hidden sm:block w-px h-6 bg-slate-700" />

        {/* Save Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleManualSave}
          isLoading={isSaving}
          disabled={!hasUnsavedChanges}
        >
          {hasUnsavedChanges ? (
            <Save className="w-4 h-4" />
          ) : (
            <Check className="w-4 h-4 text-green-500" />
          )}
          <span className="hidden sm:inline">{hasUnsavedChanges ? 'Save' : 'Saved'}</span>
        </Button>

        {/* Export Button */}
        <div className="relative">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowExportMenu(!showExportMenu)}
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export</span>
          </Button>

          <AnimatePresence>
            {showExportMenu && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute right-0 mt-2 w-48 py-1 bg-slate-800 border border-slate-700 rounded-lg shadow-lg z-10"
              >
                <button
                  onClick={() => handleExport('markdown')}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-slate-200 hover:bg-slate-700 transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  Markdown (.md)
                </button>
                <button
                  onClick={() => handleExport('text')}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-slate-200 hover:bg-slate-700 transition-colors"
                >
                  <Type className="w-4 h-4" />
                  Plain Text (.txt)
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
