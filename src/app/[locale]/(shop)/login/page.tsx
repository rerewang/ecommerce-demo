import { LoginForm } from '@/components/auth/LoginForm'
import { getTranslations } from 'next-intl/server'
import { Metadata } from 'next'

export const dynamic = 'force-dynamic';

type Props = {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Auth' })
  return {
    title: t('title')
  }
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <main className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <LoginForm />
      </main>
    </div>
  )
}
