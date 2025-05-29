import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { View } from 'react-native';
import PersistentHeader from '@/components/PersistentHeader';
import PersistentFooter from '@/components/PersistentFooter';
import { LanguageProvider } from '@/context/LanguageContext';
import { AuthProvider } from '@/context/AuthContext';

export default function RootLayout() {
  useFrameworkReady();

  return (
    <AuthProvider>
      <LanguageProvider>
        <View style={{ flex: 1, backgroundColor: '#000000' }}>
          <StatusBar style="light" />
          <PersistentHeader />
          <Stack 
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: '#000000' }
            }}
          >
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="event-details" options={{ presentation: 'modal' }} />
            <Stack.Screen name="+not-found" />
          </Stack>
          <PersistentFooter />
        </View>
      </LanguageProvider>
    </AuthProvider>
  );
}