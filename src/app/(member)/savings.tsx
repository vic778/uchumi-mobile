import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Dimensions, FlatList, ScrollView, StyleSheet, Text, View, ViewToken } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Fonts, Spacing } from '@/constants';
import { getAccounts } from '@/services/member/account';
import type { Account } from '@/types';

const CURRENCY = 'CDF';
const fmt = (n: number) => n.toLocaleString('fr-CD') + ' ' + CURRENCY;
const FREQ: Record<string, string> = { daily: 'Quotidien', weekly: 'Hebdomadaire', monthly: 'Mensuel' };
const SCREEN_W = Dimensions.get('window').width;

export default function AccountsScreen() {
  const insets = useSafeAreaInsets();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    getAccounts().then(setAccounts).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const onViewableItemsChanged = useCallback(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0) setActiveIndex(viewableItems[0].index ?? 0);
  }, []);

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 50 }).current;
  const activeAccount = accounts[activeIndex] ?? null;

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
            keyExtractor={(a) => String(a.id)}
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={viewabilityConfig}
            style={styles.carousel}
            renderItem={({ item }) => (
              <View style={styles.cardWrap}>
                <View style={styles.accountCard}>
                  <View>
                    <Text style={styles.accountTitle}>{item.name ?? 'Compte principal'}</Text>
                    {item.member_since && (
                      <Text style={styles.accountSub}>
                        Membre depuis{' '}
                        {new Date(item.member_since).toLocaleDateString('fr-CD', { month: 'long', year: 'numeric' })}
                      </Text>
                    )}
                  </View>
                  <Text style={styles.balanceAmount}>{fmt(item.balance)}</Text>
                </View>
              </View>
            )}
          />

          {/* Pagination dots — only shown when there are multiple accounts */}
          {accounts.length > 1 && (
            <View style={styles.dots}>
              {accounts.map((_, i) => (
                <View key={i} style={[styles.dot, i === activeIndex && styles.dotActive]} />
              ))}
            </View>
          )}

          {/* Savings plan for active account */}
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
        </>
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
});
