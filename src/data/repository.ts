import type * as T from '@/domain/types';
export type Draft<E> = Omit<E, 'id' | 'campaignId'> & { id?: T.Id };
// A future Supabase implementation must satisfy this. Every call is scoped by campaignId.
export interface AtlasRepository {
  subscribe(cb: () => void): () => void;
  getVersion(): number;
  listCampaigns(): Promise<T.Campaign[]>;
  createCampaign(i: { name: string; description: string }): Promise<T.Campaign>;
  setCampaignStatus(id: T.Id, s: T.CampaignStatus): Promise<void>;
  getMember(campaignId: T.Id): Promise<T.CampaignMember | undefined>;
  listMaps(c: T.Id): Promise<T.GameMap[]>;
  listLocations(c: T.Id): Promise<T.Location[]>;
  listMarkers(c: T.Id, mapId: T.Id): Promise<T.Marker[]>;
  addMarker(c: T.Id, i: { mapId: T.Id; x: number; y: number; name: string; kind: T.MarkerKind; status: T.ExploreStatus; description: string }): Promise<void>;
  updateLocation(c: T.Id, id: T.Id, patch: Partial<Pick<T.Location, 'name' | 'description' | 'status' | 'kind'>>): Promise<void>;
  deleteMarker(c: T.Id, markerId: T.Id): Promise<void>;
  listQuests(c: T.Id): Promise<T.Quest[]>;
  listNpcs(c: T.Id): Promise<T.Npc[]>;
  listChronicle(c: T.Id): Promise<T.ChronicleEntry[]>;
  saveQuest(c: T.Id, q: Draft<T.Quest>): Promise<void>;
  deleteQuest(c: T.Id, id: T.Id): Promise<void>;
  saveNpc(c: T.Id, n: Draft<T.Npc>): Promise<void>;
  deleteNpc(c: T.Id, id: T.Id): Promise<void>;
  saveChronicle(c: T.Id, e: Draft<T.ChronicleEntry>): Promise<void>;
  deleteChronicle(c: T.Id, id: T.Id): Promise<void>;
  listNotes(c: T.Id): Promise<T.Note[]>;
  saveNote(c: T.Id, n: { id?: T.Id; locationId: T.Id | null; text: string }): Promise<void>;
  deleteNote(c: T.Id, id: T.Id): Promise<void>;
  listMembers(c: T.Id): Promise<T.CampaignMember[]>;
  /** DEMO ONLY: lets you test role-dependent UI. Real roles come from the server. */
  setDemoRole(c: T.Id, role: T.Role): Promise<void>;
  setMarkerSecret(c: T.Id, markerId: T.Id, secret: boolean): Promise<void>;
  listLinks(c: T.Id): Promise<T.EntityLink[]>;
}
