'use client'

import { useActionState, useState } from 'react'
import { login, signup } from '@/app/login/actions'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export function LoginForm() {
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  
  const [state, formAction, isPending] = useActionState(async (prev: any, formData: FormData) => {
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
          {mode === 'login' ? '登录账户' : '注册新账户'}
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          {mode === 'login' ? '还没有账户？' : '已有账户？'}
          <button 
            type="button"
            onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
            className="ml-1 font-medium text-primary-600 hover:text-primary-500"
          >
            {mode === 'login' ? '立即注册' : '去登录'}
          </button>
        </p>
      </div>
      
      <form className="mt-8 space-y-6" action={formAction}>
        <div className="rounded-md shadow-sm space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
              邮箱
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="user@example.com"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
              密码
            </label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              placeholder="******"
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
            {isPending ? '处理中...' : (mode === 'login' ? '登录' : '注册')}
          </Button>
        </div>
      </form>
    </div>
  )
}
