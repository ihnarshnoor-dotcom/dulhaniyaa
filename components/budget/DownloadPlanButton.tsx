"use client";

import { useState } from "react";
import { Download, LoaderCircle } from "lucide-react";
import type { Basics, Plan } from "@/lib/facilitator";
import { buttonClasses } from "@/components/ui/Button";

type Props = { plan: Plan; basics: Basics; customerName?: string };

/** Builds the plan as a PDF in the browser and downloads it. The PDF library loads only on click. */
export function DownloadPlanButton({ plan, basics, customerName }: Props) {
  const [state, setState] = useState<"idle" | "working" | "failed">("idle");

  async function download() {
    if (state === "working") return;
    setState("working");
    try {
      const [{ pdf }, { PlanPdf }] = await Promise.all([import("@react-pdf/renderer"), import("./PlanPdf")]);
      const blob = await pdf(
        <PlanPdf plan={plan} basics={basics} customerName={customerName} createdOn={new Date()} />,
      ).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Dulhaniyaa-Wedding-Plan${customerName ? `-${customerName.trim().replace(/[^\p{L}\p{N}]+/gu, "-")}` : ""}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 10_000);
      setState("idle");
    } catch (err) {
      console.error("[PDF] Could not create the plan PDF:", err);
      setState("failed");
    }
  }

  return (
    <div className="flex flex-col items-center">
      <button
        type="button"
        onClick={download}
        disabled={state === "working"}
        className={buttonClasses("secondary", "disabled:opacity-60")}
      >
        {state === "working" ? (
          <LoaderCircle className="size-4 animate-spin" strokeWidth={2} aria-hidden />
        ) : (
          <Download className="size-4" strokeWidth={2} aria-hidden />
        )}
        {state === "working" ? "Preparing PDF…" : "Download plan (PDF)"}
      </button>
      {state === "failed" && (
        <p role="alert" className="mt-2 text-xs text-primary">
          Couldn&apos;t create the PDF. Please try again.
        </p>
      )}
    </div>
  );
}
