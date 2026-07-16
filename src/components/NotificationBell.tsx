'use client'
import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'

interface Notif {
  id: number
  message: string
  lu: boolean
  created_at: string
}

export default function NotificationBell() {
  const [notifs, setNotifs] = useState<Notif[]>([])
  const [open, setOpen] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  const load = async (uid: string) => {
    const { data } = await supabase
      .from('notifications')
      .select('id, message, lu, created_at')
      .eq('user_id', uid)
      .order('created_at', { ascending: false })
      .limit(20)
    setNotifs(data ?? [])
  }

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserId(user.id)
        load(user.id)
      }
    }
    init()
  }, [])

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  const unreadCount = notifs.filter(n => !n.lu).length

  const marquerToutLu = async () => {
    if (!userId || unreadCount === 0) return
    await supabase.from('notifications').update({ lu: true }).eq('user_id', userId).eq('lu', false)
    load(userId)
  }

  const marquerUneLu = async (id: number) => {
    await supabase.from('notifications').update({ lu: true }).eq('id', id)
    if (userId) load(userId)
  }

  const toggleOpen = () => {
    setOpen(prev => {
      const next = !prev
      if (next && userId) load(userId)
      return next
    })
  }

  return (
    <div className="relative" ref={menuRef}>
      <button onClick={toggleOpen}
        className="relative p-3 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 transition-colors">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 z-50 max-h-96 overflow-y-auto">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <span className="font-bold text-sm text-gray-900">Notifications</span>
            {unreadCount > 0 && (
              <button onClick={marquerToutLu} className="min-h-[44px] flex items-center text-sm text-green-600 font-semibold hover:underline px-2">
                Tout marquer lu
              </button>
            )}
          </div>
          {notifs.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-gray-400">Aucune notification pour le moment.</p>
          ) : (
            <div className="divide-y divide-gray-50">
              {notifs.map(n => (
                <button key={n.id} onClick={() => marquerUneLu(n.id)}
                  className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${!n.lu ? 'bg-green-50/50' : ''}`}>
                  <p className="text-sm text-gray-700 leading-snug">{n.message}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(n.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    {!n.lu && <span className="ml-2 text-green-600 font-semibold">● non lu</span>}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
