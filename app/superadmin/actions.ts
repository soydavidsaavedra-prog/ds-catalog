"use server";

import { redirect } from "next/navigation";
import {
  createSuperadminSession,
  destroySuperadminSession,
  verifySuperadminCredentials,
} from "@/lib/auth/superadmin-auth";

export type SuperadminActionState = { error?: string };

export async function superadminLoginAction(
  _prev: SuperadminActionState,
  formData: FormData,
): Promise<SuperadminActionState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const user = await verifySuperadminCredentials(email, password);
  if (!user) {
    return { error: "Correo o contraseña incorrectos." };
  }

  await createSuperadminSession(user.id);
  redirect("/superadmin");
}

export async function superadminLogoutAction(): Promise<void> {
  await destroySuperadminSession();
  redirect("/superadmin/login");
}
