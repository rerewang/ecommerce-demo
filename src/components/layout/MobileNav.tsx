'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X, User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { logout } from '@/app/(shop)/login/actions';

interface MobileNavProps {
  user: {
    email?: string;
    role?: string;
  } | null;
}

export function MobileNav({ user }: MobileNavProps) {
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
            <Link 
              href="/" 
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 text-lg font-medium hover:bg-muted rounded-lg transition-colors"
            >
              Home
            </Link>
            <Link 
              href="/products" 
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 text-lg font-medium hover:bg-muted rounded-lg transition-colors"
            >
              Gallery
            </Link>
            <Link 
              href="/features/ai-curator" 
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 text-lg font-medium hover:bg-muted rounded-lg transition-colors flex items-center justify-between"
            >
              AI Assistant
              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">New</span>
            </Link>
            
            {user ? (
              <>
                <Link 
                  href="/orders" 
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 text-lg font-medium hover:bg-muted rounded-lg transition-colors"
                >
                  My Orders
                </Link>
                {user.role === 'admin' && (
                   <Link 
                   href="/admin" 
                   onClick={() => setIsOpen(false)}
                   className="px-4 py-2 text-lg font-medium hover:bg-muted rounded-lg transition-colors"
                 >
                   Admin Dashboard
                 </Link>
                )}
                <div className="px-4 py-2 flex items-center gap-2 text-muted-foreground border-t border-muted mt-2 pt-4">
                  <User className="w-4 h-4" />
                  <span className="text-sm truncate">{user.email}</span>
                </div>
                <form action={logout} className="px-4">
                   <Button variant="ghost" size="sm" className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50/50 pl-0">
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                </form>
              </>
            ) : (
              <div className="pt-4 border-t border-muted">
                <Link href="/login" onClick={() => setIsOpen(false)}>
                  <Button className="w-full bg-primary text-white">Sign In</Button>
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </div>
  );
}