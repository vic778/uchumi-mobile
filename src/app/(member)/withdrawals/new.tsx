import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { authFieldStyles as fieldStyles } from '@/components/auth/field-styles';
import { BackButton } from '@/components/ui/back-button';
import { AuthPrimaryButton } from '@/components/auth/shell';
import { Colors, Fonts, Spacing } from '@/constants';
import { requestWithdrawal } from '@/services/member/withdrawals';

export default function NewWithdrawalScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    const n = parseInt(amount.replace(/\s/g, ''), 10);
    if (!n || n < 500) { Alert.alert('Montant invalide', 'Minimum 500 CDF'); return; }
    setLoading(true);
    try {
      await requestWithdrawal(n);
      Alert.alert('Demande envoyée', 'Votre demande de retrait a été soumise.', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (e: any) {
      Alert.alert('Erreur', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <View style={[styles.header, { paddingTop: insets.top + 14 }]}>
        <BackButton onPress={() => router.back()} />
        <Text style={styles.title}>Nouveau retrait</Text>
        <View style={{ width: 38 }} />
      </View>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={fieldStyles.field}>
          <Text style={fieldStyles.label}>Montant (CDF)</Text>
          <TextInput
            style={fieldStyles.input} placeholder="Ex: 10 000"
            placeholderTextColor={Colors.iconMuted}
            keyboardType="numeric" value={amount} onChangeText={setAmount}
          />
        </View>
        <View style={styles.note}>
          <Text style={styles.noteText}>Le retrait sera traité par votre collecteur ou l'administration Uchumi.</Text>
        </View>
        <AuthPrimaryButton label="Soumettre" onPress={handleSubmit} loading={loading} disabled={!amount} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { backgroundColor: Colors.primary, paddingHorizontal: Spacing.four, paddingBottom: Spacing.three, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.two },
  title: { fontFamily: Fonts.bold, fontSize: 18, color: Colors.white, flex: 1, textAlign: 'center' },
  scroll: { paddingHorizontal: Spacing.four, paddingBottom: Spacing.six, gap: Spacing.four },
  note: { backgroundColor: Colors.coolGray, borderRadius: 12, padding: Spacing.three },
  noteText: { fontFamily: Fonts.regular, fontSize: 15, color: Colors.steelGray },
});
