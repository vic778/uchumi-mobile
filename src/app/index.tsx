import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants';
import { useAuth } from '@/hooks/use-auth';

export default function AuthGate() {
  const { state } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (state.status === 'loading') return;

    if (state.status === 'unauthenticated') {
      router.replace('/(auth)/login');
      return;
    }

    const { role } = state.user;
    if (role === 'member')         router.replace('/(member)/dashboard');
    else if (role === 'collector') router.replace('/(collector)/dashboard' as any);
    else                           router.replace('/(auth)/login');
  }, [state.status]);

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.surface }}>
      <ActivityIndicator color={Colors.charcoal} />
    </View>
  );
}
