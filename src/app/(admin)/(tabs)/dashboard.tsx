import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Bell } from 'lucide-react-native';
import { TxIcon } from '@/components/ui/tx-icon';
import { TxDetailModal, type TxDetailData } from '@/components/ui/tx-detail-modal';
import { KpiCard, UsersIcon, PiggyIcon, CreditIcon, ClockIcon } from '@/components/admin/kpi-card';
import { ComboChart, COLOR_DEPOSIT, COLOR_LOAN, COLOR_RATIO } from '@/components/admin/combo-chart';
import { LoanStatusCard, LOAN_STATUS_META } from '@/components/admin/loan-status-card';
import { Colors, Fonts, Spacing } from '@/constants';
import { getDashboard, type AdminDashboard } from '@/services/admin';

const CURRENCY = 'CDF';
const fmt  = (n: number) => n.toLocaleString('fr-CD');
const fmtK = (n: number) =>
  n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` :
  n >= 1_000     ? `${(n / 1_000).toFixed(0)}k`     : String(n);

const TX_META: Record<string, { label: string; credit: boolean }> = {
  deposit:        { label: 'Dépôt',        credit: true  },
  loan_credit:    { label: 'Crédit',        credit: true  },
  withdrawal:     { label: 'Retrait',       credit: false },
  loan_repayment: { label: 'Remboursement', credit: false },
};

export default function AdminDashboardScreen() {
  const insets  = useSafeAreaInsets();
  const router  = useRouter();
  const [data, setData]             = useState<AdminDashboard | null>(null);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTx, setSelectedTx] = useState<TxDetailData | null>(null);

  const load = useCallback(async () => {
    try { setData(await getDashboard()); } catch {}
  }, []);

  useEffect(() => { load().finally(() => setLoading(false)); }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  if (loading) return (
    <View style={[styles.root, { alignItems: 'center', justifyContent: 'center' }]}>
      <ActivityIndicator color={Colors.primary} size="large" />
    </View>
  );

  const d       = data!;
  const pending = d.pending_withdrawals + d.pending_loans;

  return (
    <View style={styles.root}>
      <View style={[styles.header, { paddingTop: insets.top + 14 }]}>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerSub}>ADMINISTRATION</Text>
          <Text style={styles.headerTitle}>Tableau de bord</Text>
        </View>
        {pending > 0 && (
          <TouchableOpacity style={styles.alertPill} onPress={() => router.push('/(admin)/withdrawals' as any)}>
            <Text style={styles.alertPillText}>{pending} en attente</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.bellBtn} onPress={() => router.push('/(admin)/notifications' as any)} activeOpacity={0.75}>
          <Bell size={22} color={Colors.white} strokeWidth={1.8} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: Spacing.six }]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}>

        {/* KPI grid */}
        <View style={styles.kpiGrid}>
          <KpiCard label="MEMBRES"       value={fmt(d.members_count)}       sub={`${d.collectors_count} collecteur${d.collectors_count !== 1 ? 's' : ''}`} iconBg={Colors.primary + '18'} Icon={() => <UsersIcon color={Colors.primary} />} />
          <KpiCard label="ÉPARGNE TOTALE" value={fmtK(d.total_savings)}     sub={CURRENCY}                                                                  iconBg={Colors.green   + '22'} Icon={() => <PiggyIcon color={Colors.green}   />} />
          <KpiCard label="CRÉDITS ACTIFS" value={String(d.active_loans_count)} sub={`${fmtK(d.total_outstanding)} ${CURRENCY} restants`}                   iconBg='#F5A62322'             Icon={() => <CreditIcon color={COLOR_LOAN}    />} />
          <KpiCard label="EN ATTENTE"     value={String(pending)}            sub={`${d.pending_withdrawals} retraits · ${d.pending_loans} prêts`}           iconBg={pending > 0 ? Colors.danger + '18' : Colors.coolGray} Icon={() => <ClockIcon color={pending > 0 ? Colors.danger : Colors.steelGray} />} />
        </View>

        {/* Chart */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.cardTitle}>Dépôts &amp; Crédits mensuels</Text>
              <Text style={styles.cardSub}>6 derniers mois</Text>
            </View>
            <View style={styles.legend}>
              {[{ color: COLOR_DEPOSIT, label: 'Dépôts' }, { color: COLOR_LOAN, label: 'Crédits' }].map(({ color, label }) => (
                <View key={label} style={styles.legendItem}>
                  <View style={[styles.legendSwatch, { backgroundColor: color }]} />
                  <Text style={styles.legendLabel}>{label}</Text>
                </View>
              ))}
              <View style={styles.legendItem}>
                <View style={[styles.legendLine, { backgroundColor: COLOR_RATIO }]} />
                <Text style={styles.legendLabel}>Ratio</Text>
              </View>
            </View>
          </View>
          <ComboChart labels={d.chart_labels} deposits={d.chart_deposits} loans={d.chart_loans} ratio={d.chart_ratio} />
        </View>

        {/* Loan statuses */}
        <LoanStatusCard statuses={d.loan_statuses} />

        {/* Recent transactions */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Transactions récentes</Text>
            <TouchableOpacity onPress={() => router.push('/(admin)/transactions' as any)}>
              <Text style={styles.seeAll}>Voir tout →</Text>
            </TouchableOpacity>
          </View>
{d.recent_transactions.length === 0 && <Text style={styles.emptyText}>Aucune transaction récente.</Text>}
          {d.recent_transactions.map((t) => {
            const meta   = TX_META[t.kind] ?? { label: t.kind, credit: false };
            const amtClr = meta.credit ? Colors.growth : Colors.danger;
            const sign   = meta.credit ? '+' : '−';
            return (
              <TouchableOpacity key={t.id} style={styles.tableRow} onPress={() => setSelectedTx({ ...t })} activeOpacity={0.7}>
                <TxIcon kind={t.kind} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.tdName} numberOfLines={1}>{t.member ?? '—'}</Text>
                  <Text style={styles.tdKind}>{meta.label}</Text>
                </View>
                <Text style={[styles.tdAmount, { color: amtClr }]}>{sign}{fmtK(t.amount)}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Recent loans */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Prêts récents</Text>
            <TouchableOpacity onPress={() => router.push('/(admin)/(tabs)/loans' as any)}>
              <Text style={styles.seeAll}>Voir tout →</Text>
            </TouchableOpacity>
          </View>
          {d.recent_loans.length === 0 && <Text style={styles.emptyText}>Aucun prêt récent.</Text>}
          {d.recent_loans.map((l) => {
            const meta   = LOAN_STATUS_META[l.status] ?? { label: l.status, color: Colors.steelGray };
            const member = typeof l.member === 'string' ? l.member : (l.member as any)?.full_name ?? '—';
            return (
              <TouchableOpacity key={l.id} style={styles.loanRow} onPress={() => router.push(`/(admin)/loans/${l.reference}` as any)} activeOpacity={0.7}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.loanMember}>{member}</Text>
                  <Text style={styles.loanRef}>{l.reference}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.loanAmount}>{fmtK(l.amount)} <Text style={styles.loanCurrency}>{CURRENCY}</Text></Text>
                  <View style={[styles.loanBadge, { backgroundColor: meta.color + '22' }]}>
                    <Text style={[styles.loanBadgeText, { color: meta.color }]}>{meta.label}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      <TxDetailModal tx={selectedTx} onClose={() => setSelectedTx(null)} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  header:        { backgroundColor: Colors.primary, paddingHorizontal: Spacing.four, paddingBottom: Spacing.three, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  headerSub:     { fontFamily: Fonts.bold, fontSize: 10, color: 'rgba(255,255,255,0.6)', letterSpacing: 1.2 },
  headerTitle:   { fontFamily: Fonts.bold, fontSize: 22, color: '#fff' },
  alertPill:     { backgroundColor: Colors.danger, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 },
  alertPillText: { fontFamily: Fonts.bold, fontSize: 12, color: '#fff' },
  bellBtn:       { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center', marginLeft: Spacing.two },
  scroll:        { padding: Spacing.four, gap: Spacing.three },
  kpiGrid:       { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  card:          { backgroundColor: Colors.white, borderRadius: 14, padding: Spacing.three, borderWidth: 1, borderColor: Colors.coolGray, gap: Spacing.two },
  cardHeader:    { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  cardTitle:     { fontFamily: Fonts.bold, fontSize: 14, color: Colors.charcoal },
  cardSub:       { fontFamily: Fonts.regular, fontSize: 12, color: Colors.steelGray, marginTop: 2 },
  seeAll:        { fontFamily: Fonts.semiBold, fontSize: 12, color: Colors.primary },
  legend:        { flexDirection: 'row', gap: Spacing.two, flexWrap: 'wrap', justifyContent: 'flex-end' },
  legendItem:    { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendSwatch:  { width: 10, height: 10, borderRadius: 2 },
  legendLine:    { width: 16, height: 2, borderRadius: 1 },
  legendLabel:   { fontFamily: Fonts.regular, fontSize: 10, color: Colors.steelGray },
  tableRow:      { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: Colors.coolGray },
  tdName:        { fontFamily: Fonts.medium, fontSize: 13, color: Colors.charcoal },
  tdKind:        { fontFamily: Fonts.regular, fontSize: 12, color: Colors.steelGray, marginTop: 1 },
  tdAmount:      { fontFamily: Fonts.bold, fontSize: 13 },
  loanRow:       { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: Colors.coolGray },
  loanMember:    { fontFamily: Fonts.medium, fontSize: 14, color: Colors.charcoal },
  loanRef:       { fontFamily: Fonts.regular, fontSize: 11, color: Colors.steelGray },
  loanAmount:    { fontFamily: Fonts.bold, fontSize: 13, color: Colors.charcoal },
  loanCurrency:  { fontFamily: Fonts.regular, fontSize: 11, color: Colors.steelGray },
  loanBadge:     { borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2, marginTop: 2 },
  loanBadgeText: { fontFamily: Fonts.bold, fontSize: 10 },
  emptyText:     { fontFamily: Fonts.regular, fontSize: 13, color: Colors.steelGray, textAlign: 'center', paddingVertical: Spacing.two },
});
