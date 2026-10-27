'use client';
import { useEffect, useState, type ReactNode } from 'react';
export interface Field { key: string; label: string; type?: 'text' | 'area' | 'select' | 'number'; options?: string[] }
export type V = Record<string, string>;
interface P<T extends { id: string }> { items: T[]; fields: Field[]; blank: V; toValues(i: T): V; render(i: T): ReactNode; canEdit: boolean; canDelete: boolean; addLabel: string; empty: string; onSave(v: V, id?: string): Promise<void>; onDelete(id: string): Promise<void> }
export default function Crud<T extends { id: string }>(p: P<T>) {
  const [ed, setEd] = useState<{ id?: string; v: V } | null>(null), [err, setErr] = useState('');
  useEffect(() => { const h = location.hash.slice(1); if (h) document.getElementById(h)?.scrollIntoView({ block: 'center' }); }, [p.items.length]);
  const run = async (f: () => Promise<void>, close = true) => { try { setErr(''); await f(); if (close) setEd(null); } catch (e) { setErr((e as Error).message); } };
  return (<>
    {err && <p className="err" role="alert">{err}</p>}
    {p.canEdit && !ed && <button className="pri" onClick={() => setEd({ v: p.blank })}>{p.addLabel}</button>}
    {!p.canEdit && <p className="muted">Редактирование недоступно (роль или архив).</p>}
    {ed && <form className="card" onSubmit={e => { e.preventDefault(); run(() => p.onSave(ed.v, ed.id)); }}>
      {p.fields.map(f => <label key={f.key}>{f.label}
        {f.type === 'area' ? <textarea rows={4} value={ed.v[f.key] ?? ''} onChange={e => setEd({ ...ed, v: { ...ed.v, [f.key]: e.target.value } })} />
          : f.type === 'select' ? <select value={ed.v[f.key]} onChange={e => setEd({ ...ed, v: { ...ed.v, [f.key]: e.target.value } })}>{f.options!.map(o => <option key={o}>{o}</option>)}</select>
          : <input type={f.type === 'number' ? 'number' : 'text'} required={f.key === p.fields[0].key} value={ed.v[f.key] ?? ''} onChange={e => setEd({ ...ed, v: { ...ed.v, [f.key]: e.target.value } })} />}</label>)}
      <div className="row"><button className="pri" type="submit">Сохранить</button><button type="button" onClick={() => setEd(null)}>Отмена</button></div></form>}
    {p.items.length === 0 ? <p className="muted">{p.empty}</p> : p.items.map(i => (
      <div key={i.id} id={i.id} className="card">{p.render(i)}
        {(p.canEdit || p.canDelete) && <div className="row" style={{ marginTop: 8 }}>
          {p.canEdit && <button onClick={() => setEd({ id: i.id, v: p.toValues(i) })}>Изменить</button>}
          {p.canDelete && <button className="dng" onClick={() => confirm('Удалить запись?') && run(() => p.onDelete(i.id), false)}>Удалить</button>}</div>}
      </div>))}
  </>);
}
