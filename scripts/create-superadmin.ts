/**
 * Creates a Super Admin account (super_admin_users). This is the ONLY way
 * a row is ever added to that table — there is no self-registration or
 * web form, on purpose (see supabase/schema.sql's "Super Admin accounts"
 * section). Run this by hand, once per real person who should have
 * platform-wide access.
 *
 * This row is legacy storage, not itself a login method: the first time
 * this person logs in at /acceder with this email+password, accederAction
 * (app/acceder/actions.ts) transparently provisions the real Supabase Auth
 * account + ds_app_users profile behind the scenes — see the comment on
 * verifySuperadminCredentials in lib/auth/superadmin-auth.ts.
 *
 * Usage (after supabase/schema.sql has been run at least once):
 *   npm run superadmin:create -- --email=you@example.com --password=a-strong-password
 *
 * Safe to re-run for a DIFFERENT email (each is a new account). Re-running
 * with the SAME email fails loudly (unique constraint) instead of silently
 * resetting an existing account's password.
 */
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });

import { createClient } from "@supabase/supabase-js";
import { randomBytes, scryptSync } from "node:crypto";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    console.error(`Missing ${name}. Set it in .env.local before running this script.`);
    process.exit(1);
  }
  return value;
}

function parseArg(flag: string): string | undefined {
  const prefix = `--${flag}=`;
  const arg = process.argv.find((a) => a.startsWith(prefix));
  return arg?.slice(prefix.length);
}

// Duplicated from lib/auth/password-hash.ts rather than imported: that
// module is guarded with `import "server-only"`, meant only for Next.js's
// server bundle — importing it from a plain tsx script is untested and
// not worth the risk for 6 lines of scrypt.
function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

async function main() {
  const email = parseArg("email");
  const password = parseArg("password");

  if (!email || !password) {
    console.error("Usage: npm run superadmin:create -- --email=you@example.com --password=a-strong-password");
    process.exit(1);
  }
  if (password.length < 12) {
    console.error("Password must be at least 12 characters — this account has platform-wide access.");
    process.exit(1);
  }

  const supabase = createClient(
    requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
    requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
  );

  const { data, error } = await supabase
    .from("super_admin_users")
    .insert({ email: email.toLowerCase().trim(), password_hash: hashPassword(password) })
    .select("id, email")
    .single();

  if (error) {
    if (error.code === "23505") {
      console.error(`A super admin with email "${email}" already exists.`);
    } else {
      console.error(error.message);
    }
    process.exit(1);
  }

  console.log(`✓ Super admin created: ${data.email} (${data.id})`);
  console.log(`  Log in at /acceder`);
}

main();
