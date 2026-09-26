import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { Colors, Fonts, Spacing } from '@/constants';
import { getLoans, type AdminLoanSummary } from '@/services/admin';

const CURRENCY = 'CDF';
const fmt  = (n: number) => n.toLocaleString('fr-CD');
const fmtK = (n: number) =>
  n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` :
  n >= 1_000     ? `${(n / 1_000).toFixed(0)}k`     : String(n);
const fmtD = (s: string) => new Date(s).toLocaleDateString('fr-CD', { day: '2-digit', month: 'short', year: 'numeric' });

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

const STATUS_META: Record<string, { label: string; color: string; bg: string }> = {
  pending:       { label: 'En attente',    color: Colors.warning,  bg: Colors.warning  + '20' },
  offer_sent:    { label: 'Offre envoyée', color: '#8b5cf6',       bg: '#8b5cf620'            },
  member_agreed: { label: 'Accordé',       color: '#0ea5e9',       bg: '#0ea5e920'            },
  approved:      { label: 'Approuvé',      color: '#3b82f6',       bg: '#3b82f620'            },
  active:        { label: 'Actif',         color: Colors.green,    bg: Colors.green    + '20' },
  repaid:        { label: 'Remboursé',     color: Colors.steelGray,bg: Colors.coolGray        },
  rejected:      { label: 'Rejeté',        color: Colors.danger,   bg: Colors.danger   + '20' },
};

const AVATAR_COLORS: Record<string, { bg: string; text: string }> = {
  pending:       { bg: Colors.warning  + '25', text: Colors.warning  },
  offer_sent:    { bg: '#8b5cf625',             text: '#8b5cf6'       },
  member_agreed: { bg: '#0ea5e925',             text: '#0ea5e9'       },
  approved:      { bg: '#3b82f625',             text: '#3b82f6'       },
  active:        { bg: Colors.green   + '25',   text: Colors.green    },
  repaid:        { bg: Colors.coolGray,          text: Colors.steelGray},
  rejected:      { bg: Colors.danger  + '20',   text: Colors.danger   },
};

function SearchIcon() {
  return (
    <Svg width={15} height={15} viewBox="0 0 24 24" fill="none">
      <Path d="M21 21L16.65 16.65M19 11C19 15.42 15.42 19 11 19C6.58 19 3 15.42 3 11C3 6.58 6.58 3 11 3C15.42 3 19 6.58 19 11Z"
        stroke={Colors.iconMuted} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

function ChevronRight({ color }: { color: string }) {
  return (
    <Svg width={12} height={12} viewBox="0 0 24 24" fill="none">
      <Path d="M9 18L15 12L9 6" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

// ─── Loan Card ───────────────────────────────────────────────────────────────
function LoanCard({ item, onPress }: { item: AdminLoanSummary; onPress: () => void }) {
  const meta   = STATUS_META[item.status]   ?? { label: item.status, color: Colors.steelGray, bg: Colors.coolGray };
  const avatar = AVATAR_COLORS[item.status] ?? { bg: Colors.coolGray, text: Colors.steelGray };
  const isActive   = item.status === 'active';
  const isPending  = ['pending', 'offer_sent', 'member_agreed'].includes(item.status);
  const isApproved = item.status === 'approved';

  const footerText = isActive   ? `Remb. en cours`
                   : isApproved ? 'Prêt pour décaissement'
                   : isPending  ? `Soumis le ${fmtD(item.created_at)}`
                   : item.status === 'repaid' ? 'Entièrement remboursé'
                   : item.status === 'rejected' ? 'Demande refusée'
                   : fmtD(item.created_at);

  const actionLabel = isApproved ? 'Décaisser' : isPending ? 'Examiner' : 'Détails';

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.75}>
      {/* Top row */}
      <View style={styles.cardTop}>
        <View style={styles.cardTopLeft}>
          <View style={[styles.avatar, { backgroundColor: avatar.bg }]}>
            <Text style={[styles.avatarText, { color: avatar.text }]}>{item.member.initials}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.memberName} numberOfLines={1}>{item.member.full_name}</Text>
            <View style={styles.refRow}>
              <Text style={styles.refText}>Réf: {item.reference}</Text>
            </View>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: meta.bg, borderColor: meta.color + '60' }]}>
          {isActive && <View style={[styles.statusDot, { backgroundColor: meta.color }]} />}
          <Text style={[styles.statusText, { color: meta.color }]}>{meta.label}</Text>
        </View>
      </View>

      {/* Amount + progress */}
      <View style={styles.cardMiddle}>
        <View style={styles.amountRow}>
          <Text style={styles.amountLabel}>
            {isActive ? 'Montant du prêt' : isApproved ? 'Montant approuvé' : 'Montant demandé'}
          </Text>
          <Text style={styles.amountValue}>
            {fmt(item.amount)}{' '}
            <Text style={styles.amountCurrency}>{CURRENCY}</Text>
          </Text>
        </View>
        {isActive && (
          <View style={styles.progressWrap}>
            <View style={styles.progressBg}>
              <View style={[styles.progressFill, { width: '0%' }]} />
            </View>
          </View>
        )}
      </View>

      {/* Footer strip */}
      <View style={styles.footerStrip}>
        <Text style={styles.footerText} numberOfLines={1}>{footerText}</Text>
        <TouchableOpacity style={styles.footerAction} onPress={onPress} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={[styles.footerActionText, { color: isApproved ? Colors.green : Colors.primary }]}>
            {actionLabel}
          </Text>
          <ChevronRight color={isApproved ? Colors.green : Colors.primary} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

// ─── Screen ──────────────────────────────────────────────────────────────────
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
  const activeCount  = useMemo(() => loans.filter(l => l.status === 'active').length,  [loans]);
  const pendingCount = useMemo(() => loans.filter(l => ['pending', 'offer_sent', 'member_agreed'].includes(l.status)).length, [loans]);

  const ListHeader = (
    <>
      {/* Search */}
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
      {/* Subheader */}
      <View style={styles.listSubHeader}>
        <Text style={styles.listSubLabel}>LISTE DES DOSSIERS</Text>
        <Text style={styles.listSubCount}>{filtered.length} résultat{filtered.length !== 1 ? 's' : ''}</Text>
      </View>
    </>
  );

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 14 }]}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>Prêts</Text>
            <Text style={styles.headerSub}>Gestion &amp; Suivi des demandes</Text>
          </View>
        </View>
        {/* Mini stat cards */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Montant total</Text>
            <Text style={styles.statValue}>{fmtK(totalAmount)} {CURRENCY}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Actifs / En attente</Text>
            <Text style={styles.statValue}>{activeCount} / {pendingCount}</Text>
          </View>
        </View>
      </View>

      {/* Filter pills */}
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
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },

  // Header
  header: { backgroundColor: Colors.primary, paddingHorizontal: Spacing.four, paddingBottom: Spacing.three, gap: Spacing.three },
  headerTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  headerTitle: { fontFamily: Fonts.bold, fontSize: 22, color: Colors.white },
  headerSub:   { fontFamily: Fonts.regular, fontSize: 11, color: 'rgba(255,255,255,0.65)', marginTop: 2 },

  statsRow: { flexDirection: 'row', gap: Spacing.two },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    padding: Spacing.two + 2,
  },
  statLabel: { fontFamily: Fonts.regular, fontSize: 11, color: 'rgba(255,255,255,0.7)', marginBottom: 4 },
  statValue: { fontFamily: Fonts.bold, fontSize: 15, color: Colors.white },

  // Filters
  filterScroll: { backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.coolGray },
  filterRow:    { flexDirection: 'row', gap: 8, paddingHorizontal: Spacing.three, paddingVertical: 10 },
  filterChip:   { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, backgroundColor: '#f1f5f9' },
  filterChipActive: { backgroundColor: Colors.primary },
  filterLabel:      { fontFamily: Fonts.medium, fontSize: 12, color: Colors.steelGray },
  filterLabelActive:{ fontFamily: Fonts.semiBold, color: Colors.white },

  // List
  list: { padding: Spacing.three, gap: Spacing.two + 2, paddingBottom: Spacing.six },

  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.coolGray,
    borderRadius: 12,
    paddingHorizontal: Spacing.two + 2,
    paddingVertical: 10,
    gap: Spacing.two,
    marginBottom: Spacing.two,
  },
  searchInput: { flex: 1, fontFamily: Fonts.regular, fontSize: 13, color: Colors.charcoal },

  listSubHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 2, marginBottom: Spacing.one },
  listSubLabel:  { fontFamily: Fonts.bold, fontSize: 10, color: Colors.steelGray, letterSpacing: 0.8 },
  listSubCount:  { fontFamily: Fonts.regular, fontSize: 11, color: Colors.steelGray },

  emptyText: { fontFamily: Fonts.regular, fontSize: 14, color: Colors.steelGray, textAlign: 'center', paddingVertical: Spacing.six },

  // Card
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: Spacing.three,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    gap: 0,
  },

  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: Spacing.two + 2,
    borderBottomWidth: 1,
    borderBottomColor: Colors.coolGray,
  },
  cardTopLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, flex: 1, marginRight: Spacing.two },
  avatar:     { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontFamily: Fonts.bold, fontSize: 15 },
  memberName: { fontFamily: Fonts.bold, fontSize: 14, color: Colors.charcoal },
  refRow:     { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  refText:    { fontFamily: Fonts.regular, fontSize: 11, color: Colors.steelGray },

  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 20, borderWidth: 1, paddingHorizontal: 8, paddingVertical: 4 },
  statusDot:   { width: 6, height: 6, borderRadius: 3 },
  statusText:  { fontFamily: Fonts.bold, fontSize: 10 },

  cardMiddle:   { paddingVertical: Spacing.two + 2 },
  amountRow:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 },
  amountLabel:  { fontFamily: Fonts.regular, fontSize: 11, color: Colors.steelGray },
  amountValue:  { fontFamily: Fonts.bold, fontSize: 18, color: Colors.charcoal },
  amountCurrency: { fontFamily: Fonts.semiBold, fontSize: 11, color: Colors.primary },

  progressWrap: { marginTop: 4 },
  progressBg:   { height: 6, backgroundColor: Colors.coolGray, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: 6, backgroundColor: Colors.green, borderRadius: 3 },

  footerStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.background,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.coolGray,
    paddingHorizontal: Spacing.two + 2,
    paddingVertical: 8,
  },
  footerText:       { fontFamily: Fonts.regular, fontSize: 11, color: Colors.steelGray, flex: 1 },
  footerAction:     { flexDirection: 'row', alignItems: 'center', gap: 3 },
  footerActionText: { fontFamily: Fonts.bold, fontSize: 12 },
});
