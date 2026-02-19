-- USERS
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  avatar_url TEXT,
  location_lat NUMERIC(8,2),
  location_lng NUMERIC(8,2),
  location_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- CARDS (master reference, synced from YGOProDeck)
CREATE TABLE cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ygo_card_id INTEGER UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  card_type VARCHAR(100),
  attribute VARCHAR(50),
  monster_type VARCHAR(100),
  attack INTEGER,
  defense INTEGER,
  description TEXT,
  image_url TEXT,
  tcgplayer_price NUMERIC(10,2),
  card_market_price NUMERIC(10,2),
  price_updated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- BINDERS
CREATE TABLE binders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  cover_color VARCHAR(20) DEFAULT '#1a1a2e',
  sleeve_style VARCHAR(50) DEFAULT 'none',
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- BINDER CARDS
CREATE TABLE binder_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  binder_id UUID NOT NULL REFERENCES binders(id) ON DELETE CASCADE,
  card_id UUID NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
  page_number INTEGER NOT NULL DEFAULT 1,
  slot_position INTEGER NOT NULL DEFAULT 0,
  condition VARCHAR(10) DEFAULT 'NM',
  quantity INTEGER NOT NULL DEFAULT 1,
  foil_type VARCHAR(50),
  acquisition_price NUMERIC(10,2),
  acquisition_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- WISHLISTS
CREATE TABLE wishlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  card_id UUID NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
  max_price NUMERIC(10,2),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, card_id)
);

-- INDEXES
CREATE INDEX idx_binder_cards_binder_id ON binder_cards(binder_id);
CREATE INDEX idx_binder_cards_page ON binder_cards(binder_id, page_number);
CREATE INDEX idx_wishlists_user_id ON wishlists(user_id);
CREATE INDEX idx_cards_name ON cards USING gin(to_tsvector('english', name));