import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Circle } from 'react-native-svg';
import { BackButton } from '@/components/ui/back-button';
import { Colors, Fonts, Spacing } from '@/constants';

function UchumiLogo() {
  return (
    <Svg width={56} height={56} viewBox="0 0 56 56" fill="none">
      <Circle cx={28} cy={28} r={28} fill={Colors.primary} />
      <Path d="M16 22C16 22 16 34 28 34C40 34 40 22 40 22" stroke="#fff" strokeWidth={3} strokeLinecap="round" />
      <Path d="M22 22V30" stroke="#fff" strokeWidth={3} strokeLinecap="round" />
      <Path d="M34 22V30" stroke="#fff" strokeWidth={3} strokeLinecap="round" />
    </Svg>
  );
}

export default function AboutScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View style={styles.root}>
      <View style={[styles.header, { paddingTop: insets.top + 14 }]}>
        <BackButton onPress={() => router.back()} />
        <Text style={styles.headerTitle}>À propos</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: Math.max(insets.bottom, Spacing.five) }]} showsVerticalScrollIndicator={false}>

        <View style={styles.logoBlock}>
          <UchumiLogo />
          <Text style={styles.appName}>Uchumi</Text>
          <Text style={styles.tagline}>L'épargne communautaire, simplifiée.</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Notre mission</Text>
          <Text style={styles.cardBody}>
            Uchumi accompagne les communautés en leur offrant un accès simple et sécurisé à l'épargne, au crédit et aux services financiers de proximité — sans les barrières des banques traditionnelles.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Comment ça marche</Text>
          <Text style={styles.cardBody}>
            Vous épargnez régulièrement auprès d'un collecteur de confiance de votre quartier. Vos fonds sont sécurisés, accessibles et peuvent vous ouvrir droit à des prêts adaptés à votre situation.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Nos valeurs</Text>
          {['Confiance et transparence', 'Proximité avec nos membres', 'Inclusion financière pour tous', 'Sécurité et intégrité des fonds'].map((v) => (
            <View key={v} style={styles.valueRow}>
              <View style={styles.valueDot} />
              <Text style={styles.valueText}>{v}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.version}>Version 1.0.0</Text>
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

  scroll: { paddingHorizontal: Spacing.four, paddingTop: Spacing.four },

  logoBlock: { alignItems: 'center', marginBottom: Spacing.four, gap: Spacing.two },
  appName: { fontFamily: Fonts.bold, fontSize: 26, color: Colors.charcoal },
  tagline: { fontFamily: Fonts.regular, fontSize: 15, color: Colors.steelGray, textAlign: 'center' },

  card: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.coolGray,
    padding: Spacing.four,
    marginBottom: Spacing.three,
    gap: Spacing.two,
  },
  cardTitle: { fontFamily: Fonts.bold, fontSize: 16, color: Colors.charcoal },
  cardBody: { fontFamily: Fonts.regular, fontSize: 15, color: Colors.steelGray, lineHeight: 22 },

  valueRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  valueDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: Colors.primary },
  valueText: { fontFamily: Fonts.regular, fontSize: 15, color: Colors.steelGray },

  version: { fontFamily: Fonts.regular, fontSize: 13, color: Colors.iconMuted, textAlign: 'center', marginTop: Spacing.two },
});
