import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getGradYears() {
  const startYear = 2000
  const endYear = new Date().getFullYear() + 10

  const numberOfYears = endYear - startYear + 1
  const years = Array.from(
    { length: numberOfYears },
    (_, i) => i + startYear
  ).reverse()

  return years
}
