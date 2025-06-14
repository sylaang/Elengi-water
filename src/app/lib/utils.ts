// app/lib/utils.ts
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Combine class names en toute sécurité avec Tailwind Merge et clsx
 * @param inputs Classes Tailwind à combiner
 * @returns Chaîne de classes optimisée
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}