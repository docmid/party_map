'use client';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import MapView from '@/components/MapView';
import { Async, Badge } from '@/components/ui';
import { repo, useData } from '@/hooks/useAtlas';
import { can } from '@/permissions/can';
import type { ExploreStatus, MarkerKind } from '@/domain/types';
const KINDS: MarkerKind[] = ['city', 'dungeon', 'ruin', 'camp', 'poi'];
export default function MapPage() {
  const { id } = useParams<{ id: string }>();
  const [mapId, setMapId] = useState<string>(), [sel, setSel] = useState<string>(), [filter, setFilter] = useState<MarkerKind | 'all'>('all');
  const [addAt, setAddAt] = useState<{ x: number; y: number } | null>(null), [adding, setAdding] = useState(false), [err, setErr] = useState('');
  const [name, setName] = useState(''), [kind, setKind] = useState<MarkerKind>('poi');
  const base = useData(async r => ({ maps: await r.listMaps(id), locs: await r.listLocations(id), c: (await r.listCampaigns()).find(x => x.id === id), m: await r.getMember(id) }), [id]);
  const curId = mapId && base.data?.maps.some(m => m.id === mapId) ? mapId : base.data?.maps[0]?.id;
  const mk = useData(r => (curId ? r.listMarkers(id, curId) : Promise.resolve([])), [id, curId]);
  const run = async (f: () => Promise<void>) => { try { setErr(''); await f(); } catch (e) { setErr(String((e as Error).message)); } };
  return (
    <main className="page"><Async s={base} empty="Нет карт.">{({ maps, locs, c, m }) => {
      const map = maps.find(x => x.id === curId) ?? maps[0];
      const markers = (mk.data ?? []).filter(x => filter === 'all' || x.kind === filter);
      const selMarker = (mk.data ?? []).find(x => x.id === sel), selLoc = locs.find(l => l.id === selMarker?.locationId);
      const canAdd = can(m, c, 'add_markers');
      return (<>
        <div className="row"><select value={map.id} onChange={e => { setMapId(e.target.value); setSel(undefined); }}>{maps.map(x => <option key={x.id} value={x.id}>{x.parentMapId ? '↳ ' : ''}{x.name}</option>)}</select>
          <select value={filter} onChange={e => setFilter(e.target.value as MarkerKind | 'all')}><option value="all">Все типы</option>{KINDS.map(k => <option key={k}>{k}</option>)}</select>
          {canAdd && <button className={adding ? 'pri' : ''} onClick={() => setAdding(a => !a)}>{adding ? 'Тапните по карте' : '+ Точка'}</button>}</div>
        {err && <p className="err" role="alert">{err}</p>}
        <MapView map={map} markers={markers} selectedId={sel} addMode={adding} onSelect={x => setSel(x.id)} onAdd={(x, y) => { setAddAt({ x, y }); setAdding(false); }} />
        {addAt && <form className="card" onSubmit={e => { e.preventDefault(); run(async () => { await repo.addMarker(id, { mapId: map.id, ...addAt, name: name || 'Новая точка', kind, status: 'unknown', description: '' }); setAddAt(null); setName(''); }); }}>
          <b>Новая точка ({addAt.x.toFixed(2)}, {addAt.y.toFixed(2)})</b><input placeholder="Название" value={name} onChange={e => setName(e.target.value)} />
          <select value={kind} onChange={e => setKind(e.target.value as MarkerKind)}>{KINDS.map(k => <option key={k}>{k}</option>)}</select>
          <div className="row"><button className="pri" type="submit">Добавить</button><button type="button" onClick={() => setAddAt(null)}>Отмена</button></div></form>}
        {selMarker && selLoc && <div className="card"><h3>{selLoc.name}</h3><p>{selLoc.description || 'Описания пока нет.'}</p><Badge>{selLoc.kind}</Badge><Badge>{selLoc.status}</Badge>
          {selMarker.childMapId && <button onClick={() => { setMapId(selMarker.childMapId!); setSel(undefined); }}>Открыть вложенную карту</button>}
          <div className="row" style={{ marginTop: 8 }}>
            {can(m, c, 'edit_markers') && <select value={selLoc.status} onChange={e => run(() => repo.updateLocation(id, selLoc.id, { status: e.target.value as ExploreStatus }))}>{['unknown', 'rumored', 'visited', 'cleared'].map(s => <option key={s}>{s}</option>)}</select>}
            {can(m, c, 'delete_markers') && <button className="dng" onClick={() => run(async () => { await repo.deleteMarker(id, selMarker.id); setSel(undefined); })}>Удалить</button>}</div></div>}
        <h3>Точки на карте</h3>
        {markers.length === 0 ? <p className="muted">На этой карте нет точек{filter !== 'all' ? ' выбранного типа' : ''}.</p> : markers.map(x => { const l = locs.find(q => q.id === x.locationId); return <button key={x.id} className="card" style={{ width: '100%', textAlign: 'left' }} onClick={() => setSel(x.id)}>{l?.name} <Badge>{x.kind}</Badge></button>; })}
      </>);
    }}</Async></main>
  );
}
