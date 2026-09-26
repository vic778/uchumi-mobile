import { StyleSheet, Text, View } from 'react-native';
import { Colors, Fonts, Spacing } from '@/constants';

export const LOAN_STATUS_META: Record<string, { label: string; color: string }> = {
  pending:       { label: 'En attente',    color: Colors.warning },
  offer_sent:    { label: 'Offre envoyée', color: '#60a5fa' },
  member_agreed: { label: 'Accepté',       color: '#22d3ee' },
  approved:      { label: 'Approuvé',      color: '#818cf8' },
  active:        { label: 'Actif',         color: Colors.green },
  repaid:        { label: 'Remboursé',     color: Colors.steelGray },
  rejected:      { label: 'Rejeté',        color: Colors.danger },
};

type Props = { statuses: Record<string, number> };

export function LoanStatusCard({ statuses }: Props) {
  const entries = Object.entries(statuses);
  const total   = entries.reduce((s, [, c]) => s + c, 0);
  if (total === 0) return null;

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Statuts des prêts</Text>

      <View style={styles.stackedBar}>
        {entries.map(([status, count]) => {
          const meta = LOAN_STATUS_META[status];
          if (!meta || count === 0) return null;
          const pct = (count / total) * 100;
          return (
            <View key={status} style={[styles.segment, { width: `${pct}%` as any, backgroundColor: meta.color }]} />
          );
        })}
      </View>

      {entries
        .filter(([, count]) => count > 0)
        .map(([status, count]) => {
          const meta = LOAN_STATUS_META[status] ?? { label: status, color: Colors.steelGray };
          const pct  = Math.round((count / total) * 100);
          return (
            <View key={status} style={styles.row}>
              <View style={[styles.dot, { backgroundColor: meta.color }]} />
              <Text style={styles.label}>{meta.label}</Text>
              <Text style={styles.count}>{count}</Text>
              <Text style={styles.pct}>{pct}%</Text>
            </View>
          );
        })}
    </View>
  );
}

const styles = StyleSheet.create({
  card:       { backgroundColor: Colors.white, borderRadius: 14, padding: Spacing.three, borderWidth: 1, borderColor: Colors.coolGray, gap: Spacing.two },
  title:      { fontFamily: Fonts.bold, fontSize: 14, color: Colors.charcoal },
  stackedBar: { flexDirection: 'row', height: 8, borderRadius: 4, overflow: 'hidden', backgroundColor: Colors.coolGray },
  segment:    { height: 8 },
  row:        { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, paddingVertical: 4 },
  dot:        { width: 9, height: 9, borderRadius: 5 },
  label:      { fontFamily: Fonts.regular, fontSize: 13, color: Colors.charcoal, flex: 1 },
  count:      { fontFamily: Fonts.bold, fontSize: 13, color: Colors.charcoal },
  pct:        { fontFamily: Fonts.regular, fontSize: 11, color: Colors.steelGray, width: 32, textAlign: 'right' },
});
