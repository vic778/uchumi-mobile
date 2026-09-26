import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import { MemberTabBar } from '@/components/navigation/member-tab-bar';
import { BackButton } from '@/components/ui/back-button';
import { TxIcon } from '@/components/ui/tx-icon';
import { Colors, Fonts, Spacing } from '@/constants';
import { getTransactions } from '@/services/member/account';
import type { Transaction } from '@/types';

const CURRENCY = 'CDF';
const fmt = (n: number) => n.toLocaleString('fr-CD') + ' ' + CURRENCY;
const TAB_BAR_H = 70;

const KIND_LABEL: Record<string, string> = {
  deposit:               'Dépôt reçu',
  withdrawal:            'Retrait effectué',
  loan_credit:           'Décaissement prêt',
  transfer_to_blocked:   'Transfert bloqué',
  transfer_from_blocked: 'Transfert débloqué',
};

export default function TransactionsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [all, setAll]           = useState<Transaction[]>([]);
  const [query, setQuery]       = useState('');
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    getTransactions().then(setAll).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const filtered = query.trim()
    ? all.filter(t => (KIND_LABEL[t.kind] ?? t.kind).toLowerCase().includes(query.toLowerCase()))
    : all;

  return (
    <View style={styles.root}>
      {/* Teal header */}
      <View style={[styles.header, { paddingTop: insets.top + 14 }]}>
        <View style={styles.headerRow}>
          <BackButton onPress={() => router.back()} />
          <Text style={styles.headerTitle}>Vos transactions</Text>
          <View style={{ width: 36 }} />
        </View>
      </View>

      {/* Section label */}
      <View style={styles.subHeader}>
        <Text style={styles.subLabel}>VOS TRANSACTIONS</Text>
      </View>

      {/* Search */}
      <View style={styles.searchWrap}>
        <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" style={{ marginRight: 8 }}>
          <Path d="M21 21L15 15M17 11A6 6 0 1 1 5 11A6 6 0 0 1 17 11Z" stroke={Colors.steelGray} strokeWidth={2} strokeLinecap="round" />
        </Svg>
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher"
          placeholderTextColor={Colors.steelGray}
          value={query}
          onChangeText={setQuery}
        />
      </View>

      {loading ? (
        <ActivityIndicator color={Colors.primary} style={{ marginTop: 60 }} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={t => String(t.id)}
          contentContainerStyle={{ paddingBottom: TAB_BAR_H + insets.bottom }}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={<Text style={styles.empty}>Aucune transaction trouvée</Text>}
          renderItem={({ item: tx }) => {
            const isCredit = tx.kind === 'deposit' || tx.kind === 'loan_credit';
            const statusColor = isCredit ? Colors.growth : Colors.danger;
            const statusLabel = isCredit ? 'CRÉDIT' : 'DÉBIT';
            const date = new Date(tx.created_at).toLocaleDateString('fr-CD', {
              day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
            });
            return (
              <View style={styles.txRow}>
                <TxIcon kind={tx.kind} />
                <View style={styles.txMid}>
                  <Text style={styles.txTitle}>{KIND_LABEL[tx.kind] ?? tx.kind}</Text>
                  <Text style={styles.txDesc} numberOfLines={1}>
                    {isCredit ? 'Crédit de' : 'Débit de'} {fmt(tx.amount)} sur votre compte
                  </Text>
                  <Text style={styles.txDate}>{date}</Text>
                </View>
                <View style={styles.txRight}>
                  <Text style={styles.txAmount}>{fmt(tx.amount)}</Text>
                  <Text style={[styles.txStatus, { color: statusColor }]}>{statusLabel}</Text>
                </View>
              </View>
            );
          }}
        />
      )}

      <MemberTabBar active="dashboard" />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  header: { backgroundColor: Colors.primary, paddingHorizontal: Spacing.four, paddingBottom: Spacing.three },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerTitle: { fontFamily: Fonts.bold, fontSize: 16, color: Colors.white },
  subHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.four, paddingTop: Spacing.three, paddingBottom: Spacing.two, borderBottomWidth: 1, borderBottomColor: Colors.coolGray, backgroundColor: Colors.white },
  subLabel: { fontFamily: Fonts.bold, fontSize: 13, color: Colors.primary, letterSpacing: 0.8 },
  searchWrap: { flexDirection: 'row', alignItems: 'center', margin: Spacing.three, backgroundColor: 'rgba(108,122,137,0.12)', borderRadius: 12, paddingHorizontal: Spacing.three, paddingVertical: 10 },
  searchInput: { flex: 1, fontFamily: Fonts.regular, fontSize: 16, color: Colors.charcoal, padding: 0 },
  separator: { height: 1, backgroundColor: Colors.coolGray, marginLeft: Spacing.four + 46 + Spacing.three },
  txRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.three, paddingHorizontal: Spacing.four, paddingVertical: Spacing.three, backgroundColor: Colors.white },
  txMid: { flex: 1 },
  txTitle: { fontFamily: Fonts.bold, fontSize: 14, color: Colors.charcoal },
  txDesc: { fontFamily: Fonts.regular, fontSize: 13, color: Colors.steelGray, marginTop: 2 },
  txDate: { fontFamily: Fonts.regular, fontSize: 12, color: Colors.steelGray, marginTop: 4 },
  txRight: { alignItems: 'flex-end' },
  txAmount: { fontFamily: Fonts.bold, fontSize: 14, color: Colors.charcoal },
  txStatus: { fontFamily: Fonts.bold, fontSize: 12, letterSpacing: 0.5, marginTop: 3 },
  empty: { fontFamily: Fonts.regular, fontSize: 16, color: Colors.steelGray, textAlign: 'center', marginTop: 60 },
});
