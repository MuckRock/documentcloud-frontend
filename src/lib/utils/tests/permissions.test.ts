import { render, screen } from "@testing-library/svelte";
import { describe, it, test, expect } from "vitest";
import type { Document } from "$lib/api/types";

import { canChangeOwner, canUploadFiles, isSignedIn } from "../permissions";

import { me } from "@/test/fixtures/accounts";
import { document } from "@/test/fixtures/documents";
import UserContextDemo from "@/test/components/UserContext.demo.svelte";

describe("permission checks", () => {
  test("isSignedIn", () => {
    expect(isSignedIn()).toBe(false);
    expect(isSignedIn(null)).toBe(false);
    expect(isSignedIn(me)).toBe(true);
  });

  test("canUploadFiles", () => {
    const unauthorized = { ...me, verified_journalist: false, is_staff: false };
    expect(canUploadFiles(unauthorized)).toBe(false);
    expect(canUploadFiles({ ...unauthorized, verified_journalist: true })).toBe(
      true,
    );
    expect(canUploadFiles({ ...unauthorized, is_staff: true })).toBe(true);
    expect(canUploadFiles()).toBe(false);
  });

  describe("canChangeOwner", () => {
    test("returns false when user is null", () => {
      const privateDoc: Document = {
        ...document,
        access: "private",
        user: me.id,
      };
      expect(canChangeOwner(null, [privateDoc])).toBe(false);
    });

    test("returns false when documents array is undefined", () => {
      expect(canChangeOwner(me, undefined)).toBe(false);
    });

    test("returns false when documents array is empty", () => {
      expect(canChangeOwner(me, [])).toBe(false);
    });

    test("returns false when document is public", () => {
      const publicDoc: Document = {
        ...document,
        access: "public",
        user: me.id,
      };
      expect(canChangeOwner(me, [publicDoc])).toBe(false);
    });

    test("returns true when user owns private document", () => {
      const privateDoc: Document = {
        ...document,
        access: "private",
        user: me.id,
      };
      expect(canChangeOwner(me, [privateDoc])).toBe(true);
    });

    test("returns true when user owns organization document", () => {
      const orgDoc: Document = {
        ...document,
        access: "organization",
        user: me.id,
      };
      expect(canChangeOwner(me, [orgDoc])).toBe(true);
    });

    test("returns false when user does not own the document", () => {
      const otherUserDoc: Document = {
        ...document,
        access: "private",
        user: 99999, // Different user ID
      };
      expect(canChangeOwner(me, [otherUserDoc])).toBe(false);
    });

    test("returns true when user owns all documents in array", () => {
      const doc1: Document = {
        ...document,
        id: 1,
        access: "private",
        user: me.id,
      };
      const doc2: Document = {
        ...document,
        id: 2,
        access: "organization",
        user: me.id,
      };
      expect(canChangeOwner(me, [doc1, doc2])).toBe(true);
    });

    test("returns false when user owns some but not all documents", () => {
      const ownedDoc: Document = {
        ...document,
        id: 1,
        access: "private",
        user: me.id,
      };
      const otherDoc: Document = {
        ...document,
        id: 2,
        access: "private",
        user: 99999,
      };
      expect(canChangeOwner(me, [ownedDoc, otherDoc])).toBe(false);
    });

    test("returns false when any document in array is public", () => {
      const privateDoc: Document = {
        ...document,
        id: 1,
        access: "private",
        user: me.id,
      };
      const publicDoc: Document = {
        ...document,
        id: 2,
        access: "public",
        user: me.id,
      };
      expect(canChangeOwner(me, [privateDoc, publicDoc])).toBe(false);
    });

    test("handles user as object with nested id", () => {
      const docWithUserObject: Document = {
        ...document,
        access: "private",
        user: me,
      };
      expect(canChangeOwner(me, [docWithUserObject])).toBe(true);
    });

    test("returns false when user object has different id", () => {
      const otherUser = {
        ...me,
        id: 99999,
        name: "Other User",
        username: "otheruser",
      };
      const docWithUserObject: Document = {
        ...document,
        access: "private",
        user: otherUser,
      };
      expect(canChangeOwner(me, [docWithUserObject])).toBe(false);
    });
  });
});

// Test the getCurrentUser function
describe("getCurrentUser", () => {
  it("should return the current user from context", () => {
    // Render the mock component to set the context
    render(UserContextDemo);
    expect(screen.getByText(me.name!)).toBeInTheDocument();
  });
});
