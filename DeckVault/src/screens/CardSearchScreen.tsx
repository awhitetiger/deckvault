import { useState } from 'react';
import {
  View, Text, TextInput, FlatList,
  TouchableOpacity, StyleSheet, Image, ActivityIndicator
} from 'react-native';
import { cardService } from '../services/api';

export default function CardSearchScreen({ navigation, route }: any) {
  const [query, setQuery] = useState('');
  const [cards, setCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const search = async (text: string) => {
    setQuery(text);
    if (text.length < 2) {
      setCards([]);
      return;
    }
    setLoading(true);
    try {
      const data = await cardService.search(text);
      setCards(data.cards);
      setSearched(true);
    } catch {
      setCards([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Search cards... (e.g. Blue-Eyes)"
        placeholderTextColor="#555577"
        value={query}
        onChangeText={search}
        autoFocus
      />

      {loading && <ActivityIndicator color="#7c3aed" style={{ marginTop: 20 }} />}

      {!loading && searched && cards.length === 0 && (
        <Text style={styles.noResults}>No cards found for "{query}"</Text>
      )}

      <FlatList
        data={cards}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.cardRow}
            onPress={() => navigation.navigate('CardDetail', {
              card: item,
              binderId: route.params?.binderId,
            })}
          >
            {item.image_url ? (
              <Image source={{ uri: item.image_url }} style={styles.cardImage} />
            ) : (
              <View style={styles.cardImagePlaceholder} />
            )}
            <View style={styles.cardInfo}>
              <Text style={styles.cardName}>{item.name}</Text>
              <Text style={styles.cardType}>{item.card_type}</Text>
              <Text style={styles.cardPrice}>
                ${item.tcgplayer_price ? parseFloat(item.tcgplayer_price).toFixed(2) : '—'}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f1a', padding: 16 },
  searchInput: {
    backgroundColor: '#1a1a2e', color: '#fff', padding: 16,
    borderRadius: 12, fontSize: 16, borderWidth: 1,
    borderColor: '#2a2a4a', marginBottom: 16,
  },
  noResults: { color: '#888', textAlign: 'center', marginTop: 40, fontSize: 16 },
  cardRow: {
    flexDirection: 'row', backgroundColor: '#1a1a2e',
    borderRadius: 12, marginBottom: 10, overflow: 'hidden',
  },
  cardImage: { width: 60, height: 88 },
  cardImagePlaceholder: { width: 60, height: 88, backgroundColor: '#2a2a4a' },
  cardInfo: { flex: 1, padding: 12, justifyContent: 'center' },
  cardName: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
  cardType: { color: '#888', fontSize: 12, marginTop: 2 },
  cardPrice: { color: '#7c3aed', fontSize: 14, fontWeight: 'bold', marginTop: 4 },
});