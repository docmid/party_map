import type { Id } from '@/domain/types';
// Fog of war: TYPES ONLY. No editor, no rendering, no hiding yet.
export interface FogRegion { id: Id; campaignId: Id; mapId: Id; polygon: { x: number; y: number }[]; state: 'closed' | 'open'; updatedBy: Id; updatedAt: string }
export interface FogEvent { id: Id; campaignId: Id; regionId: Id; from: 'closed' | 'open'; to: 'closed' | 'open'; by: Id; at: string }
