import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/svelte";
import { userEvent } from "@testing-library/user-event";

import Button from "../Button.svelte";

describe("Button", () => {
  it("renders a default button", () => {
    render(Button);

    const button = screen.getByRole("button");

    expect(button).toBeInTheDocument();
    expect(button.tagName).toStrictEqual("BUTTON");
  });

  it("renders a link when href is used", () => {
    render(Button, { props: { href: "https://www.documentcloud.org" } });

    const link = screen.getByText(/Submit/);

    expect(link).toBeInTheDocument();
    expect(link.tagName).toStrictEqual("A");
  });
});
