export interface MarkerType {
  id: string;
  user_id: string | null;
  title?: string;
  description: string;
  category: 'ice' | 'observer';
  latitude: number;
  longitude: number;
  created_at: string;
  updated_at: string;
  active: boolean;
  ip_address?: string | null;
  image_url: string | null;
  image_public_url?: string | null;
  translated_title?: string;
  translated_description?: string;
  confirmations_count: number;
  reliability_score: number;
  expiration_time?: string | null;
  last_confirmed?: string | null;
  severity?: number;
} 