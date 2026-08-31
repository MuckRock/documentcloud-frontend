import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/svelte";
import { userEvent } from "@testing-library/user-event";
import { writable, get } from "svelte/store";

import Settings from "../Settings.svelte";

import type { EmbedConfig } from "$lib/utils/embed";
import { projectSettings, projectDefaults } from "$lib/utils/embedConfig";

describe("Settings", () => {
  it("renders a fieldset with a legend for each non-hidden field", () => {
    const values = writable({ ...projectDefaults });
    render(Settings, { settings: projectSettings, values });

    // one legend per non-hidden field, using translated labels
    expect(screen.getByText("Title behavior")).toBeInTheDocument();
    expect(screen.getByText("Description behavior")).toBeInTheDocument();
    expect(screen.getByText("Document sort order")).toBeInTheDocument();
    expect(screen.getByText("View mode")).toBeInTheDocument();
  });

  it("renders radio inputs for toggle options and marks the default", () => {
    const values = writable({ ...projectDefaults });
    render(Settings, { settings: projectSettings, values });

    const radios = screen.getAllByRole("radio");
    // title, description, and view each contribute two options
    expect(radios).toHaveLength(6);

    // the option matching the config default is flagged as "Default"
    const defaults = screen.getAllByText("Default");
    expect(defaults).toHaveLength(3);
  });

  it("reflects the bound store value as the checked radio", () => {
    const values = writable({ ...projectDefaults, view: 0 });
    render(Settings, { settings: projectSettings, values });

    const concise = screen.getByRole("radio", {
      name: /Concise/,
    }) as HTMLInputElement;
    const detailed = screen.getByRole("radio", {
      name: /Detailed/,
    }) as HTMLInputElement;
    expect(concise.checked).toBe(true);
    expect(detailed.checked).toBe(false);
  });

  it("writes the selected toggle value back to the store", async () => {
    const user = userEvent.setup();
    const values = writable({ ...projectDefaults });
    render(Settings, { settings: projectSettings, values });

    expect(get(values).view).toBe(1);
    await user.click(screen.getByRole("radio", { name: /Concise/ }));
    expect(get(values).view).toBe(0);
  });

  it("renders hidden fields as hidden inputs, not fieldsets", () => {
    const settings = {
      token: { defaultValue: 42, field: { type: "hidden" } },
    } satisfies EmbedConfig;
    const values = writable({ token: 42 });
    const { container } = render(Settings, { settings, values });

    const hidden = container.querySelector(
      'input[type="hidden"][name="token"]',
    ) as HTMLInputElement;
    expect(hidden).not.toBeNull();
    expect(hidden.value).toBe("42");
    // hidden fields don't get a fieldset/legend
    expect(container.querySelector("legend")).toBeNull();
  });
});
