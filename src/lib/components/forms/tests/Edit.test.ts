import type { APIError, APIErrors, Document } from "$lib/api/types";

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/svelte";

import Edit from "../Edit.svelte";
import documentFixture from "@/test/fixtures/documents/document.json";

const document = documentFixture as Document;

function renderWithError(error: APIError<APIErrors>) {
  return render(Edit, { document, error });
}

describe("Edit", () => {
  it("shows field errors keyed by field name", () => {
    renderWithError({
      status: 400,
      message: "Bad Request",
      errors: { published_url: ["Enter a valid URL."] },
    });

    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent("Bad Request");
    expect(alert).toHaveTextContent("published_url");
    expect(alert).toHaveTextContent("Enter a valid URL.");
  });

  it("shows non-field errors, which arrive as a bare array", () => {
    // what the API returns when changing access on a processing document
    const message =
      "You may not update `access` while the document is processing";

    renderWithError({
      status: 400,
      message: "Bad Request",
      errors: [message],
    });

    expect(screen.getByRole("alert")).toHaveTextContent(message);
  });

  it("falls back to a generic message when the status text is empty", () => {
    // HTTP/2 responses have no status text
    renderWithError({ status: 400, message: "", errors: ["Nope."] });

    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent("An Error Ocurred");
    expect(alert).toHaveTextContent("Nope.");
  });

  it("shows nothing when there is no error", () => {
    render(Edit, { document });

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});
