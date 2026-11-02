import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BulkUploadGate } from "@/components/account/BulkUpload";
import { PHOTOGRAM_UPLOADER_EMAIL } from "@/lib/bulkUpload";
import { isPhotosApiEnabled } from "@/lib/photosApi";

// Not linked from any menu, footer or the sitemap. Only the Photogram account sees it (see BulkUploadGate).
export const metadata: Metadata = {
  title: "Upload photos",
  robots: { index: false, follow: false },
};

export default function BulkUploadPage() {
  if (!isPhotosApiEnabled || !PHOTOGRAM_UPLOADER_EMAIL) notFound();
  return <BulkUploadGate />;
}
