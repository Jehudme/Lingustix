'use client';

import { motion } from 'framer-motion';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
}

export function Skeleton({ className = '', variant = 'rectangular' }: SkeletonProps) {
  const baseClasses = 'bg-slate-800 animate-pulse';
  
  const variantClasses = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  };

  return (
    <motion.div
      initial={{ opacity: 0.5 }}
      animate={{ opacity: [0.5, 0.8, 0.5] }}
      transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="p-4 rounded-lg border border-slate-800 bg-slate-900/50">
      <Skeleton className="h-5 w-3/4 mb-3" variant="text" />
      <Skeleton className="h-4 w-1/2 mb-2" variant="text" />
      <Skeleton className="h-4 w-1/3" variant="text" />
    </div>
  );
}

export function CompositionListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

export function EditorSkeleton() {
  return (
    <div className="h-full flex flex-col gap-4 p-4">
      <Skeleton className="h-8 w-1/3" variant="text" />
      <Skeleton className="flex-1 min-h-[400px]" />
    </div>
  );
}
