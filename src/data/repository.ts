import type * as T from '@/domain/types';
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
  listLinks(c: T.Id): Promise<T.EntityLink[]>;
}
