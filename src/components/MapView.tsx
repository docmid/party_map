'use client';
import { useRef, useState } from 'react';
import type { GameMap, Marker } from '@/domain/types';
// Presentation only. Normalized coords as % of the image box: zoom never moves markers. Fog layer would plug into `overlay`.
interface Props { map: GameMap; markers: Marker[]; selectedId?: string; addMode?: boolean; onSelect(m: Marker): void; onAdd(x: number, y: number): void; overlay?: React.ReactNode }
const ICON: Record<string, string> = { city: '🏰', dungeon: '🕳', ruin: '🏚', camp: '⛺', poi: '📍' };
export default function MapView({ map, markers, selectedId, addMode, onSelect, onAdd, overlay }: Props) {
  const [t, setT] = useState({ s: 1, x: 0, y: 0 });
  const ptrs = useRef(new Map<number, { x: number; y: number }>()), pinch = useRef(0), moved = useRef(0), box = useRef<HTMLDivElement>(null);
  const zoom = (k: number) => setT(o => ({ ...o, s: Math.min(5, Math.max(1, o.s * k)) }));
  const img = map.original; // stage 1: no role-based image variant yet
  return (
    <div className="mapwrap">
      <div className="mapctl"><button aria-label="Приблизить" onClick={() => zoom(1.4)}>+</button><button aria-label="Отдалить" onClick={() => zoom(1 / 1.4)}>−</button><button aria-label="Сбросить" onClick={() => setT({ s: 1, x: 0, y: 0 })}>⌂</button></div>
      <div className="mapview" style={{ aspectRatio: `${img.width}/${img.height}`, touchAction: 'none' }}
        onPointerDown={e => { ptrs.current.set(e.pointerId, { x: e.clientX, y: e.clientY }); if (ptrs.current.size === 1) moved.current = 0; else moved.current = 99; e.currentTarget.setPointerCapture(e.pointerId); }}
        onPointerMove={e => { const prev = ptrs.current.get(e.pointerId); if (!prev) return; ptrs.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
          if (ptrs.current.size === 2) { const [a, b] = [...ptrs.current.values()]; const d = Math.hypot(a.x - b.x, a.y - b.y); if (pinch.current) zoom(d / pinch.current); pinch.current = d; }
          else { const dx = e.clientX - prev.x, dy = e.clientY - prev.y; moved.current += Math.abs(dx) + Math.abs(dy); setT(o => ({ ...o, x: o.x + dx, y: o.y + dy })); } }}
        onPointerUp={e => { const had = ptrs.current.delete(e.pointerId); pinch.current = 0; if (had && ptrs.current.size === 0 && moved.current <= 3 && addMode && box.current) { const r = box.current.getBoundingClientRect(); const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height; if (x >= 0 && x <= 1 && y >= 0 && y <= 1) onAdd(x, y); } }}
        onPointerCancel={e => { ptrs.current.delete(e.pointerId); pinch.current = 0; }}
        onWheel={e => zoom(e.deltaY < 0 ? 1.15 : 1 / 1.15)}>
        <div ref={box} className="mapinner" style={{ transform: `translate(${t.x}px,${t.y}px) scale(${t.s})` }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={img.url} alt={map.name} draggable={false} />
          {overlay}
          {markers.map(m => (
            <button key={m.id} className={'mk' + (m.id === selectedId ? ' sel' : '')} style={{ left: `${m.x * 100}%`, top: `${m.y * 100}%`, transform: `translate(-50%,-50%) scale(${1 / t.s})` }}
              onPointerDown={e => e.stopPropagation()} onClick={() => onSelect(m)} aria-label={m.kind}>{ICON[m.kind]}</button>
          ))}
        </div>
      </div>
    </div>
  );
}
