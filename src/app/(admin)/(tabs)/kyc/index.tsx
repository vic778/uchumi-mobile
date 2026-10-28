import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Fonts, Spacing } from '@/constants';
import { getKyc, type AdminKYC } from '@/services/admin';



const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  pending:  { bg: Colors.warning + '22', text: Colors.warning },
  approved: { bg: Colors.growth + '22',  text: Colors.growth  },
  rejected: { bg: Colors.danger + '22',  text: Colors.danger  },
};

const STATUS_LABELS: Record<string, string> = {
  pending:  'En attente',
  approved: 'Approuvé',
  rejected: 'Refusé',
};

const FILTERS = [
  { value: '',         label: 'Tous' },
  { value: 'pending',  label: 'En attente' },
  { value: 'approved', label: 'Approuvé' },
  { value: 'rejected', label: 'Refusé' },
];

export default function AdminKYCScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [docs, setDocs]           = useState<AdminKYC[]>([]);
  const [filter, setFilter]       = useState('pending');
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try { setDocs(await getKyc({ status: filter || undefined })); } catch {}
  }, [filter]);

  useEffect(() => { setLoading(true); load().finally(() => setLoading(false)); }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  const pending = docs.filter(d => d.status === 'pending').length;

  return (
    <View style={styles.root}>
      <View style={[styles.header, { paddingTop: insets.top + 14 }]}>
        <Text style={styles.headerTitle}>KYC</Text>
        {pending > 0 && <Text style={styles.pendingBadge}>{pending} à traiter</Text>}
      </View>

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

      {loading ? (
        <ActivityIndicator color={Colors.primary} style={{ marginTop: 60 }} />
      ) : (
        <FlatList
          data={docs}
          keyExtractor={d => String(d.id)}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={<Text style={styles.emptyText}>Aucun document.</Text>}
          renderItem={({ item }) => {
            const sc = STATUS_COLORS[item.status] ?? STATUS_COLORS.pending;
            return (
              <TouchableOpacity
                style={styles.row}
                onPress={() => router.push(`/(admin)/kyc/${item.id}` as any)}
                activeOpacity={0.7}>
                <View style={styles.initials}>
                  <Text style={styles.initialsText}>{item.member.initials}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.name}>{item.member.full_name}</Text>
                  <Text style={styles.docLabel}>{item.label}</Text>
                  <View style={styles.docsRow}>
                    {[['R', item.has_front], ['V', item.has_back], ['P', item.has_selfie]].map(([abbr, ok], i) => (
                      <View key={i} style={[styles.docChip, ok ? styles.docChipOk : styles.docChipMissing]}>
                        <Text style={[styles.docChipText, ok ? styles.docChipTextOk : styles.docChipTextMissing]}>{abbr as string}</Text>
                      </View>
                    ))}
                  </View>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: sc.bg }]}>
                  <Text style={[styles.statusText, { color: sc.text }]}>{STATUS_LABELS[item.status] ?? item.status}</Text>
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
  root:   { flex: 1, backgroundColor: Colors.background },
  header: { backgroundColor: Colors.primary, paddingHorizontal: Spacing.four, paddingBottom: Spacing.three, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  headerTitle: { fontFamily: Fonts.bold, fontSize: 22, color: Colors.white },
  pendingBadge: { fontFamily: Fonts.bold, fontSize: 12, color: Colors.warning },

  filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two, padding: Spacing.three, backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.coolGray },
  filterChip: { paddingHorizontal: Spacing.two + 2, paddingVertical: 6, borderRadius: 20, borderWidth: 1.5, borderColor: Colors.muted },
  filterChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filterLabel: { fontFamily: Fonts.semiBold, fontSize: 13, color: Colors.steelGray },
  filterLabelActive: { color: Colors.white },

  list: { paddingBottom: Spacing.four, backgroundColor: Colors.white },
  separator: { height: 1, backgroundColor: Colors.coolGray, marginLeft: Spacing.four + 44 + Spacing.three },
  emptyText: { fontFamily: Fonts.regular, fontSize: 14, color: Colors.steelGray, textAlign: 'center', paddingVertical: Spacing.six },

  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three, paddingHorizontal: Spacing.four, paddingVertical: Spacing.two + 2 },
  initials: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.primary + '15', alignItems: 'center', justifyContent: 'center' },
  initialsText: { fontFamily: Fonts.bold, fontSize: 16, color: Colors.primary },
  name: { fontFamily: Fonts.semiBold, fontSize: 15, color: Colors.charcoal },
  docLabel: { fontFamily: Fonts.regular, fontSize: 13, color: Colors.steelGray },
  docsRow: { flexDirection: 'row', gap: 4, marginTop: 4 },
  docChip: { borderRadius: 4, paddingHorizontal: 5, paddingVertical: 1 },
  docChipOk: { backgroundColor: Colors.growth + '22' },
  docChipMissing: { backgroundColor: Colors.coolGray },
  docChipText: { fontFamily: Fonts.bold, fontSize: 10 },
  docChipTextOk: { color: Colors.growth },
  docChipTextMissing: { color: Colors.steelGray },
  statusBadge: { borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4 },
  statusText: { fontFamily: Fonts.bold, fontSize: 11 },
});
