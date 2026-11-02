"use client";

import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";
import { isPhotogramUploader } from "@/lib/bulkUpload";

/** "Bulk upload" link, shown only to the Photogram account (NEXT_PUBLIC_PHOTOGRAM_UPLOADER_EMAIL). */
export function BulkUploadLink() {
  const { user } = useAuth();
  if (!isPhotogramUploader(user?.email)) return null;
  return (
    <p className="mb-6 text-right text-sm">
      <Link href="/account/upload/bulk" className="font-medium text-primary underline underline-offset-4">
        Bulk upload
      </Link>
    </p>
  );
}
