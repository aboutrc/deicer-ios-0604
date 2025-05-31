import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  TouchableOpacity, 
  TextInput,
  ScrollView,
  Platform
} from 'react-native';
import { MapPin, X, Search, Loader as Loader2 } from 'lucide-react-native';
import * as Location from 'expo-location';

interface SearchLocationModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectLocation: (latitude: number, longitude: number) => void;
}

interface SearchResult {
  name: string;
  latitude: number;
  longitude: number;
  description?: string;
}

export default function SearchLocationModal({ 
  visible, 
  onClose,
  onSelectLocation 
}: SearchLocationModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (text: string) => {
    try {
      setSearchQuery(text);
      if (!text.trim()) {
        setResults([]);
        return;
      }

      setLoading(true);
      setError(null);

      // Geocode the search query
      const locations = await Location.geocodeAsync(text);
      
      if (locations.length === 0) {
        setResults([]);
        return;
      }

      // Get detailed addresses for each location
      const searchResults = await Promise.all(
        locations.map(async (loc) => {
          const addresses = await Location.reverseGeocodeAsync({
            latitude: loc.latitude,
            longitude: loc.longitude
          });

          const address = addresses[0];
          const parts = [
            address.street,
            address.city,
            address.region,
            address.country
          ].filter(Boolean);

          return {
            name: parts.join(', '),
            description: address.name || address.street,
            latitude: loc.latitude,
            longitude: loc.longitude
          };
        })
      );

      setResults(searchResults);
    } catch (err) {
      console.error('Search error:', err);
      setError('Failed to search location');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectLocation = (latitude: number, longitude: number) => {
    onSelectLocation(latitude, longitude);
    onClose();
    setSearchQuery('');
    setResults([]);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <View style={styles.titleContainer}>
              <MapPin size={24} color="#FFFFFF" />
              <Text style={styles.modalTitle}>Search Location</Text>
            </View>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={onClose}
            >
              <X size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <View style={styles.searchContainer}>
            <Search size={20} color="#8E8E93" style={styles.searchIcon} />
            <TextInput
              style={[styles.searchInput, Platform.OS === 'web' && styles.searchInputWeb]}
              placeholder="Enter city, state, zip or address..."
              placeholderTextColor="#8E8E93"
              value={searchQuery}
              onChangeText={handleSearch}
              returnKeyType="search"
              onSubmitEditing={() => handleSearch(searchQuery)}
              autoFocus
            />
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <Loader2 size={24} color="#007AFF" />
              <Text style={styles.loadingText}>Searching...</Text>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : results.length === 0 && searchQuery ? (
            <View style={styles.noResultsContainer}>
              <Text style={styles.noResultsText}>No locations found</Text>
            </View>
          ) : (
            <ScrollView style={styles.resultsList}>
              {results.map((result, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.resultItem}
                  onPress={() => handleSelectLocation(result.latitude, result.longitude)}
                >
                  <MapPin size={20} color="#007AFF" />
                  <View style={styles.resultTextContainer}>
                    <Text style={styles.resultText}>{result.name}</Text>
                    {result.description && (
                      <Text style={styles.resultDescription}>{result.description}</Text>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          {!searchQuery && (
            <View style={styles.placeholderContainer}>
              <Text style={styles.placeholderText}>
                Search for a location to see results
              </Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxWidth: 500,
    height: '80%',
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    overflow: 'hidden',
  },
  modalHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C2E',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalTitle: {
    fontSize: 24,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  closeButton: {
    padding: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C2E',
    backgroundColor: '#2C2C2E',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    paddingHorizontal: 8,
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  searchInputWeb: {
    outlineStyle: 'none',
  },
  loadingContainer: {
    padding: 24,
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    color: '#8E8E93',
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  errorContainer: {
    padding: 16,
    alignItems: 'center',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  noResultsContainer: {
    padding: 16,
    alignItems: 'center',
  },
  noResultsText: {
    color: '#8E8E93',
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  resultsList: {
    flex: 1,
    maxHeight: undefined,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C2E',
  },
  resultTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  resultText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF',
  },
  resultDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#8E8E93',
    marginTop: 2,
  },
  placeholderContainer: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  placeholderText: {
    color: '#8E8E93',
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },
});