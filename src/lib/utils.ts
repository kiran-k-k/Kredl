import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Converts a string to a URL-safe slug.
 * Mirrors the slugify() function in the backend job-roles service
 * so previews generated in the admin form match what the server generates.
 *
 * @example slugify("Java Developer") → "java-developer"
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
}

/**
 * Returns true if the given string is a 24-character MongoDB ObjectId.
 * Used to distinguish slug params from legacy ID params.
 */
export function isMongoId(value: string): boolean {
  return /^[a-f\d]{24}$/i.test(value)
}

/**
 * Returns a display string from a structured salaryInfo object,
 * falling back to a plain salaryRange string.
 */
export function formatSalary(
  salaryInfo?: {
    averageSalary?: string
    fresherRange?: string
    experiencedRange?: string
    currency?: string
  } | null,
  salaryRange?: string
): string {
  if (salaryInfo?.averageSalary) return salaryInfo.averageSalary
  if (salaryInfo?.fresherRange) return salaryInfo.fresherRange
  if (salaryRange) return salaryRange
  return "Not specified"
}
