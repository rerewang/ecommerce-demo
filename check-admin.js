import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

// User didn't provide email in command line, just printing instructions
console.log('--- ADMIN CHECK INSTRUCTIONS ---');
console.log('1. Go to Supabase Dashboard');
console.log('2. Open SQL Editor');
console.log('3. Run this query:');
console.log("   select * from profiles where email = 'YOUR_EMAIL';");
console.log('4. If role is "customer", run:');
console.log("   update profiles set role = 'admin' where email = 'YOUR_EMAIL';");
