import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import { Colors, Fonts, Spacing } from '@/constants';
import { getMe } from '@/services/auth';
import { getDashboard, type CollectorDashboard, type DashboardDeposit } from '@/services/collector';

const CURRENCY = 'CDF';
const fmt = (n: number) => n.toLocaleString('fr-CD') + ' ' + CURRENCY;

function PlusIcon({ color = Colors.white }: { color?: string }) {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path d="M12 5V19M5 12H19" stroke={color} strokeWidth={2.2} strokeLinecap="round" />
    </Svg>
  );
}

export default function CollectorDashboard() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [data, setData]         = useState<CollectorDashboard | null>(null);
  const [userName, setUserName] = useState('');
  const [loading, setLoading]   = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const [dashboard, me] = await Promise.all([getDashboard(), getMe()]);
      setData(dashboard);
      setUserName(me.full_name ?? '');
    } catch {}
  }, []);

  useEffect(() => { load().finally(() => setLoading(false)); }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  const initials = userName.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase() || 'C';

  return (
    <View style={styles.root}>
      <View style={[styles.header, { paddingTop: insets.top + 14 }]}>
        <View style={styles.headerInner}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerSub}>Bonjour,</Text>
            <Text style={styles.headerName} numberOfLines={1}>{userName || 'Collecteur'}</Text>
          </View>
        </View>

        {/* Quick action */}
        <TouchableOpacity
          style={styles.depositBtn}
          onPress={() => router.push('/(collector)/deposits/new' as any)}
          activeOpacity={0.85}>
          <PlusIcon />
          <Text style={styles.depositBtnLabel}>Nouveau dépôt</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator color={Colors.primary} style={{ marginTop: 60 }} />
      ) : (
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}>

          {/* Stats row */}
          <View style={styles.statsRow}>
            <StatCard
              label="Aujourd'hui"
              value={fmt(data?.today_total ?? 0)}
              sub={`${data?.today_count ?? 0} dépôt${(data?.today_count ?? 0) !== 1 ? 's' : ''}`}
              accent={Colors.green} />
            <StatCard
              label="Retraits\napprouvés"
              value={String(data?.approved_withdrawals ?? 0)}
              sub="à décaisser"
              accent={Colors.primary}
              onPress={() => router.push('/(collector)/(tabs)/withdrawals' as any)} />
            <StatCard
              label="Prêts\nà débloquer"
              value={String(data?.loans_to_disburse ?? 0)}
              sub="en attente"
              accent="#e67e22"
              onPress={() => router.push('/(collector)/(tabs)/loans' as any)} />
          </View>

          {/* Recent deposits */}
          <Text style={styles.sectionTitle}>DÉPÔTS RÉCENTS</Text>
          <View style={styles.card}>
            {(data?.recent_deposits ?? []).length === 0 ? (
              <Text style={styles.emptyText}>Aucun dépôt enregistré.</Text>
            ) : (
              data!.recent_deposits.map((d, i) => (
                <DepositRow key={d.id} item={d} last={i === data!.recent_deposits.length - 1} />
              ))
            )}
          </View>
        </ScrollView>
      )}
    </View>
  );
}

function StatCard({ label, value, sub, accent, onPress }: {
  label: string; value: string; sub: string; accent: string; onPress?: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.statCard, { borderTopColor: accent, borderTopWidth: 3 }]}
      onPress={onPress} activeOpacity={onPress ? 0.75 : 1} disabled={!onPress}>
      <Text style={[styles.statValue, { color: accent }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statSub}>{sub}</Text>
    </TouchableOpacity>
  );
}

function DepositRow({ item, last }: { item: DashboardDeposit; last: boolean }) {
  return (
    <View style={[styles.row, !last && styles.rowBorder]}>
      <View style={styles.rowDot} />
      <View style={{ flex: 1 }}>
        <Text style={styles.rowName}>{item.member}</Text>
        <Text style={styles.rowRef}>{item.reference}</Text>
      </View>
      <Text style={[styles.rowAmount, { color: Colors.green }]}>+{item.amount.toLocaleString('fr-CD')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },

  header: { backgroundColor: Colors.primary, paddingHorizontal: Spacing.four, paddingBottom: Spacing.three, gap: Spacing.three },
  headerInner: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  avatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontFamily: Fonts.bold, fontSize: 16, color: Colors.white },
  headerSub: { fontFamily: Fonts.regular, fontSize: 13, color: 'rgba(255,255,255,0.75)' },
  headerName: { fontFamily: Fonts.bold, fontSize: 18, color: Colors.white },

  depositBtn: { backgroundColor: Colors.green, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.two, paddingVertical: 12 },
  depositBtnLabel: { fontFamily: Fonts.bold, fontSize: 16, color: Colors.white },

  scroll: { paddingHorizontal: Spacing.four, paddingTop: Spacing.three, paddingBottom: Spacing.six },

  statsRow: { flexDirection: 'row', gap: Spacing.two, marginBottom: Spacing.four },
  statCard: { flex: 1, backgroundColor: Colors.white, borderRadius: 12, padding: Spacing.two + 2, borderWidth: 1, borderColor: Colors.coolGray },
  statValue: { fontFamily: Fonts.bold, fontSize: 16, marginTop: 2 },
  statLabel: { fontFamily: Fonts.regular, fontSize: 11, color: Colors.steelGray, marginTop: 2, lineHeight: 14 },
  statSub: { fontFamily: Fonts.regular, fontSize: 11, color: Colors.iconMuted, marginTop: 2 },

  sectionTitle: { fontFamily: Fonts.bold, fontSize: 12, color: Colors.steelGray, letterSpacing: 0.8, marginBottom: Spacing.two },
  card: { backgroundColor: Colors.white, borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: Colors.coolGray },
  emptyText: { fontFamily: Fonts.regular, fontSize: 14, color: Colors.steelGray, textAlign: 'center', paddingVertical: Spacing.four },

  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three, paddingHorizontal: Spacing.three, paddingVertical: Spacing.two + 2 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: Colors.coolGray },
  rowDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.green },
  rowName: { fontFamily: Fonts.semiBold, fontSize: 14, color: Colors.charcoal },
  rowRef: { fontFamily: Fonts.regular, fontSize: 12, color: Colors.steelGray },
  rowAmount: { fontFamily: Fonts.bold, fontSize: 14 },
});
