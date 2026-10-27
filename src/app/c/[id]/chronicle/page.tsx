'use client';
import { useParams } from 'next/navigation';
import Crud from '@/components/Crud';
import { Async, Badge } from '@/components/ui';
import { loadAccess, repo, useData } from '@/hooks/useAtlas';
import { can } from '@/permissions/can';
import type * as T from '@/domain/types';
export default function Page() {
  const { id } = useParams<{ id: string }>();
  const s = useData(async r => ({ items: await r.listChronicle(id), ...(await loadAccess(r, id)) }), [id]);
  return <main className="page"><h1>Хроника</h1><Async s={s}>{({ items, c, m }) => (
<Crud<T.ChronicleEntry> items={[...items].sort((a, b) => b.session - a.session)} addLabel="+ Запись" empty="Записей пока нет." canEdit={can(m, c, 'edit_shared')} canDelete={can(m, c, 'delete_records')}
      fields={[{ key: 'title', label: 'Заголовок' }, { key: 'session', label: 'Номер сессии', type: 'number' }, { key: 'text', label: 'Что произошло', type: 'area' }]}
      blank={{ title: '', session: String(Math.max(0, ...items.map(i => i.session)) + 1), text: '' }} toValues={i => ({ title: i.title, session: String(i.session), text: i.text })}
      render={i => <><h3>Сессия {i.session}: {i.title}</h3><p>{i.text}</p><span className="muted">{i.date}</span></>}
      onSave={(v, eid) => repo.saveChronicle(id, { id: eid, title: v.title.trim(), session: Number(v.session) || 1, text: v.text, date: items.find(i => i.id === eid)?.date ?? new Date().toISOString().slice(0, 10) })} onDelete={e => repo.deleteChronicle(id, e)} />
  )}</Async></main>;
}
