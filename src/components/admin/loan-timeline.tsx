import { StyleSheet, Text, View } from 'react-native';
import { Colors, Fonts, Spacing } from '@/constants';
import type { LoanLog } from '@/services/admin';

const fmt  = (n: number) => n.toLocaleString('fr-CD');
const fmtFull = (s: string) => new Date(s).toLocaleDateString('fr-CD', {
  day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
});

const LOG_META: Record<string, { color: string; bg: string }> = {
  submitted:     { color: Colors.steelGray, bg: Colors.coolGray     },
  offer_sent:    { color: '#a78bfa',        bg: '#a78bfa22'          },
  member_agreed: { color: '#60a5fa',        bg: '#60a5fa22'          },
  approved:      { color: Colors.primary,   bg: Colors.primary + '18'},
  rejected:      { color: Colors.danger,    bg: Colors.danger  + '18'},
  disbursed:     { color: Colors.growth,    bg: Colors.growth  + '18'},
  repaid:        { color: '#0ea5e9',        bg: '#0ea5e918'          },
};

type Props = {
  logs: LoanLog[];
  disbursedAmount?: number;
};

export function LoanTimeline({ logs, disbursedAmount }: Props) {
  if (logs.length === 0) return null;

  return (
    <View style={styles.card}>
      <Text style={styles.sectionLabel}>HISTORIQUE DU PRÊT</Text>
      {logs.map((log, idx) => {
        const isLast = idx === logs.length - 1;
        const meta   = LOG_META[log.action] ?? { color: Colors.steelGray, bg: Colors.coolGray };
        return (
          <View key={log.id} style={styles.row}>
            <View style={styles.track}>
              <View style={[styles.dot, { backgroundColor: meta.color }]} />
              {!isLast && <View style={styles.line} />}
            </View>
            <View style={[styles.content, !isLast && { paddingBottom: Spacing.three }]}>
              <View style={styles.top}>
                <Text style={[styles.action, { color: meta.color }]}>{log.action_label}</Text>
                {log.notes && log.action === 'repaid' && (
                  <View style={[styles.amtBadge, { backgroundColor: Colors.growth + '18' }]}>
                    <Text style={[styles.amt, { color: Colors.growth }]}>−{log.notes}</Text>
                  </View>
                )}
                {log.action === 'disbursed' && disbursedAmount != null && (
                  <View style={[styles.amtBadge, { backgroundColor: Colors.primary + '18' }]}>
                    <Text style={[styles.amt, { color: Colors.primary }]}>+{fmt(disbursedAmount)} CDF</Text>
                  </View>
                )}
              </View>
              <Text style={styles.date}>{fmtFull(log.created_at)}</Text>
              {log.user_name && <Text style={styles.user}>par {log.user_name}</Text>}
              {log.notes && log.action !== 'repaid' && (
                <Text style={styles.note}>{log.notes}</Text>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  card:         { backgroundColor: Colors.white, borderRadius: 14, padding: Spacing.three, borderWidth: 1, borderColor: Colors.coolGray, gap: Spacing.two },
  sectionLabel: { fontFamily: Fonts.bold, fontSize: 11, color: Colors.steelGray, letterSpacing: 0.8 },
  row:          { flexDirection: 'row', gap: Spacing.two },
  track:        { width: 20, alignItems: 'center', paddingTop: 3 },
  dot:          { width: 12, height: 12, borderRadius: 6, flexShrink: 0 },
  line:         { width: 2, flex: 1, backgroundColor: Colors.coolGray, marginTop: 4, marginBottom: -4 },
  content:      { flex: 1 },
  top:          { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, flexWrap: 'wrap' },
  action:       { fontFamily: Fonts.semiBold, fontSize: 14 },
  amtBadge:     { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2 },
  amt:          { fontFamily: Fonts.bold, fontSize: 13 },
  date:         { fontFamily: Fonts.regular, fontSize: 12, color: Colors.steelGray, marginTop: 3 },
  user:         { fontFamily: Fonts.regular, fontSize: 12, color: Colors.iconMuted, marginTop: 1 },
  note:         { fontFamily: Fonts.regular, fontSize: 12, color: Colors.charcoal, marginTop: 3, fontStyle: 'italic' },
});
