'use client'
import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'

interface Props {
  bienId: string
  fallback: number
}

export default function VuesLive({ bienId, fallback }: Props) {
  const [vues, setVues] = useState<number>(fallback)
  const hasIncremented = useRef(false)

  useEffect(() => {
    const load = async () => {
      // Incrémente une seule fois par affichage de la page
      if (!hasIncremented.current) {
        hasIncremented.current = true
        await supabase.rpc('increment_vues', { bien_id: bienId })
      }
      // Relit la valeur à jour, côté client (fiable, comme le dashboard)
      const { data } = await supabase
        .from('biens')
        .select('vues')
        .eq('id', bienId)
        .single()
      if (data?.vues != null) setVues(data.vues)
    }
    load()
  }, [bienId])

  return <>{vues}</>
}
