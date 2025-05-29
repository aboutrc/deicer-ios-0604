import { View, TextInput, Text, StyleSheet, TextInputProps, ViewStyle } from 'react-native';
import { Mail, Lock, User, MapPin, Calendar, Clock } from 'lucide-react-native';

interface CustomInputProps extends TextInputProps {
  label: string;
  icon?: string;
  containerStyle?: ViewStyle;
  error?: string;
}

export default function CustomInput({
  label,
  icon,
  containerStyle,
  error,
  ...props
}: CustomInputProps) {
  const renderIcon = () => {
    if (!icon) return null;

    const iconSize = 20;
    const iconColor = '#8E8E93';

    switch (icon) {
      case 'mail':
        return <Mail size={iconSize} color={iconColor} />;
      case 'lock':
        return <Lock size={iconSize} color={iconColor} />;
      case 'user':
        return <User size={iconSize} color={iconColor} />;
      case 'map-pin':
        return <MapPin size={iconSize} color={iconColor} />;
      case 'calendar':
        return <Calendar size={iconSize} color={iconColor} />;
      case 'clock':
        return <Clock size={iconSize} color={iconColor} />;
      default:
        return null;
    }
  };

  return (
    <View style={[styles.container, containerStyle]}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputContainer, error ? styles.inputError : null]}>
        {icon && <View style={styles.iconContainer}>{renderIcon()}</View>}
        <TextInput
          style={[
            styles.input,
            icon ? styles.inputWithIcon : null,
            props.multiline ? styles.multilineInput : null,
          ]}
          placeholderTextColor="#C7C7CC"
          {...props}
        />
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#3A3A3C',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 10,
    backgroundColor: '#FFF',
  },
  inputError: {
    borderColor: '#FF3B30',
  },
  iconContainer: {
    paddingLeft: 12,
  },
  input: {
    flex: 1,
    height: 46,
    paddingHorizontal: 12,
    fontSize: 15,
    color: '#000',
    fontFamily: 'Inter-Regular',
  },
  inputWithIcon: {
    paddingLeft: 8,
  },
  multilineInput: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  errorText: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#FF3B30',
    marginTop: 4,
  },
});