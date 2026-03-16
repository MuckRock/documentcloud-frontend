import { describe, it, expect } from "vitest";
import { render } from "@testing-library/svelte";
import FieldValueAtom from "../FieldValueAtom.svelte";

describe("FieldValueAtom", () => {
  it("renders field label and value", () => {
    const { container } = render(FieldValueAtom, {
      props: { field: "user", value: "102112" },
    });
    const atom = container.querySelector(".search-atom");
    expect(atom).toBeInTheDocument();
    expect(atom?.textContent).toContain("user");
    expect(atom?.textContent).toContain("102112");
  });

  it("shows displayValue when available", () => {
    const { container } = render(FieldValueAtom, {
      props: {
        field: "user",
        value: "102112",
        displayValue: "Mitchell Kotler",
      },
    });
    const atom = container.querySelector(".search-atom");
    expect(atom?.textContent).toContain("user");
    expect(atom?.textContent).toContain("Mitchell Kotler");
    // Should not show the raw value when displayValue is present
    expect(atom?.textContent).not.toContain("102112");
  });

  it("shows loading indicator for entity fields without displayValue", () => {
    const { container } = render(FieldValueAtom, {
      props: { field: "user", value: "102112" },
    });
    const loading = container.querySelector(".atom-loading");
    expect(loading).toBeInTheDocument();
  });

  it("does not show loading indicator for non-entity fields", () => {
    const { container } = render(FieldValueAtom, {
      props: { field: "access", value: "public" },
    });
    const loading = container.querySelector(".atom-loading");
    expect(loading).not.toBeInTheDocument();
  });

  it("does not show loading indicator when displayValue is set", () => {
    const { container } = render(FieldValueAtom, {
      props: {
        field: "user",
        value: "102112",
        displayValue: "Mitchell Kotler",
      },
    });
    const loading = container.querySelector(".atom-loading");
    expect(loading).not.toBeInTheDocument();
  });

  it("shows + prefix indicator for required", () => {
    const { container } = render(FieldValueAtom, {
      props: { field: "user", value: "102112", prefix: "+" },
    });
    const prefix = container.querySelector(".atom-prefix");
    expect(prefix).toBeInTheDocument();
    expect(prefix?.textContent).toBe("+");
    expect(prefix?.classList.contains("atom-prefix-required")).toBe(true);
  });

  it("shows - prefix indicator for excluded", () => {
    const { container } = render(FieldValueAtom, {
      props: { field: "access", value: "private", prefix: "-" },
    });
    const prefix = container.querySelector(".atom-prefix");
    expect(prefix).toBeInTheDocument();
    expect(prefix?.textContent).toBe("-");
    expect(prefix?.classList.contains("atom-prefix-excluded")).toBe(true);
  });

  it("does not show prefix when not set", () => {
    const { container } = render(FieldValueAtom, {
      props: { field: "access", value: "public" },
    });
    const prefix = container.querySelector(".atom-prefix");
    expect(prefix).not.toBeInTheDocument();
  });

  it("renders boost badge when boost is set", () => {
    const { container } = render(FieldValueAtom, {
      props: { field: "user", value: "102112", boost: 4 },
    });
    const boost = container.querySelector(".atom-boost");
    expect(boost).toBeInTheDocument();
    expect(boost?.textContent).toContain("4");
  });

  it("does not render boost badge when boost is not set", () => {
    const { container } = render(FieldValueAtom, {
      props: { field: "user", value: "102112" },
    });
    const boost = container.querySelector(".atom-boost");
    expect(boost).not.toBeInTheDocument();
  });

  it("has the search-field-value class", () => {
    const { container } = render(FieldValueAtom, {
      props: { field: "access", value: "public" },
    });
    const atom = container.querySelector(".search-field-value");
    expect(atom).toBeInTheDocument();
  });
});
