'use client';
import { useParams } from 'next/navigation';
import type { ReactNode } from 'react';
import Crud, { type Field, type V } from '@/components/Crud';
import Related from '@/components/Related';
import { Async } from '@/components/ui';
import { loadAccess, useData } from '@/hooks/useAtlas';
import { can } from '@/permissions/can';
import type { AtlasRepository } from '@/data/repository';
import type { EntityType } from '@/domain/types';
export interface RecordsConfig<T extends { id: string }> { title: string; type: EntityType; addLabel: string; empty: string; fields: Field[]; load(r: AtlasRepository, c: string): Promise<T[]>; blank(items: T[]): V; toValues(i: T): V; render(i: T): ReactNode; save(c: string, v: V, items: T[], id?: string): Promise<void>; remove(c: string, id: string): Promise<void>; sort?(a: T, b: T): number }
export function RecordsPage<T extends { id: string }>({ cfg }: { cfg: RecordsConfig<T> }) {
  const { id } = useParams<{ id: string }>();
  const s = useData(async r => ({ items: await cfg.load(r, id), ...(await loadAccess(r, id)) }), [id]);
  return <main className="page"><h1>{cfg.title}</h1><Async s={s}>{({ items, c, m }) => (
    <Crud<T> items={cfg.sort ? [...items].sort(cfg.sort) : items} addLabel={cfg.addLabel} empty={cfg.empty} fields={cfg.fields} blank={cfg.blank(items)} toValues={cfg.toValues}
      render={i => <>{cfg.render(i)}<Related c={id} type={cfg.type} id={i.id} /></>} canEdit={can(m, c, 'edit_shared')} canDelete={can(m, c, 'delete_records')}
      onSave={(v, eid) => cfg.save(id, v, items, eid)} onDelete={x => cfg.remove(id, x)} />)}</Async></main>;
}
