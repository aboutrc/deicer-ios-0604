import { supabase } from '@/lib/supabase';

export interface Notification {
  id: string;
  marker_id: string;
  title: string;
  message: string;
  created_at: string;
  read: boolean;
}

export async function getNotifications(): Promise<Notification[]> {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function markNotificationAsRead(notificationId: string): Promise<void> {
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', notificationId);

  if (error) throw error;
}

export async function checkNearbyMarkers(latitude: number, longitude: number): Promise<void> {
  const { data: markers, error } = await supabase
    .rpc('get_nearby_ice_markers', {
      user_lat: latitude,
      user_lon: longitude,
      radius_miles: 1
    });

  if (error) throw error;
  return markers;
}