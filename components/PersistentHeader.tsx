import { View, Text, TouchableOpacity, StyleSheet, Platform, Image } from 'react-native';
import { Globe, Map as MapIcon, CreditCard, Shield, MessageSquare, Info } from 'lucide-react-native';
import { useRouter, usePathname } from 'expo-router';
import { useLanguage, type LanguageCode } from '@/context/LanguageContext';

const languageFlags = {
  en: require('@/assets/images/us-flag.png'),
  es: require('@/assets/images/mx-flag.png'),
  zh: require('@/assets/images/cn-flag.png'),
  hi: require('@/assets/images/in-flag.png'),
  ar: require('@/assets/images/sa-flag.png'),
};

const languageLabels = {
  en: 'EN',
  es: 'ES',
  zh: 'ZH',
  hi: 'HI',
  ar: 'AR',
};

export default function PersistentHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const { language, setLanguage, t } = useLanguage();

  const cycleLanguage = () => {
    const languages = ['en', 'es', 'zh', 'hi', 'ar'];
    const currentIndex = languages.indexOf(language);
    const nextIndex = (currentIndex + 1) % languages.length;
    setLanguage(languages[nextIndex]);
  };

  const isActive = (path: string) => pathname === path;

  const navigationItems = [
    { icon: MapIcon, label: t('map'), path: '/(tabs)/' },
    { icon: CreditCard, label: t('card'), path: '/(tabs)/card' },
    { icon: Shield, label: t('protect'), path: '/(tabs)/protect' },
    { icon: MessageSquare, label: t('chat'), path: '/(tabs)/chat2' },
    { icon: Info, label: t('info'), path: '/(tabs)/info' }
  ];

  return (
    <View style={styles.headerContainer}>
      <View style={styles.topHeader}>
        <View style={styles.logoContainer}>
          <Image
            source={require('@/assets/images/deicer-badge-sm.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
          <Text style={styles.logo}>DEICER</Text>
        </View>
        <TouchableOpacity 
          style={styles.languageToggle}
          onPress={cycleLanguage}
        >
          <Image 
            source={languageFlags[language]} 
            style={styles.flagIcon} 
          />
          <Text style={styles.languageText}>
            {languageLabels[language]}
          </Text>
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
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoImage: {
    width: 30,
    height: 30,
    marginRight: 8,
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
    backgroundColor: '#2C2C2E',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  flagIcon: {
    width: 24,
    height: 16,
    marginRight: 8,
    borderRadius: 2,
  },
  languageText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Inter-Medium',
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