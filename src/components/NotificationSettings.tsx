'use client'

import { useEffect, useState } from 'react'
import {
  isPushSupported,
  getPushPermission,
  subscribeToPush,
  unsubscribeFromPush,
} from '@/lib/push-notifications'

interface Props {
  userId: string
}

export default function NotificationSettings({ userId }: Props) {
  const [status, setStatus] = useState<'unsupported' | 'default' | 'granted' | 'denied' | 'loading'>('default')
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    const perm = getPushPermission()
    setStatus(perm)
  }, [])

  const handleEnable = async () => {
    setProcessing(true)
    const sub = await subscribeToPush(userId)
    setStatus(sub ? 'granted' : getPushPermission())
    setProcessing(false)
  }

  const handleDisable = async () => {
    setProcessing(true)
    await unsubscribeFromPush(userId)
    setStatus('default')
    setProcessing(false)
  }

  if (status === 'unsupported') {
    return (
      <div className="bg-[#1e293b] border border-[#334155] rounded-2xl p-5">
        <p className="text-sm text-slate-400">
          Les notifications push ne sont pas supportées sur ce navigateur.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-[#1e293b] border border-[#334155] rounded-2xl p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-semibold text-white mb-1 flex items-center gap-2">
            🔔 Notifications push
          </h3>
          <p className="text-sm text-slate-400">
            Recevez une alerte instantanée quand un client vous envoie un message,
            même quand le site est fermé.
          </p>
        </div>

        {status === 'granted' ? (
          <span className="flex-shrink-0 px-3 py-1.5 bg-green-500/10 text-green-400 text-xs font-semibold rounded-full border border-green-500/30">
            ✓ Activées
          </span>
        ) : status === 'denied' ? (
          <span className="flex-shrink-0 px-3 py-1.5 bg-red-500/10 text-red-400 text-xs font-semibold rounded-full border border-red-500/30">
            Bloquées
          </span>
        ) : null}
      </div>

      <div className="mt-4">
        {status === 'granted' ? (
          <button
            onClick={handleDisable}
            disabled={processing}
            className="px-4 py-2.5 bg-[#0f172a] border border-[#334155] text-slate-300 text-sm font-medium rounded-xl hover:bg-[#0f172a]/80 transition-colors disabled:opacity-50"
          >
            {processing ? 'Désactivation...' : 'Désactiver les notifications'}
          </button>
        ) : status === 'denied' ? (
          <p className="text-xs text-slate-400">
            Les notifications ont été bloquées dans votre navigateur.
            Autorisez-les depuis les paramètres du site (icône 🔒 dans la barre d'adresse).
          </p>
        ) : (
          <button
            onClick={handleEnable}
            disabled={processing}
            className="px-4 py-2.5 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            {processing ? 'Activation...' : 'Activer les notifications'}
          </button>
        )}
      </div>
    </div>
  )
}
