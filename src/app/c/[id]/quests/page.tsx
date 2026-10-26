'use client';
import { useParams } from 'next/navigation';
import { Async, Badge } from '@/components/ui';
import { useData } from '@/hooks/useAtlas';
export default function Page() {
  const { id } = useParams<{ id: string }>();
  const s = useData(r => r.listQuests(id), [id]);
  return <main className="page"><h1>Задания</h1><Async s={s} empty="Заданий пока нет.">{items => items.map(i => (
<div key={i.id} className="card"><h3>{i.title}</h3><p>{i.summary}</p><Badge>{i.status}</Badge></div>
  ))}</Async></main>;
}
