import { redirect } from "next/navigation";

/** Login is centralized now — see app/acceder. Kept as a redirect stub only so an old bookmarked link doesn't 404. */
export default function SuperadminLoginPage() {
  redirect("/acceder");
}
