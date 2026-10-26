'use client';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { Async, Badge } from '@/components/ui';
import { useData } from '@/hooks/useAtlas';
export default function SearchPage() {
  const { id } = useParams<{ id: string }>(), [q, setQ] = useState('');
  const s = useData(async r => ({ l: await r.listLocations(id), n: await r.listNpcs(id), t: await r.listQuests(id), h: await r.listChronicle(id) }), [id]);
  const f = (a: string, b: string) => (a + ' ' + b).toLowerCase().includes(q.trim().toLowerCase());
  return <main className="page"><h1>Поиск</h1><input placeholder="Имя, место, задание…" value={q} onChange={e => setQ(e.target.value)} />
    <Async s={s}>{d => { const r = q.trim() ? [...d.l.filter(x => f(x.name, x.description)).map(x => ['Локация', x.id, x.name]), ...d.n.filter(x => f(x.name, x.description)).map(x => ['NPC', x.id, x.name]), ...d.t.filter(x => f(x.title, x.summary)).map(x => ['Задание', x.id, x.title]), ...d.h.filter(x => f(x.title, x.text)).map(x => ['Хроника', x.id, x.title])] : null;
      if (!r) return <p className="muted">Введите запрос.</p>; if (!r.length) return <p className="muted">Ничего не найдено.</p>;
      return <>{r.map(x => <div key={x[1]} className="card"><Badge>{x[0]}</Badge>{x[2]}</div>)}</>; }}</Async></main>;
}
