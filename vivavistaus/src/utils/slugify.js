export const slugify = (str) =>
  str
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[^a-z0-9]/g, "");
    
export const slugifyReadable = (str) =>
  str
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters except spaces, hyphens, and word characters
    .replace(/\s+/g, '_') // Replace spaces with underscores
    .replace(/_+/g, '_') // Replace multiple underscores with single underscore
    .replace(/^_|_$/g, ''); // Remove leading/trailing underscores
    
export const slugifyholiday = (str) => str.trim().replace(/\s+/g, "-");

export const unslugify = (slug) => slug.replace(/-/g, " ");

// Helper function to generate deal slugs for URLs
export const generateDealSlug = (deal) => {
  if (!deal || !deal.title) return deal?._id || '';
  return slugifyReadable(deal.title);
};
