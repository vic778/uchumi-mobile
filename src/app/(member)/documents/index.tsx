import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { BackButton } from '@/components/ui/back-button';
import { StatusBadge } from '@/components/ui/status-badge';
import { Colors, Fonts, Spacing } from '@/constants';
import { getDocuments } from '@/services/member/documents';
import type { Document } from '@/types';

const TYPE_LABELS: Record<string, string> = {
  carte_electeur:  "Carte d'électeur",
  passeport:       'Passeport',
  permis_conduire: 'Permis de conduire',
  autre:           'Autre pièce',
};

function canSubmit(docs: Document[]): boolean {
  if (docs.length === 0) return true;
  const latest = docs[0];
  return latest.status === 'rejected';
}

export default function DocumentsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [docs, setDocs] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDocuments().then(setDocs).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const showButton = !loading && canSubmit(docs);

  return (
    <View style={styles.root}>
      <View style={[styles.header, { paddingTop: insets.top + 14 }]}>
        <BackButton onPress={() => router.back()} />
        <Text style={styles.headerTitle}>Documents KYC</Text>
        {showButton ? (
          <TouchableOpacity
            style={styles.submitBtn}
            onPress={() => router.push('/(member)/documents/upload' as any)}>
            <Text style={styles.submitLabel}>Soumettre</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 80 }} />
        )}
      </View>

      {loading ? (
        <ActivityIndicator color={Colors.primary} style={{ marginTop: 60 }} />
      ) : (
        <FlatList
          data={docs}
          keyExtractor={(d) => String(d.id)}
          contentContainerStyle={[styles.list, docs.length === 0 && styles.listEmpty]}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <View style={styles.emptyIcon}>
                <Svg width={32} height={32} viewBox="0 0 24 24" fill="none">
                  <Path d="M9 5H7C5.9 5 5 5.9 5 7V19C5 20.1 5.9 21 7 21H17C18.1 21 19 20.1 19 19V7C19 5.9 18.1 5 17 5H15M9 5C9 5.55 9.45 6 10 6H14C14.55 6 15 5.55 15 5M9 5C9 4.45 9.45 4 10 4H14C14.55 4 15 4.45 15 5"
                    stroke={Colors.iconMuted} strokeWidth={1.8} strokeLinecap="round" />
                </Svg>
              </View>
              <Text style={styles.emptyTitle}>Aucun document soumis</Text>
              <Text style={styles.emptyText}>
                Soumettez votre pièce d'identité pour vérifier votre identité et activer toutes les fonctionnalités.
              </Text>
              <TouchableOpacity
                style={styles.emptyBtn}
                onPress={() => router.push('/(member)/documents/upload' as any)}>
                <Text style={styles.emptyBtnLabel}>Soumettre un document</Text>
              </TouchableOpacity>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.row}>
              <View style={styles.rowIcon}>
                <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                  <Path d="M9 5H7C5.9 5 5 5.9 5 7V19C5 20.1 5.9 21 7 21H17C18.1 21 19 20.1 19 19V7C19 5.9 18.1 5 17 5H15M9 5C9 5.55 9.45 6 10 6H14C14.55 6 15 5.55 15 5M9 5C9 4.45 9.45 4 10 4H14C14.55 4 15 4.45 15 5"
                    stroke={Colors.primary} strokeWidth={1.8} strokeLinecap="round" />
                </Svg>
              </View>
              <View style={styles.rowMid}>
                <Text style={styles.rowTitle}>{TYPE_LABELS[item.document_type] ?? item.document_type}</Text>
                <Text style={styles.rowDate}>
                  {new Date(item.created_at).toLocaleDateString('fr-CD', { day: '2-digit', month: 'long', year: 'numeric' })}
                </Text>
                {item.status === 'rejected' && item.notes && (
                  <View style={styles.noteBox}>
                    <Text style={styles.noteText}>Motif : {item.notes}</Text>
                  </View>
                )}
              </View>
              <StatusBadge status={item.status} />
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },

  header: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.three,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: { fontFamily: Fonts.bold, fontSize: 18, color: Colors.white, flex: 1, textAlign: 'center' },
  submitBtn: {
    backgroundColor: Colors.green,
    borderRadius: 10,
    paddingHorizontal: Spacing.three,
    paddingVertical: 8,
  },
  submitLabel: { fontFamily: Fonts.semiBold, fontSize: 13, color: Colors.white },

  list: { paddingTop: Spacing.two, paddingBottom: Spacing.four, backgroundColor: Colors.white },
  listEmpty: { flex: 1 },
  separator: { height: 1, backgroundColor: Colors.coolGray, marginLeft: Spacing.four + 46 + Spacing.three },

  row: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.three, paddingHorizontal: Spacing.four, paddingVertical: Spacing.three, backgroundColor: Colors.white },
  rowIcon: { width: 46, height: 46, borderRadius: 12, backgroundColor: '#e8f4f8', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 },
  rowMid: { flex: 1 },
  rowTitle: { fontFamily: Fonts.bold, fontSize: 14, color: Colors.charcoal },
  rowDate: { fontFamily: Fonts.regular, fontSize: 12, color: Colors.steelGray, marginTop: 3 },
  noteBox: { marginTop: Spacing.two, backgroundColor: '#FEE2E2', borderRadius: 8, padding: Spacing.two },
  noteText: { fontFamily: Fonts.regular, fontSize: 13, color: '#7F1D1D' },

  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: Spacing.five, gap: Spacing.two },
  emptyIcon: { width: 64, height: 64, borderRadius: 32, backgroundColor: Colors.coolGray, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.two },
  emptyTitle: { fontFamily: Fonts.bold, fontSize: 18, color: Colors.charcoal },
  emptyText: { fontFamily: Fonts.regular, fontSize: 14, color: Colors.steelGray, textAlign: 'center', lineHeight: 21 },
  emptyBtn: { backgroundColor: Colors.primary, borderRadius: 24, paddingHorizontal: Spacing.four, paddingVertical: Spacing.two, marginTop: Spacing.two },
  emptyBtnLabel: { fontFamily: Fonts.semiBold, fontSize: 15, color: Colors.white },
});
