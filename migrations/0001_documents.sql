CREATE TABLE IF NOT EXISTS corstack_documents (
  collection text NOT NULL CHECK (collection IN ('client_types', 'leads', 'payments', 'portfolio', 'pricing', 'process', 'services', 'settings')),
  id text NOT NULL CHECK (length(id) BETWEEN 1 AND 1500 AND position('/' in id) = 0),
  data jsonb NOT NULL CHECK (jsonb_typeof(data) = 'object' AND NOT data ? 'id'),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (collection, id)
);

CREATE INDEX IF NOT EXISTS corstack_content_order ON corstack_documents (collection, ((data->>'order')::numeric), id)
  WHERE collection IN ('pricing', 'portfolio', 'services', 'client_types', 'process');

CREATE INDEX IF NOT EXISTS corstack_lead_created ON corstack_documents ((data->>'createdAt') DESC, id)
  WHERE collection = 'leads';
