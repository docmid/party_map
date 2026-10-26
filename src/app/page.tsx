'use client';
import Link from 'next/link';
import { useState } from 'react';
import { Async, Badge } from '@/components/ui';
import { repo, useData } from '@/hooks/useAtlas';
export default function Campaigns() {
  const s = useData(r => r.listCampaigns());
  const [name, setName] = useState(''), [desc, setDesc] = useState('');
  return (
    <main className="page">
      <h1>Ваши кампании</h1>
      <p className="muted">Демо-режим: данные хранятся в памяти и сбрасываются при перезагрузке. Авторизации и серверной защиты нет.</p>
      <Async s={s} empty="Кампаний нет. Создайте первую ниже.">{cs => cs.map(c => (
        <Link key={c.id} href={`/c/${c.id}/map`} className="card"><h3>{c.name}</h3><p>{c.description}</p><Badge>{c.status === 'active' ? 'активная' : 'архив'}</Badge></Link>))}</Async>
      <h2>Новая кампания</h2>
      <form onSubmit={async e => { e.preventDefault(); if (!name.trim()) return; await repo.createCampaign({ name: name.trim(), description: desc.trim() }); setName(''); setDesc(''); }}>
        <input placeholder="Название" value={name} onChange={e => setName(e.target.value)} />
        <textarea placeholder="Описание" value={desc} onChange={e => setDesc(e.target.value)} />
        <button className="pri" type="submit">Создать кампанию</button>
      </form>
    </main>
  );
}
