-- Migration: Add date_of_birth and custom_avatar_url columns to profiles table
-- Date: 2026-04-11

-- Add date_of_birth column (stores the actual date of birth)
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS date_of_birth date;

-- Add custom_avatar_url column (for user-uploaded profile pictures)
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS custom_avatar_url text;

-- Create an index on date_of_birth for faster queries
CREATE INDEX IF NOT EXISTS idx_profiles_date_of_birth ON profiles(date_of_birth);
