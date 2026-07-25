import type { User, UserRole, UserStatus } from "@/lib/types";

/** Default password for all seed users and the demo login flow. */
export const DEFAULT_MOCK_PASSWORD = "demo";

export type MockStoredUser = User & {
  password: string;
};

const SEED_USERS: MockStoredUser[] = [
  {
    id: "1",
    name: "Sarah Chen",
    email: "sarah.chen@retailco.com",
    role: "Store Manager",
    assignedStore: "Downtown Mall",
    status: "Active",
    password: DEFAULT_MOCK_PASSWORD,
  },
  {
    id: "2",
    name: "Marcus Johnson",
    email: "marcus.johnson@retailco.com",
    role: "Operations Manager",
    assignedStore: "Downtown Mall",
    status: "Active",
    password: DEFAULT_MOCK_PASSWORD,
  },
  {
    id: "3",
    name: "Elena Rodriguez",
    email: "elena.rodriguez@retailco.com",
    role: "Retail Analyst",
    assignedStore: "Downtown Mall",
    status: "Active",
    password: DEFAULT_MOCK_PASSWORD,
  },
  {
    id: "4",
    name: "David Kim",
    email: "david.kim@retailco.com",
    role: "System Administrator",
    assignedStore: "Westside Center",
    status: "Active",
    password: DEFAULT_MOCK_PASSWORD,
  },
];

let users: MockStoredUser[] = SEED_USERS.map((user) => ({ ...user }));
let userCounter = users.length + 1;

function toPublicUser({ password: _password, ...user }: MockStoredUser): User {
  return { ...user };
}

function nextUserId(): string {
  const id = `USR-${String(userCounter).padStart(3, "0")}`;
  userCounter += 1;
  return id;
}

export function listMockUsers(): User[] {
  return users.map(toPublicUser);
}

export function findMockUserByEmail(email: string): MockStoredUser | undefined {
  return users.find((user) => user.email === email);
}

export function findMockUserById(id: string): MockStoredUser | undefined {
  return users.find((user) => user.id === id);
}

export function getMockUserPassword(id: string): string | undefined {
  return findMockUserById(id)?.password;
}

export type CreateMockUserData = {
  name: string;
  email: string;
  role: UserRole;
  assignedStore: string;
  status?: UserStatus;
  password: string;
  id?: string;
};

export type UpdateMockUserData = Partial<
  Pick<User, "name" | "email" | "role" | "assignedStore" | "status">
>;

export function createMockUser(data: CreateMockUserData): User {
  const stored: MockStoredUser = {
    id: data.id ?? nextUserId(),
    name: data.name,
    email: data.email,
    role: data.role,
    assignedStore: data.assignedStore,
    status: data.status ?? "Active",
    password: data.password,
  };
  users = [...users, stored];
  return toPublicUser(stored);
}

export function updateMockUser(
  id: string,
  data: UpdateMockUserData,
): User | null {
  const index = users.findIndex((user) => user.id === id);
  if (index === -1) return null;

  const updated: MockStoredUser = { ...users[index], ...data, id };
  users = users.map((user) => (user.id === id ? updated : user));
  return toPublicUser(updated);
}

export function deleteMockUser(id: string): boolean {
  const before = users.length;
  users = users.filter((user) => user.id !== id);
  return users.length < before;
}

export function resetMockUserPassword(id: string, newPassword: string): boolean {
  const index = users.findIndex((user) => user.id === id);
  if (index === -1) return false;

  users = users.map((user) =>
    user.id === id ? { ...user, password: newPassword } : user,
  );
  return true;
}
