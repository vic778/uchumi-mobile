import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Dimensions, FlatList, ScrollView, StyleSheet, Text, View, ViewToken } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ClipboardList, ArrowUp, ArrowDown } from 'lucide-react-native';
import { Colors, Fonts, Spacing } from '@/constants';
import { getAccounts, getBlockedAccountTransactions } from '@/services/member/account';
import type { Account, BlockedAccountTransaction } from '@/types';

const CURRENCY = 'CDF';
const fmt = (n: number) => n.toLocaleString('fr-CD') + ' ' + CURRENCY;
const FREQ: Record<string, string> = { daily: 'Quotidien', weekly: 'Hebdomadaire', monthly: 'Mensuel' };
const SCREEN_W = Dimensions.get('window').width;

export default function AccountsScreen() {
  const insets = useSafeAreaInsets();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [blockedTxs, setBlockedTxs] = useState<BlockedAccountTransaction[]>([]);
  const [txLoading, setTxLoading] = useState(false);

  useEffect(() => {
    getAccounts().then(setAccounts).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const onViewableItemsChanged = useCallback(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0) setActiveIndex(viewableItems[0].index ?? 0);
  }, []);

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 50 }).current;
  const activeAccount = accounts[activeIndex] ?? null;

  // Fetch blocked account transactions when sliding to a blocked account
  useEffect(() => {
    if (activeAccount?.kind !== 'blocked') { setBlockedTxs([]); return; }
    setTxLoading(true);
    getBlockedAccountTransactions(activeAccount.id)
      .then(setBlockedTxs)
      .catch(() => setBlockedTxs([]))
      .finally(() => setTxLoading(false));
  }, [activeAccount?.id, activeAccount?.kind]);

  return (
    <View style={styles.root}>
      <View style={[styles.header, { paddingTop: insets.top + 14 }]}>
        <Text style={styles.headerTitle}>Mes comptes</Text>
      </View>

      {loading ? (
        <ActivityIndicator color={Colors.primary} style={{ marginTop: 60 }} />
      ) : (
        <>
          {/* Account cards carousel */}
          <FlatList
            data={accounts}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(a) => `${a.kind}_${a.id}`}
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={viewabilityConfig}
            style={styles.carousel}
            renderItem={({ item }) => (
              <View style={styles.cardWrap}>
                <View style={[styles.accountCard, item.kind === 'blocked' && styles.accountCardBlocked]}>
                  <View>
                    <Text style={styles.accountTitle}>{item.name ?? 'Compte principal'}</Text>
                    {item.member_since ? (
                      <Text style={styles.accountSub}>
                        Membre depuis{' '}
                        {new Date(item.member_since).toLocaleDateString('fr-CD', { month: 'long', year: 'numeric' })}
                      </Text>
                    ) : (
                      <Text style={styles.accountSub}>Compte bloqué · épargne verrouillée</Text>
                    )}
                  </View>
                  <Text style={styles.balanceAmount}>{fmt(item.balance)}</Text>
                </View>
              </View>
            )}
          />

          {/* Pagination dots */}
          {accounts.length > 1 && (
            <View style={styles.dots}>
              {accounts.map((_, i) => (
                <View key={i} style={[styles.dot, i === activeIndex && styles.dotActive]} />
              ))}
            </View>
          )}

          {/* Content below carousel — differs by account kind */}
          {activeAccount?.kind === 'blocked' ? (
            <BlockedHistory txs={blockedTxs} loading={txLoading} />
          ) : (
            <ScrollView
              contentContainerStyle={[styles.scroll, { paddingBottom: Spacing.four }]}
              showsVerticalScrollIndicator={false}>
              {activeAccount?.savings_plan ? (
                <>
                  <Text style={styles.sectionLabel}>PLAN D'ÉPARGNE</Text>
                  <View style={styles.card}>
                    <InfoRow label="Nom du plan" value={activeAccount.savings_plan.name} />
                    <InfoRow label="Fréquence" value={FREQ[activeAccount.savings_plan.frequency] ?? activeAccount.savings_plan.frequency} />
                    <InfoRow label="Montant cible" value={fmt(activeAccount.savings_plan.amount)} />
                    <InfoRow label="Statut" value={activeAccount.savings_plan.active ? 'Actif' : 'Inactif'} last />
                  </View>
                </>
              ) : (
                <View style={styles.card}>
                  <Text style={styles.emptyText}>
                    Aucun plan d'épargne actif. Contactez un collecteur pour en créer un.
                  </Text>
                </View>
              )}
            </ScrollView>
          )}
        </>
      )}
    </View>
  );
}

function BlockedHistory({ txs, loading }: { txs: BlockedAccountTransaction[]; loading: boolean }) {
  if (loading) return <ActivityIndicator color={Colors.primary} style={{ marginTop: 40 }} />;

  return (
    <View style={{ flex: 1 }}>
      <Text style={[styles.sectionLabel, { marginHorizontal: Spacing.four, marginTop: Spacing.three }]}>
        HISTORIQUE
      </Text>
      {txs.length === 0 ? (
        <View style={styles.emptyHistoryWrap}>
          <ClipboardList size={32} color={Colors.iconMuted} strokeWidth={1.8} />
          <Text style={styles.emptyHistoryText}>Aucune transaction sur ce compte</Text>
        </View>
      ) : (
        <FlatList
          data={txs}
          keyExtractor={(t) => String(t.id)}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: Spacing.four }}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          renderItem={({ item: tx }) => {
            const isCredit = tx.kind === 'deposit';
            const date = new Date(tx.created_at).toLocaleDateString('fr-CD', {
              day: '2-digit', month: 'short', year: 'numeric',
            });
            return (
              <View style={styles.txRow}>
                <View style={[styles.txIcon, { backgroundColor: isCredit ? '#e8f8e8' : '#fce8e8' }]}>
                  {isCredit
                    ? <ArrowDown size={18} color="#22c55e" strokeWidth={2} />
                    : <ArrowUp   size={18} color="#ef4444" strokeWidth={2} />}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.txTitle}>{isCredit ? 'Virement entrant' : 'Virement sortant'}</Text>
                  <Text style={styles.txDate}>{date}</Text>
                </View>
                <Text style={[styles.txAmount, { color: isCredit ? Colors.growth : Colors.danger }]}>
                  {isCredit ? '+' : '-'} {tx.amount.toLocaleString('fr-CD')} CDF
                </Text>
              </View>
            );
          }}
        />
      )}
    </View>
  );
}

function InfoRow({ label, value, last = false }: { label: string; value: string; last?: boolean }) {
  return (
    <View style={[styles.infoRow, !last && styles.infoRowBorder]}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  header: { backgroundColor: Colors.primary, paddingHorizontal: Spacing.four, paddingBottom: Spacing.three },
  headerTitle: { fontFamily: Fonts.bold, fontSize: 18, color: Colors.white },

  carousel: { flexGrow: 0 },
  cardWrap: { width: SCREEN_W, paddingHorizontal: Spacing.four, paddingTop: Spacing.three },
  accountCard: {
    backgroundColor: Colors.cardBlue,
    borderRadius: 16,
    padding: Spacing.four,
    gap: Spacing.three,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  accountCardBlocked: { backgroundColor: '#1a5276' },
  accountTitle: { fontFamily: Fonts.semiBold, fontSize: 16, color: Colors.white },
  accountSub: { fontFamily: Fonts.regular, fontSize: 14, color: 'rgba(255,255,255,0.7)', marginTop: 3 },
  balanceAmount: { fontFamily: Fonts.bold, fontSize: 32, color: Colors.white, letterSpacing: 0.5 },

  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, paddingVertical: Spacing.two },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: Colors.coolGray },
  dotActive: { width: 18, backgroundColor: Colors.primary },

  scroll: { paddingHorizontal: Spacing.four, paddingTop: Spacing.three },
  sectionLabel: { fontFamily: Fonts.bold, fontSize: 13, color: Colors.primary, letterSpacing: 0.8, marginBottom: Spacing.two, paddingHorizontal: 2 },
  card: { backgroundColor: Colors.white, borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: Colors.coolGray },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.three, paddingVertical: Spacing.three },
  infoRowBorder: { borderBottomWidth: 1, borderBottomColor: Colors.coolGray },
  infoLabel: { fontFamily: Fonts.regular, fontSize: 16, color: Colors.steelGray },
  infoValue: { fontFamily: Fonts.semiBold, fontSize: 16, color: Colors.charcoal },
  emptyText: { fontFamily: Fonts.regular, fontSize: 16, color: Colors.steelGray, textAlign: 'center', padding: Spacing.four },

  separator: { height: 1, backgroundColor: Colors.coolGray, marginLeft: Spacing.four + 36 + Spacing.three },
  txRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three, paddingHorizontal: Spacing.four, paddingVertical: Spacing.three, backgroundColor: Colors.white },
  txIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  txTitle: { fontFamily: Fonts.bold, fontSize: 14, color: Colors.charcoal },
  txDate: { fontFamily: Fonts.regular, fontSize: 12, color: Colors.steelGray, marginTop: 2 },
  txAmount: { fontFamily: Fonts.bold, fontSize: 14 },

  emptyHistoryWrap: { alignItems: 'center', paddingTop: 40, gap: Spacing.two },
  emptyHistoryText: { fontFamily: Fonts.regular, fontSize: 15, color: Colors.steelGray },
});
