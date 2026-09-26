import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { authFieldStyles as fieldStyles } from '@/components/auth/field-styles';
import { AuthPrimaryButton } from '@/components/auth/shell';
import { Colors, Fonts, Spacing } from '@/constants';
import { applyLoan } from '@/services/member/loans';

const DURATIONS = [1, 2, 3, 6, 12];

export default function LoanApplyScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [amount, setAmount] = useState('');
  const [months, setMonths] = useState(3);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    const n = parseInt(amount.replace(/\s/g, ''), 10);
    if (!n || n < 1000) { Alert.alert('Montant invalide', 'Entrez un montant valide (min 1 000 CDF)'); return; }
    setLoading(true);
    try {
      await applyLoan(n, months);
      Alert.alert('Demande envoyée', 'Votre demande de prêt a été soumise. Vous recevrez une réponse sous 3 jours.', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (e: any) {
      Alert.alert('Erreur', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.surface }}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.three }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Demander un prêt</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={fieldStyles.field}>
          <Text style={fieldStyles.label}>Montant souhaité (CDF)</Text>
          <TextInput
            style={fieldStyles.input}
            placeholder="Ex: 50 000"
            placeholderTextColor={Colors.iconMuted}
            keyboardType="numeric"
            value={amount}
            onChangeText={setAmount}
          />
        </View>

        <View style={styles.durationWrap}>
          <Text style={[fieldStyles.label, { marginBottom: Spacing.two }]}>Durée de remboursement</Text>
          <View style={styles.durationRow}>
            {DURATIONS.map((d) => (
              <TouchableOpacity
                key={d}
                style={[styles.durationChip, months === d && styles.durationActive]}
                onPress={() => setMonths(d)}>
                <Text style={[styles.durationLabel, months === d && styles.durationLabelActive]}>
                  {d} mois
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.noteCard}>
          <Text style={styles.noteTitle}>💡 Conditions</Text>
          <Text style={styles.noteText}>• Montant maximum : 2× votre épargne</Text>
          <Text style={styles.noteText}>• Vous devez avoir un compte actif sans prêt en cours</Text>
          <Text style={styles.noteText}>• Réponse en 3 jours maximum</Text>
        </View>

        <AuthPrimaryButton label="Soumettre ma demande" onPress={handleSubmit} loading={loading} disabled={!amount} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: Spacing.four, paddingBottom: Spacing.three, flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  backBtn: { padding: Spacing.one },
  backIcon: { fontSize: 22, color: Colors.charcoal },
  title: { fontFamily: Fonts.bold, fontSize: 22, color: Colors.charcoal },
  scroll: { paddingHorizontal: Spacing.four, paddingBottom: Spacing.six, gap: Spacing.four },
  durationWrap: {},
  durationRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  durationChip: { paddingHorizontal: Spacing.three, paddingVertical: Spacing.one + 2, borderRadius: 20, borderWidth: 1.5, borderColor: Colors.muted },
  durationActive: { backgroundColor: Colors.charcoal, borderColor: Colors.charcoal },
  durationLabel: { fontFamily: Fonts.semiBold, fontSize: 13, color: Colors.steelGray },
  durationLabelActive: { color: Colors.white },
  noteCard: { backgroundColor: Colors.coolGray, borderRadius: 12, padding: Spacing.three, gap: Spacing.one },
  noteTitle: { fontFamily: Fonts.bold, fontSize: 14, color: Colors.charcoal, marginBottom: Spacing.one },
  noteText: { fontFamily: Fonts.regular, fontSize: 13, color: Colors.steelGray },
});
