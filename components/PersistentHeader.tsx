import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Globe, Map as MapIcon, CreditCard, Shield, MessageCircle, Info } from 'lucide-react-native';
import { useRouter, usePathname } from 'expo-router';

export default function PersistentHeader() {
  const router = useRouter();
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  const navigationItems = [
    { icon: MapIcon, label: 'Map', path: '/(tabs)/' },
    { icon: CreditCard, label: 'Card', path: '/(tabs)/card' },
    { icon: Shield, label: 'Protect', path: '/(tabs)/protect' },
    { icon: MessageCircle, label: 'Chat', path: '/(tabs)/chat' },
    { icon: Info, label: 'Info', path: '/(tabs)/info' }
  ];

  return (
    <View style={styles.headerContainer}>
      <View style={styles.topHeader}>
        <Text style={styles.logo}>DEICER</Text>
        <TouchableOpacity style={styles.languageToggle}>
          <Globe size={20} color="#FFFFFF" />
          <Text style={styles.languageText}>EN</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.navigation}>
        {navigationItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.navItem, isActive(item.path) && styles.navItemActive]}
            onPress={() => router.push(item.path)}
          >
            <item.icon 
              size={24} 
              color={isActive(item.path) ? '#FFFFFF' : '#666666'} 
            />
            <Text style={[
              styles.navText,
              isActive(item.path) && styles.navTextActive
            ]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: '#000000',
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C2E',
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 30,
    paddingBottom: 16,
  },
  logo: {
    color: '#FFFFFF',
    fontSize: 30,
    fontFamily: 'Inter-SemiBold',
    fontWeight: 'bold',
  },
  languageToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  languageText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    marginLeft: 6,
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  navItem: {
    alignItems: 'center',
    opacity: 0.6,
  },
  navItemActive: {
    opacity: 1,
  },
  navText: {
    color: '#666666',
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    marginTop: 4,
  },
  navTextActive: {
    color: '#FFFFFF',
  },
});