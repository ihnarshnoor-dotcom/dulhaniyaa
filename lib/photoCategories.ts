/** The categories a photo can be uploaded under. The photos API expects these exact values. */
export const photoCategories = ["lehenga", "saree", "jewellery", "makeup", "decor", "photography", "other"] as const;

export type PhotoCategory = (typeof photoCategories)[number];

export const isPhotoCategory = (value: string): value is PhotoCategory =>
  (photoCategories as readonly string[]).includes(value);

export const categoryLabel = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

/** Quick-add chips shown under the tags field. */
export const suggestedTags = ["pink", "red", "pastel", "bridal", "mehendi", "sangeet", "haldi", "reception"];
