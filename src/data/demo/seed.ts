import type * as T from '@/domain/types';
const now = '2026-10-26T12:00:00Z';
const img = (a: string, b: string, t: string) => 'data:image/svg+xml;utf8,' + encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="700"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs><rect width="1000" height="700" fill="url(#g)"/><path d="M0 500 Q250 400 450 480 T1000 420 V700 H0Z" fill="#0003"/><text x="30" y="60" font-size="34" fill="#fff8" font-family="serif">${t}</text></svg>`);
type L = [string, string, T.MarkerKind, T.ExploreStatus, number, number, string, string | null, boolean?];
interface D { maps: [string, string, string | null, string, string][]; locs: L[]; quests: [string, string, T.Quest['status']][]; npcs: [string, string, string, T.Npc['attitude']][]; chron: [string, string][] }
function world(c: string, p: string, d: D) {
  const maps = d.maps.map((m): T.GameMap => { const v = { kind: 'original' as const, url: img(m[3], m[4], m[1]), width: 1000, height: 700 }; return { id: `${p}-map-${m[0]}`, campaignId: c, name: m[1], parentMapId: m[2] ? `${p}-map-${m[2]}` : null, original: v, playerSafe: { ...v, kind: 'player_safe' } }; });
  const locations: T.Location[] = [], markers: T.Marker[] = [];
  d.locs.forEach((l, i) => {
    locations.push({ id: `${p}-loc-${i}`, campaignId: c, name: l[0], description: l[1], kind: l[2], status: l[3] });
    markers.push({ id: `${p}-mk-${i}`, campaignId: c, mapId: `${p}-map-${l[6]}`, locationId: `${p}-loc-${i}`, x: l[4], y: l[5], kind: l[2], childMapId: l[7] ? `${p}-map-${l[7]}` : null, secret: l[8] ?? false });
  });
  const quests = d.quests.map((q, i): T.Quest => ({ id: `${p}-q-${i}`, campaignId: c, title: q[0], summary: q[1], status: q[2] }));
  const npcs = d.npcs.map((n, i): T.Npc => ({ id: `${p}-npc-${i}`, campaignId: c, name: n[0], role: n[1], description: n[2], attitude: n[3] }));
  const chronicle = d.chron.map((e, i): T.ChronicleEntry => ({ id: `${p}-ch-${i}`, campaignId: c, session: i + 1, title: e[0], text: e[1], date: `2026-0${i + 6}-1${i}` }));
  const L = (id: string, f: T.EntityType, fi: string, t: T.EntityType, ti: string, label: string): T.EntityLink => ({ id: `${p}-${id}`, campaignId: c, from: { type: f, id: `${p}-${fi}` }, to: { type: t, id: `${p}-${ti}` }, label });
  const links = [L('ln0', 'npc', 'npc-0', 'location', 'loc-0', 'живёт в'), L('ln1', 'quest', 'q-0', 'location', 'loc-1', 'ведёт в'), L('ln2', 'chronicle', 'ch-0', 'npc', 'npc-0', 'упоминает')];
  const notes: T.Note[] = [{ id: `${p}-n0`, campaignId: c, authorId: 'u-demo', locationId: `${p}-loc-0`, text: `Расспросить местных про «${d.locs[0][0]}».`, createdAt: now }, { id: `${p}-n1`, campaignId: c, authorId: 'u-other', locationId: null, text: 'Общая заметка кампании: не забыть про награды за задания.', createdAt: now }];
  return { maps, locations, markers, quests, npcs, chronicle, links, notes };
}
const C = (id: string, name: string, description: string, status: T.CampaignStatus): T.Campaign => ({ id, name, description, coverImage: '', status, createdAt: now, updatedAt: now });
export const CAMPAIGNS = [C('camp-ember', 'Пепел Эмбервуда', 'Лесное королевство, культ огня и пропавший принц.', 'active'), C('camp-tide', 'Проклятие Сольмара', 'Морская кампания: острова, контрабандисты, левиафан.', 'active'), C('camp-old', 'Забытый курган', 'Завершённая короткая кампания.', 'archived')];
const M = (id: string, c: string, role: T.Role): T.CampaignMember => ({ id, campaignId: c, userId: 'u-demo', displayName: 'Вы', role });
export const MEMBERS = [M('m1', 'camp-ember', 'gm'), M('m2', 'camp-tide', 'player'), M('m3', 'camp-old', 'owner'), { id: 'm4', campaignId: 'camp-ember', userId: 'u-anya', displayName: 'Аня', role: 'player' }, { id: 'm5', campaignId: 'camp-ember', userId: 'u-igor', displayName: 'Игорь', role: 'owner' }, { id: 'm6', campaignId: 'camp-tide', userId: 'u-igor', displayName: 'Игорь', role: 'gm' }];
export const WORLDS: Record<string, ReturnType<typeof world>> = {
  'camp-ember': world('camp-ember', 'em', {
    maps: [['w', 'Королевство Эмбервуд', null, '#2f5d46', '#14301f'], ['t', 'Город Карамир', 'w', '#6b5a3c', '#2b2418']],
    locs: [['Карамир', 'Торговый город у реки.', 'city', 'visited', 0.32, 0.45, 'w', 't'], ['Пещеры Угля', 'Логово культа огня.', 'dungeon', 'rumored', 0.7, 0.3, 'w', null], ['Башня Сэра', 'Заброшенная сторожевая башня.', 'ruin', 'cleared', 0.55, 0.7, 'w', null], ['Тайник культа', 'Скрытый склад (виден только мастеру).', 'dungeon', 'unknown', 0.82, 0.62, 'w', null, true], ['Рынок', 'Шумный центр Карамира.', 'poi', 'visited', 0.5, 0.5, 't', null]],
    quests: [['Найти принца Элвина', 'Следы ведут к Пещерам Угля.', 'active'], ['Очистить башню Сэра', 'Гоблины изгнаны.', 'completed']],
    npcs: [['Мира Тенн', 'Трактирщица', 'Знает всех в Карамире.', 'ally'], ['Брат Касс', 'Жрец культа', 'Фанатик огня.', 'hostile']],
    chron: [['Прибытие в Карамир', 'Партия встретила Миру и узнала об исчезновении принца.'], ['Битва у башни', 'Гоблины разбиты, найдена карта пещер.']] }),
  'camp-tide': world('camp-tide', 'ti', {
    maps: [['w', 'Архипелаг Сольмар', null, '#1d4e6b', '#0a1f33'], ['p', 'Порт Ржавый Якорь', 'w', '#4a5a66', '#1b242b']],
    locs: [['Ржавый Якорь', 'Порт контрабандистов.', 'city', 'visited', 0.25, 0.6, 'w', 'p'], ['Риф Левиафана', 'Тут тонут корабли.', 'poi', 'unknown', 0.78, 0.2, 'w', null], ['Остров Чаек', 'Лагерь выживших.', 'camp', 'rumored', 0.6, 0.55, 'w', null], ['Склад «Угорь»', 'Тайный склад.', 'dungeon', 'visited', 0.4, 0.4, 'p', null]],
    quests: [['Груз для капитана Вэйла', 'Доставить ящики на Остров Чаек.', 'active'], ['Разгадать карту рифа', 'Карта — подделка.', 'failed'], ['Спасти матроса', 'Матрос вернулся в порт.', 'completed']],
    npcs: [['Капитан Вэйл', 'Контрабандист', 'Хитрый, но держит слово.', 'neutral'], ['Орла', 'Картограф', 'Продаёт карты и слухи.', 'ally']],
    chron: [['Шторм у Сольмара', 'Корабль партии выброшен в порт.'], ['Сделка с Вэйлом', 'Партия согласилась на опасный груз.']] }),
  'camp-old': world('camp-old', 'ol', {
    maps: [['w', 'Земли кургана', null, '#5b4b6b', '#241b2b']],
    locs: [['Курган', 'Могила древнего вождя.', 'ruin', 'cleared', 0.5, 0.5, 'w', null], ['Деревня Мох', 'Начало приключения.', 'city', 'visited', 0.2, 0.7, 'w', null]],
    quests: [['Запечатать курган', 'Печать установлена.', 'completed']],
    npcs: [['Старуха Хилда', 'Знахарка', 'Хранит предания.', 'ally']],
    chron: [['Печать', 'Курган запечатан, кампания завершена.']] }),
};
