import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { Colors, Fonts, Spacing } from '@/constants';
import { getLoans, type AdminLoanSummary } from '@/services/admin';
import { LoanCard } from '@/components/admin/loan-card';

const fmtK = (n: number) =>
  n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` :
  n >= 1_000     ? `${(n / 1_000).toFixed(0)}k`     : String(n);

const STATUSES = [
  { value: '',              label: 'Tous'       },
  { value: 'pending',       label: 'En attente' },
  { value: 'offer_sent',    label: 'Offre'      },
  { value: 'member_agreed', label: 'Accordé'    },
  { value: 'approved',      label: 'Approuvé'   },
  { value: 'active',        label: 'Actif'      },
  { value: 'repaid',        label: 'Remboursé'  },
  { value: 'rejected',      label: 'Rejeté'     },
];

function SearchIcon() {
  return (
    <Svg width={15} height={15} viewBox="0 0 24 24" fill="none">
      <Path d="M21 21L16.65 16.65M19 11C19 15.42 15.42 19 11 19C6.58 19 3 15.42 3 11C3 6.58 6.58 3 11 3C15.42 3 19 6.58 19 11Z"
        stroke={Colors.iconMuted} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

export default function AdminLoansScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [loans, setLoans]           = useState<AdminLoanSummary[]>([]);
  const [statusFilter, setStatus]   = useState('');
  const [query, setQuery]           = useState('');
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try { setLoans(await getLoans({ status: statusFilter || undefined })); } catch {}
  }, [statusFilter]);

  useEffect(() => { setLoading(true); load().finally(() => setLoading(false)); }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return loans;
    return loans.filter(l =>
      l.member.full_name.toLowerCase().includes(q) ||
      l.reference.toLowerCase().includes(q)
    );
  }, [loans, query]);

  const totalAmount  = useMemo(() => loans.reduce((s, l) => s + l.amount, 0), [loans]);
  const activeCount  = useMemo(() => loans.filter(l => l.status === 'active').length, [loans]);
  const pendingCount = useMemo(() => loans.filter(l => ['pending', 'offer_sent', 'member_agreed'].includes(l.status)).length, [loans]);

  const ListHeader = (
    <>
      <View style={styles.searchWrap}>
        <SearchIcon />
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher par nom ou référence..."
          placeholderTextColor={Colors.iconMuted}
          value={query}
          onChangeText={setQuery}
          autoCorrect={false}
        />
      </View>
      <View style={styles.listSubHeader}>
        <Text style={styles.listSubLabel}>LISTE DES DOSSIERS</Text>
        <Text style={styles.listSubCount}>{filtered.length} résultat{filtered.length !== 1 ? 's' : ''}</Text>
      </View>
    </>
  );

  return (
    <View style={styles.root}>
      <View style={[styles.header, { paddingTop: insets.top + 14 }]}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>Prêts</Text>
            <Text style={styles.headerSub}>Gestion &amp; Suivi des demandes</Text>
          </View>
        </View>
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Montant total</Text>
            <Text style={styles.statValue}>{fmtK(totalAmount)} CDF</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Actifs / En attente</Text>
            <Text style={styles.statValue}>{activeCount} / {pendingCount}</Text>
          </View>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filterRow}>
        {STATUSES.map((s) => (
          <TouchableOpacity
            key={s.value}
            style={[styles.filterChip, statusFilter === s.value && styles.filterChipActive]}
            onPress={() => setStatus(s.value)}>
            <Text style={[styles.filterLabel, statusFilter === s.value && styles.filterLabelActive]}>
              {s.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={{ flex: 1 }}>
        {loading ? (
          <ActivityIndicator color={Colors.primary} style={{ marginTop: 60 }} />
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={l => String(l.id)}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
            ListHeaderComponent={ListHeader}
            ListEmptyComponent={
              <Text style={styles.emptyText}>
                {query ? 'Aucun résultat pour cette recherche.' : 'Aucun prêt dans cette catégorie.'}
              </Text>
            }
            renderItem={({ item }) => (
              <LoanCard
                item={item}
                onPress={() => router.push(`/(admin)/loans/${item.reference}` as any)}
              />
            )}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  header:      { backgroundColor: Colors.primary, paddingHorizontal: Spacing.four, paddingBottom: Spacing.three, gap: Spacing.three },
  headerTop:   { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  headerTitle: { fontFamily: Fonts.bold, fontSize: 22, color: Colors.white },
  headerSub:   { fontFamily: Fonts.regular, fontSize: 11, color: 'rgba(255,255,255,0.65)', marginTop: 2 },
  statsRow:    { flexDirection: 'row', gap: Spacing.two },
  statCard:    { flex: 1, backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)', padding: Spacing.two + 2 },
  statLabel:   { fontFamily: Fonts.regular, fontSize: 11, color: 'rgba(255,255,255,0.7)', marginBottom: 4 },
  statValue:   { fontFamily: Fonts.bold, fontSize: 15, color: Colors.white },
  filterScroll:    { backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.coolGray, flexGrow: 0 },
  filterRow:       { flexDirection: 'row', gap: 8, paddingHorizontal: Spacing.three, paddingVertical: 10 },
  filterChip:      { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, backgroundColor: '#f1f5f9' },
  filterChipActive:  { backgroundColor: Colors.primary },
  filterLabel:       { fontFamily: Fonts.medium, fontSize: 12, color: Colors.steelGray },
  filterLabelActive: { fontFamily: Fonts.semiBold, color: Colors.white },
  list:          { padding: Spacing.three, gap: Spacing.two + 2, paddingBottom: Spacing.six },
  searchWrap:    { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.coolGray, borderRadius: 12, paddingHorizontal: Spacing.two + 2, paddingVertical: 10, gap: Spacing.two, marginBottom: Spacing.two },
  searchInput:   { flex: 1, fontFamily: Fonts.regular, fontSize: 13, color: Colors.charcoal },
  listSubHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 2, marginBottom: Spacing.one },
  listSubLabel:  { fontFamily: Fonts.bold, fontSize: 10, color: Colors.steelGray, letterSpacing: 0.8 },
  listSubCount:  { fontFamily: Fonts.regular, fontSize: 11, color: Colors.steelGray },
  emptyText:     { fontFamily: Fonts.regular, fontSize: 14, color: Colors.steelGray, textAlign: 'center', paddingVertical: Spacing.six },
});
