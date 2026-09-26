import { ReactNode, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { authFieldStyles as styles } from './field-styles';
import { useKeyboardScroll } from '@/components/ui/keyboard-screen';
import { Colors, Spacing } from '@/constants';

function EyeIcon({ visible }: { visible: boolean }) {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      {visible ? (
        <>
          <Path d="M2 12C2 12 5 5 12 5C19 5 22 12 22 12C22 12 19 19 12 19C5 19 2 12 2 12Z"
            stroke={Colors.steelGray} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          <Path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z"
            stroke={Colors.steelGray} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        </>
      ) : (
        <>
          <Path d="M9.88 9.88C9.29 10.47 8.93 11.19 8.93 12C8.93 13.66 10.34 15 12 15C12.81 15 13.53 14.71 14.12 14.12"
            stroke={Colors.steelGray} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          <Path d="M10.73 5.08C11.15 5.03 11.58 5 12 5C19 5 22 12 22 12C21.55 12.96 20.99 13.86 20.33 14.68"
            stroke={Colors.steelGray} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          <Path d="M6.61 6.61C4.62 7.96 3.03 9.83 2 12C2 12 5 19 12 19C13.92 19.01 15.79 18.45 17.39 17.39"
            stroke={Colors.steelGray} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          <Path d="M2 2L22 22" stroke={Colors.steelGray} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        </>
      )}
    </Svg>
  );
}

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
          <EyeIcon visible={visible} />
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
