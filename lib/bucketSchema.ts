import { z } from "zod";

export const bucketSchema = z.object({
  name: z.string().trim().min(1, "Give your collection a name").max(60, "Please keep the name under 60 characters"),
});

export type BucketValues = z.infer<typeof bucketSchema>;
