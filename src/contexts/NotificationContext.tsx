import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { toast } from 'react-hot-toast'
import { io, Socket } from 'socket.io-client'
import { logger } from '@/lib/logger'
import { loadUserSession } from '@/lib/storage'

export interface Notification {
  id: string
  type: 'service_complete' | 'payment_success' | 'cleaner_accepted' | 'cleaner_on_way' | 'new_message' | 'info' | 'booking_created' | 'booking_accepted' | 'booking_completed' | 'payment_completed' | 'payout_processed' | 'newMessage' | 'cleaner_status_update'
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

    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        return JSON.parse(stored)
      } catch (error) {
        logger.error('Failed to parse stored notifications', error instanceof Error ? error : undefined, { eventId: 'parse-notifications-error' });
        return []
      }
    }
    return []
  })
  const [toastMuted, setToastMuted] = useState<boolean>(() => {
    const stored = localStorage.getItem(TOAST_MUTE_KEY)
    return stored === 'true'
  })


  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications))
  }, [notifications])

  useEffect(() => {
    localStorage.setItem(TOAST_MUTE_KEY, String(toastMuted))
  }, [toastMuted])


  useEffect(() => {
    let socket: Socket | null = null;
    const session = loadUserSession();

    if (!session?.id) {
      console.log('No user session found, skipping socket connection');
      return;
    }

    try {
      const OVERRIDE_API_URL = localStorage.getItem('apiOverride') || ''
      const VITE_API_URL = import.meta.env.VITE_API_URL
      const base = OVERRIDE_API_URL || VITE_API_URL || window.location.origin
      const socketUrl = base.endsWith('/api') ? base.slice(0, -4) : base;

      socket = io(socketUrl, {
        query: { userId: session.id },
        transports: ['websocket'],
        withCredentials: true
      });

      socket.on('connect', () => {
        console.log('🚀 Socket.io connected');
      });

      socket.on('connect_error', (error) => {
        logger.error('Socket connection error', error instanceof Error ? error : undefined, { eventId: 'socket-connection-error' });
      });


      const eventTypes = [
        'booking_created',
        'booking_accepted',
        'booking_completed',
        'payment_completed',
        'payout_processed',
        'newMessage',
        'cleaner_status_update'
      ];

      eventTypes.forEach(type => {
        socket?.on(type, (data) => {
          processNotification(type, data);
        });
      });

      return () => {
        if (socket) socket.disconnect();
      }
    } catch (error) {
      logger.error('Failed to setup Socket for notifications', error instanceof Error ? error : undefined, { eventId: 'socket-setup-error' });
    }
  }, [])

  const unreadCount = notifications.filter(n => !n.read).length

  const processNotification = (type: string, data: any) => {

    const titleMap: Record<string, string> = {
      booking_created: 'New Booking',
      booking_accepted: 'Job Accepted',
      booking_completed: 'Job Completed',
      payment_completed: 'Payment Received',
      payout_processed: 'Payout Sent',
      newMessage: 'New Message',
      cleaner_status_update: 'Cleaner Update',
    }
    const messageMap: Record<string, (d: any) => string> = {
      booking_created: (d) => `A ${d?.serviceCategory || 'service'} booking is now pending`,
      booking_accepted: (d) => `Booking ${d?.bookingId?.slice?.(0, 8) || ''} accepted`,
      booking_completed: (d) => `Booking ${d?.bookingId?.slice?.(0, 8) || ''} marked completed`,
      payment_completed: (d) => `Payment confirmed for booking ${d?.bookingId?.slice?.(0, 8) || ''}`,
      payout_processed: (d) => `Payout processed for booking ${d?.bookingId?.slice?.(0, 8) || ''}`,
      newMessage: (d) => `New message${d?.message?.senderName ? ` from ${d.message.senderName}` : ''}${d?.bookingId ? ` for booking ${d.bookingId.slice(0, 8)}` : ''}`,
      cleaner_status_update: (d) => `Cleaner status updated to ${d?.status || 'new status'}`,
    }

    const title = titleMap[type] || 'Update'
    const messageBuilder = messageMap[type]
    const message = messageBuilder ? messageBuilder(data) : 'New activity'

    setNotifications(prev => ([
      {
        id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: (type === 'booking_completed' ? 'service_complete' :
          type === 'payment_completed' ? 'payment_success' :
            type === 'booking_accepted' ? 'cleaner_accepted' :
              type === 'newMessage' ? 'new_message' :
                type === 'cleaner_status_update' ? 'cleaner_on_way' :
                  type || 'info') as Notification['type'],
        title,
        message,
        bookingId: data?.bookingId,
        read: false,
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ]))

    if (!toastMuted) {
      toast.custom((t) => (
        <div
          className={`${t.visible ? 'animate-enter' : 'animate-leave'
            } max-w-md w-full bg-slate-900 shadow-2xl rounded-2xl pointer-events-auto flex ring-1 ring-yellow-400/20 border border-slate-700/50 backdrop-blur-xl overflow-hidden`}
        >
          <div className="flex-1 w-0 p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 pt-0.5">
                <div className="p-2 bg-yellow-400/10 rounded-xl">
                  {type === 'newMessage' ? (
                    <span className="text-xl">💬</span>
                  ) : type.includes('payment') ? (
                    <span className="text-xl">💰</span>
                  ) : type.includes('booking') ? (
                    <span className="text-xl">🚗</span>
                  ) : (
                    <span className="text-xl">✨</span>
                  )}
                </div>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-bold text-yellow-400 uppercase tracking-wider">
                  {title}
                </p>
                <p className="mt-1 text-sm text-slate-100 font-medium">
                  {message}
                </p>
              </div>
            </div>
          </div>
          <div className="flex border-l border-slate-700/50">
            <button
              onClick={() => toast.dismiss(t.id)}
              className="w-full border border-transparent rounded-none rounded-r-2xl p-4 flex items-center justify-center text-sm font-bold text-slate-400 hover:text-yellow-400 hover:bg-slate-800 transition-all focus:outline-none"
            >
              Close
            </button>
          </div>
        </div>
      ), { duration: 5000 });
    }
  };

  const addNotification = (notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      read: false
    } as Notification;

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
