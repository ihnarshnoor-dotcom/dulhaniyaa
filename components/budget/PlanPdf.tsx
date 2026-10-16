import { Document, Font, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { business } from "@/data/site";
import { inrRange } from "@/lib/budget";
import { itemRefName, type Basics, type Plan } from "@/lib/facilitator";

// Fonts live in /public/fonts. Both include the ₹ sign, which the built-in PDF fonts lack.
const origin = typeof window === "undefined" ? "" : window.location.origin;
Font.register({
  family: "Inter",
  fonts: [
    { src: `${origin}/fonts/Inter-Regular.ttf`, fontWeight: 400 },
    { src: `${origin}/fonts/Inter-SemiBold.ttf`, fontWeight: 600 },
  ],
});
Font.register({
  family: "Cormorant",
  fonts: [
    { src: `${origin}/fonts/CormorantGaramond-Medium.ttf`, fontWeight: 500 },
    { src: `${origin}/fonts/CormorantGaramond-SemiBold.ttf`, fontWeight: 600 },
  ],
});
// Keep words whole instead of hyphenating them.
Font.registerHyphenationCallback((word) => [word]);

const color = {
  primary: "#a52a2a",
  primaryDark: "#861f1f",
  blush: "#edd4d4",
  ivory: "#fef9f3",
  card: "#fffdfa",
  ink: "#2b1d1a",
  muted: "#6e5f58",
  line: "#eadfd6",
};

const s = StyleSheet.create({
  page: {
    backgroundColor: color.ivory,
    paddingTop: 44,
    paddingBottom: 64,
    paddingHorizontal: 44,
    fontFamily: "Inter",
    fontSize: 9.5,
    color: color.ink,
  },
  brandRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  brand: {
    fontFamily: "Cormorant",
    fontWeight: 600,
    fontSize: 26,
    lineHeight: 1.15,
    color: color.primary,
  },
  overline: {
    fontSize: 7.5,
    lineHeight: 1.2,
    letterSpacing: 1.6,
    color: color.primary,
    textTransform: "uppercase",
    marginTop: 4,
  },
  // Line height is set per text, never on the page: on the page it hides the page numbers.
  para: { fontSize: 9.5, lineHeight: "13.5pt" },
  muted: { color: color.muted, fontSize: 9.5, lineHeight: "13.5pt" },
  rule: { height: 1, backgroundColor: color.line, marginVertical: 14 },
  title: {
    fontFamily: "Cormorant",
    fontWeight: 600,
    fontSize: 24,
    lineHeight: 1.2,
    marginTop: 4,
  },
  facts: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 12,
    marginHorizontal: -4,
  },
  fact: {
    backgroundColor: color.card,
    borderWidth: 1,
    borderColor: color.line,
    borderRadius: 8,
    paddingVertical: 7,
    paddingHorizontal: 10,
    margin: 4,
    minWidth: 92,
  },
  factLabel: {
    fontSize: 7,
    letterSpacing: 1,
    textTransform: "uppercase",
    color: color.muted,
  },
  factValue: { fontWeight: 600, marginTop: 2 },
  total: {
    backgroundColor: color.ink,
    borderRadius: 12,
    padding: 20,
    marginTop: 16,
    alignItems: "center",
  },
  totalLabel: { color: "#d9cfc9", fontSize: 8.5 },
  totalValue: {
    fontFamily: "Cormorant",
    fontWeight: 600,
    fontSize: 30,
    lineHeight: 1.25,
    color: "#ffffff",
    marginTop: 4,
  },
  section: { marginTop: 22 },
  h2: {
    fontFamily: "Cormorant",
    fontWeight: 600,
    fontSize: 18,
    lineHeight: 1.25,
    color: color.ink,
    marginBottom: 8,
  },
  h3: {
    fontFamily: "Cormorant",
    fontWeight: 600,
    fontSize: 14,
    lineHeight: 1.3,
  },
  box: {
    backgroundColor: color.card,
    borderWidth: 1,
    borderColor: color.line,
    borderRadius: 10,
    padding: 12,
  },
  bulletRow: { flexDirection: "row", marginTop: 3 },
  bullet: { width: 12, color: color.primary },
  grid2: { flexDirection: "row", flexWrap: "wrap", marginHorizontal: -5 },
  col2: { width: "50%", paddingHorizontal: 5, marginBottom: 10 },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: color.line,
  },
  itemName: { flex: 1, paddingRight: 8 },
  itemPrice: { color: color.muted, textAlign: "right" },
  subtotal: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
    fontWeight: 600,
  },
  luxury: { fontSize: 7, color: "#92400e" },
  timelineRow: {
    flexDirection: "row",
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: color.line,
  },
  when: { width: 110, fontWeight: 600, color: color.primary, fontSize: 8.5 },
  footerRule: {
    position: "absolute",
    bottom: 40,
    left: 44,
    right: 44,
    height: 1,
    backgroundColor: color.line,
  },
  footerText: {
    position: "absolute",
    bottom: 24,
    left: 44,
    right: 110,
    fontSize: 7.5,
    color: color.muted,
  },
  pageNumber: {
    position: "absolute",
    bottom: 24,
    left: 44,
    right: 44,
    fontSize: 7.5,
    color: color.muted,
    textAlign: "right",
  },
});

const budgetLabels = {
  within: "Within your budget",
  under: "Under your budget",
  over: "Over your budget",
  unknown: "Budget check",
};

function Bullets({ items, mark = "•" }: { items: string[]; mark?: string }) {
  return (
    <View>
      {items.map((text, i) => (
        <View key={i} style={s.bulletRow} wrap={false}>
          <Text style={s.bullet}>{mark}</Text>
          <Text style={[s.para, { flex: 1 }]}>{text}</Text>
        </View>
      ))}
    </View>
  );
}

type Props = {
  plan: Plan;
  basics: Basics;
  customerName?: string;
  createdOn: Date;
};

export function PlanPdf({ plan, basics, customerName, createdOn }: Props) {
  const total = inrRange(plan.total_min, plan.total_max);
  const onRequest = plan.on_request ?? [];
  const trims = plan.budget_check?.trim_suggestions?.filter(Boolean) ?? [];
  const disclaimer = plan.disclaimer || "Personalised plan and estimate. Final quote confirmed by our planner.";
  const facts = [
    ["Events", basics.events.join(", ")],
    ["City", basics.city],
    ["Guests", basics.guestCount.toLocaleString("en-IN")],
    ["Budget", basics.budget],
    ["Wedding", basics.date],
  ].filter((f): f is [string, string] => Boolean(f[1]));

  return (
    <Document
      title={`${business.name} wedding plan${customerName ? ` for ${customerName}` : ""}`}
      author={business.name}
      subject="Personalised wedding plan and estimate"
    >
      <Page size="A4" style={s.page}>
        {/* Footer on every page */}
        <View style={s.footerRule} fixed />
        <Text style={s.footerText} fixed>
          {business.name} · {disclaimer}
        </Text>
        <Text
          style={s.pageNumber}
          fixed
          render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
        />

        {/* Letterhead */}
        <View style={s.brandRow}>
          <View>
            <Text style={s.brand}>{business.name}</Text>
            <Text style={s.overline}>Personalised wedding plan & estimate</Text>
          </View>
          <Text style={[s.muted, { fontSize: 8 }]}>
            {createdOn.toLocaleDateString("en-IN", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </Text>
        </View>
        <View style={s.rule} />

        <Text style={s.title}>{customerName ? `Prepared for ${customerName}` : "Your wedding plan"}</Text>
        <View style={s.facts}>
          {facts.map(([label, value]) => (
            <View key={label} style={s.fact}>
              <Text style={s.factLabel}>{label}</Text>
              <Text style={s.factValue}>{value}</Text>
            </View>
          ))}
        </View>

        <View style={s.total} wrap={false}>
          <Text style={s.totalLabel}>Estimated total</Text>
          <Text style={s.totalValue}>{total ?? "To be confirmed"}</Text>
          {onRequest.length > 0 && (
            <Text style={[s.totalLabel, { marginTop: 4 }]}>
              + {onRequest.length} item{onRequest.length > 1 ? "s" : ""} priced on request
            </Text>
          )}
        </View>

        {plan.budget_check && (plan.budget_check.message || trims.length > 0) && (
          <View style={[s.box, { marginTop: 12 }]} wrap={false}>
            <Text style={s.h3}>{budgetLabels[plan.budget_check.status] ?? budgetLabels.unknown}</Text>
            {plan.budget_check.message && <Text style={[s.muted, { marginTop: 3 }]}>{plan.budget_check.message}</Text>}
            {trims.length > 0 && (
              <View style={{ marginTop: 6 }}>
                <Text style={{ fontWeight: 600 }}>Ways to trim</Text>
                <Bullets items={trims} mark="–" />
              </View>
            )}
          </View>
        )}

        {plan.summary && (
          <View style={s.section}>
            <Text style={s.h2}>The big picture</Text>
            <Text style={s.muted}>{plan.summary}</Text>
          </View>
        )}

        {plan.events && plan.events.length > 0 && (
          <View style={s.section}>
            {plan.events.map((ev, i) => (
              <View key={i} wrap={false}>
                {i === 0 && <Text style={s.h2}>Event by event</Text>}
                <View style={[s.box, { marginBottom: 8 }]}>
                  <Text style={s.h3}>{ev.name}</Text>
                  {ev.notes && <Text style={[s.muted, { marginTop: 2 }]}>{ev.notes}</Text>}
                  {ev.services && ev.services.length > 0 && (
                    <Text style={[s.para, { marginTop: 5, fontSize: 8.5, lineHeight: "12pt" }]}>
                      {ev.services.map(itemRefName).join("  ·  ")}
                    </Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}

        {plan.categories && plan.categories.length > 0 && (
          <View style={s.section}>
            <View style={s.grid2}>
              {plan.categories.map((cat, ci) => {
                const subtotal = inrRange(cat.subtotal_min, cat.subtotal_max);
                return (
                  <View key={ci} style={s.col2} wrap={false}>
                    {ci < 2 && <Text style={[s.h2, ci === 1 ? { color: color.ivory } : {}]}>Category breakdown</Text>}
                    <View style={s.box}>
                      <Text style={[s.h3, { marginBottom: 4 }]}>{cat.name}</Text>
                      {cat.items.map((item, ii) => (
                        <View key={ii} style={s.itemRow}>
                          <Text style={s.itemName}>
                            {item.name}
                            {item.level === "luxury" ? <Text style={s.luxury}>{"  LUXURY"}</Text> : null}
                          </Text>
                          <Text style={s.itemPrice}>{inrRange(item.est_min, item.est_max) ?? "On request"}</Text>
                        </View>
                      ))}
                      {subtotal && cat.subtotal_max ? (
                        <View style={s.subtotal}>
                          <Text>Subtotal</Text>
                          <Text style={{ color: color.primary }}>{subtotal}</Text>
                        </View>
                      ) : null}
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {onRequest.length > 0 && (
          <View style={s.section} wrap={false}>
            <Text style={s.h2}>Price on request</Text>
            <Text style={s.muted}>Our planner will get you a quote for: {onRequest.map(itemRefName).join(", ")}.</Text>
          </View>
        )}

        {plan.timeline && plan.timeline.length > 0 && (
          <View style={s.section}>
            {plan.timeline.map((t, i) => (
              <View key={i} wrap={false}>
                {i === 0 && <Text style={s.h2}>Your timeline</Text>}
                <View style={s.timelineRow}>
                  <Text style={s.when}>{t.when}</Text>
                  <Text style={[s.para, { flex: 1 }]}>{t.task}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {((plan.suggestions?.length ?? 0) > 0 || (plan.permissions_checklist?.length ?? 0) > 0) && (
          <View style={[s.section, s.grid2]}>
            {plan.suggestions && plan.suggestions.length > 0 && (
              <View style={s.col2} wrap={false}>
                <Text style={s.h2}>Ideas to consider</Text>
                <Bullets items={plan.suggestions} />
              </View>
            )}
            {plan.permissions_checklist && plan.permissions_checklist.length > 0 && (
              <View style={s.col2} wrap={false}>
                <Text style={s.h2}>Permissions checklist</Text>
                <Bullets items={plan.permissions_checklist} mark="✓" />
              </View>
            )}
          </View>
        )}

        {/* Next step */}
        <View
          style={[
            s.box,
            {
              marginTop: 18,
              backgroundColor: color.blush,
              borderColor: color.blush,
            },
          ]}
          wrap={false}
        >
          <Text style={[s.h3, { color: color.primaryDark }]}>Ready to make it real?</Text>
          <Text style={{ marginTop: 3, color: color.primaryDark }}>
            Call {business.phoneDisplay} · {business.email} · {business.url.replace(/^https?:\/\//, "")}
          </Text>
          <Text style={[s.muted, { marginTop: 4, fontSize: 8 }]}>{disclaimer}</Text>
        </View>
      </Page>
    </Document>
  );
}
