'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { History, Clock, User, RotateCcw } from 'lucide-react';
import { Modal, Button, useToast } from '@/components/ui';
import { compositionApi } from '@/lib/api';
import type { CompositionVersionDTO } from '@/types';

interface VersionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  compositionId: string;
  onRestoreVersion: (content: string, title: string) => void;
}

export function VersionHistoryModal({
  isOpen,
  onClose,
  compositionId,
  onRestoreVersion,
}: VersionHistoryModalProps) {
  const [versions, setVersions] = useState<CompositionVersionDTO[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<CompositionVersionDTO | null>(null);
  const { showToast } = useToast();

  const loadVersions = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await compositionApi.getVersions(compositionId);
      setVersions(data);
      setSelectedVersion(null);
    } catch {
      showToast('error', 'Failed to load version history');
    } finally {
      setIsLoading(false);
    }
  }, [compositionId, showToast]);

  useEffect(() => {
    if (isOpen && compositionId) {
      loadVersions();
    }
  }, [isOpen, compositionId, loadVersions]);

  const handleRestore = () => {
    if (selectedVersion) {
      onRestoreVersion(selectedVersion.content, selectedVersion.title);
      showToast('success', 'Version restored successfully');
      onClose();
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  /**
   * Truncates content to a maximum length, trying to break at word boundaries.
   */
  const truncateContent = (content: string, maxLength: number = 150) => {
    if (content.length <= maxLength) return content;
    // Try to find a space near the maxLength to avoid breaking words
    const lastSpace = content.lastIndexOf(' ', maxLength);
    const breakPoint = lastSpace > maxLength * 0.7 ? lastSpace : maxLength;
    return content.substring(0, breakPoint) + '...';
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Version History" size="xl">
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            >
              <History className="w-6 h-6 text-indigo-400" />
            </motion.div>
            <span className="ml-2 text-slate-400">Loading versions...</span>
          </div>
        ) : versions.length === 0 ? (
          <div className="text-center py-8">
            <History className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">No version history available yet.</p>
            <p className="text-slate-500 text-sm mt-1">
              Changes will be tracked automatically as you edit.
            </p>
          </div>
        ) : (
          <>
            <div className="max-h-96 overflow-y-auto space-y-2 pr-2">
              {versions.map((version, index) => (
                <button
                  key={version.commitId}
                  onClick={() => setSelectedVersion(version)}
                  className={`w-full text-left p-4 rounded-lg border transition-colors ${
                    selectedVersion?.commitId === version.commitId
                      ? 'border-indigo-500 bg-indigo-500/10'
                      : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 text-sm text-slate-400 mb-1">
                        <Clock className="w-3 h-3" />
                        <span>{formatTimestamp(version.timestamp)}</span>
                        {index === 0 && (
                          <span className="px-2 py-0.5 text-xs bg-indigo-500/20 text-indigo-400 rounded">
                            Latest
                          </span>
                        )}
                      </div>
                      <h4 className="font-medium text-slate-200 truncate">{version.title}</h4>
                      <p className="text-sm text-slate-500 mt-1 line-clamp-2">
                        {truncateContent(version.content)}
                      </p>
                    </div>
                    {version.author && (
                      <div className="flex items-center gap-1 text-xs text-slate-500 flex-shrink-0">
                        <User className="w-3 h-3" />
                        <span>{version.author}</span>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>

            {/* Preview and Restore Section */}
            {selectedVersion && (
              <div className="border-t border-slate-700 pt-4 space-y-3">
                <div className="bg-slate-800/50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-slate-300 mb-2">Preview</h4>
                  <div className="text-sm text-slate-400 max-h-32 overflow-y-auto whitespace-pre-wrap">
                    {selectedVersion.content || '(empty)'}
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" onClick={() => setSelectedVersion(null)}>
                    Cancel
                  </Button>
                  <Button variant="primary" onClick={handleRestore}>
                    <RotateCcw className="w-4 h-4" />
                    Restore This Version
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </Modal>
  );
}
