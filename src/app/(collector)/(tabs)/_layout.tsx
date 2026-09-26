import { Tabs, router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { Colors, Fonts } from '@/constants';

function HomeIcon({ color }: { color: string }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path d="M3 9.5L12 3L21 9.5V20C21 20.55 20.55 21 20 21H15V15H9V21H4C3.45 21 3 20.55 3 20V9.5Z"
        stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
function MembersIcon({ color }: { color: string }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path d="M17 21V19C17 16.79 15.21 15 13 15H5C2.79 15 1 16.79 1 19V21" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      <Circle cx="9" cy="7" r="4" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M23 21V19C23 17.13 21.65 15.57 19.87 15.13" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
      <Path d="M16 3.13C17.79 3.57 19.14 5.14 19.14 7.01C19.14 8.88 17.79 10.45 16 10.88" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}
function WithdrawIcon({ color }: { color: string }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Rect x="2" y="5" width="20" height="14" rx="2" stroke={color} strokeWidth={1.8} />
      <Path d="M2 10H22" stroke={color} strokeWidth={1.8} />
      <Path d="M6 15H10" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}
function LoanIcon({ color }: { color: string }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path d="M12 2C8.69 2 6 4.69 6 8C6 10.32 7.31 12.33 9.23 13.38L9 22H15L14.77 13.38C16.69 12.33 18 10.32 18 8C18 4.69 15.31 2 12 2Z"
        stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
function MoreIcon({ color }: { color: string }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Circle cx="5" cy="12" r="1.5" fill={color} />
      <Circle cx="12" cy="12" r="1.5" fill={color} />
      <Circle cx="19" cy="12" r="1.5" fill={color} />
    </Svg>
  );
}

const TABS = [
  { name: 'dashboard',   label: 'Accueil',  Icon: HomeIcon,      href: '/(collector)/(tabs)/dashboard' },
  { name: 'members',     label: 'Membres',  Icon: MembersIcon,   href: '/(collector)/(tabs)/members' },
  { name: 'withdrawals', label: 'Retraits', Icon: WithdrawIcon,  href: '/(collector)/(tabs)/withdrawals' },
  { name: 'loans',       label: 'Prêts',    Icon: LoanIcon,      href: '/(collector)/(tabs)/loans' },
  { name: 'profile',     label: 'Plus',     Icon: MoreIcon,      href: '/(collector)/(tabs)/profile' },
];

function TabBar({ state }: any) {
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
              <tab.Icon color={color} />
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

export default function CollectorTabsLayout() {
  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <TabBar {...props} />}>
      <Tabs.Screen name="dashboard" />
      <Tabs.Screen name="members" />
      <Tabs.Screen name="withdrawals" />
      <Tabs.Screen name="loans" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    flexDirection: 'row',
    paddingTop: 8,
    paddingBottom: 6,
  },
  tab: { flex: 1, alignItems: 'center', gap: 3, paddingVertical: 4 },
  label: { fontFamily: Fonts.medium, fontSize: 12, lineHeight: 13 },
  pressed: { opacity: 0.6 },
});
