import { StyleSheet, Text, View } from 'react-native';
import { Colors, Fonts } from '@/constants';

type Status = 'pending' | 'approved' | 'rejected' | 'active' | 'paid' | string;

const config: Record<string, { bg: string; text: string; label: string }> = {
  pending:  { bg: '#FEF3C7', text: '#92400E', label: 'En attente' },
  approved: { bg: '#DCFCE7', text: '#14532D', label: 'Approuvé' },
  active:   { bg: '#DBEAFE', text: '#1E3A8A', label: 'Actif' },
  rejected: { bg: '#FEE2E2', text: '#7F1D1D', label: 'Rejeté' },
  paid:     { bg: '#F0FDF4', text: '#14532D', label: 'Remboursé' },
};

export function StatusBadge({ status }: { status: Status }) {
  const c = config[status] ?? { bg: Colors.coolGray, text: Colors.steelGray, label: status };
  return (
    <View style={[styles.badge, { backgroundColor: c.bg }]}>
      <Text style={[styles.label, { color: c.text }]}>{c.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 100 },
  label: { fontFamily: Fonts.semiBold, fontSize: 14, lineHeight: 16 },
});
