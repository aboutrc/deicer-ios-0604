import { View, StyleSheet, Text, TouchableOpacity, Alert, Switch, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { User, LogOut, Bell, Settings, Shield, Languages as Language, CircleHelp as HelpCircle } from 'lucide-react-native';
import { useTranslation } from '@/hooks/useTranslation'
import { useLanguage } from '@/context/LanguageContext';

export default function ProfileScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { language } = useLanguage();
  
  const menuItems = [
    {
      icon: <Bell size={22} color="#007AFF" />,
      title: t('notifications'),
      type: 'toggle',
      value: true,
      onPress: () => {},
    },
    {
      icon: <Language size={22} color="#007AFF" />,
      title: t('language'),
      subtitle: language === 'en' ? 'English' : 'Español',
      onPress: () => router.push('/language'),
    },
    {
      icon: <Shield size={22} color="#007AFF" />,
      title: t('privacySettings'),
      onPress: () => {},
    },
    {
      icon: <HelpCircle size={22} color="#007AFF" />,
      title: t('helpAndSupport'),
      onPress: () => {},
    },
    {
      icon: <Settings size={22} color="#007AFF" />,
      title: t('appSettings'),
      onPress: () => {},
    },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <View style={styles.profileInfo}>
          <View style={styles.profileImageContainer}>
            <User size={30} color="#FFF" />
          </View>
          <View style={styles.profileTextContainer}>
            <Text style={styles.profileName}>Guest User</Text>
            <Text style={styles.profileEmail}>Welcome to Deicer</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.menuItem,
              index === menuItems.length - 1 && styles.lastMenuItem
            ]}
            onPress={item.onPress}
            disabled={item.type === 'toggle'}
          >
            <View style={styles.menuItemLeft}>
              {item.icon}
              <View style={styles.menuItemTextContainer}>
                <Text style={styles.menuItemTitle}>{item.title}</Text>
                {item.subtitle && (
                  <Text style={styles.menuItemSubtitle}>{item.subtitle}</Text>
                )}
              </View>
            </View>
            
            {item.type === 'toggle' ? (
              <Switch
                value={item.value}
                onValueChange={() => {}}
                trackColor={{ false: '#D1D1D6', true: '#34C759' }}
                ios_backgroundColor="#D1D1D6"
              />
            ) : (
              <Text style={styles.menuItemArrow}>›</Text>
            )}
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.versionText}>Deicer v1.0.0</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  contentContainer: {
    padding: 16,
  },
  header: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileTextContainer: {
    marginLeft: 16,
  },
  profileName: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: '#000',
    marginBottom: 4,
  },
  profileEmail: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#8E8E93',
  },
  loginContainer: {
    alignItems: 'center',
    padding: 20,
  },
  loginPrompt: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#3A3A3C',
    marginBottom: 16,
    textAlign: 'center',
  },
  loginButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  loginButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: '#FFF',
  },
  section: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  lastMenuItem: {
    borderBottomWidth: 0,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuItemTextContainer: {
    marginLeft: 16,
  },
  menuItemTitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#000',
  },
  menuItemSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 2,
  },
  menuItemArrow: {
    fontFamily: 'Inter-Regular',
    fontSize: 24,
    color: '#C7C7CC',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  logoutText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: '#FF3B30',
    marginLeft: 8,
  },
  versionText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 20,
  },
});