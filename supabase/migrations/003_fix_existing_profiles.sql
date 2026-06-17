-- Update profiles table with data from auth.users
UPDATE public.profiles p
SET 
  full_name = CASE 
    WHEN p.full_name IS NULL OR p.full_name = '' 
    THEN COALESCE(
      (SELECT raw_user_meta_data->>'full_name' 
       FROM auth.users WHERE id = p.id),
      'User'
    )
    ELSE p.full_name
  END,
  phone = CASE 
    WHEN p.phone IS NULL OR p.phone = '' 
    THEN COALESCE(
      (SELECT raw_user_meta_data->>'phone' 
       FROM auth.users WHERE id = p.id),
      ''
    )
    ELSE p.phone
  END,
  updated_at = NOW()
WHERE 
  (p.full_name IS NULL OR p.full_name = '')
  OR 
  (p.phone IS NULL OR p.phone = '');

-- Check updated records
-- SELECT id, email, full_name, phone, role FROM profiles LIMIT 10;
