import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/svelte";

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

  it("sets name and value properties in button mode", () => {
    render(Button, { props: { name: "action", value: "add" } });

    const button = screen.getByRole("button");

    expect(button).toBeInTheDocument();
    expect(button.getAttribute("name")).toEqual("action");
    expect(button.getAttribute("value")).toEqual("add");
  });
});
