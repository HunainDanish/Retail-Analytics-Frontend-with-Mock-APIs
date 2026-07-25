"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";

import { AuthLoading } from "@/components/auth/auth-loading";
import { useAuth } from "@/lib/auth/AuthContext";

const PUBLIC_ROUTES = new Set(["/login"]);

export function AuthGuard({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const isPublicRoute = PUBLIC_ROUTES.has(pathname);

  useEffect(() => {
    if (!isLoading && !user && !isPublicRoute) {
      router.replace("/login");
    }
  }, [isLoading, user, isPublicRoute, router]);

  if (isLoading) {
    return <AuthLoading />;
  }

  if (!user && !isPublicRoute) {
    return <AuthLoading />;
  }

  return <>{children}</>;
}
