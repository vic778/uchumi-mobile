import { Tabs, router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LayoutDashboard, Users, BadgeCheck, Banknote, Ellipsis } from 'lucide-react-native';
import { Colors, Fonts } from '@/constants';
import { usePushNotifications } from '@/hooks/use-push-notifications';

const TABS = [
  { name: 'dashboard', label: 'Tableau', Icon: LayoutDashboard, href: '/(admin)/(tabs)/dashboard' },
  { name: 'members',   label: 'Membres', Icon: Users,           href: '/(admin)/(tabs)/members' },
  { name: 'kyc',       label: 'KYC',     Icon: BadgeCheck,      href: '/(admin)/(tabs)/kyc' },
  { name: 'loans',     label: 'Prêts',   Icon: Banknote,        href: '/(admin)/(tabs)/loans' },
  { name: 'profile',   label: 'Plus',    Icon: Ellipsis,        href: '/(admin)/(tabs)/profile' },
];

function AdminTabBar({ state }: any) {
  const insets = useSafeAreaInsets();
  const currentRoute = state.routes[state.index]?.name ?? '';

  return (
    <View>
      <View style={styles.bar}>
        {TABS.map((tab) => {
          const isActive = currentRoute === tab.name || currentRoute.startsWith(tab.name + '/');
          const color = isActive ? Colors.primary : Colors.steelGray;
          return (
            <Pressable
              key={tab.name}
              accessibilityRole="button"
              accessibilityLabel={tab.label}
              accessibilityState={{ selected: isActive }}
              onPress={() => { if (!isActive) router.navigate(tab.href as any); }}
              style={({ pressed }) => [styles.tab, pressed && styles.pressed]}>
              <tab.Icon size={22} color={color} strokeWidth={1.8} />
              <Text style={[styles.label, { color }]}>{tab.label}</Text>
            </Pressable>
          );
        })}
      </View>
      {insets.bottom > 0 && (
        <View style={{ height: insets.bottom, backgroundColor: '#000' }} />
      )}
    </View>
  );
}

export default function AdminTabsLayout() {
  usePushNotifications();
  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <AdminTabBar {...props} />}>
      <Tabs.Screen name="dashboard" />
      <Tabs.Screen name="members" />
      <Tabs.Screen name="kyc" />
      <Tabs.Screen name="loans" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  bar:     { backgroundColor: Colors.white, borderTopWidth: 1, borderTopColor: '#e5e7eb', flexDirection: 'row', paddingTop: 8, paddingBottom: 6 },
  tab:     { flex: 1, alignItems: 'center', gap: 3, paddingVertical: 4 },
  label:   { fontFamily: Fonts.medium, fontSize: 12, lineHeight: 13 },
  pressed: { opacity: 0.6 },
});
