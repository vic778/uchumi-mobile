import { Stack } from 'expo-router';
import { Colors } from '@/constants';

export default function MemberLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: Colors.surface } }} />
  );
}
