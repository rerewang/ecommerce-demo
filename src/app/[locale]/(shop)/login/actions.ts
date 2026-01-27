'use server'

import { createServerClient } from '@/lib/supabase-server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function login(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  
  const cookieStore = await cookies()
  const supabase = await createServerClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: '登录失败，请检查邮箱和密码' }
  }

  if (data.user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('locale')
      .eq('id', data.user.id)
      .single()
    
    if (profile?.locale) {
      // Set the locale cookie so middleware respects it
      cookieStore.set('NEXT_LOCALE', profile.locale)
      redirect(`/${profile.locale}`)
    }
  }

  redirect('/')
}

export async function signup(formData: FormData) {
  const email = (formData.get('email') as string)?.trim()
  const password = (formData.get('password') as string)?.trim()
  
  console.log('Signup attempt:', { email, passwordLength: password?.length })

  const supabase = await createServerClient()

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })

  if (error) {
    return { error: '注册失败: ' + error.message }
  }

  if (data?.session) {
    redirect('/')
  }

  return { success: '注册成功，请检查邮箱验证' }
}

export async function logout() {
  const supabase = await createServerClient()

  await supabase.auth.signOut()
  redirect('/')
}
