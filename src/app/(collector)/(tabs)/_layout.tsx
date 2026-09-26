import { Tabs, router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Circle } from 'react-native-svg';
import { Colors, Fonts } from '@/constants';

function HomeIcon({ color }: { color: string }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path d="M3 9.5L12 3L21 9.5V20C21 20.55 20.55 21 20 21H15V15H9V21H4C3.45 21 3 20.55 3 20V9.5Z"
        stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
function SavingsIcon({ color }: { color: string }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path d="M12 2C10.34 2 9 3.34 9 5C9 6.66 10.34 8 12 8C13.66 8 15 6.66 15 5C15 3.34 13.66 2 12 2Z"
        stroke={color} strokeWidth={1.8} strokeLinecap="round" />
      <Path d="M4 15C4 12.24 7.58 10 12 10C16.42 10 20 12.24 20 15V20C20 21.1 19.1 22 18 22H6C4.9 22 4 21.1 4 20V15Z"
        stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
function LoanIcon({ color }: { color: string }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path d="M21 4H3C1.9 4 3 5 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 5 22.1 4 21 4Z"
        stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M1 10H23" stroke={color} strokeWidth={1.8} />
      <Path d="M7 15H10M14 15H17" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}
function BellIcon({ color }: { color: string }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path d="M18 8A6 6 0 0 0 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z"
        stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M13.73 21C13.55 21.3 13.28 21.55 12.96 21.72C12.65 21.89 12.33 21.97 12 21.97C11.67 21.97 11.35 21.89 11.04 21.72C10.72 21.55 10.45 21.3 10.27 21"
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
  { name: 'dashboard', label: 'Accueil', Icon: HomeIcon,    href: '/(collector)/(tabs)/dashboard' },
  { name: 'savings',   label: 'Comptes', Icon: SavingsIcon, href: '/(collector)/(tabs)/savings' },
  { name: 'loans',     label: 'Prêts',   Icon: LoanIcon,    href: '/(collector)/(tabs)/loans' },
  { name: 'profile',   label: 'Plus',    Icon: MoreIcon,    href: '/(collector)/(tabs)/profile' },
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
      <Tabs.Screen name="savings" />
      <Tabs.Screen name="loans" />
      <Tabs.Screen name="notifications" options={{ href: null }} />
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
