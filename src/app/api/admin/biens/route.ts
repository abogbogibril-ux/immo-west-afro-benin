import { createClient } from "@supabase/supabase-js"
import { NextRequest, NextResponse } from "next/server"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

async function verifierAdmin(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "")
  if (!token) return null
  const { data: { user } } = await supabaseAdmin.auth.getUser(token)
  if (!user) return null
  const { data: profile } = await supabaseAdmin.from("profiles").select("role").eq("id", user.id).single()
  return profile?.role === "admin" ? user : null
}

// PATCH — changer le statut
export async function PATCH(req: NextRequest) {
  const admin = await verifierAdmin(req)
  if (!admin) return NextResponse.json({ error: "Non autorise" }, { status: 403 })

  const { bienId, statut } = await req.json()
  if (!bienId || !statut) return NextResponse.json({ error: "Parametres manquants" }, { status: 400 })

  const statutsValides = ["publié", "archivé", "brouillon"]
  if (!statutsValides.includes(statut)) return NextResponse.json({ error: "Statut invalide" }, { status: 400 })

  const { error } = await supabaseAdmin.from("biens").update({ statut }).eq("id", bienId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true, statut })
}

// DELETE — supprimer definitivement
export async function DELETE(req: NextRequest) {
  const admin = await verifierAdmin(req)
  if (!admin) return NextResponse.json({ error: "Non autorise" }, { status: 403 })

  const { bienId } = await req.json()
  if (!bienId) return NextResponse.json({ error: "bienId manquant" }, { status: 400 })

  const { error: errImg } = await supabaseAdmin.from("images_biens").delete().eq("bien_id", bienId)
  if (errImg) return NextResponse.json({ error: "Erreur images : " + errImg.message }, { status: 500 })

  const { error } = await supabaseAdmin.from("biens").delete().eq("id", bienId)
  if (error) return NextResponse.json({ error: "Erreur suppression : " + error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
