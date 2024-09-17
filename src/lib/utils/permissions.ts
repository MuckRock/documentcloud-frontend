/** Checks whether users have permission to view, update, or delete resources. */

import { getContext } from "svelte";
import type { Writable } from "svelte/store";
import type { User } from "@/api/types";

/** A helper that returns the signed-in user.
 *  @returns the signed in user from context.
 *  @throws if called outside component initialization.
 */
export function getCurrentUser(): Writable<User | null> {
  return getContext("me");
}

/** Checks if the provided user exists. If they do, they are signed in. */
export function isSignedIn(user?: User | null): user is User {
  return Boolean(user);
}

/* Checks if the user can upload file. Must be verified journalist or staff. */
export function canUploadFiles(user: User) {
  return user.verified_journalist || user.is_staff;
}
