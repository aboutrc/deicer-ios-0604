export interface InfoCard {
  id: string;
  title: string;
  content: string;
  image_url?: string;
  video_url?: string;
  is_active: boolean;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface InfoCardInput {
  title: string;
  content: string;
  image_url?: string;
  video_url?: string;
  is_active: boolean;
  order_index?: number;
}