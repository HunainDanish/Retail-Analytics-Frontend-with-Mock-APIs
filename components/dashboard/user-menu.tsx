"use client"

import { useRef, useState } from "react"
import { ChevronDown, LogOut } from "lucide-react"

import { useAuth } from "@/lib/auth/AuthContext"
import { useDismiss } from "@/hooks/use-dismiss"

function userInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

export function UserMenu() {
  const [open, setOpen] = useState(false)
  const { user, isLoading, logout } = useAuth()
  const ref = useRef<HTMLDivElement>(null)
  useDismiss(ref, open, () => setOpen(false))

  async function handleLogout() {
    setOpen(false)
    await logout()
  }

  if (isLoading) {
    return (
      <div
        className="flex items-center gap-2 py-1 pl-1 pr-1.5"
        aria-label="Loading user menu"
      >
        <span className="size-8 shrink-0 animate-pulse rounded-full bg-muted" />
        <span className="hidden min-w-0 flex-col gap-1 sm:flex">
          <span className="h-3.5 w-20 animate-pulse rounded bg-muted" />
          <span className="h-3 w-24 animate-pulse rounded bg-muted" />
        </span>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const initials = userInitials(user.name)

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`${user.name}, ${user.role}`}
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-lg py-1 pl-1 pr-1.5 text-left transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <span
          className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground"
          aria-hidden="true"
        >
          {initials}
        </span>
        <span className="hidden min-w-0 flex-col leading-tight sm:flex">
          <span className="truncate text-sm font-medium text-foreground">{user.name}</span>
          <span className="truncate text-xs text-muted-foreground">{user.role}</span>
        </span>
        <ChevronDown className="hidden size-4 text-muted-foreground sm:block" aria-hidden="true" />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-1.5 w-56 overflow-hidden rounded-xl border border-border bg-popover p-1 shadow-lg"
        >
          <div className="px-2.5 py-2 sm:hidden">
            <p className="text-sm font-medium text-foreground">{user.name}</p>
            <p className="text-xs text-muted-foreground">{user.role}</p>
          </div>
          <div className="my-1 h-px bg-border sm:hidden" />
          <button
            type="button"
            role="menuitem"
            onClick={handleLogout}
            className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-foreground transition-colors hover:bg-muted focus-visible:bg-muted focus-visible:outline-none"
          >
            <LogOut className="size-4 text-muted-foreground" aria-hidden="true" />
            Log out
          </button>
        </div>
      )}
    </div>
  )
}
