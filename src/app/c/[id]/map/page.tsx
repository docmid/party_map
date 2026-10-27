'use client';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import MapView from '@/components/MapView';
import Notes from '@/components/Notes';
import Related from '@/components/Related';
import { Async, Badge } from '@/components/ui';
import { loadAccess, repo, useData } from '@/hooks/useAtlas';
import { can } from '@/permissions/can';
import type { ExploreStatus, MarkerKind } from '@/domain/types';
const KINDS: MarkerKind[] = ['city', 'dungeon', 'ruin', 'camp', 'poi'];
export default function MapPage() {
  const { id } = useParams<{ id: string }>();
  const [mapId, setMapId] = useState<string>(), [sel, setSel] = useState<string>(), [filter, setFilter] = useState<MarkerKind | 'all'>('all');
  const [addAt, setAddAt] = useState<{ x: number; y: number } | null>(null), [adding, setAdding] = useState(false), [err, setErr] = useState('');
  const [name, setName] = useState(''), [kind, setKind] = useState<MarkerKind>('poi');
  const [ed, setEd] = useState<{ name: string; description: string; kind: MarkerKind; secret: boolean } | null>(null);
  const base = useData(async r => ({ maps: await r.listMaps(id), locs: await r.listLocations(id), ...(await loadAccess(r, id)) }), [id]);
  const curId = mapId && base.data?.maps.some(m => m.id === mapId) ? mapId : base.data?.maps[0]?.id;
  const mk = useData(r => (curId ? r.listMarkers(id, curId) : Promise.resolve([])), [id, curId]);
  const run = async (f: () => Promise<void>) => { try { setErr(''); await f(); } catch (e) { setErr(String((e as Error).message)); } };
  // deep link from search / related: ?loc=<locationId>
  useEffect(() => {
    const loc = new URLSearchParams(window.location.search).get('loc'); if (!loc || !base.data) return;
    (async () => { for (const m of base.data!.maps) { const f = (await repo.listMarkers(id, m.id)).find(x => x.locationId === loc); if (f) { setMapId(m.id); setSel(f.id); return; } } })();
  }, [base.data?.maps.length, id]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <main className="page"><Async s={base} empty="Нет карт.">{({ maps, locs, c, m }) => {
      const map = maps.find(x => x.id === curId) ?? maps[0];
      const markers = (mk.data ?? []).filter(x => filter === 'all' || x.kind === filter);
      const selMarker = (mk.data ?? []).find(x => x.id === sel), selLoc = locs.find(l => l.id === selMarker?.locationId);
      const canAdd = can(m, c, 'add_markers');
      return (<>
        <div className="row"><select value={map.id} onChange={e => { setMapId(e.target.value); setSel(undefined); }}>{maps.map(x => <option key={x.id} value={x.id}>{x.parentMapId ? '↳ ' : ''}{x.name}</option>)}</select>
          <select value={filter} onChange={e => setFilter(e.target.value as MarkerKind | 'all')}><option value="all">Все типы</option>{KINDS.map(k => <option key={k}>{k}</option>)}</select>
          {map.parentMapId && <button onClick={() => { setMapId(map.parentMapId!); setSel(undefined); }}>↑ К родительской карте</button>}
          {canAdd && <button className={adding ? 'pri' : ''} onClick={() => setAdding(a => !a)}>{adding ? 'Тапните по карте' : '+ Точка'}</button>}</div>
        {err && <p className="err" role="alert">{err}</p>}
        <MapView key={map.id} map={map} markers={markers} selectedId={sel} addMode={adding} onSelect={x => { setSel(x.id); setEd(null); }} onAdd={(x, y) => { setAddAt({ x, y }); setAdding(false); }} />
        {addAt && <form className="card" onSubmit={e => { e.preventDefault(); run(async () => { await repo.addMarker(id, { mapId: map.id, ...addAt, name: name || 'Новая точка', kind, status: 'unknown', description: '' }); setAddAt(null); setName(''); }); }}>
          <b>Новая точка ({addAt.x.toFixed(2)}, {addAt.y.toFixed(2)})</b><input placeholder="Название" value={name} onChange={e => setName(e.target.value)} />
          <select value={kind} onChange={e => setKind(e.target.value as MarkerKind)}>{KINDS.map(k => <option key={k}>{k}</option>)}</select>
          <div className="row"><button className="pri" type="submit">Добавить</button><button type="button" onClick={() => setAddAt(null)}>Отмена</button></div></form>}
        {selMarker && selLoc && <div className="card">
          {ed ? <form onSubmit={e => { e.preventDefault(); run(async () => { await repo.updateLocation(id, selLoc.id, { name: ed.name.trim() || selLoc.name, description: ed.description, kind: ed.kind }); if (can(m, c, 'manage_maps') && ed.secret !== selMarker.secret) await repo.setMarkerSecret(id, selMarker.id, ed.secret); setEd(null); }); }}>
            <input value={ed.name} onChange={e => setEd({ ...ed, name: e.target.value })} /><textarea rows={3} value={ed.description} onChange={e => setEd({ ...ed, description: e.target.value })} />
            <select value={ed.kind} onChange={e => setEd({ ...ed, kind: e.target.value as MarkerKind })}>{KINDS.map(k => <option key={k}>{k}</option>)}</select>
            {can(m, c, 'manage_maps') && <select value={ed.secret ? 'secret' : 'all'} onChange={e => setEd({ ...ed, secret: e.target.value === 'secret' })}><option value="all">Видна всем</option><option value="secret">Секретная (только мастер)</option></select>}
            <div className="row"><button className="pri" type="submit">Сохранить</button><button type="button" onClick={() => setEd(null)}>Отмена</button></div></form>
          : <><h3>{selLoc.name}</h3><p>{selLoc.description || 'Описания пока нет.'}</p><Badge>{selLoc.kind}</Badge><Badge>{selLoc.status}</Badge>{selMarker.secret && <Badge>секрет</Badge>}
            <Related c={id} type="location" id={selLoc.id} />
            {selMarker.childMapId && <button onClick={() => { setMapId(selMarker.childMapId!); setSel(undefined); }}>Открыть вложенную карту</button>}
            <div className="row" style={{ margin: '8px 0' }}>
              {can(m, c, 'edit_markers') && <><button onClick={() => setEd({ name: selLoc.name, description: selLoc.description, kind: selLoc.kind, secret: selMarker.secret })}>Изменить</button>
                <select value={selLoc.status} onChange={e => run(() => repo.updateLocation(id, selLoc.id, { status: e.target.value as ExploreStatus }))}>{['unknown', 'rumored', 'visited', 'cleared'].map(s => <option key={s}>{s}</option>)}</select></>}
              {can(m, c, 'delete_markers') && <button className="dng" onClick={() => run(async () => { await repo.deleteMarker(id, selMarker.id); setSel(undefined); })}>Удалить</button>}</div>
            <Notes c={id} locationId={selLoc.id} canAdd={can(m, c, 'edit_shared')} canDel={can(m, c, 'delete_records')} /></>}</div>}
        <h3>Точки на карте</h3>
        {markers.length === 0 ? <p className="muted">На этой карте нет точек{filter !== 'all' ? ' выбранного типа' : ''}.</p> : markers.map(x => { const l = locs.find(q => q.id === x.locationId); return <button key={x.id} className="card" style={{ width: '100%', textAlign: 'left' }} onClick={() => { setSel(x.id); setEd(null); }}>{l?.name} <Badge>{x.kind}</Badge></button>; })}
        <div className="card"><Notes c={id} locationId={null} canAdd={can(m, c, 'edit_shared')} canDel={can(m, c, 'delete_records')} /></div>
      </>);
    }}</Async></main>
  );
}
