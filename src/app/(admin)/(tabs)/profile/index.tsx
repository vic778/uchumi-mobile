import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { Colors, Fonts, Spacing } from '@/constants';
import { logout } from '@/services/auth';

const ADMIN_DARK = '#0f172a';

type MenuItem = { label: string; icon: string; onPress: () => void; danger?: boolean };

function ChevronRight() {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Path d="M9 18L15 12L9 6" stroke={Colors.steelGray} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export default function AdminProfileScreen() {
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
      title: 'Gestion',
      items: [
        { label: 'Retraits',         icon: '💸', onPress: () => router.push('/(admin)/withdrawals' as any) },
        { label: 'Plans d\'épargne',  icon: '📊', onPress: () => router.push('/(admin)/savings-plans' as any) },
        { label: 'Dépôt manuel',     icon: '💰', onPress: () => router.push('/(admin)/deposits/new' as any) },
      ],
    },
    {
      title: 'Compte',
      items: [
        { label: 'Se déconnecter', icon: '🔴', onPress: handleLogout, danger: true },
      ],
    },
  ];

  return (
    <View style={styles.root}>
      <View style={[styles.header, { paddingTop: insets.top + 14 }]}>
        <Text style={styles.headerSub}>ADMINISTRATION</Text>
        <Text style={styles.headerTitle}>Plus</Text>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: Spacing.four }]}
        showsVerticalScrollIndicator={false}>

        {sections.map((section, si) => (
          <View key={si}>
            {section.title && <Text style={styles.sectionTitle}>{section.title.toUpperCase()}</Text>}
            <View style={styles.sectionCard}>
              {section.items.map((item, ii) => (
                <TouchableOpacity
                  key={ii}
                  style={[styles.menuRow, ii < section.items.length - 1 && styles.menuBorder]}
                  onPress={item.onPress}
                  activeOpacity={0.7}>
                  <View style={styles.menuLeft}>
                    <View style={styles.menuIconWrap}>
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
  header: { backgroundColor: ADMIN_DARK, paddingHorizontal: Spacing.four, paddingBottom: Spacing.three },
  headerSub:   { fontFamily: Fonts.bold, fontSize: 10, color: 'rgba(255,255,255,0.45)', letterSpacing: 1.2 },
  headerTitle: { fontFamily: Fonts.bold, fontSize: 22, color: Colors.white },
  scroll: { paddingHorizontal: Spacing.four, paddingTop: Spacing.three },
  sectionTitle: { fontFamily: Fonts.bold, fontSize: 12, color: Colors.steelGray, letterSpacing: 0.8, paddingHorizontal: 2, marginBottom: Spacing.one, marginTop: Spacing.one },
  sectionCard: { backgroundColor: Colors.white, borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: Colors.coolGray, marginBottom: Spacing.three },
  menuRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.three, paddingVertical: Spacing.three },
  menuBorder: { borderBottomWidth: 1, borderBottomColor: Colors.coolGray },
  menuLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  menuIconWrap: { width: 38, height: 38, borderRadius: 10, backgroundColor: ADMIN_DARK + '12', alignItems: 'center', justifyContent: 'center' },
  menuIcon: { fontSize: 18 },
  menuLabel: { fontFamily: Fonts.bold, fontSize: 16, color: Colors.charcoal },
});
