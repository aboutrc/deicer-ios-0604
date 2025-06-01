import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { View } from 'react-native';
import { LanguageProvider } from '@/context/LanguageContext';
import { AuthProvider } from '@/context/AuthContext';
import { MarkerProvider } from '@/context/MarkerContext';

export default function RootLayout() {
  useFrameworkReady();

  return (
    <AuthProvider>
      <LanguageProvider>
        <MarkerProvider>
          <View style={{ flex: 1, backgroundColor: '#000000' }}>
            <StatusBar style="light" />
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
          </View>
        </MarkerProvider>
      </LanguageProvider>
    </AuthProvider>
  );
}