import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, G, Line, Path, Rect, Text as SvgText } from 'react-native-svg';
import { Colors, Fonts, Spacing } from '@/constants';
import { getDashboard, type AdminDashboard } from '@/services/admin';

const CURRENCY = 'CDF';
const fmt  = (n: number) => n.toLocaleString('fr-CD');
const fmtK = (n: number) =>
  n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` :
  n >= 1_000     ? `${(n / 1_000).toFixed(0)}k`     : String(n);

// Match web colors exactly
const COLOR_DEPOSIT = Colors.primary;   // #005f78 — teal
const COLOR_LOAN    = '#F5A623';        // amber — matches web
const COLOR_RATIO   = Colors.growth;   // #22c55e — green

const LOAN_STATUS_META: Record<string, { label: string; color: string }> = {
  pending:       { label: 'En attente',    color: Colors.warning },
  offer_sent:    { label: 'Offre envoyée', color: '#60a5fa' },
  member_agreed: { label: 'Accepté',       color: '#22d3ee' },
  approved:      { label: 'Approuvé',      color: '#818cf8' },
  active:        { label: 'Actif',         color: Colors.green },
  repaid:        { label: 'Remboursé',     color: Colors.steelGray },
  rejected:      { label: 'Rejeté',        color: Colors.danger },
};

const TX_META: Record<string, { label: string; credit: boolean }> = {
  deposit:        { label: 'Dépôt',          credit: true  },
  loan_credit:    { label: 'Crédit',          credit: true  },
  withdrawal:     { label: 'Retrait',         credit: false },
  loan_repayment: { label: 'Remboursement',   credit: false },
};

// ─── KPI card icons (SVG) ────────────────────────────────────────────────────
function UsersIcon({ color }: { color: string }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Circle cx={9} cy={7} r={4} stroke={color} strokeWidth={1.8} />
      <Circle cx={17} cy={9} r={3} stroke={color} strokeWidth={1.8} />
      <Path d="M2 21v-1a7 7 0 0 1 14 0v1" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
      <Path d="M22 21v-1a5 5 0 0 0-5-5"   stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}
function PiggyIcon({ color }: { color: string }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path d="M19 11V9a7 7 0 0 0-14 0v2a7 7 0 0 0 14 0ZM12 16v5M8 21h8" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
function CreditIcon({ color }: { color: string }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}
function ClockIcon({ color }: { color: string }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={9} stroke={color} strokeWidth={1.8} />
      <Path d="M12 7v5l3 3" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

// ─── KPI Card ────────────────────────────────────────────────────────────────
function KpiCard({
  label, value, sub, iconBg, Icon,
}: {
  label: string; value: string; sub?: string;
  iconBg: string; Icon: React.FC<{ color: string }>;
}) {
  return (
    <View style={styles.kpiCard}>
      <View style={styles.kpiTop}>
        <Text style={styles.kpiLabel}>{label}</Text>
        <View style={[styles.kpiIconWrap, { backgroundColor: iconBg }]}>
          <Icon color={iconBg.replace('18', 'ff').replace(/18$/, 'ff')} />
        </View>
      </View>
      <Text style={styles.kpiValue}>{value}</Text>
      {sub && <Text style={styles.kpiSub}>{sub}</Text>}
    </View>
  );
}

// ─── SVG Bar + Line Chart ────────────────────────────────────────────────────
const CW = 300, CH = 150, PL = 36, PB = 24, PR = 8, PT = 8;
const PW = CW - PL - PR;
const PH = CH - PB - PT;

function ComboChart({ labels, deposits, loans, ratio }: {
  labels: string[]; deposits: number[]; loans: number[]; ratio: number[];
}) {
  const n      = labels.length;
  const maxVal = Math.max(...deposits, ...loans, 1);
  const maxR   = Math.max(...ratio, 1);
  const step   = PW / n;

  const yVal = (v: number) => PT + PH - (v / maxVal) * PH;
  const yRat = (v: number) => PT + PH - (v / maxR)   * PH;

  const gridLines = [0.25, 0.5, 0.75, 1];

  const linePath = ratio.map((r, i) => {
    const x = PL + i * step + step / 2;
    const y = yRat(r);
    return i === 0 ? `M${x},${y}` : `L${x},${y}`;
  }).join(' ');

  return (
    <Svg width={CW} height={CH}>
      {/* Gridlines */}
      {gridLines.map((f) => {
        const y = yVal(maxVal * f);
        return (
          <G key={f}>
            <Line x1={PL} y1={y} x2={CW - PR} y2={y} stroke={Colors.coolGray} strokeWidth={1} />
            <SvgText x={PL - 4} y={y + 3} fontSize={8} fill={Colors.steelGray} textAnchor="end">
              {fmtK(Math.round(maxVal * f))}
            </SvgText>
          </G>
        );
      })}
      {/* X axis */}
      <Line x1={PL} y1={PT + PH} x2={CW - PR} y2={PT + PH} stroke={Colors.coolGray} strokeWidth={1} />

      {/* Bars */}
      {labels.map((lbl, i) => {
        const x   = PL + i * step;
        const bw  = step * 0.32;
        const gap = step * 0.06;
        const baseY = PT + PH;
        const dH = (deposits[i] / maxVal) * PH;
        const lH = (loans[i]    / maxVal) * PH;
        return (
          <G key={i}>
            <Rect x={x + gap}           y={baseY - dH} width={bw} height={dH} fill={COLOR_DEPOSIT} rx={2} opacity={0.85} />
            <Rect x={x + gap + bw + gap} y={baseY - lH} width={bw} height={lH} fill={COLOR_LOAN}    rx={2} opacity={0.85} />
            <SvgText x={x + step / 2} y={CH - 6} fontSize={8} fill={Colors.steelGray} textAnchor="middle">{lbl}</SvgText>
          </G>
        );
      })}

      {/* Ratio line */}
      {ratio.some(r => r > 0) && (
        <>
          <Path d={linePath} stroke={COLOR_RATIO} strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          {ratio.map((r, i) => (
            <Circle key={i} cx={PL + i * step + step / 2} cy={yRat(r)} r={3} fill={COLOR_RATIO} />
          ))}
        </>
      )}
    </Svg>
  );
}

// ─── Screen ──────────────────────────────────────────────────────────────────
export default function AdminDashboardScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [data, setData]           = useState<AdminDashboard | null>(null);
  const [loading, setLoading]     = useState(true);
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

  if (loading) return (
    <View style={[styles.root, { alignItems: 'center', justifyContent: 'center' }]}>
      <ActivityIndicator color={Colors.primary} size="large" />
    </View>
  );

  const d = data!;
  const pending = d.pending_withdrawals + d.pending_loans;

  return (
    <View style={styles.root}>
      {/* Header — same style as member/collector */}
      <View style={[styles.header, { paddingTop: insets.top + 14 }]}>
        <View>
          <Text style={styles.headerSub}>ADMINISTRATION</Text>
          <Text style={styles.headerTitle}>Tableau de bord</Text>
        </View>
        {pending > 0 && (
          <TouchableOpacity style={styles.alertPill} onPress={() => router.push('/(admin)/withdrawals' as any)}>
            <Text style={styles.alertPillText}>{pending} en attente</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: Spacing.six }]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}>

        {/* ── KPI cards (2×2 grid) ───────────────────────────────────────── */}
        <View style={styles.kpiGrid}>
          <KpiCard
            label="MEMBRES"
            value={fmt(d.members_count)}
            sub={`${d.collectors_count} collecteur${d.collectors_count !== 1 ? 's' : ''}`}
            iconBg={Colors.primary + '18'}
            Icon={({ color }) => <UsersIcon color={Colors.primary} />}
          />
          <KpiCard
            label="ÉPARGNE TOTALE"
            value={fmtK(d.total_savings)}
            sub={CURRENCY}
            iconBg={Colors.green + '22'}
            Icon={({ color }) => <PiggyIcon color={Colors.green} />}
          />
          <KpiCard
            label="CRÉDITS ACTIFS"
            value={String(d.active_loans_count)}
            sub={`${fmtK(d.total_outstanding)} ${CURRENCY} restants`}
            iconBg={'#F5A62322'}
            Icon={({ color }) => <CreditIcon color={COLOR_LOAN} />}
          />
          <KpiCard
            label="EN ATTENTE"
            value={String(pending)}
            sub={`${d.pending_withdrawals} retrait${d.pending_withdrawals !== 1 ? 's' : ''} · ${d.pending_loans} prêt${d.pending_loans !== 1 ? 's' : ''}`}
            iconBg={pending > 0 ? Colors.danger + '18' : Colors.coolGray}
            Icon={({ color }) => <ClockIcon color={pending > 0 ? Colors.danger : Colors.steelGray} />}
          />
        </View>

        {/* ── Chart ─────────────────────────────────────────────────────── */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.cardTitle}>Dépôts &amp; Crédits mensuels</Text>
              <Text style={styles.cardSub}>6 derniers mois</Text>
            </View>
            <View style={styles.legend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendSwatch, { backgroundColor: COLOR_DEPOSIT }]} />
                <Text style={styles.legendLabel}>Dépôts</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendSwatch, { backgroundColor: COLOR_LOAN }]} />
                <Text style={styles.legendLabel}>Crédits</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendLine, { backgroundColor: COLOR_RATIO }]} />
                <Text style={styles.legendLabel}>Ratio</Text>
              </View>
            </View>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <ComboChart
              labels={d.chart_labels}
              deposits={d.chart_deposits}
              loans={d.chart_loans}
              ratio={d.chart_ratio}
            />
          </ScrollView>
        </View>

        {/* ── Loan status breakdown ──────────────────────────────────────── */}
        {Object.keys(d.loan_statuses).length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Statuts des prêts</Text>
            {/* Stacked bar */}
            <View style={styles.stackedBar}>
              {Object.entries(d.loan_statuses).map(([status, count]) => {
                const total = Object.values(d.loan_statuses).reduce((a, b) => a + b, 0);
                const pct   = total > 0 ? (count / total) * 100 : 0;
                const meta  = LOAN_STATUS_META[status];
                if (!meta || count === 0) return null;
                return (
                  <View key={status} style={[styles.stackedSegment, { width: `${pct}%` as any, backgroundColor: meta.color }]} />
                );
              })}
            </View>
            {/* List */}
            {Object.entries(d.loan_statuses)
              .filter(([, count]) => count > 0)
              .map(([status, count]) => {
                const total = Object.values(d.loan_statuses).reduce((a, b) => a + b, 0);
                const pct   = total > 0 ? Math.round((count / total) * 100) : 0;
                const meta  = LOAN_STATUS_META[status] ?? { label: status, color: Colors.steelGray };
                return (
                  <View key={status} style={styles.statusRow}>
                    <View style={[styles.statusDot, { backgroundColor: meta.color }]} />
                    <Text style={styles.statusLabel}>{meta.label}</Text>
                    <Text style={styles.statusCount}>{count}</Text>
                    <Text style={styles.statusPct}>{pct}%</Text>
                  </View>
                );
              })}
          </View>
        )}

        {/* ── Recent transactions ────────────────────────────────────────── */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Transactions récentes</Text>
            <TouchableOpacity onPress={() => router.push('/(admin)/withdrawals' as any)}>
              <Text style={styles.seeAll}>Voir tout →</Text>
            </TouchableOpacity>
          </View>
          {/* Column headers */}
          <View style={styles.tableHead}>
            <Text style={[styles.thCell, { flex: 2 }]}>MEMBRE</Text>
            <Text style={styles.thCell}>TYPE</Text>
            <Text style={[styles.thCell, { textAlign: 'right' }]}>MONTANT</Text>
          </View>
          {d.recent_transactions.length === 0 && (
            <Text style={styles.emptyText}>Aucune transaction récente.</Text>
          )}
          {d.recent_transactions.map((t) => {
            const meta    = TX_META[t.kind] ?? { label: t.kind, credit: false };
            const amtClr  = meta.credit ? Colors.growth : Colors.danger;
            const sign    = meta.credit ? '+' : '−';
            return (
              <View key={t.id} style={styles.tableRow}>
                <Text style={[styles.tdName, { flex: 2 }]} numberOfLines={1}>{t.member ?? '—'}</Text>
                <View style={styles.tdKindWrap}>
                  <View style={[styles.txDot, { backgroundColor: amtClr }]} />
                  <Text style={styles.tdKind}>{meta.label}</Text>
                </View>
                <Text style={[styles.tdAmount, { color: amtClr }]}>{sign}{fmtK(t.amount)}</Text>
              </View>
            );
          })}
        </View>

        {/* ── Recent loans ───────────────────────────────────────────────── */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Prêts récents</Text>
            <TouchableOpacity onPress={() => router.push('/(admin)/(tabs)/loans' as any)}>
              <Text style={styles.seeAll}>Voir tout →</Text>
            </TouchableOpacity>
          </View>
          {d.recent_loans.length === 0 && (
            <Text style={styles.emptyText}>Aucun prêt récent.</Text>
          )}
          {d.recent_loans.map((l) => {
            const meta  = LOAN_STATUS_META[l.status] ?? { label: l.status, color: Colors.steelGray };
            const member = typeof l.member === 'string' ? l.member : (l.member as any)?.full_name ?? '—';
            return (
              <TouchableOpacity
                key={l.id}
                style={styles.loanRow}
                onPress={() => router.push(`/(admin)/loans/${l.reference}` as any)}
                activeOpacity={0.7}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },

  // Header — same as member/collector
  header: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.three,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  headerSub:   { fontFamily: Fonts.bold, fontSize: 10, color: 'rgba(255,255,255,0.6)', letterSpacing: 1.2 },
  headerTitle: { fontFamily: Fonts.bold, fontSize: 22, color: '#fff' },
  alertPill:   { backgroundColor: Colors.danger, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 },
  alertPillText: { fontFamily: Fonts.bold, fontSize: 12, color: '#fff' },

  scroll: { padding: Spacing.four, gap: Spacing.three },

  // KPI
  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  kpiCard: {
    flex: 1,
    minWidth: '46%',
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: Spacing.three,
    borderWidth: 1,
    borderColor: Colors.coolGray,
  },
  kpiTop:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.two },
  kpiLabel:   { fontFamily: Fonts.bold, fontSize: 10, color: Colors.steelGray, letterSpacing: 0.8 },
  kpiIconWrap:{ width: 34, height: 34, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  kpiValue:   { fontFamily: Fonts.bold, fontSize: 22, color: Colors.charcoal },
  kpiSub:     { fontFamily: Fonts.regular, fontSize: 11, color: Colors.steelGray, marginTop: 2 },

  // Cards
  card: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: Spacing.three,
    borderWidth: 1,
    borderColor: Colors.coolGray,
    gap: Spacing.two,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  cardTitle:  { fontFamily: Fonts.bold, fontSize: 14, color: Colors.charcoal },
  cardSub:    { fontFamily: Fonts.regular, fontSize: 12, color: Colors.steelGray, marginTop: 2 },
  seeAll:     { fontFamily: Fonts.semiBold, fontSize: 12, color: Colors.primary },

  // Chart legend
  legend:      { flexDirection: 'row', gap: Spacing.two, flexWrap: 'wrap', justifyContent: 'flex-end' },
  legendItem:  { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendSwatch:{ width: 10, height: 10, borderRadius: 2 },
  legendLine:  { width: 16, height: 2, borderRadius: 1 },
  legendLabel: { fontFamily: Fonts.regular, fontSize: 10, color: Colors.steelGray },

  // Loan status
  stackedBar:     { flexDirection: 'row', height: 8, borderRadius: 4, overflow: 'hidden', backgroundColor: Colors.coolGray },
  stackedSegment: { height: 8 },
  statusRow:      { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, paddingVertical: 4 },
  statusDot:      { width: 9, height: 9, borderRadius: 5 },
  statusLabel:    { fontFamily: Fonts.regular, fontSize: 13, color: Colors.charcoal, flex: 1 },
  statusCount:    { fontFamily: Fonts.bold, fontSize: 13, color: Colors.charcoal },
  statusPct:      { fontFamily: Fonts.regular, fontSize: 11, color: Colors.steelGray, width: 32, textAlign: 'right' },

  // Transactions table
  tableHead: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: Colors.coolGray, paddingBottom: 6 },
  thCell:    { fontFamily: Fonts.bold, fontSize: 9, color: Colors.steelGray, letterSpacing: 0.8, flex: 1 },
  tableRow:  { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: Colors.coolGray },
  tdName:    { fontFamily: Fonts.medium, fontSize: 13, color: Colors.charcoal },
  tdKindWrap:{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 5 },
  txDot:     { width: 7, height: 7, borderRadius: 4 },
  tdKind:    { fontFamily: Fonts.regular, fontSize: 12, color: Colors.steelGray },
  tdAmount:  { fontFamily: Fonts.bold, fontSize: 13 },

  // Recent loans
  loanRow:      { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: Colors.coolGray },
  loanMember:   { fontFamily: Fonts.medium, fontSize: 14, color: Colors.charcoal },
  loanRef:      { fontFamily: Fonts.regular, fontSize: 11, color: Colors.steelGray },
  loanAmount:   { fontFamily: Fonts.bold, fontSize: 13, color: Colors.charcoal },
  loanCurrency: { fontFamily: Fonts.regular, fontSize: 11, color: Colors.steelGray },
  loanBadge:    { borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2, marginTop: 2 },
  loanBadgeText:{ fontFamily: Fonts.bold, fontSize: 10 },

  emptyText: { fontFamily: Fonts.regular, fontSize: 13, color: Colors.steelGray, textAlign: 'center', paddingVertical: Spacing.two },
});
