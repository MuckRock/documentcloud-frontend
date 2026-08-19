import type { Flatpage } from "../types";

import { afterEach, describe, expect, test, vi } from "vitest";

import { BASE_API_URL } from "@/config/config";
import * as flatpages from "../flatpages";

// one fixture, because this is all we use the flatpage API for now
const TipOfTheDay: Flatpage = {
  url: "/tipofday/",
  title: "Tip of the Day",
  content:
    'Join us for an <a href="https://us02web.zoom.us/meeting/register/tZAtdO2pqD8iEtELZ0fF94xlKJ7BWBAtfjtS?_x_zm_rtaid=5J2TjJT4Qp2gdmnHo8GdPQ.1722865950113.29308389149a0422f3adc9a5a9f0270b&_x_zm_rhtaid=589#/registration">upcoming DocumentCloud orientation</a> to explore exciting new features.',
};

describe("flatpages", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("flatpages.get", async () => {
    const mockFetch = vi.fn().mockImplementation(async (endpoint, options) => {
      return {
        ok: true,
        status: 200,
        async json() {
          return TipOfTheDay;
        },
      };
    });

    const { error, data } = await flatpages.get(TipOfTheDay.url, mockFetch);

    expect(error).toBeUndefined();
    expect(data).toEqual(TipOfTheDay);

    expect(mockFetch).toHaveBeenCalledWith(
      new URL("/api/flatpages" + TipOfTheDay.url, BASE_API_URL),
      {
        credentials: "include",
      },
    );
  });
});
