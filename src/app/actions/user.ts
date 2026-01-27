'use server'

import { createServerClient } from '@/lib/supabase-server'

export async function updateUserLocale(locale: string) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (user) {
    await supabase.from('profiles').update({ locale }).eq('id', user.id)
  }
}
