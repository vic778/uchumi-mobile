import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Redirect } from 'expo-router';
import { Colors } from '@/constants';
import { useAuth } from '@/hooks/use-auth';

export default function AuthGate() {
  const { state } = useAuth();

  if (state.status === 'loading') {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.surface }}>
        <ActivityIndicator color={Colors.charcoal} />
      </View>
    );
  }

  if (state.status === 'unauthenticated') {
    return <Redirect href="/(auth)/login" />;
  }

  const { role } = state.user;
  if (role === 'member')    return <Redirect href="/(member)/dashboard" />;
  if (role === 'collector') return <Redirect href={"/(collector)/dashboard" as any} />;
  // admin — placeholder until Phase 5
  return <Redirect href="/(auth)/login" />;
}
