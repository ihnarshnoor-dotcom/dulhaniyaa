"use client";

import { useId, useMemo, useState, type ReactNode } from "react";
import { ChevronDown, Search, SlidersHorizontal, X } from "lucide-react";
import {
  venueAmenities,
  venueCities,
  venueTypes,
  venues,
  type Venue,
  type VenueAmenity,
  type VenueType,
} from "@/data/venues";
import { buttonClasses } from "@/components/ui/Button";
import { SortMenu } from "./SortMenu";
import { VenueCard } from "./VenueCard";

/* ───────────── Filter options ───────────── */
// Edit these to change the ranges visitors can pick.

const guestRanges = [
  { id: "g1", label: "Up to 200", min: 0, max: 200 },
  { id: "g2", label: "200 – 500", min: 200, max: 500 },
  { id: "g3", label: "500 – 1,000", min: 500, max: 1000 },
  { id: "g4", label: "1,000+", min: 1000, max: Infinity },
];

const priceRanges = [
  { id: "p1", label: "Under ₹1,500", min: 0, max: 1499 },
  { id: "p2", label: "₹1,500 – 2,500", min: 1500, max: 2500 },
  { id: "p3", label: "₹2,500 – 4,000", min: 2501, max: 4000 },
  { id: "p4", label: "₹4,000+", min: 4001, max: Infinity },
];

const ratingOptions = [4, 4.5];
const settingOptions = ["Indoor", "Outdoor"] as const;

const sorts = {
  popular: { label: "Most popular", fn: (a: Venue, b: Venue) => Number(!!b.popular) - Number(!!a.popular) || b.reviews - a.reviews },
  rating: { label: "Top rated", fn: (a: Venue, b: Venue) => b.rating - a.rating },
  "price-asc": { label: "Price: low to high", fn: (a: Venue, b: Venue) => a.vegPrice - b.vegPrice },
  "price-desc": { label: "Price: high to low", fn: (a: Venue, b: Venue) => b.vegPrice - a.vegPrice },
  capacity: { label: "Biggest capacity", fn: (a: Venue, b: Venue) => b.capacity.max - a.capacity.max },
};
type SortId = keyof typeof sorts;

type Filters = {
  query: string;
  city: string;
  types: VenueType[];
  guests: string;
  price: string;
  setting: string;
  rating: number;
  amenities: VenueAmenity[];
};

const empty: Filters = { query: "", city: "", types: [], guests: "", price: "", setting: "", rating: 0, amenities: [] };

function matches(v: Venue, f: Filters) {
  const q = f.query.trim().toLowerCase();
  if (q && ![v.name, v.area, v.city, v.type].some((s) => s.toLowerCase().includes(q))) return false;
  if (f.city && v.city !== f.city) return false;
  if (f.types.length && !f.types.includes(v.type)) return false;
  const g = guestRanges.find((r) => r.id === f.guests);
  if (g && (v.capacity.max < g.min || v.capacity.min > g.max)) return false;
  const p = priceRanges.find((r) => r.id === f.price);
  if (p && (v.vegPrice < p.min || v.vegPrice > p.max)) return false;
  if (f.setting && !v.setting.includes(f.setting)) return false;
  if (f.rating && v.rating < f.rating) return false;
  if (f.amenities.some((a) => !v.amenities.includes(a))) return false;
  return true;
}

const toggle = <T,>(list: T[], item: T) => (list.includes(item) ? list.filter((x) => x !== item) : [...list, item]);

/* ───────────── Small pieces ───────────── */

/** A filter section that folds away. The header shows how many of its filters are on. */
function FilterGroup({
  title,
  count = 0,
  defaultOpen = false,
  children,
}: {
  title: string;
  count?: number;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const id = useId();
  return (
    <section className="border-b border-ink/10 last:border-0">
      <h3>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls={id}
          className="flex w-full items-center gap-2 py-3.5 text-left text-sm font-medium text-ink hover:text-primary"
        >
          {title}
          {count > 0 && (
            <span className="grid min-w-5 place-items-center rounded-full bg-primary px-1.5 text-[11px] leading-5 text-white">{count}</span>
          )}
          <ChevronDown
            className={`ml-auto size-4 text-muted transition-transform duration-200 ${open ? "rotate-180" : ""}`}
            strokeWidth={1.75}
            aria-hidden
          />
        </button>
      </h3>
      <div id={id} hidden={!open} className="pb-4">
        {children}
      </div>
    </section>
  );
}

/** Shows the first `limit` children, with a link to reveal the rest. */
function ShowMore({ items, limit, children }: { items: ReactNode[]; limit: number; children?: (shown: ReactNode[]) => ReactNode }) {
  const [all, setAll] = useState(false);
  const shown = all ? items : items.slice(0, limit);
  return (
    <>
      {children ? children(shown) : shown}
      {items.length > limit && (
        <button type="button" onClick={() => setAll((a) => !a)} className="mt-2 text-xs font-medium text-primary hover:underline">
          {all ? "Show less" : `Show all ${items.length}`}
        </button>
      )}
    </>
  );
}

function Pill({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`rounded-full border px-3 py-1 text-[13px] transition ${
        selected ? "border-primary bg-primary text-white" : "border-ink/12 bg-white/70 text-ink hover:border-primary/50 hover:text-primary"
      }`}
    >
      {children}
    </button>
  );
}

function Check({ checked, onChange, children }: { checked: boolean; onChange: () => void; children: ReactNode }) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 rounded-lg py-1.5 text-sm text-ink/90 hover:text-primary">
      <input type="checkbox" checked={checked} onChange={onChange} className="size-4 shrink-0 accent-primary" />
      {children}
    </label>
  );
}

/* ───────────── The listing ───────────── */

export function VenueListing() {
  const [filters, setFilters] = useState<Filters>(empty);
  const [sort, setSort] = useState<SortId>("popular");
  const [panelOpen, setPanelOpen] = useState(false);
  const set = (patch: Partial<Filters>) => setFilters((f) => ({ ...f, ...patch }));

  const results = useMemo(() => venues.filter((v) => matches(v, filters)).sort(sorts[sort].fn), [filters, sort]);

  // Chips above the results, one per active filter, each removable on its own.
  const active: { label: string; clear: () => void }[] = [
    filters.query.trim() && { label: `“${filters.query.trim()}”`, clear: () => set({ query: "" }) },
    filters.city && { label: filters.city, clear: () => set({ city: "" }) },
    ...filters.types.map((t) => ({ label: t, clear: () => set({ types: filters.types.filter((x) => x !== t) }) })),
    filters.guests && { label: `${guestRanges.find((r) => r.id === filters.guests)?.label} guests`, clear: () => set({ guests: "" }) },
    filters.price && { label: `${priceRanges.find((r) => r.id === filters.price)?.label} / plate`, clear: () => set({ price: "" }) },
    filters.setting && { label: filters.setting, clear: () => set({ setting: "" }) },
    filters.rating && { label: `${filters.rating}+ rating`, clear: () => set({ rating: 0 }) },
    ...filters.amenities.map((a) => ({ label: a, clear: () => set({ amenities: filters.amenities.filter((x) => x !== a) }) })),
  ].filter((x): x is { label: string; clear: () => void } => !!x);

  const pills = (children: ReactNode) => <div className="flex flex-wrap gap-1.5">{children}</div>;

  const panel = (
    <div>
      <FilterGroup title="City" count={filters.city ? 1 : 0} defaultOpen>
        <ShowMore
          limit={5}
          items={venueCities.map((c) => (
            <Pill key={c} selected={filters.city === c} onClick={() => set({ city: filters.city === c ? "" : c })}>
              {c}
            </Pill>
          ))}
        >
          {(shown) => pills(shown)}
        </ShowMore>
      </FilterGroup>

      <FilterGroup title="Venue type" count={filters.types.length} defaultOpen>
        {venueTypes.map((t) => (
          <Check key={t} checked={filters.types.includes(t)} onChange={() => set({ types: toggle(filters.types, t) })}>
            {t}
            <span className="ml-auto text-xs text-muted">{venues.filter((v) => v.type === t).length}</span>
          </Check>
        ))}
      </FilterGroup>

      <FilterGroup title="Guests" count={filters.guests ? 1 : 0} defaultOpen>
        {pills(
          guestRanges.map((r) => (
            <Pill key={r.id} selected={filters.guests === r.id} onClick={() => set({ guests: filters.guests === r.id ? "" : r.id })}>
              {r.label}
            </Pill>
          )),
        )}
      </FilterGroup>

      <FilterGroup title="Veg price per plate" count={filters.price ? 1 : 0} defaultOpen>
        {pills(
          priceRanges.map((r) => (
            <Pill key={r.id} selected={filters.price === r.id} onClick={() => set({ price: filters.price === r.id ? "" : r.id })}>
              {r.label}
            </Pill>
          )),
        )}
      </FilterGroup>

      <FilterGroup title="Indoor / outdoor" count={filters.setting ? 1 : 0}>
        {pills(
          settingOptions.map((s) => (
            <Pill key={s} selected={filters.setting === s} onClick={() => set({ setting: filters.setting === s ? "" : s })}>
              {s}
            </Pill>
          )),
        )}
      </FilterGroup>

      <FilterGroup title="Rating" count={filters.rating ? 1 : 0}>
        {pills(
          ratingOptions.map((r) => (
            <Pill key={r} selected={filters.rating === r} onClick={() => set({ rating: filters.rating === r ? 0 : r })}>
              ★ {r}+
            </Pill>
          )),
        )}
      </FilterGroup>

      <FilterGroup title="Amenities" count={filters.amenities.length}>
        <ShowMore
          limit={5}
          items={venueAmenities.map((a) => (
            <Check key={a} checked={filters.amenities.includes(a)} onChange={() => set({ amenities: toggle(filters.amenities, a) })}>
              {a}
            </Check>
          ))}
        />
      </FilterGroup>
    </div>
  );

  return (
    <div>
      {/* Search + sort */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <label className="relative flex-1">
          <span className="sr-only">Search venues</span>
          <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted" aria-hidden />
          <input
            type="search"
            value={filters.query}
            onChange={(e) => set({ query: e.target.value })}
            placeholder="Search by venue name or area"
            className="min-h-12 w-full rounded-full border border-ink/15 bg-white/80 pr-5 pl-11 outline-none focus:border-primary"
          />
        </label>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setPanelOpen(true)}
            className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full border border-ink/15 bg-white/80 px-5 text-sm lg:hidden"
          >
            <SlidersHorizontal className="size-4" aria-hidden />
            Filters
            {active.length > 0 && (
              <span className="grid min-w-5 place-items-center rounded-full bg-primary px-1.5 text-xs text-white">{active.length}</span>
            )}
          </button>
          <SortMenu
            value={sort}
            options={(Object.keys(sorts) as SortId[]).map((id) => ({ id, label: sorts[id].label }))}
            onChange={setSort}
          />
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[272px_1fr]">
        {/* Desktop filters */}
        <aside aria-label="Filters" className="hidden lg:block">
          <div className="sticky top-28 max-h-[calc(100vh-8rem)] overflow-y-auto rounded-3xl border border-ink/10 bg-white/60 px-5 pt-4 pb-2 backdrop-blur-sm">
            <div className="flex items-center justify-between border-b border-ink/10 pb-3">
              <h2 className="font-serif text-2xl">Filters</h2>
              {active.length > 0 && (
                <button type="button" onClick={() => setFilters(empty)} className="text-sm font-medium text-primary">
                  Clear all
                </button>
              )}
            </div>
            {panel}
          </div>
        </aside>

        {/* Results */}
        <div>
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <p className="mr-2 text-sm text-muted" aria-live="polite">
              <span className="font-medium text-ink">{results.length}</span> venue{results.length === 1 ? "" : "s"}
            </p>
            {active.map((a) => (
              <button
                key={a.label}
                type="button"
                onClick={a.clear}
                className="inline-flex items-center gap-1 rounded-full bg-secondary/70 px-3 py-1 text-xs text-primary-dark hover:bg-secondary"
              >
                {a.label}
                <X className="size-3" aria-label="Remove" />
              </button>
            ))}
          </div>

          {results.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {results.map((v) => (
                <VenueCard key={v.slug} venue={v} />
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-ink/20 bg-white/50 p-10 text-center">
              <p className="font-serif text-2xl">No venues match all of that</p>
              <p className="mt-2 text-sm text-muted">Try removing a filter or two.</p>
              <button type="button" onClick={() => setFilters(empty)} className={buttonClasses("primary", "mt-5")}>
                Clear filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile filter sheet */}
      {panelOpen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-ivory lg:hidden" role="dialog" aria-modal="true" aria-label="Filters">
          <div className="flex items-center justify-between border-b border-ink/10 px-5 py-4">
            <h2 className="font-serif text-2xl">Filters</h2>
            <button type="button" onClick={() => setPanelOpen(false)} aria-label="Close filters" className="grid size-10 place-items-center rounded-full">
              <X className="size-5" aria-hidden />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-5 py-5">{panel}</div>
          <div className="flex gap-3 border-t border-ink/10 px-5 py-4">
            <button type="button" onClick={() => setFilters(empty)} className={buttonClasses("secondary", "flex-1")}>
              Clear all
            </button>
            <button type="button" onClick={() => setPanelOpen(false)} className={buttonClasses("primary", "flex-1")}>
              Show {results.length} venue{results.length === 1 ? "" : "s"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
