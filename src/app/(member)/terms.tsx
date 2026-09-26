import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BackButton } from '@/components/ui/back-button';
import { Colors, Fonts, Spacing } from '@/constants';

const SECTIONS = [
  {
    title: '1. Acceptation des conditions',
    body: "En utilisant l'application Uchumi, vous acceptez d'être lié par les présentes conditions d'utilisation. Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser l'application.",
  },
  {
    title: '2. Description du service',
    body: "Uchumi est une plateforme de gestion d'épargne communautaire qui permet aux membres de déposer et retirer des fonds, d'accéder à des prêts et de suivre leurs transactions financières via des collecteurs agréés.",
  },
  {
    title: '3. Éligibilité',
    body: 'Pour utiliser Uchumi, vous devez être âgé d\'au moins 18 ans, fournir des informations d\'identité exactes et complètes, et résider dans une zone couverte par nos collecteurs agréés.',
  },
  {
    title: '4. Obligations du membre',
    body: 'Vous vous engagez à fournir des informations exactes lors de l\'inscription, à ne pas partager vos identifiants de connexion, à signaler immédiatement toute activité suspecte sur votre compte, et à respecter les délais de remboursement des prêts contractés.',
  },
  {
    title: '5. Transactions et fonds',
    body: 'Toutes les transactions sont enregistrées et traçables. Uchumi ne garantit pas de rendement sur l\'épargne. Les retraits sont soumis à traitement par votre collecteur sous 24 à 48 heures ouvrables. Les prêts accordés doivent être remboursés selon les modalités convenues.',
  },
  {
    title: '6. Responsabilité',
    body: "Uchumi ne saurait être tenu responsable des pertes résultant d'une utilisation non autorisée de votre compte, d'informations incorrectes fournies par le membre, ou de circonstances indépendantes de notre volonté (force majeure, pannes réseau, etc.).",
  },
  {
    title: '7. Modification des conditions',
    body: "Uchumi se réserve le droit de modifier ces conditions à tout moment. Les modifications entrent en vigueur dès leur publication dans l'application. L'utilisation continue du service vaut acceptation des conditions modifiées.",
  },
  {
    title: '8. Résiliation',
    body: "Uchumi peut suspendre ou résilier votre accès en cas de violation des présentes conditions, de fraude suspectée, ou de demande des autorités compétentes. Vous pouvez clôturer votre compte à tout moment via votre collecteur attitré.",
  },
  {
    title: '9. Droit applicable',
    body: "Les présentes conditions sont régies par le droit en vigueur en République Démocratique du Congo. Tout litige sera soumis à la juridiction compétente du lieu du siège social d'Uchumi.",
  },
];

export default function TermsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View style={styles.root}>
      <View style={[styles.header, { paddingTop: insets.top + 14 }]}>
        <BackButton onPress={() => router.back()} />
        <Text style={styles.headerTitle}>{"Conditions d'utilisation"}</Text>
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
