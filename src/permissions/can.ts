import type { Campaign, CampaignMember, Permission, Role } from '@/domain/types';
// UI HINTS ONLY. Real enforcement = server + Supabase RLS on campaign_members(campaign_id,user_id,role).
const ALL: Permission[] = ['manage_maps','manage_fog_of_war','manage_members','view_secret','add_markers','edit_markers','delete_markers','edit_shared','archive_campaign'];
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  owner: ALL,
  gm: ALL.filter(p => p !== 'manage_members' && p !== 'archive_campaign'),
  player: ['add_markers', 'edit_markers', 'edit_shared'],
};
export function can(member: CampaignMember | undefined, campaign: Campaign | undefined, p: Permission): boolean {
  if (!member || !campaign) return false;
  if (campaign.status === 'archived' && p !== 'view_secret') return false;
  return ROLE_PERMISSIONS[member.role].includes(p);
}
