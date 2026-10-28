import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { Colors } from '@/constants';

export function BackButton({ onPress, light = false }: { onPress: () => void; light?: boolean }) {
  const color  = light ? Colors.charcoal : '#fff';
  const bg     = light ? 'rgba(0,0,0,0.06)'  : 'rgba(255,255,255,0.18)';
  const border = light ? 'rgba(0,0,0,0.12)'  : 'rgba(255,255,255,0.28)';
  return (
    <TouchableOpacity onPress={onPress} hitSlop={{ top: 10, left: 10, bottom: 10, right: 10 }}>
      <View style={[styles.pill, { backgroundColor: bg, borderColor: border }]}>
        <ChevronLeft size={18} color={color} strokeWidth={2.4} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  pill: {
    width: 38,
    height: 38,
    borderRadius: 11,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
