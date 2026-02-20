ALTER TABLE binder_cards
  ADD COLUMN rarity VARCHAR(100),
  ADD COLUMN set_code VARCHAR(50),
  ADD COLUMN edition VARCHAR(20) DEFAULT 'unlimited';