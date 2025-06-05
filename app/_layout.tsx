import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { View } from 'react-native';
import { LanguageProvider } from '@/context/LanguageContext';
import { MarkerProvider } from '@/context/MarkerContext';
import { ContentWarning } from '@/components/ContentWarning';

export default function RootLayout() {
  useFrameworkReady();

  return (
    <LanguageProvider>
      <MarkerProvider>
        <ContentWarning />
        <View style={{ flex: 1, backgroundColor: '#000000' }}>
          <StatusBar style="light" />
          <Stack 
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: '#000000' },
              headerStyle: {
                backgroundColor: '#fff',
              },
              headerTintColor: '#000',
              headerTitleStyle: {
                fontWeight: 'bold',
              },
            }}
          >
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="event-details" options={{ presentation: 'modal' }} />
            <Stack.Screen name="+not-found" />
          </Stack>
        </View>
      </MarkerProvider>
    </LanguageProvider>
  );
}