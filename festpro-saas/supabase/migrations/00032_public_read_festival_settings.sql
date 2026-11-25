-- Fix: Allow public anonymous read of festival_settings and public_homepage_settings for public festivals
-- This enables custom websites built in FesPro Studio to be viewed by anyone on their custom subdomain or public festival URL.

DO $$ BEGIN
  -- 1. Ensure festival_settings has a public read policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'festival_settings' 
    AND policyname = 'public_read_festival_settings'
  ) THEN
    CREATE POLICY public_read_festival_settings ON festival_settings
      FOR SELECT USING (true);
  END IF;

  -- 2. Ensure public_homepage_settings has public read for all published or existing settings
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'public_homepage_settings' 
    AND policyname = 'public_read_homepage_all'
  ) THEN
    CREATE POLICY public_read_homepage_all ON public_homepage_settings
      FOR SELECT USING (true);
  END IF;
END $$;
