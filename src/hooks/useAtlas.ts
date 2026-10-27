'use client';
import { useEffect, useState, useSyncExternalStore } from 'react';
import { demoRepo } from '@/data/demo/memory';
import type { AtlasRepository } from '@/data/repository';
export const repo: AtlasRepository = demoRepo; // swap for a Supabase implementation later
export const loadAccess = async (r: AtlasRepository, id: string) => ({ c: (await r.listCampaigns()).find(x => x.id === id), m: await r.getMember(id) });
export function useData<T>(fn: (r: AtlasRepository) => Promise<T>, deps: unknown[] = []) {
  const v = useSyncExternalStore(repo.subscribe, repo.getVersion, () => 0);
  const [s, set] = useState<{ data?: T; error?: string; loading: boolean }>({ loading: true });
  useEffect(() => {
    let live = true;
    fn(repo).then(data => live && set({ data, loading: false })).catch(e => live && set({ error: String(e?.message ?? e), loading: false }));
    return () => { live = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [v, ...deps]);
  return s;
}
