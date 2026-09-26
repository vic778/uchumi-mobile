import { Tabs } from 'expo-router';
import Svg, { Path, Circle, Rect } from 'react-native-svg';

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
      <Path d="M2 21v-1a7 7 0 0 1 14 0v1"         stroke={color} strokeWidth={1.8} strokeLinecap="round" />
      <Path d="M22 21v-1a5 5 0 0 0-5-5"           stroke={color} strokeWidth={1.8} strokeLinecap="round" />
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
  { name: 'dashboard',       title: 'Tableau', Icon: DashIcon    },
  { name: 'members/index',   title: 'Membres', Icon: MembersIcon },
  { name: 'kyc/index',       title: 'KYC',     Icon: KycIcon     },
  { name: 'loans/index',     title: 'Prêts',   Icon: LoansIcon   },
  { name: 'profile/index',   title: 'Plus',    Icon: PlusIcon    },
];

export default function AdminTabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: ADMIN_DARK,
          borderTopWidth: 0,
          height: 62,
          paddingBottom: 8,
        },
        tabBarActiveTintColor:   ADMIN_AMBER,
        tabBarInactiveTintColor: ADMIN_MUTED,
        tabBarLabelStyle: { fontSize: 10, fontWeight: '600', marginTop: 2 },
      }}>
      {TABS.map(({ name, title, Icon }) => (
        <Tabs.Screen
          key={name}
          name={name}
          options={{
            title,
            tabBarIcon: ({ color }) => <Icon color={color as string} />,
          }}
        />
      ))}
    </Tabs>
  );
}
