import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import webpush from "web-push"

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT || "mailto:calavi_immo@immowestafro.com",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
)

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, payload, conversationId } = body

    if (!userId || !payload) {
      return NextResponse.json({ error: "userId et payload requis" }, { status: 400 })
    }

    const { data: subscriptions, error: subError } = await supabaseAdmin
      .from("push_subscriptions")
      .select("endpoint, p256dh, auth")
      .eq("user_id", userId)

    if (subError) {
      console.error("Erreur recuperation subscriptions:", subError)
      return NextResponse.json({ error: "Erreur base de donnees" }, { status: 500 })
    }

    if (!subscriptions || subscriptions.length === 0) {
      return NextResponse.json({ sent: 0, message: "Aucune subscription" })
    }

    const pushPayload = JSON.stringify({
      title: payload.title || "Immo West Afro Benin",
      body: payload.body,
      icon: payload.icon || "/icons/icon-192x192.png",
      badge: "/icons/badge-72x72.png",
      tag: payload.tag || "immo-notification",
      data: {
        url: payload.url || "/",
        conversationId,
        ...payload.data,
      },
    })

    const results = await Promise.allSettled(
      subscriptions.map(async (sub) => {
        const pushSubscription = {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh, auth: sub.auth },
        }
        try {
          await webpush.sendNotification(pushSubscription, pushPayload)
          return { success: true, endpoint: sub.endpoint }
        } catch (err: unknown) {
          if (err instanceof Error && "statusCode" in err) {
            const webPushError = err as { statusCode: number }
            if (webPushError.statusCode === 410 || webPushError.statusCode === 404) {
              await supabaseAdmin.from("push_subscriptions").delete().eq("endpoint", sub.endpoint)
            }
          }
          throw err
        }
      })
    )

    const sent   = results.filter((r) => r.status === "fulfilled").length
    const failed = results.filter((r) => r.status === "rejected").length
    return NextResponse.json({ sent, failed, total: subscriptions.length })

  } catch (err) {
    console.error("Erreur envoi push:", err)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

export async function notifyNewMessage(
  receiverId: string,
  senderName: string,
  messagePreview: string,
  conversationId: string,
  bienTitre?: string
) {
  const payload = {
    title: `${senderName}`,
    body: bienTitre
      ? `Re: ${bienTitre}\n${messagePreview.slice(0, 80)}...`
      : messagePreview.slice(0, 100),
    url: `/client/messages?conv=${conversationId}`,
    tag: `message-${conversationId}`,
  }
  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://benin.immowestafro.com"
    await fetch(`${appUrl}/api/push/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: receiverId, payload, conversationId }),
    })
  } catch (err) {
    console.warn("Notification push non envoyee:", err)
  }
}