import { describe, it, expect } from "vitest";
import { render } from "@testing-library/svelte";
import Breadcrumbs from "../Breadcrumbs.svelte";
import Logo from "../../common/Logo.svelte";

describe("Breadcrumbs", () => {
  it("renders the DocumentCloud logo at the root breadcrumb by default", () => {
    const result = render(Breadcrumbs);
    const links = result.getAllByRole("link");
    expect(links[0]).toHaveAttribute("href", "/");
    expect(links[0]!.getElementsByTagName("svg")[0]).toEqual(
      render(Logo).container.getElementsByTagName("svg")[0],
    );
  });
  it("renders more breadcrumbs provided in the trail", () => {
    const trail = [
      { href: "/documents/", title: "Documents" },
      { href: "/documents/[id]/", title: "Some Document" },
    ];
    const result = render(Breadcrumbs, { trail });
    const links = result.getAllByRole("link");
    links.forEach((link, index) => {
      if (index > 0) {
        expect(link).toHaveAttribute("href", trail[index - 1]!.href);
        expect(link).toHaveAttribute("title", trail[index - 1]!.title);
      }
    });
  });
});
