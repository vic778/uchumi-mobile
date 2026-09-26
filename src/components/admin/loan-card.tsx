import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Colors, Fonts, Spacing } from '@/constants';
import type { AdminLoanSummary } from '@/services/admin';

const CURRENCY = 'CDF';
const fmt  = (n: number) => n.toLocaleString('fr-CD');
const fmtD = (s: string) => new Date(s).toLocaleDateString('fr-CD', { day: '2-digit', month: 'short', year: 'numeric' });

export const STATUS_META: Record<string, { label: string; color: string; bg: string }> = {
  pending:       { label: 'En attente',    color: Colors.warning,   bg: Colors.warning   + '20' },
  offer_sent:    { label: 'Offre envoyée', color: '#8b5cf6',        bg: '#8b5cf620'             },
  member_agreed: { label: 'Accordé',       color: '#0ea5e9',        bg: '#0ea5e920'             },
  approved:      { label: 'Approuvé',      color: '#3b82f6',        bg: '#3b82f620'             },
  active:        { label: 'Actif',         color: Colors.green,     bg: Colors.green     + '20' },
  repaid:        { label: 'Remboursé',     color: Colors.steelGray, bg: Colors.coolGray         },
  rejected:      { label: 'Rejeté',        color: Colors.danger,    bg: Colors.danger    + '20' },
};

const AVATAR_COLORS: Record<string, { bg: string; text: string }> = {
  pending:       { bg: Colors.warning  + '25', text: Colors.warning   },
  offer_sent:    { bg: '#8b5cf625',            text: '#8b5cf6'        },
  member_agreed: { bg: '#0ea5e925',            text: '#0ea5e9'        },
  approved:      { bg: '#3b82f625',            text: '#3b82f6'        },
  active:        { bg: Colors.green    + '25', text: Colors.green     },
  repaid:        { bg: Colors.coolGray,         text: Colors.steelGray },
  rejected:      { bg: Colors.danger   + '20', text: Colors.danger    },
};

function ChevronRight({ color }: { color: string }) {
  return (
    <Svg width={12} height={12} viewBox="0 0 24 24" fill="none">
      <Path d="M9 18L15 12L9 6" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

type Props = { item: AdminLoanSummary; onPress: () => void };

export function LoanCard({ item, onPress }: Props) {
  const meta   = STATUS_META[item.status]   ?? { label: item.status, color: Colors.steelGray, bg: Colors.coolGray };
  const avatar = AVATAR_COLORS[item.status] ?? { bg: Colors.coolGray, text: Colors.steelGray };
  const isActive   = item.status === 'active';
  const isPending  = ['pending', 'offer_sent', 'member_agreed'].includes(item.status);
  const isApproved = item.status === 'approved';

  const footerText = isActive   ? 'Remb. en cours'
                   : isApproved ? 'Prêt pour décaissement'
                   : isPending  ? `Soumis le ${fmtD(item.created_at)}`
                   : item.status === 'repaid'   ? 'Entièrement remboursé'
                   : item.status === 'rejected' ? 'Demande refusée'
                   : fmtD(item.created_at);

  const actionLabel = isApproved ? 'Décaisser' : isPending ? 'Examiner' : 'Détails';
  const actionColor = isApproved ? Colors.green : Colors.primary;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.75}>
      <View style={styles.cardTop}>
        <View style={styles.cardTopLeft}>
          <View style={[styles.avatar, { backgroundColor: avatar.bg }]}>
            <Text style={[styles.avatarText, { color: avatar.text }]}>{item.member.initials}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.memberName} numberOfLines={1}>{item.member.full_name}</Text>
            <Text style={styles.refText}>Réf: {item.reference}</Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: meta.bg, borderColor: meta.color + '60' }]}>
          {isActive && <View style={[styles.statusDot, { backgroundColor: meta.color }]} />}
          <Text style={[styles.statusText, { color: meta.color }]}>{meta.label}</Text>
        </View>
      </View>

      <View style={styles.cardMiddle}>
        <View style={styles.amountRow}>
          <Text style={styles.amountLabel}>
            {isActive ? 'Montant du prêt' : isApproved ? 'Montant approuvé' : 'Montant demandé'}
          </Text>
          <Text style={styles.amountValue}>
            {fmt(item.amount)}{' '}<Text style={styles.amountCurrency}>{CURRENCY}</Text>
          </Text>
        </View>
        {isActive && (
          <View style={styles.progressWrap}>
            <View style={styles.progressBg}>
              <View style={[styles.progressFill, { width: '0%' }]} />
            </View>
          </View>
        )}
      </View>

      <View style={styles.footerStrip}>
        <Text style={styles.footerText} numberOfLines={1}>{footerText}</Text>
        <View style={styles.footerAction}>
          <Text style={[styles.footerActionText, { color: actionColor }]}>{actionLabel}</Text>
          <ChevronRight color={actionColor} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: Colors.white, borderRadius: 16, borderWidth: 1, borderColor: '#e2e8f0', padding: Spacing.three, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  cardTop:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingBottom: Spacing.two + 2, borderBottomWidth: 1, borderBottomColor: Colors.coolGray },
  cardTopLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, flex: 1, marginRight: Spacing.two },
  avatar:      { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  avatarText:  { fontFamily: Fonts.bold, fontSize: 15 },
  memberName:  { fontFamily: Fonts.bold, fontSize: 14, color: Colors.charcoal },
  refText:     { fontFamily: Fonts.regular, fontSize: 11, color: Colors.steelGray, marginTop: 2 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 20, borderWidth: 1, paddingHorizontal: 8, paddingVertical: 4 },
  statusDot:   { width: 6, height: 6, borderRadius: 3 },
  statusText:  { fontFamily: Fonts.bold, fontSize: 10 },
  cardMiddle:  { paddingVertical: Spacing.two + 2 },
  amountRow:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  amountLabel: { fontFamily: Fonts.regular, fontSize: 11, color: Colors.steelGray },
  amountValue: { fontFamily: Fonts.bold, fontSize: 18, color: Colors.charcoal },
  amountCurrency: { fontFamily: Fonts.semiBold, fontSize: 11, color: Colors.primary },
  progressWrap:{ marginTop: 6 },
  progressBg:  { height: 6, backgroundColor: Colors.coolGray, borderRadius: 3, overflow: 'hidden' },
  progressFill:{ height: 6, backgroundColor: Colors.green, borderRadius: 3 },
  footerStrip: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: Colors.background, borderRadius: 10, borderWidth: 1, borderColor: Colors.coolGray, paddingHorizontal: Spacing.two + 2, paddingVertical: 8 },
  footerText:       { fontFamily: Fonts.regular, fontSize: 11, color: Colors.steelGray, flex: 1 },
  footerAction:     { flexDirection: 'row', alignItems: 'center', gap: 3 },
  footerActionText: { fontFamily: Fonts.bold, fontSize: 12 },
});
