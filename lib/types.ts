export interface Moment {
  id: string;
  slug: string;
  partner_name: string;
  sender_name: string;
  message: string;
  theme_id: string;
  view_count: number;
  max_views: number;
  is_active: boolean;
  created_at: string;
  first_viewed_at?: string | null;
  last_viewed_at?: string | null;
}

export interface CreateMomentInput {
  partner_name: string;
  sender_name: string;
  message: string;
  theme_id: string;
}
