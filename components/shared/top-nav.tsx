import Link from 'next/link'

import { cn } from '@/lib/utils'
import { useRouter } from 'next/router'

export interface TopNavLink {
  href: string
  title: string
}

interface TopNavProps extends React.HTMLAttributes<HTMLElement> {
  links?: TopNavLink[]
}

export function TopNav({ className, links, ...props }: TopNavProps) {
  const router = useRouter()
  const currentRoute = router.pathname

  const activeVariant =
    'text-sm font-medium transition-colors hover:text-primary'
  const inactiveVariant =
    'text-sm font-medium transition-colors hover:text-primary text-muted-foreground'

  return (
    <nav
      className={cn('flex items-center space-x-4 lg:space-x-6', className)}
      {...props}
    >
      {links &&
        links.map((link, index) => {
          const isActive = currentRoute === link.href
          const variant = isActive ? activeVariant : inactiveVariant
          return (
            <Link key={index} href={link.href} className={variant}>
              {link.title}
            </Link>
          )
        })}
    </nav>
  )
}
