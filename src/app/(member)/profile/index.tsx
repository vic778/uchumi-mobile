import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MemberTabBar } from '@/components/navigation/member-tab-bar';
import { Colors, Fonts, Spacing } from '@/constants';
import { logout } from '@/services/auth';
import { UchumiLogo } from '@/components/ui/uchumi-logo';

export default function MemberProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const handleLogout = () => {
    Alert.alert('Déconnexion', 'Êtes-vous sûr de vouloir vous déconnecter ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Déconnecter', style: 'destructive', onPress: async () => {
          await logout();
          router.replace('/(auth)/login');
        }
      },
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.surface }}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.three }]}>
        <Text style={styles.title}>Profil</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.logoWrap}>
          <UchumiLogo style={{ width: 90, height: 30 }} />
        </View>

        <View style={styles.section}>
          <MenuItem label="📄 Mes documents KYC" onPress={() => router.push('/(member)/documents' as any)} />
          <MenuItem label="💸 Mes retraits" onPress={() => router.push('/(member)/withdrawals' as any)} />
          <MenuItem label="🔔 Notifications" onPress={() => router.push('/(member)/notifications' as any)} />
        </View>

        <View style={styles.section}>
          <MenuItem label="🔴 Se déconnecter" onPress={handleLogout} danger />
        </View>
      </ScrollView>

      <MemberTabBar active="profile" />
    </View>
  );
}

function MenuItem({ label, onPress, danger = false }: { label: string; onPress: () => void; danger?: boolean }) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
      <Text style={[styles.menuLabel, danger && { color: Colors.danger }]}>{label}</Text>
      <Text style={styles.chevron}>›</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: Spacing.four, paddingBottom: Spacing.three },
  title: { fontFamily: Fonts.bold, fontSize: 24, color: Colors.charcoal },
  scroll: { paddingHorizontal: Spacing.four, paddingBottom: 120 },
  logoWrap: { alignItems: 'center', paddingVertical: Spacing.four },
  section: { backgroundColor: Colors.white, borderRadius: 16, marginBottom: Spacing.three, overflow: 'hidden' },
  menuItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.three, paddingVertical: Spacing.three, borderBottomWidth: 1, borderBottomColor: Colors.muted },
  menuLabel: { fontFamily: Fonts.semiBold, fontSize: 15, color: Colors.charcoal },
  chevron: { fontFamily: Fonts.bold, fontSize: 20, color: Colors.iconMuted },
});
