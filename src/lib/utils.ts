import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(price)
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date)
}

/**
 * Generates a clean username from email address
 * @param email Email address
 * @returns Clean username without special characters
 */
export function generateUsernameFromEmail(email: string): string {
  // Extract the part before @
  const emailPrefix = email.split('@')[0];

  // Remove special characters and replace with underscores
  const cleanUsername = emailPrefix
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '_')  // Replace non-alphanumeric with underscore
    .replace(/_+/g, '_')         // Replace multiple underscores with single
    .replace(/^_|_$/g, '');      // Remove leading/trailing underscores

  // Ensure minimum length
  if (cleanUsername.length < 3) {
    return `user_${cleanUsername}`;
  }

  return cleanUsername;
}