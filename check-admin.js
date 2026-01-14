const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkRole(email) {
  console.log(`Checking role for: ${email}`);
  
  // 1. Get User ID from Auth (we can't do this with anon key usually without login)
  // But wait, RLS prevents reading profiles table for 'anon'.
  // We need to use SERVICE ROLE KEY to debug this properly without logging in.
  // OR we just ask user to check dashboard.
  
  // Let's try to query profiles table anyway (it might fail due to RLS)
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('email', email);

  if (error) {
    console.error('Error:', error.message);
    console.log('HINT: This script uses ANON key. RLS might be blocking read access.');
    console.log('You should check Supabase Dashboard -> Table Editor -> profiles');
  } else {
    console.log('Profiles found:', data);
  }
}

// User didn't provide email in command line, just printing instructions
console.log('--- ADMIN CHECK INSTRUCTIONS ---');
console.log('1. Go to Supabase Dashboard');
console.log('2. Open SQL Editor');
console.log('3. Run this query:');
console.log("   select * from profiles where email = 'YOUR_EMAIL';");
console.log('4. If role is "customer", run:');
console.log("   update profiles set role = 'admin' where email = 'YOUR_EMAIL';");
