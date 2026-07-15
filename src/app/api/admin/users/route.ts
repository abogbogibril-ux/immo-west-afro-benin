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

// PATCH — suspendre/reactiver ou changer le role
export async function PATCH(req: NextRequest) {
  const admin = await verifierAdmin(req)
  if (!admin) return NextResponse.json({ error: "Non autorise" }, { status: 403 })

  const body = await req.json()
  const { targetId, action, value } = body

  if (!targetId || !action) return NextResponse.json({ error: "Parametres manquants" }, { status: 400 })
  if (targetId === admin.id) return NextResponse.json({ error: "Impossible de modifier votre propre compte" }, { status: 400 })

  const { data: target } = await supabaseAdmin.from("profiles").select("role").eq("id", targetId).single()
  if (target?.role === "admin") return NextResponse.json({ error: "Impossible de modifier un administrateur" }, { status: 403 })

  if (action === "suspendre") {
    const suspendu = value === true
    const { error } = await supabaseAdmin.from("profiles").update({ suspendu }).eq("id", targetId)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Si suspension : archiver automatiquement les biens publies
    if (suspendu) {
      await supabaseAdmin.from("biens").update({ statut: "archivé" }).eq("agent_id", targetId).eq("statut", "publié")
    }
    return NextResponse.json({ success: true, suspendu })
  }

  if (action === "role") {
    const rolesValides = ["client", "agent", "admin"]
    if (!rolesValides.includes(value)) return NextResponse.json({ error: "Role invalide" }, { status: 400 })
    const { error } = await supabaseAdmin.from("profiles").update({ role: value }).eq("id", targetId)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true, role: value })
  }

  if (action === "republier_tous") {
    const { data: biens, error: errCount } = await supabaseAdmin
      .from("biens").select("id").eq("agent_id", targetId).eq("statut", "archivé")
    if (errCount) return NextResponse.json({ error: errCount.message }, { status: 500 })
    const { error } = await supabaseAdmin
      .from("biens").update({ statut: "publié" }).eq("agent_id", targetId).eq("statut", "archivé")
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true, count: biens?.length ?? 0 })
  }

  return NextResponse.json({ error: "Action inconnue" }, { status: 400 })
}
