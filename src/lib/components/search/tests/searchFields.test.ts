import { expect, test } from "vitest";
import { fieldValid as fv } from "../searchFields.js";

function fieldValid(text: string) {
  // use example mode for tests
  expect(fv(text, true).valid).toBeTruthy();
}

function fieldInvalid(text: string) {
  expect(fv(text, true).valid).toBeFalsy();
}

test("field valid user/proj/org", () => {
  fieldValid("user:bob-1");
  fieldInvalid("user:");
  fieldValid("project:example-proj-12345");
  fieldInvalid("project:");
  fieldValid("organization:example-org-98760");
  fieldInvalid("organization:");
});

test("field valid access", () => {
  fieldValid("access:public");
  fieldValid("access:private");
  fieldValid("access:organization");
  fieldInvalid("access:other");
  fieldInvalid("access:");
});

test("field valid status", () => {
  fieldValid("status:success");
  fieldValid("status:readable");
  fieldValid("status:pending");
  fieldValid("status:error");
  fieldValid("status:nofile");
  fieldInvalid("status:other");
  fieldInvalid("status:");
});

test("field valid sort", () => {
  fieldValid("sort:created_at");
  fieldValid("sort:-created_at");
  fieldValid("sort:title");
  fieldValid("sort:-title");
  fieldValid("sort:page_count");
  fieldValid("sort:-page_count");
  fieldValid("sort:source");
  fieldValid("sort:-source");
  fieldValid("sort:score");

  fieldInvalid("sort:other");
  fieldInvalid("sort:-score");
  fieldInvalid("sort:");
});

test("field valid tag/data", () => {
  fieldValid("tag:report");
  fieldValid("tag:test");
  fieldValid("tag:hello_there");
  fieldValid("data_type:report");
  fieldValid("data_tag_name:test");
  fieldValid("data__type_name_:_hello_there_");

  fieldInvalid("tag:");
  fieldInvalid("data:report");
  fieldInvalid("data_:report");
  fieldInvalid("data_type:");
});

test("field language", () => {
  fieldValid("language:eng");
  fieldValid("language:spa");

  fieldInvalid("language:ENG");
  fieldInvalid("language:english");
  fieldInvalid("language:");
});
