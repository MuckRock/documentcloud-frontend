import { slugify } from "@/util/string";
import { me } from "@/test/fixtures/accounts";
import { userDocs } from "../search";

test("userDocs", () => {
  expect(userDocs(me, "public")).toStrictEqual(
    `+user:${slugify(me.name)}-${me.id} access:public`,
  );

  expect(userDocs(me, "private")).toStrictEqual(
    `+user:${slugify(me.name)}-${me.id} access:private`,
  );
});
