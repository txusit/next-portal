CREATE OR REPLACE FUNCTION delete_test_resources()
RETURNS VOID AS $$
DECLARE
    r RECORD;
    c RECORD;
    query TEXT;
BEGIN
    -- Loop through each table in the public schema
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        -- Loop through each column in the current table
        FOR c IN (SELECT column_name, data_type FROM information_schema.columns WHERE table_name = r.tablename AND table_schema = 'public') LOOP
            -- Only process text-like columns (char, varchar, text)
            IF c.data_type IN ('character varying', 'character', 'text') THEN
                -- Construct the delete query for text-like columns
                query := format('DELETE FROM %I WHERE %I LIKE ''__TEST__%%''', r.tablename, c.column_name);
                EXECUTE query;
            END IF;
        END LOOP;
    END LOOP;
END;
$$ LANGUAGE plpgsql;
