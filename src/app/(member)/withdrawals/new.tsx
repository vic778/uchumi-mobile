import { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BackButton } from '@/components/ui/back-button';
import { AuthPrimaryButton } from '@/components/auth/shell';
import { Colors, Fonts, Spacing } from '@/constants';
import { getAccount } from '@/services/member/account';
import { requestWithdrawal } from '@/services/member/withdrawals';

export default function NewWithdrawalScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState<number | null>(null);

  useEffect(() => {
    getAccount().then((a) => setBalance(a.balance)).catch(() => {});
  }, []);

  const numericValue = parseInt(amount.replace(/\s/g, ''), 10);
  const formatted = !isNaN(numericValue)
    ? numericValue.toLocaleString('fr-CD') + ' CDF'
    : '0 CDF';

  const handleSubmit = async () => {
    if (!numericValue || numericValue < 500) {
      Alert.alert('Montant invalide', 'Le montant minimum est de 500 CDF');
      return;
    }
    setLoading(true);
    try {
      await requestWithdrawal(numericValue);
      Alert.alert('Demande envoyée', 'Votre demande de retrait a été soumise.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (e: any) {
      Alert.alert('Erreur', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 14 }]}>
        <BackButton onPress={() => router.back()} />
        <Text style={styles.headerTitle}>Nouveau retrait</Text>
        <View style={{ width: 38 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>

        {/* Center: amount entry */}
        <View style={styles.centerBlock}>
          <View style={styles.balanceChip}>
            <Text style={styles.balanceChipLabel}>Montant disponible</Text>
            <Text style={styles.balanceChipValue}>
              {balance !== null ? balance.toLocaleString('fr-CD') + ' CDF' : '—'}
            </Text>
          </View>
          <Text style={styles.amountLabel}>Montant à retirer</Text>
          <Text style={styles.amountDisplay}>{formatted}</Text>
          <View style={styles.inputWrap}>
            <TextInput
              style={styles.input}
              placeholder="Ex: 10 000"
              placeholderTextColor={Colors.iconMuted}
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
              autoFocus
            />
          </View>
        </View>

        {/* Bottom: note + button */}
        <View style={[styles.bottom, { paddingBottom: Math.max(insets.bottom, Spacing.five) }]}>
          <View style={styles.note}>
            <Text style={styles.noteText}>
              💡 Le retrait sera traité par votre collecteur ou l'administration Uchumi sous 24–48h.
            </Text>
          </View>
          <AuthPrimaryButton
            label="Soumettre la demande"
            onPress={handleSubmit}
            loading={loading}
            disabled={!amount || isNaN(numericValue) || numericValue < 500}
          />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },

  header: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.three,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: { fontFamily: Fonts.bold, fontSize: 18, color: Colors.white, flex: 1, textAlign: 'center' },

  centerBlock: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.five,
    paddingTop: 56,
    gap: Spacing.three,
  },
  balanceChip: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.coolGray,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    alignItems: 'center',
    marginBottom: Spacing.two,
  },
  balanceChipLabel: { fontFamily: Fonts.regular, fontSize: 13, color: Colors.steelGray, marginBottom: 2 },
  balanceChipValue: { fontFamily: Fonts.bold, fontSize: 18, color: Colors.primary },

  amountLabel: { fontFamily: Fonts.medium, fontSize: 15, color: Colors.steelGray },
  amountDisplay: { fontFamily: Fonts.bold, fontSize: 36, color: Colors.charcoal, letterSpacing: 0.5 },
  inputWrap: {
    width: '100%',
    backgroundColor: Colors.white,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.coolGray,
    paddingHorizontal: Spacing.four,
    paddingVertical: 14,
  },
  input: {
    fontFamily: Fonts.semiBold,
    fontSize: 18,
    color: Colors.charcoal,
    textAlign: 'center',
    padding: 0,
  },

  bottom: {
    paddingHorizontal: Spacing.four,
    gap: Spacing.three,
    paddingTop: Spacing.three,
  },
  note: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.coolGray,
    padding: Spacing.three,
  },
  noteText: { fontFamily: Fonts.regular, fontSize: 14, color: Colors.steelGray, lineHeight: 20 },
});
