import { StyleSheet, TouchableOpacity, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Colors } from '@/constants';

export function BackButton({ onPress, light = false }: { onPress: () => void; light?: boolean }) {
  const stroke = light ? Colors.charcoal : '#fff';
  const bg     = light ? 'rgba(0,0,0,0.06)'          : 'rgba(255,255,255,0.18)';
  const border = light ? 'rgba(0,0,0,0.12)'           : 'rgba(255,255,255,0.28)';
  return (
    <TouchableOpacity onPress={onPress} hitSlop={{ top: 10, left: 10, bottom: 10, right: 10 }}>
      <View style={[styles.pill, { backgroundColor: bg, borderColor: border }]}>
        <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
          <Path
            d="M15 18L9 12L15 6"
            stroke={stroke}
            strokeWidth={2.4}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
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
