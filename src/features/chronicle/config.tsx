import { repo } from '@/hooks/useAtlas';
import type { ChronicleEntry } from '@/domain/types';
import type { RecordsConfig } from '../RecordsPage';
export const chronicleCfg: RecordsConfig<ChronicleEntry> = {
  title: 'Хроника', type: 'chronicle', addLabel: '+ Запись', empty: 'Записей пока нет.', load: (r, c) => r.listChronicle(c), sort: (a, b) => b.session - a.session,
  fields: [{ key: 'title', label: 'Заголовок' }, { key: 'session', label: 'Номер сессии', type: 'number' }, { key: 'text', label: 'Что произошло', type: 'area' }],
  blank: items => ({ title: '', session: String(Math.max(0, ...items.map(i => i.session)) + 1), text: '' }), toValues: i => ({ title: i.title, session: String(i.session), text: i.text }),
  render: i => <><h3>Сессия {i.session}: {i.title}</h3><p>{i.text}</p><span className="muted">{i.date}</span></>,
  save: (c, v, items, id) => repo.saveChronicle(c, { id, title: v.title.trim(), session: Number(v.session) || 1, text: v.text, date: items.find(i => i.id === id)?.date ?? new Date().toISOString().slice(0, 10) }), remove: (c, id) => repo.deleteChronicle(c, id),
};
