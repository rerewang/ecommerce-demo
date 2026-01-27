import { LoginForm } from '@/components/auth/LoginForm'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { Metadata } from 'next'

// export const dynamic = 'force-dynamic';

type Props = {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'Auth' })
  return {
    title: t('title')
  }
}

export default async function LoginPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale);
  return (
    <div className="min-h-screen bg-slate-50">
      <main className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <LoginForm />
      </main>
    </div>
  )
}
