import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MemberTabBar } from '@/components/navigation/member-tab-bar';
import { StatusBadge } from '@/components/ui/status-badge';
import { Colors, Fonts, Spacing } from '@/constants';
import { getDocuments } from '@/services/member/documents';
import type { Document } from '@/types';

const TYPE_LABELS: Record<string, string> = {
  carte_electeur: "Carte d'électeur", passeport: 'Passeport',
  permis_conduire: 'Permis de conduire', autre: 'Autre pièce',
};

export default function DocumentsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [docs, setDocs] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDocuments().then(setDocs).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: Colors.surface }}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.three }]}>
        <Text style={styles.title}>Mes documents</Text>
        <TouchableOpacity style={styles.uploadBtn} onPress={() => router.push('/(member)/documents/upload' as any)}>
          <Text style={styles.uploadLabel}>+ Ajouter</Text>
        </TouchableOpacity>
      </View>

      {loading ? <ActivityIndicator color={Colors.charcoal} style={{ marginTop: 40 }} /> : (
        <FlatList
          data={docs}
          keyExtractor={(d) => String(d.id)}
          contentContainerStyle={{ paddingHorizontal: Spacing.four, paddingBottom: 120 }}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardRow}>
                <Text style={styles.docType}>{TYPE_LABELS[item.document_type] ?? item.document_type}</Text>
                <StatusBadge status={item.status} />
              </View>
              <Text style={styles.date}>{new Date(item.created_at).toLocaleDateString('fr-CD', { day: '2-digit', month: 'long', year: 'numeric' })}</Text>
              {item.status === 'rejected' && item.notes && (
                <View style={styles.noteBox}>
                  <Text style={styles.noteText}>Motif : {item.notes}</Text>
                </View>
              )}
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyTitle}>Aucun document KYC</Text>
              <Text style={styles.emptyText}>Soumettez votre pièce d'identité pour activer toutes les fonctionnalités.</Text>
              <TouchableOpacity style={styles.emptyBtn} onPress={() => router.push('/(member)/documents/upload' as any)}>
                <Text style={styles.emptyBtnLabel}>Ajouter un document</Text>
              </TouchableOpacity>
            </View>
          }
          showsVerticalScrollIndicator={false}
        />
      )}
      <MemberTabBar active="profile" />
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: Spacing.four, paddingBottom: Spacing.three, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontFamily: Fonts.bold, fontSize: 24, color: Colors.charcoal },
  uploadBtn: { backgroundColor: Colors.charcoal, borderRadius: 20, paddingHorizontal: Spacing.three, paddingVertical: Spacing.one + 2 },
  uploadLabel: { fontFamily: Fonts.semiBold, fontSize: 15, color: Colors.white },
  card: { backgroundColor: Colors.white, borderRadius: 16, padding: Spacing.three, marginBottom: Spacing.two },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.one },
  docType: { fontFamily: Fonts.semiBold, fontSize: 15, color: Colors.charcoal },
  date: { fontFamily: Fonts.regular, fontSize: 15, color: Colors.steelGray },
  noteBox: { marginTop: Spacing.two, backgroundColor: '#FEE2E2', borderRadius: 8, padding: Spacing.two },
  noteText: { fontFamily: Fonts.regular, fontSize: 15, color: '#7F1D1D' },
  emptyWrap: { alignItems: 'center', paddingTop: 60, gap: Spacing.two, paddingHorizontal: Spacing.five },
  emptyTitle: { fontFamily: Fonts.bold, fontSize: 18, color: Colors.charcoal },
  emptyText: { fontFamily: Fonts.regular, fontSize: 16, color: Colors.steelGray, textAlign: 'center' },
  emptyBtn: { backgroundColor: Colors.charcoal, borderRadius: 24, paddingHorizontal: Spacing.four, paddingVertical: Spacing.two, marginTop: Spacing.two },
  emptyBtnLabel: { fontFamily: Fonts.semiBold, fontSize: 16, color: Colors.white },
});
