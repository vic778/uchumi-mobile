import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { Colors, Fonts, Spacing } from '@/constants';
import { logout } from '@/services/auth';

type MenuItem = { label: string; icon: string; onPress: () => void; danger?: boolean };

function ChevronRight() {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Path d="M9 18L15 12L9 6" stroke={Colors.steelGray} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export default function CollectorProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const handleLogout = () => {
    Alert.alert('Déconnexion', 'Êtes-vous sûr de vouloir vous déconnecter ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Déconnecter', style: 'destructive', onPress: async () => {
          await logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  const sections: { title?: string; items: MenuItem[] }[] = [
    {
      // Identical to member profile — collector's own account actions
      items: [
        { label: 'Mes documents KYC',   icon: '📄', onPress: () => router.push('/(member)/documents' as any) },
        { label: 'Mes retraits',         icon: '💸', onPress: () => router.push('/(member)/withdrawals' as any) },
        { label: 'Mes prêts',            icon: '💳', onPress: () => router.push('/(member)/loans' as any) },
        { label: 'Notifications',        icon: '🔔', onPress: () => router.push('/(collector)/(tabs)/notifications' as any) },
      ],
    },
    {
      // Collector-exclusive privileged actions
      title: 'Espace collecteur',
      items: [
        { label: 'Dépôt pour un membre',  icon: '💰', onPress: () => router.push('/(collector)/deposits/new' as any) },
        { label: 'Retraits à décaisser', icon: '🏦', onPress: () => router.push('/(collector)/withdrawals' as any) },
        { label: 'KYC pour un membre',   icon: '🪪', onPress: () => router.push('/(collector)/kyc/new' as any) },
      ],
    },
    {
      title: 'Informations',
      items: [
        { label: 'À propos de nous',             icon: 'ℹ️',  onPress: () => router.push('/(member)/about' as any) },
        { label: "Conditions d'utilisation",      icon: '📜', onPress: () => router.push('/(member)/terms' as any) },
        { label: 'Politique de confidentialité', icon: '🔒', onPress: () => router.push('/(member)/privacy' as any) },
      ],
    },
    {
      items: [
        { label: 'Se déconnecter', icon: '🔴', onPress: handleLogout, danger: true },
      ],
    },
  ];

  return (
    <View style={styles.root}>
      <View style={[styles.header, { paddingTop: insets.top + 14 }]}>
        <Text style={styles.headerTitle}>Plus de services</Text>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: Spacing.four }]}
        showsVerticalScrollIndicator={false}>

        {sections.map((section, si) => (
          <View key={si}>
            {section.title && <Text style={styles.sectionTitle}>{section.title.toUpperCase()}</Text>}
            <View style={[styles.sectionCard, section.title === 'Espace collecteur' && styles.sectionCardAccent]}>
              {section.items.map((item, ii) => (
                <TouchableOpacity
                  key={ii}
                  style={[styles.menuRow, ii < section.items.length - 1 && styles.menuBorder]}
                  onPress={item.onPress}
                  activeOpacity={0.7}>
                  <View style={styles.menuLeft}>
                    <View style={[styles.menuIconWrap, section.title === 'Espace collecteur' && styles.menuIconWrapAccent]}>
                      <Text style={styles.menuIcon}>{item.icon}</Text>
                    </View>
                    <Text style={[styles.menuLabel, item.danger && { color: Colors.danger }]}>{item.label}</Text>
                  </View>
                  <ChevronRight />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  header: { backgroundColor: Colors.primary, paddingHorizontal: Spacing.four, paddingBottom: Spacing.three },
  headerTitle: { fontFamily: Fonts.bold, fontSize: 18, color: Colors.white },
  scroll: { paddingHorizontal: Spacing.four, paddingTop: Spacing.three },
  sectionTitle: { fontFamily: Fonts.bold, fontSize: 12, color: Colors.steelGray, letterSpacing: 0.8, paddingHorizontal: 2, marginBottom: Spacing.one, marginTop: Spacing.one },
  sectionCard: { backgroundColor: Colors.white, borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: Colors.coolGray, marginBottom: Spacing.three },
  sectionCardAccent: { borderColor: Colors.primary, borderWidth: 1.5 },
  menuRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.three, paddingVertical: Spacing.three },
  menuBorder: { borderBottomWidth: 1, borderBottomColor: Colors.coolGray },
  menuLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  menuIconWrap: { width: 38, height: 38, borderRadius: 10, backgroundColor: '#e8f4f8', alignItems: 'center', justifyContent: 'center' },
  menuIconWrapAccent: { backgroundColor: '#d4ecf7' },
  menuIcon: { fontSize: 18 },
  menuLabel: { fontFamily: Fonts.bold, fontSize: 16, color: Colors.charcoal },
});
