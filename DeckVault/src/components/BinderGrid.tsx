import { View, Image, TouchableOpacity, Text, StyleSheet, Dimensions } from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SLOT_SIZE = (SCREEN_WIDTH - 48) / 3;

interface BinderCard {
  id: string;
  card_id: string;
  name: string;
  image_url: string;
  page_number: number;
  slot_position: number;
  condition: string;
  rarity?: string;
  set_code?: string;
  edition?: string;
  tcgplayer_price?: string;
}

interface Props {
  cards: BinderCard[];
  page: number;
  onCardPress: (card: BinderCard) => void;
}

const RARITY_COLORS: Record<string, string> = {
  'Common': '#888',
  'Rare': '#60a5fa',
  'Super Rare': '#34d399',
  'Ultra Rare': '#fbbf24',
  'Secret Rare': '#a78bfa',
  'Ultimate Rare': '#f97316',
  'Ghost Rare': '#e2e8f0',
  'Starlight Rare': '#f0abfc',
  "Collector's Rare": '#fb7185',
  'Prismatic Secret Rare': '#38bdf8',
  'Quarter Century Secret Rare': '#fde68a',
};

const EDITION_LABELS: Record<string, string> = {
  '1st Edition': '1st',
  'Unlimited': 'UNL',
  'Limited': 'LTD',
};

export default function BinderGrid({ cards, page, onCardPress }: Props) {
  const pageCards = cards.filter((c) => c.page_number === page);

  const slots = Array(9).fill(null);
  pageCards.forEach((card) => {
    if (card.slot_position >= 0 && card.slot_position < 9) {
      slots[card.slot_position] = card;
    }
  });

  return (
    <View style={styles.grid}>
      {slots.map((card, index) => (
        <TouchableOpacity
          key={index}
          style={styles.slot}
          onPress={() => card && onCardPress(card)}
          activeOpacity={card ? 0.7 : 1}
        >
          {card ? (
            <View style={styles.cardContainer}>
              {card.image_url ? (
                <Image
                  source={{ uri: card.image_url }}
                  style={styles.cardImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.cardPlaceholder}>
                  <Text style={styles.cardPlaceholderText}>{card.name}</Text>
                </View>
              )}

              {/* Top left — edition */}
              {card.edition && card.edition !== 'Unlimited' && (
                <View style={styles.editionBadge}>
                  <Text style={styles.editionText}>
                    {EDITION_LABELS[card.edition] || card.edition}
                  </Text>
                </View>
              )}

              {/* Bottom left — set code */}
              {card.set_code && (
                <View style={styles.setCodeBadge}>
                  <Text style={styles.setCodeText}>{card.set_code}</Text>
                </View>
              )}

              {/* Bottom right — condition + rarity dot */}
              <View style={styles.bottomRight}>
                {card.rarity && (
                  <View style={[
                    styles.rarityDot,
                    { backgroundColor: RARITY_COLORS[card.rarity] || '#888' }
                  ]} />
                )}
                <View style={styles.conditionBadge}>
                  <Text style={styles.conditionText}>{card.condition}</Text>
                </View>
              </View>
            </View>
          ) : (
            <View style={styles.emptySlot}>
              <Text style={styles.emptySlotText}>+</Text>
            </View>
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
    gap: 8,
  },
  slot: {
    width: SLOT_SIZE,
    height: SLOT_SIZE * 1.38,
  },
  cardContainer: {
    flex: 1,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#2a2a4a',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardPlaceholder: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
  },
  cardPlaceholderText: {
    color: '#888',
    fontSize: 8,
    textAlign: 'center',
  },
  editionBadge: {
    position: 'absolute',
    top: 4,
    left: 4,
    backgroundColor: 'rgba(250, 204, 21, 0.9)',
    paddingHorizontal: 3,
    paddingVertical: 1,
    borderRadius: 3,
  },
  editionText: {
    color: '#000',
    fontSize: 7,
    fontWeight: 'bold',
  },
  setCodeBadge: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 3,
    paddingVertical: 1,
    borderRadius: 3,
  },
  setCodeText: {
    color: '#ccc',
    fontSize: 7,
  },
  bottomRight: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  rarityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  conditionBadge: {
    backgroundColor: 'rgba(124, 58, 237, 0.85)',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  conditionText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: 'bold',
  },
  emptySlot: {
    flex: 1,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2a2a4a',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0f0f1a',
  },
  emptySlotText: {
    color: '#2a2a4a',
    fontSize: 24,
  },
});