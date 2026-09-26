import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { KeyboardScreen } from '@/components/ui';
import { AuthScreenShell, AuthPrimaryButton, AuthFooterLink, PhoneField, PasswordField } from '@/components/auth/shell';
import { UchumiLogo } from '@/components/ui/uchumi-logo';
import { Spacing, Typography } from '@/constants';
import { login, saveToken } from '@/services/auth';

export default function LoginScreen() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!phone.trim() || !password) return;
    setLoading(true);
    try {
      const res = await login(`243${phone.trim()}`, password);
      await saveToken(res.token);
      if (res.role === 'member')         router.replace('/(member)/(tabs)/dashboard');
      else if (res.role === 'collector') router.replace('/(collector)/dashboard' as any);
      else Alert.alert('Accès refusé', 'Ce compte ne peut pas se connecter via l\'application mobile.');
    } catch (e: any) {
      Alert.alert('Connexion échouée', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardScreen>
      <LoginForm
        phone={phone} password={password}
        loading={loading}
        onPhoneChange={setPhone} onPasswordChange={setPassword}
        onSubmit={handleLogin}
        onRegister={() => router.push('/(auth)/register')}
      />
    </KeyboardScreen>
  );
}

function LoginForm({
  phone, password, loading,
  onPhoneChange, onPasswordChange, onSubmit, onRegister,
}: {
  phone: string; password: string; loading: boolean;
  onPhoneChange: (v: string) => void; onPasswordChange: (v: string) => void;
  onSubmit: () => void; onRegister: () => void;
}) {
  return (
    <AuthScreenShell
      footer={
        <>
          <AuthPrimaryButton label="Se connecter" onPress={onSubmit} loading={loading} disabled={!phone || !password} />
          <AuthFooterLink prefix="Pas encore de compte ? " action="S'inscrire" onPress={onRegister} />
        </>
      }>
      <View style={styles.header}>
        <UchumiLogo style={styles.logo} />
        <Text style={styles.title}>Bienvenue</Text>
        <Text style={styles.subtitle}>Connectez-vous à votre compte Uchumi</Text>
      </View>

      <View style={styles.fields}>
        <PhoneField
          label="Numéro de téléphone"
          value={phone}
          onChangeText={onPhoneChange}
        />

        <PasswordField
          label="Mot de passe"
          value={password}
          onChangeText={onPasswordChange}
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
