import { NextResponse } from "next/server";
import { processDueSocialPosts } from "@/lib/social/scheduler";

/**
 * Vercel Cron target (see vercel.json's `crons` entry) — publishes every
 * scheduled social post across every tenant whose scheduled_at has
 * arrived. Protected by CRON_SECRET: Vercel Cron sends
 * `Authorization: Bearer $CRON_SECRET` automatically once that env var is
 * set (https://vercel.com/docs/cron-jobs/manage-cron-jobs#securing-cron-jobs);
 * without it configured, this endpoint refuses every request rather than
 * running unauthenticated on a public URL.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "CRON_SECRET no está configurado." }, { status: 503 });
  }
  if (request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const result = await processDueSocialPosts();
  return NextResponse.json(result);
}
