import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator, Alert, FlatList, KeyboardAvoidingView,
  Platform, StyleSheet, Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Search, X } from 'lucide-react-native';
import { BackButton } from '@/components/ui/back-button';
import { AuthPrimaryButton } from '@/components/auth/shell';
import { Colors, Fonts, Spacing } from '@/constants';
import { getAccount } from '@/services/member/account';
import { requestWithdrawal } from '@/services/member/withdrawals';
import { searchCollectors, type CollectorResult } from '@/services/member/collectors';

export default function NewWithdrawalScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [balance, setBalance]     = useState<number | null>(null);
  const [collector, setCollector] = useState<CollectorResult | null>(null);
  const [query, setQuery]         = useState('');
  const [results, setResults]     = useState<CollectorResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [amount, setAmount]       = useState('');
  const [loading, setLoading]     = useState(false);

  useEffect(() => {
    getAccount().then((a) => setBalance(a.balance)).catch(() => {});
  }, []);

  const handleQuery = (text: string) => {
    setQuery(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (text.trim().length < 2) { setResults([]); return; }
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const found = await searchCollectors(text.trim());
        setResults(found);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);
  };

  const numericValue = parseInt(amount.replace(/\s/g, ''), 10);
  const formatted = !isNaN(numericValue) ? numericValue.toLocaleString('fr-CD') + ' CDF' : '0 CDF';

  const handleSubmit = async () => {
    if (!collector) return;
    if (!numericValue || numericValue < 500) {
      Alert.alert('Montant invalide', 'Le montant minimum est de 500 CDF');
      return;
    }
    setLoading(true);
    try {
      await requestWithdrawal({ amount: numericValue, collector_phone: collector.phone_number });
      Alert.alert('Demande envoyée', 'Votre demande de retrait a été soumise.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (e: any) {
      Alert.alert('Erreur', e.message);
    } finally {
      setLoading(false);
    }
  };

  const initials = (name: string) =>
    name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();

  return (
    <View style={styles.root}>
      <View style={[styles.header, { paddingTop: insets.top + 14 }]}>
        <BackButton onPress={() => router.back()} />
        <Text style={styles.headerTitle}>Nouveau retrait</Text>
        <View style={{ width: 38 }} />
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>

        {!collector ? (
          /* Step 1: search for collector */
          <View style={styles.searchStep}>
            <Text style={styles.stepTitle}>Choisissez un collecteur</Text>
            <Text style={styles.stepSub}>Recherchez par nom ou numéro de téléphone</Text>

            <View style={styles.searchBox}>
              <Search size={18} color={Colors.steelGray} strokeWidth={1.8} />
              <TextInput
                style={styles.searchInput}
                placeholder="Nom ou téléphone..."
                placeholderTextColor={Colors.iconMuted}
                value={query}
                onChangeText={handleQuery}
                autoFocus
              />
              {query.length > 0 && (
                <TouchableOpacity onPress={() => { setQuery(''); setResults([]); }}>
                  <X size={16} color={Colors.steelGray} />
                </TouchableOpacity>
              )}
            </View>

            {searching && <ActivityIndicator color={Colors.primary} style={{ marginTop: Spacing.three }} />}

            <FlatList
              data={results}
              keyExtractor={(c) => String(c.id)}
              style={styles.resultList}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.resultItem}
                  onPress={() => { setCollector(item); setResults([]); }}
                  activeOpacity={0.7}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{initials(item.full_name)}</Text>
                  </View>
                  <View>
                    <Text style={styles.resultName}>{item.full_name}</Text>
                    <Text style={styles.resultPhone}>{item.phone_number}</Text>
                  </View>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                query.length >= 2 && !searching ? (
                  <Text style={styles.noResults}>Aucun collecteur trouvé</Text>
                ) : null
              }
            />
          </View>
        ) : (
          /* Step 2: enter amount */
          <View style={styles.amountStep}>
            {/* Selected collector card */}
            <View style={styles.collectorCard}>
              <View style={styles.collectorCardLeft}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{initials(collector.full_name)}</Text>
                </View>
                <View>
                  <Text style={styles.collectorName}>{collector.full_name}</Text>
                  <Text style={styles.collectorPhone}>{collector.phone_number}</Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => setCollector(null)} style={styles.changeBtn}>
                <Text style={styles.changeBtnText}>Changer</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.balanceChip}>
              <Text style={styles.balanceLabel}>Montant disponible</Text>
              <Text style={styles.balanceValue}>
                {balance !== null ? balance.toLocaleString('fr-CD') + ' CDF' : '—'}
              </Text>
            </View>

            <Text style={styles.amountLabel}>Montant à retirer</Text>
            <Text style={styles.amountDisplay}>{formatted}</Text>

            <View style={styles.inputWrap}>
              <TextInput
                style={styles.input}
                placeholder="Ex: 10 000"
                placeholderTextColor={Colors.iconMuted}
                keyboardType="numeric"
                value={amount}
                onChangeText={setAmount}
                autoFocus
              />
            </View>
          </View>
        )}

        {collector && (
          <View style={[styles.bottom, { paddingBottom: Math.max(insets.bottom, Spacing.five) }]}>
            <AuthPrimaryButton
              label="Soumettre la demande"
              onPress={handleSubmit}
              loading={loading}
              disabled={!amount || isNaN(numericValue) || numericValue < 500}
            />
          </View>
        )}

      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },

  header: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.three,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: { fontFamily: Fonts.bold, fontSize: 18, color: Colors.white, flex: 1, textAlign: 'center' },

  /* Step 1 */
  searchStep: { flex: 1, paddingHorizontal: Spacing.four, paddingTop: Spacing.five },
  stepTitle: { fontFamily: Fonts.bold, fontSize: 20, color: Colors.charcoal, marginBottom: Spacing.one },
  stepSub:   { fontFamily: Fonts.regular, fontSize: 14, color: Colors.steelGray, marginBottom: Spacing.three },

  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    backgroundColor: Colors.white,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.coolGray,
    paddingHorizontal: Spacing.three,
    paddingVertical: 12,
    marginBottom: Spacing.two,
  },
  searchInput: { flex: 1, fontFamily: Fonts.regular, fontSize: 16, color: Colors.charcoal, padding: 0 },

  resultList: { flex: 1 },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    backgroundColor: Colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.coolGray,
    padding: Spacing.three,
    marginBottom: Spacing.two,
  },
  resultName:  { fontFamily: Fonts.semiBold, fontSize: 15, color: Colors.charcoal },
  resultPhone: { fontFamily: Fonts.regular, fontSize: 13, color: Colors.steelGray, marginTop: 1 },
  noResults:   { fontFamily: Fonts.regular, fontSize: 14, color: Colors.iconMuted, textAlign: 'center', marginTop: Spacing.four },

  avatar: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontFamily: Fonts.bold, fontSize: 14, color: Colors.white },

  /* Step 2 */
  amountStep: { flex: 1, paddingHorizontal: Spacing.four, paddingTop: Spacing.four, alignItems: 'center', gap: Spacing.three },

  collectorCard: {
    width: '100%',
    backgroundColor: Colors.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.coolGray,
    padding: Spacing.three,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  collectorCardLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  collectorName:  { fontFamily: Fonts.semiBold, fontSize: 15, color: Colors.charcoal },
  collectorPhone: { fontFamily: Fonts.regular, fontSize: 13, color: Colors.steelGray, marginTop: 1 },
  changeBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: '#e8f4f8' },
  changeBtnText: { fontFamily: Fonts.semiBold, fontSize: 13, color: Colors.primary },

  balanceChip: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.coolGray,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    alignItems: 'center',
  },
  balanceLabel: { fontFamily: Fonts.regular, fontSize: 13, color: Colors.steelGray, marginBottom: 2 },
  balanceValue: { fontFamily: Fonts.bold, fontSize: 18, color: Colors.primary },

  amountLabel:   { fontFamily: Fonts.medium, fontSize: 15, color: Colors.steelGray },
  amountDisplay: { fontFamily: Fonts.bold, fontSize: 36, color: Colors.charcoal, letterSpacing: 0.5 },

  inputWrap: {
    width: '100%',
    backgroundColor: Colors.white,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.coolGray,
    paddingHorizontal: Spacing.four,
    paddingVertical: 14,
  },
  input: {
    fontFamily: Fonts.semiBold,
    fontSize: 18,
    color: Colors.charcoal,
    textAlign: 'center',
    padding: 0,
  },

  bottom: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
  },
});
