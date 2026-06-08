import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function normalizePhoneNumber(input: string): string {
  // Remove all non-numeric characters (spaces, +, -, etc.)
  let clean = input.replace(/\D/g, '');

  // If it starts with 880, strip the 88
  if (clean.startsWith('880')) {
    clean = clean.substring(2);
  }
  // If it's a 10-digit number starting with 1, add the leading 0
  if (clean.length === 10 && clean.startsWith('1')) {
    clean = '0' + clean;
  }

  return clean; // Returns standard format: 01712345678
}