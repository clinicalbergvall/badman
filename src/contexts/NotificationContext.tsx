import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { toast } from 'react-hot-toast'

export interface Notification {
    id: string
    type: 'service_complete' | 'payment_success' | 'cleaner_accepted' | 'cleaner_on_way' | 'new_message' | 'info'
    title: string
    message: string
    bookingId?: string
    read: boolean
    createdAt: string
}

interface NotificationContextType {
    notifications: Notification[]
    unreadCount: number
    addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) => void
    markAsRead: (id: string) => void
    markAllAsRead: () => void
    clearNotification: (id: string) => void
    clearAll: () => void
    toastMuted: boolean
    toggleToastMute: () => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

const STORAGE_KEY = 'cleancloak_notifications'
const TOAST_MUTE_KEY = 'cleancloak_toast_mute'

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>(() => {
        // Load notifications from localStorage on init
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) {
            try {
                return JSON.parse(stored)
            } catch (e) {
                console.error('Failed to parse stored notifications:', e)
                return []
            }
        }
        return []
  })
  const [toastMuted, setToastMuted] = useState<boolean>(() => {
    const stored = localStorage.getItem(TOAST_MUTE_KEY)
    return stored === 'true'
  })

  // Save to localStorage whenever notifications change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications))
  }, [notifications])

  useEffect(() => {
    localStorage.setItem(TOAST_MUTE_KEY, String(toastMuted))
  }, [toastMuted])

  // Subscribe to backend SSE for real-time events
  useEffect(() => {
    try {
      const base = import.meta.env.VITE_API_URL || 'http://localhost:5000'
      const url = `${base.endsWith('/api') ? base : `${base}/api`}/events`
      const es = new EventSource(url, { withCredentials: true })

      es.addEventListener('message', (evt: MessageEvent) => {
        try {
          const payload = JSON.parse(evt.data)
          const { type, payload: data } = payload || {}
          if (!type) return

          // Map server events to notifications
          const titleMap: Record<string, string> = {
            booking_created: 'New Booking',
            booking_accepted: 'Job Accepted',
            booking_completed: 'Job Completed',
            payment_completed: 'Payment Received',
            payout_processed: 'Payout Sent',
            newMessage: 'New Message',
          }
          const messageMap: Record<string, (d: any) => string> = {
            booking_created: (d) => `A ${d?.serviceCategory || 'service'} booking is now pending`,
            booking_accepted: (d) => `Booking ${d?.bookingId?.slice?.(0,8) || ''} accepted`,
            booking_completed: (d) => `Booking ${d?.bookingId?.slice?.(0,8) || ''} marked completed`,
            payment_completed: (d) => `Payment confirmed for booking ${d?.bookingId?.slice?.(0,8) || ''}`,
            payout_processed: (d) => `Payout processed for booking ${d?.bookingId?.slice?.(0,8) || ''}`,
            newMessage: (d) => `New message${d?.message?.senderName ? ` from ${d.message.senderName}` : ''}${d?.bookingId ? ` for booking ${d.bookingId.slice(0,8)}` : ''}`,
          }

          const title = titleMap[type] || 'Update'
          const messageBuilder = messageMap[type]
          const message = messageBuilder ? messageBuilder(data) : 'New activity'

          setNotifications(prev => ([
            {
              id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              type: type === 'booking_completed' ? 'service_complete' : type === 'payment_completed' ? 'payment_success' : type === 'newMessage' ? 'new_message' : 'info',
              title,
              message,
              bookingId: data?.bookingId,
              read: false,
              createdAt: new Date().toISOString(),
            },
            ...prev,
          ]))

          if (!toastMuted) {
            toast(`${title}: ${message}`)
          }
        } catch {}
      })

      es.addEventListener('error', (evt) => {
        console.error('SSE connection error:', evt);
        // Allow EventSource to auto-reconnect
      })

      return () => {
        es.close()
      }
    } catch {}
  }, [])

    const unreadCount = notifications.filter(n => !n.read).length

    const addNotification = (notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) => {
        const newNotification: Notification = {
            ...notification,
            id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            createdAt: new Date().toISOString(),
            read: false
        }

        setNotifications(prev => [newNotification, ...prev])
    }

    const markAsRead = (id: string) => {
        setNotifications(prev =>
            prev.map(n => n.id === id ? { ...n, read: true } : n)
        )
    }

    const markAllAsRead = () => {
        setNotifications(prev =>
            prev.map(n => ({ ...n, read: true }))
        )
    }

    const clearNotification = (id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id))
    }

    const clearAll = () => {
        setNotifications([])
    }

    const toggleToastMute = () => {
        setToastMuted(prev => !prev)
    }

    return (
        <NotificationContext.Provider
            value={{
                notifications,
                unreadCount,
                addNotification,
                markAsRead,
                markAllAsRead,
                clearNotification,
                clearAll,
                toastMuted,
                toggleToastMute
            }}
        >
            {children}
        </NotificationContext.Provider>
    )
}

export function useNotifications() {
    const context = useContext(NotificationContext)
    if (context === undefined) {
        throw new Error('useNotifications must be used within a NotificationProvider')
    }
    return context
}
