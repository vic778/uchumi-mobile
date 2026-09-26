import { useRouter, type Href } from 'expo-router';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Fonts, Routes, Spacing, tabBarBottomPad } from '@/constants';

export type MemberTab = 'dashboard' | 'savings' | 'loans' | 'documents' | 'profile';

const TABS: { id: MemberTab; label: string; icon: string; route: string }[] = [
  { id: 'dashboard', label: 'Accueil',   icon: '⌂', route: Routes.memberDashboard },
  { id: 'savings',   label: 'Épargne',   icon: '🐖', route: Routes.memberSavings },
  { id: 'loans',     label: 'Prêts',     icon: '💳', route: Routes.memberLoans },
  { id: 'documents', label: 'Docs',      icon: '📄', route: Routes.memberDocuments },
  { id: 'profile',   label: 'Profil',    icon: '👤', route: Routes.memberProfile },
];

export function MemberTabBar({ active }: { active: MemberTab }) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();

  return (
    <View pointerEvents="box-none" style={[styles.wrap, { paddingBottom: tabBarBottomPad(insets.bottom, height) }]}>
      <View style={styles.bar}>
        {TABS.map((tab) => {
          const isActive = active === tab.id;
          return (
            <Pressable
              key={tab.id}
              accessibilityRole="button"
              accessibilityLabel={tab.label}
              accessibilityState={{ selected: isActive }}
              onPress={() => { if (!isActive) router.replace(tab.route as Href); }}
              style={({ pressed }) => [styles.item, pressed && styles.pressed]}>
              <Text style={[styles.icon, { color: isActive ? Colors.green : Colors.surface }]}>{tab.icon}</Text>
              <Text style={[styles.label, { color: isActive ? Colors.green : Colors.iconMuted }]}>{tab.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: Spacing.five, right: Spacing.five, bottom: 0, alignItems: 'center', zIndex: 120, elevation: 120 },
  bar: {
    width: '100%', maxWidth: 420, backgroundColor: Colors.charcoal,
    borderRadius: 40, paddingHorizontal: Spacing.three, paddingVertical: 14,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  item: { flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: 40, gap: 3 },
  icon: { fontSize: 18 },
  label: { fontFamily: Fonts.medium, fontSize: 10, lineHeight: 14 },
  pressed: { opacity: 0.75 },
});
