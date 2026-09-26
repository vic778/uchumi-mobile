import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { Colors, Fonts, Spacing } from '@/constants';

function LockIcon() {
  return (
    <Svg width={64} height={64} viewBox="0 0 24 24" fill="none">
      <Rect x={3} y={11} width={18} height={11} rx={2} stroke="rgba(255,255,255,0.9)" strokeWidth={1.8} />
      <Path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="rgba(255,255,255,0.9)" strokeWidth={1.8} strokeLinecap="round" />
      <Circle cx={12} cy={16} r={1.5} fill="rgba(255,255,255,0.9)" />
    </Svg>
  );
}

function FingerprintIcon() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path d="M12 2C8.5 2 5.5 4 4 7" stroke={Colors.white} strokeWidth={1.8} strokeLinecap="round" />
      <Path d="M2 12c0-1 .2-2.1.5-3" stroke={Colors.white} strokeWidth={1.8} strokeLinecap="round" />
      <Path d="M20 9c.5 1 .8 2 .8 3" stroke={Colors.white} strokeWidth={1.8} strokeLinecap="round" />
      <Path d="M16.5 4.5C15.2 3.5 13.7 3 12 3" stroke={Colors.white} strokeWidth={1.8} strokeLinecap="round" />
      <Path d="M12 8a4 4 0 0 1 4 4c0 4-1 6-4 8" stroke={Colors.white} strokeWidth={1.8} strokeLinecap="round" />
      <Path d="M12 8a4 4 0 0 0-4 4c0 2 .3 4 1 5.5" stroke={Colors.white} strokeWidth={1.8} strokeLinecap="round" />
      <Path d="M12 12v2" stroke={Colors.white} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}

type Props = {
  visible: boolean;
  onUnlock: () => void;
};

export function AppLockScreen({ visible, onUnlock }: Props) {
  return (
    <Modal visible={visible} animationType="fade" statusBarTranslucent hardwareAccelerated>
      <View style={styles.root}>
        <View style={styles.iconWrap}>
          <LockIcon />
        </View>
        <Text style={styles.appName}>Uchumi</Text>
        <Text style={styles.subtitle}>Application verrouillée</Text>

        <TouchableOpacity style={styles.btn} onPress={onUnlock} activeOpacity={0.85}>
          <FingerprintIcon />
          <Text style={styles.btnText}>Déverrouiller</Text>
        </TouchableOpacity>

        <Text style={styles.hint}>
          Utilisez l'empreinte, Face ID ou le code PIN de votre appareil
        </Text>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root:    { flex: 1, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', padding: Spacing.six },
  iconWrap:{ width: 100, height: 100, borderRadius: 28, backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.four },
  appName: { fontFamily: Fonts.bold, fontSize: 32, color: Colors.white, marginBottom: Spacing.one },
  subtitle:{ fontFamily: Fonts.regular, fontSize: 16, color: 'rgba(255,255,255,0.7)', marginBottom: Spacing.six },
  btn:     { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: 16, paddingHorizontal: Spacing.five, paddingVertical: Spacing.three, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
  btnText: { fontFamily: Fonts.bold, fontSize: 17, color: Colors.white },
  hint:    { fontFamily: Fonts.regular, fontSize: 12, color: 'rgba(255,255,255,0.5)', textAlign: 'center', marginTop: Spacing.four, lineHeight: 18 },
});
