import axios from 'axios';
import { Pool } from 'pg';

const YGOPRODECK_URL = 'https://db.ygoprodeck.com/api/v7/cardinfo.php';

interface YGOCard {
  id: number;
  name: string;
  type: string;
  attribute?: string;
  race?: string;
  atk?: number;
  def?: number;
  desc: string;
  card_images: { image_url: string }[];
  card_prices: {
    tcgplayer_price: string;
    cardmarket_price: string;
  }[];
}

export async function syncCards(db: Pool) {
  console.log('Starting card sync...');

  try {
    const response = await axios.get<{ data: YGOCard[] }>(YGOPRODECK_URL);
    const cards: YGOCard[] = response.data.data;

    console.log(`Fetched ${cards.length} cards from YGOProDeck`);

    let synced = 0;

    for (const card of cards) {
      const imageUrl = card.card_images?.[0]?.image_url ?? null;
      const tcgPrice = parseFloat(card.card_prices?.[0]?.tcgplayer_price) || null;
      const cmPrice = parseFloat(card.card_prices?.[0]?.cardmarket_price) || null;

      await db.query(
        `INSERT INTO cards (
          ygo_card_id, name, card_type, attribute, monster_type,
          attack, defense, description, image_url,
          tcgplayer_price, card_market_price, price_updated_at
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,NOW())
        ON CONFLICT (ygo_card_id) DO UPDATE SET
          name = EXCLUDED.name,
          tcgplayer_price = EXCLUDED.tcgplayer_price,
          card_market_price = EXCLUDED.card_market_price,
          price_updated_at = NOW()`,
        [
          card.id,
          card.name,
          card.type,
          card.attribute ?? null,
          card.race ?? null,
          card.atk ?? null,
          card.def ?? null,
          card.desc,
          imageUrl,
          tcgPrice,
          cmPrice,
        ]
      );

      synced++;
      if (synced % 1000 === 0) {
        console.log(`Synced ${synced}/${cards.length} cards...`);
      }
    }

    console.log(`Card sync complete. ${synced} cards upserted.`);
  } catch (err) {
    console.error('Card sync failed:', err);
  }
}