import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BackButton } from '@/components/ui/back-button';
import { Colors, Fonts, Spacing } from '@/constants';

const SECTIONS = [
  {
    title: '1. Données collectées',
    body: "Uchumi collecte les données suivantes lors de votre inscription et utilisation : nom complet, numéro de téléphone, informations d'identité (pièce d'identité nationale ou passeport), données de transactions (dépôts, retraits, prêts), et données d'utilisation de l'application.",
  },
  {
    title: '2. Finalité du traitement',
    body: "Vos données sont utilisées pour : vérifier votre identité (processus KYC), gérer votre compte et vos transactions, prévenir la fraude et le blanchiment d'argent, vous envoyer des notifications relatives à votre compte, et améliorer nos services.",
  },
  {
    title: '3. Base légale',
    body: "Le traitement de vos données repose sur l'exécution du contrat de service que vous avez conclu avec Uchumi, le respect des obligations légales en matière financière et de lutte contre le blanchiment, et votre consentement explicite pour les communications marketing (optionnel).",
  },
  {
    title: '4. Partage des données',
    body: "Nous ne vendons jamais vos données personnelles. Elles peuvent être partagées avec vos collecteurs Uchumi agréés pour la gestion de votre compte, les autorités de régulation financière sur réquisition légale, et nos prestataires techniques dans le cadre strict de la fourniture du service.",
  },
  {
    title: '5. Conservation des données',
    body: "Vos données sont conservées pendant toute la durée de votre relation avec Uchumi, puis archivées pendant 10 ans conformément aux obligations légales applicables aux établissements de microfinance.",
  },
  {
    title: '6. Sécurité',
    body: "Uchumi met en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données : chiffrement des données en transit et au repos, accès restreint aux données personnelles, surveillance continue des systèmes, et audits de sécurité réguliers.",
  },
  {
    title: '7. Vos droits',
    body: "Vous disposez des droits suivants sur vos données : accès, rectification, effacement (sous réserve des obligations légales), limitation du traitement, et portabilité. Pour exercer ces droits, contactez-nous via votre collecteur ou à l'adresse indiquée ci-dessous.",
  },
  {
    title: '8. Contact',
    body: "Pour toute question relative à la protection de vos données personnelles, vous pouvez contacter notre délégué à la protection des données à l'adresse : privacy@uchumi.cd",
  },
];

export default function PrivacyScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View style={styles.root}>
      <View style={[styles.header, { paddingTop: insets.top + 14 }]}>
        <BackButton onPress={() => router.back()} />
        <Text style={styles.headerTitle}>Politique de confidentialité</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: Math.max(insets.bottom, Spacing.five) }]}
        showsVerticalScrollIndicator={false}>

        <Text style={styles.updated}>Dernière mise à jour : septembre 2026</Text>

        {SECTIONS.map((s) => (
          <View key={s.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{s.title}</Text>
            <Text style={styles.sectionBody}>{s.body}</Text>
          </View>
        ))}
      </ScrollView>
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
  scroll: { paddingHorizontal: Spacing.four, paddingTop: Spacing.three },
  updated: { fontFamily: Fonts.regular, fontSize: 13, color: Colors.steelGray, marginBottom: Spacing.three },
  section: { marginBottom: Spacing.four },
  sectionTitle: { fontFamily: Fonts.bold, fontSize: 15, color: Colors.charcoal, marginBottom: Spacing.one },
  sectionBody: { fontFamily: Fonts.regular, fontSize: 15, color: Colors.steelGray, lineHeight: 23 },
});
