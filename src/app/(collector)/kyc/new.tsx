import { useRef, useState } from 'react';
import { Alert, Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { BackButton } from '@/components/ui/back-button';
import { Colors, Fonts, Spacing } from '@/constants';
import { lookupMember, type CollectorMember } from '@/services/collector';
import { api } from '@/services/api';

const DOC_TYPES = [
  { value: 'carte_electeur', label: "Carte d'électeur" },
  { value: 'passeport', label: 'Passeport' },
  { value: 'permis_conduire', label: 'Permis de conduire' },
  { value: 'autre', label: 'Autre pièce' },
];

type PickedImage = { uri: string; name: string; type: string };

export default function CollectorKYCScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [step, setStep]         = useState<'lookup' | 'upload'>('lookup');
  const [phone, setPhone]       = useState('');
  const [member, setMember]     = useState<CollectorMember | null>(null);
  const [looking, setLooking]   = useState(false);
  const [docType, setDocType]   = useState('carte_electeur');
  const [front, setFront]       = useState<PickedImage | null>(null);
  const [back, setBack]         = useState<PickedImage | null>(null);
  const [selfie, setSelfie]     = useState<PickedImage | null>(null);
  const [loading, setLoading]   = useState(false);

  const handleLookup = async () => {
    if (!phone.trim()) return;
    setLooking(true);
    try {
      const m = await lookupMember(`243${phone.trim()}`);
      setMember(m);
      setStep('upload');
    } catch {
      Alert.alert('Introuvable', 'Aucun membre trouvé avec ce numéro.');
    } finally {
      setLooking(false);
    }
  };

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
    if (!member || !front || !back || !selfie) { Alert.alert('Incomplet', 'Veuillez fournir recto, verso et selfie'); return; }
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('phone_number', member.phone_number);
      fd.append('document_type', docType);
      fd.append('front',  { uri: front.uri,  name: front.name,  type: front.type  } as any);
      fd.append('back',   { uri: back.uri,   name: back.name,   type: back.type   } as any);
      fd.append('selfie', { uri: selfie.uri, name: selfie.name, type: selfie.type } as any);
      await api.post('/collector/documents', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      Alert.alert('Document soumis', `Le document de ${member.full_name} a été soumis pour vérification.`, [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (e: any) {
      Alert.alert('Erreur', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.root}>
        <View style={[styles.header, { paddingTop: insets.top + 14 }]}>
          <BackButton onPress={() => { if (step === 'upload') { setStep('lookup'); setMember(null); } else router.back(); }} />
          <Text style={styles.headerTitle}>KYC pour un membre</Text>
          <View style={{ width: 38 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          {step === 'lookup' ? (
            <View style={styles.block}>
              <Text style={styles.label}>Numéro du membre</Text>
              <View style={styles.phoneRow}>
                <View style={styles.prefix}>
                  <Text style={styles.prefixText}>+243</Text>
                </View>
                <TextInput
                  style={styles.phoneInput}
                  placeholder="8X XXX XXXX"
                  placeholderTextColor={Colors.iconMuted}
                  keyboardType="phone-pad"
                  value={phone}
                  onChangeText={setPhone}
                  maxLength={9}
                />
              </View>
              <TouchableOpacity
                style={[styles.primaryBtn, (!phone.trim() || looking) && styles.btnDisabled]}
                onPress={handleLookup}
                disabled={!phone.trim() || looking}
                activeOpacity={0.85}>
                <Text style={styles.primaryBtnLabel}>{looking ? 'Recherche...' : 'Trouver le membre'}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.block}>
              <View style={styles.memberCard}>
                <View style={styles.memberInitials}>
                  <Text style={styles.memberInitialsText}>{member!.initials}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.memberName}>{member!.full_name}</Text>
                  <Text style={styles.memberPhone}>{member!.phone_number}</Text>
                </View>
              </View>

              <Text style={styles.label}>Type de pièce</Text>
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

              <View style={styles.sideBySide}>
                <PhotoCard label="Recto" image={front} onPress={() => pickImage(setFront)} />
                <PhotoCard label="Verso" image={back}  onPress={() => pickImage(setBack)} />
              </View>
              <PhotoCard label="Selfie (photo personnelle)" image={selfie} onPress={() => pickImage(setSelfie)} fullWidth />

              <View style={styles.note}>
                <Text style={styles.noteText}>📷 Assurez-vous que les photos sont nettes et lisibles.</Text>
              </View>

              <TouchableOpacity
                style={[styles.primaryBtn, (loading || !front || !back || !selfie) && styles.btnDisabled]}
                onPress={handleSubmit}
                disabled={loading || !front || !back || !selfie}
                activeOpacity={0.85}>
                <Text style={styles.primaryBtnLabel}>{loading ? 'Soumission...' : 'Soumettre le document'}</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
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
  root: { flex: 1, backgroundColor: Colors.background },
  header: { backgroundColor: Colors.primary, paddingHorizontal: Spacing.four, paddingBottom: Spacing.three, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.two },
  headerTitle: { fontFamily: Fonts.bold, fontSize: 18, color: Colors.white, flex: 1, textAlign: 'center' },

  scroll: { padding: Spacing.four, paddingBottom: Spacing.six },
  block: { gap: Spacing.three },
  label: { fontFamily: Fonts.semiBold, fontSize: 15, color: Colors.charcoal },

  phoneRow: { flexDirection: 'row', borderRadius: 12, borderWidth: 1.5, borderColor: Colors.muted, backgroundColor: Colors.white, overflow: 'hidden' },
  prefix: { backgroundColor: Colors.coolGray, paddingHorizontal: Spacing.two + 2, justifyContent: 'center', borderRightWidth: 1, borderRightColor: Colors.muted },
  prefixText: { fontFamily: Fonts.semiBold, fontSize: 15, color: Colors.charcoal },
  phoneInput: { flex: 1, fontFamily: Fonts.regular, fontSize: 16, color: Colors.charcoal, paddingHorizontal: Spacing.two, paddingVertical: 14 },

  memberCard: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three, backgroundColor: Colors.white, borderRadius: 14, padding: Spacing.three, borderWidth: 1, borderColor: Colors.coolGray },
  memberInitials: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#e8f4f8', alignItems: 'center', justifyContent: 'center' },
  memberInitialsText: { fontFamily: Fonts.bold, fontSize: 18, color: Colors.primary },
  memberName: { fontFamily: Fonts.bold, fontSize: 16, color: Colors.charcoal },
  memberPhone: { fontFamily: Fonts.regular, fontSize: 13, color: Colors.steelGray },

  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  typeChip: { paddingHorizontal: Spacing.three, paddingVertical: Spacing.one + 2, borderRadius: 20, borderWidth: 1.5, borderColor: Colors.muted },
  typeChipActive: { backgroundColor: Colors.charcoal, borderColor: Colors.charcoal },
  typeLabel: { fontFamily: Fonts.medium, fontSize: 15, color: Colors.steelGray },
  typeLabelActive: { color: Colors.white },

  sideBySide: { flexDirection: 'row', gap: Spacing.two },
  photoCard: { flex: 1, height: 140, backgroundColor: Colors.white, borderRadius: 12, borderWidth: 1.5, borderColor: Colors.muted, borderStyle: 'dashed', overflow: 'hidden' },
  photoCardFull: { flex: undefined, height: 180 },
  photoPlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 4 },
  photoIcon: { fontSize: 28 },
  photoLabel: { fontFamily: Fonts.semiBold, fontSize: 15, color: Colors.charcoal },
  photoHint: { fontFamily: Fonts.regular, fontSize: 13, color: Colors.steelGray },
  photoPreview: { flex: 1, width: '100%' },
  photoOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.5)', paddingVertical: 4, paddingHorizontal: Spacing.two },
  photoOverlayText: { fontFamily: Fonts.semiBold, fontSize: 13, color: Colors.white },

  note: { backgroundColor: Colors.coolGray, borderRadius: 12, padding: Spacing.three },
  noteText: { fontFamily: Fonts.regular, fontSize: 15, color: Colors.steelGray },

  primaryBtn: { backgroundColor: Colors.primary, borderRadius: 14, paddingVertical: 15, alignItems: 'center' },
  btnDisabled: { opacity: 0.5 },
  primaryBtnLabel: { fontFamily: Fonts.bold, fontSize: 16, color: Colors.white },
});
