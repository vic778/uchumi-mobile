import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BackButton } from '@/components/ui/back-button';
import { Colors, Fonts, Spacing } from '@/constants';
import { getMember, suspendMember, activateMember, promoteCollector, demoteMember, type AdminMemberDetail } from '@/services/admin';


const CURRENCY   = 'CDF';
const fmt  = (n: number) => n.toLocaleString('fr-CD');
const fmtD = (s: string) => new Date(s).toLocaleDateString('fr-CD', { day: '2-digit', month: 'short', year: 'numeric' });

const KIND_LABEL: Record<string, string> = {
  deposit:        'Dépôt',
  withdrawal:     'Retrait',
  loan_credit:    'Prêt reçu',
  loan_repayment: 'Remboursement',
};
const KIND_COLOR: Record<string, string> = {
  deposit:        Colors.growth,
  withdrawal:     Colors.danger,
  loan_credit:    Colors.primary,
  loan_repayment: Colors.green,
};

const LOAN_STATUS_LABEL: Record<string, string> = {
  pending:       'En attente',
  approved:      'Approuvé',
  active:        'Actif',
  repaid:        'Remboursé',
  rejected:      'Rejeté',
  offer_sent:    'Offre envoyée',
  member_agreed: 'Accord membre',
};

const DOC_STATUS_LABEL: Record<string, string> = {
  pending:  'En attente',
  approved: 'Approuvé',
  rejected: 'Refusé',
};

export default function AdminMemberDetailScreen() {
  const insets  = useSafeAreaInsets();
  const router  = useRouter();
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const [member, setMember]     = useState<AdminMemberDetail | null>(null);
  const [loading, setLoading]   = useState(true);
  const [acting, setActing]     = useState(false);
  const [tab, setTab]           = useState<'transactions' | 'loans' | 'documents'>('transactions');

  const load = useCallback(async () => {
    try { setMember(await getMember(decodeURIComponent(phone))); } catch {}
  }, [phone]);

  useEffect(() => { load().finally(() => setLoading(false)); }, [load]);

  const doAction = (
    label: string,
    confirm: string,
    action: () => Promise<void>,
  ) => {
    Alert.alert(label, confirm, [
      { text: 'Annuler', style: 'cancel' },
      {
        text: label, style: 'destructive', onPress: async () => {
          setActing(true);
          try { await action(); await load(); } catch (e: any) { Alert.alert('Erreur', e.message); }
          finally { setActing(false); }
        },
      },
    ]);
  };

  if (loading) return (
    <View style={[styles.root, { alignItems: 'center', justifyContent: 'center' }]}>
      <ActivityIndicator color={Colors.primary} />
    </View>
  );

  const m = member!;

  return (
    <View style={styles.root}>
      <View style={[styles.header, { paddingTop: insets.top + 14 }]}>
        <BackButton onPress={() => router.back()} light />
        <Text style={styles.headerTitle}>Membre</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: Spacing.six }]} showsVerticalScrollIndicator={false}>
        {/* Profile */}
        <View style={styles.profileCard}>
          <View style={styles.avatarWrap}>
            <Text style={styles.avatarText}>{m.initials}</Text>
          </View>
          <Text style={styles.fullName}>{m.full_name}</Text>
          <Text style={styles.phone}>{m.phone_number}</Text>
          <View style={styles.badges}>
            <View style={[styles.roleBadge, { backgroundColor: m.role === 'collector' ? Colors.primary + '22' : Colors.primary + '12' }]}>
              <Text style={[styles.roleBadgeText, { color: m.role === 'collector' ? Colors.primary : Colors.primary }]}>
                {m.role === 'collector' ? 'Collecteur' : 'Membre'}
              </Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: m.status === 'active' ? Colors.growth + '22' : Colors.danger + '22' }]}>
              <Text style={[styles.statusBadgeText, { color: m.status === 'active' ? Colors.growth : Colors.danger }]}>
                {m.status === 'active' ? 'Actif' : 'Suspendu'}
              </Text>
            </View>
          </View>
          <Text style={styles.balance}>{fmt(m.balance)} {CURRENCY}</Text>
          <Text style={styles.balanceLabel}>Solde du compte</Text>
        </View>

        {/* Actions */}
        <View style={styles.actionsRow}>
          {m.status === 'active' ? (
            <TouchableOpacity
              style={[styles.actionBtn, styles.actionBtnDanger]}
              disabled={acting}
              onPress={() => doAction('Suspendre', `Suspendre le compte de ${m.full_name} ?`, () => suspendMember(m.phone_number))}>
              <Text style={[styles.actionBtnText, { color: Colors.danger }]}>Suspendre</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.actionBtn, styles.actionBtnGreen]}
              disabled={acting}
              onPress={() => doAction('Réactiver', `Réactiver le compte de ${m.full_name} ?`, () => activateMember(m.phone_number))}>
              <Text style={[styles.actionBtnText, { color: Colors.growth }]}>Réactiver</Text>
            </TouchableOpacity>
          )}
          {m.role === 'member' ? (
            <TouchableOpacity
              style={[styles.actionBtn, { borderColor: Colors.primary + '40' }]}
              disabled={acting}
              onPress={() => doAction('Promouvoir collecteur', `Promouvoir ${m.full_name} comme collecteur ?`, () => promoteCollector(m.phone_number))}>
              <Text style={[styles.actionBtnText, { color: Colors.primary }]}>→ Collecteur</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.actionBtn, { borderColor: Colors.steelGray + '40' }]}
              disabled={acting}
              onPress={() => doAction('Rétrograder membre', `Rétrograder ${m.full_name} comme membre ordinaire ?`, () => demoteMember(m.phone_number))}>
              <Text style={[styles.actionBtnText, { color: Colors.steelGray }]}>→ Membre</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          {(['transactions', 'loans', 'documents'] as const).map((t) => (
            <TouchableOpacity key={t} style={[styles.tabBtn, tab === t && styles.tabBtnActive]} onPress={() => setTab(t)}>
              <Text style={[styles.tabLabel, tab === t && styles.tabLabelActive]}>
                {t === 'transactions' ? 'Transactions' : t === 'loans' ? 'Prêts' : 'Documents'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {tab === 'transactions' && (
          <View style={styles.card}>
            {m.transactions.length === 0 && <Text style={styles.empty}>Aucune transaction.</Text>}
            {m.transactions.map((t) => (
              <View key={t.id} style={styles.txRow}>
                <View style={[styles.txDot, { backgroundColor: KIND_COLOR[t.kind] ?? Colors.steelGray }]} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.txKind}>{KIND_LABEL[t.kind] ?? t.kind}</Text>
                  <Text style={styles.txRef}>{t.reference} · {fmtD(t.created_at)}</Text>
                </View>
                <Text style={[styles.txAmount, { color: KIND_COLOR[t.kind] ?? Colors.steelGray }]}>
                  {['deposit', 'loan_credit'].includes(t.kind) ? '+' : '-'}{fmt(t.amount)} {CURRENCY}
                </Text>
              </View>
            ))}
          </View>
        )}

        {tab === 'loans' && (
          <View style={styles.card}>
            {m.loans.length === 0 && <Text style={styles.empty}>Aucun prêt.</Text>}
            {m.loans.map((l) => (
              <TouchableOpacity
                key={l.id}
                style={styles.loanRow}
                onPress={() => router.push(`/(admin)/loans/${l.reference}` as any)}
                activeOpacity={0.7}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.loanRef}>{l.reference}</Text>
                  <Text style={styles.loanDate}>{fmtD(l.created_at)}</Text>
                </View>
                <Text style={styles.loanAmount}>{fmt(l.amount)} {CURRENCY}</Text>
                <Text style={styles.loanStatus}>{LOAN_STATUS_LABEL[l.status] ?? l.status}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {tab === 'documents' && (
          <View style={styles.card}>
            {m.documents.length === 0 && <Text style={styles.empty}>Aucun document soumis.</Text>}
            {m.documents.map((d) => (
              <View key={d.id} style={styles.docRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.docLabel}>{d.label}</Text>
                  <Text style={styles.docDate}>{fmtD(d.created_at)}</Text>
                </View>
                <View style={[styles.docStatusBadge, { backgroundColor: (d.status === 'approved' ? Colors.growth : d.status === 'rejected' ? Colors.danger : Colors.warning) + '22' }]}>
                  <Text style={[styles.docStatusText, { color: d.status === 'approved' ? Colors.growth : d.status === 'rejected' ? Colors.danger : Colors.warning }]}>
                    {DOC_STATUS_LABEL[d.status] ?? d.status}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  header: { backgroundColor: Colors.primary, paddingHorizontal: Spacing.four, paddingBottom: Spacing.three, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.two },
  headerTitle: { fontFamily: Fonts.bold, fontSize: 18, color: Colors.white, flex: 1, textAlign: 'center' },

  scroll: { paddingHorizontal: Spacing.four, paddingTop: Spacing.three },

  profileCard: { backgroundColor: Colors.white, borderRadius: 14, padding: Spacing.four, alignItems: 'center', borderWidth: 1, borderColor: Colors.coolGray, marginBottom: Spacing.three },
  avatarWrap: { width: 72, height: 72, borderRadius: 36, backgroundColor: Colors.primary + '12', alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.two },
  avatarText: { fontFamily: Fonts.bold, fontSize: 26, color: Colors.primary },
  fullName:   { fontFamily: Fonts.bold, fontSize: 18, color: Colors.charcoal, textAlign: 'center' },
  phone:      { fontFamily: Fonts.regular, fontSize: 14, color: Colors.steelGray, marginTop: 2 },
  badges:     { flexDirection: 'row', gap: Spacing.two, marginTop: Spacing.two },
  roleBadge:  { borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4 },
  roleBadgeText: { fontFamily: Fonts.bold, fontSize: 12 },
  statusBadge: { borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4 },
  statusBadgeText: { fontFamily: Fonts.bold, fontSize: 12 },
  balance:      { fontFamily: Fonts.bold, fontSize: 24, color: Colors.charcoal, marginTop: Spacing.three },
  balanceLabel: { fontFamily: Fonts.regular, fontSize: 13, color: Colors.steelGray },

  actionsRow: { flexDirection: 'row', gap: Spacing.two, marginBottom: Spacing.three },
  actionBtn:  { flex: 1, borderRadius: 12, paddingVertical: 12, alignItems: 'center', borderWidth: 1.5 },
  actionBtnDanger: { borderColor: Colors.danger + '40' },
  actionBtnGreen:  { borderColor: Colors.growth + '40' },
  actionBtnText:   { fontFamily: Fonts.bold, fontSize: 14 },

  tabs: { flexDirection: 'row', gap: 0, marginBottom: Spacing.two, backgroundColor: Colors.coolGray, borderRadius: 10, padding: 3 },
  tabBtn:      { flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: 'center' },
  tabBtnActive:{ backgroundColor: Colors.white },
  tabLabel:    { fontFamily: Fonts.medium, fontSize: 13, color: Colors.steelGray },
  tabLabelActive: { fontFamily: Fonts.bold, color: Colors.charcoal },

  card: { backgroundColor: Colors.white, borderRadius: 14, padding: Spacing.three, borderWidth: 1, borderColor: Colors.coolGray, gap: 0 },

  txRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.coolGray },
  txDot: { width: 8, height: 8, borderRadius: 4 },
  txKind: { fontFamily: Fonts.semiBold, fontSize: 14, color: Colors.charcoal },
  txRef:  { fontFamily: Fonts.regular, fontSize: 12, color: Colors.steelGray },
  txAmount: { fontFamily: Fonts.bold, fontSize: 13 },

  loanRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.coolGray },
  loanRef: { fontFamily: Fonts.semiBold, fontSize: 14, color: Colors.charcoal },
  loanDate: { fontFamily: Fonts.regular, fontSize: 12, color: Colors.steelGray },
  loanAmount: { fontFamily: Fonts.bold, fontSize: 13, color: Colors.charcoal },
  loanStatus: { fontFamily: Fonts.medium, fontSize: 12, color: Colors.steelGray },

  docRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.coolGray },
  docLabel: { fontFamily: Fonts.semiBold, fontSize: 14, color: Colors.charcoal },
  docDate:  { fontFamily: Fonts.regular, fontSize: 12, color: Colors.steelGray },
  docStatusBadge: { borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3 },
  docStatusText: { fontFamily: Fonts.bold, fontSize: 11 },

  empty: { fontFamily: Fonts.regular, fontSize: 14, color: Colors.steelGray, textAlign: 'center', paddingVertical: Spacing.three },
});
