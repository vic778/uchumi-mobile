import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { BackButton } from '@/components/ui/back-button';
import { Colors, Fonts, Spacing } from '@/constants';
import { getMember, type CollectorMember, type CollectorTransaction } from '@/services/collector';

const CURRENCY = 'CDF';
const fmt = (n: number) => n.toLocaleString('fr-CD') + ' ' + CURRENCY;

const KIND_LABELS: Record<string, string> = {
  deposit:              'Dépôt',
  withdrawal:           'Retrait',
  loan_credit:          'Prêt',
  transfer_to_blocked:  'Transfert épargne bloquée',
  transfer_from_blocked:'Retour épargne bloquée',
};

function PlusIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path d="M12 5V19M5 12H19" stroke={Colors.white} strokeWidth={2.2} strokeLinecap="round" />
    </Svg>
  );
}

export default function CollectorMemberDetailScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const [member, setMember] = useState<CollectorMember | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!phone) return;
    getMember(phone)
      .then(setMember)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [phone]);

  return (
    <View style={styles.root}>
      <View style={[styles.header, { paddingTop: insets.top + 14 }]}>
        <BackButton onPress={() => router.back()} />
        <Text style={styles.headerTitle} numberOfLines={1}>{member?.full_name ?? 'Membre'}</Text>
        <View style={{ width: 38 }} />
      </View>

      {loading ? (
        <ActivityIndicator color={Colors.primary} style={{ marginTop: 60 }} />
      ) : !member ? (
        <View style={styles.errorWrap}>
          <Text style={styles.errorText}>Membre introuvable.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Profile card */}
          <View style={styles.profileCard}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{member.initials}</Text>
            </View>
            <Text style={styles.profileName}>{member.full_name}</Text>
            <Text style={styles.profilePhone}>{member.phone_number}</Text>
            <View style={styles.balanceChip}>
              <Text style={styles.balanceLabel}>Solde disponible</Text>
              <Text style={styles.balanceValue}>{fmt(member.balance)}</Text>
            </View>
          </View>

          {/* Quick deposit */}
          <TouchableOpacity
            style={styles.depositBtn}
            onPress={() => router.push('/(collector)/deposits/new' as any)}
            activeOpacity={0.85}>
            <PlusIcon />
            <Text style={styles.depositBtnLabel}>Effectuer un dépôt</Text>
          </TouchableOpacity>

          {/* Recent transactions */}
          <Text style={styles.sectionTitle}>HISTORIQUE RÉCENT</Text>
          <View style={styles.card}>
            {(member.recent_transactions ?? []).length === 0 ? (
              <Text style={styles.emptyText}>Aucune transaction.</Text>
            ) : (
              member.recent_transactions!.map((txn, i) => (
                <TxnRow key={txn.id} txn={txn} last={i === member.recent_transactions!.length - 1} />
              ))
            )}
          </View>
        </ScrollView>
      )}
    </View>
  );
}

function TxnRow({ txn, last }: { txn: CollectorTransaction; last: boolean }) {
  const isCredit = txn.kind === 'deposit' || txn.kind === 'loan_credit' || txn.kind === 'transfer_from_blocked';
  return (
    <View style={[styles.row, !last && styles.rowBorder]}>
      <View style={{ flex: 1 }}>
        <Text style={styles.rowKind}>{KIND_LABELS[txn.kind] ?? txn.kind}</Text>
        <Text style={styles.rowRef}>{txn.reference}</Text>
        <Text style={styles.rowDate}>{new Date(txn.created_at).toLocaleDateString('fr-CD', { day: '2-digit', month: 'short', year: 'numeric' })}</Text>
      </View>
      <Text style={[styles.rowAmount, { color: isCredit ? Colors.green : Colors.danger }]}>
        {isCredit ? '+' : '-'}{txn.amount.toLocaleString('fr-CD')}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  header: { backgroundColor: Colors.primary, paddingHorizontal: Spacing.four, paddingBottom: Spacing.three, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.two },
  headerTitle: { fontFamily: Fonts.bold, fontSize: 18, color: Colors.white, flex: 1, textAlign: 'center' },

  scroll: { paddingHorizontal: Spacing.four, paddingTop: Spacing.three, paddingBottom: Spacing.six },

  profileCard: { backgroundColor: Colors.white, borderRadius: 16, padding: Spacing.four, alignItems: 'center', gap: Spacing.two, borderWidth: 1, borderColor: Colors.coolGray, marginBottom: Spacing.three },
  avatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#e8f4f8', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontFamily: Fonts.bold, fontSize: 24, color: Colors.primary },
  profileName: { fontFamily: Fonts.bold, fontSize: 20, color: Colors.charcoal },
  profilePhone: { fontFamily: Fonts.regular, fontSize: 14, color: Colors.steelGray },
  balanceChip: { backgroundColor: '#e8f4f8', borderRadius: 12, paddingHorizontal: Spacing.three, paddingVertical: Spacing.two, alignItems: 'center', marginTop: Spacing.one },
  balanceLabel: { fontFamily: Fonts.regular, fontSize: 12, color: Colors.steelGray },
  balanceValue: { fontFamily: Fonts.bold, fontSize: 18, color: Colors.primary },

  depositBtn: { backgroundColor: Colors.green, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.two, paddingVertical: 12, marginBottom: Spacing.four },
  depositBtnLabel: { fontFamily: Fonts.bold, fontSize: 16, color: Colors.white },

  sectionTitle: { fontFamily: Fonts.bold, fontSize: 12, color: Colors.steelGray, letterSpacing: 0.8, marginBottom: Spacing.two },
  card: { backgroundColor: Colors.white, borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: Colors.coolGray },
  emptyText: { fontFamily: Fonts.regular, fontSize: 14, color: Colors.steelGray, textAlign: 'center', paddingVertical: Spacing.three },

  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, paddingHorizontal: Spacing.three, paddingVertical: Spacing.two + 2 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: Colors.coolGray },
  rowKind: { fontFamily: Fonts.semiBold, fontSize: 14, color: Colors.charcoal },
  rowRef: { fontFamily: Fonts.regular, fontSize: 12, color: Colors.steelGray },
  rowDate: { fontFamily: Fonts.regular, fontSize: 12, color: Colors.steelGray },
  rowAmount: { fontFamily: Fonts.bold, fontSize: 15 },

  errorWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errorText: { fontFamily: Fonts.regular, fontSize: 16, color: Colors.steelGray },
});
