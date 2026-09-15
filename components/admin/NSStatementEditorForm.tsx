"use client";

import { useState } from "react";
import type { SiteSettings } from "@/lib/types/catalog";
import type { ThemeKey } from "@/lib/types/tenant";
import { NSLabel } from "@/components/ui/NSInput";
import { NSBrandStatement } from "@/components/storefront/themes/theme-01/NSBrandStatement";
import { BrandStatement as Theme02BrandStatement } from "@/components/storefront/themes/theme-02/BrandStatement";
import { NSTenantPreviewFrame } from "@/components/admin/design-studio/NSTenantPreviewFrame";
import { NSStatementFieldsEditor, type StatementDraft } from "@/components/admin/design-studio/NSStatementFieldsEditor";

export function NSStatementEditorForm({
  tenantId,
  tenantSlug,
  theme,
  settings,
}: {
  tenantId: string;
  tenantSlug: string;
  /** Which Theme actually renders this tenant's storefront — the preview below must match it, not always show Theme 01. */
  theme: ThemeKey;
  settings: SiteSettings;
}) {
  const [draft, setDraft] = useState<StatementDraft>({
    titleLine1: settings.statementTitleLine1,
    titleLine2: settings.statementTitleLine2,
    description: settings.statementDescription,
    image: settings.statementImage,
  });

  return (
    <div className="flex flex-col gap-6 xl:flex-row xl:items-start">
      <div className="w-full xl:max-w-md">
        <NSStatementFieldsEditor tenantId={tenantId} tenantSlug={tenantSlug} draft={draft} setDraft={setDraft} />
      </div>

      <div className="w-full xl:flex-1">
        <NSLabel>Vista previa en vivo</NSLabel>
        <NSTenantPreviewFrame theme={theme} settings={settings} mode="compact" naturalHeight={420} scale={0.4}>
          {theme === "theme-02" ? (
            <Theme02BrandStatement
              titleLine1={draft.titleLine1}
              titleLine2={draft.titleLine2}
              description={draft.description}
              image={draft.image}
              brandName={settings.brandName}
            />
          ) : (
            <NSBrandStatement
              titleLine1={draft.titleLine1}
              titleLine2={draft.titleLine2}
              description={draft.description}
              image={draft.image}
              brandName={settings.brandName}
            />
          )}
        </NSTenantPreviewFrame>
      </div>
    </div>
  );
}
