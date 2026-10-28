import { Alert, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronRight, FileText, Banknote, CreditCard, Bell, PiggyBank, Building2, BadgeCheck, Lock, Info, ScrollText, ShieldCheck, LogOut } from 'lucide-react-native';
import { Colors, Fonts, Spacing } from '@/constants';
import { logout } from '@/services/auth';
import { useAppLock } from '@/context/app-lock-context';

type MenuItem = {
  label: string;
  icon: React.ReactNode;
  onPress?: () => void;
  danger?: boolean;
  switchValue?: boolean;
  onSwitchChange?: (v: boolean) => void;
};

export default function CollectorProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { enabled: lockEnabled, toggle: toggleLock } = useAppLock();

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

  const ic = (color = Colors.primary) => ({ size: 20, color, strokeWidth: 1.8 }) as const;

  const sections: { title?: string; items: MenuItem[] }[] = [
    {
      items: [
        { label: 'Mes documents KYC',   icon: <FileText   {...ic()} />, onPress: () => router.push('/(member)/documents' as any) },
        { label: 'Mes retraits',         icon: <Banknote   {...ic()} />, onPress: () => router.push('/(member)/withdrawals' as any) },
        { label: 'Mes prêts',            icon: <CreditCard {...ic()} />, onPress: () => router.push('/(member)/loans' as any) },
        { label: 'Notifications',        icon: <Bell       {...ic()} />, onPress: () => router.push('/(collector)/(tabs)/notifications' as any) },
      ],
    },
    {
      title: 'Espace collecteur',
      items: [
        { label: 'Dépôt pour un membre',  icon: <PiggyBank  {...ic()} />, onPress: () => router.push('/(collector)/deposits/new' as any) },
        { label: 'Retraits à décaisser', icon: <Building2  {...ic()} />, onPress: () => router.push('/(collector)/withdrawals' as any) },
        { label: 'KYC pour un membre',   icon: <BadgeCheck {...ic()} />, onPress: () => router.push('/(collector)/kyc/new' as any) },
      ],
    },
    {
      title: 'Sécurité',
      items: [
        {
          label: 'Verrouillage biométrique',
          icon: <Lock {...ic()} />,
          switchValue: lockEnabled,
          onSwitchChange: toggleLock,
        },
      ],
    },
    {
      title: 'Informations',
      items: [
        { label: 'À propos de nous',             icon: <Info       {...ic()} />, onPress: () => router.push('/(member)/about' as any) },
        { label: "Conditions d'utilisation",      icon: <ScrollText {...ic()} />, onPress: () => router.push('/(member)/terms' as any) },
        { label: 'Politique de confidentialité', icon: <ShieldCheck {...ic()} />, onPress: () => router.push('/(member)/privacy' as any) },
      ],
    },
    {
      items: [
        { label: 'Se déconnecter', icon: <LogOut size={20} color={Colors.danger} strokeWidth={1.8} />, onPress: handleLogout, danger: true },
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
                  onPress={item.switchValue !== undefined ? undefined : item.onPress}
                  activeOpacity={item.switchValue !== undefined ? 1 : 0.7}
                  disabled={item.switchValue !== undefined}>
                  <View style={styles.menuLeft}>
                    <View style={[styles.menuIconWrap, section.title === 'Espace collecteur' && styles.menuIconWrapAccent]}>
                      {item.icon}
                    </View>
                    <Text style={[styles.menuLabel, item.danger && { color: Colors.danger }]}>{item.label}</Text>
                  </View>
                  {item.switchValue !== undefined
                    ? <Switch value={item.switchValue} onValueChange={item.onSwitchChange} trackColor={{ true: Colors.primary }} thumbColor={Colors.white} />
                    : <ChevronRight size={16} color={Colors.steelGray} strokeWidth={2} />}
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
  menuLabel: { fontFamily: Fonts.bold, fontSize: 16, color: Colors.charcoal },
});
