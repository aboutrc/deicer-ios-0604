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
  ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Plus, CreditCard as Edit2, Trash2, CircleCheck as CheckCircle2, Circle as XCircle } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { 
  fetchAllFooterConfigs,
  createFooterConfig,
  updateFooterConfig,
  deleteFooterConfig,
  uploadFooterImage,
  type FooterConfig
} from '@/services/footerService';

export default function ManageFootersScreen() {
  const [footers, setFooters] = useState<FooterConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingFooter, setEditingFooter] = useState<FooterConfig | null>(null);
  const [newTickerText, setNewTickerText] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    loadFooters();
  }, []);

  const loadFooters = async () => {
    try {
      setLoading(true);
      const data = await fetchAllFooterConfigs();
      setFooters(data);
    } catch (err) {
      console.error('Error loading footers:', err);
      Alert.alert('Error', 'Failed to load footer configurations');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        allowsEditing: true,
      });

      if (!result.canceled) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (err) {
      console.error('Error selecting image:', err);
      Alert.alert('Error', 'Failed to select image');
    }
  };

  const handleCreate = async () => {
    try {
      if (!newTickerText.trim()) {
        Alert.alert('Error', 'Ticker text is required');
        return;
      }

      let imageUrl = null;
      if (selectedImage) {
        imageUrl = await uploadFooterImage(selectedImage);
      }

      const newFooter = await createFooterConfig({
        ticker_text: newTickerText,
        button_image_url: imageUrl || undefined,
        is_active: false,
      });

      if (newFooter) {
        await loadFooters();
        setNewTickerText('');
        setSelectedImage(null);
        Alert.alert('Success', 'Footer configuration created');
      }
    } catch (err) {
      console.error('Error creating footer:', err);
      Alert.alert('Error', 'Failed to create footer configuration');
    }
  };

  const handleUpdate = async (footer: FooterConfig) => {
    try {
      let imageUrl = footer.button_image_url;
      if (selectedImage && selectedImage !== footer.button_image_url) {
        imageUrl = await uploadFooterImage(selectedImage);
      }

      const updated = await updateFooterConfig(footer.id, {
        ...footer,
        button_image_url: imageUrl || null,
      });

      if (updated) {
        await loadFooters();
        setEditingFooter(null);
        setSelectedImage(null);
        Alert.alert('Success', 'Footer configuration updated');
      }
    } catch (err) {
      console.error('Error updating footer:', err);
      Alert.alert('Error', 'Failed to update footer configuration');
    }
  };

  const handleDelete = async (id: string) => {
    Alert.alert(
      'Delete Footer',
      'Are you sure you want to delete this footer configuration?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const success = await deleteFooterConfig(id);
              if (success) {
                await loadFooters();
                Alert.alert('Success', 'Footer configuration deleted');
              }
            } catch (err) {
              console.error('Error deleting footer:', err);
              Alert.alert('Error', 'Failed to delete footer configuration');
            }
          },
        },
      ]
    );
  };

  const handleToggleActive = async (footer: FooterConfig) => {
    try {
      const updated = await updateFooterConfig(footer.id, {
        is_active: !footer.is_active,
      });

      if (updated) {
        await loadFooters();
      }
    } catch (err) {
      console.error('Error toggling footer status:', err);
      Alert.alert('Error', 'Failed to update footer status');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Manage Footers</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setEditingFooter({ 
            id: 'new',
            ticker_text: '',
            button_image_url: null,
            is_active: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })}
        >
          <Plus size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {footers.map((footer) => (
          <View key={footer.id} style={styles.footerItem}>
            <View style={styles.footerContent}>
              <Text style={styles.footerText} numberOfLines={2}>
                {footer.ticker_text}
              </Text>
              <View style={styles.footerMeta}>
                <Text style={[
                  styles.footerStatus,
                  footer.is_active ? styles.statusActive : styles.statusInactive
                ]}>
                  {footer.is_active ? 'Active' : 'Inactive'}
                </Text>
                <Text style={styles.footerDate}>
                  Updated: {new Date(footer.updated_at).toLocaleDateString()}
                </Text>
              </View>
            </View>

            <View style={styles.footerActions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleToggleActive(footer)}
              >
                {footer.is_active ? (
                  <CheckCircle2 size={20} color="#34C759" />
                ) : (
                  <XCircle size={20} color="#8E8E93" />
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => setEditingFooter(footer)}
              >
                <Edit2 size={20} color="#007AFF" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleDelete(footer.id)}
              >
                <Trash2 size={20} color="#FF3B30" />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      {editingFooter && (
        <View style={styles.editForm}>
          <View style={styles.editHeader}>
            <Text style={styles.editTitle}>
              {editingFooter.id === 'new' ? 'New Footer' : 'Edit Footer'}
            </Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => {
                setEditingFooter(null);
                setSelectedImage(null);
              }}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.editContent}>
            <Text style={styles.label}>Ticker Text</Text>
            <TextInput
              style={styles.input}
              value={editingFooter.ticker_text}
              onChangeText={(text) => setEditingFooter({ ...editingFooter, ticker_text: text })}
              placeholder="Enter ticker text"
              multiline
            />

            <TouchableOpacity
              style={styles.imageButton}
              onPress={handleSelectImage}
            >
              <Text style={styles.imageButtonText}>
                {selectedImage || editingFooter.button_image_url
                  ? 'Change Button Image'
                  : 'Add Button Image'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.saveButton}
              onPress={() => {
                if (editingFooter.id === 'new') {
                  handleCreate();
                } else {
                  handleUpdate(editingFooter);
                }
              }}
            >
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 16,
    backgroundColor: '#1C1C1E',
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C2E',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  addButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  footerItem: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  footerContent: {
    flex: 1,
    marginBottom: 12,
  },
  footerText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  footerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerStatus: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: 'hidden',
    marginRight: 8,
  },
  statusActive: {
    backgroundColor: '#34C759',
    color: '#FFFFFF',
  },
  statusInactive: {
    backgroundColor: '#FF3B30',
    color: '#FFFFFF',
  },
  footerDate: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#8E8E93',
  },
  footerActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#2C2C2E',
    paddingTop: 12,
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  editForm: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    backgroundColor: '#1C1C1E',
    borderLeftWidth: 1,
    borderLeftColor: '#2C2C2E',
  },
  editHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C2E',
  },
  editTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 16,
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
    color: '#8E8E93',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#2C2C2E',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF',
    marginBottom: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  imageButton: {
    backgroundColor: '#2C2C2E',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  imageButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#007AFF',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
});