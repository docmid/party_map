'use client';
import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import { repo, useData } from '@/hooks/useAtlas';
import { can } from '@/permissions/can';
const TABS = [['map', '🗺 Карта'], ['quests', '📜 Задания'], ['npcs', '👤 NPC'], ['chronicle', '📖 Хроника'], ['search', '🔍 Поиск']];
export default function CampaignLayout({ children }: { children: React.ReactNode }) {
  const { id } = useParams<{ id: string }>(), path = usePathname();
  const s = useData(async r => ({ c: (await r.listCampaigns()).find(x => x.id === id), m: await r.getMember(id) }), [id]);
  const { c, m } = s.data ?? {};
  return (
    <>
      <div className="page" style={{ paddingBottom: 0 }}>
        <div className="row"><Link href="/">← Кампании</Link><b style={{ flex: 1 }}>{c?.name ?? '…'}</b>
          {c && <span className="badge">{m?.role} · {c.status === 'archived' ? 'архив, только чтение' : 'активна'}</span>}
          {can(m, c, 'archive_campaign') && <button onClick={() => repo.setCampaignStatus(id, 'archived')}>В архив</button>}
          {c?.status === 'archived' && m?.role === 'owner' && <button onClick={() => repo.setCampaignStatus(id, 'active')}>Вернуть</button>}</div>
        <p className="muted" style={{ fontSize: 12 }}>Роли и права в демо — только подсказки интерфейса, не защита.</p>
      </div>
      {s.error ? <p className="err page">{s.error}</p> : children}
      <nav className="nav">{TABS.map(([k, l]) => <Link key={k} href={`/c/${id}/${k}`} className={path.endsWith('/' + k) ? 'on' : ''}>{l}</Link>)}</nav>
    </>
  );
}
