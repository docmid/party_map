'use client';
import { useParams } from 'next/navigation';
import Crud from '@/components/Crud';
import { Async, Badge } from '@/components/ui';
import { loadAccess, repo, useData } from '@/hooks/useAtlas';
import { can } from '@/permissions/can';
import type * as T from '@/domain/types';
export default function Page() {
  const { id } = useParams<{ id: string }>();
  const s = useData(async r => ({ items: await r.listNpcs(id), ...(await loadAccess(r, id)) }), [id]);
  return <main className="page"><h1>NPC</h1><Async s={s}>{({ items, c, m }) => (
<Crud<T.Npc> items={items} addLabel="+ NPC" empty="Персонажей пока нет." canEdit={can(m, c, 'edit_shared')} canDelete={can(m, c, 'delete_records')}
      fields={[{ key: 'name', label: 'Имя' }, { key: 'role', label: 'Роль' }, { key: 'description', label: 'Описание', type: 'area' }, { key: 'attitude', label: 'Отношение', type: 'select', options: ['ally', 'neutral', 'hostile'] }]}
      blank={{ name: '', role: '', description: '', attitude: 'neutral' }} toValues={i => ({ name: i.name, role: i.role, description: i.description, attitude: i.attitude })}
      render={i => <><h3>{i.name}</h3><p className="muted">{i.role}</p><p>{i.description}</p><Badge>{i.attitude}</Badge></>}
      onSave={(v, nid) => repo.saveNpc(id, { id: nid, name: v.name.trim(), role: v.role, description: v.description, attitude: v.attitude as T.Npc['attitude'] })} onDelete={n => repo.deleteNpc(id, n)} />
  )}</Async></main>;
}
