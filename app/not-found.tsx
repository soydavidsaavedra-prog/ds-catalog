import Link from "next/link";
import { NSLogo } from "@/components/brand/NSLogo";
import { NSNotFound } from "@/components/ui/NSNotFound";

export default function RootNotFound() {
  return (
    <div className="flex min-h-dvh flex-col">
      <div className="flex h-16 items-center px-4 sm:px-6 lg:px-8">
        <Link href="/" aria-label="Inicio">
          <NSLogo id="ns-404" variant="mark" className="h-10 w-10" />
        </Link>
      </div>
      <div className="flex-1">
        <NSNotFound />
      </div>
    </div>
  );
}
