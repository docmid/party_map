'use client';
import Link from 'next/link';
import { useData } from '@/hooks/useAtlas';
import type { EntityType } from '@/domain/types';
export const entityHref = (c: string, t: EntityType, id: string) => t === 'location' ? `/c/${c}/map?loc=${id}` : `/c/${c}/${t === 'npc' ? 'npcs' : t === 'quest' ? 'quests' : 'chronicle'}#${id}`;
export default function Related({ c, type, id }: { c: string; type: EntityType; id: string }) {
  const s = useData(async r => ({ links: await r.listLinks(c), l: await r.listLocations(c), n: await r.listNpcs(c), q: await r.listQuests(c), h: await r.listChronicle(c) }), [c]);
  if (!s.data) return null;
  const { links, l, n, q, h } = s.data;
  const name = (t: EntityType, i: string) => t === 'location' ? l.find(x => x.id === i)?.name : t === 'npc' ? n.find(x => x.id === i)?.name : t === 'quest' ? q.find(x => x.id === i)?.title : t === 'chronicle' ? h.find(x => x.id === i)?.title : undefined;
  const rel = links.filter(x => x.from.id === id || x.to.id === id).map(x => { const out = x.from.id === id; const o = out ? x.to : x.from; return { k: x.id, o, label: out ? x.label : `← ${x.label}`, nm: name(o.type, o.id) }; }).filter(r => r.nm);
  if (!rel.length) return null;
  return <p className="muted" style={{ fontSize: 14 }}>Связано: {rel.map(r => <Link key={r.k} href={entityHref(c, r.o.type, r.o.id)} className="badge">{r.label}: {r.nm}</Link>)}</p>;
}
