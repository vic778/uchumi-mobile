import { useEffect, useRef, useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { Colors, Fonts, Spacing } from '@/constants';

function LockIcon() {
  return (
    <Svg width={56} height={56} viewBox="0 0 24 24" fill="none">
      <Rect x={3} y={11} width={18} height={11} rx={2} stroke="rgba(255,255,255,0.9)" strokeWidth={1.8} />
      <Path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="rgba(255,255,255,0.9)" strokeWidth={1.8} strokeLinecap="round" />
      <Circle cx={12} cy={16} r={1.5} fill="rgba(255,255,255,0.9)" />
    </Svg>
  );
}

type Props = {
  visible: boolean;
  onUnlock: () => Promise<boolean>;
};

export function AppLockScreen({ visible, onUnlock }: Props) {
  const [dismissed, setDismissed] = useState(false);
  const firing = useRef(false);

  const trigger = async () => {
    if (firing.current) return;
    firing.current = true;
    setDismissed(false);
    const ok = await onUnlock();
    firing.current = false;
    if (!ok) setDismissed(true);
  };

  useEffect(() => {
    if (!visible) { setDismissed(false); return; }
    // Small delay so the modal finishes its fade-in before the system prompt appears
    const t = setTimeout(trigger, 200);
    return () => clearTimeout(t);
  }, [visible]);

  return (
    <Modal visible={visible} animationType="fade" statusBarTranslucent hardwareAccelerated>
      <View style={styles.root}>
        <View style={styles.iconWrap}>
          <LockIcon />
        </View>
        <Text style={styles.appName}>Uchumi</Text>

        {dismissed && (
          <TouchableOpacity style={styles.retryBtn} onPress={trigger} activeOpacity={0.8}>
            <Text style={styles.retryText}>Réessayer</Text>
          </TouchableOpacity>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root:     { flex: 1, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', padding: Spacing.six },
  iconWrap: { width: 90, height: 90, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.three },
  appName:  { fontFamily: Fonts.bold, fontSize: 30, color: Colors.white },
  retryBtn: { marginTop: Spacing.six, paddingHorizontal: Spacing.four, paddingVertical: Spacing.two + 2, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.35)', backgroundColor: 'rgba(255,255,255,0.12)' },
  retryText:{ fontFamily: Fonts.semiBold, fontSize: 15, color: Colors.white },
});
