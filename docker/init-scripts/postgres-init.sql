-- ============================================================
-- PostgreSQL Test Database Initialization
-- ============================================================
-- This script runs once when the container is first created.
-- It sets up extensions and schemas that tests rely on.
-- ============================================================

-- Enable commonly needed extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "citext";

-- Create a dedicated test schema (in addition to public)
CREATE SCHEMA IF NOT EXISTS test_helpers;

-- ── Utility function: truncate all tables in a schema ──────
CREATE OR REPLACE FUNCTION test_helpers.truncate_all_tables(schema_name TEXT DEFAULT 'public')
RETURNS VOID AS $$
DECLARE
  table_record RECORD;
BEGIN
  FOR table_record IN
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = schema_name
      AND tablename NOT LIKE '_prisma_%'
  LOOP
    EXECUTE format('TRUNCATE TABLE %I.%I RESTART IDENTITY CASCADE', schema_name, table_record.tablename);
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ── Utility function: list all tables ──────────────────────
CREATE OR REPLACE FUNCTION test_helpers.list_tables(schema_name TEXT DEFAULT 'public')
RETURNS TABLE(table_name TEXT, row_count BIGINT) AS $$
BEGIN
  RETURN QUERY
  SELECT
    t.tablename::TEXT,
    (xpath('/row/cnt/text()',
      xmlelement(name row,
        xmlelement(name cnt,
          (SELECT reltuples::BIGINT FROM pg_class WHERE relname = t.tablename)
        )
      )
    ))[1]::TEXT::BIGINT AS row_count
  FROM pg_tables t
  WHERE t.schemaname = schema_name
    AND t.tablename NOT LIKE '_prisma_%'
  ORDER BY t.tablename;
END;
$$ LANGUAGE plpgsql;

-- Grant privileges to the test user
GRANT USAGE ON SCHEMA test_helpers TO testuser;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA test_helpers TO testuser;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO testuser;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO testuser;
