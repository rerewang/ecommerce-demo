'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/routing';
import { Button } from '@/components/ui/Button';
import { Languages } from 'lucide-react';
import { startTransition } from 'react';
import { updateUserLocale } from '@/app/actions/user';
import { useSearchParams } from 'next/navigation';

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function onToggle() {
    const nextLocale = locale === 'en' ? 'zh' : 'en';
    
    updateUserLocale(nextLocale).catch(console.error);

    startTransition(() => {
      // Preserve query params when switching locale
      const params = new URLSearchParams(searchParams.toString());
      const query = params.toString() ? `?${params.toString()}` : '';
      
      router.replace(`${pathname}${query}`, { locale: nextLocale });
    });
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onToggle}
      className="text-muted-foreground hover:text-foreground min-w-[80px]"
      title={locale === 'en' ? 'Switch to Chinese' : '切换到英文'}
    >
      <Languages className="w-4 h-4 mr-2" />
      {locale === 'en' ? '中文' : 'EN'}
    </Button>
  );
}
