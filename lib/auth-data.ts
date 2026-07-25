/**
 * @deprecated Use `lib/auth/mock-users.ts` — kept for backwards compatibility only.
 */
export {
  DEFAULT_MOCK_PASSWORD,
  listMockUsers,
  findMockUserByEmail,
} from "@/lib/auth/mock-users";

import type { MockUser, UserRole } from "@/lib/types";
import { findMockUserByEmail, listMockUsers } from "@/lib/auth/mock-users";

/** @deprecated Use `listMockUsers()` from `lib/auth/mock-users.ts` */
export const MOCK_USERS: MockUser[] = listMockUsers().map(
  ({ id, name, email, role }) => ({ id, name, email, role }),
);

/** @deprecated Login uses `lib/api/auth.ts` */
export function validateLogin(
  email: string,
  password: string,
  selectedRole?: UserRole,
): MockUser | null {
  if (password !== "demo") return null;

  const users = listMockUsers();
  if (selectedRole) {
    const user = users.find((u) => u.role === selectedRole);
    return user
      ? { id: user.id, name: user.name, email: user.email, role: user.role }
      : null;
  }

  const user = findMockUserByEmail(email);
  return user
    ? { id: user.id, name: user.name, email: user.email, role: user.role }
    : null;
}

/** @deprecated Use `lib/api/auth.ts` session helpers */
export function saveAuthSession(user: MockUser): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("auth_session", JSON.stringify(user));
  }
}

/** @deprecated Use `lib/api/auth.ts` `getCurrentUser()` */
export function getAuthSession(): MockUser | null {
  if (typeof window !== "undefined") {
    const session = localStorage.getItem("auth_session");
    return session ? JSON.parse(session) : null;
  }
  return null;
}

/** @deprecated Use `lib/api/auth.ts` `logout()` */
export function clearAuthSession(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem("auth_session");
  }
}
