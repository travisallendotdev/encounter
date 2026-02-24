CREATE TABLE IF NOT EXISTS dms (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS campaigns (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  dm_id TEXT NOT NULL REFERENCES dms(id),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS pcs (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  player_name TEXT NOT NULL,
  campaign_id TEXT NOT NULL REFERENCES campaigns(id)
);

CREATE TABLE IF NOT EXISTS encounters (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  campaign_id TEXT NOT NULL REFERENCES campaigns(id),
  encounter_number INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft'
);

CREATE TABLE IF NOT EXISTS monsters (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  encounter_instance_name TEXT NOT NULL,
  initiative_modifier INTEGER NOT NULL DEFAULT 0,
  encounter_id TEXT NOT NULL REFERENCES encounters(id)
);

CREATE TABLE IF NOT EXISTS encounter_pcs (
  encounter_id TEXT NOT NULL REFERENCES encounters(id),
  pc_id TEXT NOT NULL REFERENCES pcs(id),
  PRIMARY KEY (encounter_id, pc_id)
);

CREATE TABLE IF NOT EXISTS turn_order (
  encounter_id TEXT NOT NULL REFERENCES encounters(id),
  participant_id TEXT NOT NULL,
  participant_type TEXT NOT NULL CHECK(participant_type IN ('pc', 'monster')),
  name TEXT NOT NULL,
  initiative INTEGER NOT NULL,
  position INTEGER NOT NULL,
  PRIMARY KEY (encounter_id, participant_id)
);
