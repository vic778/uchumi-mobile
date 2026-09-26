import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { Colors, Fonts, Spacing } from '@/constants';

export function UsersIcon({ color }: { color: string }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Circle cx={9} cy={7} r={4} stroke={color} strokeWidth={1.8} />
      <Circle cx={17} cy={9} r={3} stroke={color} strokeWidth={1.8} />
      <Path d="M2 21v-1a7 7 0 0 1 14 0v1" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
      <Path d="M22 21v-1a5 5 0 0 0-5-5"   stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}

export function PiggyIcon({ color }: { color: string }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path d="M19 11V9a7 7 0 0 0-14 0v2a7 7 0 0 0 14 0ZM12 16v5M8 21h8" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function CreditIcon({ color }: { color: string }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}

export function ClockIcon({ color }: { color: string }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={9} stroke={color} strokeWidth={1.8} />
      <Path d="M12 7v5l3 3" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

type Props = {
  label: string;
  value: string;
  sub?: string;
  iconBg: string;
  Icon: React.FC<{ color: string }>;
};

export function KpiCard({ label, value, sub, iconBg, Icon }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.top}>
        <Text style={styles.label}>{label}</Text>
        <View style={[styles.iconWrap, { backgroundColor: iconBg }]}>
          <Icon color={iconBg} />
        </View>
      </View>
      <Text style={styles.value}>{value}</Text>
      {sub && <Text style={styles.sub}>{sub}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  card:    { flex: 1, minWidth: '46%', backgroundColor: Colors.white, borderRadius: 14, padding: Spacing.three, borderWidth: 1, borderColor: Colors.coolGray },
  top:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.two },
  label:   { fontFamily: Fonts.bold, fontSize: 10, color: Colors.steelGray, letterSpacing: 0.8 },
  iconWrap:{ width: 34, height: 34, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  value:   { fontFamily: Fonts.bold, fontSize: 22, color: Colors.charcoal },
  sub:     { fontFamily: Fonts.regular, fontSize: 11, color: Colors.steelGray, marginTop: 2 },
});
