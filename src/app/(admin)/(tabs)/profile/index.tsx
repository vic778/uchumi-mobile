import { Alert, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronRight, Receipt, Banknote, BarChart3, PiggyBank, Lock, LogOut } from 'lucide-react-native';
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

export default function AdminProfileScreen() {
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

  const sections: { title?: string; items: MenuItem[] }[] = [
    {
      title: 'Gestion',
      items: [
        { label: 'Transactions',     icon: <Receipt   size={20} color={Colors.primary} strokeWidth={1.8} />, onPress: () => router.push('/(admin)/transactions' as any) },
        { label: 'Retraits',         icon: <Banknote  size={20} color={Colors.primary} strokeWidth={1.8} />, onPress: () => router.push('/(admin)/withdrawals' as any) },
        { label: "Plans d'épargne",  icon: <BarChart3 size={20} color={Colors.primary} strokeWidth={1.8} />, onPress: () => router.push('/(admin)/savings-plans' as any) },
        { label: 'Dépôt manuel',     icon: <PiggyBank size={20} color={Colors.primary} strokeWidth={1.8} />, onPress: () => router.push('/(admin)/deposits/new' as any) },
      ],
    },
    {
      title: 'Sécurité',
      items: [
        {
          label: 'Verrouillage biométrique',
          icon: <Lock size={20} color={Colors.primary} strokeWidth={1.8} />,
          switchValue: lockEnabled,
          onSwitchChange: toggleLock,
        },
      ],
    },
    {
      title: 'Compte',
      items: [
        { label: 'Se déconnecter', icon: <LogOut size={20} color={Colors.danger} strokeWidth={1.8} />, onPress: handleLogout, danger: true },
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
                  onPress={item.switchValue !== undefined ? undefined : item.onPress}
                  activeOpacity={item.switchValue !== undefined ? 1 : 0.7}
                  disabled={item.switchValue !== undefined}>
                  <View style={styles.menuLeft}>
                    <View style={styles.menuIconWrap}>
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
  root:         { flex: 1, backgroundColor: Colors.background },
  header:       { backgroundColor: Colors.primary, paddingHorizontal: Spacing.four, paddingBottom: Spacing.three },
  headerSub:    { fontFamily: Fonts.bold, fontSize: 10, color: 'rgba(255,255,255,0.45)', letterSpacing: 1.2 },
  headerTitle:  { fontFamily: Fonts.bold, fontSize: 22, color: Colors.white },
  scroll:       { paddingHorizontal: Spacing.four, paddingTop: Spacing.three },
  sectionTitle: { fontFamily: Fonts.bold, fontSize: 12, color: Colors.steelGray, letterSpacing: 0.8, paddingHorizontal: 2, marginBottom: Spacing.one, marginTop: Spacing.one },
  sectionCard:  { backgroundColor: Colors.white, borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: Colors.coolGray, marginBottom: Spacing.three },
  menuRow:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.three, paddingVertical: Spacing.three },
  menuBorder:   { borderBottomWidth: 1, borderBottomColor: Colors.coolGray },
  menuLeft:     { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  menuIconWrap: { width: 38, height: 38, borderRadius: 10, backgroundColor: Colors.primary + '12', alignItems: 'center', justifyContent: 'center' },
  menuLabel:    { fontFamily: Fonts.bold, fontSize: 16, color: Colors.charcoal },
});
