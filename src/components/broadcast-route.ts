/**
 * /api/admin/broadcast — Diffusion d'un message à tous les agents
 * Immo West Afro Bénin
 *
 * POST /api/admin/broadcast
 * Body : { message: string, accessToken: string }
 *
 * Reservé aux comptes admin — verifie l'identite via le jeton de session avant toute ecriture.
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, accessToken } = body;

    if (!message || !accessToken) {
      return NextResponse.json({ error: "message et accessToken requis" }, { status: 400 });
    }

    // Verification de l'identite de l'appelant via son jeton de session
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(accessToken);
    if (authError || !user) {
      return NextResponse.json({ error: "Non authentifie" }, { status: 401 });
    }

    // Verification que l'appelant est bien administrateur
    const { data: callerProfile } = await supabaseAdmin
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (callerProfile?.role !== "admin") {
      return NextResponse.json({ error: "Reserve aux administrateurs" }, { status: 403 });
    }

    // Recuperer tous les agents
    const { data: agents, error: agentsError } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("role", "agent");

    if (agentsError) {
      return NextResponse.json({ error: "Erreur recuperation agents" }, { status: 500 });
    }

    if (!agents || agents.length === 0) {
      return NextResponse.json({ sent: 0, message: "Aucun agent inscrit" });
    }

    // Insertion en masse dans la table notifications
    const rows = agents.map((agent) => ({
      user_id: agent.id,
      message,
      lu: false,
    }));

    const { error: insertError } = await supabaseAdmin.from("notifications").insert(rows);

    if (insertError) {
      console.error("Erreur insertion notifications:", insertError);
      return NextResponse.json({ error: "Erreur lors de l'envoi" }, { status: 500 });
    }

    return NextResponse.json({ sent: agents.length });
  } catch (err) {
    console.error("Erreur diffusion:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
