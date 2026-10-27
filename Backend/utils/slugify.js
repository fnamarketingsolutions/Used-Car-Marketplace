export const slugify = (value = "") =>
  String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "item";

export const uniqueSlug = async (Model, base, extraFilter = {}, excludeId = null) => {
  let slug = slugify(base);
  let candidate = slug;
  let i = 0;
  while (
    await Model.exists({
      slug: candidate,
      ...extraFilter,
      ...(excludeId ? { _id: { $ne: excludeId } } : {}),
    })
  ) {
    i += 1;
    candidate = `${slug}-${i}`;
  }
  return candidate;
};
