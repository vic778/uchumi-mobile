import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Fonts, Spacing } from '@/constants';
import { getNotifications } from '@/services/member/account';
import type { Notification } from '@/types';

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getNotifications().then(setItems).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <View style={styles.root}>
      <View style={[styles.header, { paddingTop: insets.top + 14 }]}>
        <Text style={styles.headerTitle}>Notifications</Text>
      </View>

      <View style={styles.subHeader}>
        <Text style={styles.subLabel}>NOUVELLES NOTIFICATIONS</Text>
      </View>

      {loading ? <ActivityIndicator color={Colors.primary} style={{ marginTop: 60 }} /> : (
        <FlatList
          data={items}
          keyExtractor={(n) => String(n.id)}
          contentContainerStyle={{ paddingHorizontal: Spacing.four, paddingTop: Spacing.three, paddingBottom: Spacing.four }}
          ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: Colors.coolGray }} />}
          renderItem={({ item }) => (
            <View style={[styles.card, !item.read && styles.cardUnread]}>
              <View style={styles.cardIcon}>
                <Text style={{ fontFamily: Fonts.bold, fontSize: 16, color: Colors.primary }}>U</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.notifTitle}>{item.title}</Text>
                <Text style={styles.notifBody} numberOfLines={3}>{item.body}</Text>
                <Text style={styles.notifDate}>{new Date(item.created_at).toLocaleDateString('fr-CD', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</Text>
              </View>
              {!item.read && <View style={styles.unreadDot} />}
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
  root: { flex: 1, backgroundColor: Colors.background },
  header: { backgroundColor: Colors.primary, paddingHorizontal: Spacing.four, paddingBottom: Spacing.three },
  headerTitle: { fontFamily: Fonts.bold, fontSize: 18, color: Colors.white },
  subHeader: { paddingHorizontal: Spacing.four, paddingTop: Spacing.three, paddingBottom: Spacing.two, borderBottomWidth: 1, borderBottomColor: Colors.coolGray, backgroundColor: Colors.white },
  subLabel: { fontFamily: Fonts.bold, fontSize: 13, color: Colors.primary, letterSpacing: 0.8 },
  card: { backgroundColor: Colors.white, padding: Spacing.three, flexDirection: 'row', gap: Spacing.three, alignItems: 'flex-start' },
  cardUnread: {},
  cardIcon: { width: 42, height: 42, borderRadius: 10, backgroundColor: Colors.background, borderWidth: 1, borderColor: Colors.coolGray, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.danger, marginTop: 4, flexShrink: 0 },
  notifTitle: { fontFamily: Fonts.bold, fontSize: 14, color: Colors.charcoal, marginBottom: 3 },
  notifBody: { fontFamily: Fonts.regular, fontSize: 13, color: Colors.steelGray, marginBottom: 4, lineHeight: 19 },
  notifDate: { fontFamily: Fonts.regular, fontSize: 12, color: Colors.iconMuted },
  empty: { fontFamily: Fonts.regular, fontSize: 16, color: Colors.steelGray, textAlign: 'center', marginTop: 60 },
});
