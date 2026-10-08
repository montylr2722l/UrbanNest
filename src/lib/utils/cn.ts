/**
 * UrbanNest — cn utility
 * Combines clsx and tailwind-merge for conditional Tailwind class merging.
 */

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind CSS classes safely, resolving conflicts.
 * Example: cn("px-2 py-1", condition && "bg-red-500", "px-4") → "py-1 bg-red-500 px-4"
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
