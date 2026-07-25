// MOCK IMPLEMENTATION — swap the function bodies below for real fetch() calls
// to the FastAPI backend when Module 12 is live. Signatures and return types
// must not change.

import { getUsers } from "@/lib/api/users";
import { DEFAULT_MOCK_PASSWORD } from "@/lib/auth/mock-users";
import type { User, UserRole } from "@/lib/types";

const SESSION_KEY = "auth_session";

export type SessionUser = Pick<User, "id" | "name" | "email" | "role">;

export function login(email: string, password: string): Promise<SessionUser> {
  return getUsers().then((allUsers) => {
    if (password !== DEFAULT_MOCK_PASSWORD) {
      throw new Error('Invalid email or password. (Hint: try password "demo")');
    }

    const user = allUsers.find((u) => u.email === email);
    if (!user) {
      throw new Error('Invalid email or password. (Hint: try password "demo")');
    }

    const session: SessionUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    if (typeof window !== "undefined") {
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    }

    return session;
  });
}

export function loginByRole(
  role: UserRole,
  password: string,
): Promise<SessionUser> {
  return getUsers().then((allUsers) => {
    if (password !== DEFAULT_MOCK_PASSWORD) {
      throw new Error('Invalid email or password. (Hint: try password "demo")');
    }

    const user = allUsers.find((u) => u.role === role);
    if (!user) {
      throw new Error('Invalid email or password. (Hint: try password "demo")');
    }

    return login(user.email, password);
  });
}

export function logout(): Promise<void> {
  if (typeof window !== "undefined") {
    localStorage.removeItem(SESSION_KEY);
  }
  return Promise.resolve();
}

export function getCurrentUser(): SessionUser | null {
  if (typeof window === "undefined") return null;

  const session = localStorage.getItem(SESSION_KEY);
  return session ? (JSON.parse(session) as SessionUser) : null;
}
