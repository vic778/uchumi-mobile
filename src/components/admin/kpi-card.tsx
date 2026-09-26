import { StyleSheet, Text, View } from 'react-native';
import { Users, PiggyBank, Banknote, Clock } from 'lucide-react-native';
import { Colors, Fonts, Spacing } from '@/constants';

export function UsersIcon({ color }: { color: string }) {
  return <Users size={18} color={color} strokeWidth={1.8} />;
}
export function PiggyIcon({ color }: { color: string }) {
  return <PiggyBank size={18} color={color} strokeWidth={1.8} />;
}
export function CreditIcon({ color }: { color: string }) {
  return <Banknote size={18} color={color} strokeWidth={1.8} />;
}
export function ClockIcon({ color }: { color: string }) {
  return <Clock size={18} color={color} strokeWidth={1.8} />;
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
