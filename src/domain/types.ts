// Every game entity carries campaignId. IDs are globally unique (prefixed random strings).
export type Id = string;
export type CampaignStatus = 'active' | 'archived';
export interface Campaign { id: Id; name: string; description: string; coverImage: string; status: CampaignStatus; createdAt: string; updatedAt: string }
export type Role = 'owner' | 'gm' | 'player';
export interface CampaignMember { id: Id; campaignId: Id; userId: Id; displayName: string; role: Role }
export type Permission = 'manage_maps' | 'manage_fog_of_war' | 'manage_members' | 'view_secret' | 'add_markers' | 'edit_markers' | 'delete_markers' | 'edit_shared' | 'archive_campaign' | 'delete_records';
// Coordinates are normalized 0..1 relative to the ORIGINAL image.
export interface MapImageVariant { kind: 'original' | 'player_safe'; url: string; width: number; height: number }
export interface GameMap { id: Id; campaignId: Id; name: string; parentMapId: Id | null; original: MapImageVariant; playerSafe: MapImageVariant | null }
export type MarkerKind = 'city' | 'dungeon' | 'ruin' | 'camp' | 'poi';
export type ExploreStatus = 'unknown' | 'rumored' | 'visited' | 'cleared';
export interface Location { id: Id; campaignId: Id; name: string; description: string; kind: MarkerKind; status: ExploreStatus }
export interface Marker { id: Id; campaignId: Id; mapId: Id; locationId: Id; x: number; y: number; kind: MarkerKind; childMapId: Id | null; secret: boolean }
export interface Quest { id: Id; campaignId: Id; title: string; summary: string; status: 'active' | 'completed' | 'failed' }
export interface Npc { id: Id; campaignId: Id; name: string; role: string; description: string; attitude: 'ally' | 'neutral' | 'hostile' }
export interface ChronicleEntry { id: Id; campaignId: Id; session: number; title: string; text: string; date: string }
export interface Note { id: Id; campaignId: Id; authorId: Id; locationId: Id | null; text: string; createdAt: string }
export type EntityType = 'location' | 'npc' | 'quest' | 'chronicle' | 'map';
export interface EntityLink { id: Id; campaignId: Id; from: { type: EntityType; id: Id }; to: { type: EntityType; id: Id }; label: string }
export interface AuditEntry { id: Id; campaignId: Id; userId: Id; action: string; entity: { type: string; id: Id }; at: string }
export type { FogRegion, FogEvent } from '@/fog/types';
