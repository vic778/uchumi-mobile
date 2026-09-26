import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BackButton } from '@/components/ui/back-button';
import { Colors, Fonts, Spacing } from '@/constants';
import { getKycDetail, approveKyc, rejectKyc, type AdminKYC } from '@/services/admin';



const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  pending:  { bg: Colors.warning + '22', text: Colors.warning },
  approved: { bg: Colors.growth + '22',  text: Colors.growth  },
  rejected: { bg: Colors.danger + '22',  text: Colors.danger  },
};

export default function AdminKYCDetailScreen() {
  const insets  = useSafeAreaInsets();
  const router  = useRouter();
  const { id }  = useLocalSearchParams<{ id: string }>();
  const [doc, setDoc]       = useState<AdminKYC | null>(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing]   = useState(false);
  const [notes, setNotes]     = useState('');

  const load = useCallback(async () => {
    try { setDoc(await getKycDetail(Number(id))); } catch {}
  }, [id]);

  useEffect(() => { load().finally(() => setLoading(false)); }, [load]);

  const handleApprove = () => {
    Alert.alert('Approuver', 'Valider ce document ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Approuver', onPress: async () => {
          setActing(true);
          try { await approveKyc(Number(id)); router.back(); }
          catch (e: any) { Alert.alert('Erreur', e.message); }
          finally { setActing(false); }
        },
      },
    ]);
  };

  const handleReject = () => {
    Alert.alert('Refuser', `Refuser ce document${notes ? ' avec motif' : ''} ?`, [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Refuser', style: 'destructive', onPress: async () => {
          setActing(true);
          try { await rejectKyc(Number(id), notes || undefined); router.back(); }
          catch (e: any) { Alert.alert('Erreur', e.message); }
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

  const d  = doc!;
  const sc = STATUS_COLORS[d.status] ?? STATUS_COLORS.pending;

  return (
    <View style={styles.root}>
      <View style={[styles.header, { paddingTop: insets.top + 14 }]}>
        <BackButton onPress={() => router.back()} />
        <Text style={styles.headerTitle}>Document KYC</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: Spacing.six }]} showsVerticalScrollIndicator={false}>
        {/* Member */}
        <View style={styles.card}>
          <View style={styles.memberRow}>
            <View style={styles.initials}>
              <Text style={styles.initialsText}>{d.member.initials}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.memberName}>{d.member.full_name}</Text>
              <Text style={styles.memberPhone}>{d.member.phone_number}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: sc.bg }]}>
              <Text style={[styles.statusText, { color: sc.text }]}>{d.status}</Text>
            </View>
          </View>
          <View style={styles.divider} />
          <Text style={styles.docType}>{d.label}</Text>
          {d.notes && <Text style={styles.notes}>Motif de refus : {d.notes}</Text>}
        </View>

        {/* Document images */}
        {[
          { label: 'Recto',   url: d.front_url },
          { label: 'Verso',   url: d.back_url  },
          { label: 'Selfie',  url: d.selfie_url },
        ].map(({ label, url }) => (
          <View key={label} style={styles.imgCard}>
            <Text style={styles.imgLabel}>{label}</Text>
            {url ? (
              <Image source={{ uri: url }} style={styles.img} resizeMode="contain" />
            ) : (
              <View style={styles.imgPlaceholder}>
                <Text style={styles.imgPlaceholderText}>Non fourni</Text>
              </View>
            )}
          </View>
        ))}

        {/* Reject notes */}
        {d.status === 'pending' && (
          <View style={styles.card}>
            <Text style={styles.fieldLabel}>Motif de refus (optionnel)</Text>
            <TextInput
              style={styles.notesInput}
              placeholder="Ex : photo floue, document expiré..."
              placeholderTextColor={Colors.iconMuted}
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
            />
          </View>
        )}

        {/* Actions */}
        {d.status === 'pending' && (
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.btn, styles.btnReject]}
              onPress={handleReject}
              disabled={acting}
              activeOpacity={0.85}>
              <Text style={[styles.btnText, { color: Colors.danger }]}>Refuser</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btn, styles.btnApprove]}
              onPress={handleApprove}
              disabled={acting}
              activeOpacity={0.85}>
              <Text style={[styles.btnText, { color: Colors.white }]}>Approuver</Text>
            </TouchableOpacity>
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
  scroll: { padding: Spacing.four, gap: Spacing.three },

  card: { backgroundColor: Colors.white, borderRadius: 14, padding: Spacing.three, borderWidth: 1, borderColor: Colors.coolGray, gap: Spacing.two },
  memberRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  initials: { width: 48, height: 48, borderRadius: 24, backgroundColor: Colors.primary + '12', alignItems: 'center', justifyContent: 'center' },
  initialsText: { fontFamily: Fonts.bold, fontSize: 18, color: Colors.primary },
  memberName: { fontFamily: Fonts.bold, fontSize: 16, color: Colors.charcoal },
  memberPhone: { fontFamily: Fonts.regular, fontSize: 13, color: Colors.steelGray },
  statusBadge: { borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4 },
  statusText: { fontFamily: Fonts.bold, fontSize: 11, textTransform: 'uppercase' },
  divider: { height: 1, backgroundColor: Colors.coolGray },
  docType: { fontFamily: Fonts.semiBold, fontSize: 15, color: Colors.charcoal },
  notes: { fontFamily: Fonts.regular, fontSize: 13, color: Colors.danger },

  imgCard: { backgroundColor: Colors.white, borderRadius: 14, padding: Spacing.three, borderWidth: 1, borderColor: Colors.coolGray },
  imgLabel: { fontFamily: Fonts.bold, fontSize: 13, color: Colors.steelGray, marginBottom: Spacing.two },
  img: { width: '100%', height: 200, borderRadius: 8 },
  imgPlaceholder: { height: 80, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.coolGray, borderRadius: 8 },
  imgPlaceholderText: { fontFamily: Fonts.regular, fontSize: 13, color: Colors.steelGray },

  fieldLabel: { fontFamily: Fonts.semiBold, fontSize: 14, color: Colors.charcoal },
  notesInput: { borderWidth: 1.5, borderColor: Colors.muted, borderRadius: 10, padding: Spacing.two, fontFamily: Fonts.regular, fontSize: 15, color: Colors.charcoal, minHeight: 80, textAlignVertical: 'top' },

  actions: { flexDirection: 'row', gap: Spacing.two },
  btn:     { flex: 1, borderRadius: 14, paddingVertical: 15, alignItems: 'center', borderWidth: 1.5 },
  btnReject:  { borderColor: Colors.danger + '50', backgroundColor: Colors.danger + '10' },
  btnApprove: { backgroundColor: Colors.growth, borderColor: Colors.growth },
  btnText: { fontFamily: Fonts.bold, fontSize: 16 },
});
