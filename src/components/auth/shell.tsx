import { ReactNode, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { authFieldStyles as styles } from './field-styles';
import { useKeyboardScroll } from '@/components/ui/keyboard-screen';
import { Colors, Spacing } from '@/constants';

export function AuthPrimaryButton({
  label, onPress, loading = false, disabled = false,
  variant = 'dark',
}: {
  label: string; onPress?: () => void; loading?: boolean;
  disabled?: boolean; variant?: 'dark' | 'green' | 'danger' | 'outline';
}) {
  const isDisabled = disabled || loading;
  const darkLabel = variant === 'green' || variant === 'outline';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.primaryButton,
        variant === 'green' && styles.primaryButtonGreen,
        variant === 'danger' && styles.primaryButtonDanger,
        variant === 'outline' && styles.primaryButtonOutline,
        pressed && !isDisabled && styles.pressed,
        isDisabled && styles.disabled,
      ]}>
      <Text style={[styles.primaryButtonLabel, darkLabel && styles.primaryButtonLabelDark,
        variant === 'outline' && styles.primaryButtonLabelOutline]}>
        {loading ? 'Veuillez patienter…' : label}
      </Text>
    </Pressable>
  );
}

export function AuthFooterLink({ prefix, action, onPress }: { prefix: string; action: string; onPress?: () => void }) {
  return (
    <Text style={styles.footer}>
      <Text style={styles.footerPrefix}>{prefix}</Text>
      <Text style={styles.footerAction} onPress={onPress}>{action}</Text>
    </Text>
  );
}

export function PhoneField({
  label,
  countryCode = '+243',
  value,
  onChangeText,
  placeholder = '812 345 678',
}: {
  label: string;
  countryCode?: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
}) {
  const keyboardScroll = useKeyboardScroll();
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.phoneRow}>
        <View style={styles.countryCode}>
          <Text style={styles.countryCodeText}>{countryCode}</Text>
        </View>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={Colors.iconMuted}
          keyboardType="phone-pad"
          style={styles.phoneInput}
          onFocus={(e) => keyboardScroll?.scrollToInput(e)}
          autoCapitalize="none"
        />
      </View>
    </View>
  );
}

export function PasswordField({
  label,
  value,
  onChangeText,
  placeholder = '••••••••',
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
}) {
  const [visible, setVisible] = useState(false);
  const keyboardScroll = useKeyboardScroll();
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputRow}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={Colors.iconMuted}
          secureTextEntry={!visible}
          style={styles.inputFlex}
          onFocus={(e) => keyboardScroll?.scrollToInput(e)}
          autoCapitalize="none"
        />
        <Pressable onPress={() => setVisible(v => !v)} hitSlop={8} accessibilityRole="button"
          accessibilityLabel={visible ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}>
          {visible
            ? <Eye    size={20} color={Colors.steelGray} strokeWidth={1.8} />
            : <EyeOff size={20} color={Colors.steelGray} strokeWidth={1.8} />}
        </Pressable>
      </View>
    </View>
  );
}

export function AuthScreenShell({ children, footer, pinFooter = true }: {
  children: ReactNode; footer: ReactNode; pinFooter?: boolean;
}) {
  const keyboardScroll = useKeyboardScroll();
  const keyboardOpen = keyboardScroll?.keyboardOpen ?? false;
  const insets = useSafeAreaInsets();
  const footerBottom = Math.max(insets.bottom, Spacing.five);
  return (
    <View style={[styles.shell, pinFooter && !keyboardOpen && styles.shellIdle]}>
      <View style={styles.shellTop}>{children}</View>
      <View style={[styles.shellFooter, !pinFooter && styles.shellFooterCompact, { paddingBottom: footerBottom }]}>
        {footer}
      </View>
    </View>
  );
}
