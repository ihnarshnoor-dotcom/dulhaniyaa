import { z } from "zod";
import { isPhotoCategory } from "./photoCategories";

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
export const MAX_TAGS = 10;
const MAX_TAG_LENGTH = 30;

const acceptedTypes = ["image/jpeg", "image/png", "image/webp"];
const acceptedExtensions = /\.(?:jpe?g|png|webp)$/i;

/** Value for the file input's `accept` attribute. */
export const acceptAttribute = ".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp";

type FileLike = { name: string; size: number; type: string };

/** Returns an error message for a file the photos API won't take, or null if it's fine. */
export function imageFileError(file: FileLike): string | null {
  // Some systems leave `type` empty, so fall back to the extension.
  const typeOk = file.type ? acceptedTypes.includes(file.type) : acceptedExtensions.test(file.name);
  if (!typeOk) return "Please choose a JPG, PNG or WebP photo.";
  if (file.size > MAX_UPLOAD_BYTES) return "That photo is over 10 MB. Please choose a smaller one.";
  if (file.size === 0) return "That file is empty. Please choose another photo.";
  return null;
}

/** Lowercase, trimmed, single-spaced, without commas. */
export const normalizeTag = (raw: string) =>
  raw.replace(/,/g, " ").trim().replace(/\s+/g, " ").toLowerCase().slice(0, MAX_TAG_LENGTH);

/** Adds one or more comma-separated tags, skipping blanks and duplicates, up to MAX_TAGS. */
export function addTags(existing: string[], raw: string): string[] {
  const next = [...existing];
  for (const part of raw.split(",")) {
    const tag = normalizeTag(part);
    if (tag && !next.includes(tag) && next.length < MAX_TAGS) next.push(tag);
  }
  return next;
}

export const uploadSchema = z.object({
  file: z
    .custom<File | null>((v) => typeof File !== "undefined" && v instanceof File, "Choose a photo to upload")
    .superRefine((file, ctx) => {
      const error = file && imageFileError(file);
      if (error) ctx.addIssue({ code: "custom", message: error });
    }),
  // Explicit boolean return: a type-guard here would make the form type reject the empty "Choose…" value.
  category: z.string().refine((v): boolean => isPhotoCategory(v), "Choose a category"),
  tags: z
    .array(z.string())
    .min(1, "Add at least one tag")
    .max(MAX_TAGS, `Use up to ${MAX_TAGS} tags`),
  title: z.string().trim().max(120, "Please keep the title under 120 characters"),
  caption: z.string().trim().max(1000, "Please keep the caption under 1000 characters"),
  visibility: z.enum(["public", "private"]),
});

export type UploadValues = z.infer<typeof uploadSchema>;
