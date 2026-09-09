/**
 * Renders free-text legal content (Términos, Privacidad) as paragraphs —
 * splits on blank lines, so a business owner pasting plain text from a
 * Word doc or email gets readable spacing without needing to write any
 * markup. Deliberately plain text only (no markdown/HTML parsing): this
 * is user-supplied legal text, and rendering it as raw HTML would be an
 * XSS risk for zero benefit here.
 */
export function DSLegalContent({ title, content, updatedAt }: { title: string; content: string; updatedAt?: string }) {
  const paragraphs = content
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl uppercase tracking-wide">{title}</h1>
      {updatedAt ? (
        <p className="mt-2 text-xs uppercase tracking-wide text-muted-foreground">
          Última actualización: {new Date(updatedAt).toLocaleDateString("es")}
        </p>
      ) : null}
      <div className="mt-8 flex flex-col gap-4 text-sm leading-relaxed text-foreground">
        {paragraphs.map((p, i) => (
          <p key={i} className="whitespace-pre-line">
            {p}
          </p>
        ))}
      </div>
    </article>
  );
}
