import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Globe, Map as MapIcon, CreditCard, Shield, MessageSquare, Info } from 'lucide-react-native';
import { useRouter, usePathname } from 'expo-router';

export default function PersistentHeader() {
  const router = useRouter();
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  const navigationItems = [
    { icon: MapIcon, label: 'Map', path: '/(tabs)/' },
    { icon: CreditCard, label: 'Card', path: '/(tabs)/card' },
    { icon: Shield, label: 'Protect', path: '/(tabs)/protect' },
    { icon: MessageSquare, label: 'Chat', path: '/(tabs)/chat2' },
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
            style={styles.navItem}
            onPress={() => router.push(item.path)}
          >
            <item.icon 
              size={24} 
              color="#FFFFFF" 
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
    borderBottomColor: '#333333',
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 80 : 50,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
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
    opacity: 0.7,
  },
  navItemActive: {
    opacity: 1,
  },
  navText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    marginTop: 4,
  },
  navTextActive: {
    color: '#FFFFFF',
    opacity: 1
  },
});