import { useEffect, useRef, useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors, Fonts, Spacing } from '@/constants';
import { UchumiLogo } from './uchumi-logo';

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
        <UchumiLogo style={styles.logo} />

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
  root: { flex: 1, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', padding: Spacing.six },
  logo: { width: 280, height: 100, resizeMode: 'contain', marginBottom: Spacing.three, tintColor: Colors.white },
  retryBtn: { marginTop: Spacing.six, paddingHorizontal: Spacing.four, paddingVertical: Spacing.two + 2, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.35)', backgroundColor: 'rgba(255,255,255,0.12)' },
  retryText:{ fontFamily: Fonts.semiBold, fontSize: 15, color: Colors.white },
});
