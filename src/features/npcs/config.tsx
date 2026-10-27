import { Badge } from '@/components/ui';
import { repo } from '@/hooks/useAtlas';
import type { Npc } from '@/domain/types';
import type { RecordsConfig } from '../RecordsPage';
export const npcsCfg: RecordsConfig<Npc> = {
  title: 'NPC', type: 'npc', addLabel: '+ NPC', empty: 'Персонажей пока нет.', load: (r, c) => r.listNpcs(c),
  fields: [{ key: 'name', label: 'Имя' }, { key: 'role', label: 'Роль' }, { key: 'description', label: 'Описание', type: 'area' }, { key: 'attitude', label: 'Отношение', type: 'select', options: ['ally', 'neutral', 'hostile'] }],
  blank: () => ({ name: '', role: '', description: '', attitude: 'neutral' }), toValues: i => ({ name: i.name, role: i.role, description: i.description, attitude: i.attitude }),
  render: i => <><h3>{i.name}</h3><p className="muted">{i.role}</p><p>{i.description}</p><Badge>{i.attitude}</Badge></>,
  save: (c, v, _, id) => repo.saveNpc(c, { id, name: v.name.trim(), role: v.role, description: v.description, attitude: v.attitude as Npc['attitude'] }), remove: (c, id) => repo.deleteNpc(c, id),
};
