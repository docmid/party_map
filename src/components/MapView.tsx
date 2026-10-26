'use client';
import { useRef, useState } from 'react';
import type { GameMap, Marker } from '@/domain/types';
// Presentation only. Markers use normalized coords as % of the image box, so zoom never moves them.
// A future fog layer plugs in via `overlay` without touching this component.
interface Props { map: GameMap; markers: Marker[]; selectedId?: string; addMode?: boolean; onSelect(m: Marker): void; onAdd(x: number, y: number): void; overlay?: React.ReactNode }
const ICON: Record<string, string> = { city: '🏰', dungeon: '🕳', ruin: '🏚', camp: '⛺', poi: '📍' };
export default function MapView({ map, markers, selectedId, addMode, onSelect, onAdd, overlay }: Props) {
  const [t, setT] = useState({ s: 1, x: 0, y: 0 });
  const drag = useRef<{ px: number; py: number; moved: boolean } | null>(null);
  const box = useRef<HTMLDivElement>(null);
  const zoom = (k: number) => setT(o => ({ ...o, s: Math.min(5, Math.max(1, o.s * k)) }));
  const img = map.original; // stage 1: no role-based variant selection
  return (
    <div className="mapwrap">
      <div className="mapctl"><button aria-label="Приблизить" onClick={() => zoom(1.4)}>+</button><button aria-label="Отдалить" onClick={() => zoom(1 / 1.4)}>−</button><button aria-label="Сбросить" onClick={() => setT({ s: 1, x: 0, y: 0 })}>⌂</button></div>
      <div className="mapview" style={{ aspectRatio: `${img.width}/${img.height}`, touchAction: 'none' }}
        onPointerDown={e => { drag.current = { px: e.clientX, py: e.clientY, moved: false }; e.currentTarget.setPointerCapture(e.pointerId); }}
        onPointerMove={e => { const d = drag.current; if (!d) return; const dx = e.clientX - d.px, dy = e.clientY - d.py; if (Math.abs(dx) + Math.abs(dy) > 3) d.moved = true; d.px = e.clientX; d.py = e.clientY; setT(o => ({ ...o, x: o.x + dx, y: o.y + dy })); }}
        onPointerUp={e => { const d = drag.current; drag.current = null; if (d && !d.moved && addMode && box.current) { const r = box.current.getBoundingClientRect(); const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height; if (x >= 0 && x <= 1 && y >= 0 && y <= 1) onAdd(x, y); } }}
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
