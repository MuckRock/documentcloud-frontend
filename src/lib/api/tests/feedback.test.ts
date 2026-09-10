import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { env } from "$env/dynamic/private";

import * as feedback from "../feedback";
import type { Feedback } from "../feedback";
import { me } from "@/test/fixtures/accounts";
import { SQUARELET_BASE } from "@/config/config";

vi.mock("$env/dynamic/private", () => ({
  env: {
    ZENDESK_SUBDOMAIN: "documentcloud",
    ZENDESK_EMAIL: "support@documentcloud.org",
    ZENDESK_API_TOKEN: "token",
  },
}));

const comment: Feedback = {
  type: "Comment",
  message: "I think that the new viewer is great",
  email: "user@example.com",
  name: "Example User",
  url: "https://www.documentcloud.org/documents/1-example/",
};

describe("building a ticket", () => {
  test("summarizes the message in the subject", () => {
    expect(feedback.subject(comment)).toEqual(
      "DocumentCloud Comment: I think that the new viewer is great",
    );
  });

  test("truncates long messages in the subject", () => {
    const subject = feedback.subject({
      ...comment,
      message: "a".repeat(100),
    });

    expect(subject).toEqual(`DocumentCloud Comment: ${"a".repeat(60)}…`);
  });

  test("uses only the first line of the message in the subject", () => {
    const subject = feedback.subject({
      ...comment,
      message: "The viewer is broken\n\nHere are the details",
    });

    expect(subject).toEqual("DocumentCloud Comment: The viewer is broken");
  });

  test("falls back to the type when there's no message", () => {
    expect(feedback.subject({ ...comment, message: "  " })).toEqual(
      "DocumentCloud Comment",
    );
  });

  test("includes the submitting page in the body", () => {
    expect(feedback.body(comment)).toEqual(
      `${comment.message}\n\n---\nSubmitted from: ${comment.url}`,
    );
  });

  test("sends just the message when we have no context to add", () => {
    expect(feedback.body({ ...comment, url: "" })).toEqual(comment.message);
  });

  test("links to the submitter's Squarelet profile", () => {
    expect(feedback.details({ ...comment, user: me })).toEqual([
      `Submitted from: ${comment.url}`,
      `User: Chris Amico (@${me.username})`,
      `Profile: ${SQUARELET_BASE}/users/${me.username}/`,
      "Organization: MuckRock (Organization)",
    ]);
  });

  test("says nothing about the user when we couldn't identify them", () => {
    expect(feedback.details({ ...comment, user: null })).toEqual([
      `Submitted from: ${comment.url}`,
    ]);
  });

  test("tags the product and the feedback type", () => {
    expect(feedback.tags(comment)).toEqual(["documentcloud", "comment"]);
    expect(feedback.tags({ ...comment, type: "Bug" })).toEqual([
      "documentcloud",
      "bug",
    ]);
    expect(feedback.tags({ ...comment, type: "" })).toEqual(["documentcloud"]);
  });

  test("sets the submitter as the requester", () => {
    expect(feedback.buildTicket(comment).requester).toEqual({
      email: "user@example.com",
      name: "Example User",
    });
  });

  test("falls back to the email when we don't have a name", () => {
    expect(feedback.buildTicket({ ...comment, name: "" }).requester).toEqual({
      email: "user@example.com",
      name: "user@example.com",
    });
  });
});

describe("createFeedback", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  test("posts a ticket to Zendesk", async () => {
    const ticket = { id: 1, ...feedback.buildTicket(comment) };
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 201,
      async json() {
        return { ticket };
      },
    });

    expect(await feedback.createFeedback(comment, mockFetch)).toEqual(ticket);

    const [endpoint, options] = mockFetch.mock.calls[0] ?? [];

    expect(endpoint).toEqual(
      new URL("https://documentcloud.zendesk.com/api/v2/tickets.json"),
    );
    expect(options.method).toEqual("POST");
    expect(options.headers.Authorization).toEqual(
      `Basic ${btoa("support@documentcloud.org/token:token")}`,
    );
    expect(JSON.parse(options.body)).toEqual({
      ticket: feedback.buildTicket(comment),
    });
  });

  test("throws the error Zendesk reports", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 422,
      statusText: "Unprocessable Entity",
      async json() {
        return {
          error: "RecordInvalid",
          description: "Record validation errors",
        };
      },
    });

    await expect(feedback.createFeedback(comment, mockFetch)).rejects.toThrow(
      "RecordInvalid: Record validation errors",
    );
  });

  test("throws when Zendesk returns something we can't parse", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 502,
      statusText: "Bad Gateway",
      async json() {
        throw new Error("not json");
      },
    });

    await expect(feedback.createFeedback(comment, mockFetch)).rejects.toThrow(
      "502 Bad Gateway",
    );
  });
});

describe("configuration", () => {
  const configured = { ...env };

  afterEach(() => {
    Object.assign(env, configured);
  });

  test("is configured when every credential is present", () => {
    expect(feedback.isConfigured()).toBe(true);
  });

  test.each(["ZENDESK_SUBDOMAIN", "ZENDESK_EMAIL", "ZENDESK_API_TOKEN"])(
    "is unconfigured without %s",
    (name) => {
      env[name] = "";

      expect(feedback.isConfigured()).toBe(false);
    },
  );

  test("refuses to post a ticket when unconfigured", async () => {
    env.ZENDESK_API_TOKEN = "";
    const mockFetch = vi.fn();

    await expect(feedback.createFeedback(comment, mockFetch)).rejects.toThrow(
      "Zendesk is not configured",
    );
    expect(mockFetch).not.toHaveBeenCalled();
  });
});
