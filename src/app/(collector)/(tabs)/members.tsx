import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import { Colors, Fonts, Spacing } from '@/constants';
import { getMembers, type CollectorMember } from '@/services/collector';

const CURRENCY = 'CDF';
const fmt = (n: number) => n.toLocaleString('fr-CD') + ' ' + CURRENCY;

function SearchIcon() {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Path d="M21 21L16.65 16.65M19 11C19 15.42 15.42 19 11 19C6.58 19 3 15.42 3 11C3 6.58 6.58 3 11 3C15.42 3 19 6.58 19 11Z"
        stroke={Colors.steelGray} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

export default function CollectorMembersScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [members, setMembers]     = useState<CollectorMember[]>([]);
  const [query, setQuery]         = useState('');
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try { setMembers(await getMembers()); } catch {}
  }, []);

  useEffect(() => { load().finally(() => setLoading(false)); }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  const filtered = query.trim()
    ? members.filter(m =>
        m.full_name.toLowerCase().includes(query.toLowerCase()) ||
        m.phone_number.includes(query.replace(/\s/g, ''))
      )
    : members;

  return (
    <View style={styles.root}>
      <View style={[styles.header, { paddingTop: insets.top + 14 }]}>
        <Text style={styles.headerTitle}>Membres</Text>
        <View style={styles.searchWrap}>
          <SearchIcon />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher par nom ou numéro..."
            placeholderTextColor={Colors.iconMuted}
            value={query}
            onChangeText={setQuery}
            autoCorrect={false}
          />
        </View>
      </View>

      {loading ? (
        <ActivityIndicator color={Colors.primary} style={{ marginTop: 60 }} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={m => String(m.id)}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              {query ? 'Aucun résultat pour cette recherche.' : 'Aucun membre enregistré.'}
            </Text>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.row}
              onPress={() => router.push(`/(collector)/members/${encodeURIComponent(item.phone_number)}` as any)}
              activeOpacity={0.7}>
              <View style={styles.initials}>
                <Text style={styles.initialsText}>{item.initials}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{item.full_name}</Text>
                <Text style={styles.phone}>{item.phone_number}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.balance}>{fmt(item.balance)}</Text>
                <Text style={styles.balanceLabel}>solde</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  header: { backgroundColor: Colors.primary, paddingHorizontal: Spacing.four, paddingBottom: Spacing.three, gap: Spacing.two },
  headerTitle: { fontFamily: Fonts.bold, fontSize: 20, color: Colors.white },
  searchWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white, borderRadius: 10, paddingHorizontal: Spacing.two, gap: Spacing.two },
  searchInput: { flex: 1, fontFamily: Fonts.regular, fontSize: 15, color: Colors.charcoal, paddingVertical: 10 },

  list: { paddingTop: 2, paddingBottom: Spacing.four, backgroundColor: Colors.white },
  separator: { height: 1, backgroundColor: Colors.coolGray, marginLeft: Spacing.four + 44 + Spacing.three },
  emptyText: { fontFamily: Fonts.regular, fontSize: 14, color: Colors.steelGray, textAlign: 'center', paddingVertical: Spacing.six },

  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three, paddingHorizontal: Spacing.four, paddingVertical: Spacing.two + 2 },
  initials: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#e8f4f8', alignItems: 'center', justifyContent: 'center' },
  initialsText: { fontFamily: Fonts.bold, fontSize: 16, color: Colors.primary },
  name: { fontFamily: Fonts.semiBold, fontSize: 15, color: Colors.charcoal },
  phone: { fontFamily: Fonts.regular, fontSize: 13, color: Colors.steelGray },
  balance: { fontFamily: Fonts.bold, fontSize: 13, color: Colors.charcoal },
  balanceLabel: { fontFamily: Fonts.regular, fontSize: 11, color: Colors.steelGray },
});
