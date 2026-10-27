'use client';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { entityHref } from '@/components/Related';
import { Async, Badge } from '@/components/ui';
import { useData } from '@/hooks/useAtlas';
import type { EntityType } from '@/domain/types';
export default function SearchPage() {
  const { id } = useParams<{ id: string }>(), [q, setQ] = useState('');
  const s = useData(async r => ({ l: await r.listLocations(id), n: await r.listNpcs(id), t: await r.listQuests(id), h: await r.listChronicle(id), z: await r.listNotes(id) }), [id]);
  const f = (a: string, b = '') => (a + ' ' + b).toLowerCase().includes(q.trim().toLowerCase());
  return <main className="page"><h1>Поиск</h1><input placeholder="Имя, место, задание, заметка…" value={q} onChange={e => setQ(e.target.value)} />
    <Async s={s}>{d => {
      const r: [string, EntityType, string, string][] = q.trim() ? [
        ...d.l.filter(x => f(x.name, x.description)).map((x): [string, EntityType, string, string] => ['Локация', 'location', x.id, x.name]),
        ...d.n.filter(x => f(x.name, x.description)).map((x): [string, EntityType, string, string] => ['NPC', 'npc', x.id, x.name]),
        ...d.t.filter(x => f(x.title, x.summary)).map((x): [string, EntityType, string, string] => ['Задание', 'quest', x.id, x.title]),
        ...d.h.filter(x => f(x.title, x.text)).map((x): [string, EntityType, string, string] => ['Хроника', 'chronicle', x.id, x.title]),
        ...d.z.filter(x => f(x.text)).map((x): [string, EntityType, string, string] => ['Заметка', 'location', x.locationId ?? '', x.text])] : [];
      if (!q.trim()) return <p className="muted">Введите запрос.</p>; if (!r.length) return <p className="muted">Ничего не найдено.</p>;
      return <>{r.map(x => <Link key={x[0] + x[2] + x[3]} href={x[2] ? entityHref(id, x[1], x[2]) : `/c/${id}/map`} className="card"><Badge>{x[0]}</Badge>{x[3]}</Link>)}</>; }}</Async></main>;
}
