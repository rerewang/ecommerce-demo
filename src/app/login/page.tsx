import { LoginForm } from '@/components/auth/LoginForm'
import { Header } from '@/components/layout/Header'

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      
      <main className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <LoginForm />
      </main>
    </div>
  )
}
