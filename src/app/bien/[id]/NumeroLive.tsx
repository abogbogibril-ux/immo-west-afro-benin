'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface Props {
  bienId: string
  fallback?: number
}

export default function NumeroLive({ bienId, fallback }: Props) {
  const [numero, setNumero] = useState<number | undefined>(fallback)

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('biens')
        .select('numero_sequence')
        .eq('id', bienId)
        .single()
      if (data?.numero_sequence != null) setNumero(data.numero_sequence)
    }
    load()
  }, [bienId])

  if (numero == null) return <>IWA-…</>
  return <>{`IWA-${String(numero).padStart(5, '0')}`}</>
}
