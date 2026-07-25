// MOCK IMPLEMENTATION — swap the function bodies below for real fetch() calls
// to the FastAPI backend when Module 12 is live. Signatures and return types
// must not change.

import {
  createMockUser,
  deleteMockUser,
  listMockUsers,
  resetMockUserPassword,
  updateMockUser,
  type CreateMockUserData,
  type UpdateMockUserData,
} from "@/lib/auth/mock-users";
import {
  ROLE_COLORS,
  STORES,
  USER_ROLES,
  getStatusColor,
} from "@/lib/admin-users-data";
import type { User, UserRole, UserStatus } from "@/lib/types";

export { ROLE_COLORS, STORES, USER_ROLES, getStatusColor };

// ─── Types ───────────────────────────────────────────────────────────────────

export type CreateUserData = CreateMockUserData;

export type UpdateUserData = UpdateMockUserData;

export type ResetPasswordResult = {
  user_id: string;
  success: boolean;
};

// ─── API functions ───────────────────────────────────────────────────────────

export function getUsers(): Promise<User[]> {
  return Promise.resolve(listMockUsers());
}

export function createUser(data: CreateUserData): Promise<User> {
  return Promise.resolve(createMockUser(data));
}

export function updateUser(
  id: string,
  data: UpdateUserData,
): Promise<User | null> {
  return Promise.resolve(updateMockUser(id, data));
}

export function deleteUser(id: string): Promise<boolean> {
  return Promise.resolve(deleteMockUser(id));
}

export function resetPassword(
  id: string,
  newPassword: string,
): Promise<ResetPasswordResult> {
  const success = resetMockUserPassword(id, newPassword);
  return Promise.resolve({ user_id: id, success });
}
