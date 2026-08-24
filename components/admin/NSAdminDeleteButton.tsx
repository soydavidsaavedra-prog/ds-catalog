"use client";

export function NSAdminDeleteButton({
  action,
  confirmMessage,
  label = "Eliminar",
}: {
  action: () => Promise<void>;
  confirmMessage: string;
  label?: string;
}) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!window.confirm(confirmMessage)) e.preventDefault();
      }}
    >
      <button type="submit" className="text-xs font-semibold uppercase text-muted-foreground hover:text-danger">
        {label}
      </button>
    </form>
  );
}
