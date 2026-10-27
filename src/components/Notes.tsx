'use client';
import { useState } from 'react';
import { repo, useData } from '@/hooks/useAtlas';
export default function Notes({ c, locationId, canAdd, canDel }: { c: string; locationId: string | null; canAdd: boolean; canDel: boolean }) {
  const s = useData(r => r.listNotes(c), [c]); const [t, setT] = useState(''), [err, setErr] = useState('');
  const list = (s.data ?? []).filter(n => n.locationId === locationId);
  const go = async (f: () => Promise<void>) => { try { setErr(''); await f(); } catch (e) { setErr((e as Error).message); } };
  return <div><b>Заметки</b>{err && <p className="err">{err}</p>}{list.length === 0 && <p className="muted">Заметок нет.</p>}
    {list.map(n => <p key={n.id}>• {n.text} {canDel && <button onClick={() => go(() => repo.deleteNote(c, n.id))} aria-label="Удалить заметку">✕</button>}</p>)}
    {canAdd && <div className="row"><input style={{ flex: 1 }} placeholder="Новая заметка" value={t} onChange={e => setT(e.target.value)} /><button onClick={() => t.trim() && go(async () => { await repo.saveNote(c, { locationId, text: t.trim() }); setT(''); })}>Добавить</button></div>}</div>;
}
