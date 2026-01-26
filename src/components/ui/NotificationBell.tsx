'use client'

import { useState, useEffect, useRef } from 'react'
import { Bell, Check } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { createClientComponentClient } from '@/lib/supabase'
import { Notification } from '@/services/notifications'
import { useTranslations } from 'next-intl'

export function NotificationBell() {
  const t = useTranslations('Notifications')
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const supabase = createClientComponentClient()
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let active = true
    const fetchNotifications = async () => {
      try {
        const res = await fetch('/api/notifications')
        if (res.ok && active) {
          const data: Notification[] = await res.json()
          setNotifications(data)
          setUnreadCount(data.filter((n) => !n.read).length)
        }
      } catch (e) {
        console.error('Failed to fetch notifications', e)
      }
    }

    void fetchNotifications()

    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
        },
        (payload: { new: Notification }) => {
          const newNotification = payload.new
          setNotifications((prev) => [newNotification, ...prev])
          setUnreadCount((prev) => prev + 1)
        }
      )
      .subscribe()

    return () => {
      active = false
      supabase.removeChannel(channel)
    }
  }, [supabase])

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const markAsRead = async (id: string) => {
    // Optimistic update
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
    setUnreadCount(prev => Math.max(0, prev - 1))

    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, read: true })
      })
    } catch (e) {
      console.error('Failed to mark as read', e)
    }
  }

  const getNotificationContent = (n: Notification) => {
    if (n.type === 'price_drop') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const price = (n.metadata as any)?.triggered_price || '0'
      return {
        title: t('price_drop.title'),
        message: t('price_drop.message', { price })
      }
    }
    if (n.type === 'restock') {
      return {
        title: t('restock.title'),
        message: t('restock.message')
      }
    }
    return {
      title: n.title,
      message: n.message
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="ghost"
        // size="icon" - removed because existing Button component might not support it
        className="relative text-stone-500 hover:text-stone-900 w-10 h-10 p-0 rounded-full"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white" />
        )}
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-stone-200 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-100 origin-top-right">
          <div className="p-3 border-b border-stone-100 flex justify-between items-center bg-stone-50/50">
            <h3 className="font-semibold text-sm text-stone-900">{t('title')}</h3>
            {unreadCount > 0 && (
              <span className="text-xs bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full">
                {t('new', { count: unreadCount })}
              </span>
            )}
          </div>
          
          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-stone-500 text-sm">
                <Bell className="w-8 h-8 mx-auto mb-2 text-stone-300" />
                <p>{t('empty')}</p>
              </div>
            ) : (
              <div className="divide-y divide-stone-100">
                {notifications.map((notification) => {
                  const content = getNotificationContent(notification)
                  return (
                    <div 
                      key={notification.id}
                      className={`p-3 hover:bg-stone-50 transition-colors flex gap-3 ${!notification.read ? 'bg-blue-50/30' : ''}`}
                    >
                      <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${!notification.read ? 'bg-blue-500' : 'bg-transparent'}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-0.5">
                          <h4 className={`text-sm ${!notification.read ? 'font-semibold text-stone-900' : 'font-medium text-stone-700'}`}>
                            {content.title}
                          </h4>
                          {!notification.read && (
                            <button 
                              onClick={() => markAsRead(notification.id)}
                              className="text-stone-400 hover:text-blue-600 p-1 -mt-1 -mr-1"
                              title={t('markRead')}
                            >
                              <Check className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                        <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">
                          {content.message}
                        </p>
                        <div className="mt-1.5 text-[10px] text-stone-400">
                          {new Date(notification.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
