import { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { KeyboardScreen } from '@/components/ui';
import { AuthScreenShell, AuthPrimaryButton, AuthFooterLink, PhoneField, PasswordField } from '@/components/auth/shell';
import { authFieldStyles as fieldStyles } from '@/components/auth/field-styles';
import { UchumiLogo } from '@/components/ui/uchumi-logo';
import { Colors, Spacing, Typography } from '@/constants';
import { api } from '@/services/api';
import { saveToken } from '@/services/auth';
import { useKeyboardScroll } from '@/components/ui/keyboard-screen';

export default function RegisterScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name.trim() || !phone.trim() || !password) return;
    setLoading(true);
    try {
      const res = await api.post<{ data: { token: string; role: string } }>('/auth/register', {
        full_name: name.trim(), phone_number: `243${phone.trim()}`, password,
      });
      await saveToken(res.data.data.token);
      router.replace('/(member)/dashboard');
    } catch (e: any) {
      Alert.alert('Inscription échouée', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardScreen>
      <RegisterForm
        name={name} phone={phone} password={password} loading={loading}
        onNameChange={setName} onPhoneChange={setPhone} onPasswordChange={setPassword}
        onSubmit={handleRegister} onLogin={() => router.back()}
      />
    </KeyboardScreen>
  );
}

function RegisterForm({ name, phone, password, loading, onNameChange, onPhoneChange, onPasswordChange, onSubmit, onLogin }: {
  name: string; phone: string; password: string; loading: boolean;
  onNameChange: (v: string) => void; onPhoneChange: (v: string) => void;
  onPasswordChange: (v: string) => void; onSubmit: () => void; onLogin: () => void;
}) {
  const keyboardScroll = useKeyboardScroll();
  const valid = name.trim().length > 1 && phone.trim().length > 8 && password.length >= 6;

  return (
    <AuthScreenShell
      footer={
        <>
          <AuthPrimaryButton label="Créer mon compte" onPress={onSubmit} loading={loading} disabled={!valid} />
          <AuthFooterLink prefix="Déjà un compte ? " action="Se connecter" onPress={onLogin} />
        </>
      }>
      <View style={styles.header}>
        <UchumiLogo style={styles.logo} />
        <Text style={styles.title}>Créer un compte</Text>
        <Text style={styles.subtitle}>Rejoignez Uchumi en quelques minutes</Text>
      </View>

      <View style={styles.fields}>
        <View style={fieldStyles.field}>
          <Text style={fieldStyles.label}>Nom complet</Text>
          <TextInput
            style={fieldStyles.input} placeholder="Ex: Jean Mukendi"
            placeholderTextColor={Colors.iconMuted}
            value={name} onChangeText={onNameChange}
            onFocus={keyboardScroll?.scrollToInput}
            autoCapitalize="words"
          />
        </View>
        <PhoneField
          label="Numéro de téléphone"
          value={phone}
          onChangeText={onPhoneChange}
        />
        <PasswordField
          label="Mot de passe"
          value={password}
          onChangeText={onPasswordChange}
          placeholder="Minimum 6 caractères"
        />
      </View>
    </AuthScreenShell>
  );
}

const styles = StyleSheet.create({
  header: { paddingTop: Spacing.six, paddingBottom: Spacing.five, gap: Spacing.two },
  logo: { width: 100, height: 34, marginBottom: Spacing.three },
  title: { ...Typography.title },
  subtitle: { ...Typography.body },
  fields: { gap: Spacing.three, paddingBottom: Spacing.four },
});
