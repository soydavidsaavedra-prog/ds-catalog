import { NSMedia } from "@/components/ui/NSMedia";
import { NSReveal } from "@/components/ui/NSReveal";

export interface Theme02BrandStatementProps {
  titleLine1?: string;
  titleLine2?: string;
  description?: string;
  image?: string;
  brandName?: string;
}

/**
 * Theme 02's brand-statement split (image + text), reading the same
 * SiteSettings.statement* fields as Theme 01's NSBrandStatement — pulled
 * into its own file so the admin's editor (NSStatementEditorForm) can
 * preview Theme 02's actual layout instead of always showing Theme 01's.
 */
export function BrandStatement({ titleLine1, titleLine2, description, image, brandName }: Theme02BrandStatementProps) {
  return (
    <div className="mx-auto grid max-w-7xl gap-0 overflow-hidden sm:grid-cols-2">
      <NSReveal className="flex flex-col justify-center px-6 py-16 sm:px-10 lg:px-16">
        <p className="text-3xl font-extrabold leading-[1.05] tracking-tight text-foreground sm:text-5xl">
          {titleLine1}
          {titleLine2 ? (
            <>
              <br />
              <span className="text-accent">{titleLine2}</span>
            </>
          ) : null}
        </p>
        {description ? <p className="mt-5 max-w-sm text-sm leading-relaxed text-muted-foreground">{description}</p> : null}
      </NSReveal>
      <div className="relative aspect-square sm:aspect-auto">
        <NSMedia src={image} alt={titleLine1 || brandName || ""} className="h-full w-full" brandName={brandName} />
      </div>
    </div>
  );
}
