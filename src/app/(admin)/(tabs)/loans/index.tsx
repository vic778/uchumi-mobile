import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Fonts, Spacing } from '@/constants';
import { getLoans, type AdminLoanSummary } from '@/services/admin';

const ADMIN_DARK  = '#0f172a';
const ADMIN_AMBER = '#f59e0b';
const CURRENCY    = 'CDF';
const fmtK = (n: number) => n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : n >= 1_000 ? `${(n / 1_000).toFixed(0)}k` : String(n);

const STATUSES = [
  { value: '',              label: 'Tous' },
  { value: 'pending',       label: 'En attente' },
  { value: 'offer_sent',    label: 'Offre' },
  { value: 'member_agreed', label: 'Accordé' },
  { value: 'approved',      label: 'Approuvé' },
  { value: 'active',        label: 'Actif' },
  { value: 'repaid',        label: 'Remboursé' },
  { value: 'rejected',      label: 'Rejeté' },
];

const STATUS_COLORS: Record<string, string> = {
  pending:       ADMIN_AMBER,
  offer_sent:    '#a78bfa',
  member_agreed: '#60a5fa',
  approved:      Colors.primary,
  active:        Colors.green,
  repaid:        Colors.growth,
  rejected:      Colors.danger,
};

export default function AdminLoansScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [loans, setLoans]         = useState<AdminLoanSummary[]>([]);
  const [status, setStatus]       = useState('pending');
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try { setLoans(await getLoans({ status: status || undefined })); } catch {}
  }, [status]);

  useEffect(() => { setLoading(true); load().finally(() => setLoading(false)); }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  return (
    <View style={styles.root}>
      <View style={[styles.header, { paddingTop: insets.top + 14 }]}>
        <Text style={styles.headerTitle}>Prêts</Text>
        <Text style={styles.headerCount}>{loans.length}</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={styles.filterRow}>
        {STATUSES.map((s) => (
          <TouchableOpacity
            key={s.value}
            style={[styles.filterChip, status === s.value && styles.filterChipActive]}
            onPress={() => setStatus(s.value)}>
            <Text style={[styles.filterLabel, status === s.value && styles.filterLabelActive]}>{s.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading ? (
        <ActivityIndicator color={Colors.primary} style={{ marginTop: 60 }} />
      ) : (
        <FlatList
          data={loans}
          keyExtractor={l => String(l.id)}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={<Text style={styles.emptyText}>Aucun prêt dans cette catégorie.</Text>}
          renderItem={({ item }) => {
            const color = STATUS_COLORS[item.status] ?? Colors.steelGray;
            return (
              <TouchableOpacity
                style={styles.row}
                onPress={() => router.push(`/(admin)/loans/${item.reference}` as any)}
                activeOpacity={0.7}>
                <View style={[styles.initials, { backgroundColor: color + '18' }]}>
                  <Text style={[styles.initialsText, { color }]}>{item.member.initials}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.name}>{item.member.full_name}</Text>
                  <Text style={styles.ref}>{item.reference}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.amount}>{fmtK(item.amount)} {CURRENCY}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: color + '22' }]}>
                    <Text style={[styles.statusText, { color }]}>
                      {STATUSES.find(s => s.value === item.status)?.label ?? item.status}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  header: { backgroundColor: Colors.primary, paddingHorizontal: Spacing.four, paddingBottom: Spacing.three, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  headerTitle: { fontFamily: Fonts.bold, fontSize: 22, color: Colors.white },
  headerCount: { fontFamily: Fonts.bold, fontSize: 14, color: 'rgba(255,255,255,0.5)' },

  filterScroll: { backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.coolGray },
  filterRow: { flexDirection: 'row', gap: Spacing.two, paddingHorizontal: Spacing.three, paddingVertical: Spacing.two + 2 },
  filterChip: { paddingHorizontal: Spacing.two + 2, paddingVertical: 6, borderRadius: 20, borderWidth: 1.5, borderColor: Colors.muted },
  filterChipActive: { backgroundColor: Colors.primary, borderColor: ADMIN_DARK },
  filterLabel: { fontFamily: Fonts.semiBold, fontSize: 13, color: Colors.steelGray },
  filterLabelActive: { color: Colors.white },

  list: { paddingBottom: Spacing.four, backgroundColor: Colors.white },
  separator: { height: 1, backgroundColor: Colors.coolGray, marginLeft: Spacing.four + 44 + Spacing.three },
  emptyText: { fontFamily: Fonts.regular, fontSize: 14, color: Colors.steelGray, textAlign: 'center', paddingVertical: Spacing.six },

  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three, paddingHorizontal: Spacing.four, paddingVertical: Spacing.two + 2 },
  initials: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  initialsText: { fontFamily: Fonts.bold, fontSize: 16 },
  name: { fontFamily: Fonts.semiBold, fontSize: 15, color: Colors.charcoal },
  ref:  { fontFamily: Fonts.regular, fontSize: 12, color: Colors.steelGray },
  amount: { fontFamily: Fonts.bold, fontSize: 13, color: Colors.charcoal },
  statusBadge: { borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2, marginTop: 2 },
  statusText: { fontFamily: Fonts.bold, fontSize: 10 },
});
