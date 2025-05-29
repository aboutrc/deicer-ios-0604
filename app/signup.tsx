import { useState } from 'react';
import { 
  View, 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform,
  ScrollView,
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, User, Mail, Lock, Eye, EyeOff, CircleCheck as CheckCircle2, Circle } from 'lucide-react-native';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/context/AuthContext';
import CustomInput from '@/components/CustomInput';
import CustomButton from '@/components/CustomButton';

export default function SignUpScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const router = useRouter();
  const { t } = useTranslation();
  const { signup } = useAuth();

  const handleSignUp = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert(t('error'), t('allFieldsRequired'));
      return;
    }
    
    if (password !== confirmPassword) {
      Alert.alert(t('error'), t('passwordsDontMatch'));
      return;
    }
    
    if (!agreeToTerms) {
      Alert.alert(t('error'), t('mustAgreeToTerms'));
      return;
    }
    
    try {
      setLoading(true);
      await signup(name, email, password);
      Alert.alert(t('success'), t('accountCreatedSuccessfully'), [
        { text: t('ok'), onPress: () => router.replace('/login') }
      ]);
    } catch (error) {
      Alert.alert(t('signupFailed'), t('couldNotCreateAccount'));
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color="#007AFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('signUp')}</Text>
          <View style={styles.placeholderView} />
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.welcomeText}>{t('createAccount')}</Text>
          <Text style={styles.subtitleText}>{t('fillDetailsBelow')}</Text>

          <View style={styles.inputsContainer}>
            <CustomInput
              label={t('fullName')}
              placeholder={t('enterFullName')}
              value={name}
              onChangeText={setName}
              icon="user"
            />

            <CustomInput
              label={t('email')}
              placeholder={t('enterEmail')}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              icon="mail"
            />

            <View style={styles.passwordContainer}>
              <CustomInput
                label={t('password')}
                placeholder={t('enterPassword')}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                icon="lock"
              />
              <TouchableOpacity 
                style={styles.eyeIcon} 
                onPress={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff size={20} color="#8E8E93" />
                ) : (
                  <Eye size={20} color="#8E8E93" />
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.passwordContainer}>
              <CustomInput
                label={t('confirmPassword')}
                placeholder={t('reenterPassword')}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                icon="lock"
              />
              <TouchableOpacity 
                style={styles.eyeIcon} 
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff size={20} color="#8E8E93" />
                ) : (
                  <Eye size={20} color="#8E8E93" />
                )}
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={styles.termsContainer}
              onPress={() => setAgreeToTerms(!agreeToTerms)}
            >
              {agreeToTerms ? (
                <CheckCircle2 size={20} color="#007AFF" />
              ) : (
                <Circle size={20} color="#8E8E93" />
              )}
              <Text style={styles.termsText}>
                {t('iAgreeToThe')} <Text style={styles.termsLink}>{t('termsAndConditions')}</Text>
              </Text>
            </TouchableOpacity>
          </View>

          <CustomButton
            title={loading ? t('creatingAccount') : t('createAccount')}
            onPress={handleSignUp}
            disabled={loading}
            loading={loading}
          />

          <View style={styles.loginContainer}>
            <Text style={styles.alreadyAccountText}>{t('alreadyHaveAccount')}</Text>
            <TouchableOpacity onPress={() => router.replace('/login')}>
              <Text style={styles.loginText}>{t('login')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 17,
    color: '#000',
  },
  placeholderView: {
    width: 40,
  },
  formContainer: {
    flex: 1,
  },
  welcomeText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 24,
    color: '#000',
    marginBottom: 8,
  },
  subtitleText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#8E8E93',
    marginBottom: 32,
  },
  inputsContainer: {
    marginBottom: 24,
  },
  passwordContainer: {
    position: 'relative',
  },
  eyeIcon: {
    position: 'absolute',
    right: 16,
    top: 42,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  termsText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#3A3A3C',
    marginLeft: 8,
  },
  termsLink: {
    color: '#007AFF',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  alreadyAccountText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#8E8E93',
  },
  loginText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#007AFF',
    marginLeft: 4,
  },
});