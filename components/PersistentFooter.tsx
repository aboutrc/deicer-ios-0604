import { View, Text, TouchableOpacity, StyleSheet, Platform, Animated, Dimensions, Linking } from 'react-native';
import { Heart } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { fetchActiveFooterConfig } from '@/services/footerService';

export default function PersistentFooter() {
  const [scrollAnim] = useState(new Animated.Value(0));
  const [tickerText, setTickerText] = useState('');
  const screenWidth = Dimensions.get('window').width;

  useEffect(() => {
    loadFooterConfig();
  }, []);

  const loadFooterConfig = async () => {
    try {
      const config = await fetchActiveFooterConfig();
      setTickerText(config?.ticker_text || '');
    } catch (err) {
      console.error('Error loading footer config:', err);
    }
  };

  useEffect(() => {
    if (tickerText) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scrollAnim, {
            toValue: -screenWidth * 2,
            duration: 30000,
            useNativeDriver: true,
          }),
          Animated.timing(scrollAnim, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [tickerText, screenWidth]);

  const handleDonate = () => {
    Linking.openURL('https://deicer.org/donate');
  };

  return (
    <View style={styles.footer}>
      <View style={styles.footerContent}>
        <View style={styles.tickerWrapper}>
          <View style={styles.tickerInner}>
            <Animated.Text
              style={[
                styles.tickerText,
                { transform: [{ translateX: scrollAnim }] }
              ]}
            >
              {tickerText}
            </Animated.Text>
          </View>
        </View>
        
        <TouchableOpacity 
          style={styles.donateButton} 
          onPress={handleDonate}
        >
          <Heart size={16} color="#FFFFFF" />
          <Text style={styles.donateText}>Donate</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    backgroundColor: '#000000',
    paddingVertical: 10,
    paddingBottom: Platform.OS === 'ios' ? 30 : 15,
    borderTopWidth: 1,
    borderTopColor: '#2C2C2E',
  },
  footerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  tickerWrapper: {
    flex: 1,
    marginRight: 16,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    height: 20,
  },
  tickerInner: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
  },
  tickerText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    whiteSpace: 'nowrap',
  },
  donateButton: {
    minWidth: 100,
    backgroundColor: '#E74C3C',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  donateText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    marginLeft: 6,
  }
});