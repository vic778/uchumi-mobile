import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { G, Line, Path, Rect, Text as SvgText } from 'react-native-svg';
import { Colors, Fonts, Spacing } from '@/constants';
import { getDashboard, type AdminDashboard } from '@/services/admin';

const ADMIN_DARK  = '#0f172a';
const ADMIN_AMBER = '#f59e0b';
const CURRENCY    = 'CDF';

const fmt  = (n: number) => n.toLocaleString('fr-CD');
const fmtK = (n: number) => n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : n >= 1_000 ? `${(n / 1_000).toFixed(0)}k` : String(n);

const LOAN_STATUS_LABELS: Record<string, string> = {
  pending:      'En attente',
  offer_sent:   'Offre envoyée',
  member_agreed:'Accord membre',
  approved:     'Approuvé',
  active:       'Actif',
  repaid:       'Remboursé',
  rejected:     'Rejeté',
};

const LOAN_STATUS_COLORS: Record<string, string> = {
  pending:      Colors.warning,
  offer_sent:   '#a78bfa',
  member_agreed:'#60a5fa',
  approved:     Colors.primary,
  active:       Colors.green,
  repaid:       Colors.growth,
  rejected:     Colors.danger,
};

const TXKIND: Record<string, { label: string; color: string }> = {
  deposit:      { label: 'Dépôt',    color: Colors.growth },
  withdrawal:   { label: 'Retrait',  color: Colors.danger },
  loan_credit:  { label: 'Prêt',     color: Colors.primary },
  loan_repayment: { label: 'Remb.',  color: Colors.green },
};

// ─── SVG BarChart ────────────────────────────────────────────────────────────
const CHART_W  = 320;
const CHART_H  = 140;
const PAD_L    = 42;
const PAD_B    = 28;
const PAD_R    = 12;
const PLOT_W   = CHART_W - PAD_L - PAD_R;
const PLOT_H   = CHART_H - PAD_B - 10;

function BarChart({ labels, deposits, loans }: { labels: string[]; deposits: number[]; loans: number[] }) {
  const n    = labels.length;
  const max  = Math.max(...deposits, ...loans, 1);
  const step = PLOT_W / n;

  const ys = (v: number) => PLOT_H - (v / max) * PLOT_H + 10;

  const linePts = deposits.map((d, i) => {
    const x = PAD_L + i * step + step / 2;
    const ratio = loans[i] / (d || 1);
    const y = ys(ratio * max * 0.8);
    return `${x},${y}`;
  }).join(' ');

  return (
    <Svg width={CHART_W} height={CHART_H} style={{ overflow: 'visible' }}>
      {/* Y-axis gridlines */}
      {[0.25, 0.5, 0.75, 1].map((frac) => {
        const y = ys(max * frac);
        return (
          <G key={frac}>
            <Line x1={PAD_L} y1={y} x2={CHART_W - PAD_R} y2={y} stroke="#e2e8f0" strokeWidth={1} />
            <SvgText x={PAD_L - 4} y={y + 4} fontSize={9} fill="#94a3b8" textAnchor="end">{fmtK(Math.round(max * frac))}</SvgText>
          </G>
        );
      })}

      {/* Bars */}
      {labels.map((label, i) => {
        const x      = PAD_L + i * step;
        const bw     = step * 0.35;
        const gap    = step * 0.05;
        const dH     = (deposits[i] / max) * PLOT_H;
        const lH     = (loans[i] / max) * PLOT_H;
        const baseY  = PLOT_H + 10;
        return (
          <G key={i}>
            <Rect x={x + gap}       y={baseY - dH} width={bw} height={dH} fill={Colors.primary}   rx={2} />
            <Rect x={x + gap + bw + gap} y={baseY - lH} width={bw} height={lH} fill={ADMIN_AMBER} rx={2} />
            <SvgText x={x + step / 2} y={CHART_H - 4} fontSize={9} fill="#64748b" textAnchor="middle">{label}</SvgText>
          </G>
        );
      })}

      {/* X-axis */}
      <Line x1={PAD_L} y1={PLOT_H + 10} x2={CHART_W - PAD_R} y2={PLOT_H + 10} stroke="#e2e8f0" strokeWidth={1} />
    </Svg>
  );
}

// ─── KPI Card ────────────────────────────────────────────────────────────────
function KpiCard({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent: string }) {
  return (
    <View style={[styles.kpiCard, { borderLeftColor: accent }]}>
      <Text style={styles.kpiLabel}>{label}</Text>
      <Text style={styles.kpiValue}>{value}</Text>
      {sub && <Text style={styles.kpiSub}>{sub}</Text>}
    </View>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────
export default function AdminDashboardScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [data, setData]         = useState<AdminDashboard | null>(null);
  const [loading, setLoading]   = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try { setData(await getDashboard()); } catch {}
  }, []);

  useEffect(() => { load().finally(() => setLoading(false)); }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  if (loading) {
    return (
      <View style={[styles.root, { alignItems: 'center', justifyContent: 'center' }]}>
        <ActivityIndicator color={ADMIN_AMBER} size="large" />
      </View>
    );
  }

  const d = data!;
  const pendingCount = (d?.pending_withdrawals ?? 0) + (d?.pending_loans ?? 0);

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 14 }]}>
        <View>
          <Text style={styles.headerSub}>ADMINISTRATION</Text>
          <Text style={styles.headerTitle}>Tableau de bord</Text>
        </View>
        {pendingCount > 0 && (
          <TouchableOpacity style={styles.alertBadge} onPress={() => router.push('/(admin)/withdrawals' as any)}>
            <Text style={styles.alertBadgeText}>{pendingCount} en attente</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: Spacing.four }]}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={ADMIN_AMBER} />}>

        {/* KPI Cards */}
        <View style={styles.kpiGrid}>
          <KpiCard label="Membres" value={fmt(d.members_count)} sub={`+${d.collectors_count} collecteurs`} accent={Colors.primary} />
          <KpiCard label="Épargne totale" value={`${fmtK(d.total_savings)} ${CURRENCY}`} accent={Colors.green} />
          <KpiCard label="Crédits actifs" value={String(d.active_loans_count)} sub={`${fmtK(d.total_outstanding)} ${CURRENCY} dû`} accent={ADMIN_AMBER} />
          <KpiCard label="En attente" value={String(pendingCount)} sub={`${d.pending_withdrawals} retr. · ${d.pending_loans} prêts`} accent={pendingCount > 0 ? Colors.danger : Colors.steelGray} />
        </View>

        {/* Chart */}
        <View style={styles.chartCard}>
          <Text style={styles.sectionTitle}>ACTIVITÉ — 6 DERNIERS MOIS</Text>
          <View style={styles.chartLegend}>
            <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: Colors.primary }]} /><Text style={styles.legendLabel}>Dépôts</Text></View>
            <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: ADMIN_AMBER }]} /><Text style={styles.legendLabel}>Prêts</Text></View>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -Spacing.three }}>
            <View style={{ paddingHorizontal: Spacing.three, paddingTop: Spacing.two }}>
              <BarChart labels={d.chart_labels} deposits={d.chart_deposits} loans={d.chart_loans} />
            </View>
          </ScrollView>
        </View>

        {/* Loan Status Breakdown */}
        {Object.keys(d.loan_statuses).length > 0 && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>RÉPARTITION DES PRÊTS</Text>
            {Object.entries(d.loan_statuses).map(([status, count]) => {
              const total = Object.values(d.loan_statuses).reduce((a, b) => a + b, 0);
              const pct   = total > 0 ? Math.round((count / total) * 100) : 0;
              return (
                <View key={status} style={styles.statusRow}>
                  <View style={[styles.statusDot, { backgroundColor: LOAN_STATUS_COLORS[status] ?? Colors.steelGray }]} />
                  <Text style={styles.statusLabel}>{LOAN_STATUS_LABELS[status] ?? status}</Text>
                  <View style={styles.statusBarWrap}>
                    <View style={[styles.statusBar, { width: `${pct}%`, backgroundColor: LOAN_STATUS_COLORS[status] ?? Colors.steelGray }]} />
                  </View>
                  <Text style={styles.statusCount}>{count}</Text>
                </View>
              );
            })}
          </View>
        )}

        {/* Recent Transactions */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>TRANSACTIONS RÉCENTES</Text>
          {d.recent_transactions.map((t) => {
            const kind = TXKIND[t.kind] ?? { label: t.kind, color: Colors.steelGray };
            return (
              <View key={t.id} style={styles.txRow}>
                <View style={[styles.txKindDot, { backgroundColor: kind.color }]} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.txMember}>{t.member ?? '—'}</Text>
                  <Text style={styles.txKind}>{kind.label} · {t.reference}</Text>
                </View>
                <Text style={[styles.txAmount, { color: kind.color }]}>{fmt(t.amount)} {CURRENCY}</Text>
              </View>
            );
          })}
          {d.recent_transactions.length === 0 && <Text style={styles.empty}>Aucune transaction récente.</Text>}
        </View>

        {/* Recent Loans */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.sectionTitle}>PRÊTS RÉCENTS</Text>
            <TouchableOpacity onPress={() => router.push('/(admin)/(tabs)/loans' as any)}>
              <Text style={styles.seeAll}>Voir tout →</Text>
            </TouchableOpacity>
          </View>
          {d.recent_loans.map((l) => (
            <TouchableOpacity
              key={l.id}
              style={styles.loanRow}
              onPress={() => router.push(`/(admin)/loans/${l.reference}` as any)}
              activeOpacity={0.7}>
              <View style={styles.loanInitials}>
                <Text style={styles.loanInitialsText}>{l.member?.initials ?? '?'}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.loanMember}>{l.member?.full_name ?? '—'}</Text>
                <Text style={styles.loanRef}>{l.reference}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.loanAmount}>{fmtK(l.amount)} {CURRENCY}</Text>
                <View style={[styles.loanStatus, { backgroundColor: (LOAN_STATUS_COLORS[l.status] ?? Colors.steelGray) + '22' }]}>
                  <Text style={[styles.loanStatusText, { color: LOAN_STATUS_COLORS[l.status] ?? Colors.steelGray }]}>
                    {LOAN_STATUS_LABELS[l.status] ?? l.status}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
          {d.recent_loans.length === 0 && <Text style={styles.empty}>Aucun prêt récent.</Text>}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root:   { flex: 1, backgroundColor: Colors.background },
  header: { backgroundColor: ADMIN_DARK, paddingHorizontal: Spacing.four, paddingBottom: Spacing.three, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  headerSub:   { fontFamily: Fonts.bold, fontSize: 10, color: 'rgba(255,255,255,0.5)', letterSpacing: 1.2 },
  headerTitle: { fontFamily: Fonts.bold, fontSize: 22, color: Colors.white },
  alertBadge:  { backgroundColor: Colors.danger, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 },
  alertBadgeText: { fontFamily: Fonts.bold, fontSize: 12, color: Colors.white },

  scroll: { paddingTop: Spacing.three, paddingHorizontal: Spacing.four, gap: Spacing.three },

  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  kpiCard: { flex: 1, minWidth: '46%', backgroundColor: Colors.white, borderRadius: 12, padding: Spacing.three, borderLeftWidth: 4, borderWidth: 1, borderColor: Colors.coolGray },
  kpiLabel: { fontFamily: Fonts.medium, fontSize: 12, color: Colors.steelGray, marginBottom: 4 },
  kpiValue: { fontFamily: Fonts.bold, fontSize: 18, color: Colors.charcoal },
  kpiSub:   { fontFamily: Fonts.regular, fontSize: 11, color: Colors.steelGray, marginTop: 2 },

  chartCard: { backgroundColor: Colors.white, borderRadius: 14, padding: Spacing.three, borderWidth: 1, borderColor: Colors.coolGray },
  chartLegend: { flexDirection: 'row', gap: Spacing.three, marginBottom: Spacing.two },
  legendItem:  { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot:   { width: 10, height: 10, borderRadius: 5 },
  legendLabel: { fontFamily: Fonts.regular, fontSize: 12, color: Colors.steelGray },

  card: { backgroundColor: Colors.white, borderRadius: 14, padding: Spacing.three, borderWidth: 1, borderColor: Colors.coolGray, gap: Spacing.two },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { fontFamily: Fonts.bold, fontSize: 11, color: Colors.steelGray, letterSpacing: 0.8 },
  seeAll: { fontFamily: Fonts.semiBold, fontSize: 12, color: Colors.primary },

  statusRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, paddingVertical: 4 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusLabel: { fontFamily: Fonts.regular, fontSize: 13, color: Colors.charcoal, width: 110 },
  statusBarWrap: { flex: 1, height: 6, backgroundColor: Colors.coolGray, borderRadius: 3, overflow: 'hidden' },
  statusBar: { height: 6, borderRadius: 3 },
  statusCount: { fontFamily: Fonts.bold, fontSize: 13, color: Colors.charcoal, width: 28, textAlign: 'right' },

  txRow:    { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: Colors.coolGray },
  txKindDot: { width: 8, height: 8, borderRadius: 4 },
  txMember:  { fontFamily: Fonts.semiBold, fontSize: 14, color: Colors.charcoal },
  txKind:    { fontFamily: Fonts.regular, fontSize: 12, color: Colors.steelGray },
  txAmount:  { fontFamily: Fonts.bold, fontSize: 13 },

  loanRow:   { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: Colors.coolGray },
  loanInitials: { width: 40, height: 40, borderRadius: 20, backgroundColor: ADMIN_DARK + '15', alignItems: 'center', justifyContent: 'center' },
  loanInitialsText: { fontFamily: Fonts.bold, fontSize: 14, color: ADMIN_DARK },
  loanMember:  { fontFamily: Fonts.semiBold, fontSize: 14, color: Colors.charcoal },
  loanRef:     { fontFamily: Fonts.regular, fontSize: 12, color: Colors.steelGray },
  loanAmount:  { fontFamily: Fonts.bold, fontSize: 13, color: Colors.charcoal },
  loanStatus:  { borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2, marginTop: 2 },
  loanStatusText: { fontFamily: Fonts.bold, fontSize: 10 },

  empty: { fontFamily: Fonts.regular, fontSize: 14, color: Colors.steelGray, textAlign: 'center', paddingVertical: Spacing.two },
});
