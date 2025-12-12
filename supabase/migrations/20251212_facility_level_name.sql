-- Add 'name' column to facility_level table for tiered facility names

ALTER TABLE public.facility_level
ADD COLUMN IF NOT EXISTS name TEXT;

COMMENT ON COLUMN public.facility_level.name IS 'Level-specific name (e.g., "Copper Mine" for Mine Lv.2)';
