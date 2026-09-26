import { createContext, ReactNode, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Keyboard, NativeSyntheticEvent, StyleProp, StyleSheet, TargetedEvent, View, ViewStyle, findNodeHandle } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Layout, Spacing, ctaBottomPad } from '@/constants';

type KeyboardScrollApi = { scrollToInput: (e: NativeSyntheticEvent<TargetedEvent>) => void; keyboardOpen: boolean };
const KeyboardScrollContext = createContext<KeyboardScrollApi | null>(null);
export function useKeyboardScroll() { return useContext(KeyboardScrollContext); }

export const ctaScreenContent: ViewStyle = { width: '100%', flexGrow: 1, justifyContent: 'space-between', gap: Spacing.five };

export function KeyboardScreen({
  children, contentContainerStyle, style, horizontalPadding = Spacing.five,
}: { children: ReactNode; contentContainerStyle?: StyleProp<ViewStyle>; style?: StyleProp<ViewStyle>; horizontalPadding?: number }) {
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<KeyboardAwareScrollView>(null);
  const [keyboardOpen, setKeyboardOpen] = useState(false);

  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', () => setKeyboardOpen(true));
    const hide = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardOpen(false);
      scrollRef.current?.scrollToPosition(0, 0, true);
    });
    return () => { show.remove(); hide.remove(); };
  }, []);

  const scrollToInput = useCallback((e: NativeSyntheticEvent<TargetedEvent>) => {
    const node = findNodeHandle(e.target as unknown as number);
    if (!node || !scrollRef.current) return;
    requestAnimationFrame(() => scrollRef.current?.scrollToFocusedInput(node, 160, 80));
  }, []);

  return (
    <KeyboardScrollContext.Provider value={{ scrollToInput, keyboardOpen }}>
      <KeyboardAwareScrollView
        ref={scrollRef}
        style={[styles.root, style]}
        contentContainerStyle={[styles.content, { paddingTop: insets.top, paddingHorizontal: horizontalPadding }]}
        enableOnAndroid enableAutomaticScroll enableResetScrollToCoords
        resetScrollToCoords={{ x: 0, y: 0 }}
        keyboardShouldPersistTaps="handled" keyboardOpeningTime={0}
        extraHeight={Layout.keyboardExtraHeight} extraScrollHeight={100}
        showsVerticalScrollIndicator={false} bounces>
        <View style={[styles.inner, contentContainerStyle]}>{children}</View>
        <View style={{ height: ctaBottomPad(insets.bottom) }} />
        <View style={{ height: keyboardOpen ? Layout.keyboardSpacer : 0 }} />
      </KeyboardAwareScrollView>
    </KeyboardScrollContext.Provider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.surface },
  content: { flexGrow: 1 },
  inner: { flexGrow: 1, width: '100%' },
});
