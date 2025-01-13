import { test, expect, describe } from "vitest";

import { APP_URL } from "@/config/config.js";
import { slugify } from "$lib/utils/slugify";
import { me } from "@/test/fixtures/accounts";
import {
  userDocs,
  tag,
  kv,
  searchUrl,
  highlight,
  objectToSearchParams,
} from "../search";

describe("search utilities", () => {
  test("search URL", () => {
    const href = new URL(`/documents/`, APP_URL);
    href.searchParams.set("q", "Nick Clegg");
    expect(searchUrl("Nick Clegg")).toStrictEqual(href);
  });

  test("userDocs", () => {
    expect(userDocs(me)).toStrictEqual(`user:${me.id}`);

    expect(userDocs(me, "public")).toStrictEqual(`user:${me.id} access:public`);

    expect(userDocs(me, "private")).toStrictEqual(
      `user:${me.id} access:private`,
    );
  });

  test("tags", () => {
    expect(tag("research")).toStrictEqual(`+tag:"research"`);

    expect(tag("PBS NewsHour")).toStrictEqual(`+tag:"PBS NewsHour"`);
  });

  test("kv", () => {
    expect(kv("parties", "David Cameron")).toStrictEqual(
      `+data_parties:"David Cameron"`,
    );
  });

  test("search highlighting", () => {
    const text = `Call me Ishmael. Some years ago—never mind how long precisely—having little or no money in my purse, 
    and nothing particular to interest me on shore, I thought I would sail about a little and see the watery part of the world.`;
    const marked = `Call me Ishmael. Some years ago—never mind how long precisely—having little or no money in my purse, 
    and nothing particular to interest me on shore, I thought I would <mark>sail</mark> about a little and see the watery part of the world.`;

    const query = "sail";

    expect(highlight(text, query)).toStrictEqual(marked);
  });
});

test("objectToSearchParams", () => {
  expect(
    objectToSearchParams({
      query: "test",
      page: 1,
      perPage: 20,
      sort: "created_at",
    }).toString(),
  ).toBe("query=test&page=1&perPage=20&sort=created_at");

  expect(
    objectToSearchParams({
      q: "search term",
      filter: undefined,
      count: null,
      include: true,
    }).toString(),
  ).toBe("q=search+term&include=true");

  expect(
    objectToSearchParams({
      empty: "",
      spaces: "has spaces",
      special: "!@#$",
    }).toString(),
  ).toBe("empty=&spaces=has+spaces&special=%21%40%23%24");
});
