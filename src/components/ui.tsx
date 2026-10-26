'use client';
import type { ReactNode } from 'react';
export function Async<T>({ s, empty, children }: { s: { data?: T; error?: string; loading: boolean }; empty?: string; children: (d: T) => ReactNode }) {
  if (s.loading) return <p className="muted">Загрузка…</p>;
  if (s.error) return <p className="err" role="alert">Ошибка: {s.error}</p>;
  if (Array.isArray(s.data) && s.data.length === 0) return <p className="muted">{empty ?? 'Пока пусто.'}</p>;
  return <>{children(s.data as T)}</>;
}
export const Badge = ({ children }: { children: ReactNode }) => <span className="badge">{children}</span>;
