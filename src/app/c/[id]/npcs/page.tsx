'use client';
import { useParams } from 'next/navigation';
import { Async, Badge } from '@/components/ui';
import { useData } from '@/hooks/useAtlas';
export default function Page() {
  const { id } = useParams<{ id: string }>();
  const s = useData(r => r.listNpcs(id), [id]);
  return <main className="page"><h1>NPC</h1><Async s={s} empty="Персонажей пока нет.">{items => items.map(i => (
<div key={i.id} className="card"><h3>{i.name}</h3><p className="muted">{i.role}</p><p>{i.description}</p><Badge>{i.attitude}</Badge></div>
  ))}</Async></main>;
}
