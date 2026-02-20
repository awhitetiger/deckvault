import { useState } from 'react';
import {
  View, Text, Image, StyleSheet, ScrollView,
  TouchableOpacity, Alert, Modal, TextInput
} from 'react-native';
import { binderService } from '../services/api';

const CONDITIONS = ['NM', 'LP', 'MP', 'HP', 'DMG'];
const EDITIONS = ['Unlimited', '1st Edition', 'Limited'];
const RARITIES = [
  'Common',
  'Rare',
  'Super Rare',
  'Ultra Rare',
  'Secret Rare',
  'Ultimate Rare',
  'Ghost Rare',
  'Starlight Rare',
  "Collector's Rare",
  'Prismatic Secret Rare',
  'Quarter Century Secret Rare',
  'Short Print',
  'Super Short Print',
];

export default function CardDetailScreen({ route, navigation }: any) {
  const { card, binderId } = route.params;
  const [modalVisible, setModalVisible] = useState(false);
  const [condition, setCondition] = useState('NM');
  const [rarity, setRarity] = useState('Common');
  const [setCode, setSetCode] = useState('');
  const [edition, setEdition] = useState('Unlimited');
  const [quantity, setQuantity] = useState('1');
  const [acquisitionPrice, setAcquisitionPrice] = useState('');
  const [adding, setAdding] = useState(false);

  const addToBinder = async () => {
    if (!binderId) {
      Alert.alert('No Binder', 'Please open a binder first before adding cards.');
      return;
    }
    setAdding(true);
    try {
      await binderService.addCardToBinder(
        binderId,
        card.id,
        condition,
        parseInt(quantity) || 1,
        acquisitionPrice ? parseFloat(acquisitionPrice) : undefined,
        rarity,
        setCode.trim() || undefined,
        edition,
      );
      Alert.alert('Added!', `${card.name} added to binder.`, [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
      setModalVisible(false);
    } catch {
      Alert.alert('Error', 'Failed to add card');
    } finally {
      setAdding(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.imageContainer}>
        {card.image_url ? (
          <Image source={{ uri: card.image_url }} style={styles.cardImage} resizeMode="contain" />
        ) : (
          <View style={styles.imagePlaceholder} />
        )}
      </View>

      <View style={styles.info}>
        <Text style={styles.cardName}>{card.name}</Text>
        <Text style={styles.cardType}>{card.card_type}</Text>

        <View style={styles.priceRow}>
          <View style={styles.priceBox}>
            <Text style={styles.priceLabel}>TCGPlayer</Text>
            <Text style={styles.priceValue}>
              ${card.tcgplayer_price ? parseFloat(card.tcgplayer_price).toFixed(2) : '—'}
            </Text>
          </View>
          <View style={styles.priceBox}>
            <Text style={styles.priceLabel}>CardMarket</Text>
            <Text style={styles.priceValue}>
              €{card.card_market_price ? parseFloat(card.card_market_price).toFixed(2) : '—'}
            </Text>
          </View>
        </View>

        {card.attack !== null && (
          <View style={styles.statsRow}>
            <Text style={styles.stat}>ATK: {card.attack}</Text>
            <Text style={styles.stat}>DEF: {card.defense}</Text>
          </View>
        )}

        <Text style={styles.description}>{card.description}</Text>

        <View style={styles.buttonRow}>
          {binderId && (
            <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
              <Text style={styles.addButtonText}>Add to Binder</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <ScrollView>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Add to Binder</Text>

              <Text style={styles.modalLabel}>Condition</Text>
              <View style={styles.conditionRow}>
                {CONDITIONS.map((c) => (
                  <TouchableOpacity
                    key={c}
                    style={[styles.conditionBtn, condition === c && styles.conditionBtnActive]}
                    onPress={() => setCondition(c)}
                  >
                    <Text style={[styles.conditionText, condition === c && styles.conditionTextActive]}>
                      {c}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.modalLabel}>Edition</Text>
              <View style={styles.editionRow}>
                {EDITIONS.map((e) => (
                  <TouchableOpacity
                    key={e}
                    style={[styles.editionBtn, edition === e && styles.editionBtnActive]}
                    onPress={() => setEdition(e)}
                  >
                    <Text style={[styles.editionText, edition === e && styles.editionTextActive]}>
                      {e}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.modalLabel}>Rarity</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.rarityScroll}
              >
                {RARITIES.map((r) => (
                  <TouchableOpacity
                    key={r}
                    style={[styles.rarityBtn, rarity === r && styles.rarityBtnActive]}
                    onPress={() => setRarity(r)}
                  >
                    <Text style={[styles.rarityText, rarity === r && styles.rarityTextActive]}>
                      {r}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={styles.modalLabel}>Set Code (e.g. LOB-001)</Text>
              <TextInput
                style={styles.modalInput}
                value={setCode}
                onChangeText={setSetCode}
                placeholder="LOB-001"
                placeholderTextColor="#555577"
                autoCapitalize="characters"
              />

              <Text style={styles.modalLabel}>Quantity</Text>
              <TextInput
                style={styles.modalInput}
                value={quantity}
                onChangeText={setQuantity}
                keyboardType="number-pad"
                placeholderTextColor="#555577"
              />

              <Text style={styles.modalLabel}>Purchase Price (optional)</Text>
              <TextInput
                style={styles.modalInput}
                value={acquisitionPrice}
                onChangeText={setAcquisitionPrice}
                keyboardType="decimal-pad"
                placeholder="0.00"
                placeholderTextColor="#555577"
              />

              <TouchableOpacity style={styles.confirmButton} onPress={addToBinder} disabled={adding}>
                <Text style={styles.confirmButtonText}>{adding ? 'Adding...' : 'Confirm'}</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.cancelButton}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f1a' },
  imageContainer: { alignItems: 'center', padding: 24, backgroundColor: '#1a1a2e' },
  cardImage: { width: 220, height: 320 },
  imagePlaceholder: { width: 220, height: 320, backgroundColor: '#2a2a4a', borderRadius: 12 },
  info: { padding: 20 },
  cardName: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  cardType: { color: '#888', fontSize: 14, marginTop: 4 },
  priceRow: { flexDirection: 'row', gap: 12, marginTop: 20 },
  priceBox: { flex: 1, backgroundColor: '#1a1a2e', padding: 16, borderRadius: 12, alignItems: 'center' },
  priceLabel: { color: '#888', fontSize: 12 },
  priceValue: { color: '#7c3aed', fontSize: 20, fontWeight: 'bold', marginTop: 4 },
  statsRow: { flexDirection: 'row', gap: 20, marginTop: 16 },
  stat: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  description: { color: '#aaa', fontSize: 14, lineHeight: 20, marginTop: 16 },
  buttonRow: { flexDirection: 'row', gap: 12, marginTop: 24 },
  addButton: {
    flex: 1, backgroundColor: '#7c3aed', padding: 16,
    borderRadius: 12, alignItems: 'center',
  },
  addButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  backButton: {
    backgroundColor: '#1a1a2e', padding: 16,
    borderRadius: 12, alignItems: 'center', paddingHorizontal: 20,
  },
  backButtonText: { color: '#fff', fontSize: 16 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalContent: {
    backgroundColor: '#1a1a2e', padding: 24,
    borderTopLeftRadius: 20, borderTopRightRadius: 20,
    paddingBottom: 40,
  },
  modalTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  modalLabel: { color: '#888', fontSize: 13, marginBottom: 8 },
  conditionRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  conditionBtn: { flex: 1, padding: 10, borderRadius: 8, backgroundColor: '#0f0f1a', alignItems: 'center' },
  conditionBtnActive: { backgroundColor: '#7c3aed' },
  conditionText: { color: '#888', fontWeight: 'bold', fontSize: 12 },
  conditionTextActive: { color: '#fff' },
  editionRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  editionBtn: {
    flex: 1, padding: 10, borderRadius: 8,
    backgroundColor: '#0f0f1a', alignItems: 'center',
    borderWidth: 1, borderColor: '#2a2a4a',
  },
  editionBtnActive: { backgroundColor: '#7c3aed', borderColor: '#7c3aed' },
  editionText: { color: '#888', fontWeight: 'bold', fontSize: 11 },
  editionTextActive: { color: '#fff' },
  rarityScroll: { marginBottom: 20 },
  rarityBtn: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8,
    backgroundColor: '#0f0f1a', marginRight: 8,
    borderWidth: 1, borderColor: '#2a2a4a',
  },
  rarityBtnActive: { backgroundColor: '#7c3aed', borderColor: '#7c3aed' },
  rarityText: { color: '#888', fontSize: 13 },
  rarityTextActive: { color: '#fff' },
  modalInput: {
    backgroundColor: '#0f0f1a', color: '#fff', padding: 14,
    borderRadius: 10, marginBottom: 20, fontSize: 16,
    borderWidth: 1, borderColor: '#2a2a4a',
  },
  confirmButton: {
    backgroundColor: '#7c3aed', padding: 16,
    borderRadius: 12, alignItems: 'center', marginBottom: 12,
  },
  confirmButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  cancelButton: { alignItems: 'center', padding: 12 },
  cancelText: { color: '#888', fontSize: 15 },
});