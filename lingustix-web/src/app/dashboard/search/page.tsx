import type { Metadata } from 'next';
import { SearchView } from '@/components/search';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Search - Lingustix',
  description: 'Search your compositions',
};

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <SearchView />
    </Suspense>
  );
}
