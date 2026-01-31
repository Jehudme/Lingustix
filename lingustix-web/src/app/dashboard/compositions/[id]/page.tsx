'use client';

import { use } from 'react';
import { ZenEditor, EditorHeader, StatisticsSidebar } from '@/components/editor';

interface EditorPageProps {
  params: Promise<{ id: string }>;
}

export default function EditorPage({ params }: EditorPageProps) {
  const { id } = use(params);
  
  return (
    <div className="h-[calc(100vh-65px)] flex flex-col">
      {/* Header */}
      <EditorHeader />
      
      {/* Editor and Sidebar */}
      <div className="flex-1 flex overflow-hidden">
        {/* Main Editor */}
        <div className="flex-1 bg-slate-950">
          <ZenEditor compositionId={id} />
        </div>
        
        {/* Statistics Sidebar - Hidden on mobile */}
        <div className="hidden lg:block">
          <StatisticsSidebar />
        </div>
      </div>
    </div>
  );
}
