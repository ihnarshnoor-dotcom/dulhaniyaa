"use client";

import { useId, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { errorId, inputClass } from "@/components/auth/Field";
import { buttonClasses } from "@/components/ui/Button";
import { bucketSchema, type BucketValues } from "@/lib/bucketSchema";
import { createBucket, friendlyMessage, type Bucket } from "@/lib/photosApi";

type Props = {
  /** Save this photo into the new bucket in the same step. */
  imageId?: string;
  onCreated: (bucket: Bucket) => void;
  label?: string;
  autoFocus?: boolean;
};

/** One-field form that creates a bucket. */
export function NewBucketForm({ imageId, onCreated, label = "New collection", autoFocus = false }: Props) {
  const id = useId();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<BucketValues>({ resolver: zodResolver(bucketSchema), defaultValues: { name: "" } });

  async function onSubmit({ name }: BucketValues) {
    setServerError(null);
    try {
      const bucket = await createBucket(name, imageId);
      reset({ name: "" });
      onCreated({ id: bucket.id, name: bucket.name });
    } catch (err) {
      setServerError(friendlyMessage(err));
    }
  }

  const error = errors.name?.message ?? serverError;

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <label htmlFor={id} className="mb-2 block text-sm font-medium text-ink">
        {label}
      </label>
      <div className="flex gap-2">
        <input
          id={id}
          autoComplete="off"
          autoFocus={autoFocus}
          placeholder="e.g. Mehendi looks"
          maxLength={60}
          className={inputClass}
          aria-invalid={!!error}
          aria-describedby={error ? errorId(id) : undefined}
          {...register("name")}
        />
        <button type="submit" disabled={isSubmitting} className={buttonClasses("primary", "shrink-0 px-5 disabled:opacity-60")}>
          {isSubmitting ? "Creating…" : imageId ? "Create & add" : "Create"}
        </button>
      </div>
      {error && (
        <p id={errorId(id)} role="alert" className="mt-1.5 text-sm text-red-700">
          {error}
        </p>
      )}
    </form>
  );
}
