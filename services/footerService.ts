import { supabase } from '@/lib/supabase';

export interface FooterConfig {
  id: string;
  ticker_text: string;
  button_image_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export async function fetchActiveFooterConfig(): Promise<FooterConfig | null> {
  const { data, error } = await supabase
    .from('footer_configs')
    .select('*')
    .eq('is_active', true)
    .single();

  if (error) {
    console.error('Error fetching active footer config:', error);
    return null;
  }

  return data;
}

export async function fetchAllFooterConfigs(): Promise<FooterConfig[]> {
  const { data, error } = await supabase
    .from('footer_configs')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching footer configs:', error);
    return [];
  }

  return data || [];
}

export async function createFooterConfig(data: {
  ticker_text: string;
  button_image_url?: string;
  is_active?: boolean;
}): Promise<FooterConfig | null> {
  const { data: newConfig, error } = await supabase
    .from('footer_configs')
    .insert([data])
    .select()
    .single();

  if (error) {
    console.error('Error creating footer config:', error);
    return null;
  }

  return newConfig;
}

export async function updateFooterConfig(
  id: string,
  data: Partial<FooterConfig>
): Promise<FooterConfig | null> {
  const { data: updatedConfig, error } = await supabase
    .from('footer_configs')
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating footer config:', error);
    return null;
  }

  return updatedConfig;
}

export async function deleteFooterConfig(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('footer_configs')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting footer config:', error);
    return false;
  }

  return true;
}

export async function uploadFooterImage(uri: string): Promise<string | null> {
  try {
    const response = await fetch(uri);
    const blob = await response.blob();
    const filename = `footer-${Date.now()}.jpg`;
    
    const { data, error } = await supabase.storage
      .from('footer-images')
      .upload(filename, blob);

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('footer-images')
      .getPublicUrl(filename);

    return publicUrl;
  } catch (err) {
    console.error('Error uploading footer image:', err);
    return null;
  }
}