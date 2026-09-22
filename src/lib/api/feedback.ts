import type { Nullable, Org, User } from "$lib/api/types";

import { env } from "$env/dynamic/private";

import { getProfileUrl, getUserName, isOrg } from "$lib/api/accounts";

// Feedback is submitted to Zendesk as a new support ticket.
// Zendesk suggests the node-zendesk client, but it's a Node library and this
// app runs on Cloudflare Workers, so we call the REST API with fetch instead.
// https://developer.zendesk.com/api-reference/ticketing/tickets/tickets/#create-ticket

// every ticket opened from this app gets tagged, so support can filter on it
const PRODUCT_TAG = "documentcloud";

// how much of the message to fold into the ticket subject
const SUBJECT_LENGTH = 60;

export interface Feedback {
  type: string;
  message: string;
  email: string;
  name?: string;
  url?: string;
  // resolved on the server from the session, not from the form
  user?: Nullable<User>;
}

interface Requester {
  name: string;
  email: string;
}

export interface Ticket {
  subject: string;
  comment: { body: string };
  tags: string[];
  requester: Requester;
}

interface CreateTicketResponse {
  ticket: Ticket & {
    id: number;
    url: string;
    created_at: string;
    status: string;
  };
}

function endpoint(): URL {
  return new URL(
    "/api/v2/tickets.json",
    `https://${env.ZENDESK_SUBDOMAIN}.zendesk.com`,
  );
}

// Zendesk API tokens authenticate as "<email>/token:<token>" over basic auth
function authorization(): string {
  return `Basic ${btoa(`${env.ZENDESK_EMAIL}/token:${env.ZENDESK_API_TOKEN}`)}`;
}

export function isConfigured(): boolean {
  return Boolean(
    env.ZENDESK_SUBDOMAIN && env.ZENDESK_EMAIL && env.ZENDESK_API_TOKEN,
  );
}

export function subject({ type, message }: Feedback): string {
  const summary = (message.trim().split("\n", 1)[0] ?? "").trim();
  const excerpt =
    summary.length > SUBJECT_LENGTH
      ? summary.slice(0, SUBJECT_LENGTH).trimEnd() + "…"
      : summary;

  return excerpt
    ? `DocumentCloud ${type}: ${excerpt}`
    : `DocumentCloud ${type}`;
}

// Everything support needs to place the person and reproduce what they saw,
// appended under the message so it doesn't get in the way of reading it.
export function details({ url, user }: Feedback): string[] {
  const lines: string[] = [];

  if (url) lines.push(`Submitted from: ${url}`);

  if (user) {
    lines.push(`User: ${getUserName(user)} (@${user.username})`);
    lines.push(`Profile: ${getProfileUrl(user)}`);

    const org: Nullable<Org> = isOrg(user.organization)
      ? user.organization
      : null;

    if (org) {
      lines.push(
        `Organization: ${org.name}${org.plan ? ` (${org.plan})` : ""}`,
      );
    }
  }

  return lines;
}

export function body(feedback: Feedback): string {
  const message = feedback.message.trim();
  const context = details(feedback);

  return context.length ? `${message}\n\n---\n${context.join("\n")}` : message;
}

// Zendesk downcases tags, so we do it here too and keep the two consistent
export function tags({ type }: Feedback): string[] {
  const tag = type.trim().toLowerCase();

  return tag ? [PRODUCT_TAG, tag] : [PRODUCT_TAG];
}

export function buildTicket(feedback: Feedback): Ticket {
  return {
    subject: subject(feedback),
    comment: { body: body(feedback) },
    tags: tags(feedback),
    requester: {
      email: feedback.email,
      name: feedback.name || feedback.email,
    },
  };
}

// Zendesk reports errors as {error, description} or {error: {title, message}}
function errorMessage(data: any, response: Response): string {
  const error = data?.error;

  if (typeof error === "string") {
    return data.description ? `${error}: ${data.description}` : error;
  }

  return (
    error?.message ??
    error?.title ??
    data?.description ??
    `${response.status} ${response.statusText}`
  );
}

export async function createFeedback(
  feedback: Feedback,
  fetch = globalThis.fetch,
): Promise<CreateTicketResponse["ticket"]> {
  if (!isConfigured()) {
    throw new Error("Zendesk is not configured");
  }

  const res = await fetch(endpoint(), {
    method: "POST",
    headers: {
      Authorization: authorization(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ticket: buildTicket(feedback) }),
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) throw new Error(errorMessage(data, res));

  return data?.ticket;
}
