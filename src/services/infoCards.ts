import { supabase } from '../lib/supabase';
import { InfoCard, InfoCardInput } from '../types';

export async function fetchInfoCards(): Promise<InfoCard[]> {
  const { data, error } = await supabase
    .from('info_cards')
    .select('*')
    .not('title', 'eq', 'New Card')
    .not('content', 'eq', '')
    .order('order_index', { ascending: true });

  if (error) {
    throw new Error(`Error fetching info cards: ${error.message}`);
  }

  return data || [];
}

export async function createInfoCard(card: InfoCardInput): Promise<InfoCard> {
  const { data, error } = await supabase
    .from('info_cards')
    .insert(card)
    .select()
    .single();

  if (error) {
    throw new Error(`Error creating info card: ${error.message}`);
  }

  return data;
}

export async function updateInfoCard(id: string, updates: Partial<InfoCard>): Promise<InfoCard> {
  // First check if the card exists
  const { data: existingCard, error: fetchError } = await supabase
    .from('info_cards')
    .select()
    .eq('id', id)
    .single();

  if (fetchError) {
    throw new Error(`Error fetching info card: ${fetchError.message}`);
  }

  if (!existingCard) {
    throw new Error('Card not found');
  }

  // Then perform the update
  const { data, error } = await supabase
    .from('info_cards')
    .update(updates)
    .eq('id', id)
    .select();

  if (error) {
    throw new Error(`Error updating info card: ${error.message}`);
  }

  if (!data || data.length === 0) {
    throw new Error('Failed to update card');
  }

  return data[0];
}

export async function deleteInfoCard(id: string): Promise<void> {
  const { error } = await supabase.rpc('force_delete_info_card', {
    card_id: id
  });
  
  if (error) {
    throw new Error(`Error deleting info card: ${error.message}`);
  }
}

export async function reorderInfoCards(cards: InfoCard[]): Promise<void> {
  // Only update the order_index field, preserving all other fields
  const updates = cards.map((card, index) => ({
    id: card.id,
    order_index: index,
    // Preserve existing values
    title: card.title,
    content: card.content,
    is_active: card.is_active
  }));

  // Perform the update in a single operation
  const { error } = await supabase
    .from('info_cards')
    .upsert(updates, {
      onConflict: 'id'
    });

  if (error) {
    console.error('Reordering error:', error);
    throw new Error('Failed to reorder cards. Please try again.');
  }
}