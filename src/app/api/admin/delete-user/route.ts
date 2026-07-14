import { createClient } from "@supabase/supabase-js"
import { NextRequest, NextResponse } from "next/server"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export async function DELETE(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization")
    if (!authHeader) return NextResponse.json({ error: "Non autorise" }, { status: 401 })

    const token = authHeader.replace("Bearer ", "")
    const { data: { user: caller }, error: authError } = await supabaseAdmin.auth.getUser(token)
    if (authError || !caller) return NextResponse.json({ error: "Token invalide" }, { status: 401 })

    const { data: callerProfile } = await supabaseAdmin
      .from("profiles").select("role").eq("id", caller.id).single()
    if (callerProfile?.role !== "admin")
      return NextResponse.json({ error: "Acces reserve aux administrateurs" }, { status: 403 })

    const body = await req.json()
    const targetId = body.targetId
    if (!targetId) return NextResponse.json({ error: "targetId manquant" }, { status: 400 })
    if (targetId === caller.id)
      return NextResponse.json({ error: "Impossible de supprimer votre propre compte" }, { status: 400 })

    const { data: targetProfile } = await supabaseAdmin
      .from("profiles").select("role").eq("id", targetId).single()
    if (targetProfile?.role === "admin")
      return NextResponse.json({ error: "Impossible de supprimer un administrateur" }, { status: 403 })

    const { data: biens } = await supabaseAdmin.from("biens").select("id").eq("agent_id", targetId)
    const bienIds = biens?.map((b: any) => b.id) || []

    if (bienIds.length > 0) {
      const { error: errImg } = await supabaseAdmin.from("images_biens").delete().in("bien_id", bienIds)
      if (errImg) return NextResponse.json({ error: "Erreur images : " + errImg.message }, { status: 500 })
    }

    const { error: errBiens } = await supabaseAdmin.from("biens").delete().eq("agent_id", targetId)
    if (errBiens) return NextResponse.json({ error: "Erreur biens : " + errBiens.message }, { status: 500 })

    const { error: errProfile } = await supabaseAdmin.from("profiles").delete().eq("id", targetId)
    if (errProfile) return NextResponse.json({ error: "Erreur profil : " + errProfile.message }, { status: 500 })

    const { error: errAuth } = await supabaseAdmin.auth.admin.deleteUser(targetId)
    if (errAuth) return NextResponse.json({ error: "Erreur auth : " + errAuth.message }, { status: 500 })

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: "Erreur serveur : " + err.message }, { status: 500 })
  }
}
