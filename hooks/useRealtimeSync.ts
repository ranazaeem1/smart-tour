'use client';

import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

/**
 * Subscribe to real-time Supabase changes and auto-refresh the current page.
 * Use this in ALL dashboard pages that need live data updates.
 * @param tables - Array of table names to subscribe to
 */
export function useRealtimeSync(tables: string[]) {
  const router = useRouter();

  useEffect(() => {
    const channels = tables.map(table =>
      supabase
        .channel(`realtime:${table}:${Date.now()}`)
        .on(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          'postgres_changes' as any,
          { event: '*', schema: 'public', table },
          () => {
            router.refresh();
          }
        )
        .subscribe()
    );

    return () => {
      channels.forEach(ch => supabase.removeChannel(ch));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tables.join(',')]);
}
