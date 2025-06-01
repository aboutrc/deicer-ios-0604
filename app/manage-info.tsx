import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Plus, CreditCard as Edit2, Trash2, MoveUp, MoveDown } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { InfoCard } from '@/services/infoService';

export default function ManageInfoScreen() {
  const [cards, setCards] = useState<InfoCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingCard, setEditingCard] = useState<InfoCard | null>(null);
  const router = useRouter();

  useEffect(() => {
    loadCards();
  }, []);

  const loadCards = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('info_cards')
        .select('*')
        .order('order_index', { ascending: true });

      if (error) throw error;
      setCards(data || []);
    } catch (err) {
      console.error('Error loading cards:', err);
      Alert.alert('Error', 'Failed to load cards');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      const newCard = {
        title: 'New Card',
        content: '# New Card\n\nAdd your content here...',
        order_index: cards.length,
        is_active: true,
      };

      const { data, error } = await supabase
        .from('info_cards')
        .insert([newCard])
        .select()
        .single();

      if (error) throw error;
      
      setCards([...cards, data]);
      setEditingCard(data);
    } catch (err) {
      console.error('Error creating card:', err);
      Alert.alert('Error', 'Failed to create card');
    }
  };

  const handleUpdate = async (card: InfoCard) => {
    try {
      const { error } = await supabase
        .from('info_cards')
        .update({
          title: card.title,
          content: card.content,
          video_url: card.video_url,
          image_url: card.image_url,
          is_active: card.is_active,
          updated_at: new Date().toISOString(),
        })
        .eq('id', card.id);

      if (error) throw error;
      
      setCards(cards.map(c => c.id === card.id ? card : c));
      setEditingCard(null);
      Alert.alert('Success', 'Card updated successfully');
    } catch (err) {
      console.error('Error updating card:', err);
      Alert.alert('Error', 'Failed to update card');
    }
  };

  const handleDelete = async (cardId: string) => {
    Alert.alert(
      'Delete Card',
      'Are you sure you want to delete this card?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('info_cards')
                .delete()
                .eq('id', cardId);

              if (error) throw error;
              
              setCards(cards.filter(c => c.id !== cardId));
              Alert.alert('Success', 'Card deleted successfully');
            } catch (err) {
              console.error('Error deleting card:', err);
              Alert.alert('Error', 'Failed to delete card');
            }
          },
        },
      ]
    );
  };

  const handleReorder = async (cardId: string, direction: 'up' | 'down') => {
    const currentIndex = cards.findIndex(c => c.id === cardId);
    if (
      (direction === 'up' && currentIndex === 0) ||
      (direction === 'down' && currentIndex === cards.length - 1)
    ) {
      return;
    }

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    const newCards = [...cards];
    const [movedCard] = newCards.splice(currentIndex, 1);
    newCards.splice(newIndex, 0, movedCard);

    // Update order_index for all cards
    const updates = newCards.map((card, index) => ({
      id: card.id,
      order_index: index,
    }));

    try {
      const { error } = await supabase
        .from('info_cards')
        .upsert(updates);

      if (error) throw error;
      
      setCards(newCards);
    } catch (err) {
      console.error('Error reordering cards:', err);
      Alert.alert('Error', 'Failed to reorder cards');
    }
  };

  const renderEditForm = () => {
    if (!editingCard) return null;

    return (
      <View style={styles.editForm}>
        <View style={styles.editHeader}>
          <Text style={styles.editTitle}>Edit Card</Text>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setEditingCard(null)}
          >
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.editContent}>
          <Text style={styles.label}>Title</Text>
          <TextInput
            style={styles.input}
            value={editingCard.title}
            onChangeText={(text) => setEditingCard({ ...editingCard, title: text })}
            placeholder="Enter title"
          />

          <Text style={styles.label}>Content (Markdown)</Text>
          <TextInput
            style={[styles.input, styles.contentInput]}
            value={editingCard.content}
            onChangeText={(text) => setEditingCard({ ...editingCard, content: text })}
            placeholder="Enter content in Markdown format"
            multiline
            numberOfLines={10}
          />

          <Text style={styles.label}>Video URL (YouTube)</Text>
          <TextInput
            style={styles.input}
            value={editingCard.video_url || ''}
            onChangeText={(text) => setEditingCard({ ...editingCard, video_url: text })}
            placeholder="Enter YouTube video URL"
          />

          <Text style={styles.label}>Image URL</Text>
          <TextInput
            style={styles.input}
            value={editingCard.image_url || ''}
            onChangeText={(text) => setEditingCard({ ...editingCard, image_url: text })}
            placeholder="Enter image URL"
          />

          <View style={styles.activeContainer}>
            <Text style={styles.label}>Active</Text>
            <TouchableOpacity
              style={[
                styles.activeButton,
                editingCard.is_active && styles.activeButtonSelected
              ]}
              onPress={() => setEditingCard({ ...editingCard, is_active: !editingCard.is_active })}
            >
              <Text style={[
                styles.activeButtonText,
                editingCard.is_active && styles.activeButtonTextSelected
              ]}>
                {editingCard.is_active ? 'Active' : 'Inactive'}
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.saveButton}
            onPress={() => handleUpdate(editingCard)}
          >
            <Text style={styles.saveButtonText}>Save Changes</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Manage Info Cards</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleCreate}
        >
          <Plus size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <ScrollView style={styles.cardsList}>
          {cards.map((card, index) => (
            <View key={card.id} style={styles.cardItem}>
              <View style={styles.cardInfo}>
                <Text style={styles.cardTitle}>{card.title}</Text>
                <View style={styles.cardMeta}>
                  <Text style={[
                    styles.cardStatus,
                    card.is_active ? styles.statusActive : styles.statusInactive
                  ]}>
                    {card.is_active ? 'Active' : 'Inactive'}
                  </Text>
                  <Text style={styles.cardDate}>
                    Updated: {new Date(card.updated_at).toLocaleDateString()}
                  </Text>
                </View>
              </View>

              <View style={styles.cardActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleReorder(card.id, 'up')}
                  disabled={index === 0}
                >
                  <MoveUp
                    size={20}
                    color={index === 0 ? '#8E8E93' : '#007AFF'}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleReorder(card.id, 'down')}
                  disabled={index === cards.length - 1}
                >
                  <MoveDown
                    size={20}
                    color={index === cards.length - 1 ? '#8E8E93' : '#007AFF'}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => setEditingCard(card)}
                >
                  <Edit2 size={20} color="#007AFF" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleDelete(card.id)}
                >
                  <Trash2 size={20} color="#FF3B30" />
                </TouchableOpacity>
              </View>
            </View>
          ))}

          {cards.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                No cards yet. Click the + button to create one.
              </Text>
            </View>
          )}
        </ScrollView>

        {editingCard && renderEditForm()}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 17,
    fontFamily: 'Inter-SemiBold',
    color: '#000000',
  },
  addButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  cardsList: {
    flex: 1,
    padding: 16,
  },
  cardItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardInfo: {
    flex: 1,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 17,
    fontFamily: 'Inter-SemiBold',
    color: '#000000',
    marginBottom: 4,
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardStatus: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: 'hidden',
    marginRight: 8,
  },
  statusActive: {
    backgroundColor: '#E8F5E9',
    color: '#2E7D32',
  },
  statusInactive: {
    backgroundColor: '#FFEBEE',
    color: '#C62828',
  },
  cardDate: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#8E8E93',
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    paddingTop: 12,
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  emptyState: {
    padding: 24,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#8E8E93',
    textAlign: 'center',
  },
  editForm: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    maxWidth: 500,
    backgroundColor: '#FFFFFF',
    borderLeftWidth: 1,
    borderLeftColor: '#E5E5EA',
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: -2, height: 0 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  editHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  editTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#000000',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 17,
    fontFamily: 'Inter-Regular',
    color: '#007AFF',
  },
  editContent: {
    flex: 1,
    padding: 16,
  },
  label: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#3A3A3C',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#000000',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  contentInput: {
    height: 200,
    textAlignVertical: 'top',
  },
  activeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  activeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F2F2F7',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  activeButtonSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  activeButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#8E8E93',
  },
  activeButtonTextSelected: {
    color: '#FFFFFF',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  saveButtonText: {
    fontSize: 17,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
});