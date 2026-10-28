import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Colors, Fonts, Spacing } from '@/constants';

const CURRENCY  = 'CDF';
const ADMIN_DARK = '#0f172a';

type Props = {
  status: string;
  acting: boolean;
  rejectNotes: string;
  repayAmount: string;
  onRejectNotesChange: (v: string) => void;
  onRepayAmountChange: (v: string) => void;
  onApprove: () => void;
  onFund:    () => void;
  onReject:  () => void;
  onRepay:   () => void;
};

export function LoanActionsCard({
  status, acting,
  rejectNotes, repayAmount,
  onRejectNotesChange, onRepayAmountChange,
  onApprove, onFund, onReject, onRepay,
}: Props) {
  if (status === 'pending') {
    return (
      <View style={styles.card}>
        <Text style={styles.sectionLabel}>ACTIONS</Text>
        <View style={styles.actionsRow}>
          <TouchableOpacity style={[styles.btn, styles.btnPrimary]} disabled={acting} onPress={onApprove} activeOpacity={0.85}>
            <Text style={[styles.btnText, { color: Colors.white }]}>Approuver</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.divider} />
        <Text style={styles.fieldLabel}>Motif de refus</Text>
        <TextInput
          style={styles.notesInput}
          placeholder="Raison du refus..."
          placeholderTextColor={Colors.iconMuted}
          value={rejectNotes}
          onChangeText={onRejectNotesChange}
          multiline
          numberOfLines={2}
        />
        <TouchableOpacity style={[styles.btn, styles.btnReject]} disabled={acting} onPress={onReject} activeOpacity={0.85}>
          <Text style={[styles.btnText, { color: Colors.danger }]}>Refuser</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (status === 'approved') {
    return (
      <View style={styles.card}>
        <Text style={styles.sectionLabel}>ACTIONS</Text>
        <TouchableOpacity style={[styles.btn, styles.btnPrimary]} disabled={acting} onPress={onFund} activeOpacity={0.85}>
          <Text style={[styles.btnText, { color: Colors.white }]}>Décaisser les fonds</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (status === 'active') {
    return (
      <View style={styles.card}>
        <Text style={styles.sectionLabel}>ENREGISTRER UN REMBOURSEMENT</Text>
        <TextInput
          style={styles.amountInput}
          placeholder={`Montant en ${CURRENCY}`}
          placeholderTextColor={Colors.iconMuted}
          keyboardType="numeric"
          value={repayAmount}
          onChangeText={onRepayAmountChange}
        />
        <TouchableOpacity
          style={[styles.btn, styles.btnPrimary, !repayAmount && styles.btnDisabled]}
          disabled={acting || !repayAmount}
          onPress={onRepay}
          activeOpacity={0.85}>
          <Text style={[styles.btnText, { color: Colors.white }]}>Enregistrer</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  card:         { backgroundColor: Colors.white, borderRadius: 14, padding: Spacing.three, borderWidth: 1, borderColor: Colors.coolGray, gap: Spacing.two },
  sectionLabel: { fontFamily: Fonts.bold, fontSize: 11, color: Colors.steelGray, letterSpacing: 0.8 },
  divider:      { height: 1, backgroundColor: Colors.coolGray },
  actionsRow:   { flexDirection: 'row', gap: Spacing.two },
  btn:          { borderRadius: 12, paddingVertical: 13, alignItems: 'center', borderWidth: 1.5 },
  btnPrimary:   { backgroundColor: Colors.primary, borderColor: ADMIN_DARK, flex: 1 },
  btnReject:    { borderColor: Colors.danger + '50', backgroundColor: Colors.danger + '10', flex: 1 },
  btnDisabled:  { opacity: 0.4 },
  btnText:      { fontFamily: Fonts.bold, fontSize: 15 },
  fieldLabel:   { fontFamily: Fonts.semiBold, fontSize: 14, color: Colors.charcoal },
  notesInput:   { borderWidth: 1.5, borderColor: Colors.muted, borderRadius: 10, padding: Spacing.two, fontFamily: Fonts.regular, fontSize: 15, color: Colors.charcoal, textAlignVertical: 'top' },
  amountInput:  { borderWidth: 1.5, borderColor: Colors.muted, borderRadius: 12, padding: Spacing.two + 2, fontFamily: Fonts.regular, fontSize: 18, color: Colors.charcoal, textAlign: 'center' },
});
