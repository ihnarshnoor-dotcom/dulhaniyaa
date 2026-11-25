import { Castle, Hotel, Landmark, Tent, TreePalm, Trees, type LucideIcon } from "lucide-react";
import type { VenueType } from "@/data/venues";

// Icons come from lucide.dev; swap any for another lucide icon by name.
export const venueIcons: Record<VenueType, LucideIcon> = {
  "Banquet hall": Landmark,
  Farmhouse: Trees,
  Hotel: Hotel,
  Lawn: Tent,
  Resort: TreePalm,
  Palace: Castle,
};

/** Placeholder art until venue photos arrive: a big icon for the venue type on a soft gradient. */
export function VenuePlaceholder({
  type,
  className = "",
  size = "md",
}: {
  type: VenueType;
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const Icon = venueIcons[type];
  const iconSize = size === "lg" ? "size-28 sm:size-36" : size === "sm" ? "size-10" : "size-16";
  return (
    <div
      aria-hidden
      className={`grid place-items-center bg-linear-to-br from-secondary via-ivory to-secondary/60 text-primary/70 ${className}`}
    >
      <Icon className={iconSize} strokeWidth={1.1} />
    </div>
  );
}
