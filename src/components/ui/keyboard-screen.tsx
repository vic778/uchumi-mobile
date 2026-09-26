import { createContext, ReactNode, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Keyboard, KeyboardAvoidingView, NativeSyntheticEvent, Platform, ScrollView, StyleProp, StyleSheet, TargetedEvent, View, ViewStyle } from 'react-native';
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
  const scrollRef = useRef<ScrollView>(null);
  const [keyboardOpen, setKeyboardOpen] = useState(false);

  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', () => setKeyboardOpen(true));
    const hide = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardOpen(false);
      scrollRef.current?.scrollTo({ x: 0, y: 0, animated: true });
    });
    return () => { show.remove(); hide.remove(); };
  }, []);

  // KeyboardAvoidingView handles scroll-to-input automatically on iOS
  const scrollToInput = useCallback((_e: NativeSyntheticEvent<TargetedEvent>) => {}, []);

  return (
    <KeyboardScrollContext.Provider value={{ scrollToInput, keyboardOpen }}>
      <KeyboardAvoidingView
        style={[styles.root, style]}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={insets.top}>
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={[styles.content, { paddingTop: insets.top, paddingHorizontal: horizontalPadding }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces>
          <View style={[styles.inner, contentContainerStyle]}>{children}</View>
          <View style={{ height: ctaBottomPad(insets.bottom) }} />
          <View style={{ height: keyboardOpen ? Layout.keyboardSpacer : 0 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </KeyboardScrollContext.Provider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.surface },
  content: { flexGrow: 1 },
  inner: { flexGrow: 1, width: '100%' },
});
