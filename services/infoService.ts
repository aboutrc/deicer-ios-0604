import { supabase } from '@/lib/supabase';

export interface InfoCard {
  id: string;
  title: string;
  content: string;
  video_url?: string;
  image_url?: string;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export async function fetchInfoCards(): Promise<InfoCard[]> {
  const { data, error } = await supabase
    .from('info_cards')
    .select('id, title, content, video_url, image_url, order_index, created_at, updated_at')
    .eq('is_active', true)
    .order('order_index', { ascending: true });

  if (error) {
    console.error('Error fetching info cards:', error);
    throw error;
  }

  console.log('Fetched info cards:', data);
  return data || [];
}