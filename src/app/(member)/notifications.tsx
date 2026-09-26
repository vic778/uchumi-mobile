import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Fonts, Spacing } from '@/constants';
import { getNotifications } from '@/services/member/account';
import type { Notification } from '@/types';

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getNotifications().then(setItems).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: Colors.surface }}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.three }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Notifications</Text>
      </View>

      {loading ? <ActivityIndicator color={Colors.charcoal} style={{ marginTop: 40 }} /> : (
        <FlatList
          data={items}
          keyExtractor={(n) => String(n.id)}
          contentContainerStyle={{ paddingHorizontal: Spacing.four, paddingBottom: Spacing.six }}
          renderItem={({ item }) => (
            <View style={[styles.card, !item.read && styles.cardUnread]}>
              {!item.read && <View style={styles.unreadDot} />}
              <View style={{ flex: 1 }}>
                <Text style={styles.notifTitle}>{item.title}</Text>
                <Text style={styles.notifBody}>{item.body}</Text>
                <Text style={styles.notifDate}>{new Date(item.created_at).toLocaleDateString('fr-CD', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</Text>
              </View>
            </View>
          )}
          ListEmptyComponent={<Text style={styles.empty}>Aucune notification</Text>}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: Spacing.four, paddingBottom: Spacing.three, flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  backBtn: { padding: Spacing.one },
  backIcon: { fontSize: 22, color: Colors.charcoal },
  title: { fontFamily: Fonts.bold, fontSize: 24, color: Colors.charcoal },
  card: { backgroundColor: Colors.white, borderRadius: 16, padding: Spacing.three, marginBottom: Spacing.two, flexDirection: 'row', gap: Spacing.two },
  cardUnread: { borderLeftWidth: 3, borderLeftColor: Colors.green },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.green, marginTop: 5 },
  notifTitle: { fontFamily: Fonts.bold, fontSize: 14, color: Colors.charcoal, marginBottom: 2 },
  notifBody: { fontFamily: Fonts.regular, fontSize: 13, color: Colors.steelGray, marginBottom: 4 },
  notifDate: { fontFamily: Fonts.regular, fontSize: 11, color: Colors.iconMuted },
  empty: { fontFamily: Fonts.regular, fontSize: 14, color: Colors.steelGray, textAlign: 'center', marginTop: 40 },
});
