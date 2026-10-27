import { Badge } from '@/components/ui';
import { repo } from '@/hooks/useAtlas';
import type { Quest } from '@/domain/types';
import type { RecordsConfig } from '../RecordsPage';
export const questsCfg: RecordsConfig<Quest> = {
  title: 'Задания', type: 'quest', addLabel: '+ Задание', empty: 'Заданий пока нет.', load: (r, c) => r.listQuests(c),
  fields: [{ key: 'title', label: 'Название' }, { key: 'summary', label: 'Описание', type: 'area' }, { key: 'status', label: 'Статус', type: 'select', options: ['active', 'completed', 'failed'] }],
  blank: () => ({ title: '', summary: '', status: 'active' }), toValues: i => ({ title: i.title, summary: i.summary, status: i.status }),
  render: i => <><h3>{i.title}</h3><p>{i.summary}</p><Badge>{i.status}</Badge></>,
  save: (c, v, _, id) => repo.saveQuest(c, { id, title: v.title.trim(), summary: v.summary, status: v.status as Quest['status'] }), remove: (c, id) => repo.deleteQuest(c, id),
};
