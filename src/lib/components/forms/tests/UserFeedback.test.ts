import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/svelte";

import UserFeedbackForm from "../UserFeedback.svelte";
import { me } from "@/test/fixtures/accounts";

describe("UserFeedback form", () => {
  it("pre-fills the email of a signed-in user", () => {
    render(UserFeedbackForm, { user: me });

    const email = screen.getByRole("textbox", {
      name: "Email",
    }) as HTMLInputElement;

    expect(email.value).toEqual(me.email);
    expect(email.required).toBe(true);
  });

  it("asks anonymous visitors for an email", () => {
    render(UserFeedbackForm, {});

    const email = screen.getByRole("textbox", {
      name: "Email",
    }) as HTMLInputElement;

    expect(email.value).toEqual("");
    expect(email.required).toBe(true);
  });

  it("submits the signed-in user's name alongside their email", () => {
    render(UserFeedbackForm, { user: me });

    const name = document.querySelector(
      'input[name="name"]',
    ) as HTMLInputElement;

    expect(name.value).toEqual(me.name);
  });
});
