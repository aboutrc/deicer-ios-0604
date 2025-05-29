import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { FileText } from 'lucide-react-native';

interface CustomButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'outline';
  icon?: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export default function CustomButton({
  title,
  onPress,
  disabled = false,
  loading = false,
  variant = 'primary',
  icon,
  style,
  textStyle,
}: CustomButtonProps) {
  const getButtonStyle = () => {
    if (disabled || loading) {
      return [styles.button, styles[`${variant}Button`], styles.disabledButton, style];
    }
    return [styles.button, styles[`${variant}Button`], style];
  };

  const getTextStyle = () => {
    return [styles.buttonText, styles[`${variant}Text`], textStyle];
  };

  const renderIcon = () => {
    if (!icon) return null;
    
    if (icon === 'file-text') {
      return <FileText size={20} color={variant === 'primary' ? '#FFF' : '#007AFF'} style={styles.icon} />;
    }
    
    return null;
  };

  return (
    <TouchableOpacity
      style={getButtonStyle()}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator 
          size="small" 
          color={variant === 'primary' ? '#FFF' : '#007AFF'} 
        />
      ) : (
        <>
          {renderIcon()}
          <Text style={getTextStyle()}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    minWidth: 120,
    backgroundColor: '#1C1C1E',
  },
  primaryButton: {
    backgroundColor: '#2C2C2E',
  },
  secondaryButton: {
    backgroundColor: '#1C1C1E',
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    textAlign: 'center',
    color: '#FFFFFF',
  },
  primaryText: {
    color: '#FFF',
  },
  secondaryText: {
    color: '#3A3A3C',
  },
  outlineText: {
    color: '#007AFF',
  },
  icon: {
    marginRight: 8,
  },
});