import type { UserRole, UserStatus } from "@/lib/types";
import { USER_STATUS_COLORS } from "@/lib/constants";

export const STORES = ['Downtown Mall', 'Westside Center'];

export const USER_ROLES: UserRole[] = [
  'Store Manager',
  'Operations Manager',
  'Retail Analyst',
  'System Administrator',
];

export const ROLE_COLORS: Record<UserRole, string> = {
  'Store Manager': 'bg-blue-500/10 text-blue-700 dark:text-blue-400',
  'Operations Manager': 'bg-purple-500/10 text-purple-700 dark:text-purple-400',
  'Retail Analyst': 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
  'System Administrator': 'bg-rose-500/10 text-rose-700 dark:text-rose-400',
};

export function getStatusColor(status: UserStatus): string {
  return USER_STATUS_COLORS[status];
}

export function getStatusLabel(status: UserStatus): string {
  return status;
}
