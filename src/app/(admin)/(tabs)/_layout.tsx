import { Tabs, router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { Fonts } from '@/constants';

const ADMIN_DARK  = '#0f172a';
const ADMIN_AMBER = '#f59e0b';
const ADMIN_MUTED = 'rgba(255,255,255,0.45)';

function DashIcon({ color }: { color: string }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Rect x={3}  y={3}  width={8}  height={8}  rx={2} stroke={color} strokeWidth={1.8} />
      <Rect x={13} y={3}  width={8}  height={8}  rx={2} stroke={color} strokeWidth={1.8} />
      <Rect x={3}  y={13} width={8}  height={8}  rx={2} stroke={color} strokeWidth={1.8} />
      <Rect x={13} y={13} width={8}  height={8}  rx={2} stroke={color} strokeWidth={1.8} />
    </Svg>
  );
}

function MembersIcon({ color }: { color: string }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Circle cx={9}  cy={7}  r={4} stroke={color} strokeWidth={1.8} />
      <Circle cx={17} cy={9}  r={3} stroke={color} strokeWidth={1.8} />
      <Path d="M2 21v-1a7 7 0 0 1 14 0v1"   stroke={color} strokeWidth={1.8} strokeLinecap="round" />
      <Path d="M22 21v-1a5 5 0 0 0-5-5"     stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}

function KycIcon({ color }: { color: string }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path d="M9 11l3 3L22 4"        stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}

function LoansIcon({ color }: { color: string }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}

function PlusIcon({ color }: { color: string }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={9}   stroke={color} strokeWidth={1.8} />
      <Path d="M12 8v8M8 12h8"        stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}

const TABS = [
  { name: 'dashboard',     label: 'Tableau', Icon: DashIcon,    href: '/(admin)/(tabs)/dashboard' },
  { name: 'members/index', label: 'Membres', Icon: MembersIcon, href: '/(admin)/(tabs)/members/index' },
  { name: 'kyc/index',     label: 'KYC',     Icon: KycIcon,     href: '/(admin)/(tabs)/kyc/index' },
  { name: 'loans/index',   label: 'Prêts',   Icon: LoansIcon,   href: '/(admin)/(tabs)/loans/index' },
  { name: 'profile/index', label: 'Plus',    Icon: PlusIcon,    href: '/(admin)/(tabs)/profile/index' },
];

function AdminTabBar({ state }: any) {
  const insets = useSafeAreaInsets();
  const currentRoute = state.routes[state.index]?.name ?? '';

  return (
    <View>
      <View style={styles.bar}>
        {TABS.map((tab) => {
          const isActive = currentRoute === tab.name || currentRoute.startsWith(tab.name + '/');
          const color = isActive ? ADMIN_AMBER : ADMIN_MUTED;
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
        <View style={{ height: insets.bottom, backgroundColor: ADMIN_DARK }} />
      )}
    </View>
  );
}

export default function AdminTabsLayout() {
  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <AdminTabBar {...props} />}>
      <Tabs.Screen name="dashboard" />
      <Tabs.Screen name="members/index" />
      <Tabs.Screen name="kyc/index" />
      <Tabs.Screen name="loans/index" />
      <Tabs.Screen name="profile/index" />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: ADMIN_DARK,
    flexDirection: 'row',
    paddingTop: 8,
    paddingBottom: 6,
  },
  tab:     { flex: 1, alignItems: 'center', gap: 3, paddingVertical: 4 },
  label:   { fontFamily: Fonts.medium, fontSize: 12, lineHeight: 13 },
  pressed: { opacity: 0.6 },
});
