"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type DragEvent, type KeyboardEvent } from "react";
import { useForm, useWatch, type FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { errorId, Field, FormAlert, inputClass } from "@/components/auth/Field";
import { buttonClasses } from "@/components/ui/Button";
import { CheckIcon, CloseIcon } from "@/components/ui/Icons";
import { categoryLabel, photoCategories, suggestedTags } from "@/lib/photoCategories";
import { friendlyMessage, photoAlt, uploadImage, type OwnPhoto } from "@/lib/photosApi";
import { acceptAttribute, addTags, imageFileError, MAX_TAGS, uploadSchema, type UploadValues } from "@/lib/uploadSchema";

const defaultValues: UploadValues = { file: null, category: "", tags: [], title: "", caption: "", visibility: "public" };

// Order used to move focus to the first invalid field.
const fieldOrder = ["file", "category", "tags", "title", "caption"] as const;

export function UploadForm() {
  const [uploaded, setUploaded] = useState<OwnPhoto | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [tagDraft, setTagDraft] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);
  const tagInput = useRef<HTMLInputElement>(null);
  const alertRef = useRef<HTMLDivElement>(null);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    setError,
    setFocus,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UploadValues>({
    resolver: zodResolver(uploadSchema),
    defaultValues,
    shouldFocusError: false,
  });

  const file = useWatch({ control, name: "file" });
  const tags = useWatch({ control, name: "tags" });

  useEffect(() => {
    if (serverError) alertRef.current?.focus();
  }, [serverError]);

  function showPreview(url: string | null) {
    if (preview) URL.revokeObjectURL(preview);
    setPreview(url);
  }

  function pickFile(picked: File | undefined) {
    if (!picked) return;
    const error = imageFileError(picked);
    if (error) {
      setValue("file", null);
      showPreview(null);
      setError("file", { message: error });
      return;
    }
    setValue("file", picked, { shouldValidate: true });
    showPreview(URL.createObjectURL(picked));
  }

  function removeFile() {
    setValue("file", null);
    showPreview(null);
    if (fileInput.current) fileInput.current.value = "";
  }

  function onDrop(e: DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    setDragging(false);
    pickFile(e.dataTransfer.files[0]);
  }

  function setTags(next: string[]) {
    setValue("tags", next, { shouldValidate: next.length > 0 || !!errors.tags });
  }

  function commitDraft(text = tagDraft) {
    if (text.trim()) setTags(addTags(tags, text));
    setTagDraft("");
  }

  function onTagKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      commitDraft();
    } else if (e.key === "Backspace" && !tagDraft && tags.length > 0) {
      setTags(tags.slice(0, -1));
    }
  }

  function onInvalid(fieldErrors: FieldErrors<UploadValues>) {
    const first = fieldOrder.find((name) => fieldErrors[name]);
    if (first === "file") fileInput.current?.focus();
    else if (first === "tags") tagInput.current?.focus();
    else if (first) setFocus(first);
  }

  async function onSubmit(values: UploadValues) {
    if (!values.file) return;
    setServerError(null);
    const form = new FormData();
    form.append("image", values.file);
    form.append("category", values.category);
    form.append("tags", values.tags.join(","));
    form.append("visibility", values.visibility);
    if (values.title) form.append("title", values.title);
    if (values.caption) form.append("caption", values.caption);
    try {
      setUploaded(await uploadImage(form));
    } catch (err) {
      setServerError(friendlyMessage(err));
    }
  }

  function startOver() {
    reset(defaultValues);
    showPreview(null);
    setTagDraft("");
    setServerError(null);
    setUploaded(null);
  }

  if (uploaded) {
    const isPublic = uploaded.visibility === "public";
    return (
      <div role="status" className="py-6 text-center">
        <div className="pop mx-auto grid size-16 place-items-center rounded-full bg-secondary text-primary">
          <CheckIcon width={32} height={32} />
        </div>
        <h2 className="mt-6 text-4xl">Photo uploaded</h2>
        <p className="mx-auto mt-3 max-w-md leading-relaxed text-muted">
          {isPublic
            ? `"${photoAlt(uploaded)}" is now on Photogram for everyone to see.`
            : `"${photoAlt(uploaded)}" is private. Only you can see it.`}
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/account" className={buttonClasses("primary")}>
            View my uploads
          </Link>
          {isPublic && (
            <Link href="/photogram" className={buttonClasses("secondary")}>
              View on Photogram
            </Link>
          )}
        </div>
        <button type="button" onClick={startOver} className="mt-6 text-sm font-medium text-primary underline underline-offset-4">
          Upload another photo
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={(e) => handleSubmit(onSubmit, onInvalid)(e)} noValidate className="space-y-6">
      {serverError && <FormAlert ref={alertRef}>{serverError}</FormAlert>}

      <p className="text-sm text-muted">Fields marked * are required.</p>

      {/* Photo */}
      <div>
        <p id="image-label" className="mb-2 block text-sm font-medium text-ink">
          Photo *
        </p>
        {file && preview ? (
          <div className="relative overflow-hidden rounded-2xl border border-ink/10 bg-white/60">
            <div className="relative aspect-4/3">
              <Image src={preview} alt="Preview of the photo you picked" fill unoptimized className="object-contain" />
            </div>
            <div className="flex items-center justify-between gap-3 border-t border-ink/10 px-4 py-3 text-sm">
              <span className="truncate text-muted">{file.name}</span>
              <button type="button" onClick={removeFile} className="shrink-0 font-medium text-primary underline underline-offset-4">
                Choose another
              </button>
            </div>
          </div>
        ) : (
          <label
            htmlFor="image"
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            className={`flex min-h-52 cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-6 py-10 text-center transition-colors focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15 ${
              dragging ? "border-primary bg-secondary/40" : errors.file ? "border-red-600" : "border-ink/20 hover:border-primary/60"
            }`}
          >
            <span className="font-serif text-2xl text-ink">Drop your photo here</span>
            <span className="text-sm text-muted">
              or <span className="font-medium text-primary underline underline-offset-4">browse</span> · JPG, PNG or WebP, up to 10 MB
            </span>
          </label>
        )}
        <input
          ref={fileInput}
          id="image"
          type="file"
          accept={acceptAttribute}
          className="sr-only"
          aria-labelledby="image-label"
          aria-invalid={!!errors.file}
          aria-describedby={errors.file ? errorId("image") : undefined}
          onChange={(e) => pickFile(e.target.files?.[0])}
        />
        {errors.file && (
          <p id={errorId("image")} className="mt-1.5 text-sm text-red-700">
            {errors.file.message}
          </p>
        )}
      </div>

      <Field label="Category *" id="category" error={errors.category?.message}>
        <select
          id="category"
          className={inputClass}
          aria-invalid={!!errors.category}
          aria-describedby={errors.category ? errorId("category") : undefined}
          {...register("category")}
        >
          <option value="" disabled>
            Choose a category…
          </option>
          {photoCategories.map((c) => (
            <option key={c} value={c}>
              {categoryLabel(c)}
            </option>
          ))}
        </select>
      </Field>

      {/* Tags */}
      <div>
        <div className="mb-2 flex items-baseline justify-between">
          <label htmlFor="tags" className="text-sm font-medium text-ink">
            Tags *
          </label>
          <span className="text-xs text-muted tabular-nums">
            {tags.length}/{MAX_TAGS}
          </span>
        </div>
        <div
          onClick={() => tagInput.current?.focus()}
          className={`flex min-h-12 flex-wrap items-center gap-2 rounded-lg border bg-white/60 px-3 py-2 transition-colors focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15 ${
            errors.tags ? "border-red-600" : "border-ink/15"
          }`}
        >
          {tags.map((tag) => (
            <span key={tag} className="inline-flex items-center gap-1 rounded-full bg-secondary py-1 pr-1 pl-3 text-sm text-primary">
              {tag}
              <button
                type="button"
                onClick={() => setTags(tags.filter((t) => t !== tag))}
                aria-label={`Remove tag ${tag}`}
                className="grid size-6 place-items-center rounded-full transition-colors hover:bg-secondary-dark"
              >
                <CloseIcon width={14} height={14} />
              </button>
            </span>
          ))}
          <input
            ref={tagInput}
            id="tags"
            value={tagDraft}
            onChange={(e) => {
              const value = e.target.value;
              // Typing or pasting a comma adds everything before it.
              if (value.includes(",")) {
                const parts = value.split(",");
                commitDraft(parts.slice(0, -1).join(","));
                setTagDraft(parts.at(-1) ?? "");
              } else {
                setTagDraft(value);
              }
            }}
            onKeyDown={onTagKey}
            onBlur={() => commitDraft()}
            disabled={tags.length >= MAX_TAGS}
            placeholder={tags.length >= MAX_TAGS ? "That's the maximum" : tags.length ? "Add another…" : "e.g. pink, bridal"}
            autoComplete="off"
            enterKeyHint="enter"
            aria-invalid={!!errors.tags}
            aria-describedby={errors.tags ? errorId("tags") : "tags-hint"}
            className="min-w-32 flex-1 bg-transparent py-1 text-base text-ink placeholder:text-muted/60 focus:outline-none"
          />
        </div>
        {errors.tags ? (
          <p id={errorId("tags")} className="mt-1.5 text-sm text-red-700">
            {errors.tags.message}
          </p>
        ) : (
          <p id="tags-hint" className="mt-1.5 text-xs text-muted">
            Press Enter or a comma to add a tag. 1 to {MAX_TAGS} tags.
          </p>
        )}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted">Quick add:</span>
          {suggestedTags
            .filter((t) => !tags.includes(t))
            .map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setTags(addTags(tags, tag))}
                disabled={tags.length >= MAX_TAGS}
                className="rounded-full border border-ink/15 px-3 py-1 text-xs text-ink transition-colors hover:border-primary hover:text-primary disabled:opacity-40"
              >
                + {tag}
              </button>
            ))}
        </div>
      </div>

      <Field label="Title (optional)" id="title" error={errors.title?.message}>
        <input
          id="title"
          autoComplete="off"
          placeholder="Pastel pink lehenga"
          className={inputClass}
          aria-invalid={!!errors.title}
          aria-describedby={errors.title ? errorId("title") : undefined}
          {...register("title")}
        />
      </Field>

      <Field label="Caption (optional)" id="caption" error={errors.caption?.message}>
        <textarea
          id="caption"
          rows={3}
          placeholder="Mirror work, perfect for mehendi"
          className={inputClass}
          aria-invalid={!!errors.caption}
          aria-describedby={errors.caption ? errorId("caption") : undefined}
          {...register("caption")}
        />
      </Field>

      <fieldset>
        <legend className="mb-2 text-sm font-medium text-ink">Who can see it?</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {[
            { value: "public", title: "Public", text: "Shown on Photogram" },
            { value: "private", title: "Private", text: "Only you can see it" },
          ].map((option) => (
            <label
              key={option.value}
              className="flex min-h-12 cursor-pointer items-start gap-3 rounded-lg border border-ink/15 px-4 py-3 text-sm transition-colors has-checked:border-primary has-checked:bg-secondary/40"
            >
              <input type="radio" value={option.value} className="mt-0.5 size-4 accent-primary" {...register("visibility")} />
              <span>
                <span className="font-medium text-ink">{option.title}:</span> <span className="text-muted">{option.text}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <button
        type="submit"
        disabled={isSubmitting}
        className={buttonClasses("primary", "w-full disabled:opacity-60")}
      >
        {isSubmitting ? "Uploading…" : "Upload photo"}
      </button>
    </form>
  );
}
