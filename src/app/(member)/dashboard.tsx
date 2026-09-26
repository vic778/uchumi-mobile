import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import { MemberTabBar } from '@/components/navigation/member-tab-bar';
import { TxIcon } from '@/components/ui/tx-icon';
import { Colors, Fonts, Routes, Spacing } from '@/constants';
import { getAccount, getTransactions } from '@/services/member/account';
import { getMe } from '@/services/auth';
import type { Account, Transaction } from '@/types';

const CURRENCY = 'CDF';
const fmt = (n: number) => n.toLocaleString('fr-CD') + ' ' + CURRENCY;
const TAB_BAR_H = 70;

export default function MemberDashboard() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [account, setAccount]           = useState<Account | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [userName, setUserName]         = useState('');
  const [showBalance, setShowBalance]   = useState(false);
  const [loading, setLoading]           = useState(true);

  useEffect(() => {
    Promise.all([getAccount(), getTransactions(), getMe()])
      .then(([acc, txs, me]) => {
        setAccount(acc);
        setTransactions(txs.slice(0, 6));
        setUserName(me.full_name ?? '');
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const initials = userName.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase() || 'U';

  return (
    <View style={styles.root}>
      {/* Teal header */}
      <View style={[styles.header, { paddingTop: insets.top + 14 }]}>
        <View style={styles.headerInner}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={styles.headerGreeting}>
            <Text style={styles.headerSub}>Bienvenue,</Text>
            <Text style={styles.headerName} numberOfLines={1}>{userName || 'Membre'}</Text>
          </View>
          <TouchableOpacity onPress={() => router.push(Routes.memberNotifications as any)} style={styles.bellBtn}>
            <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
              <Path d="M18 8A6 6 0 0 0 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z"
                stroke="#fff" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
              <Path d="M13.73 21C13.55 21.3 13.28 21.55 12.96 21.72C12.65 21.89 12.33 21.97 12 21.97C11.67 21.97 11.35 21.89 11.04 21.72C10.72 21.55 10.45 21.3 10.27 21"
                stroke="#fff" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: TAB_BAR_H + insets.bottom + Spacing.four }]}
        showsVerticalScrollIndicator={false}>

        {loading ? (
          <ActivityIndicator color={Colors.primary} style={{ marginTop: 60 }} />
        ) : (
          <>
            {/* Account card */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionLabel}>MON COMPTE</Text>
            </View>
            <View style={styles.accountCard}>
              <View style={styles.accountCardTop}>
                <View>
                  <Text style={styles.accountTitle}>Compte épargne</Text>
                  {account?.savings_plan && (
                    <Text style={styles.accountSub}>{account.savings_plan.name}</Text>
                  )}
                </View>
              </View>
              <View style={styles.balanceSection}>
                {showBalance ? (
                  <Text style={styles.balanceAmount}>{fmt(account?.balance ?? 0)}</Text>
                ) : null}
                <TouchableOpacity style={styles.balanceBtn} onPress={() => setShowBalance(v => !v)}>
                  <Text style={styles.balanceBtnText}>
                    {showBalance ? 'Masquer le solde' : 'Afficher le solde'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Quick actions */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionLabel}>OPÉRATIONS RAPIDES</Text>
            </View>
            <View style={styles.actionsGrid}>
              <QuickAction icon="💸" label="Retrait" onPress={() => router.push(Routes.memberWithdrawals as any)} />
              <QuickAction icon="💳" label="Crédit" onPress={() => router.push(Routes.memberLoans as any)} />
              <QuickAction icon="📄" label="Documents" onPress={() => router.push(Routes.memberDocuments as any)} />
              <QuickAction icon="📊" label="Historique" onPress={() => router.push(Routes.memberTransactions as any)} />
            </View>

            {/* Recent activity */}
            <View style={[styles.sectionHeader, { marginTop: Spacing.two }]}>
              <Text style={styles.sectionLabel}>VOS TRANSACTIONS</Text>
              <TouchableOpacity onPress={() => router.push(Routes.memberTransactions as any)}>
                <Text style={styles.seeAll}>VOIR TOUT</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.activityCard}>
              {transactions.length === 0 ? (
                <Text style={styles.emptyText}>Aucune transaction pour le moment</Text>
              ) : (
                transactions.map((tx, i) => (
                  <TxRow key={tx.id} tx={tx} last={i === transactions.length - 1} />
                ))
              )}
            </View>
          </>
        )}
      </ScrollView>

      <MemberTabBar active="dashboard" />
    </View>
  );
}

function QuickAction({ icon, label, onPress }: { icon: string; label: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.actionItem} onPress={onPress} activeOpacity={0.75}>
      <View style={styles.actionIconWrap}><Text style={styles.actionEmoji}>{icon}</Text></View>
      <Text style={styles.actionLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

function TxRow({ tx, last }: { tx: Transaction; last: boolean }) {
  const isCredit = tx.kind === 'deposit' || tx.kind === 'loan_credit';
  const kindLabel: Record<string, string> = {
    deposit:              'Dépôt reçu',
    withdrawal:           'Retrait effectué',
    loan_credit:          'Décaissement prêt',
    transfer_to_blocked:  'Transfert bloqué',
    transfer_from_blocked:'Transfert débloqué',
  };
  const date = new Date(tx.created_at).toLocaleDateString('fr-CD', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
  const statusColor = isCredit ? Colors.growth : Colors.danger;
  const statusLabel = isCredit ? 'CRÉDIT' : 'DÉBIT';

  return (
    <View style={[styles.txRow, !last && styles.txBorder]}>
      <TxIcon kind={tx.kind} />
      <View style={styles.txMid}>
        <Text style={styles.txTitle} numberOfLines={1}>{kindLabel[tx.kind] ?? tx.kind}</Text>
        <Text style={styles.txDate}>{date}</Text>
      </View>
      <View style={styles.txRight}>
        <Text style={styles.txAmount}>{fmt(tx.amount)}</Text>
        <Text style={[styles.txStatus, { color: statusColor }]}>{statusLabel}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },

  // Header
  header: { backgroundColor: Colors.primary, paddingHorizontal: Spacing.four, paddingBottom: Spacing.four },
  headerInner: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.4)' },
  avatarText: { fontFamily: Fonts.bold, fontSize: 16, color: Colors.white },
  headerGreeting: { flex: 1 },
  headerSub: { fontFamily: Fonts.regular, fontSize: 13, color: 'rgba(255,255,255,0.7)', lineHeight: 16 },
  headerName: { fontFamily: Fonts.bold, fontSize: 18, color: Colors.white, lineHeight: 24 },
  bellBtn: { padding: Spacing.one },

  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: Spacing.four, paddingTop: Spacing.three },

  // Section labels
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.two, paddingHorizontal: 2 },
  sectionLabel: { fontFamily: Fonts.bold, fontSize: 13, color: Colors.primary, letterSpacing: 0.8 },
  seeAll: { fontFamily: Fonts.bold, fontSize: 13, color: Colors.primary, letterSpacing: 0.5 },

  // Account card
  accountCard: { backgroundColor: Colors.cardBlue, borderRadius: 16, padding: Spacing.four, marginBottom: Spacing.four, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 6 },
  accountCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Spacing.four },
  accountTitle: { fontFamily: Fonts.semiBold, fontSize: 17, color: Colors.white },
  accountSub: { fontFamily: Fonts.regular, fontSize: 14, color: 'rgba(255,255,255,0.7)', marginTop: 3 },
  balanceSection: { gap: Spacing.two },
  balanceAmount: { fontFamily: Fonts.bold, fontSize: 28, color: Colors.white, letterSpacing: 0.5 },
  balanceBtn: { borderWidth: 1, borderColor: 'rgba(255,255,255,0.7)', borderRadius: 10, paddingVertical: 10, alignItems: 'center' },
  balanceBtnText: { fontFamily: Fonts.medium, fontSize: 15, color: Colors.white },

  // Quick actions grid
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.three, marginBottom: Spacing.three },
  actionItem: { width: '47%', backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.coolGray, borderRadius: 14, padding: Spacing.three, flexDirection: 'row', alignItems: 'center', gap: Spacing.three, elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 3 },
  actionIconWrap: { width: 38, height: 38, borderRadius: 10, backgroundColor: '#e8f4f8', alignItems: 'center', justifyContent: 'center' },
  actionEmoji: { fontSize: 18 },
  actionLabel: { fontFamily: Fonts.bold, fontSize: 15, color: Colors.charcoal, flexShrink: 1 },

  // Activity
  activityCard: { backgroundColor: Colors.white, borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: Colors.coolGray, elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 3 },
  txRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.three, padding: Spacing.three },
  txBorder: { borderBottomWidth: 1, borderBottomColor: Colors.coolGray },
  txMid: { flex: 1 },
  txTitle: { fontFamily: Fonts.bold, fontSize: 14, color: Colors.charcoal },
  txDate: { fontFamily: Fonts.regular, fontSize: 13, color: Colors.steelGray, marginTop: 3 },
  txRight: { alignItems: 'flex-end' },
  txAmount: { fontFamily: Fonts.bold, fontSize: 14, color: Colors.charcoal },
  txStatus: { fontFamily: Fonts.bold, fontSize: 12, letterSpacing: 0.5, marginTop: 3 },
  emptyText: { fontFamily: Fonts.regular, fontSize: 16, color: Colors.steelGray, textAlign: 'center', paddingVertical: Spacing.four },
});
