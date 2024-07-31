import { toast } from '@/components/ui/use-toast'
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

export function isEmpty(obj: any) {
  return Object.keys(obj).length === 0
}

export function handleFetchError(title: string, error: any) {
  toast({
    title,
    description: (
      <pre className='mt-2 w-[340px] rounded-md bg-slate-950 p-4'>
        <code className='text-white'>{JSON.stringify(error, null, 2)}</code>
      </pre>
    ),
  })
}
