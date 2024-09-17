import { describe, it, test, expect } from "vitest";
import { render, screen } from "@testing-library/svelte";
import { me } from "@/test/fixtures/accounts";
import UserContextDemo from "@/test/components/UserContext.demo.svelte";
import { canUploadFiles, isSignedIn } from "../permissions";

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
});

// Test the getCurrentUser function
describe("getCurrentUser", () => {
  it("should return the current user from context", () => {
    // Render the mock component to set the context
    render(UserContextDemo);
    expect(screen.getByText(me.name)).toBeInTheDocument();
  });
});
