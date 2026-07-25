// MOCK IMPLEMENTATION — swap the function bodies below for real fetch() calls
// to the FastAPI backend when Module 12 is live. Signatures and return types
// must not change.

import { ORGANIZATIONS } from "@/lib/scope-data";
import type { Organization, Store } from "@/lib/types";

/** Returns all stores across every organization in the scope hierarchy. */
export function getStores(): Promise<Store[]> {
  const stores = ORGANIZATIONS.flatMap((org) => org.stores);
  return Promise.resolve(stores);
}

/** Returns the full organization → store → camera → zone hierarchy. */
export function getOrganizations(): Promise<Organization[]> {
  return Promise.resolve(ORGANIZATIONS);
}
