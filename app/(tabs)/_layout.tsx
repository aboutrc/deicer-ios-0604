import { Tabs } from 'expo-router';
import { useEffect } from 'react';
import { View, StyleSheet, useColorScheme } from 'react-native';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold } from '@expo-google-fonts/inter';
import { Map as MapIcon, CreditCard, Shield, Info, MessageSquare } from 'lucide-react-native';
import { SplashScreen } from 'expo-router';
import PersistentHeader from '@/components/PersistentHeader';
import PersistentFooter from '@/components/PersistentFooter';

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const [fontsLoaded, fontError] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-Medium': Inter_500Medium,
    'Inter-SemiBold': Inter_600SemiBold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      // Hide splash screen once fonts are loaded or if there's an error
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return <View style={styles.container} />;
  }

  return (
    <View style={[styles.mainContainer, { backgroundColor: colorScheme === 'dark' ? '#000000' : '#FFFFFF' }]}>
      <PersistentHeader />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            display: 'none', // Hide the tab bar since we're using our custom header
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Map',
            tabBarIcon: ({ color, size }) => (
              <MapIcon size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="card"
          options={{
            title: 'Card',
            tabBarIcon: ({ color, size }) => (
              <CreditCard size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="protect"
          options={{
            title: 'Protect',
            tabBarIcon: ({ color, size }) => (
              <Shield size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="chat2"
          options={{
            title: 'Chat',
            tabBarIcon: ({ color, size }) => (
              <MessageSquare size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="info"
          options={{
            title: 'Info',
            tabBarIcon: ({ color, size }) => (
              <Info size={size} color={color} />
            ),
          }}
        />
      </Tabs>
      <PersistentFooter />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mainContainer: {
    flex: 1,
  },
});