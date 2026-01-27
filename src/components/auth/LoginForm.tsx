'use client'

import { useActionState, useState } from 'react'
import { login, signup } from '@/app/[locale]/(shop)/login/actions'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useTranslations } from 'next-intl'

type FormState = { error?: string; success?: string } | null

export function LoginForm() {
  const t = useTranslations('Auth')
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  
  const [state, formAction, isPending] = useActionState(async (_prev: FormState, formData: FormData): Promise<FormState> => {
    if (mode === 'login') {
      return await login(formData)
    } else {
      return await signup(formData)
    }
  }, null)

  return (
    <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
      <div>
        <h2 className="mt-6 text-center text-3xl font-heading font-bold text-slate-900">
          {mode === 'login' ? t('loginTitle') : t('registerTitle')}
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          {mode === 'login' ? t('loginSubtitle') : t('registerSubtitle')}
          <button 
            type="button"
            onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
            className="ml-1 font-medium text-primary-600 hover:text-primary-500"
          >
            {mode === 'login' ? t('switchToRegister') : t('switchToLogin')}
          </button>
        </p>
      </div>
      
      <form className="mt-8 space-y-6" action={formAction}>
        <div className="rounded-md shadow-sm space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
              {t('emailLabel')}
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder={t('emailPlaceholder')}
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
              {t('passwordLabel')}
            </label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              placeholder={t('passwordPlaceholder')}
            />
          </div>
        </div>

        {state?.error && (
          <div className="text-red-500 text-sm text-center">
            {state.error}
          </div>
        )}
        
        {state?.success && (
          <div className="text-green-500 text-sm text-center">
            {state.success}
          </div>
        )}

        <div>
          <Button
            type="submit"
            className="w-full"
            disabled={isPending}
          >
            {isPending ? t('pending') : (mode === 'login' ? t('loginButton') : t('registerButton'))}
          </Button>
        </div>
      </form>
    </div>
  )
}
