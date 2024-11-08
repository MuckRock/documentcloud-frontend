import { test, expect, describe } from "vitest";

import { APP_URL } from "@/config/config.js";
import { slugify } from "$lib/utils/slugify";
import { me } from "@/test/fixtures/accounts";
import { userDocs, tag, kv, searchUrl, highlight } from "../search";

describe("search utilities", () => {
  test("search URL", () => {
    const href = new URL(`/documents/`, APP_URL);
    href.searchParams.set("q", "Nick Clegg");
    expect(searchUrl("Nick Clegg")).toStrictEqual(href);
  });

  test("userDocs", () => {
    expect(userDocs(me)).toStrictEqual(`+user:${slugify(me.name!)}-${me.id}`);

    expect(userDocs(me, "public")).toStrictEqual(
      `+user:${slugify(me.name!)}-${me.id} access:public`,
    );

    expect(userDocs(me, "private")).toStrictEqual(
      `+user:${slugify(me.name!)}-${me.id} access:private`,
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
