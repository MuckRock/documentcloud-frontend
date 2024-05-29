import { test, expect, describe } from "vitest";

import { APP_URL } from "@/config/config.js";
import { slugify } from "@/util/string";
import { me } from "@/test/fixtures/accounts";
import { userDocs, tag, kv, searchUrl } from "../search";

describe("search utilities", () => {
  test("search URL", () => {
    const href = new URL(`/app/`, APP_URL);
    href.searchParams.set("q", "Nick Clegg");
    expect(searchUrl("Nick Clegg")).toStrictEqual(href);
  });

  test("userDocs", () => {
    expect(userDocs(me, "public")).toStrictEqual(
      `+user:${slugify(me.name)}-${me.id} access:public`,
    );

    expect(userDocs(me, "private")).toStrictEqual(
      `+user:${slugify(me.name)}-${me.id} access:private`,
    );
  });

  test("tags", () => {
    expect(tag("research")).toStrictEqual(`+tag:"research"`);

    expect(tag("PBS NewsHour")).toStrictEqual(`+tag:"PBS NewsHour"`);
  });

  test("kv", () => {
    expect(kv("parties", "David Cameron")).toStrictEqual(
      `+data__parties:"David Cameron"`,
    );
  });
});
