import type { AtlasRepository } from '../repository';
import type * as T from '@/domain/types';
import { CAMPAIGNS, MEMBERS, WORLDS } from './seed';
// In-memory, per-session; resets on reload. NOT persistence, NOT sync, NOT security.
const uid = (p: string) => `${p}-${Math.random().toString(36).slice(2, 10)}`;
const delay = <V,>(v: V) => new Promise<V>(r => setTimeout(() => r(structuredClone(v)), 100));
const campaigns = structuredClone(CAMPAIGNS), members = structuredClone(MEMBERS), worlds = structuredClone(WORLDS);
const subs = new Set<() => void>(); let version = 0;
const bump = () => { version++; subs.forEach(f => f()); };
const w = (c: T.Id) => { const x = worlds[c]; if (!x) throw new Error(`Кампания ${c} не найдена`); return x; };
const writable = (c: T.Id) => { if (campaigns.find(k => k.id === c)?.status === 'archived') throw new Error('Кампания в архиве: изменения недоступны'); };
type Coll = 'quests' | 'npcs' | 'chronicle' | 'notes';
// Demo-level filter in the DATA layer (not UI): players never receive secret markers. Real protection = server/RLS.
const hidden = (c: T.Id) => { const me = members.find(m => m.campaignId === c && m.userId === 'u-demo'); return new Set(me && me.role !== 'player' ? [] : w(c).markers.filter(m => m.secret).map(m => m.locationId)); };
function upsert(c: T.Id, k: Coll, rec: { id?: T.Id }, prefix: string) {
  writable(c); const list = w(c)[k] as { id: T.Id; campaignId: T.Id }[];
  const i = rec.id ? list.findIndex(x => x.id === rec.id) : -1;
  if (i >= 0) list[i] = { ...rec, id: rec.id!, campaignId: c } as (typeof list)[number];
  else list.push({ ...rec, id: uid(prefix), campaignId: c } as (typeof list)[number]);
  bump();
}
function remove(c: T.Id, k: Coll, id: T.Id) { writable(c); const W = w(c); (W as unknown as Record<Coll, { id: T.Id }[]>)[k] = (W[k] as { id: T.Id }[]).filter(x => x.id !== id); W.links = W.links.filter(l => l.from.id !== id && l.to.id !== id); bump(); }
export const demoRepo: AtlasRepository = {
  subscribe: cb => { subs.add(cb); return () => { subs.delete(cb); }; },
  getVersion: () => version,
  listCampaigns: () => delay(campaigns),
  async createCampaign(i) {
    const id = uid('camp'), t = new Date().toISOString();
    const c: T.Campaign = { id, name: i.name, description: i.description, coverImage: '', status: 'active', createdAt: t, updatedAt: t };
    campaigns.push(c); members.push({ id: uid('m'), campaignId: id, userId: 'u-demo', displayName: 'Вы', role: 'owner' });
    const v = structuredClone(WORLDS['camp-ember'].maps[0].original);
    worlds[id] = { maps: [{ id: `${id}-map`, campaignId: id, name: 'Первая карта', parentMapId: null, original: v, playerSafe: null }], locations: [], markers: [], notes: [], quests: [], npcs: [], chronicle: [], links: [] };
    bump(); return c;
  },
  async setCampaignStatus(id, s) { const c = campaigns.find(k => k.id === id); if (c) { c.status = s; c.updatedAt = new Date().toISOString(); } bump(); },
  getMember: c => delay(members.find(m => m.campaignId === c && m.userId === 'u-demo')),
  listMaps: c => delay(w(c).maps),
  listLocations: c => delay(w(c).locations.filter(l => !hidden(c).has(l.id))),
  listMarkers: (c, mapId) => delay(w(c).markers.filter(m => m.mapId === mapId && !hidden(c).has(m.locationId))),
  async addMarker(c, i) {
    writable(c); const lid = uid('loc'), W = w(c);
    W.locations.push({ id: lid, campaignId: c, name: i.name, description: i.description, kind: i.kind, status: i.status });
    W.markers.push({ id: uid('mk'), campaignId: c, mapId: i.mapId, locationId: lid, x: i.x, y: i.y, kind: i.kind, childMapId: null, secret: false }); bump();
  },
  async updateLocation(c, id, patch) {
    writable(c); const l = w(c).locations.find(x => x.id === id); if (!l) throw new Error('Локация не найдена');
    Object.assign(l, patch); const k = patch.kind; if (k) w(c).markers.filter(m => m.locationId === id).forEach(m => { m.kind = k; }); bump();
  },
  async deleteMarker(c, id) { writable(c); const W = w(c); const m = W.markers.find(x => x.id === id); W.markers = W.markers.filter(x => x.id !== id); if (m) W.locations = W.locations.filter(l => l.id !== m.locationId); bump(); },
  async saveQuest(c, q) { upsert(c, 'quests', q, 'q'); },
  async deleteQuest(c, id) { remove(c, 'quests', id); },
  async saveNpc(c, n) { upsert(c, 'npcs', n, 'npc'); },
  async deleteNpc(c, id) { remove(c, 'npcs', id); },
  async saveChronicle(c, e) { upsert(c, 'chronicle', e, 'ch'); },
  async deleteChronicle(c, id) { remove(c, 'chronicle', id); },
  async listNotes(c) { return structuredClone(w(c).notes.filter(n => !n.locationId || !hidden(c).has(n.locationId))); },
  async saveNote(c, n) { const rec = { ...n, authorId: 'u-demo', createdAt: new Date().toISOString() }; upsert(c, 'notes', rec, 'n'); },
  async deleteNote(c, id) { remove(c, 'notes', id); },
  listMembers: c => delay(members.filter(m => m.campaignId === c)),
  async setDemoRole(c, role) { const m = members.find(x => x.campaignId === c && x.userId === 'u-demo'); if (m) m.role = role; bump(); },
  async setMarkerSecret(c, id, secret) { writable(c); const m = w(c).markers.find(x => x.id === id); if (m) m.secret = secret; bump(); },
  listQuests: c => delay(w(c).quests), listNpcs: c => delay(w(c).npcs), listChronicle: c => delay(w(c).chronicle), listLinks: c => delay(w(c).links),
};
