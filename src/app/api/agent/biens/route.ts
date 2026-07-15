import { createClient } from "@supabase/supabase-js"
import { NextRequest, NextResponse } from "next/server"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export async function PATCH(req: NextRequest) {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "")
    if (!token) return NextResponse.json({ error: "Non autorise" }, { status: 401 })

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    if (authError || !user) return NextResponse.json({ error: "Token invalide" }, { status: 401 })

    const { data: profile } = await supabaseAdmin
      .from("profiles").select("role, suspendu").eq("id", user.id).single()

    if (!profile || (profile.role !== "agent" && profile.role !== "admin")) {
      return NextResponse.json({ error: "Acces reserve aux agents" }, { status: 403 })
    }
    if (profile.suspendu) {
      return NextResponse.json({ error: "Compte suspendu — publication impossible" }, { status: 403 })
    }

    const { bienId, statut } = await req.json()
    if (!bienId || !statut) return NextResponse.json({ error: "Parametres manquants" }, { status: 400 })

    const statutsValides = ["publie", "publié", "archivé", "brouillon"]
    if (!statutsValides.includes(statut)) return NextResponse.json({ error: "Statut invalide" }, { status: 400 })

    const statutFinal = statut === "publie" ? "publié" : statut

    if (profile.role === "agent") {
      const { data: bien } = await supabaseAdmin
        .from("biens").select("agent_id").eq("id", bienId).single()
      if (!bien || bien.agent_id !== user.id) {
        return NextResponse.json({ error: "Ce bien ne vous appartient pas" }, { status: 403 })
      }
    }

    const { error } = await supabaseAdmin
      .from("biens").update({ statut: statutFinal }).eq("id", bienId)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ success: true, statut: statutFinal })
  } catch (err: any) {
    return NextResponse.json({ error: "Erreur serveur : " + err.message }, { status: 500 })
  }
}
