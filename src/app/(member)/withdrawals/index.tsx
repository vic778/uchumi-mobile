import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Plus, ArrowUpFromLine } from 'lucide-react-native';
import { StatusBadge } from '@/components/ui/status-badge';
import { Colors, Fonts, Spacing } from '@/constants';
import { getWithdrawals } from '@/services/member/withdrawals';
import type { Withdrawal } from '@/types';

const fmt = (n: number) => n.toLocaleString('fr-CD') + ' CDF';

export default function WithdrawalsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [items, setItems] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getWithdrawals().then(setItems).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <View style={styles.root}>
      <View style={[styles.header, { paddingTop: insets.top + 14 }]}>
        <Text style={styles.headerTitle}>Retraits</Text>
        <TouchableOpacity style={styles.newBtn} onPress={() => router.push('/(member)/withdrawals/new' as any)}>
          <Plus size={16} color="#fff" strokeWidth={2.2} style={{ marginRight: 4 }} />
          <Text style={styles.newLabel}>Nouveau</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator color={Colors.primary} style={{ marginTop: 60 }} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(w) => String(w.id)}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <View style={styles.emptyIcon}>
                <ArrowUpFromLine size={32} color={Colors.iconMuted} strokeWidth={1.8} />
              </View>
              <Text style={styles.emptyTitle}>Aucun retrait</Text>
              <Text style={styles.emptyText}>Vos demandes de retrait apparaîtront ici</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.row}>
              <View style={styles.rowIcon}>
                <ArrowUpFromLine size={20} color="#f59e0b" strokeWidth={2} />
              </View>
              <View style={styles.rowMid}>
                <Text style={styles.rowTitle}>Demande de retrait</Text>
                <Text style={styles.rowDate}>
                  {new Date(item.created_at).toLocaleDateString('fr-CD', { day: '2-digit', month: 'short', year: 'numeric' })}
                </Text>
              </View>
              <View style={styles.rowRight}>
                <Text style={styles.rowAmount}>{fmt(item.amount)}</Text>
                <StatusBadge status={item.status} />
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },

  header: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.three,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: { fontFamily: Fonts.bold, fontSize: 18, color: Colors.white },
  newBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.green,
    borderRadius: 10,
    paddingHorizontal: Spacing.three,
    paddingVertical: 8,
    gap: 2,
  },
  newLabel: { fontFamily: Fonts.semiBold, fontSize: 14, color: Colors.white },

  list: { paddingTop: Spacing.two, paddingBottom: Spacing.four, backgroundColor: Colors.white },
  separator: { height: 1, backgroundColor: Colors.coolGray, marginLeft: Spacing.four + 46 + Spacing.three },

  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three, paddingHorizontal: Spacing.four, paddingVertical: Spacing.three, backgroundColor: Colors.white },
  rowIcon: { width: 46, height: 46, borderRadius: 12, backgroundColor: '#fef3e2', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  rowMid: { flex: 1 },
  rowTitle: { fontFamily: Fonts.bold, fontSize: 14, color: Colors.charcoal },
  rowDate: { fontFamily: Fonts.regular, fontSize: 12, color: Colors.steelGray, marginTop: 3 },
  rowRight: { alignItems: 'flex-end', gap: 4 },
  rowAmount: { fontFamily: Fonts.bold, fontSize: 14, color: Colors.charcoal },

  emptyWrap: { alignItems: 'center', paddingTop: 60, paddingHorizontal: Spacing.five },
  emptyIcon: { width: 64, height: 64, borderRadius: 32, backgroundColor: Colors.coolGray, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.three },
  emptyTitle: { fontFamily: Fonts.bold, fontSize: 16, color: Colors.charcoal, marginBottom: Spacing.one },
  emptyText: { fontFamily: Fonts.regular, fontSize: 14, color: Colors.steelGray, textAlign: 'center' },
});
