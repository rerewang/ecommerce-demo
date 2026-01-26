'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Menu, X, User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { logout } from '@/app/[locale]/(shop)/login/actions';
import { GlobalSearch } from '@/components/ui/GlobalSearch';
import { LanguageSwitcher } from './LanguageSwitcher';

interface MobileNavProps {
  user: {
    email?: string;
    role?: string;
  } | null;
}

export function MobileNav({ user }: MobileNavProps) {
  const t = useTranslations('Navigation');
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-foreground hover:text-primary transition-colors"
        aria-label="Toggle menu"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {isOpen && (
        <div className="absolute top-16 md:top-20 left-0 w-full bg-background border-b border-muted shadow-lg animate-in slide-in-from-top-2 duration-200 z-50">
          <nav className="flex flex-col p-4 space-y-4">
            <div className="px-4 pb-2">
              <GlobalSearch onSearch={() => setIsOpen(false)} />
            </div>
            <div className="px-4">
               <LanguageSwitcher />
            </div>
            <Link 
              href="/" 
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 text-lg font-medium hover:bg-muted rounded-lg transition-colors"
            >
              {t('home')}
            </Link>
            <Link 
              href="/products" 
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 text-lg font-medium hover:bg-muted rounded-lg transition-colors"
            >
              {t('gallery')}
            </Link>
            <Link 
              href="/features/ai-curator" 
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 text-lg font-medium hover:bg-muted rounded-lg transition-colors flex items-center justify-between"
            >
              {t('aiAssistant')}
              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{t('new')}</span>
            </Link>
            
            {user ? (
              <>
                <Link 
                  href="/orders" 
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 text-lg font-medium hover:bg-muted rounded-lg transition-colors"
                >
                  {t('myOrders')}
                </Link>
                {user.role === 'admin' && (
                   <Link 
                   href="/admin" 
                   onClick={() => setIsOpen(false)}
                   className="px-4 py-2 text-lg font-medium hover:bg-muted rounded-lg transition-colors"
                 >
                   {t('adminDashboard')}
                 </Link>
                )}
                <div className="px-4 py-2 flex items-center gap-2 text-muted-foreground border-t border-muted mt-2 pt-4">
                  <User className="w-4 h-4" />
                  <span className="text-sm truncate">{user.email}</span>
                </div>
                <form action={logout} className="px-4">
                   <Button variant="ghost" size="sm" className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50/50 pl-0">
                    <LogOut className="w-4 h-4 mr-2" />
                    {t('signOut')}
                  </Button>
                </form>
              </>
            ) : (
              <div className="pt-4 border-t border-muted">
                <Link href="/login" onClick={() => setIsOpen(false)}>
                  <Button className="w-full bg-primary text-white">{t('signIn')}</Button>
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </div>
  );
}