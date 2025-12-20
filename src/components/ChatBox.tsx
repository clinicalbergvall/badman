import { useState, useEffect, useRef } from 'react'
import { Button, Card } from './ui'
import { loadUserSession, getStoredAuthToken } from '@/lib/storage'
import type { ChatMessage } from '@/lib/types'
import toast from 'react-hot-toast'
import { api } from '@/lib/api'

interface ChatBoxProps {
  bookingId: string
  currentUserId: string
  currentUserName: string
  currentUserRole: 'client' | 'cleaner'
}

export default function ChatBox({ 
  bookingId, 
  currentUserId, 
  currentUserName,
  currentUserRole 
}: ChatBoxProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Load initial messages
  useEffect(() => {
    // Fetch real chat messages from API
    const fetchMessages = async () => {
      try {
        const response = await api.get(`/chat/room/${bookingId}`)

        if (response.ok) {
          const data = await response.json()
          if (data.success && data.messages) {
            // Only update if there are new messages
            if (data.messages.length !== messages.length) {
              setMessages(data.messages)
            }
          }
        }
      } catch (error) {
        // Only log error, don't reset messages
        console.error('Error fetching messages:', error)
        // Show error toast only for initial load
        if (messages.length === 0) {
          toast.error('Failed to load messages. Please try again.');
        }
      }
    }

    fetchMessages()
    
    // Poll for new messages every 5 seconds
    const interval = setInterval(fetchMessages, 5000)
    
    return () => clearInterval(interval)
  }, [bookingId, currentUserId, currentUserName, currentUserRole, messages.length])

  // Listen for real-time messages via SSE
  useEffect(() => {
    try {
      const base = import.meta.env.VITE_API_URL || 'http://localhost:5000'
      const url = `${base.endsWith('/api') ? base : `${base}/api`}/events`
      const es = new EventSource(url, { withCredentials: true })

      es.addEventListener('newMessage', (evt: MessageEvent) => {
        try {
          const payload = JSON.parse(evt.data)
          const { message: newMessage } = payload || {}
          
          // Only add message if it's for this booking and not already in the list
          if (newMessage && newMessage.bookingId === bookingId && 
              !messages.some(msg => msg.id === newMessage.id)) {
            setMessages(prev => [...prev, newMessage])
          }
        } catch (e) {
          console.error('Error processing SSE message:', e)
        }
      })

      es.addEventListener('error', (evt: MessageEvent) => {
        console.error('SSE connection error:', evt);
      })

      return () => {
        es.close()
      }
    } catch (e) {
      console.error('Failed to setup SSE for chat:', e)
    }
  }, [bookingId, messages])

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return

    try {
      const response = await api.post(`/chat/${bookingId}/message`, {
        message: newMessage.trim()
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.message) {
          setMessages(prev => [...prev, data.message])
          setNewMessage('')
        } else {
          toast.error(data.message || 'Failed to send message')
        }
      } else {
        const errorData = await response.json().catch(() => ({}))
        toast.error(errorData.message || 'Failed to send message')
      }
    } catch (error) {
      console.error('Error sending message:', error)
      toast.error('Failed to send message. Please try again.')
    }
  }

  const handleImageUpload = () => {
    toast('Image upload coming soon!', { icon: '📸' })
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    
    // Check if it's today
    const isToday = date.getDate() === now.getDate() &&
                  date.getMonth() === now.getMonth() &&
                  date.getFullYear() === now.getFullYear()
    
    if (isToday) {
      // For today, show time
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    }
    
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays < 1) {
      const diffMins = Math.floor(diffMs / 60000)
      const diffHours = Math.floor(diffMins / 60)
      
      if (diffMins < 1) return 'Just now'
      if (diffMins < 60) return `${diffMins}m`
      if (diffHours < 24) return `${diffHours}h`
    }
    
    // For older dates, show date
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  // Group messages by date
  const groupMessagesByDate = (messages: ChatMessage[]) => {
    const groups: { [key: string]: ChatMessage[] } = {}
    
    messages.forEach(message => {
      const date = new Date(message.timestamp)
      const today = new Date();
      const dateKey = date.toISOString().split('T')[0];
      const todayKey = today.toISOString().split('T')[0];
      
      // Use 'Today' for today's messages
      const displayKey = dateKey === todayKey ? 'Today' : dateKey;
      
      if (!groups[displayKey]) {
        groups[displayKey] = []
      }
      
      groups[displayKey].push(message)
    })
    
    return groups
  }

  return (
    <Card className="flex flex-col h-[500px]">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">Chat</h3>
            <p className="text-xs text-gray-500">Booking #{bookingId.slice(0, 8)}</p>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-xs text-gray-600">Online</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p className="text-sm">No messages yet</p>
            <p className="text-xs">Start the conversation!</p>
          </div>
        ) : (
          Object.entries(groupMessagesByDate(messages)).map(([date, dateMessages]) => (
            <div key={date}>
              <div className="text-center my-4">
                <span className="inline-block px-3 py-1 bg-gray-200 text-gray-700 text-xs rounded-full">
                  {date === 'Today' 
                    ? 'Today' 
                    : new Date(date).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                </span>
              </div>
              {dateMessages.map((msg) => {
                const isOwnMessage = msg.senderId === currentUserId
                return (
                  <div
                    key={msg.id}
                    className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[80%] ${isOwnMessage ? 'order-2' : 'order-1'}`}>
                      {!isOwnMessage && msg.senderName && (
                        <p className="text-xs text-gray-600 mb-1 ml-2">{msg.senderName}</p>
                      )}
                      <div
                        className={`rounded-2xl px-4 py-2 ${
                          isOwnMessage
                            ? 'bg-yellow-500 text-white rounded-br-none'
                            : 'bg-gray-100 text-gray-900 rounded-bl-none'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap break-words">{msg.message}</p>
                        {msg.imageUrl && (
                          <img
                            src={msg.imageUrl}
                            alt="Shared"
                            className="mt-2 rounded-lg max-w-full"
                          />
                        )}
                      </div>
                      <p className={`text-xs text-gray-500 mt-1 ${isOwnMessage ? 'text-right mr-2' : 'ml-2'}`}>
                        {formatTime(msg.timestamp)}
                        {isOwnMessage && msg.read && (
                          <span className="ml-1">✓✓</span>
                        )}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <div className="flex gap-2 items-center">
          <button
            onClick={handleImageUpload}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
            title="Upload image"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </button>
          
          <div className="flex-1 relative">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Type a message..."
              className="w-full px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent resize-none"
              rows={1}
              style={{ minHeight: '44px', maxHeight: '120px' }}
            />
          </div>
          
          <Button
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            className="p-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-full shadow-md hover:shadow-lg transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </Button>
        </div>
      </div>
    </Card>
  )
}
