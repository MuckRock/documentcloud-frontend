/** Checks whether users have permission to view, update, or delete resources. */

import type { Writable } from "svelte/store";
import type { Document, Maybe, Nullable, User } from "$lib/api/types";

import { getContext } from "svelte";

/**
 * A helper that returns the signed-in user.
 * @returns the signed in user from context.
 * @throws if called outside component initialization.
 */
export function getCurrentUser(): Writable<User | null> {
  return getContext("me");
}

/** Checks if the provided user exists. If they do, they are signed in. */
export function isSignedIn(user?: User | null): user is User {
  return Boolean(user);
}

/* Checks if the user can upload file. Must be verified journalist or staff. */
export function canUploadFiles(user?: Nullable<User>): boolean {
  if (!user) return false;
  return Boolean(user.verified_journalist || user.is_staff);
}

/**
 * Can be updated if the current user owns the document and the document is either
 * private or in an organization they are a member of.
 * The new organization must also be one the user is a member of.
 */
export function canChangeOwner(
  user: Nullable<User>,
  documents: Maybe<Document[]>,
): Boolean {
  if (!user) return false;
  if (!documents?.length) return false;

  return documents.every((d) => {
    if (d.access === "public") return false;

    const ownerId = typeof d.user === "number" ? d.user : d.user.id;

    return ownerId === user.id;
  });
}
