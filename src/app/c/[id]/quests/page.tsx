'use client';
import { useParams } from 'next/navigation';
import Crud from '@/components/Crud';
import { Async, Badge } from '@/components/ui';
import { loadAccess, repo, useData } from '@/hooks/useAtlas';
import { can } from '@/permissions/can';
import type * as T from '@/domain/types';
export default function Page() {
  const { id } = useParams<{ id: string }>();
  const s = useData(async r => ({ items: await r.listQuests(id), ...(await loadAccess(r, id)) }), [id]);
  return <main className="page"><h1>Задания</h1><Async s={s}>{({ items, c, m }) => (
<Crud<T.Quest> items={items} addLabel="+ Задание" empty="Заданий пока нет." canEdit={can(m, c, 'edit_shared')} canDelete={can(m, c, 'delete_records')}
      fields={[{ key: 'title', label: 'Название' }, { key: 'summary', label: 'Описание', type: 'area' }, { key: 'status', label: 'Статус', type: 'select', options: ['active', 'completed', 'failed'] }]}
      blank={{ title: '', summary: '', status: 'active' }} toValues={i => ({ title: i.title, summary: i.summary, status: i.status })}
      render={i => <><h3>{i.title}</h3><p>{i.summary}</p><Badge>{i.status}</Badge></>}
      onSave={(v, qid) => repo.saveQuest(id, { id: qid, title: v.title.trim(), summary: v.summary, status: v.status as T.Quest['status'] })} onDelete={q => repo.deleteQuest(id, q)} />
  )}</Async></main>;
}
