import { useRef, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { BackButton } from '@/components/ui/back-button';
import { Colors, Fonts, Spacing } from '@/constants';
import { lookupMember, createDeposit, type CollectorMember } from '@/services/collector';

const CURRENCY = 'CDF';
const fmt = (n: number) => n.toLocaleString('fr-CD') + ' ' + CURRENCY;

function CheckIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path d="M20 6L9 17L4 12" stroke={Colors.white} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export default function NewDepositScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);

  const [step, setStep]         = useState<'lookup' | 'amount'>('lookup');
  const [phone, setPhone]       = useState('');
  const [member, setMember]     = useState<CollectorMember | null>(null);
  const [looking, setLooking]   = useState(false);
  const [amount, setAmount]     = useState('');
  const [notes, setNotes]       = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleLookup = async () => {
    if (!phone.trim()) return;
    setLooking(true);
    try {
      const m = await lookupMember(`243${phone.trim()}`);
      setMember(m);
      setStep('amount');
    } catch {
      Alert.alert('Introuvable', 'Aucun membre trouvé avec ce numéro.');
    } finally {
      setLooking(false);
    }
  };

  const handleSubmit = async () => {
    if (!member) return;
    const parsed = parseInt(amount.replace(/\D/g, ''), 10);
    if (!parsed || parsed <= 0) { Alert.alert('Erreur', 'Veuillez entrer un montant valide.'); return; }

    setSubmitting(true);
    try {
      const txn = await createDeposit({ member_id: member.id, amount: parsed, notes: notes.trim() || undefined });
      Alert.alert(
        'Dépôt enregistré',
        `${fmt(txn.amount)} déposé sur le compte de ${member.full_name}.\nRéf. ${txn.reference}`,
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (e: any) {
      Alert.alert('Erreur', e.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.root}>
        <View style={[styles.header, { paddingTop: insets.top + 14 }]}>
          <BackButton onPress={() => { if (step === 'amount') { setStep('lookup'); setMember(null); } else router.back(); }} />
          <Text style={styles.headerTitle}>Nouveau dépôt</Text>
          <View style={{ width: 38 }} />
        </View>

        <ScrollView ref={scrollRef} contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

          {step === 'lookup' ? (
            <View style={styles.block}>
              <Text style={styles.label}>Numéro du membre</Text>
              <View style={styles.phoneRow}>
                <View style={styles.prefix}>
                  <Text style={styles.prefixText}>+243</Text>
                </View>
                <TextInput
                  style={styles.phoneInput}
                  placeholder="8X XXX XXXX"
                  placeholderTextColor={Colors.iconMuted}
                  keyboardType="phone-pad"
                  value={phone}
                  onChangeText={setPhone}
                  maxLength={9}
                />
              </View>
              <TouchableOpacity
                style={[styles.primaryBtn, (!phone.trim() || looking) && styles.btnDisabled]}
                onPress={handleLookup}
                disabled={!phone.trim() || looking}
                activeOpacity={0.85}>
                <Text style={styles.primaryBtnLabel}>{looking ? 'Recherche...' : 'Trouver le membre'}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.block}>
              {/* Member card */}
              <View style={styles.memberCard}>
                <View style={styles.memberInitials}>
                  <Text style={styles.memberInitialsText}>{member!.initials}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.memberName}>{member!.full_name}</Text>
                  <Text style={styles.memberPhone}>{member!.phone_number}</Text>
                </View>
                <View style={styles.checkBadge}>
                  <CheckIcon />
                </View>
              </View>

              <View style={styles.balanceRow}>
                <Text style={styles.balanceLabel}>Solde actuel</Text>
                <Text style={styles.balanceValue}>{fmt(member!.balance)}</Text>
              </View>

              {/* Amount */}
              <Text style={styles.label}>Montant à déposer</Text>
              <View style={styles.amountWrap}>
                <TextInput
                  style={styles.amountInput}
                  placeholder="0"
                  placeholderTextColor={Colors.iconMuted}
                  keyboardType="numeric"
                  value={amount}
                  onChangeText={setAmount}
                  autoFocus
                />
                <Text style={styles.amountCurrency}>{CURRENCY}</Text>
              </View>

              {amount ? (
                <Text style={styles.amountFormatted}>{fmt(parseInt(amount.replace(/\D/g, ''), 10) || 0)}</Text>
              ) : null}

              <Text style={[styles.label, { marginTop: Spacing.three }]}>Note (optionnel)</Text>
              <TextInput
                style={styles.notesInput}
                placeholder="Ex: cotisation mensuelle..."
                placeholderTextColor={Colors.iconMuted}
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={2}
              />
            </View>
          )}
        </ScrollView>

        {step === 'amount' && (
          <View style={[styles.footer, { paddingBottom: insets.bottom + Spacing.three }]}>
            <TouchableOpacity
              style={[styles.primaryBtn, (submitting || !amount) && styles.btnDisabled]}
              onPress={handleSubmit}
              disabled={submitting || !amount}
              activeOpacity={0.85}>
              <Text style={styles.primaryBtnLabel}>{submitting ? 'Enregistrement...' : 'Confirmer le dépôt'}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  header: { backgroundColor: Colors.primary, paddingHorizontal: Spacing.four, paddingBottom: Spacing.three, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.two },
  headerTitle: { fontFamily: Fonts.bold, fontSize: 18, color: Colors.white, flex: 1, textAlign: 'center' },

  scroll: { padding: Spacing.four, paddingBottom: Spacing.six },
  block: { gap: Spacing.three },

  label: { fontFamily: Fonts.semiBold, fontSize: 15, color: Colors.charcoal },

  phoneRow: { flexDirection: 'row', borderRadius: 12, borderWidth: 1.5, borderColor: Colors.muted, backgroundColor: Colors.white, overflow: 'hidden' },
  prefix: { backgroundColor: Colors.coolGray, paddingHorizontal: Spacing.two + 2, justifyContent: 'center', borderRightWidth: 1, borderRightColor: Colors.muted },
  prefixText: { fontFamily: Fonts.semiBold, fontSize: 15, color: Colors.charcoal },
  phoneInput: { flex: 1, fontFamily: Fonts.regular, fontSize: 16, color: Colors.charcoal, paddingHorizontal: Spacing.two, paddingVertical: 14 },

  memberCard: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three, backgroundColor: Colors.white, borderRadius: 14, padding: Spacing.three, borderWidth: 1, borderColor: Colors.coolGray },
  memberInitials: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#e8f4f8', alignItems: 'center', justifyContent: 'center' },
  memberInitialsText: { fontFamily: Fonts.bold, fontSize: 18, color: Colors.primary },
  memberName: { fontFamily: Fonts.bold, fontSize: 16, color: Colors.charcoal },
  memberPhone: { fontFamily: Fonts.regular, fontSize: 13, color: Colors.steelGray },
  checkBadge: { width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.green, alignItems: 'center', justifyContent: 'center' },

  balanceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#e8f4f8', borderRadius: 12, paddingHorizontal: Spacing.three, paddingVertical: Spacing.two },
  balanceLabel: { fontFamily: Fonts.regular, fontSize: 14, color: Colors.steelGray },
  balanceValue: { fontFamily: Fonts.bold, fontSize: 15, color: Colors.primary },

  amountWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white, borderRadius: 12, borderWidth: 1.5, borderColor: Colors.primary, paddingHorizontal: Spacing.three, gap: Spacing.two },
  amountInput: { flex: 1, fontFamily: Fonts.bold, fontSize: 28, color: Colors.charcoal, paddingVertical: 14 },
  amountCurrency: { fontFamily: Fonts.semiBold, fontSize: 16, color: Colors.steelGray },
  amountFormatted: { fontFamily: Fonts.regular, fontSize: 14, color: Colors.steelGray, textAlign: 'center', marginTop: -Spacing.two },

  notesInput: { backgroundColor: Colors.white, borderRadius: 12, borderWidth: 1.5, borderColor: Colors.muted, paddingHorizontal: Spacing.three, paddingVertical: Spacing.two, fontFamily: Fonts.regular, fontSize: 15, color: Colors.charcoal },

  footer: { paddingHorizontal: Spacing.four, paddingTop: Spacing.two, backgroundColor: Colors.white, borderTopWidth: 1, borderTopColor: Colors.coolGray },
  primaryBtn: { backgroundColor: Colors.primary, borderRadius: 14, paddingVertical: 15, alignItems: 'center' },
  btnDisabled: { opacity: 0.5 },
  primaryBtnLabel: { fontFamily: Fonts.bold, fontSize: 16, color: Colors.white },
});
