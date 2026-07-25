"use client";

import type { ReactNode } from "react";

import { AccessDenied } from "@/components/auth/access-denied";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { useAuth } from "@/lib/auth/AuthContext";

const ADMIN_ROLE = "System Administrator" as const;

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  if (!user || user.role !== ADMIN_ROLE) {
    return (
      <DashboardShell>
        <AccessDenied />
      </DashboardShell>
    );
  }

  return children;
}
