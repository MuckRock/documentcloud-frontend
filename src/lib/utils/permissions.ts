/** Checks whether users have permission to view, update, or delete resources. */

import type { User } from "@/api/types";

export function isSignedIn(user?: User | null): user is User {
  return Boolean(user);
}

export function canUploadFiles(user: User) {
  return user.verified_journalist || user.is_staff;
}
