import { describe, it, expect } from "vitest";
import { render } from "@testing-library/svelte";
import FieldValueChip from "../FieldValueChip.svelte";

describe("FieldValueChip", () => {
  it("renders field label and value", () => {
    const { container } = render(FieldValueChip, {
      props: { field: "user", value: "102112" },
    });
    const chip = container.querySelector(".search-chip");
    expect(chip).toBeInTheDocument();
    expect(chip?.textContent).toContain("user");
    expect(chip?.textContent).toContain("102112");
  });

  it("shows displayValue when available", () => {
    const { container } = render(FieldValueChip, {
      props: {
        field: "user",
        value: "102112",
        displayValue: "Mitchell Kotler",
      },
    });
    const chip = container.querySelector(".search-chip");
    expect(chip?.textContent).toContain("user");
    expect(chip?.textContent).toContain("Mitchell Kotler");
    // Should not show the raw value when displayValue is present
    expect(chip?.textContent).not.toContain("102112");
  });

  it("shows loading indicator for entity fields without displayValue", () => {
    const { container } = render(FieldValueChip, {
      props: { field: "user", value: "102112" },
    });
    const loading = container.querySelector(".chip-loading");
    expect(loading).toBeInTheDocument();
  });

  it("does not show loading indicator for non-entity fields", () => {
    const { container } = render(FieldValueChip, {
      props: { field: "access", value: "public" },
    });
    const loading = container.querySelector(".chip-loading");
    expect(loading).not.toBeInTheDocument();
  });

  it("does not show loading indicator when displayValue is set", () => {
    const { container } = render(FieldValueChip, {
      props: {
        field: "user",
        value: "102112",
        displayValue: "Mitchell Kotler",
      },
    });
    const loading = container.querySelector(".chip-loading");
    expect(loading).not.toBeInTheDocument();
  });

  it("shows + prefix indicator for required", () => {
    const { container } = render(FieldValueChip, {
      props: { field: "user", value: "102112", prefix: "+" },
    });
    const prefix = container.querySelector(".chip-prefix");
    expect(prefix).toBeInTheDocument();
    expect(prefix?.textContent).toBe("+");
    expect(prefix?.classList.contains("chip-prefix-required")).toBe(true);
  });

  it("shows - prefix indicator for excluded", () => {
    const { container } = render(FieldValueChip, {
      props: { field: "access", value: "private", prefix: "-" },
    });
    const prefix = container.querySelector(".chip-prefix");
    expect(prefix).toBeInTheDocument();
    expect(prefix?.textContent).toBe("-");
    expect(prefix?.classList.contains("chip-prefix-excluded")).toBe(true);
  });

  it("does not show prefix when not set", () => {
    const { container } = render(FieldValueChip, {
      props: { field: "access", value: "public" },
    });
    const prefix = container.querySelector(".chip-prefix");
    expect(prefix).not.toBeInTheDocument();
  });

  it("renders boost badge when boost is set", () => {
    const { container } = render(FieldValueChip, {
      props: { field: "user", value: "102112", boost: 4 },
    });
    const boost = container.querySelector(".chip-boost");
    expect(boost).toBeInTheDocument();
    expect(boost?.textContent).toContain("4");
  });

  it("does not render boost badge when boost is not set", () => {
    const { container } = render(FieldValueChip, {
      props: { field: "user", value: "102112" },
    });
    const boost = container.querySelector(".chip-boost");
    expect(boost).not.toBeInTheDocument();
  });

  it("has the search-field-value class", () => {
    const { container } = render(FieldValueChip, {
      props: { field: "access", value: "public" },
    });
    const chip = container.querySelector(".search-field-value");
    expect(chip).toBeInTheDocument();
  });
});
