import type { Availability } from "@/lib/types/catalog";
import { availabilityLabel } from "@/lib/utils/format";
import { NSBadge } from "@/components/ui/NSBadge";

const toneByAvailability: Record<Availability, "success" | "warning" | "danger"> = {
  in_stock: "success",
  low_stock: "warning",
  out_of_stock: "danger",
};

export function NSAvailabilityBadge({ availability }: { availability: Availability }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-foreground">
      <span
        className={
          "h-2 w-2 rounded-full " +
          (availability === "in_stock"
            ? "bg-success"
            : availability === "low_stock"
              ? "bg-warning"
              : "bg-danger")
        }
        aria-hidden
      />
      {availabilityLabel[availability]}
    </span>
  );
}

export function NSAvailabilityPill({ availability }: { availability: Availability }) {
  return <NSBadge tone={toneByAvailability[availability]}>{availabilityLabel[availability]}</NSBadge>;
}
