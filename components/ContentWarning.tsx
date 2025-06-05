import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  ScrollView,
  useColorScheme,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Button } from './ui/Button';

const CONTENT_WARNING_KEY = 'has_seen_content_warning';

export const ContentWarning: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  useEffect(() => {
    checkIfFirstLaunch();
  }, []);

  const checkIfFirstLaunch = async () => {
    try {
      const hasSeenWarning = await AsyncStorage.getItem(CONTENT_WARNING_KEY);
      if (!hasSeenWarning) {
        setVisible(true);
      }
    } catch (error) {
      console.error('Failed to check first launch status:', error);
    }
  };

  const handleAccept = async () => {
    try {
      await AsyncStorage.setItem(CONTENT_WARNING_KEY, 'true');
      setVisible(false);
    } catch (error) {
      console.error('Failed to save warning status:', error);
    }
  };

  if (!visible) return null;

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={() => setVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={[
          styles.modalContent,
          isDark && styles.modalContentDark
        ]}>
          <ScrollView>
            <Text style={[
              styles.title,
              isDark && styles.textDark
            ]}>
              Important Notice
            </Text>
            
            <Text style={[
              styles.subtitle,
              isDark && styles.textDark
            ]}>
              Please Read Carefully
            </Text>

            <Text style={[
              styles.text,
              isDark && styles.textDark
            ]}>
              DEICER is a community safety tool that allows users to share and receive
              information about activity in their area. Please note:
            </Text>

            <View style={styles.bulletPoints}>
              <Text style={[
                styles.bulletPoint,
                isDark && styles.textDark
              ]}>
                • This app contains sensitive information about law enforcement activity
              </Text>
              <Text style={[
                styles.bulletPoint,
                isDark && styles.textDark
              ]}>
                • Information is community-reported and not officially verified
              </Text>
              <Text style={[
                styles.bulletPoint,
                isDark && styles.textDark
              ]}>
                • Use this information responsibly and at your own discretion
              </Text>
              <Text style={[
                styles.bulletPoint,
                isDark && styles.textDark
              ]}>
                • Your safety is your responsibility
              </Text>
            </View>

            <Text style={[
              styles.text,
              isDark && styles.textDark
            ]}>
              By continuing to use DEICER, you acknowledge these points and agree
              to use this tool responsibly.
            </Text>

            <View style={styles.buttonContainer}>
              <Button
                onPress={handleAccept}
                style={styles.button}
              >
                I Understand
              </Button>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    maxWidth: 500,
    maxHeight: '80%',
  },
  modalContentDark: {
    backgroundColor: '#1a1a1a',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
    color: '#666',
  },
  text: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
    color: '#333',
  },
  textDark: {
    color: '#fff',
  },
  bulletPoints: {
    marginVertical: 16,
  },
  bulletPoint: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 8,
    color: '#333',
  },
  buttonContainer: {
    marginTop: 24,
  },
  button: {
    marginTop: 8,
  },
}); 