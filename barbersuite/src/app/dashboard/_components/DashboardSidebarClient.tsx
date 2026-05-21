'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'

interface NavLink {
  href: string
  label: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: React.ComponentType<any>
  section: string
}

interface DashboardSidebarClientProps {
  navLinks: readonly NavLink[]
}

export default function DashboardSidebarClient({ navLinks }: DashboardSidebarClientProps) {
  const pathname = usePathname()

  return (
    <>
      {navLinks.map(({ href, label, icon: Icon }) => {
        const isActive =
          href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(href)

        return (
          <Link
            key={href}
            href={href}
            className={`nav-item flex items-center gap-4 px-4 py-3 text-sm group ${
              isActive ? 'active' : 'text-neutral-400'
            }`}
          >
            <Icon
              size={20}
              className={isActive ? 'text-[#ffffff]' : 'group-hover:text-white transition-colors'}
            />
            <span className="hidden md:block font-medium uppercase tracking-wider text-[11px]">
              {label}
            </span>
          </Link>
        )
      })}
    </>
  )
}
