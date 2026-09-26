import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { Colors, Fonts, Spacing } from '@/constants';
import { getMembers, type AdminMember } from '@/services/admin';


const CURRENCY   = 'CDF';
const fmt = (n: number) => n.toLocaleString('fr-CD');

const FILTERS = [
  { value: '',          label: 'Tous' },
  { value: 'active',    label: 'Actifs' },
  { value: 'suspended', label: 'Suspendus' },
];

function SearchIcon() {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Path d="M21 21L16.65 16.65M19 11C19 15.42 15.42 19 11 19C6.58 19 3 15.42 3 11C3 6.58 6.58 3 11 3C15.42 3 19 6.58 19 11Z"
        stroke={Colors.steelGray} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

export default function AdminMembersScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [members, setMembers]   = useState<AdminMember[]>([]);
  const [query, setQuery]       = useState('');
  const [filter, setFilter]     = useState('');
  const [loading, setLoading]   = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try { setMembers(await getMembers({ status: filter || undefined })); } catch {}
  }, [filter]);

  useEffect(() => { setLoading(true); load().finally(() => setLoading(false)); }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  const filtered = query.trim()
    ? members.filter(m =>
        m.full_name.toLowerCase().includes(query.toLowerCase()) ||
        m.phone_number.includes(query.replace(/\s/g, ''))
      )
    : members;

  return (
    <View style={styles.root}>
      <View style={[styles.header, { paddingTop: insets.top + 14 }]}>
        <Text style={styles.headerTitle}>Membres</Text>
        <Text style={styles.headerCount}>{members.length}</Text>
      </View>

      {/* Filters */}
      <View style={styles.filterRow}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f.value}
            style={[styles.filterChip, filter === f.value && styles.filterChipActive]}
            onPress={() => setFilter(f.value)}>
            <Text style={[styles.filterLabel, filter === f.value && styles.filterLabelActive]}>{f.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Search */}
      <View style={styles.searchWrap}>
        <SearchIcon />
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher par nom ou numéro..."
          placeholderTextColor={Colors.iconMuted}
          value={query}
          onChangeText={setQuery}
          autoCorrect={false}
        />
      </View>

      {loading ? (
        <ActivityIndicator color={Colors.primary} style={{ marginTop: 60 }} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={m => String(m.id)}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              {query ? 'Aucun résultat.' : 'Aucun membre.'}
            </Text>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.row}
              onPress={() => router.push(`/(admin)/members/${encodeURIComponent(item.phone_number)}` as any)}
              activeOpacity={0.7}>
              <View style={[styles.initials, item.status === 'suspended' && styles.initialsWarning]}>
                <Text style={[styles.initialsText, item.status === 'suspended' && { color: Colors.danger }]}>{item.initials}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.nameRow}>
                  <Text style={styles.name}>{item.full_name}</Text>
                  {item.role === 'collector' && <View style={styles.collectorBadge}><Text style={styles.collectorBadgeText}>C</Text></View>}
                  {item.status === 'suspended' && <View style={styles.suspendedBadge}><Text style={styles.suspendedBadgeText}>Suspendu</Text></View>}
                </View>
                <Text style={styles.phone}>{item.phone_number}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.balance}>{fmt(item.balance)} {CURRENCY}</Text>
                {item.active_loan && <Text style={styles.loanBadge}>crédit actif</Text>}
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root:   { flex: 1, backgroundColor: Colors.background },
  header: { backgroundColor: Colors.primary, paddingHorizontal: Spacing.four, paddingBottom: Spacing.three, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  headerTitle: { fontFamily: Fonts.bold, fontSize: 22, color: Colors.white },
  headerCount: { fontFamily: Fonts.bold, fontSize: 14, color: 'rgba(255,255,255,0.5)' },

  filterRow: { flexDirection: 'row', gap: Spacing.two, padding: Spacing.three, backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.coolGray },
  filterChip: { paddingHorizontal: Spacing.two + 2, paddingVertical: 6, borderRadius: 20, borderWidth: 1.5, borderColor: Colors.muted },
  filterChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filterLabel: { fontFamily: Fonts.semiBold, fontSize: 13, color: Colors.steelGray },
  filterLabelActive: { color: Colors.white },

  searchWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.coolGray, paddingHorizontal: Spacing.four, gap: Spacing.two },
  searchInput: { flex: 1, fontFamily: Fonts.regular, fontSize: 15, color: Colors.charcoal, paddingVertical: 12 },

  list: { paddingBottom: Spacing.four, backgroundColor: Colors.white },
  separator: { height: 1, backgroundColor: Colors.coolGray, marginLeft: Spacing.four + 44 + Spacing.three },
  emptyText: { fontFamily: Fonts.regular, fontSize: 14, color: Colors.steelGray, textAlign: 'center', paddingVertical: Spacing.six },

  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three, paddingHorizontal: Spacing.four, paddingVertical: Spacing.two + 2 },
  initials: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.primary + '15', alignItems: 'center', justifyContent: 'center' },
  initialsWarning: { backgroundColor: Colors.danger + '18' },
  initialsText: { fontFamily: Fonts.bold, fontSize: 16, color: Colors.primary },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  name: { fontFamily: Fonts.semiBold, fontSize: 15, color: Colors.charcoal },
  phone: { fontFamily: Fonts.regular, fontSize: 13, color: Colors.steelGray },
  balance: { fontFamily: Fonts.bold, fontSize: 13, color: Colors.charcoal },
  loanBadge: { fontFamily: Fonts.medium, fontSize: 10, color: Colors.primary, marginTop: 2 },
  collectorBadge: { backgroundColor: Colors.primary + '22', borderRadius: 6, paddingHorizontal: 5, paddingVertical: 1 },
  collectorBadgeText: { fontFamily: Fonts.bold, fontSize: 10, color: Colors.primary },
  suspendedBadge: { backgroundColor: Colors.danger + '18', borderRadius: 6, paddingHorizontal: 5, paddingVertical: 1 },
  suspendedBadgeText: { fontFamily: Fonts.bold, fontSize: 10, color: Colors.danger },
});
