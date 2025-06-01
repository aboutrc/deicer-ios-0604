import { View, Text, TouchableOpacity, StyleSheet, Platform, Animated, Dimensions, Linking } from 'react-native';
import { Heart } from 'lucide-react-native';
import { useEffect, useState } from 'react';

export default function PersistentFooter() {
  const [scrollAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scrollAnim, {
          toValue: -Dimensions.get('window').width,
          duration: 15000,
          useNativeDriver: true,
        }),
        Animated.timing(scrollAnim, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const handleDonate = () => {
    Linking.openURL('https://deicer.org/donate');
  };

  return (
    <View style={styles.footer}>
      <View style={styles.scrollContainer}>
        <Animated.Text 
          style={[
            styles.scrollingText,
            { transform: [{ translateX: scrollAnim }] }
          ]}
        >
          This app is free to use, anonymous, and you do not need to sign in. If you would like to support this effort, share with any investors for funding, or click on the Donate button. It is NOT required, but appreciated.
        </Animated.Text>
      </View>
      <TouchableOpacity style={styles.donateButton} onPress={handleDonate}>
        <Heart size={16} color="#FFFFFF" />
        <Text style={styles.donateText}>Donate</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    backgroundColor: '#000000',
    paddingVertical: 10,
    paddingBottom: Platform.OS === 'ios' ? 15 : 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#2C2C2E',
    paddingHorizontal: 16,
  },
  scrollContainer: {
    flex: 1,
    overflow: 'hidden',
    height: 20,
  },
  scrollingText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    whiteSpace: 'nowrap',
  },
  donateButton: {
    backgroundColor: '#E74C3C',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginLeft: 16,
  },
  donateText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    marginLeft: 8,
  },
});