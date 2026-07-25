"use client";

import type { ReactNode } from "react";

import { AuthGuard } from "@/components/auth/auth-guard";
import { AuthProvider } from "@/lib/auth/AuthContext";
import { ScopeProvider } from "@/lib/scope/ScopeContext";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <AuthGuard>
        <ScopeProvider>{children}</ScopeProvider>
      </AuthGuard>
    </AuthProvider>
  );
}
