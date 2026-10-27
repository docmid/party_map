'use client';
import { useParams } from 'next/navigation';
import { Async, Badge } from '@/components/ui';
import { loadAccess, repo, useData } from '@/hooks/useAtlas';
import { ROLE_PERMISSIONS } from '@/permissions/can';
import type { Role } from '@/domain/types';
export default function Settings() {
  const { id } = useParams<{ id: string }>();
  const s = useData(async r => ({ members: await r.listMembers(id), ...(await loadAccess(r, id)) }), [id]);
  return <main className="page"><h1>Участники и доступ</h1>
    <Async s={s}>{({ members, m }) => (<>
      {members.map(x => <div key={x.id} className="card">{x.displayName} <Badge>{x.role}</Badge></div>)}
      <button disabled title="Нужен backend">Пригласить участника (недоступно в демо)</button>
      <p className="muted">Приглашения и управление ролями появятся вместе с авторизацией. Сейчас это только заглушка.</p>
      <h3>Права ролей (справочно)</h3>
      {(Object.keys(ROLE_PERMISSIONS) as Role[]).map(r => <p key={r}><b>{r}</b>: {ROLE_PERMISSIONS[r].join(', ')}</p>)}
      <h3>Демо: сменить свою роль</h3>
      <select value={m?.role} onChange={e => repo.setDemoRole(id, e.target.value as Role)}>{['owner', 'gm', 'player'].map(r => <option key={r}>{r}</option>)}</select>
      <p className="muted">Только для проверки интерфейса. В реальной версии роль назначает сервер.</p></>)}</Async></main>;
}
