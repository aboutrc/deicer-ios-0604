export interface MarkerType {
  id: string;
  latitude: number;
  longitude: number;
  category: 'ice' | 'observer';
  created_at: string;
  updated_at: string;
  image_url?: string;
  title?: string;
  description?: string;
  confirmations_count: number;
  reliability_score: number;
} 