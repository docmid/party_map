'use client';
import { useParams } from 'next/navigation';
import { Async, Badge } from '@/components/ui';
import { useData } from '@/hooks/useAtlas';
export default function Page() {
  const { id } = useParams<{ id: string }>();
  const s = useData(r => r.listChronicle(id), [id]);
  return <main className="page"><h1>Хроника</h1><Async s={s} empty="Записей пока нет.">{items => items.map(i => (
<div key={i.id} className="card"><h3>Сессия {i.session}: {i.title}</h3><p>{i.text}</p><span className="muted">{i.date}</span></div>
  ))}</Async></main>;
}
