import { useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { AuthPrimaryButton } from '@/components/auth/shell';
import { Colors, Fonts, Spacing } from '@/constants';
import { uploadDocument } from '@/services/member/documents';

const DOC_TYPES = [
  { value: 'carte_electeur', label: "Carte d'électeur" },
  { value: 'passeport', label: 'Passeport' },
  { value: 'permis_conduire', label: 'Permis de conduire' },
  { value: 'autre', label: 'Autre pièce' },
];

type PickedImage = { uri: string; name: string; type: string };

export default function DocumentUploadScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [docType, setDocType] = useState('carte_electeur');
  const [front, setFront] = useState<PickedImage | null>(null);
  const [back, setBack] = useState<PickedImage | null>(null);
  const [selfie, setSelfie] = useState<PickedImage | null>(null);
  const [loading, setLoading] = useState(false);

  const pickImage = async (setter: (img: PickedImage) => void) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') { Alert.alert('Permission requise', 'Accès à la galerie nécessaire'); return; }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8 });
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setter({ uri: asset.uri, name: asset.fileName ?? 'photo.jpg', type: asset.mimeType ?? 'image/jpeg' });
    }
  };

  const handleSubmit = async () => {
    if (!front || !back || !selfie) { Alert.alert('Incomplet', 'Veuillez fournir recto, verso et selfie'); return; }
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('document_type', docType);
      fd.append('front', { uri: front.uri, name: front.name, type: front.type } as any);
      fd.append('back', { uri: back.uri, name: back.name, type: back.type } as any);
      fd.append('selfie', { uri: selfie.uri, name: selfie.name, type: selfie.type } as any);
      await uploadDocument(fd);
      Alert.alert('Document soumis', 'Votre document a été soumis. Un administrateur va le vérifier.', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (e: any) {
      Alert.alert('Erreur', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.surface }}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.three }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Ajouter un document</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Type selector */}
        <View>
          <Text style={styles.sectionLabel}>Type de pièce</Text>
          <View style={styles.typeGrid}>
            {DOC_TYPES.map((dt) => (
              <TouchableOpacity
                key={dt.value}
                style={[styles.typeChip, docType === dt.value && styles.typeChipActive]}
                onPress={() => setDocType(dt.value)}>
                <Text style={[styles.typeLabel, docType === dt.value && styles.typeLabelActive]}>{dt.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Front + Back side by side */}
        <View style={styles.sideBySide}>
          <PhotoCard label="Recto" image={front} onPress={() => pickImage(setFront)} />
          <PhotoCard label="Verso" image={back} onPress={() => pickImage(setBack)} />
        </View>

        {/* Selfie full width */}
        <PhotoCard label="Selfie (photo personnelle)" image={selfie} onPress={() => pickImage(setSelfie)} fullWidth />

        <View style={styles.note}>
          <Text style={styles.noteText}>📷 Assurez-vous que les photos sont nettes et lisibles. Formats acceptés : JPG, PNG (max 10 Mo).</Text>
        </View>

        <AuthPrimaryButton label="Soumettre" onPress={handleSubmit} loading={loading} disabled={!front || !back || !selfie} />
      </ScrollView>
    </View>
  );
}

function PhotoCard({ label, image, onPress, fullWidth = false }: {
  label: string; image: PickedImage | null; onPress: () => void; fullWidth?: boolean;
}) {
  return (
    <TouchableOpacity
      onPress={onPress} activeOpacity={0.75}
      style={[styles.photoCard, fullWidth && styles.photoCardFull]}>
      {image ? (
        <Image source={{ uri: image.uri }} style={styles.photoPreview} resizeMode="cover" />
      ) : (
        <View style={styles.photoPlaceholder}>
          <Text style={styles.photoIcon}>📷</Text>
          <Text style={styles.photoLabel}>{label}</Text>
          <Text style={styles.photoHint}>Appuyer pour choisir</Text>
        </View>
      )}
      {image && <View style={styles.photoOverlay}><Text style={styles.photoOverlayText}>{label}</Text></View>}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: Spacing.four, paddingBottom: Spacing.three, flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  backBtn: { padding: Spacing.one },
  backIcon: { fontSize: 22, color: Colors.charcoal },
  title: { fontFamily: Fonts.bold, fontSize: 20, color: Colors.charcoal },
  scroll: { paddingHorizontal: Spacing.four, paddingBottom: Spacing.six, gap: Spacing.four },
  sectionLabel: { fontFamily: Fonts.semiBold, fontSize: 14, color: Colors.charcoal, marginBottom: Spacing.two },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  typeChip: { paddingHorizontal: Spacing.three, paddingVertical: Spacing.one + 2, borderRadius: 20, borderWidth: 1.5, borderColor: Colors.muted },
  typeChipActive: { backgroundColor: Colors.charcoal, borderColor: Colors.charcoal },
  typeLabel: { fontFamily: Fonts.medium, fontSize: 13, color: Colors.steelGray },
  typeLabelActive: { color: Colors.white },
  sideBySide: { flexDirection: 'row', gap: Spacing.two },
  photoCard: { flex: 1, height: 140, backgroundColor: Colors.white, borderRadius: 12, borderWidth: 1.5, borderColor: Colors.muted, borderStyle: 'dashed', overflow: 'hidden' },
  photoCardFull: { flex: undefined, height: 180 },
  photoPlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 4 },
  photoIcon: { fontSize: 28 },
  photoLabel: { fontFamily: Fonts.semiBold, fontSize: 13, color: Colors.charcoal },
  photoHint: { fontFamily: Fonts.regular, fontSize: 11, color: Colors.steelGray },
  photoPreview: { flex: 1, width: '100%' },
  photoOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.5)', paddingVertical: 4, paddingHorizontal: Spacing.two },
  photoOverlayText: { fontFamily: Fonts.semiBold, fontSize: 11, color: Colors.white },
  note: { backgroundColor: Colors.coolGray, borderRadius: 12, padding: Spacing.three },
  noteText: { fontFamily: Fonts.regular, fontSize: 13, color: Colors.steelGray },
});
