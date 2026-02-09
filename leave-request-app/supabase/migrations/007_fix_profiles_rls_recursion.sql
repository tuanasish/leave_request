-- 007_fix_profiles_rls_recursion.sql
-- Migration: Fix infinite recursion in profiles RLS policies
-- Issue: "Admin can view all profiles" policy queries profiles table, causing infinite loop

-- Step 1: Create a SECURITY DEFINER function to check user role without triggering RLS
-- This function runs as the owner (bypasses RLS) to safely check the role
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS user_role AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION public.get_my_role() TO authenticated;

-- Step 2: Drop the problematic policies
DROP POLICY IF EXISTS "Admin can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Step 3: Recreate policies using the safe function

-- Users can view their own profile (unchanged, this is safe)
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile (unchanged, this is safe)
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Admin can view all profiles - NOW USING THE SAFE FUNCTION
CREATE POLICY "Admin can view all profiles"
  ON profiles FOR SELECT
  USING (public.get_my_role() = 'admin');

-- Admin can update any profile (for managing users)
CREATE POLICY "Admin can update all profiles"
  ON profiles FOR UPDATE
  USING (public.get_my_role() = 'admin');

-- Step 4: Allow service role to do everything (for backend operations)
-- Note: service_role already bypasses RLS by default, but this is explicit
CREATE POLICY "Service role full access"
  ON profiles
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');
