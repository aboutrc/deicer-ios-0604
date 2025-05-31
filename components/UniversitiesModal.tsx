import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  TouchableOpacity, 
  ScrollView, 
  TextInput,
} from 'react-native';
import { X, GraduationCap, Search, ChevronRight } from 'lucide-react-native';
import { universities } from '@/lib/universities';

interface UniversitiesModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectUniversity: (latitude: number, longitude: number) => void;
}

export default function UniversitiesModal({ 
  visible, 
  onClose,
  onSelectUniversity 
}: UniversitiesModalProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredUniversities = universities.filter(uni =>
    uni.university.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleUniversitySelect = (latitude: number, longitude: number) => {
    onSelectUniversity(latitude, longitude);
    onClose();
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
            <View style={styles.headerContent}>
              <GraduationCap size={24} color="#FFFFFF" style={styles.headerIcon} />
              <View>
                <Text style={styles.modalTitle}>Universities in</Text>
                <Text style={styles.modalSubtitle}>Mutual Academic Defense Compacts (MDAC)</Text>
              </View>
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
              style={styles.searchInput}
              placeholder="Search university..."
              placeholderTextColor="#8E8E93"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          <ScrollView 
            style={styles.universitiesList}
            showsVerticalScrollIndicator={false}
          >
            {filteredUniversities.map((uni, index) => (
              <TouchableOpacity
                key={index}
                style={styles.universityItem}
                onPress={() => handleUniversitySelect(
                  uni.geofence_coordinates.center.latitude,
                  uni.geofence_coordinates.center.longitude
                )}
              >
                <View style={styles.universityItemContent}>
                  <GraduationCap size={20} color="#007AFF" />
                  <Text style={styles.universityName}>{uni.university}</Text>
                  <ChevronRight size={20} color="#8E8E93" />
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
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
    alignItems: 'center'
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
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerIcon: {
    marginRight: 12,
  },
  modalTitle: {
    fontSize: 24,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  modalSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#8E8E93',
    marginTop: 4,
  },
  closeButton: {
    padding: 8,
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
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  universitiesList: {
    flex: 1,
  },
  universityItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C2E',
  },
  universityItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    paddingVertical: 16,
  },
  universityName: {
    marginLeft: 12,
    marginRight: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF',
    flex: 1,
  },
});